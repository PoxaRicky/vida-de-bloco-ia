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
      function stroked(ctx, text, x, y, size, fill, sw = 13, maxW = null) {
        ctx.save();
        let sz = size;
        ctx.font = "900 " + sz + "px 'Fredoka', 'Arial Black', sans-serif";
        if (maxW) {
          const w = ctx.measureText(text).width;
          if (w > maxW) {
            sz = Math.max(24, Math.floor(sz * (maxW / w)));
            ctx.font = "900 " + sz + "px 'Fredoka', 'Arial Black', sans-serif";
          }
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.fillStyle = "rgba(0,0,0,0.48)";
        ctx.fillText(text, x + 4, y + 6);
        ctx.lineWidth = sw;
        ctx.strokeStyle = "#0E0B16";
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
        ctx.restore();
      }

      function sunburst(ctx, cx, cy, c1, c2) {
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = c1;
        for (let i = 0; i < 18; i++) {
          const a1 = (i * Math.PI * 2) / 18;
          const a2 = a1 + Math.PI / 18;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a1) * 1600, Math.sin(a1) * 1600);
          ctx.lineTo(Math.cos(a2) * 1600, Math.sin(a2) * 1600);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      window.renderThumb = (kind) => {
        const c = document.getElementById("c");
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, 1280, 720);

        if (kind === "longo_brasil") {
          // Thumbnail WIDESCREEN 16:9 COMPLETA sem nenhuma sobreposição!
          sunburst(ctx, 940, 390, "#16A34A", "#1E3A8A");
          VB.isoCube(ctx, 1185, 115, 86, "#6BFF89", "#3EE865", "#29B84A", 5);

          VB.drawVovo(ctx, { x: 720, y: 545, scale: 0.88, expr: "happy", crown: true, holdingPot: true, t: 0.4 });
          VB.drawBoy(ctx, { x: 955, y: 548, scale: 0.94, expr: "shocked_extreme", goldenShoes: true, t: 0.4 });
          VB.drawCaramelo(ctx, { x: 1165, y: 580, scale: 0.92, crown: true, sunglasses: true, pose: "cheer", t: 0.4 });

          VB.celBox(ctx, 56, 48, 250, 56, 28, "#16182D", 5, 0);
          stroked(ctx, "🕒 7 DIAS", 181, 77, 32, "#5CE65C", 6);

          stroked(ctx, "E SE O BRASIL", 315, 225, 68, "#FFFFFF", 16, 520);
          stroked(ctx, "VIRASSE ROBLOX", 315, 340, 72, "#FFD426", 18, 530);
          stroked(ctx, "POR 7 DIAS?!", 315, 455, 74, "#5CE65C", 16, 520);

          VB.drawWatermark(ctx, 1280, 720, "Vida de Bloco", true);
          return c.toDataURL("image/jpeg", 0.93).split(",")[1];
        }

        // --- THUMBS DE SHORTS (100% CENTRALIZADAS NA FAIXA 9:16 X=438..842) ---
        const CX = 640;
        const MAX_TEXT_W = 344;

        if (kind === "escola") {
          sunburst(ctx, CX, 390, "#DC2626", "#7F1D1D");
          VB.isoCube(ctx, 215, 210, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#6BFF89", "#3EE865", "#29B84A", 5);
          VB.drawBoy(ctx, { x: CX, y: 585, scale: 1.24, expr: "shocked_extreme", pose: "closeup", backpack: true, t: 0.5 });
          stroked(ctx, "ESCOLA VIROU", CX, 82, 46, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "PARKOUR", CX, 148, 70, "#FFD426", 15, MAX_TEXT_W);
          stroked(ctx, "DE LAVA?!", CX, 210, 50, "#5CE65C", 12, MAX_TEXT_W);
        } else if (kind === "pix") {
          sunburst(ctx, CX, 390, "#10B981", "#064E3B");
          VB.isoCube(ctx, 215, 210, 108, "#6BFF89", "#3EE865", "#29B84A", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawBoy(ctx, { x: CX, y: 585, scale: 1.24, expr: "star_eyes", pose: "closeup", goldenShoes: true, t: 0.5 });
          stroked(ctx, "1 PASSO =", CX, 82, 48, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "R$ 1 NO PIX!", CX, 148, 64, "#FFD426", 15, MAX_TEXT_W);
          stroked(ctx, "FIQUEI RICO?!", CX, 210, 46, "#5CE65C", 12, MAX_TEXT_W);
        } else if (kind === "vo") {
          sunburst(ctx, CX, 390, "#9333EA", "#4C1D95");
          VB.isoCube(ctx, 215, 210, 108, "#F472B6", "#EC4899", "#BE185D", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawVovo(ctx, { x: CX, y: 598, scale: 1.2, expr: "happy", pose: "closeup", crown: true, holdingPot: true, t: 0.5 });
          stroked(ctx, "CASA DA VÓ", CX, 82, 48, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "NÍVEL 999", CX, 148, 66, "#FF66B2", 15, MAX_TEXT_W);
          stroked(ctx, "NO ROBLOX!", CX, 210, 48, "#FFD426", 12, MAX_TEXT_W);
        } else if (kind === "chinelo") {
          sunburst(ctx, CX, 390, "#EA580C", "#581C87");
          VB.drawChinelo(ctx, 225, 250, 1.35, -0.35, true);
          VB.drawChinelo(ctx, 1055, 470, 1.35, 0.4, true);
          VB.drawMom(ctx, { x: CX, y: 602, scale: 1.2, expr: "scream", pose: "closeup", crown: true, t: 0.5 });
          stroked(ctx, "CHINELO DA MÃE", CX, 78, 42, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "MÍTICO 999", CX, 142, 64, "#FFD426", 15, MAX_TEXT_W);
          stroked(ctx, "FAZ CURVA?!", CX, 204, 48, "#5CE65C", 12, MAX_TEXT_W);
        } else if (kind === "mercado") {
          sunburst(ctx, CX, 390, "#DC2626", "#7F1D1D");
          VB.isoCube(ctx, 215, 210, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#38BDF8", "#0284C7", "#1D4ED8", 5);
          VB.drawCaixa(ctx, { x: 556, y: 562, scale: 0.72, expr: "side_eye", scanner: false, t: 0.5 });
          VB.drawBoy(ctx, { x: 726, y: 568, scale: 0.76, expr: "shocked_extreme", t: 0.5 });
          stroked(ctx, "MÃE SUMIU", CX, 78, 48, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "NA FILA DO", CX, 142, 58, "#FFD426", 14, MAX_TEXT_W);
          stroked(ctx, "MERCADO?!", CX, 204, 52, "#5CE65C", 13, MAX_TEXT_W);
        } else if (kind === "bateria") {
          sunburst(ctx, CX, 390, "#16A34A", "#14532D");
          VB.isoCube(ctx, 215, 210, 108, "#6BFF89", "#3EE865", "#29B84A", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawBoy(ctx, { x: CX, y: 590, scale: 1.22, expr: "shocked_extreme", pose: "closeup", holdingTablet: true, t: 0.5 });
          stroked(ctx, "SUA BATERIA =", CX, 78, 44, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "SUA VIDA", CX, 142, 66, "#5CE65C", 15, MAX_TEXT_W);
          stroked(ctx, "TÁ EM 2%?!", CX, 204, 50, "#FFD426", 12, MAX_TEXT_W);
        } else if (kind === "dti_mae") {
          sunburst(ctx, CX, 390, "#EC4899", "#4C1D95");
          VB.isoCube(ctx, 215, 210, 108, "#F9A8D4", "#EC4899", "#9D174D", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawMom(ctx, { x: CX + 70, y: 580, scale: 1.05, expr: "angry", t: 0.4 });
          VB.drawBoy(ctx, { x: CX - 75, y: 590, scale: 1.05, expr: "shocked_extreme", goldenShoes: true, t: 0.4 });
          stroked(ctx, "MÃE NO", CX, 78, 48, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "DRESS TO", CX, 142, 62, "#FFD426", 15, MAX_TEXT_W);
          stroked(ctx, "IMPRESS?!", CX, 204, 54, "#5CE65C", 13, MAX_TEXT_W);
        } else if (kind === "tsunami_onibus") {
          sunburst(ctx, CX, 390, "#0284C7", "#1E1B4B");
          VB.isoCube(ctx, 215, 210, 108, "#7DD3FC", "#0284C7", "#075985", 5);
          VB.isoCube(ctx, 1065, 510, 108, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawBoy(ctx, { x: CX, y: 590, scale: 1.22, expr: "shocked_extreme", pose: "closeup", t: 0.5 });
          stroked(ctx, "ÔNIBUS VIROU", CX, 78, 44, "#FFFFFF", 12, MAX_TEXT_W);
          stroked(ctx, "TSUNAMI", CX, 142, 66, "#38BDF8", 15, MAX_TEXT_W);
          stroked(ctx, "SEGURA!!", CX, 204, 54, "#FFD426", 13, MAX_TEXT_W);
        } else if (kind === "brookhaven_condominio") {
          sunburst(ctx, 880, 380, "#2563EB", "#1E1B4B");
          VB.isoCube(ctx, 120, 125, 95, "#93C5FD", "#3B82F6", "#1D4ED8", 5);
          VB.isoCube(ctx, 1175, 130, 95, "#FFE566", "#FFD426", "#D97706", 5);
          VB.drawSindica(ctx, { x: 750, y: 520, scale: 1.15, expr: "angry", megaphone: true, t: 0.4 });
          VB.drawBoy(ctx, { x: 965, y: 520, scale: 1.25, expr: "shocked_extreme", goldenShoes: true, t: 0.4 });
          VB.drawMom(ctx, { x: 1150, y: 520, scale: 1.15, expr: "angry", t: 0.4 });
          VB.celBox(ctx, 70, 56, 260, 58, 28, "#16182D", 5, 0);
          stroked(ctx, "🕒 24 HORAS", 200, 86, 34, "#38BDF8", 6);
          stroked(ctx, "CONDOMÍNIO", 355, 225, 78, "#FFFFFF", 18, 610);
          stroked(ctx, "BROOKHAVEN", 355, 345, 84, "#FFD426", 20, 620);
          stroked(ctx, "POR 24H?!", 355, 465, 86, "#5CE65C", 18, 610);
          VB.drawWatermark(ctx, 1280, 720, "Vida de Bloco", true);
          return c.toDataURL("image/jpeg", 0.93).split(",")[1];
        }

        // Mini-pílula no topo central (Y=26) para não tocar nem no tablet nem no personagem embaixo!
        VB.celBox(ctx, CX - 82, 10, 164, 30, 15, "rgba(18,16,34,0.88)", 3, 0);
        stroked(ctx, "VIDA DE BLOCO", CX, 26, 18, "#FFD426", 4);

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
    ["video_longo_01_brasil_7dias", "longo_brasil"],
    ["short_02_dti_mae", "dti_mae"],
    ["short_03_tsunami_onibus", "tsunami_onibus"],
    ["video_longo_02_brookhaven_condominio", "brookhaven_condominio"],
  ]) {
    const b64 = await page.evaluate((k) => window.renderThumb(k), kind);
    fs.writeFileSync(path.resolve(`output/${slug}_thumb_16x9.jpg`), Buffer.from(b64, "base64"));
  }

  await browser.close();
  console.log("Thumbnails polidas geradas!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
