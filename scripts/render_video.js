const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const { chromium } = require("playwright");
const { validateScript } = require("./validate_script");

function getAudioDurationSec(audioFile) {
  try {
    execFileSync(ffmpegPath, ["-i", audioFile], { stdio: "pipe" });
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : "";
    const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    }
  }
  return 3.0;
}

function pickSceneSfx(envName, idx) {
  if (idx === 0) return "pop.wav";
  if (envName.includes("lava") || envName.includes("parkour") || envName.includes("matematica")) return "lava_burn.wav";
  if (envName.includes("pix") || envName.includes("padaria")) return "pix_ding.wav";
  if (envName.includes("shock") || envName.includes("prato") || envName.includes("sorvete") || envName.includes("madrugada")) {
    return "vine_boom_lite.wav";
  }
  if (
    envName.includes("obby") ||
    envName.includes("patio") ||
    envName.includes("admin") ||
    envName.includes("street") ||
    envName.includes("correndo") ||
    envName.includes("abraco") ||
    envName.includes("cta")
  ) {
    return "powerup.wav";
  }
  return "whoosh.wav";
}

function resolveSceneSfxEvents(cena, idx, sceneStartSec, sceneDur) {
  const events = [];
  if (cena.sfx) {
    const rawList = Array.isArray(cena.sfx) ? cena.sfx : [cena.sfx];
    rawList.forEach((entry, k) => {
      if (typeof entry === "string") {
        const clean = entry.endsWith(".wav") ? entry : `${entry}.wav`;
        const relSec = k === 0 ? 0.0 : Math.min(sceneDur * 0.78, k * 0.55);
        events.push({ file: clean, delayMs: Math.max(0, Math.round((sceneStartSec + relSec) * 1000)), volume: 0.48 });
      } else if (entry && typeof entry === "object" && entry.name) {
        const clean = entry.name.endsWith(".wav") ? entry.name : `${entry.name}.wav`;
        const relSec = entry.at !== undefined ? Number(entry.at) : k * 0.5;
        events.push({
          file: clean,
          delayMs: Math.max(0, Math.round((sceneStartSec + Math.max(0, relSec)) * 1000)),
          volume: entry.volume !== undefined ? Number(entry.volume) : 0.5,
        });
      }
    });
  } else {
    events.push({
      file: pickSceneSfx(cena.ambiente || "", idx),
      delayMs: Math.max(0, Math.round(sceneStartSec * 1000)),
      volume: 0.45,
    });
  }
  return events;
}

