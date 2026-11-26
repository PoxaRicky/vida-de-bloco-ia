const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function main() {
  fs.mkdirSync(path.resolve("output"), { recursive: true });
  const rigCode = fs.readFileSync(path.resolve("assets/characters/cartoon_rig.js"), "utf-8");
  const envCode = fs.readFileSync(path.resolve("assets/scenes/environments.js"), "utf-8");

  const browser = await chromium.launch();

  // 1. Foto de Perfil 800x800 (já aprovada pelo revisao-01)
  const pageAvatar = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await pageAvatar.setContent(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap" rel="stylesheet">
    <style>body{margin:0;overflow:hidden;}</style></head><body>
    <canvas id="c" width="800" height="800"></canvas>
    <script>${rigCode}</script><script>${envCode}</script>
    <script>
      window.drawAvatar = () => {
        const c = document.getElementById("c");
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#4C1D95";
        ctx.fillRect(0, 0, 800, 800);
        ctx.save();
        ctx.translate(400, 400);
        ctx.fillStyle = "#7C3AED";
        for (let i = 0; i < 16; i++) {
          const a1 = (i * Math.PI * 2) / 16;
          const a2 = a1 + Math.PI / 16;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a1) * 700, Math.sin(a1) * 700);
          ctx.lineTo(Math.cos(a2) * 700, Math.sin(a2) * 700);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        VB.isoCube(ctx, 155, 195, 115, "#6BFF89", "#3EE865", "#29B84A", 6);
        VB.isoCube(ctx, 650, 205, 110, "#FFE566", "#FFD426", "#D97706", 6);
        VB.drawBoy(ctx, { x: 400, y: 585, scale: 2.35, expr: "star_eyes", pose: "closeup", goldenShoes: true, t: 0.4 });
        return c.toDataURL("image/png").split(",")[1];
      };
    </script></body></html>`,
    { waitUntil: "networkidle" }
  );
  await pageAvatar.evaluate(() => document.fonts.ready);
  const avatarB64 = await pageAvatar.evaluate(() => window.drawAvatar());
  fs.writeFileSync(path.resolve("output/canal_avatar_800x800.png"), Buffer.from(avatarB64, "base64"));

  // 2. Banner YouTube 2048x1152 (safe zone central 1546x423 -> X: 251..1797, Y: 364..787, zero sobreposição!)
  const pageBanner = await browser.newPage({ viewport: { width: 2048, height: 1152 } });
  await pageBanner.setContent(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap" rel="stylesheet">
    <style>body{margin:0;overflow:hidden;}</style></head><body>
    <canvas id="b" width="2048" height="1152"></canvas>
    <script>${rigCode}</script><script>${envCode}</script>
    <script>
      window.drawBanner = () => {
        const c = document.getElementById("b");
        const ctx = c.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, 2048, 1152);
        g.addColorStop(0, "#1E1B4B");
        g.addColorStop(0.5, "#581C87");
        g.addColorStop(1, "#0F172A");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 2048, 1152);

        // Raios sutis ao centro
        ctx.save();
        ctx.translate(1024, 576);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        for (let i = 0; i < 18; i++) {
          const a1 = (i * Math.PI * 2) / 18;
          const a2 = a1 + Math.PI / 18;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a1) * 1400, Math.sin(a1) * 1400);
          ctx.lineTo(Math.cos(a2) * 1400, Math.sin(a2) * 1400);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Personagens nas laterais da safe-zone (X=365 e X=1685), deixando X=520..1530 100% livre para o título!
        VB.isoCube(ctx, 220, 470, 90, "#6BFF89", "#3EE865", "#29B84A", 5);
        VB.isoCube(ctx, 1830, 470, 90, "#FFE566", "#FFD426", "#D97706", 5);
        VB.drawBoy(ctx, { x: 375, y: 615, scale: 0.62, expr: "star_eyes", pose: "cheer", goldenShoes: true, t: 0.3 });
        VB.drawCaramelo(ctx, { x: 1675, y: 635, scale: 0.72, crown: true, sunglasses: true, pose: "cheer", t: 0.3 });

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";

        ctx.font = "900 92px 'Fredoka', 'Arial Black', sans-serif";
        ctx.lineWidth = 20;
        ctx.strokeStyle = "#0E0B16";
        ctx.strokeText("VIDA DE BLOCO", 1024, 505);
        ctx.fillStyle = "#FFD426";
        ctx.fillText("VIDA DE BLOCO", 1024, 505);

        ctx.font = "900 36px 'Fredoka', 'Arial Black', sans-serif";
        ctx.lineWidth = 10;
        ctx.strokeText("HISTÓRIAS 'E SE...?' EM BLOCOS TODO DIA!", 1024, 595);
        ctx.fillStyle = "#5CE65C";
        ctx.fillText("HISTÓRIAS 'E SE...?' EM BLOCOS TODO DIA!", 1024, 595);

        VB.celBox(ctx, 834, 636, 380, 56, 28, "#16182D", 5, 0);
        ctx.font = "900 30px 'Fredoka', 'Arial Black', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("@VidadeBlocoBR", 1024, 665);

        return c.toDataURL("image/png").split(",")[1];
      };
    </script></body></html>`,
    { waitUntil: "networkidle" }
  );
  await pageBanner.evaluate(() => document.fonts.ready);
  const bannerB64 = await pageBanner.evaluate(() => window.drawBanner());
  fs.writeFileSync(path.resolve("output/canal_banner_2048x1152.png"), Buffer.from(bannerB64, "base64"));

  await browser.close();
  console.log("Avatar e Banner ajustados com sucesso!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
