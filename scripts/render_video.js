const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const { chromium } = require("playwright");

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

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

async function main() {
  const scriptPath = process.argv[2] || "scripts/sample_short.json";
  const data = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  fs.mkdirSync(path.resolve("output"), { recursive: true });

  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  // 1. Concatenar áudios primeiro
  const audioInputs = data.cenas.map((_, i) =>
    path.resolve(`output/audio/cena_${String(i).padStart(2, "0")}.mp3`)
  );
  const durations = audioInputs.map(getAudioDurationSec);

  const concatList = path.resolve("output/audio_list.txt");
  fs.writeFileSync(
    concatList,
    audioInputs.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf-8"
  );
  const fullAudio = path.resolve("output/full_audio.mp3");
  execFileSync(
    ffmpegPath,
    ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", fullAudio],
    { stdio: "pipe" }
  );

  // 2. Abrir navegador headless com fonte Fredoka + Canvas 2D
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  await page.setContent(`
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

            // Cortes rápidos (<1s): punch-in zoom sutil a cada 0.85s
            const beat = Math.floor(cfg.t / 0.85);
            const zoom = (cfg.sceneIdx > 0 && beat % 2 === 1) ? 1.07 : 1.0;
            if (zoom !== 1.0) {
              ctx.translate(${WIDTH}/2, ${HEIGHT}*0.52);
              ctx.scale(zoom, zoom);
              ctx.translate(-${WIDTH}/2, -${HEIGHT}*0.52);
            }

            window.VB.renderEnvironment(ctx, ${WIDTH}, ${HEIGHT}, cfg.env, cfg.t, cfg.dur);
            window.VB.renderSubtitles(ctx, ${WIDTH}, ${HEIGHT}, cfg.text, cfg.highlights, cfg.progress);

            // Flash branco curtíssimo de impacto na transição de cena (primeiros 2 frames)
            if (cfg.sceneIdx > 0 && cfg.frameInScene < 2) {
              ctx.fillStyle = "rgba(255,255,255," + (0.45 - cfg.frameInScene * 0.2) + ")";
              ctx.fillRect(-100, -100, ${WIDTH}+200, ${HEIGHT}+200);
            }

            ctx.restore();
            return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
          };
        </script>
      </body>
    </html>
  `, { waitUntil: "networkidle" });

  await page.evaluate(() => document.fonts.ready);

  // 3. Iniciar FFmpeg via pipe direto em memória (muito mais rápido e sem sujar o disco!)
  const outVideo = path.resolve("output/short_vida_de_bloco.mp4");
  const ff = spawn(
    ffmpegPath,
    [
      "-y",
      "-f", "image2pipe",
      "-vcodec", "mjpeg",
      "-framerate", String(FPS),
      "-i", "-",
      "-i", fullAudio,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      outVideo,
    ],
    { stdio: ["pipe", "ignore", "pipe"] }
  );

  let ffErr = "";
  ff.stderr.on("data", (chunk) => {
    ffErr += chunk.toString();
  });

  const previewScenes = new Set([0, 1, 3, 5]);

  for (let s = 0; s < data.cenas.length; s++) {
    const cena = data.cenas[s];
    const dur = durations[s];
    const totalFrames = Math.max(1, Math.round(dur * FPS));
    console.log(`Renderizando cena ${s + 1}/${data.cenas.length} (${cena.ambiente} - ${dur.toFixed(1)}s)...`);

    for (let f = 0; f < totalFrames; f++) {
      const t = f / FPS;
      const progress = f / totalFrames;
      const b64 = await page.evaluate(
        (cfg) => window.renderFrameBase64(cfg),
        {
          sceneIdx: s,
          frameInScene: f,
          env: cena.ambiente,
          text: cena.texto,
          highlights: cena.destaque || {},
          t,
          dur,
          progress,
        }
      );

      const buf = Buffer.from(b64, "base64");

      if (previewScenes.has(s) && f === Math.min(12, totalFrames - 1)) {
        fs.writeFileSync(path.resolve(`output/preview_scene_${s}.jpg`), buf);
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

  console.log(`Vídeo gerado com sucesso: ${outVideo}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