function ensureSyncedTts(scriptPath, baseSlug, cenas) {
  const audioDir = path.resolve("output/audio", baseSlug);
  const manifestPath = path.join(audioDir, "manifest.json");

  let needsRegen = !fs.existsSync(manifestPath);
  if (!needsRegen) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      if (!manifest.cenas || manifest.cenas.length !== cenas.length) {
        needsRegen = true;
      } else {
        for (let i = 0; i < cenas.length; i++) {
          const mc = manifest.cenas[i];
          const audioFile = path.join(audioDir, `cena_${String(i).padStart(2, "0")}.mp3`);
          if (
            !fs.existsSync(audioFile) ||
            mc.texto !== cenas[i].texto ||
            mc.voz !== (cenas[i].voz || "narrador") ||
            (cenas[i].emocao && mc.emocao !== cenas[i].emocao) ||
            mc.texto_tts === undefined
          ) {
            needsRegen = true;
            break;
          }
        }
      }
    } catch (_) {
      needsRegen = true;
    }
  }

  if (needsRegen) {
    console.log(`[Sync-Guard] Gerando narração sanitizada e timestamps para '${baseSlug}'...`);
    execFileSync("python", ["scripts/generate_tts.py", scriptPath], { stdio: "inherit" });
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function buildMasterAudio(baseSlug, audioInputs, durations, cenas, totalDurSec) {
  const sfxDir = path.resolve("assets/sfx");
  if (!fs.existsSync(path.join(sfxDir, "bgm_loop.wav")) || !fs.existsSync(path.join(sfxDir, "pix_ding.wav"))) {
    execFileSync("python", ["scripts/generate_sfx.py"], { stdio: "inherit" });
  }

  const concatList = path.resolve(`output/audio_list_${baseSlug}.txt`);
  fs.writeFileSync(
    concatList,
    audioInputs.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf-8"
  );
  const fullVoice = path.resolve(`output/full_voice_${baseSlug}.mp3`);
  execFileSync(
    ffmpegPath,
    ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", fullVoice],
    { stdio: "pipe" }
  );

  const masterAudio = path.resolve(`output/master_audio_${baseSlug}.m4a`);
  const args = ["-y", "-i", fullVoice, "-stream_loop", "-1", "-i", path.join(sfxDir, "bgm_loop.wav")];

  // Voz cristalina + Audio Ducking automático na trilha quando há fala ativa!
  const filterParts = [
    `[0:a]volume=1.22,asplit=2[voice][voice_sc]`,
    `[1:a]volume=0.20,atrim=0:${totalDurSec.toFixed(2)},asetpts=PTS-STARTPTS[bgm_raw]`,
    `[bgm_raw][voice_sc]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=260[bgm]`,
  ];
  const mixLabels = ["[voice]", "[bgm]"];

  let accSec = 0;
  let sfxCounter = 0;
  for (let i = 0; i < cenas.length; i++) {
    const sfxEvents = resolveSceneSfxEvents(cenas[i], i, accSec, durations[i]);
    for (const ev of sfxEvents) {
      const sfxFile = path.join(sfxDir, ev.file);
      if (!fs.existsSync(sfxFile)) continue;
      const inputIdx = 2 + sfxCounter;
      args.push("-i", sfxFile);
      const label = `sfx${sfxCounter}`;
      filterParts.push(`[${inputIdx}:a]volume=${ev.volume.toFixed(2)},adelay=${ev.delayMs}|${ev.delayMs}[${label}]`);
      mixLabels.push(`[${label}]`);
      sfxCounter++;
    }
    accSec += durations[i];
  }

  filterParts.push(
    `${mixLabels.join("")}amix=inputs=${mixLabels.length}:duration=first:dropout_transition=0:normalize=0[outa]`
  );

  args.push(
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[outa]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    masterAudio
  );

  execFileSync(ffmpegPath, args, { stdio: "pipe" });
  return masterAudio;
}

async function main() {
  const tStart = Date.now();
  const cliArgs = process.argv.slice(2);
  const isPreview = cliArgs.includes("--preview") || cliArgs.includes("--draft");
  const positional = cliArgs.filter((a) => !a.startsWith("--"));
  const scriptPath = positional[0] || "scripts/sample_short.json";
  const baseSlug = path.basename(scriptPath, ".json");

  const validation = validateScript(scriptPath);
  if (!validation.valid) {
    throw new Error(`Validação falhou para '${scriptPath}'. Corrija os erros acima antes de renderizar.`);
  }

  const data = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  const isLong = (data.formato || "short").toLowerCase() === "long";

  // Espaço lógico canônico (1080x1920 ou 1920x1080) e resolução real de saída
  const LOGICAL_W = isLong ? 1920 : 1080;
  const LOGICAL_H = isLong ? 1080 : 1920;
  const SCALE_OUT = isPreview ? 0.5 : 1.0;
  const OUT_W = Math.round(LOGICAL_W * SCALE_OUT);
  const OUT_H = Math.round(LOGICAL_H * SCALE_OUT);
  const FPS = isPreview ? 15 : 30;
  const watermark = data.marca_dagua !== undefined ? data.marca_dagua : "PoxaRique!";

  fs.mkdirSync(path.resolve("output"), { recursive: true });
  fs.mkdirSync(path.resolve("output/revisao"), { recursive: true });

  const manifest = ensureSyncedTts(scriptPath, baseSlug, data.cenas);
  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  const audioInputs = data.cenas.map((_, i) =>
    path.resolve("output/audio", baseSlug, `cena_${String(i).padStart(2, "0")}.mp3`)
  );
  const durations = audioInputs.map(getAudioDurationSec);
  const totalDurSec = durations.reduce((a, b) => a + b, 0);

  console.log(
    `[${baseSlug}${isPreview ? " | PREVIEW RÁPIDO" : ""}] Mixando áudio master (Voz + Ducking BGM + SFX) — ${totalDurSec.toFixed(1)}s...`
  );
  const masterAudio = buildMasterAudio(baseSlug, audioInputs, durations, data.cenas, totalDurSec);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: OUT_W, height: OUT_H } });

  await page.setContent(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; overflow: hidden; background: #000; }
          canvas { display: block; }
        </style>
      </head>
      <body>
        <canvas id="stage" width="${OUT_W}" height="${OUT_H}"></canvas>
        <script>${rigCode}</script>
        <script>${envCode}</script>
        <script>
          const W = ${LOGICAL_W};
          const H = ${LOGICAL_H};
          const OUT_SCALE = ${SCALE_OUT};
          const stage = document.getElementById("stage");
          const sctx = stage.getContext("2d");

          // Buffer lógico de mundo para câmera seguir personagens em tempo real sem bordas pretas
          const worldCanvas = document.createElement("canvas");
          worldCanvas.width = W;
          worldCanvas.height = H;
          const wctx = worldCanvas.getContext("2d");

          let camFocusX = W / 2;
          let camFocusY = H * 0.52;
          let lastSceneRendered = -1;

          function computeCamera(cfg) {
            const cam = Object.assign({}, typeof cfg.cena.camera === "string" ? { zoom: cfg.cena.camera } : (cfg.cena.camera || {}));
            const zoomType = String(cam.zoom || cam.mode || (cfg.sceneIdx === 0 ? "zoomIn" : "auto")).toLowerCase();

            let z = 1.0 + 0.045 * cfg.progress;
            if (zoomType === "zoomin") {
              z = 1.0 + 0.11 * cfg.progress;
            } else if (zoomType === "zoomout") {
              z = 1.12 - 0.12 * cfg.progress;
            } else if (zoomType === "punchzoom") {
              const at = cam.punchAt !== undefined ? Number(cam.punchAt) : 0.18;
              const dt = cfg.t - at;
              if (dt >= 0) {
                const kick = Math.min(1, dt / 0.14);
                const settle = Math.max(0, 1 - Math.max(0, dt - 0.14) * 0.55);
                z = 1.0 + (0.06 + 0.11 * settle) * kick;
              } else {
                z = 1.0;
              }
            } else if (zoomType === "static") {
              z = 1.0;
            } else {
              const cutInterval = ${isLong ? 1.8 : 0.95};
              const beat = Math.floor(cfg.t / cutInterval);
              const beatZoom = (cfg.sceneIdx > 0 && beat % 2 === 1) ? 1.032 : 1.0;
              z = (1.0 + 0.04 * cfg.progress) * beatZoom;
            }
            if (cfg.isThumb) z = 1.02;

            // FollowTarget suave sobre o personagem em movimento
            if (cfg.sceneIdx !== lastSceneRendered) {
              camFocusX = W / 2;
              camFocusY = H * 0.52;
              lastSceneRendered = cfg.sceneIdx;
            }
            const targetKey = cam.followTarget ? String(cam.followTarget).toLowerCase() : "";
            if (targetKey && window.VB.lastTargets[targetKey] && !cfg.isThumb) {
              const tgt = window.VB.lastTargets[targetKey];
              if (z < 1.08) z = 1.08;
              const desiredX = W / 2 + (tgt.x - W / 2) * 0.55;
              const desiredY = H * 0.52 + (tgt.y - H * 0.58) * 0.35;
              camFocusX += (desiredX - camFocusX) * 0.28;
              camFocusY += (desiredY - camFocusY) * 0.28;
            } else {
              camFocusX += (W / 2 - camFocusX) * 0.25;
              camFocusY += (H * 0.52 - camFocusY) * 0.25;
            }

            // Shake calibrado (leve, medio, intenso)
            let shakeX = 0;
            let shakeY = 0;
            const shakeLevel = String(cam.shake || "none").toLowerCase();
            if (shakeLevel !== "none" && !cfg.isThumb) {
              const ampBase =
                shakeLevel === "intenso" || shakeLevel === "heavy"
                  ? 16
                  : shakeLevel === "medio" || shakeLevel === "medium"
                  ? 8.5
                  : 3.8;
              const shStart = cam.shakeAt !== undefined ? Number(cam.shakeAt) : 0;
              const shDur = cam.shakeDur !== undefined ? Number(cam.shakeDur) : 0.65;
              if (cfg.t >= shStart && cfg.t <= shStart + shDur) {
                const decay = 1 - (cfg.t - shStart) / shDur;
                shakeX = Math.sin(cfg.t * 62) * ampBase * decay;
                shakeY = Math.cos(cfg.t * 74) * ampBase * 0.75 * decay;
                if (z < 1.05) z = 1.05;
              }
            }

            // Clamping seguro para nunca vazar borda preta nas laterais!
            const maxPanX = ((z - 1) * W) / (2 * z);
            const maxPanY = ((z - 1) * H) / (2 * z);
            const clampedX = Math.max(W / 2 - maxPanX, Math.min(W / 2 + maxPanX, camFocusX + shakeX));
            const clampedY = Math.max(H / 2 - maxPanY, Math.min(H / 2 + maxPanY, camFocusY + shakeY));

            return {
              zoom: z,
              cx: clampedX,
              cy: clampedY,
              transition: String(cam.transition || "whip").toLowerCase(),
            };
          }

          window.renderFrameBase64 = (cfg) => {
            window.VB._isThumb = Boolean(cfg.isThumb);
            window.VB.lastTargets = {};
            window.VB.setTalkContext(cfg.wordsTiming, cfg.speaker, cfg.t, cfg.dur);

            // 1. Renderiza mundo e personagens no buffer lógico
            wctx.save();
            wctx.clearRect(0, 0, W, H);
            window.VB.renderEnvironment(wctx, W, H, cfg.env, cfg.t, cfg.dur, cfg.cena);
            wctx.restore();

            // 2. Aplica câmera virtual + transições para o palco final
            const cam = computeCamera(cfg);
            const transFrames = Math.max(2, Math.round(0.11 * ${FPS}));

            sctx.save();
            sctx.scale(OUT_SCALE, OUT_SCALE);
            sctx.fillStyle = "#0E0B16";
            sctx.fillRect(0, 0, W, H);

            let slideOffsetX = 0;
            if (!cfg.isThumb && cfg.sceneIdx > 0 && cfg.frameInScene < transFrames) {
              const tp = 1 - cfg.frameInScene / transFrames;
              if (cam.transition === "whip" || cam.transition === "slide") {
                slideOffsetX = Math.pow(tp, 2.1) * (cam.transition === "slide" ? W * 0.45 : 260);
              }
            }

            sctx.save();
            sctx.translate(W / 2 + slideOffsetX, H / 2);
            sctx.scale(cam.zoom, cam.zoom);
            sctx.translate(-cam.cx, -cam.cy);
            sctx.drawImage(worldCanvas, 0, 0);
            sctx.restore();

            // 3. Overlays de HUD fixos, legendas de retenção e marca d'água na zona segura
            if (window.VB.renderScreenOverlays) {
              window.VB.renderScreenOverlays(sctx, W, H, cfg.cena, cfg.t, cfg.progress);
            }

            if (!cfg.hideSubtitles) {
              window.VB.renderSubtitles(
                sctx,
                W,
                H,
                cfg.text,
                cfg.highlights,
                cfg.progress,
                cfg.t,
                cfg.wordsTiming
              );
            }

            window.VB.drawWatermark(sctx, W, H, cfg.watermark, ${isLong});

            // 4. Efeito visual rápido de transição entre cenas
            if (!cfg.isThumb && cfg.sceneIdx > 0 && cfg.frameInScene < transFrames) {
              const tp = 1 - cfg.frameInScene / transFrames;
              if (cam.transition === "flash") {
                sctx.save();
                sctx.globalAlpha = tp * 0.65;
                sctx.fillStyle = "#FFFBEB";
                sctx.fillRect(0, 0, W, H);
                sctx.restore();
              } else if (cam.transition === "whip") {
                sctx.save();
                sctx.globalAlpha = tp * 0.38;
                sctx.fillStyle = "#FFFFFF";
                for (let k = 0; k < 5; k++) {
                  sctx.fillRect(0, 260 + k * 290, W, 14);
                }
                sctx.restore();
              }
            }

            sctx.restore();

            const fmt = cfg.png ? "image/png" : "image/jpeg";
            const qual = cfg.png ? undefined : ${isPreview ? 0.78 : 0.92};
            return stage.toDataURL(fmt, qual).split(",")[1];
          };
        </script>
      </body>
    </html>
  `,
    { waitUntil: "networkidle" }
  );

  await page.evaluate(() => document.fonts.ready);

  // Thumbnail Limpa Dedicada (sem legenda cortada)
  const thumbB64 = await page.evaluate(
    (cfg) => window.renderFrameBase64(cfg),
    {
      sceneIdx: 0,
      frameInScene: 12,
      env: data.cenas[0].ambiente,
      cena: data.cenas[0],
      speaker: data.cenas[0].voz || "narrador",
      text: "",
      highlights: {},
      wordsTiming: [],
      watermark,
      t: 0.8,
      dur: durations[0] || 3.5,
      progress: 0.25,
      hideSubtitles: true,
      isThumb: true,
      png: true,
    }
  );
  fs.writeFileSync(path.resolve(`output/${baseSlug}_thumb.png`), Buffer.from(thumbB64, "base64"));

  const rawOutName = data.arquivo_saida || `${baseSlug}_poxarique.mp4`;
  const outName = isPreview ? rawOutName.replace(/\.mp4$/i, "_preview.mp4") : rawOutName;
  const outVideo = path.resolve("output", outName);

  const ff = spawn(
    ffmpegPath,
    [
      "-y",
      "-f",
      "image2pipe",
      "-vcodec",
      "mjpeg",
      "-framerate",
      String(FPS),
      "-i",
      "-",
      "-i",
      masterAudio,
      "-c:v",
      "libx264",
      "-preset",
      isPreview ? "ultrafast" : "veryfast",
      "-crf",
      isPreview ? "26" : "20",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "copy",
      "-shortest",
      outVideo,
    ],
    { stdio: ["pipe", "ignore", "pipe"] }
  );

  let ffErr = "";
  ff.stderr.on("data", (chunk) => {
    ffErr += chunk.toString();
  });

  for (let s = 0; s < data.cenas.length; s++) {
    const cena = data.cenas[s];
    const dur = durations[s];
    const wordsTiming = (manifest.cenas[s] && manifest.cenas[s].words) || [];
    const totalFrames = Math.max(1, Math.round(dur * FPS));
    const midFrame = Math.min(totalFrames - 1, Math.max(3, Math.floor(totalFrames * 0.45)));

    console.log(
      `[${baseSlug} | ${OUT_W}x${OUT_H} @ ${FPS}fps] Cena ${s + 1}/${data.cenas.length} (${cena.ambiente || "custom"} - ${dur.toFixed(1)}s)...`
    );

    for (let f = 0; f < totalFrames; f++) {
      const t = f / FPS;
      const progress = f / totalFrames;
      const b64 = await page.evaluate(
        (cfg) => window.renderFrameBase64(cfg),
        {
          sceneIdx: s,
          frameInScene: f,
          env: cena.ambiente || "custom",
          cena,
          speaker: cena.voz || "narrador",
          text: cena.texto,
          highlights: cena.destaque || {},
          wordsTiming,
          watermark,
          t,
          dur,
          progress,
          hideSubtitles: false,
          isThumb: false,
          png: false,
        }
      );

      const buf = Buffer.from(b64, "base64");

      if (f === midFrame) {
        fs.writeFileSync(path.resolve(`output/revisao/${baseSlug}_cena_${s}.jpg`), buf);
      }

      if (!ff.stdin.write(buf)) {
        await new Promise((res) => ff.stdin.once("drain", res));
      }
    }
  }

  ff.stdin.end();
  const exitCode = await new Promise((res) => ff.on("close", res));
  await browser.close();

  if (exitCode !== 0) {
    console.error(ffErr);
    throw new Error(`FFmpeg saiu com código ${exitCode}`);
  }

  const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
  console.log(`Vídeo finalizado em ${elapsed}s: ${outVideo}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
