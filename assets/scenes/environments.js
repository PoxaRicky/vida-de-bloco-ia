// Cenários, HUD e Legendas estilo Vida de Bloco
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

  // Fundo raiado roxo (abertura de Shorts)
  function drawSunburst(ctx, W, H, t, c1 = "#8B63F6", c2 = "#744AE3") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H * 0.48;
    const rays = 18;
    const rot = t * 0.35;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = c1;
    for (let i = 0; i < rays; i++) {
      const a1 = (i * Math.PI * 2) / rays;
      const a2 = a1 + Math.PI / rays;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * 1600, Math.sin(a1) * 1600);
      ctx.lineTo(Math.cos(a2) * 1600, Math.sin(a2) * 1600);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Parede listrada roxa do quarto
  function drawStripedWall(ctx, W, wallH) {
    const stripeW = 84;
    for (let x = 0, i = 0; x < W; x += stripeW, i++) {
      ctx.fillStyle = i % 2 === 0 ? "#8E79EA" : "#7D67DC";
      ctx.fillRect(x, 0, stripeW + 1, wallH);
    }
  }

  // Chão xadrez verde em perspectiva (Obby)
  function drawCheckerFloor(ctx, W, H, horizonY, t) {
    ctx.fillStyle = "#45C742";
    ctx.fillRect(0, horizonY, W, H - horizonY);

    const rows = 9;
    const cols = 8;
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

  // Rua cinza com Studs do Roblox em perspectiva + faixa amarela
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

    // Fileiras de studs ovais
    const rows = 10;
    for (let r = 0; r < rows; r++) {
      const p = (r + 0.5) / rows;
      const y = roadTopY + Math.pow(p, 1.3) * (H - roadTopY);
      const rx = 14 + p * 18;
      const ry = 5 + p * 7;
      const stepX = 52 + p * 44;
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

    // Faixa tracejada amarela
    const dashY = roadTopY + (H - roadTopY) * 0.28;
    for (let x = 20; x < W; x += 140) {
      VB.celBox(ctx, x, dashY, 84, 18, 5, "#FFD426", 4, 0);
    }
  }

  // Explosão em estrela vermelha ("DIA QUATRO")
  function drawComicStarburst(ctx, cx, cy, outerR, innerR, points, scale) {
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
    strokedText(ctx, "DIA", 0, -68, 108, "#FFFFFF", 18);
    strokedText(ctx, "QUATRO", 0, 58, 128, "#FFD426", 20);
    ctx.restore();
  }

  // Linhas radiais de choque/velocidade nas bordas
  function drawSpeedLines(ctx, W, H, t) {
    ctx.save();
    ctx.translate(W / 2, H * 0.45);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 6;
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24 + Math.sin(t * 20 + i) * 0.03;
      const rIn = 430 + ((i * 37) % 90);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
      ctx.lineTo(Math.cos(a) * 1100, Math.sin(a) * 1100);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Renderizador principal de cada ambiente
  VB.renderEnvironment = function (ctx, W, H, envName, t, sceneDur) {
    if (envName === "hook_sunburst") {
      drawSunburst(ctx, W, H, t, "#8C65F7", "#7348E0");

      // Extreme close-up busto/rosto da Mãe igual ao frame 0:00 do canal!
      const z = 3.35 + Math.min(0.22, t * 0.1);
      VB.drawMom(ctx, {
        x: W * 0.49,
        y: H * 0.89,
        scale: z,
        expr: "oval_o",
        pose: "closeup",
        holdingTablet: true,
        t,
      });

      // Título gigante empilhado no topo (idêntico ao frame 0:00 do canal)
      strokedText(ctx, "E SE SUA", W / 2, 140, 68, "#FFFFFF", 15);
      strokedText(ctx, "MÃE", W / 2, 245, 138, "#FFD426", 20);
      strokedText(ctx, "COMEÇASSE A JOGAR ROBLOX?", W / 2, 355, 52, "#5CE65C", 13);
    } else if (envName === "bedroom_duo") {
      const floorY = H * 0.74;
      drawStripedWall(ctx, W, floorY);

      // Chão roxo escuro + tapete verde oval
      ctx.fillStyle = "#5B449E";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(W * 0.56, H * 0.9, 360, 88, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2E9E5B";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.stroke();

      // Janela no canto superior direito (céu, sol, grama)
      ctx.save();
      VB.celBox(ctx, 560, -10, 500, 355, 12, "#F8FAFC", 8, 0);
      ctx.fillStyle = "#7AD0FF";
      ctx.fillRect(584, 10, 452, 240);
      ctx.fillStyle = "#48C946";
      ctx.fillRect(584, 248, 452, 74);
      ctx.beginPath();
      ctx.arc(695, 118, 42, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      // Divisórias brancas da janela
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(800, 10, 18, 312);
      ctx.fillRect(584, 152, 452, 18);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.strokeRect(584, 10, 452, 312);
      ctx.restore();

      // Prateleira de madeira + troféu dourado + pôster amarelo
      VB.celBox(ctx, -20, 455, 340, 34, 12, "#C67D3B", 7, 0.2);
      VB.celBox(ctx, -10, 40, 130, 175, 14, "#FFD426", 7, 0.15);
      // Taça/troféu
      VB.celBox(ctx, 162, 420, 74, 34, 8, "#A86428", 6, 0.2);
      ctx.fillStyle = "#FFD426";
      ctx.fillRect(188, 378, 22, 44);
      ctx.strokeRect(188, 378, 22, 44);
      ctx.beginPath();
      ctx.arc(199, 340, 52, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.stroke();

      // Pufe rosa gigante + Menino sentado com side-eye + suor
      ctx.beginPath();
      ctx.ellipse(270, 1295, 290, 210, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F768BA";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.stroke();

      const camPush = 1 + Math.sin(t * 3) * 0.02;
      VB.drawBoy(ctx, {
        x: 265,
        y: 1035,
        scale: 1.48 * camPush,
        expr: "side_eye",
        pose: "sit",
        holdingTablet: true,
        t,
      });

      // Mãe ao lado gritando
      VB.drawMom(ctx, {
        x: 800,
        y: 1095 + Math.abs(Math.sin(t * 10)) * -18,
        scale: 1.48,
        expr: "scream",
        pose: "stand",
        t,
      });
    } else if (envName === "boy_extreme_shock") {
      drawStripedWall(ctx, W, H);
      const shakeX = Math.sin(t * 48) * 10;
      const shakeY = Math.cos(t * 42) * 8;

      ctx.beginPath();
      ctx.ellipse(W / 2, H * 0.92, 460, 280, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F768BA";
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.drawBoy(ctx, {
        x: W / 2 + shakeX,
        y: H * 0.58 + shakeY,
        scale: 2.75,
        expr: "shocked_extreme",
        pose: "sit",
        t,
      });
      drawSpeedLines(ctx, W, H, t);
    } else if (envName === "obby_lava_fall") {
      // Caverna roxa escura com pilares ao fundo
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#4B255E");
      bgGrad.addColorStop(1, "#6E3562");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      [
        [40, 260, 180],
        [310, 410, 210],
        [760, 180, 230],
      ].forEach(([px, py, pw]) => {
        ctx.fillStyle = "rgba(35, 16, 48, 0.45)";
        ctx.fillRect(px, py, pw, H - py);
      });

      // Plataforma cinza alta à esquerda + Jump Pad ciano + placa PULE!
      VB.celBox(ctx, -30, 1020, 500, 700, 8, "#8E94A6", 7, 0.18);
      ctx.beginPath();
      ctx.ellipse(175, 1016, 128, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#62E3FF";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Placa "PULE! ▶"
      ctx.fillStyle = "#8C583A";
      ctx.fillRect(42, 740, 22, 280);
      ctx.strokeRect(42, 740, 22, 280);
      ctx.save();
      ctx.rotate(-0.04);
      VB.celBox(ctx, -40, 625, 315, 145, 22, "#F8FAFC", 7, 0);
      strokedText(ctx, "PULE! ▶", 115, 698, 62, "#F0283A", 8);
      ctx.restore();

      // Bloco verde 3D isométrico flutuando à direita
      VB.isoCube(ctx, 835, 1110, 250, "#6BFF89", "#3EE865", "#29B84A", 7);

      // Rastro fantasma da Mãe caindo na lava (motion trail igual ao vídeo!)
      const cycle = (t * 0.95) % 1;
      const fallPositions = [
        [575, 760, 0.35, -0.05],
        [740, 960, 0.55, 0.35],
        [520, 1340, 1.0, -0.25],
      ];
      fallPositions.forEach(([fx, fy, alpha, rot], idx) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        const dy = Math.sin(cycle * Math.PI * 2 + idx) * 28;
        ctx.translate(fx, fy + dy);
        ctx.rotate(rot);
        VB.drawMom(ctx, {
          x: 0,
          y: 0,
          scale: 0.78,
          expr: "scream",
          pose: "fall",
          t,
        });
        ctx.restore();
      });

      // Rio de lava incandescente na base + ondas e partículas
      const lavaY = 1410;
      const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, H);
      lavaGrad.addColorStop(0, "#FF9A1F");
      lavaGrad.addColorStop(0.25, "#F24C18");
      lavaGrad.addColorStop(1, "#B8220E");
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, lavaY, W, H - lavaY);
      ctx.beginPath();
      ctx.moveTo(0, lavaY);
      ctx.lineTo(W, lavaY);
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Anéis de impacto + bolas de fogo/partículas
      [190, 270].forEach((rx, i) => {
        ctx.beginPath();
        ctx.ellipse(580, 1415, rx + ((t * 90) % 60), 32 + i * 10, 0, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = i === 0 ? "#FFF3A1" : "rgba(255,220,120,0.55)";
        ctx.stroke();
      });

      for (let p = 0; p < 18; p++) {
        const ang = (p / 18) * Math.PI + 0.1;
        const dist = 40 + ((p * 53 + t * 180) % 210);
        const px = 610 + Math.cos(ang) * dist * 1.1;
        const py = 1415 - Math.sin(ang) * dist * 0.75;
        const pr = 14 + (p % 3) * 8;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = p % 2 === 0 ? "#FFD426" : "#FF5722";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
      }

      // HUD Contador vermelho no topo direito ("QUEDAS / 20")
      ctx.save();
      ctx.translate(730, 560);
      ctx.rotate(-0.03);
      VB.celBox(ctx, -260, -90, 520, 210, 42, "#D9232E", 8, 0.15);
      VB.celBox(ctx, -145, -130, 290, 74, 34, "#EE3B4B", 7, 0);
      strokedText(ctx, "QUEDAS", 0, -92, 46, "#FFFFFF", 10);
      const countNum = Math.min(20, 12 + Math.floor(t * 5));
      strokedText(ctx, String(countNum), 0, 26, 126, "#FFD426", 16);
      ctx.restore();
    } else if (envName === "dia_quatro_obby") {
      // Céu azul claro + pilares + chão xadrez verde + cubos flutuantes
      const skyG = ctx.createLinearGradient(0, 0, 0, 1080);
      skyG.addColorStop(0, "#75CEFF");
      skyG.addColorStop(1, "#C9EEFF");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, 1080);

      VB.celBox(ctx, 180, 620, 190, 460, 6, "#5EA9F5", 7, 0.2);
      VB.celBox(ctx, 740, 580, 200, 500, 6, "#7BBDF8", 7, 0.2);
      VB.celBox(ctx, 920, 660, 180, 420, 6, "#B9DBFF", 7, 0.2);

      drawCheckerFloor(ctx, W, H, 1080, t);

      // Cubos 3D verdes e amarelos flutuando
      VB.isoCube(ctx, 60, 560 + Math.sin(t * 4) * 20, 145, "#6BFF89", "#3EE865", "#29B84A", 6);
      VB.isoCube(ctx, 975, 420 + Math.cos(t * 4) * 20, 130, "#6BFF89", "#3EE865", "#29B84A", 6);
      VB.isoCube(ctx, 470, 145, 95, "#FFE566", "#FFD426", "#D9A714", 6);

      // Mãe pulando comemorando
      const jumpY = Math.abs(Math.sin(t * 9)) * 75;
      VB.drawMom(ctx, {
        x: W / 2,
        y: 1185 - jumpY,
        scale: 1.18,
        expr: "happy",
        pose: "cheer",
        t,
      });

      // Explosão vermelha "DIA QUATRO" no primeiro 1.1s da cena (depois sobe pro topo!)
      const burstScale = t < 1.1 ? Math.min(1.05, 0.4 + t * 1.4) : 0.62;
      const burstY = t < 1.1 ? 560 : 340;
      drawComicStarburst(ctx, W / 2, burstY, 470, 290, 12, burstScale);
    } else if (envName === "brazil_roblox_street") {
      const roadY = 1230;
      const skyG = ctx.createLinearGradient(0, 0, 0, roadY);
      skyG.addColorStop(0, "#4BAEF8");
      skyG.addColorStop(1, "#BDE6FF");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, roadY);

      // Sol quadrado amarelo com contorno + nuvens em blocos!
      VB.celBox(ctx, 480, 175, 110, 110, 6, "#FFEE38", 6, 0.15);
      VB.celBox(ctx, 595, 155, 165, 52, 4, "#FFFFFF", 5, 0);
      VB.celBox(ctx, 635, 122, 85, 36, 4, "#FFFFFF", 5, 0);
      VB.celBox(ctx, 130, 230, 170, 48, 4, "#FFFFFF", 5, 0);

      // Casas brasileiras coloridas + caixas d'água azuis + PADARIA
      // Casa verde ao fundo + caixa d'água
      VB.celBox(ctx, 70, 480, 340, 420, 6, "#54CF58", 6, 0.15);
      VB.celBox(ctx, 290, 420, 88, 64, 8, "#3B82F6", 5, 0.25);

      // Casa amarela esquerda com telhado de barro/laranja
      VB.celBox(ctx, -10, 690, 250, 540, 6, "#FCE588", 6, 0.15);
      ctx.beginPath();
      ctx.moveTo(-25, 695);
      ctx.lineTo(25, 585);
      ctx.lineTo(220, 585);
      ctx.lineTo(255, 695);
      ctx.closePath();
      ctx.fillStyle = "#EE5A24";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // PADARIA central com toldo listrado vermelho e branco
      VB.celBox(ctx, 250, 590, 380, 640, 6, "#D8B49A", 6, 0.12);
      VB.celBox(ctx, 265, 610, 350, 74, 8, "#7C5338", 6, 0);
      strokedText(ctx, "PADARIA", 440, 648, 44, "#FFD426", 8);
      for (let s = 0; s < 7; s++) {
        VB.celBox(
          ctx,
          268 + s * 50,
          690,
          50,
          68,
          [0, 0, 18, 18],
          s % 2 === 0 ? "#EE2B3B" : "#FFFFFF",
          5,
          0
        );
      }

      // Sobrado laranja à direita + caixa d'água azul no topo
      VB.celBox(ctx, 650, 520, 440, 710, 6, "#F79F66", 6, 0.18);
      VB.celBox(ctx, 790, 435, 110, 86, 10, "#2563EB", 6, 0.25);
      VB.celBox(ctx, 710, 595, 130, 115, 8, "#BAE6FD", 6, 0);

      // Árvores em cubo 3D estilo Roblox!
      ctx.fillStyle = "#784421";
      ctx.fillRect(155, 860, 44, 370);
      ctx.strokeRect(155, 860, 44, 370);
      VB.isoCube(ctx, 175, 795, 195, "#6BFF89", "#46CF42", "#2FA32C", 6);

      ctx.fillStyle = "#784421";
      ctx.fillRect(885, 860, 44, 370);
      ctx.strokeRect(885, 860, 44, 370);
      VB.isoCube(ctx, 905, 795, 195, "#6BFF89", "#46CF42", "#2FA32C", 6);

      // Poste e fios pretos típicos de rua brasileira
      ctx.fillStyle = "#52525B";
      ctx.fillRect(725, 450, 22, 780);
      ctx.strokeRect(725, 450, 22, 780);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 485);
      ctx.lineTo(1080, 495);
      ctx.moveTo(0, 505);
      ctx.lineTo(1080, 515);
      ctx.stroke();

      // Rua com Studs do Roblox
      drawStuddedStreet(ctx, W, H, roadY);

      // Personagens na rua com Nametags flutuantes!
      const bounce = Math.abs(Math.sin(t * 10)) * 38;
      VB.drawMom(ctx, {
        x: 540,
        y: 1125 - bounce,
        scale: 1.02,
        expr: "star_eyes",
        pose: "cheer",
        crown: true,
        t,
        nametag: "Mãe_Admin",
      });

      VB.drawBoy(ctx, {
        x: 225,
        y: 1215,
        scale: 0.88,
        expr: "shocked_extreme",
        pose: "stand",
        t,
        nametag: "Você (Banido)",
      });

      VB.drawBoy(ctx, {
        x: 865,
        y: 1185 - bounce * 0.7,
        scale: 0.86,
        expr: "star_eyes",
        pose: "cheer",
        t,
        nametag: "Beto_Gamer",
      });

      // Alerta modal "⚙ SISTEMA" no topo (idêntico ao vídeo longo!)
      ctx.save();
      VB.celBox(ctx, 80, 95, 920, 215, 28, "#16182D", 6, 0);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#FFD426";
      ctx.beginPath();
      ctx.roundRect(80, 95, 920, 215, 28);
      ctx.stroke();

      VB.celBox(ctx, 115, 65, 255, 58, 24, "#F5B82E", 5, 0);
      strokedText(ctx, "⚙ SISTEMA", 242, 95, 34, "#16182D", 0);
      strokedText(ctx, "Mãe_Admin comprou o servidor!", 540, 175, 44, "#FFFFFF", 8);
      strokedText(ctx, "Você foi expulso de casa.", 540, 242, 42, "#5CE1E6", 8);
      ctx.restore();
    } else if (envName === "mom_admin_closeup") {
      drawSunburst(ctx, W, H, t, "#F59E0B", "#B45309");
      drawSpeedLines(ctx, W, H, t);

      const z = 2.0 + Math.sin(t * 6) * 0.05;
      VB.drawMom(ctx, {
        x: W / 2,
        y: H * 0.63,
        scale: z,
        expr: "star_eyes",
        pose: "cheer",
        crown: true,
        t,
      });

      strokedText(ctx, "COMENTA:", W / 2, 165, 76, "#FFFFFF", 16);
      strokedText(ctx, "\"MÃE\" 👇", W / 2, 285, 132, "#FF66B2", 20);
    }
  };

  // Legendas estilo Karaokê animadas (2-3 palavras por vez com pop elástico e cores)
  VB.renderSubtitles = function (ctx, W, H, sceneText, highlights, progress) {
    const words = sceneText.trim().split(/\s+/);
    const chunkSize = 3;
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize));
    }
    const idx = Math.min(chunks.length - 1, Math.floor(progress * chunks.length));
    const chunk = chunks[idx];
    const chunkLocalP = (progress * chunks.length) % 1;
    const popScale = chunkLocalP < 0.18 ? 0.86 + (chunkLocalP / 0.18) * 0.2 : 1.0;

    ctx.save();
    const subY = H * 0.77;
    ctx.translate(W / 2, subY);
    ctx.scale(popScale, popScale);

    ctx.font = "900 78px 'Fredoka', 'Arial Black', sans-serif";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    const upperWords = chunk.map((w) => w.toUpperCase());
    const spaceW = 24;
    const widths = upperWords.map((w) => ctx.measureText(w).width);
    const totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (upperWords.length - 1);

    let curX = -totalW / 2;
    upperWords.forEach((uw, wi) => {
      const clean = uw.replace(/[.,!?"]/g, "");
      const color =
        (highlights && (highlights[uw] || highlights[clean])) || "#FFFFFF";
      const cx = curX + widths[wi] / 2;

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(uw, cx + 5, 9);

      ctx.lineWidth = 18;
      ctx.strokeStyle = "#0E0B16";
      ctx.strokeText(uw, cx, 0);

      ctx.fillStyle = color;
      ctx.fillText(uw, cx, 0);

      curX += widths[wi] + spaceW;
    });

    ctx.restore();
  };
})(window.VB);
