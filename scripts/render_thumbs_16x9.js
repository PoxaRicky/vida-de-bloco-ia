const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.setContent(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap" rel="stylesheet">
    <style>body{margin:0;overflow:hidden}</style></head><body>
    <canvas id="c" width="1280" height="720"></canvas>
    <script>${rigCode}</script><script>${envCode}</script>
    <script>
      function stroked(ctx, text, x, y, size, fill, sw = 16) {
        ctx.save();
        ctx.font = "900 " + size + "px 'Fredoka', 'Arial Black', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillText(text, x + 5, y + 8);
        ctx.lineWidth = sw;
        ctx.strokeStyle = "#0E0B16";
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
        ctx.restore();
      }

      function sunburst(ctx, c1, c2) {
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.save();
        ctx.translate(920, 380);
        ctx.fillStyle = c1;
        for (let i = 0; i < 18; i++) {
          const a1 = (i * Math.PI * 2) / 18;
          const a2 = a1 + Math.PI / 18;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a1) * 1500, Math.sin(a1) * 1500);
          ctx.lineTo(Math.cos(a2) * 1500, Math.sin(a2) * 1500);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      window.renderThumb16x9 = (kind) => {
        const c = document.getElementById("c");
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, 1280, 720);

        if (kind === "escola") {
          sunburst(ctx, "#DC2626", "#7F1D1D");
          VB.isoCube(ctx, 110, 120, 95, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawDiretora(ctx, { x: 785, y: 470, scale: 1.25, expr: "scream", megaphone: true, stopwatch: true, t: 0.5 });
          VB.drawBoy(ctx, { x: 1055, y: 495, scale: 1.38, expr: "shocked_extreme", backpack: true, t: 0.5 });
          stroked(ctx, "ESCOLA VIROU", 375, 245, 76, "#FFFFFF", 18);
          stroked(ctx, "PARKOUR", 375, 365, 118, "#FFD426", 22);
          stroked(ctx, "DE LAVA?!", 375, 480, 84, "#5CE65C", 18);
        } else if (kind === "pix") {
          sunburst(ctx, "#10B981", "#064E3B");
          VB.isoCube(ctx, 110, 120, 95, "#6BFF89", "#3EE865", "#29B84A", 5);
          VB.drawBoy(ctx, { x: 955, y: 525, scale: 1.85, expr: "star_eyes", pose: "closeup", goldenShoes: true, t: 0.5 });
          stroked(ctx, "1 PASSO =", 385, 235, 84, "#FFFFFF", 18);
          stroked(ctx, "R$ 1 NO PIX!", 385, 360, 106, "#FFD426", 22);
          stroked(ctx, "FIQUEI RICO?!", 385, 480, 76, "#5CE65C", 18);
        } else if (kind === "vo") {
          sunburst(ctx, "#9333EA", "#4C1D95");
          VB.isoCube(ctx, 110, 120, 95, "#F472B6", "#EC4899", "#BE185D", 5);
          VB.drawVovo(ctx, { x: 955, y: 535, scale: 1.82, expr: "happy", pose: "closeup", crown: true, holdingPot: true, t: 0.5 });
          stroked(ctx, "CASA DA VÓ", 385, 235, 84, "#FFFFFF", 18);
          stroked(ctx, "NÍVEL 999", 385, 360, 108, "#FF66B2", 22);
          stroked(ctx, "NO ROBLOX!", 385, 480, 80, "#FFD426", 18);
        } else if (kind === "chinelo") {
          sunburst(ctx, "#EA580C", "#581C87");
          VB.drawChinelo(ctx, 135, 115, 1.32, -0.32, true);
          VB.drawMom(ctx, { x: 985, y: 535, scale: 1.78, expr: "scream", pose: "closeup", crown: true, t: 0.5 });
          stroked(ctx, "CHINELO DA MÃE", 390, 245, 60, "#FFFFFF", 16);
          stroked(ctx, "MÍTICO 999", 390, 365, 100, "#FFD426", 22);
          stroked(ctx, "FAZ CURVA?!", 390, 480, 78, "#5CE65C", 18);
        } else if (kind === "mercado") {
          sunburst(ctx, "#DC2626", "#7F1D1D");
          VB.drawCaixa(ctx, { x: 775, y: 500, scale: 1.06, expr: "side_eye", scanner: true, t: 0.5 });
          VB.drawBoy(ctx, { x: 1085, y: 515, scale: 1.15, expr: "shocked_extreme", t: 0.5 });
          stroked(ctx, "MÃE SUMIU", 340, 240, 76, "#FFFFFF", 18);
          stroked(ctx, "NA FILA DO", 340, 360, 82, "#FFD426", 19);
          stroked(ctx, "MERCADO?!", 340, 480, 80, "#5CE65C", 18);
        } else if (kind === "bateria") {
          sunburst(ctx, "#16A34A", "#14532D");
          VB.isoCube(ctx, 110, 120, 95, "#6BFF89", "#3EE865", "#29B84A", 5);
          VB.drawBoy(ctx, { x: 960, y: 530, scale: 1.82, expr: "shocked_extreme", pose: "closeup", holdingTablet: true, t: 0.5 });
          stroked(ctx, "SUA BATERIA =", 385, 235, 74, "#FFFFFF", 18);
          stroked(ctx, "SUA VIDA", 385, 360, 112, "#5CE65C", 22);
          stroked(ctx, "TÁ EM 2%?!", 385, 480, 86, "#FFD426", 18);
        }

        VB.drawWatermark(ctx, 1280, 720, "Vida de Bloco", true);
        return c.toDataURL("image/jpeg", 0.93).split(",")[1];
      };
    </script></body></html>`,
    { waitUntil: "networkidle" }
  );

  await page.evaluate(() => document.fonts.ready);

  for (const [slug, kind] of [
    ["lote_01_escola", "escola"],
    ["lote_02_pix", "pix"],
    ["lote_03_vo", "vo"],
    ["lote_04_chinelo", "chinelo"],
    ["lote_05_mercado", "mercado"],
    ["lote_06_bateria", "bateria"],
  ]) {
    const b64 = await page.evaluate((k) => window.renderThumb16x9(k), kind);
    fs.writeFileSync(path.resolve(`output/${slug}_thumb_16x9.jpg`), Buffer.from(b64, "base64"));
  }

  await browser.close();
  console.log("3 Thumbnails 1280x720 geradas com sucesso!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
