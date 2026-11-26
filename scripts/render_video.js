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
  if (envName.includes("lava")) return "lava.wav";
  if (envName.includes("shock")) return "shock.wav";
  if (envName.includes("obby") || envName.includes("admin") || envName.includes("street")) return "win.wav";
  return "whoosh.wav";
}

function buildMasterAudio(durations, cenas, totalDurSec) {
  const sfxDir = path.resolve("assets/sfx");
  if (!fs.existsSync(path.join(sfxDir, "bgm_loop.wav"))) {
    execFileSync("python", ["scripts/generate_sfx.py"], { stdio: "inherit" });
  }

  // 1. Concatenar vozes
  const audioInputs = cenas.map((_, i) =>
    path.resolve(`output/audio/cena_${String(i).padStart(2, "0")}.mp3`)
  );
  const concatList = path.resolve("output/audio_list.txt");
  fs.writeFileSync(
    concatList,
    audioInputs.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf-8"
  );
  const fullVoice = path.resolve("output/full_voice.mp3");
  execFileSync(
    ffmpegPath,
    ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", fullVoice],
    { stdio: "pipe" }
  );

  // 2. Mixar Voz + Trilha BGM suave + SFX em cada troca de cena
  const masterAudio = path.resolve("output/master_audio.m4a");
  const args = ["-y", "-i", fullVoice, "-stream_loop", "-1", "-i", path.join(sfxDir, "bgm_loop.wav")];

  const filterParts = [
    `[0:a]volume=1.15[voice]`,
    `[1:a]volume=0.14,atrim=0:${totalDurSec.toFixed(2)}[bgm]`,
  ];
  const mixLabels = ["[voice]", "[bgm]"];

  let accSec = 0;
  for (let i = 0; i < cenas.length; i++) {
    const sfxFile = path.join(sfxDir, pickSceneSfx(cenas[i].ambiente || "", i));
    const inputIdx = 2 + i;
    args.push("-i", sfxFile);
    const delayMs = Math.max(0, Math.round(accSec * 1000));
    filterParts.push(`[${inputIdx}:a]volume=0.48,adelay=${delayMs}|${delayMs}[sfx${i}]`);
    mixLabels.push(`[sfx${i}]`);

    // Se for transição de cena (i > 0), coloca também um whoosh rápido!
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
  const data = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  const isLong = (data.formato || "short").toLowerCase() === "long";
  const WIDTH = isLong ? 1920 : 1080;
  const HEIGHT = isLong ? 1080 : 1920;
  const watermark = data.marca_dagua !== undefined ? data.marca_dagua : "PoxaRique!";

  fs.mkdirSync(path.resolve("output"), { recursive: true });

  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  const audioInputs = data.cenas.map((_, i) =>
    path.resolve(`output/audio/cena_${String(i).padStart(2, "0")}.mp3`)
  );
  const durations = audioInputs.map(getAudioDurationSec);
  const totalDurSec = durations.reduce((a, b) => a + b, 0);

  console.log(`Mixando áudio master (Voz + SFX + Trilha) — duração total: ${totalDurSec.toFixed(1)}s...`);
  const masterAudio = buildMasterAudio(durations, data.cenas, totalDurSec);

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

            // Cortes rápidos (<1s em Shorts, ~1.8s em Longos)
            const cutInterval = ${isLong ? 1.8 : 0.85};
            const beat = Math.floor(cfg.t / cutInterval);
            const zoom = (cfg.sceneIdx > 0 && beat % 2 === 1) ? 1.06 : 1.0;
            if (zoom !== 1.0) {
              ctx.translate(${WIDTH}/2, ${HEIGHT}*0.52);
              ctx.scale(zoom, zoom);
              ctx.translate(-${WIDTH}/2, -${HEIGHT}*0.52);
            }

            window.VB.renderEnvironment(ctx, ${WIDTH}, ${HEIGHT}, cfg.env, cfg.t, cfg.dur, cfg.cena);
            window.VB.renderSubtitles(ctx, ${WIDTH}, ${HEIGHT}, cfg.text, cfg.highlights, cfg.progress);

            ctx.restore();

            // Marca d'água sempre fixa e nítida por cima do zoom
            window.VB.drawWatermark(ctx, ${WIDTH}, ${HEIGHT}, cfg.watermark, ${isLong});

            // Flash branco curtíssimo de impacto na transição
            if (cfg.sceneIdx > 0 && cfg.frameInScene < 2) {
              ctx.fillStyle = "rgba(255,255,255," + (0.42 - cfg.frameInScene * 0.2) + ")";
              ctx.fillRect(0, 0, ${WIDTH}, ${HEIGHT});
            }

            return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
          };
        </script>
      </body>
    </html>
  `,
    { waitUntil: "networkidle" }
  );

  await page.evaluate(() => document.fonts.ready);

  const baseSlug = path.basename(scriptPath, ".json");
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
    const totalFrames = Math.max(1, Math.round(dur * FPS));
    console.log(
      `[${isLong ? "16:9 LONGO" : "9:16 SHORT"}] Cena ${s + 1}/${data.cenas.length} (${cena.ambiente} - ${dur.toFixed(1)}s)...`
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
          watermark,
          t,
          dur,
          progress,
        }
      );

      const buf = Buffer.from(b64, "base64");

      if ((s === 0 || s === 2 || s === data.cenas.length - 2) && f === Math.min(12, totalFrames - 1)) {
        fs.writeFileSync(path.resolve(`output/preview_${baseSlug}_${s}.jpg`), buf);
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
