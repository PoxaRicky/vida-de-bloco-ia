const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const { chromium } = require("playwright");

const FPS = 30;

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
  if (envName.includes("lava") || envName.includes("matematica")) return "lava.wav";
  if (envName.includes("shock") || envName.includes("prato") || envName.includes("sorvete") || envName.includes("madrugada")) {
    return "shock.wav";
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
    return "win.wav";
  }
  return "whoosh.wav";
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
            mc.voz !== (cenas[i].voz || "narrador")
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
    console.log(`[Sync-Guard] Gerando narração e timestamps exclusivos para '${baseSlug}'...`);
    execFileSync("python", ["scripts/generate_tts.py", scriptPath], { stdio: "inherit" });
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function buildMasterAudio(baseSlug, audioInputs, durations, cenas, totalDurSec) {
  const sfxDir = path.resolve("assets/sfx");
  if (!fs.existsSync(path.join(sfxDir, "bgm_loop.wav"))) {
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

  const filterParts = [
    `[0:a]volume=1.18[voice]`,
    `[1:a]volume=0.13,atrim=0:${totalDurSec.toFixed(2)}[bgm]`,
  ];
  const mixLabels = ["[voice]", "[bgm]"];

  let accSec = 0;
  for (let i = 0; i < cenas.length; i++) {
    const sfxFile = path.join(sfxDir, pickSceneSfx(cenas[i].ambiente || "", i));
    const inputIdx = 2 + i;
    args.push("-i", sfxFile);
    const delayMs = Math.max(0, Math.round(accSec * 1000));
    filterParts.push(`[${inputIdx}:a]volume=0.45,adelay=${delayMs}|${delayMs}[sfx${i}]`);
    mixLabels.push(`[sfx${i}]`);
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
  const scriptPath = process.argv[2] || "scripts/sample_short.json";
  const baseSlug = path.basename(scriptPath, ".json");
  const data = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  const isLong = (data.formato || "short").toLowerCase() === "long";
  const WIDTH = isLong ? 1920 : 1080;
  const HEIGHT = isLong ? 1080 : 1920;
  const watermark = data.marca_dagua !== undefined ? data.marca_dagua : "PoxaRique!";

  fs.mkdirSync(path.resolve("output"), { recursive: true });
  fs.mkdirSync(path.resolve("output/revisao"), { recursive: true });

  // Trava obrigatória de sincronia: áudio e palavras SEMPRE isolados por roteiro!
  const manifest = ensureSyncedTts(scriptPath, baseSlug, data.cenas);

  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  const audioInputs = data.cenas.map((_, i) =>
    path.resolve("output/audio", baseSlug, `cena_${String(i).padStart(2, "0")}.mp3`)
  );
  const durations = audioInputs.map(getAudioDurationSec);
  const totalDurSec = durations.reduce((a, b) => a + b, 0);

  console.log(`[${baseSlug}] Mixando áudio master (Voz + SFX + Trilha) — duração total: ${totalDurSec.toFixed(1)}s...`);
  const masterAudio = buildMasterAudio(baseSlug, audioInputs, durations, data.cenas, totalDurSec);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

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
        <canvas id="stage" width="${WIDTH}" height="${HEIGHT}"></canvas>
        <script>${rigCode}</script>
        <script>${envCode}</script>
        <script>
          const canvas = document.getElementById("stage");
          const ctx = canvas.getContext("2d");

          window.renderFrameBase64 = (cfg) => {
            ctx.save();
            ctx.clearRect(0, 0, ${WIDTH}, ${HEIGHT});

            // Push-in contínuo + whip-pan horizontal curto nos 4 primeiros frames da cena
            const pushIn = 1.0 + 0.04 * cfg.progress;
            const cutInterval = ${isLong ? 1.8 : 0.95};
            const beat = Math.floor(cfg.t / cutInterval);
            const beatZoom = (cfg.sceneIdx > 0 && beat % 2 === 1) ? 1.035 : 1.0;
            const totalZoom = pushIn * beatZoom;

            let whipX = 0;
            if (cfg.sceneIdx > 0 && cfg.frameInScene < 4 && !cfg.isThumb) {
              const p = 1 - cfg.frameInScene / 4;
              whipX = Math.pow(p, 2.2) * 320;
            }

            ctx.translate(${WIDTH}/2 + whipX, ${HEIGHT}*0.52);
            ctx.scale(totalZoom, totalZoom);
            ctx.translate(-${WIDTH}/2, -${HEIGHT}*0.52);

            window.VB.renderEnvironment(ctx, ${WIDTH}, ${HEIGHT}, cfg.env, cfg.t, cfg.dur, cfg.cena);

            if (!cfg.hideSubtitles) {
              window.VB.renderSubtitles(
                ctx,
                ${WIDTH},
                ${HEIGHT},
                cfg.text,
                cfg.highlights,
                cfg.progress,
                cfg.t,
                cfg.wordsTiming
              );
            }

            ctx.restore();

            window.VB.drawWatermark(ctx, ${WIDTH}, ${HEIGHT}, cfg.watermark, ${isLong});

            // Linhas de whip horizontal na troca de cena
            if (cfg.sceneIdx > 0 && cfg.frameInScene < 3 && !cfg.isThumb) {
              ctx.save();
              ctx.globalAlpha = 0.45 - cfg.frameInScene * 0.14;
              ctx.fillStyle = "#FFFFFF";
              for (let k = 0; k < 6; k++) {
                ctx.fillRect(0, 220 + k * 270, ${WIDTH}, 18);
              }
              ctx.restore();
            }

            const fmt = cfg.png ? "image/png" : "image/jpeg";
            return canvas.toDataURL(fmt, 0.92).split(",")[1];
          };
        </script>
      </body>
    </html>
  `,
    { waitUntil: "networkidle" }
  );

  await page.evaluate(() => document.fonts.ready);

  // Gera Thumbnail Limpa Dedicada (sem legenda cortada no meio!) a partir da cena de gancho
  const thumbB64 = await page.evaluate(
    (cfg) => window.renderFrameBase64(cfg),
    {
      sceneIdx: 0,
      frameInScene: 24,
      env: data.cenas[0].ambiente,
      cena: data.cenas[0],
      text: "",
      highlights: {},
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

  const outName = data.arquivo_saida || `${baseSlug}_poxarique.mp4`;
  const outVideo = path.resolve("output", outName);

  const ff = spawn(
    ffmpegPath,
    [
      "-y",
      "-f", "image2pipe",
      "-vcodec", "mjpeg",
      "-framerate", String(FPS),
      "-i", "-",
      "-i", masterAudio,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      "-c:a", "copy",
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
    const midFrame = Math.min(totalFrames - 1, Math.max(8, Math.floor(totalFrames * 0.45)));

    console.log(
      `[${baseSlug} | ${isLong ? "16:9 LONGO" : "9:16 SHORT"}] Cena ${s + 1}/${data.cenas.length} (${cena.ambiente} - ${dur.toFixed(1)}s)...`
    );

    for (let f = 0; f < totalFrames; f++) {
      const t = f / FPS;
      const progress = f / totalFrames;
      const b64 = await page.evaluate(
        (cfg) => window.renderFrameBase64(cfg),
        {
          sceneIdx: s,
          frameInScene: f,
          env: cena.ambiente,
          cena,
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

      // Salva 1 frame representativo de CADA cena para auditoria visual do revisao-01!
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

  console.log(`Vídeo finalizado com sucesso: ${outVideo}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
