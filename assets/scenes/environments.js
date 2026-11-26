// Cenários, HUD e Legendas estilo Vida de Bloco — Responsivos para 9:16 (Shorts) e 16:9 (Vídeos Longos)
window.VB = window.VB || {};

(function (VB) {
  const OUTLINE = "#1A1423";

  function strokedText(ctx, text, x, y, size, fill, strokeW = 14) {
    ctx.save();
    ctx.font = `900 ${size}px 'Fredoka', 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    if (strokeW > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.fillText(text, x + 4, y + 8);

      ctx.lineWidth = strokeW;
      ctx.strokeStyle = "#0D0A14";
      ctx.strokeText(text, x, y);
    }

    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawSunburst(ctx, W, H, t, c1 = "#8B63F6", c2 = "#744AE3") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H * 0.5;
    const rays = 18;
    const rot = t * 0.35;
    const maxR = Math.hypot(W, H);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = c1;
    for (let i = 0; i < rays; i++) {
      const a1 = (i * Math.PI * 2) / rays;
      const a2 = a1 + Math.PI / rays;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * maxR, Math.sin(a1) * maxR);
      ctx.lineTo(Math.cos(a2) * maxR, Math.sin(a2) * maxR);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawStripedWall(ctx, W, wallH) {
    const stripeW = 84;
    for (let x = 0, i = 0; x < W; x += stripeW, i++) {
      ctx.fillStyle = i % 2 === 0 ? "#8E79EA" : "#7D67DC";
      ctx.fillRect(x, 0, stripeW + 1, wallH);
    }
  }

  function drawCheckerFloor(ctx, W, H, horizonY, t) {
    ctx.fillStyle = "#45C742";
    ctx.fillRect(0, horizonY, W, H - horizonY);

    const rows = 9;
    const cols = W > H ? 12 : 8;
    const scroll = (t * 1.4) % 1;
    for (let r = 0; r < rows; r++) {
      const p0 = Math.pow((r + scroll * 0.5) / rows, 1.45);
      const p1 = Math.pow((r + 1 + scroll * 0.5) / rows, 1.45);
      const y0 = horizonY + p0 * (H - horizonY);
      const y1 = horizonY + p1 * (H - horizonY);

      for (let c = -2; c < cols + 2; c++) {
        if ((r + c) % 2 !== 0) continue;
        const spread0 = 1 + p0 * 0.9;
        const spread1 = 1 + p1 * 0.9;
        const normL = (c - cols / 2) / (cols / 2);
        const normR = (c + 1 - cols / 2) / (cols / 2);

        const x0L = W / 2 + normL * (W * 0.52) * spread0;
        const x0R = W / 2 + normR * (W * 0.52) * spread0;
        const x1R = W / 2 + normR * (W * 0.52) * spread1;
        const x1L = W / 2 + normL * (W * 0.52) * spread1;

        ctx.beginPath();
        ctx.moveTo(x0L, y0);
        ctx.lineTo(x0R, y0);
        ctx.lineTo(x1R, y1);
        ctx.lineTo(x1L, y1);
        ctx.closePath();
        ctx.fillStyle = "#36AE35";
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(W, horizonY);
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }

  function drawStuddedStreet(ctx, W, H, roadTopY) {
    const grad = ctx.createLinearGradient(0, roadTopY, 0, H);
    grad.addColorStop(0, "#767B8C");
    grad.addColorStop(1, "#575B6B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, roadTopY, W, H - roadTopY);

    ctx.beginPath();
    ctx.moveTo(0, roadTopY);
    ctx.lineTo(W, roadTopY);
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    const rows = 9;
    for (let r = 0; r < rows; r++) {
      const p = (r + 0.5) / rows;
      const y = roadTopY + Math.pow(p, 1.3) * (H - roadTopY);
      const rx = 14 + p * 18;
      const ry = 5 + p * 7;
      const stepX = 56 + p * 44;
      for (let x = (r % 2) * (stepX / 2); x < W + 40; x += stepX) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(20,20,35,0.45)";
        ctx.stroke();
      }
    }

    const dashY = roadTopY + (H - roadTopY) * 0.3;
    for (let x = 20; x < W; x += 140) {
      VB.celBox(ctx, x, dashY, 84, 18, 5, "#FFD426", 4, 0);
    }
  }

  function drawComicStarburst(ctx, cx, cy, outerR, innerR, points, scale, line1 = "DIA", line2 = "QUATRO") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = "#F0283A";
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = OUTLINE;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.rotate(-0.06);
    strokedText(ctx, line1, 0, -68, 104, "#FFFFFF", 18);
    strokedText(ctx, line2, 0, 58, 122, "#FFD426", 20);
    ctx.restore();
  }

  function drawSpeedLines(ctx, W, H, t) {
    ctx.save();
    ctx.translate(W / 2, H * 0.48);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 6;
    const baseR = Math.min(W, H) * 0.38;
    const maxR = Math.hypot(W, H);
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24 + Math.sin(t * 20 + i) * 0.03;
      const rIn = baseR + ((i * 37) % 80);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
      ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Bairro brasileiro completo (reutilizado em Shorts 9:16 e Longos 16:9)
  function drawBrazilianNeighborhood(ctx, W, H, roadY, S) {
    const skyG = ctx.createLinearGradient(0, 0, 0, roadY);
    skyG.addColorStop(0, "#4BAEF8");
    skyG.addColorStop(1, "#BDE6FF");
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, roadY);

    // Sol quadrado amarelo + nuvens em blocos
    VB.celBox(ctx, W * 0.45, 70 * S + 40, 105 * S, 105 * S, 6, "#FFEE38", 6, 0.15);
    VB.celBox(ctx, W * 0.56, 60 * S + 40, 160 * S, 48 * S, 4, "#FFFFFF", 5, 0);
    VB.celBox(ctx, W * 0.14, 110 * S + 40, 165 * S, 46 * S, 4, "#FFFFFF", 5, 0);

    const hScale = S;
    const cx = W / 2;

    // Casa verde ao fundo + caixa d'água azul
    VB.celBox(ctx, cx - 440 * hScale, roadY - 680 * hScale, 320 * hScale, 420 * hScale, 6, "#54CF58", 6, 0.15);
    VB.celBox(ctx, cx - 230 * hScale, roadY - 740 * hScale, 86 * hScale, 62 * hScale, 8, "#3B82F6", 5, 0.25);

    // Casa amarela esquerda com telhado de barro
    VB.celBox(ctx, cx - 560 * hScale, roadY - 510 * hScale, 260 * hScale, 510 * hScale, 6, "#FCE588", 6, 0.15);
    ctx.beginPath();
    ctx.moveTo(cx - 575 * hScale, roadY - 505 * hScale);
    ctx.lineTo(cx - 520 * hScale, roadY - 605 * hScale);
    ctx.lineTo(cx - 320 * hScale, roadY - 605 * hScale);
    ctx.lineTo(cx - 285 * hScale, roadY - 505 * hScale);
    ctx.closePath();
    ctx.fillStyle = "#EE5A24";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // PADARIA central com toldo listrado vermelho e branco
    const padX = cx - 260 * hScale;
    const padY = roadY - 610 * hScale;
    const padW = 380 * hScale;
    VB.celBox(ctx, padX, padY, padW, 610 * hScale, 6, "#D8B49A", 6, 0.12);
    VB.celBox(ctx, padX + 15 * hScale, padY + 18 * hScale, padW - 30 * hScale, 70 * hScale, 8, "#7C5338", 6, 0);
    strokedText(ctx, "PADARIA", padX + padW / 2, padY + 54 * hScale, Math.round(42 * hScale), "#FFD426", 8);
    for (let s = 0; s < 7; s++) {
      const sw = (padW - 30 * hScale) / 7;
      VB.celBox(
        ctx,
        padX + 15 * hScale + s * sw,
        padY + 94 * hScale,
        sw,
        64 * hScale,
        [0, 0, 16, 16],
        s % 2 === 0 ? "#EE2B3B" : "#FFFFFF",
        5,
        0
      );
    }

    // Sobrado laranja à direita + caixa d'água azul
    VB.celBox(ctx, cx + 140 * hScale, roadY - 670 * hScale, 440 * hScale, 670 * hScale, 6, "#F79F66", 6, 0.18);
    VB.celBox(ctx, cx + 275 * hScale, roadY - 752 * hScale, 106 * hScale, 84 * hScale, 10, "#2563EB", 6, 0.25);
    VB.celBox(ctx, cx + 195 * hScale, roadY - 590 * hScale, 125 * hScale, 110 * hScale, 8, "#BAE6FD", 6, 0);

    // Casas extras nas laterais quando for 16:9 widescreen!
    if (W > H) {
      VB.celBox(ctx, 20, roadY - 540 * hScale, 310 * hScale, 540 * hScale, 6, "#C4B5FD", 6, 0.16);
      VB.celBox(ctx, W - 330 * hScale, roadY - 580 * hScale, 320 * hScale, 580 * hScale, 6, "#6EE7B7", 6, 0.16);
    }

    // Árvores em cubo 3D estilo Roblox
    [cx - 355 * hScale, cx + 385 * hScale].forEach((tx) => {
      ctx.fillStyle = "#784421";
      ctx.fillRect(tx - 20 * hScale, roadY - 350 * hScale, 40 * hScale, 350 * hScale);
      ctx.strokeRect(tx - 20 * hScale, roadY - 350 * hScale, 40 * hScale, 350 * hScale);
      VB.isoCube(ctx, tx, roadY - 415 * hScale, 185 * hScale, "#6BFF89", "#46CF42", "#2FA32C", 6);
    });

    // Poste e fios elétricos
    ctx.fillStyle = "#52525B";
    ctx.fillRect(cx + 205 * hScale, roadY - 730 * hScale, 20 * hScale, 730 * hScale);
    ctx.strokeRect(cx + 205 * hScale, roadY - 730 * hScale, 20 * hScale, 730 * hScale);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, roadY - 695 * hScale);
    ctx.lineTo(W, roadY - 680 * hScale);
    ctx.moveTo(0, roadY - 675 * hScale);
    ctx.lineTo(W, roadY - 660 * hScale);
    ctx.stroke();

    drawStuddedStreet(ctx, W, H, roadY);
  }

  // Pílula HUD "7 DIAS" no canto superior direito (usada em vídeos longos 16:9)
  VB.drawHudBadge = function (ctx, W, badgeText) {
    if (!badgeText) return;
    ctx.save();
    const bw = 250;
    const bh = 68;
    const bx = W - bw - 36;
    const by = 32;
    VB.celBox(ctx, bx, by, bw, bh, 34, "#1E2038", 5, 0);
    ctx.beginPath();
    ctx.arc(bx + 42, by + bh / 2, 18, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#3FA9F5";
    ctx.stroke();
    strokedText(ctx, badgeText, bx + 148, by + bh / 2 + 1, 34, "#FFFFFF", 6);
    ctx.restore();
  };

  VB.renderEnvironment = function (ctx, W, H, envName, t, sceneDur, cena = {}) {
    const isL = W > H;
    const S = isL ? 0.62 : 1.0;

    if (envName === "hook_sunburst") {
      drawSunburst(ctx, W, H, t, "#8C65F7", "#7348E0");
      const z = (3.35 + Math.min(0.22, t * 0.1)) * S;
      VB.drawMom(ctx, {
        x: W * 0.5,
        y: H * (isL ? 0.96 : 0.89),
        scale: z,
        expr: "oval_o",
        pose: "closeup",
        holdingTablet: true,
        t,
      });
      strokedText(ctx, cena.titulo_1 || "E SE SUA", W / 2, H * 0.08, Math.round(68 * S), "#FFFFFF", 14);
      strokedText(ctx, cena.titulo_2 || "MÃE", W / 2, H * 0.15, Math.round(136 * S), "#FFD426", 18);
      strokedText(ctx, cena.titulo_3 || "COMEÇASSE A JOGAR ROBLOX?", W / 2, H * 0.22, Math.round(52 * S), "#5CE65C", 12);
    } else if (envName === "hook_caramelo") {
      drawSunburst(ctx, W, H, t, "#F59E0B", "#D97706");
      const z = (2.85 + Math.min(0.22, t * 0.12)) * S;
      VB.drawCaramelo(ctx, {
        x: W * 0.5,
        y: H * (isL ? 0.88 : 0.78),
        scale: z,
        crown: true,
        sunglasses: false,
        pose: "closeup",
        t,
      });
      strokedText(ctx, "E SE O CACHORRO", W / 2, H * 0.08, Math.round(66 * S), "#FFFFFF", 14);
      strokedText(ctx, "CARAMELO", W / 2, H * 0.15, Math.round(122 * S), "#FFD426", 18);
      strokedText(ctx, "VIRASSE DONO DO ROBLOX?", W / 2, H * 0.22, Math.round(54 * S), "#5CE65C", 12);
    } else if (envName === "bedroom_duo") {
      const floorY = H * 0.74;
      drawStripedWall(ctx, W, floorY);

      ctx.fillStyle = "#5B449E";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(W * 0.56, H * 0.9, 360 * S, 88 * S, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2E9E5B";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.stroke();

      // Janela
      const winX = W - 510 * S;
      VB.celBox(ctx, winX, -10, 490 * S, 350 * S, 12, "#F8FAFC", 8, 0);
      ctx.fillStyle = "#7AD0FF";
      ctx.fillRect(winX + 22 * S, 10, 446 * S, 236 * S);
      ctx.fillStyle = "#48C946";
      ctx.fillRect(winX + 22 * S, 244 * S, 446 * S, 72 * S);
      ctx.beginPath();
      ctx.arc(winX + 130 * S, 115 * S, 40 * S, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD426";
      ctx.fill();

      // Prateleira + troféu
      VB.celBox(ctx, -20, H * 0.24, 340 * S, 34 * S, 12, "#C67D3B", 7, 0.2);

      // Pufe rosa + Menino
      const boyX = isL ? W * 0.34 : 265;
      const momX = isL ? W * 0.66 : 800;
      ctx.beginPath();
      ctx.ellipse(boyX, floorY + 25 * S, 285 * S, 195 * S, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F768BA";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.drawBoy(ctx, {
        x: boyX,
        y: floorY - 220 * S,
        scale: 1.46 * S,
        expr: "side_eye",
        pose: "sit",
        holdingTablet: true,
        t,
      });

      VB.drawMom(ctx, {
        x: momX,
        y: floorY - 175 * S + Math.abs(Math.sin(t * 10)) * -18 * S,
        scale: 1.46 * S,
        expr: "scream",
        pose: "stand",
        t,
      });
    } else if (envName === "boy_extreme_shock") {
      drawStripedWall(ctx, W, H);
      const shakeX = Math.sin(t * 48) * 10;
      const shakeY = Math.cos(t * 42) * 8;

      VB.drawBoy(ctx, {
        x: W / 2 + shakeX,
        y: H * (isL ? 0.68 : 0.58) + shakeY,
        scale: 2.75 * S,
        expr: "shocked_extreme",
        pose: "sit",
        t,
      });
      drawSpeedLines(ctx, W, H, t);
    } else if (envName === "obby_lava_fall") {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#4B255E");
      bgGrad.addColorStop(1, "#6E3562");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const lavaY = H * 0.74;
      VB.celBox(ctx, -30, lavaY - 380 * S, 480 * S, 520 * S, 8, "#8E94A6", 7, 0.18);
      ctx.beginPath();
      ctx.ellipse(175 * S, lavaY - 384 * S, 128 * S, 22 * S, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#62E3FF";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.celBox(ctx, 20 * S, lavaY - 690 * S, 300 * S, 135 * S, 22, "#F8FAFC", 7, 0);
      strokedText(ctx, "PULE! ▶", 170 * S, lavaY - 620 * S, Math.round(58 * S), "#F0283A", 8);

      VB.isoCube(ctx, W * 0.78, lavaY - 290 * S, 240 * S, "#6BFF89", "#3EE865", "#29B84A", 7);

      const cycle = (t * 0.95) % 1;
      [
        [W * 0.52, lavaY - 620 * S, 0.35, -0.05],
        [W * 0.66, lavaY - 430 * S, 0.55, 0.35],
        [W * 0.49, lavaY - 60 * S, 1.0, -0.25],
      ].forEach(([fx, fy, alpha, rot], idx) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        const dy = Math.sin(cycle * Math.PI * 2 + idx) * 24 * S;
        ctx.translate(fx, fy + dy);
        ctx.rotate(rot);
        VB.drawMom(ctx, { x: 0, y: 0, scale: 0.78 * S, expr: "scream", pose: "fall", t });
        ctx.restore();
      });

      const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, H);
      lavaGrad.addColorStop(0, "#FF9A1F");
      lavaGrad.addColorStop(0.25, "#F24C18");
      lavaGrad.addColorStop(1, "#B8220E");
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, lavaY, W, H - lavaY);

      for (let p = 0; p < 16; p++) {
        const ang = (p / 16) * Math.PI + 0.1;
        const dist = (40 + ((p * 53 + t * 180) % 210)) * S;
        const px = W * 0.55 + Math.cos(ang) * dist * 1.1;
        const py = lavaY - Math.sin(ang) * dist * 0.75;
        ctx.beginPath();
        ctx.arc(px, py, (14 + (p % 3) * 8) * S, 0, Math.PI * 2);
        ctx.fillStyle = p % 2 === 0 ? "#FFD426" : "#FF5722";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(W * 0.68, H * 0.28);
      ctx.scale(S, S);
      VB.celBox(ctx, -250, -85, 500, 195, 40, "#D9232E", 8, 0.15);
      VB.celBox(ctx, -140, -124, 280, 70, 32, "#EE3B4B", 7, 0);
      strokedText(ctx, "QUEDAS", 0, -88, 44, "#FFFFFF", 10);
      strokedText(ctx, String(Math.min(20, 12 + Math.floor(t * 5))), 0, 24, 120, "#FFD426", 16);
      ctx.restore();
    } else if (envName === "dia_quatro_obby" || envName === "caramelo_obby_pro") {
      const horizonY = H * 0.56;
      const skyG = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyG.addColorStop(0, "#75CEFF");
      skyG.addColorStop(1, "#C9EEFF");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, horizonY);

      drawCheckerFloor(ctx, W, H, horizonY, t);
      VB.isoCube(ctx, W * 0.12, horizonY - 420 * S + Math.sin(t * 4) * 20, 145 * S, "#6BFF89", "#3EE865", "#29B84A", 6);
      VB.isoCube(ctx, W * 0.88, horizonY - 520 * S + Math.cos(t * 4) * 20, 130 * S, "#FFE566", "#FFD426", "#D9A714", 6);

      const jumpY = Math.abs(Math.sin(t * 9)) * 75 * S;
      if (envName === "caramelo_obby_pro") {
        VB.drawCaramelo(ctx, {
          x: W / 2,
          y: horizonY + 120 * S - jumpY,
          scale: 1.45 * S,
          sunglasses: true,
          pose: "cheer",
          t,
          nametag: "Caramelo_Pro",
        });
      } else {
        VB.drawMom(ctx, {
          x: W / 2,
          y: horizonY + 105 * S - jumpY,
          scale: 1.18 * S,
          expr: "happy",
          pose: "cheer",
          t,
        });
      }

      const burstScale = (t < 1.1 ? Math.min(1.02, 0.4 + t * 1.4) : 0.58) * S;
      const burstY = t < 1.1 ? H * 0.3 : H * 0.19;
      drawComicStarburst(
        ctx,
        W / 2,
        burstY,
        460,
        285,
        12,
        burstScale,
        cena.dia_topo || "DIA",
        cena.dia_num || (envName === "caramelo_obby_pro" ? "TRÊS" : "QUATRO")
      );
    } else if (envName === "caramelo_padaria") {
      const roadY = H * 0.65;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);

      // Motoboy / Menino chocado + Caramelo cobrando imposto de coxinha!
      VB.drawBoy(ctx, {
        x: W * (isL ? 0.32 : 0.25),
        y: roadY - 20 * S,
        scale: 0.98 * S,
        expr: "shocked_extreme",
        pose: "stand",
        t,
        nametag: "Você (Sem Robux)",
      });

      VB.drawCaramelo(ctx, {
        x: W * (isL ? 0.62 : 0.66),
        y: roadY + 30 * S - Math.abs(Math.sin(t * 10)) * 30 * S,
        scale: 1.28 * S,
        crown: false,
        sunglasses: true,
        pose: "cheer",
        t,
        nametag: "Caramelo_Fiscal",
      });

      // Modal do Sistema: Nova Moeda Oficial = Coxinha!
      ctx.save();
      const mw = Math.min(W - 100, 920 * S);
      const mx = (W - mw) / 2;
      const my = isL ? 36 : 195;
      VB.celBox(ctx, mx, my, mw, 185 * S, 26, "#16182D", 6, 0);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#FFD426";
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, 185 * S, 26);
      ctx.stroke();
      strokedText(ctx, "⚙ NOVA REGRA DO SERVIDOR", W / 2, my + 56 * S, Math.round(38 * S), "#FFD426", 8);
      strokedText(ctx, "1 Robux agora custa 2 Pães de Queijo!", W / 2, my + 124 * S, Math.round(40 * S), "#5CE1E6", 8);
      ctx.restore();
    } else if (envName === "brazil_roblox_street" || envName === "caramelo_admin_street") {
      const roadY = H * 0.64;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);

      const bounce = Math.abs(Math.sin(t * 10)) * 36 * S;
      if (envName === "caramelo_admin_street") {
        VB.drawCaramelo(ctx, {
          x: W * 0.5,
          y: roadY - 10 * S - bounce,
          scale: 1.38 * S,
          crown: true,
          sunglasses: true,
          pose: "cheer",
          t,
          nametag: "Caramelo_Dono",
        });
        VB.drawMom(ctx, {
          x: W * (isL ? 0.24 : 0.2),
          y: roadY - 35 * S,
          scale: 0.92 * S,
          expr: "star_eyes",
          pose: "cheer",
          t,
          nametag: "Mãe_VIP",
        });
        VB.drawBoy(ctx, {
          x: W * (isL ? 0.76 : 0.82),
          y: roadY - 25 * S,
          scale: 0.92 * S,
          expr: "shocked_extreme",
          pose: "stand",
          t,
          nametag: "Motoboy_Banido",
        });
      } else {
        VB.drawMom(ctx, {
          x: W * 0.5,
          y: roadY - 85 * S - bounce,
          scale: 1.02 * S,
          expr: "star_eyes",
          pose: "cheer",
          crown: true,
          t,
          nametag: "Mãe_Admin",
        });
        VB.drawBoy(ctx, {
          x: W * (isL ? 0.26 : 0.21),
          y: roadY - 15 * S,
          scale: 0.88 * S,
          expr: "shocked_extreme",
          pose: "stand",
          t,
          nametag: "Você (Banido)",
        });
        VB.drawBoy(ctx, {
          x: W * (isL ? 0.74 : 0.8),
          y: roadY - 35 * S - bounce * 0.7,
          scale: 0.86 * S,
          expr: "star_eyes",
          pose: "cheer",
          t,
          nametag: "Beto_Gamer",
        });
      }

      // Alerta modal "⚙ SISTEMA"
      ctx.save();
      const mw = Math.min(W - 100, 920 * S);
      const mx = (W - mw) / 2;
      const my = isL ? 38 : 190;
      VB.celBox(ctx, mx, my, mw, 200 * S, 28, "#16182D", 6, 0);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#FFD426";
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, 200 * S, 28);
      ctx.stroke();

      VB.celBox(ctx, mx + 32 * S, my - 28 * S, 245 * S, 54 * S, 22, "#F5B82E", 5, 0);
      strokedText(ctx, "⚙ SISTEMA", mx + 154 * S, my - 1 * S, Math.round(32 * S), "#16182D", 0);
      strokedText(
        ctx,
        cena.sistema_1 || (envName === "caramelo_admin_street" ? "Caramelo virou CEO do Roblox!" : "Mãe_Admin comprou o servidor!"),
        W / 2,
        my + 76 * S,
        Math.round(42 * S),
        "#FFFFFF",
        8
      );
      strokedText(
        ctx,
        cena.sistema_2 || (envName === "caramelo_admin_street" ? "Proibido passar de moto no mapa." : "Você foi expulso de casa."),
        W / 2,
        my + 140 * S,
        Math.round(40 * S),
        "#5CE1E6",
        8
      );
      ctx.restore();
    } else if (envName === "mom_admin_closeup" || envName === "caramelo_cta") {
      drawSunburst(ctx, W, H, t, "#F59E0B", "#B45309");
      drawSpeedLines(ctx, W, H, t);

      const z = (2.0 + Math.sin(t * 6) * 0.05) * S;
      if (envName === "caramelo_cta") {
        VB.drawCaramelo(ctx, {
          x: W / 2,
          y: H * (isL ? 0.72 : 0.62),
          scale: z * 1.18,
          crown: true,
          sunglasses: true,
          pose: "cheer",
          t,
        });
      } else {
        VB.drawMom(ctx, {
          x: W / 2,
          y: H * (isL ? 0.74 : 0.63),
          scale: z,
          expr: "star_eyes",
          pose: "cheer",
          crown: true,
          t,
        });
      }

      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(74 * S), "#FFFFFF", 15);
      strokedText(
        ctx,
        cena.cta_palavra || (envName === "caramelo_cta" ? "\"CARAMELO\" 👇" : "\"MÃE\" 👇"),
        W / 2,
        H * 0.19,
        Math.round(118 * S),
        "#FF66B2",
        18
      );
    }

    if (isL && cena.hud_dias) {
      VB.drawHudBadge(ctx, W, cena.hud_dias);
    }
  };

  VB.renderSubtitles = function (ctx, W, H, sceneText, highlights, progress) {
    const isL = W > H;
    const words = sceneText.trim().split(/\s+/);
    const chunkSize = isL ? 4 : 3;
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize));
    }
    const idx = Math.min(chunks.length - 1, Math.floor(progress * chunks.length));
    const chunk = chunks[idx];
    const chunkLocalP = (progress * chunks.length) % 1;
    const popScale = chunkLocalP < 0.18 ? 0.86 + (chunkLocalP / 0.18) * 0.2 : 1.0;

    ctx.save();
    const subY = H * (isL ? 0.84 : 0.77);
    ctx.translate(W / 2, subY);
    ctx.scale(popScale, popScale);

    const fontSize = isL ? 64 : 76;
    ctx.font = `900 ${fontSize}px 'Fredoka', 'Arial Black', sans-serif`;
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    const upperWords = chunk.map((w) => w.toUpperCase());
    const spaceW = 22;
    const widths = upperWords.map((w) => ctx.measureText(w).width);
    const totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (upperWords.length - 1);

    let curX = -totalW / 2;
    upperWords.forEach((uw, wi) => {
      const clean = uw.replace(/[.,!?":]/g, "");
      const color = (highlights && (highlights[uw] || highlights[clean])) || "#FFFFFF";
      const cx = curX + widths[wi] / 2;

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(uw, cx + 5, 8);

      ctx.lineWidth = isL ? 15 : 18;
      ctx.strokeStyle = "#0E0B16";
      ctx.strokeText(uw, cx, 0);

      ctx.fillStyle = color;
      ctx.fillText(uw, cx, 0);

      curX += widths[wi] + spaceW;
    });

    ctx.restore();
  };
})(window.VB);
