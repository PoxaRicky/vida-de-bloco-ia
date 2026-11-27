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

    // Sol quadrado amarelo + nuvens em blocos (abaixo da zona de HUD nos Shorts)
    const skyBaseY = W > H ? 40 : 275;
    VB.celBox(ctx, W * 0.45, 70 * S + skyBaseY, 105 * S, 105 * S, 6, "#FFEE38", 6, 0.15);
    VB.celBox(ctx, W * 0.56, 60 * S + skyBaseY, 160 * S, 48 * S, 4, "#FFFFFF", 5, 0);
    VB.celBox(ctx, W * 0.14, 95 * S + skyBaseY, 165 * S, 46 * S, 4, "#FFFFFF", 5, 0);

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

  // Pílula HUD compacta e fixa na tela (canto superior direito seguro, sem colidir com PoxaRique!)
  VB.drawHudBadge = function (ctx, W, badgeText, isLandscape = true) {
    if (!badgeText) return;
    ctx.save();
    const bw = isLandscape ? 250 : Math.min(340, Math.max(200, badgeText.length * 22 + 82));
    const bh = isLandscape ? 68 : 54;
    const bx = W - bw - 34;
    const by = isLandscape ? 32 : 28;
    VB.celBox(ctx, bx, by, bw, bh, bh / 2, "#1E2038", 5, 0);
    ctx.beginPath();
    ctx.arc(bx + 34, by + bh / 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#5CE65C";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1A1423";
    ctx.stroke();
    strokedText(ctx, badgeText, bx + bw / 2 + 14, by + bh / 2 + 1, isLandscape ? 32 : 26, "#FFFFFF", 6);
    ctx.restore();
  };

  // =========================================================================
  // ELEMENTOS INTERATIVOS E TRAJETÓRIAS FÍSICAS REAIS (v2)
  // =========================================================================
  function resolveCoord(val, dim, fallback) {
    if (val === undefined || val === null) return fallback;
    const n = Number(val);
    if (Number.isNaN(n)) return fallback;
    return Math.abs(n) <= 2.0 ? n * dim : n;
  }

  VB.resolveActorTransform = function (actor, W, H, t, sceneDur, progress) {
    const p = Math.max(0, Math.min(1, progress !== undefined ? progress : (sceneDur > 0 ? t / sceneDur : 0)));
    const fx = resolveCoord(actor.fromX !== undefined ? actor.fromX : actor.x, W, W * 0.5);
    const tx = resolveCoord(actor.toX !== undefined ? actor.toX : fx, W, fx);
    const fy = resolveCoord(actor.fromY !== undefined ? actor.fromY : actor.y, H, H * 0.68);
    const ty = resolveCoord(actor.toY !== undefined ? actor.toY : fy, H, fy);
    const pathMode = String(actor.path || "none").toLowerCase();

    let x = fx + (tx - fx) * p;
    let y = fy + (ty - fy) * p;
    let state = actor.state || actor.anim || actor.pose || "idle";
    let jumpPhase = undefined;
    let jumpHeight = 0;
    let flip = actor.flip !== undefined ? Boolean(actor.flip) : tx < fx - 8;

    if (pathMode === "walk") {
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      x = fx + (tx - fx) * ease;
      y = fy + (ty - fy) * ease;
      if (!actor.state && !actor.anim) state = "walk";
    } else if (pathMode === "run") {
      const ease = 1 - Math.pow(1 - p, 1.35);
      x = fx + (tx - fx) * ease;
      y = fy + (ty - fy) * ease;
      if (!actor.state && !actor.anim) state = "run";
    } else if (pathMode === "jump_platforms") {
      const hops = Math.max(1, Number(actor.hops || 3));
      const scaled = p * hops;
      const hopIdx = Math.min(hops - 1, Math.floor(scaled));
      const localP = Math.min(1, scaled - hopIdx);
      const x0 = fx + ((tx - fx) * hopIdx) / hops;
      const x1 = fx + ((tx - fx) * (hopIdx + 1)) / hops;
      const y0 = fy + ((ty - fy) * hopIdx) / hops;
      const y1 = fy + ((ty - fy) * (hopIdx + 1)) / hops;
      const arcH = actor.jumpArc !== undefined ? Number(actor.jumpArc) : 155;
      const airArc = 4 * localP * (1 - localP);
      x = x0 + (x1 - x0) * localP;
      y = y0 + (y1 - y0) * localP - airArc * arcH;
      state = actor.state || "jump";
      jumpPhase = localP;
      jumpHeight = 0;
    } else if (pathMode === "fall") {
      const gP = Math.min(1, p * p * 1.15);
      x = fx + (tx - fx) * p;
      y = fy + (ty - fy) * gP;
      if (!actor.state && !actor.anim) {
        state = gP >= 0.98 && actor.landImpact !== false ? "shock" : "fall";
      }
    }

    return { x, y, state, jumpPhase, jumpHeight, flip };
  };

  VB.renderSceneActors = function (ctx, W, H, actors, t, sceneDur, progress, S = 1) {
    if (!Array.isArray(actors) || actors.length === 0) return;
    actors.forEach((actor) => {
      const tr = VB.resolveActorTransform(actor, W, H, t, sceneDur, progress);
      const opts = Object.assign({}, actor, {
        x: tr.x,
        y: tr.y,
        scale: (actor.scale !== undefined ? actor.scale : 1.25) * S,
        state: tr.state,
        flip: tr.flip,
        t,
        progress,
      });
      if (tr.jumpPhase !== undefined) {
        opts.jumpPhase = tr.jumpPhase;
        opts.jumpHeight = tr.jumpHeight;
      }
      VB.drawCharacter(ctx, actor.tipo || actor.personagem || "menino", opts);
    });
  };

  // Lava ou ácido borbulhante animado
  VB.drawBubblingHazard = function (ctx, W, H, topY, t, kind = "lava") {
    const isAcid = kind === "acid";
    const cTop = isAcid ? "#84CC16" : "#FACC15";
    const cMid = isAcid ? "#22C55E" : "#F97316";
    const cBot = isAcid ? "#15803D" : "#DC2626";

    ctx.save();
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, cMid);
    grad.addColorStop(1, cBot);

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 40; x += 40) {
      const wave = Math.sin(x * 0.018 + t * 5.2) * 12 + Math.cos(x * 0.032 - t * 3.4) * 6;
      ctx.lineTo(x, topY + wave);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // Brilho superficial e bolhas subindo
    for (let i = 0; i < 9; i++) {
      const bx = ((i * 137 + t * 42 * (i % 2 === 0 ? 1 : -1)) % W + W) % W;
      const cyc = ((t * 1.4 + i * 0.27) % 1);
      const by = topY + 35 - cyc * 58;
      const br = cyc < 0.85 ? 8 + cyc * 16 : (1 - cyc) * 90;
      ctx.globalAlpha = cyc < 0.85 ? 0.88 : (1 - cyc) * 4;
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(3, br), 0, Math.PI * 2);
      ctx.fillStyle = cTop;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    }
    ctx.restore();
  };

  // Esteira rolante animada (padaria / mercado / fábrica)
  VB.drawConveyorBelt = function (ctx, x, y, w, h, t, speed = 130) {
    ctx.save();
    VB.celBox(ctx, x, y, w, h, h / 2, "#334155", 6, 0.2);
    VB.celBox(ctx, x + 12, y + 10, w - 24, h - 20, (h - 20) / 2, "#1E293B", 4, 0);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 14, y + 10, w - 28, h - 20, (h - 20) / 2);
    ctx.clip();
    ctx.strokeStyle = "#64748B";
    ctx.lineWidth = 6;
    const step = 42;
    const shift = (t * speed) % step;
    for (let tx = x - step + shift; tx < x + w + step; tx += step) {
      ctx.beginPath();
      ctx.moveTo(tx, y + 10);
      ctx.lineTo(tx + 12, y + h / 2);
      ctx.lineTo(tx, y + h - 10);
      ctx.stroke();
    }
    ctx.restore();

    // Roletes giratórios nas pontas
    [x + h / 2, x + w - h / 2].forEach((rx) => {
      ctx.save();
      ctx.translate(rx, y + h / 2);
      ctx.rotate(t * 6);
      ctx.beginPath();
      ctx.arc(0, 0, h * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = "#94A3B8";
      ctx.fill();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-h * 0.24, 0);
      ctx.lineTo(h * 0.24, 0);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  };

  // Contador de Pix subindo em tempo real
  VB.drawPixCounter = function (ctx, x, y, t, progress, targetVal = 1500, scale = 1) {
    ctx.save();
    const p = Math.min(1, Math.max(0, progress * 1.25));
    const eased = 1 - Math.pow(1 - p, 2.4);
    const val = Math.round(targetVal * eased);
    const formatted = val.toLocaleString("pt-BR");
    const pulse = 1 + Math.sin(t * 14) * 0.035;

    ctx.translate(x, y);
    ctx.scale(scale * pulse, scale * pulse);
    VB.celBox(ctx, -185, -46, 370, 92, 24, "#064E3B", 6, 0.2);
    VB.celBox(ctx, -172, -32, 64, 64, 16, "#22C55E", 4.5, 0);
    strokedText(ctx, "❖", -140, 2, 34, "#FFFFFF", 5);
    strokedText(ctx, `R$ ${formatted},00`, 34, 4, 38, "#86EFAC", 7);
    ctx.restore();
  };

  // Pote de sorvete abrindo a tampa e revelando feijão (ou surpresa)
  VB.drawOpeningPot = function (ctx, x, y, progress, t, scale = 1, content = "feijao") {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Corpo do pote branco/azul de sorvete
    VB.celBox(ctx, -95, -20, 190, 118, 22, "#F8FAFC", 6, 0.22);
    VB.celBox(ctx, -82, 16, 164, 52, 14, "#38BDF8", 4.5, 0);
    strokedText(ctx, "CREME", 0, 43, 26, "#FFD426", 5);

    const openP = Math.max(0, Math.min(1, (progress - 0.15) / 0.45));
    if (openP > 0.08) {
      // Conteúdo interno (feijão fumegante ou Robux brilhante)
      ctx.beginPath();
      ctx.ellipse(0, -18, 82, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = content === "robux" ? "#22C55E" : "#78350F";
      ctx.fill();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Vapor saindo
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 5;
      [-30, 0, 30].forEach((sx, i) => {
        const wy = ((t * 42 + i * 16) % 45) * openP;
        ctx.beginPath();
        ctx.moveTo(sx, -28 - wy * 0.3);
        ctx.quadraticCurveTo(sx + 10, -48 - wy * 0.6, sx - 6, -68 - wy);
        ctx.stroke();
      });
    }

    // Tampa articulada abrindo
    ctx.save();
    ctx.translate(-95, -22);
    ctx.rotate(-openP * 1.15);
    VB.celBox(ctx, -8, -18, 206, 26, 10, "#0284C7", 6, 0.18);
    ctx.restore();

    ctx.restore();
  };

  // Porta interativa abrindo com feixe de luz
  VB.drawAnimatedDoor = function (ctx, x, y, w, h, progress, label = "ADMIN") {
    ctx.save();
    const openP = Math.max(0, Math.min(1, (progress - 0.1) / 0.55));
    // Batente e interior iluminado
    VB.celBox(ctx, x - 12, y - 12, w + 24, h + 12, 14, "#334155", 6, 0);
    const glow = ctx.createLinearGradient(x, y, x + w, y + h);
    glow.addColorStop(0, "#FEF08A");
    glow.addColorStop(1, "#38BDF8");
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);

    // Folha da porta girando em perspectiva
    const leafW = Math.max(18, w * (1 - openP * 0.78));
    VB.celBox(ctx, x, y, leafW, h, 8, "#7C2D12", 6, 0.24);
    ctx.beginPath();
    ctx.arc(x + leafW - 16, y + h * 0.52, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD426";
    ctx.fill();
    ctx.stroke();

    if (label) {
      VB.celBox(ctx, x + w / 2 - 74, y - 54, 148, 40, 12, "#1E1B4B", 5, 0);
      strokedText(ctx, label, x + w / 2, y - 33, 22, "#FFD426", 5);
    }
    ctx.restore();
  };

  // Nuvens em parallax suave na zona segura (respeita Y >= 305 ou céu livre)
  VB.drawParallaxClouds = function (ctx, W, t, baseY = 335, scale = 1) {
    ctx.save();
    [0, 1, 2].forEach((i) => {
      const speed = 22 + i * 11;
      const cx = ((i * 390 + t * speed) % (W + 260)) - 130;
      const cy = baseY + (i % 2) * 44;
      VB.celBox(ctx, cx, cy, 165 * scale, 52 * scale, 26 * scale, "rgba(255,255,255,0.88)", 5, 0.12);
    });
    ctx.restore();
  };

  VB.renderEnvironment = function (ctx, W, H, envName, t, sceneDur, cena = {}) {
    const isL = W > H;
    const S = isL ? 0.62 : 1.0;
    const progress = sceneDur > 0 ? Math.max(0, Math.min(1, t / sceneDur)) : 0;
    const isThumb = Boolean(VB._isThumb);

    // Helper anti-poluição: exibe o título gigante de gancho apenas nos primeiros 2.5s (ou na thumbnail)
    function drawTimedHookTitles(l1, l2, l3, c2 = "#FFD426", c3 = "#5CE65C") {
      if (!isThumb && t > 2.65) return;
      ctx.save();
      if (!isThumb && t > 2.35) {
        const fade = Math.max(0, 1 - (t - 2.35) / 0.3);
        ctx.globalAlpha = fade;
      }
      strokedText(ctx, l1, W / 2, H * 0.1, Math.round(64 * S), "#FFFFFF", 14);
      strokedText(ctx, l2, W / 2, H * 0.17, Math.round(118 * S), c2, 18);
      strokedText(ctx, l3, W / 2, H * 0.238, Math.round(50 * S), c3, 12);
      ctx.restore();
    }

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
      drawTimedHookTitles(
        cena.titulo_1 || "E SE SUA",
        cena.titulo_2 || "MÃE",
        cena.titulo_3 || "COMEÇASSE A JOGAR ROBLOX?"
      );
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
      drawTimedHookTitles(
        cena.titulo_1 || "E SE O CACHORRO",
        cena.titulo_2 || "CARAMELO",
        cena.titulo_3 || "VIRASSE DONO DO ROBLOX?"
      );
    } else if (envName === "bedroom_duo") {
      const floorY = isL ? H * 0.65 : H * 0.74;
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
      ctx.ellipse(boyX, floorY + (isL ? -10 : 25) * S, (isL ? 245 : 285) * S, (isL ? 165 : 195) * S, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F768BA";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.drawBoy(ctx, {
        x: boyX,
        y: floorY - (isL ? 235 : 220) * S,
        scale: (isL ? 1.3 : 1.46) * S,
        expr: "side_eye",
        pose: "sit",
        holdingTablet: true,
        t,
      });

      VB.drawMom(ctx, {
        x: momX,
        y: floorY - (isL ? 205 : 175) * S + Math.abs(Math.sin(t * 10)) * -18 * S,
        scale: (isL ? 1.3 : 1.46) * S,
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
      const mw = isL ? 880 : Math.min(W - 100, 920 * S);
      const mx = (W - mw) / 2;
      const my = isL ? 54 : 190;
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
    } else if (envName === "escola_hook") {
      drawSunburst(ctx, W, H, t, "#DC2626", "#7F1D1D");
      // Portão escolar em blocos ao fundo
      VB.celBox(ctx, W * 0.1, H * 0.36, 90 * S, 520 * S, 10, "#475569", 6, 0.25);
      VB.celBox(ctx, W * 0.9 - 90 * S, H * 0.36, 90 * S, 520 * S, 10, "#475569", 6, 0.25);
      VB.celBox(ctx, W * 0.08, H * 0.31, W * 0.84, 78 * S, 16, "#1E293B", 6, 0);
      strokedText(ctx, "ESCOLA ESTADUAL OBBY", W / 2, H * 0.33, Math.round(38 * S), "#FFD426", 8);

      const z = (2.25 + Math.min(0.16, t * 0.08)) * S;
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.73, scale: z, expr: "shocked_extreme", pose: "closeup", backpack: true, t });
      strokedText(ctx, "E SE A SUA", W / 2, H * 0.105, Math.round(64 * S), "#FFFFFF", 14);
      strokedText(ctx, "ESCOLA", W / 2, H * 0.175, Math.round(124 * S), "#FFD426", 18);
      strokedText(ctx, "VIRASSE PARKOUR?", W / 2, H * 0.245, Math.round(54 * S), "#5CE65C", 12);
    } else if (envName === "escola_corredor_lava") {
      // Corredor escolar com armários azuis + chão de lava borbulhante + plataformas de basalto
      const lavaY = H * 0.68;
      const wallG = ctx.createLinearGradient(0, 0, 0, lavaY);
      wallG.addColorStop(0, "#1E293B");
      wallG.addColorStop(1, "#334155");
      ctx.fillStyle = wallG;
      ctx.fillRect(0, 0, W, lavaY);

      for (let i = 0; i < 4; i++) {
        const lx = 36 + i * 258;
        VB.celBox(ctx, lx, H * 0.24, 228, 460, 12, "#2563EB", 6, 0.22);
        VB.celBox(ctx, lx + 28, H * 0.28, 172, 16, 6, "#1D4ED8", 4, 0);
        VB.celBox(ctx, lx + 28, H * 0.31, 172, 16, 6, "#1D4ED8", 4, 0);
        VB.celBox(ctx, lx + 178, H * 0.44, 20, 48, 8, "#FACC15", 4, 0);
      }

      // Rio de lava incandescente + zona escura embaixo p/ legenda
      const lavaG = ctx.createLinearGradient(0, lavaY, 0, H);
      lavaG.addColorStop(0, "#FF6B00");
      lavaG.addColorStop(0.32, "#EA580C");
      lavaG.addColorStop(0.75, "#7C2D12");
      lavaG.addColorStop(1, "#1F1224");
      ctx.fillStyle = lavaG;
      ctx.fillRect(0, lavaY, W, H - lavaY);

      for (let b = 0; b < 9; b++) {
        const bx = 90 + b * 112;
        const by = lavaY + 34 + Math.sin(t * 6 + b * 1.3) * 18;
        ctx.beginPath();
        ctx.arc(bx, by, 18 + (b % 3) * 7, 0, Math.PI * 2);
        ctx.fillStyle = b % 2 === 0 ? "#FFD426" : "#FF9E00";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
      }

      // Plataformas de basalto do Obby
      VB.celBox(ctx, 50, lavaY - 40, 390, 74, 16, "#3F3F46", 6, 0.24);
      VB.celBox(ctx, 610, lavaY - 68, 410, 74, 16, "#3F3F46", 6, 0.24);

      VB.drawDiretora(ctx, {
        x: 245,
        y: lavaY - 235,
        scale: 1.05 * S,
        expr: "scream",
        megaphone: true,
        stopwatch: true,
        nametag: "[ADM] Diretora_Brava",
        t,
      });

      const jumpArc = Math.abs(Math.sin(t * 7.5)) * 95;
      VB.drawBoy(ctx, {
        x: 810,
        y: lavaY - 265 - jumpArc,
        scale: 1.02 * S,
        expr: "shocked_extreme",
        pose: "cheer",
        backpack: true,
        nametag: "Você (Atrasado)",
        t,
      });

      // Cronômetro Speedrun no topo direito
      VB.celBox(ctx, W - 365, 86, 330, 82, 22, "#16182D", 6, 0);
      const secLeft = Math.max(0.1, 5.0 - t).toFixed(2);
      strokedText(ctx, `⏱ 00:0${secLeft}`, W - 200, 128, 42, "#FF5733", 8);
    } else if (envName === "escola_sala_matematica") {
      // Sala de aula com lousa de tabuada bem separada da nametag + carteiras sobre ácido verde
      const acidY = H * 0.71;
      ctx.fillStyle = "#3B2F4A";
      ctx.fillRect(0, 0, W, acidY);

      // Lousa escolar verde no alto (abaixo do HUD)
      VB.celBox(ctx, W * 0.08, 305, W * 0.84, 240, 18, "#14532D", 8, 0.14);
      VB.celBox(ctx, W * 0.06, 535, W * 0.88, 24, 8, "#92400E", 6, 0.2);
      strokedText(ctx, "7 x 8 = ?   (ERROU = ÁCIDO!)", W / 2, 415, Math.round(42 * S), "#FFFFFF", 9);

      // Poço de ácido radioativo verde + base escura p/ legenda
      const acidG = ctx.createLinearGradient(0, acidY, 0, H);
      acidG.addColorStop(0, "#84CC16");
      acidG.addColorStop(0.28, "#16A34A");
      acidG.addColorStop(0.75, "#14532D");
      acidG.addColorStop(1, "#0E1726");
      ctx.fillStyle = acidG;
      ctx.fillRect(0, acidY, W, H - acidY);

      for (let b = 0; b < 10; b++) {
        const bx = 80 + b * 102;
        const rise = (t * 75 + b * 29) % 130;
        ctx.beginPath();
        ctx.arc(bx, acidY + 50 - rise * 0.6, 15 + (b % 3) * 5, 0, Math.PI * 2);
        ctx.fillStyle = "#BEF264";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
      }

      // Carteiras flutuantes como blocos de Obby
      [180, 540, 890].forEach((dx, di) => {
        const fy = acidY - 52 + Math.sin(t * 4 + di * 1.6) * 14;
        VB.celBox(ctx, dx - 125, fy, 250, 46, 12, "#D97706", 6, 0.22);
      });

      VB.drawBoy(ctx, {
        x: 540 + Math.sin(t * 9) * 14,
        y: acidY - 245 + Math.sin(t * 4 + 1.6) * 14,
        scale: 1.02 * S,
        expr: "shocked_extreme",
        pose: "cheer",
        backpack: true,
        hp: 35,
        nametag: "Prova_Mortal",
        t,
      });

      // HUD Stage
      VB.celBox(ctx, W * 0.1, 180, W * 0.8, 92, 24, "#16182D", 6, 0);
      strokedText(ctx, "⚙ STAGE 2/10 — AULA DE MATEMÁTICA", W / 2, 227, 35, "#5CE65C", 8);
    } else if (envName === "escola_recreio_patio") {
      const horizonY = H * 0.62;
      const skyG = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyG.addColorStop(0, "#0284C7");
      skyG.addColorStop(1, "#7DD3FC");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, horizonY);

      drawCheckerFloor(ctx, W, H, horizonY, t);

      // Barraca da Cantina VIP mais alta e à esquerda p/ letreiro 100% visível
      VB.celBox(ctx, 56, horizonY - 430, 360, 430, 14, "#FDE68A", 6, 0.16);
      VB.celBox(ctx, 42, horizonY - 455, 388, 68, 14, "#EF4444", 6, 0.2);
      strokedText(ctx, "CANTINA VIP", 236, horizonY - 420, 40, "#FFD426", 8);

      // Pedestal de Checkpoint + Coxinha Lendária brilhante
      VB.isoCube(ctx, 820, horizonY + 25, 185, "#FFE566", "#FFD426", "#D97706", 6);
      const coxY = horizonY - 150 + Math.sin(t * 5) * 16;
      ctx.save();
      ctx.translate(820, coxY);
      ctx.beginPath();
      ctx.moveTo(0, -74);
      ctx.bezierCurveTo(64, -10, 64, 64, 0, 64);
      ctx.bezierCurveTo(-64, 64, -64, -10, 0, -74);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      strokedText(ctx, "✨ COXINHA", 0, -104, 30, "#FFD426", 7);
      ctx.restore();

      const jump = Math.abs(Math.sin(t * 8)) * 45;
      VB.drawBoy(ctx, {
        x: 470,
        y: horizonY - 25 - jump,
        scale: 1.08 * S,
        expr: "star_eyes",
        pose: "cheer",
        backpack: true,
        nametag: "Zerou_O_Pátio",
        t,
      });

      VB.celBox(ctx, W * 0.08, 180, W * 0.84, 108, 26, "#16182D", 6, 0);
      strokedText(ctx, "🏆 CHECKPOINT DESBLOQUEADO!", W / 2, 218, 36, "#FFD426", 8);
      strokedText(ctx, "+1 Coxinha Lendária (+100 Stamina)", W / 2, 262, 34, "#5CE65C", 7);
    } else if (envName === "escola_cta") {
      drawSunburst(ctx, W, H, t, "#2563EB", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawDiretora(ctx, { x: W * 0.28, y: H * 0.56, scale: 1.18 * S, expr: "shocked_extreme", stopwatch: true, t });
      VB.drawBoy(ctx, { x: W * 0.71, y: H * 0.56, scale: 1.24 * S, expr: "star_eyes", pose: "cheer", backpack: true, nametag: "Nota_10", t });
      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(76 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"ESCOLA\" 🏫", W / 2, H * 0.19, Math.round(114 * S), "#FFD426", 18);
    } else if (envName === "pix_hook") {
      drawSunburst(ctx, W, H, t, "#10B981", "#064E3B");
      for (let c = 0; c < 8; c++) {
        const seed = (c * 73) % 97;
        const cx = 110 + c * 122 + Math.sin(t * 3 + seed) * 18;
        const cy = H * 0.62 - ((t * 140 + seed * 8) % 520);
        const flip = Math.max(0.25, Math.abs(Math.cos(t * 6 + c)));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(flip, 1);
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD426";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
        strokedText(ctx, "$", 0, 2, 38, "#92400E", 0);
        ctx.restore();
      }
      VB.celBox(ctx, W * 0.14, H * 0.295, W * 0.72, 88, 24, "#16182D", 6, 0);
      const val = 1 + Math.floor(t * 12);
      strokedText(ctx, `💸 Pix recebido: +R$ ${val},00`, W / 2, H * 0.318, 40, "#5CE65C", 8);

      const z = (2.22 + Math.min(0.16, t * 0.08)) * S;
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.73, scale: z, expr: "star_eyes", pose: "closeup", goldenShoes: true, t });
      strokedText(ctx, "E SE CADA PASSO", W / 2, H * 0.105, Math.round(62 * S), "#FFFFFF", 14);
      strokedText(ctx, "DESSE 1 REAL", W / 2, H * 0.175, Math.round(108 * S), "#FFD426", 18);
      strokedText(ctx, "NO PIX NA HORA?", W / 2, H * 0.242, Math.round(54 * S), "#5CE65C", 12);
    } else if (envName === "pix_sala_madrugada") {
      // Sala brasileira às 03:14 da manhã
      const floorY = H * 0.68;
      for (let x = 0, i = 0; x < W; x += 84, i++) {
        ctx.fillStyle = i % 2 === 0 ? "#1E1B4B" : "#27235E";
        ctx.fillRect(x, 0, 85, floorY);
      }
      ctx.fillStyle = "#13112B";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Janela noturna com lua (abaixo do HUD)
      VB.celBox(ctx, W - 360, 338, 290, 230, 14, "#F8FAFC", 6, 0);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(W - 342, 356, 254, 194);
      ctx.beginPath();
      ctx.arc(W - 215, 430, 36, 0, Math.PI * 2);
      ctx.fillStyle = "#FEF08A";
      ctx.fill();

      // Sofá no meio da sala
      VB.celBox(ctx, 180, floorY - 180, 420, 175, 28, "#7C3AED", 6, 0.22);

      const runX = 330 + Math.sin(t * 9) * 145;
      const bounce = Math.abs(Math.cos(t * 18)) * 34;
      VB.drawBoy(ctx, {
        x: runX,
        y: floorY - 190 - bounce,
        scale: 1.08 * S,
        expr: "star_eyes",
        pose: "cheer",
        goldenShoes: true,
        nametag: "+R$1 +R$1 +R$1",
        t,
      });

      VB.drawMom(ctx, {
        x: 825,
        y: floorY - 185,
        scale: 1.12 * S,
        expr: "scream",
        pose: "stand",
        nametag: "Mãe (Acordou 03:14)",
        t,
      });

      VB.celBox(ctx, W * 0.08, 180, W * 0.84, 112, 26, "#16182D", 6, 0);
      const steps = 4820 + Math.floor(t * 28);
      strokedText(ctx, `📱 03:14 DA MANHÃ • Passos: ${steps}`, W / 2, 219, 35, "#FFFFFF", 7);
      strokedText(ctx, `💸 Saldo Pix: R$ ${steps},00`, W / 2, 263, 40, "#5CE65C", 8);
    } else if (envName === "pix_padaria") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);

      // Esteira ergométrica na porta da padaria!
      VB.celBox(ctx, 110, roadY + 38, 390, 56, 18, "#1E293B", 6, 0.2);
      VB.celBox(ctx, 430, roadY - 140, 26, 185, 10, "#475569", 6, 0.2);
      VB.celBox(ctx, 395, roadY - 160, 96, 36, 10, "#0F172A", 5, 0);

      const stepBounce = Math.abs(Math.sin(t * 16)) * 28;
      VB.drawBoy(ctx, {
        x: 295,
        y: roadY - 210 - stepBounce,
        scale: 1.06 * S,
        expr: "star_eyes",
        pose: "cheer",
        goldenShoes: true,
        breadBag: true,
        nametag: "Esteira_Infinita",
        t,
      });

      VB.drawPadeiro(ctx, {
        x: 785,
        y: roadY - 195,
        scale: 1.08 * S,
        expr: "shocked_extreme",
        nametag: "Seu_Zé_Padeiro",
        t,
      });

      VB.celBox(ctx, W * 0.07, 188, W * 0.86, 116, 26, "#16182D", 6, 0);
      strokedText(ctx, "🧾 COMPRA APROVADA NO PASSO-PAY", W / 2, 228, 35, "#FFD426", 8);
      strokedText(ctx, "400 Pães de Queijo = 1.200 Passos!", W / 2, 274, 37, "#5CE65C", 8);
    } else if (envName === "pix_brasil_correndo") {
      const roadY = H * 0.65;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);

      const b1 = Math.abs(Math.sin(t * 15)) * 34;
      const b2 = Math.abs(Math.cos(t * 15)) * 34;
      VB.drawMom(ctx, { x: 215, y: roadY - 185 - b2, scale: 0.94 * S, expr: "star_eyes", pose: "cheer", nametag: "Mãe_Corredora", t });
      VB.drawBoy(ctx, { x: 535, y: roadY - 175 - b1, scale: 1.02 * S, expr: "happy", pose: "cheer", goldenShoes: true, nametag: "Você_Turbo", t });
      VB.drawCaramelo(ctx, { x: 845, y: roadY - 95 - b2, scale: 1.08 * S, sunglasses: true, pose: "cheer", nametag: "Caramelo_Pix", t });

      VB.celBox(ctx, W * 0.06, 186, W * 0.88, 128, 28, "#16182D", 6, 0);
      strokedText(ctx, "⚙ ALERTA CRÍTICO — SISTEMA PIX 🔥", W / 2, 228, 36, "#FF5733", 8);
      strokedText(ctx, "213 milhões correndo • Servidor travou!", W / 2, 278, 36, "#FFD426", 8);
    } else if (envName === "pix_cta") {
      drawSunburst(ctx, W, H, t, "#F59E0B", "#78350F");
      drawSpeedLines(ctx, W, H, t);
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.55, scale: 1.48 * S, expr: "star_eyes", pose: "cheer", goldenShoes: true, breadBag: true, nametag: "👑 Magnata_Do_Pix", t });
      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(76 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"PIX\" 💸", W / 2, H * 0.19, Math.round(122 * S), "#5CE65C", 18);
    } else if (envName === "vo_hook") {
      drawSunburst(ctx, W, H, t, "#9333EA", "#4C1D95");
      const z = (2.18 + Math.min(0.15, t * 0.08)) * S;
      VB.drawVovo(ctx, {
        x: W * 0.5,
        y: H * 0.74,
        scale: z,
        expr: "happy",
        pose: "closeup",
        crown: true,
        holdingPot: true,
        t,
      });
      VB.celBox(ctx, W * 0.16, H * 0.292, W * 0.68, 72, 22, "#16182D", 5.5, 0);
      strokedText(ctx, "👑 [OWNER] Vó_Admin • Lvl 999", W / 2, H * 0.312, 35, "#FFD426", 7);

      strokedText(ctx, "E SE A CASA DA", W / 2, H * 0.105, Math.round(62 * S), "#FFFFFF", 14);
      strokedText(ctx, "SUA VÓ", W / 2, H * 0.175, Math.round(118 * S), "#FF66B2", 18);
      strokedText(ctx, "TIVESSE REGRAS ROBLOX?", W / 2, H * 0.242, Math.round(46 * S), "#FFD426", 12);
    } else if (envName === "vo_prato_comida") {
      // Sala de jantar aconchegante da Vó + mesa com montanha colossal de comida
      const floorY = H * 0.68;
      const wallG = ctx.createLinearGradient(0, 0, 0, floorY);
      wallG.addColorStop(0, "#7C2D12");
      wallG.addColorStop(1, "#9A3412");
      ctx.fillStyle = wallG;
      ctx.fillRect(0, 0, W, floorY);

      ctx.fillStyle = "#291816";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Quadrinho de crochê na parede
      VB.celBox(ctx, W * 0.38, 340, 260, 170, 18, "#FEF3C7", 6, 0.12);
      strokedText(ctx, "LAR DOCE LAR ♥", W * 0.5, 425, 28, "#BE123C", 0);

      VB.drawVovo(ctx, {
        x: 255,
        y: floorY - 190,
        scale: 1.12 * S,
        expr: "happy",
        woodenSpoon: true,
        nametag: "Vó_Cozinheira",
        t,
      });

      VB.drawBoy(ctx, {
        x: 825 + Math.sin(t * 36) * 5,
        y: floorY - 185,
        scale: 1.08 * S,
        expr: "shocked_extreme",
        hp: 5,
        nametag: "Neto (99% Cheio)",
        t,
      });

      // Mesa com toalha xadrez + Montanha gigante de arroz e feijão no meio
      VB.celBox(ctx, 295, floorY - 78, 490, 145, 20, "#DC2626", 6, 0.22);
      VB.celBox(ctx, 315, floorY - 68, 450, 34, 10, "#FEF2F2", 5, 0);
      // Prato + montanha de comida
      ctx.beginPath();
      ctx.arc(540, floorY - 108, 108, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#F8FAFC";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(540, floorY - 132, 76, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#78350F";
      ctx.fill();
      ctx.stroke();
      VB.celBox(ctx, 430, floorY - 108, 220, 26, 12, "#E2E8F0", 6, 0);

      // HUD Barra de Vida Crítica no topo
      VB.celBox(ctx, W * 0.07, 186, W * 0.86, 120, 26, "#16182D", 6, 0);
      strokedText(ctx, "❤ VIDA: 1% — DANO CRÍTICO!", W / 2, 228, 38, "#FF5733", 8);
      strokedText(ctx, "Motivo: Tentou recusar o 2º prato da Vó", W / 2, 274, 33, "#FFD426", 7);
    } else if (envName === "vo_pote_sorvete") {
      // Cozinha da Vó com geladeira aberta brilhando + Pote de Sorvete Napolitano revelando Feijão!
      const benchY = H * 0.66;
      ctx.fillStyle = "#4A1D4A";
      ctx.fillRect(0, 0, W, benchY);
      ctx.fillStyle = "#231229";
      ctx.fillRect(0, benchY, W, H - benchY);

      // Geladeira aberta à esquerda emitindo brilho dourado
      VB.celBox(ctx, 55, 360, 330, 640, 24, "#F8FAFC", 7, 0.16);
      VB.celBox(ctx, 82, 395, 276, 560, 16, "#FEF08A", 5, 0);

      // Pote de Sorvete 2L gigante sobre a bancada abrindo a tampa!
      const lidLift = Math.min(85, 20 + Math.abs(Math.sin(t * 4)) * 65);
      VB.celBox(ctx, 355, benchY - 220, 350, 225, 28, "#F8FAFC", 7, 0.2);
      VB.celBox(ctx, 375, benchY - 160, 310, 82, 14, "#F472B6", 5, 0);
      strokedText(ctx, "SORVETE 2L", 530, benchY - 118, 38, "#FFFFFF", 7);

      // Conteúdo marrom de Feijão saindo do pote!
      ctx.beginPath();
      ctx.ellipse(530, benchY - 222, 152, 42, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#78350F";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Tampa subindo
      ctx.save();
      ctx.translate(530, benchY - 275 - lidLift);
      ctx.rotate(-0.14);
      VB.celBox(ctx, -185, -20, 370, 38, 14, "#EC4899", 6, 0.2);
      ctx.restore();

      VB.drawBoy(ctx, {
        x: 875,
        y: benchY - 180,
        scale: 1.06 * S,
        expr: "shocked_extreme",
        nametag: "Iludido_De_Novo",
        t,
      });

      VB.celBox(ctx, W * 0.06, 186, W * 0.88, 122, 26, "#16182D", 6, 0);
      strokedText(ctx, "✨ BAÚ MÍTICO ABERTO NA GELADEIRA", W / 2, 226, 34, "#FF66B2", 8);
      strokedText(ctx, "Item obtido: 🫘 Feijão Congelado (99%)", W / 2, 274, 36, "#FFD426", 8);
    } else if (envName === "vo_abraco_saida") {
      // Portão com barreira laser roxa de Boss + Vó dando abraço e R$50 escondido!
      const roadY = H * 0.67;
      const skyG = ctx.createLinearGradient(0, 0, 0, roadY);
      skyG.addColorStop(0, "#3B0764");
      skyG.addColorStop(1, "#6B21A8");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, roadY);
      drawStuddedStreet(ctx, W, H, roadY);

      // Portão com feixes laser rosa bloqueando a saída
      VB.celBox(ctx, 90, 390, 64, 580, 12, "#475569", 6, 0.25);
      VB.celBox(ctx, W - 154, 390, 64, 580, 12, "#475569", 6, 0.25);
      for (let l = 0; l < 4; l++) {
        ctx.fillStyle = "rgba(244, 114, 182, 0.45)";
        ctx.fillRect(154, 450 + l * 110, W - 308, 22);
      }

      VB.drawVovo(ctx, {
        x: 345,
        y: roadY - 190,
        scale: 1.15 * S,
        expr: "happy",
        pose: "cheer",
        moneyNote: true,
        nametag: "Vó_Generosa",
        t,
      });

      VB.drawBoy(ctx, {
        x: 735,
        y: roadY - 185,
        scale: 1.12 * S,
        expr: "star_eyes",
        pose: "cheer",
        nametag: "+R$ 50 Escondido!",
        t,
      });

      VB.celBox(ctx, W * 0.06, 186, W * 0.88, 126, 26, "#16182D", 6, 0);
      strokedText(ctx, "🔒 MISSÃO OBRIGATÓRIA DE SAÍDA", W / 2, 226, 35, "#FFD426", 8);
      strokedText(ctx, "[✓] 1 Abraço   [✓] Guardar R$ 50 no bolso", W / 2, 274, 34, "#5CE65C", 8);
    } else if (envName === "vo_cta") {
      drawSunburst(ctx, W, H, t, "#7C3AED", "#3B0764");
      drawSpeedLines(ctx, W, H, t);
      VB.drawVovo(ctx, { x: W * 0.31, y: H * 0.56, scale: 1.22 * S, expr: "happy", crown: true, holdingPot: true, t });
      VB.drawBoy(ctx, { x: W * 0.71, y: H * 0.57, scale: 1.2 * S, expr: "star_eyes", pose: "cheer", t });
      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(76 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"VÓ\" 👵", W / 2, H * 0.19, Math.round(122 * S), "#FF66B2", 18);
    } else if (envName === "chinelo_hook") {
      drawSunburst(ctx, W, H, t, "#EA580C", "#581C87");
      const z = (2.18 + Math.min(0.15, t * 0.08)) * S;
      VB.drawMom(ctx, { x: W * 0.5, y: H * 0.74, scale: z, expr: "scream", pose: "closeup", crown: true, t });
      VB.drawChinelo(ctx, W * 0.8, H * 0.44 + Math.sin(t * 8) * 18, 1.35 * S, -0.45 + Math.sin(t * 6) * 0.15, true);
      VB.celBox(ctx, W * 0.14, H * 0.292, W * 0.72, 74, 22, "#16182D", 5.5, 0);
      strokedText(ctx, "⚡ ITEM MÍTICO • Precisão: 999%", W / 2, H * 0.312, 35, "#FFD426", 7);

      strokedText(ctx, "E SE O CHINELO", W / 2, H * 0.105, Math.round(62 * S), "#FFFFFF", 14);
      strokedText(ctx, "DA SUA MÃE", W / 2, H * 0.175, Math.round(104 * S), "#FFD426", 18);
      strokedText(ctx, "FOSSE ITEM MÍTICO?", W / 2, H * 0.242, Math.round(52 * S), "#5CE65C", 12);
    } else if (envName === "chinelo_mira_laser") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#312E81";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#17153B";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Geladeira + Frango Congelado em bloco de gelo azul!
      VB.celBox(ctx, 430, 385, 220, 420, 20, "#E2E8F0", 6, 0.18);
      VB.celBox(ctx, 455, floorY - 125, 170, 110, 16, "#38BDF8", 6, 0.2);
      strokedText(ctx, "❄ FRANGO", 540, floorY - 70, 30, "#FFFFFF", 6);

      VB.drawMom(ctx, { x: 210, y: floorY - 185, scale: 1.1 * S, expr: "scream", pose: "cheer", nametag: "[BOSS] Mãe_Sniper", t });
      VB.drawChinelo(ctx, 395, floorY - 385 + Math.sin(t * 10) * 12, 0.92 * S, -0.25, true);

      VB.drawBoy(ctx, { x: 840, y: floorY - 185, scale: 1.08 * S, expr: "shocked_extreme", hp: 100, nametag: "Alvo_Travado", t });

      // Linha laser de mira vermelha travada no Menino!
      ctx.save();
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 6;
      ctx.setLineDash([18, 12]);
      ctx.beginPath();
      ctx.moveTo(405, floorY - 375);
      ctx.lineTo(840, floorY - 260);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(840, floorY - 260, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      VB.celBox(ctx, W * 0.08, 180, W * 0.84, 110, 26, "#16182D", 6, 0);
      strokedText(ctx, "🎯 MIRA AUTOMÁTICA ATIVADA!", W / 2, 218, 36, "#FF5733", 8);
      strokedText(ctx, "Missão falha: Frango continua congelado", W / 2, 262, 32, "#FFD426", 7);
    } else if (envName === "chinelo_curva_corredor") {
      // Corredor em L onde o chinelo faz curva de 90 graus!
      const floorY = H * 0.69;
      ctx.fillStyle = "#3B2F4A";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#1E162B";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Parede de quina no meio do corredor
      VB.celBox(ctx, 470, 320, 140, floorY - 320, 10, "#64748B", 7, 0.28);

      // Trilha curva neon amarela/rosa fazendo 90 graus ao redor da quina!
      ctx.save();
      ctx.strokeStyle = "#FFD426";
      ctx.lineWidth = 14;
      ctx.setLineDash([24, 14]);
      ctx.beginPath();
      ctx.moveTo(120, 560);
      ctx.quadraticCurveTo(540, 320, 760, 620);
      ctx.stroke();
      ctx.restore();

      const prog = (t * 0.85) % 1;
      const cx = (1 - prog) * (1 - prog) * 140 + 2 * (1 - prog) * prog * 540 + prog * prog * 740;
      const cy = (1 - prog) * (1 - prog) * 560 + 2 * (1 - prog) * prog * 340 + prog * prog * 620;
      VB.drawChinelo(ctx, cx, cy, 1.15 * S, t * 14, true);

      VB.drawBoy(ctx, { x: 845, y: floorY - 185, scale: 1.08 * S, expr: "shocked_extreme", nametag: "Escondido (Inútil)", t });

      VB.celBox(ctx, W * 0.06, 180, W * 0.88, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "⚙ FÍSICA DO ROBLOX QUEBRADA!", W / 2, 218, 36, "#FFD426", 8);
      strokedText(ctx, "Chinelo Teleguiado dobrou 90° no corredor!", W / 2, 262, 32, "#5CE65C", 7);
    } else if (envName === "chinelo_escudo_vo") {
      // Crossover épico: Vó ativando escudo dourado protetor contra o chinelo!
      const floorY = H * 0.68;
      drawSunburst(ctx, W, H, t, "#6B21A8", "#3B0764");
      ctx.fillStyle = "#191028";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.drawVovo(ctx, { x: 460, y: floorY - 185, scale: 1.14 * S, expr: "happy", crown: true, woodenSpoon: true, nametag: "👑 Vó_Protetora", t });
      VB.drawBoy(ctx, { x: 825, y: floorY - 180, scale: 1.04 * S, expr: "star_eyes", pose: "cheer", nametag: "Neto_Imune", t });

      // Domo de Escudo Dourado protetor acima da coroa e nametags!
      ctx.save();
      ctx.beginPath();
      ctx.arc(640, floorY - 205, 405, Math.PI * 0.94, Math.PI * 1.66);
      ctx.lineWidth = 16;
      ctx.strokeStyle = "#FFD426";
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
      ctx.restore();

      // Chinelo ricocheteando no escudo!
      VB.drawChinelo(ctx, 210, floorY - 320 + Math.sin(t * 18) * 20, 1.1 * S, -1.2 + t * 8, true);

      VB.celBox(ctx, W * 0.06, 180, W * 0.88, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🛡 DEFESA SUPREMA DESBLOQUEADA!", W / 2, 218, 35, "#FFD426", 8);
      strokedText(ctx, "Escudo da Vó bloqueia 100% de dano!", W / 2, 262, 34, "#5CE65C", 7);
    } else if (envName === "chinelo_cta") {
      drawSunburst(ctx, W, H, t, "#D97706", "#4C1D95");
      drawSpeedLines(ctx, W, H, t);
      VB.drawMom(ctx, { x: W * 0.25, y: H * 0.56, scale: 1.12 * S, expr: "scream", t });
      VB.drawVovo(ctx, { x: W * 0.52, y: H * 0.56, scale: 1.14 * S, expr: "happy", crown: true, t });
      VB.drawBoy(ctx, { x: W * 0.78, y: H * 0.57, scale: 1.12 * S, expr: "star_eyes", pose: "cheer", t });
      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(76 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"CHINELO\" 🩴", W / 2, H * 0.19, Math.round(110 * S), "#FFD426", 18);
    } else if (envName === "mercado_hook") {
      drawSunburst(ctx, W, H, t, "#DC2626", "#7F1D1D");
      const z = (2.18 + Math.min(0.15, t * 0.08)) * S;
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.74, scale: z, expr: "shocked_extreme", pose: "closeup", t });
      VB.celBox(ctx, W * 0.14, H * 0.292, W * 0.72, 74, 22, "#16182D", 5.5, 0);
      strokedText(ctx, "🛒 CARRINHO CHEIO • Saldo: R$ 0,00", W / 2, H * 0.312, 34, "#FF5733", 7);

      strokedText(ctx, "SUA MÃE SUMIU", W / 2, H * 0.105, Math.round(62 * S), "#FFFFFF", 14);
      strokedText(ctx, "NA FILA DO", W / 2, H * 0.175, Math.round(104 * S), "#FFD426", 18);
      strokedText(ctx, "MERCADO?!", W / 2, H * 0.242, Math.round(68 * S), "#5CE65C", 14);
    } else if (envName === "mercado_mae_corredor") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#FEF3C7";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Prateleiras de supermercado cheias de produtos coloridos (bem abaixo do HUD Y>=360)
      for (let row = 0; row < 3; row++) {
        const sy = 425 + row * 145;
        VB.celBox(ctx, 60, sy, 420, 26, 8, "#64748B", 5, 0);
        for (let p = 0; p < 5; p++) {
          VB.celBox(ctx, 82 + p * 78, sy - 60, 58, 60, 10, p % 2 === 0 ? "#EF4444" : "#3B82F6", 5, 0.2);
        }
      }

      // Mãe sumindo pequena lá no fundo à direita!
      VB.drawMom(ctx, { x: 845, y: floorY - 220, scale: 0.72 * S, expr: "happy", pose: "cheer", nametag: "Mãe (Foi no Corredor 99)", t });

      // Menino sozinho segurando o carrinho cheio
      VB.drawBoy(ctx, { x: 310, y: floorY - 185, scale: 1.12 * S, expr: "shocked_extreme", nametag: "Sozinho_Na_Fila", t });
      VB.celBox(ctx, 435, floorY - 125, 220, 120, 16, "#94A3B8", 6, 0.2);
      strokedText(ctx, "🛒 COMPRAS", 545, floorY - 65, 28, "#0F172A", 0);

      VB.celBox(ctx, W * 0.07, 180, W * 0.86, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "⚠ MISSÃO DE SOBREVIVÊNCIA ATIVADA", W / 2, 218, 34, "#FFD426", 8);
      strokedText(ctx, "Mãe saiu da fila • Sua vez está chegando!", W / 2, 262, 32, "#FF5733", 7);
    } else if (envName === "mercado_caixa_laser") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Esteira preta do caixa passando produtos
      VB.celBox(ctx, 180, floorY - 90, 560, 120, 16, "#334155", 6, 0.22);
      VB.celBox(ctx, 210, floorY - 108, 490, 26, 8, "#111827", 5, 0);
      VB.celBox(ctx, 360 - ((t * 120) % 140), floorY - 165, 64, 58, 10, "#F59E0B", 5, 0.2);

      VB.drawCaixa(ctx, { x: 815, y: floorY - 190, scale: 1.12 * S, expr: "side_eye", scanner: true, nametag: "[BOSS] Caixa_Turbo", t });
      VB.drawBoy(ctx, { x: 235 + Math.sin(t * 40) * 6, y: floorY - 185, scale: 1.08 * S, expr: "shocked_extreme", hp: 10, nametag: "R$ 0,00 no Bolso!", t });

      VB.celBox(ctx, W * 0.06, 180, W * 0.88, 116, 26, "#16182D", 6, 0);
      const totalVal = (412 + t * 24).toFixed(2).replace(".", ",");
      strokedText(ctx, `🚨 BIP! BIP! TOTAL: R$ ${totalVal}`, W / 2, 218, 38, "#FF5733", 8);
      strokedText(ctx, "Faltam 2 itens • Cadê a Mãe?!", W / 2, 264, 34, "#FFD426", 7);
    } else if (envName === "mercado_resgate_epico") {
      drawSunburst(ctx, W, H, t, "#10B981", "#064E3B");
      const floorY = H * 0.68;
      ctx.fillStyle = "#0D1F1A";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.drawMom(ctx, { x: 315, y: floorY - 190, scale: 1.16 * S, expr: "star_eyes", pose: "cheer", crown: true, nametag: "👑 Mãe_Salvadora", t });
      // Cartão dourado brilhando na mão da Mãe!
      VB.celBox(ctx, 435, floorY - 220, 110, 72, 12, "#FFD426", 6, 0.15);
      strokedText(ctx, "VIP", 490, floorY - 184, 28, "#78350F", 0);

      VB.drawBoy(ctx, { x: 765, y: floorY - 185, scale: 1.1 * S, expr: "star_eyes", pose: "cheer", nametag: "Ufa_Salvo!", t });

      VB.celBox(ctx, W * 0.07, 180, W * 0.86, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "✅ RESGATE NO ÚLTIMO SEGUNDO!", W / 2, 218, 36, "#5CE65C", 8);
      strokedText(ctx, "Pagamento Aprovado • Você sobreviveu!", W / 2, 262, 33, "#FFD426", 7);
    } else if (envName === "mercado_cta") {
      drawSunburst(ctx, W, H, t, "#2563EB", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawMom(ctx, { x: W * 0.28, y: H * 0.56, scale: 1.18 * S, expr: "happy", crown: true, t });
      VB.drawBoy(ctx, { x: W * 0.72, y: H * 0.56, scale: 1.22 * S, expr: "star_eyes", pose: "cheer", t });
      strokedText(ctx, "COMENTA:", W / 2, H * 0.11, Math.round(76 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"MERCADO\" 🛒", W / 2, H * 0.19, Math.round(108 * S), "#FFD426", 18);
    } else if (envName === "bateria_hook") {
      drawSunburst(ctx, W, H, t, "#16A34A", "#14532D");
      const z = (2.18 + Math.min(0.15, t * 0.08)) * S;
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.74, scale: z, expr: "shocked_extreme", pose: "closeup", holdingTablet: true, t });

      VB.celBox(ctx, W * 0.16, H * 0.292, W * 0.68, 74, 22, "#16182D", 5.5, 0);
      strokedText(ctx, "🔋 BATERIA 12% = VIDA CRÍTICA!", W / 2, H * 0.312, 35, "#FF5733", 7);

      strokedText(ctx, "SUA BATERIA =", W / 2, H * 0.105, Math.round(64 * S), "#FFFFFF", 14);
      strokedText(ctx, "SUA VIDA", W / 2, H * 0.175, Math.round(116 * S), "#5CE65C", 18);
      strokedText(ctx, "NO ROBLOX!", W / 2, H * 0.242, Math.round(64 * S), "#FFD426", 14);
    } else if (envName === "bateria_rua_sol") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);

      const curHp = Math.max(8, 60 - Math.floor(t * 14));
      VB.drawBoy(ctx, {
        x: 685,
        y: roadY - 115,
        scale: 1.06 * S,
        expr: "shocked_extreme",
        holdingTablet: true,
        hp: curHp,
        nametag: `Bateria: ${curHp}%`,
        t,
      });

      VB.celBox(ctx, W * 0.07, 180, W * 0.86, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "☀ BRILHO NO MÁXIMO = DANO SOLAR!", W / 2, 218, 35, "#FFD426", 8);
      strokedText(ctx, "-40% de Vida instantâneo no sol!", W / 2, 262, 35, "#FF5733", 8);
    } else if (envName === "bateria_disputa_tomada") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#312E81";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#14122E";
      ctx.fillRect(0, floorY, W, H - floorY);

      // Única tomada sagrada brilhando no centro da parede!
      ctx.beginPath();
      ctx.arc(540, floorY - 190, 95 + Math.sin(t * 10) * 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 212, 38, 0.28)";
      ctx.fill();
      VB.celBox(ctx, 485, floorY - 255, 110, 135, 20, "#F8FAFC", 6, 0.15);
      [-22, 22].forEach((px) => {
        ctx.beginPath();
        ctx.arc(540 + px, floorY - 188, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#0F172A";
        ctx.fill();
      });

      VB.drawMom(ctx, { x: 245, y: floorY - 185, scale: 1.1 * S, expr: "scream", pose: "cheer", nametag: "Mãe (2% Bateria!)", t });
      VB.drawBoy(ctx, { x: 835, y: floorY - 185, scale: 1.08 * S, expr: "shocked_extreme", hp: 4, nametag: "Você (4% Bateria!)", t });

      VB.celBox(ctx, W * 0.06, 180, W * 0.88, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "⚡ ÚLTIMA TOMADA DA CASA — PvP ON!", W / 2, 218, 35, "#FFD426", 8);
      strokedText(ctx, "Quem desligar chega a 0% de vida!", W / 2, 262, 34, "#FF5733", 7);
    } else if (envName === "bateria_powerbank_vip") {
      drawSunburst(ctx, W, H, t, "#22C55E", "#065F46");
      const floorY = H * 0.68;
      ctx.fillStyle = "#08221B";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.drawBoy(ctx, {
        x: 420,
        y: floorY - 195 - Math.abs(Math.sin(t * 10)) * 28,
        scale: 1.18 * S,
        expr: "star_eyes",
        pose: "cheer",
        goldenShoes: true,
        backpack: true,
        hp: 100,
        nametag: "⚡ Bateria_999%",
        t,
      });

      VB.drawCaramelo(ctx, {
        x: 810,
        y: floorY - 110,
        scale: 1.12 * S,
        crown: true,
        sunglasses: true,
        pose: "cheer",
        nametag: "Pet_Carregado",
        t,
      });

      VB.celBox(ctx, W * 0.06, 180, W * 0.88, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🔋 POWERBANK LENDÁRIO EQUIPADO!", W / 2, 218, 35, "#5CE65C", 8);
      strokedText(ctx, "Modo Imortal Ativado (+99.000 mAh)", W / 2, 262, 34, "#FFD426", 7);
    } else if (envName === "bateria_cta") {
      drawSunburst(ctx, W, H, t, "#10B981", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.55, scale: 1.44 * S, expr: "star_eyes", pose: "cheer", goldenShoes: true, holdingTablet: true, nametag: "Qual sua % agora?", t });
      strokedText(ctx, "COMENTA AGORA:", W / 2, H * 0.11, Math.round(70 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "SUA BATERIA % 🔋", W / 2, H * 0.19, Math.round(92 * S), "#5CE65C", 18);
    } else if (envName === "longo_dia1_rua") {
      // Cenas responsivas 16:9 Widescreen (1920x1080) para Vídeo Longo!
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);
      VB.drawBoy(ctx, { x: W * 0.34, y: roadY - 70 * S, scale: 1.15 * S, expr: "shocked_extreme", goldenShoes: true, nametag: "Você (Nível 1)", t });
      VB.drawCaramelo(ctx, { x: W * 0.66, y: roadY - 10 * S, scale: 1.25 * S, sunglasses: true, pose: "cheer", nametag: "Caramelo_NPC", t });
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 118, 26, "#16182D", 6, 0);
      strokedText(ctx, "⚙ SERVIDOR BRASIL INICIADO!", W / 2, 74, 36, "#FFD426", 8);
      strokedText(ctx, "213 milhões de jogadores conectados por 7 dias", W / 2, 118, 30, "#5CE65C", 7);
    } else if (envName === "longo_dia2_padaria") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);
      VB.drawBoy(ctx, { x: W * 0.33, y: roadY - 75 * S, scale: 1.15 * S, expr: "star_eyes", breadBag: true, nametag: "Cliente_Faminto", t });
      VB.drawPadeiro(ctx, { x: W * 0.67, y: roadY - 75 * S, scale: 1.18 * S, expr: "happy", nametag: "Seu_Zé (2 Robux = Pão)", t });
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🥖 NOVA ECONOMIA DA PADARIA", W / 2, 74, 35, "#FFD426", 8);
      strokedText(ctx, "1 Pão de Queijo = 2 Robux • Papel banido!", W / 2, 118, 30, "#5CE65C", 7);
    } else if (envName === "longo_dia2_bateria") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);
      const hpNow = Math.max(12, 58 - Math.floor(t * 10));
      VB.drawBoy(ctx, { x: W * 0.52, y: roadY - 135 * S, scale: 1.14 * S, expr: "shocked_extreme", holdingTablet: true, hp: hpNow, nametag: `Bateria: ${hpNow}%`, t });
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "☀ CALOR BRASILEIRO + BRILHO 100%", W / 2, 74, 34, "#FF5733", 8);
      strokedText(ctx, "Celular descarregando drena sua barra de energia!", W / 2, 118, 29, "#FFD426", 7);
    } else if (envName === "longo_dia3_escola") {
      const lavaY = H * 0.68;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, W, lavaY);
      for (let i = 0; i < 6; i++) {
        VB.celBox(ctx, 70 + i * 305, 195, 255, 420, 12, "#2563EB", 6, 0.22);
      }
      const lavaG = ctx.createLinearGradient(0, lavaY, 0, H);
      lavaG.addColorStop(0, "#FF6B00");
      lavaG.addColorStop(0.5, "#C2410C");
      lavaG.addColorStop(1, "#181024");
      ctx.fillStyle = lavaG;
      ctx.fillRect(0, lavaY, W, H - lavaY);

      VB.celBox(ctx, W * 0.16, lavaY - 36, 440, 64, 16, "#3F3F46", 6, 0.24);
      VB.celBox(ctx, W * 0.58, lavaY - 54, 460, 64, 16, "#3F3F46", 6, 0.24);

      VB.drawDiretora(ctx, { x: W * 0.28, y: lavaY - 320 * S, scale: 1.15 * S, expr: "scream", megaphone: true, stopwatch: true, nametag: "[ADM] Diretora_Brava", t });
      VB.drawBoy(ctx, { x: W * 0.7, y: lavaY - 230 * S - Math.abs(Math.sin(t * 7)) * 55, scale: 1.16 * S, expr: "shocked_extreme", pose: "cheer", backpack: true, nametag: "Aluno_No_Obby", t });

      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 110, 26, "#16182D", 6, 0);
      strokedText(ctx, "🌋 ESCOLA ESTADUAL OBBY MORTAL", W / 2, 72, 35, "#FF5733", 8);
      strokedText(ctx, "Quem pisar na lava vai direto pra recuperação!", W / 2, 114, 30, "#FFD426", 7);
    } else if (envName === "longo_dia5_mercado") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.celBox(ctx, W * 0.32, floorY - 82, 620, 110, 16, "#334155", 6, 0.22);
      VB.drawBoy(ctx, { x: W * 0.24, y: floorY - 155 * S, scale: 1.16 * S, expr: "shocked_extreme", hp: 14, nametag: "Sozinho_Sem_Cartão", t });
      VB.drawCaixa(ctx, { x: W * 0.74, y: floorY - 160 * S, scale: 1.18 * S, expr: "side_eye", scanner: true, nametag: "[BOSS] Caixa_Laser", t });

      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "🛒 ARENA DE CHEFÃO — FILA DO MERCADO", W / 2, 74, 34, "#FF5733", 8);
      strokedText(ctx, "Mãe sumiu no corredor • Faltam 2 produtos!", W / 2, 116, 30, "#FFD426", 7);
    } else if (envName === "longo_dia5_chinelo") {
      drawSunburst(ctx, W, H, t, "#EA580C", "#4C1D95");
      const floorY = H * 0.68;
      ctx.fillStyle = "#161026";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.drawMom(ctx, { x: W * 0.28, y: floorY - 160 * S, scale: 1.22 * S, expr: "scream", pose: "cheer", crown: true, nametag: "👑 Mãe_Nível_900", t });
      VB.drawChinelo(ctx, W * 0.5, floorY - 220 + Math.sin(t * 10) * 22, 1.35, t * 8, true);
      VB.drawCaixa(ctx, { x: W * 0.74, y: floorY - 155 * S, scale: 1.15 * S, expr: "shocked_extreme", scanner: false, nametag: "Caixa_Rendida", t });

      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "🩴 ITEM MÍTICO EQUIPADO: CHINELO + CARTÃO VIP", W / 2, 74, 31, "#FFD426", 8);
      strokedText(ctx, "Compra aprovada na hora com respeito máximo!", W / 2, 116, 30, "#5CE65C", 7);
    } else if (envName === "longo_dia6_vo") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#7C2D12";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#241412";
      ctx.fillRect(0, floorY, W, H - floorY);

      VB.drawVovo(ctx, { x: W * 0.3, y: floorY - 165 * S, scale: 1.24 * S, expr: "happy", crown: true, holdingPot: true, nametag: "👑 [SAFE ZONE] Vó_Admin", t });
      VB.celBox(ctx, W * 0.44, floorY - 76, 340, 120, 18, "#DC2626", 6, 0.2);
      VB.drawBoy(ctx, { x: W * 0.72, y: floorY - 160 * S, scale: 1.18 * S, expr: "star_eyes", pose: "cheer", hp: 100, nametag: "HP: 100% Recuperado!", t });

      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "👵 ÁREA SEGURA — CASA DA VÓ", W / 2, 74, 36, "#FF66B2", 8);
      strokedText(ctx, "PvP Desligado • Feijão quentinho cura 100% de vida!", W / 2, 116, 29, "#5CE65C", 7);
    } else if (envName === "longo_dia6_sorvete") {
      const benchY = H * 0.67;
      ctx.fillStyle = "#4A1D4A";
      ctx.fillRect(0, 0, W, benchY);
      ctx.fillStyle = "#1D0F24";
      ctx.fillRect(0, benchY, W, H - benchY);

      VB.celBox(ctx, W * 0.14, 185, 290, 490, 22, "#F8FAFC", 6, 0.16);
      VB.celBox(ctx, W * 0.16, 215, 240, 420, 14, "#FEF08A", 5, 0);

      VB.celBox(ctx, W * 0.41, benchY - 185, 330, 190, 24, "#F8FAFC", 6, 0.2);
      VB.celBox(ctx, W * 0.43, benchY - 135, 280, 72, 12, "#F472B6", 5, 0);
      strokedText(ctx, "SORVETE 2L", W * 0.495, benchY - 98, 34, "#FFFFFF", 6);
      ctx.beginPath();
      ctx.ellipse(W * 0.495, benchY - 186, 142, 36, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#78350F";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.drawBoy(ctx, { x: W * 0.77, y: benchY - 155 * S, scale: 1.18 * S, expr: "shocked_extreme", nametag: "Caiu_No_Bait_Da_Vó", t });

      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 112, 26, "#16182D", 6, 0);
      strokedText(ctx, "✨ BAÚ DA GELADEIRA ABERTO!", W / 2, 74, 35, "#FF66B2", 8);
      strokedText(ctx, "99% de chance: Era Feijão Congelado de novo!", W / 2, 116, 30, "#FFD426", 7);
    } else if (envName === "longo_final_elenco") {
      drawSunburst(ctx, W, H, t, "#7C3AED", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawVovo(ctx, { x: W * 0.2, y: H * 0.56, scale: 1.08 * S, expr: "happy", crown: true, holdingPot: true, t });
      VB.drawMom(ctx, { x: W * 0.39, y: H * 0.56, scale: 1.08 * S, expr: "star_eyes", pose: "cheer", t });
      VB.drawBoy(ctx, { x: W * 0.59, y: H * 0.56, scale: 1.14 * S, expr: "star_eyes", pose: "cheer", goldenShoes: true, t });
      VB.drawCaramelo(ctx, { x: W * 0.8, y: H * 0.61, scale: 1.2 * S, crown: true, sunglasses: true, pose: "cheer", t });

      strokedText(ctx, "INSCREVA-SE NO VIDA DE BLOCO!", W / 2, H * 0.12, 58, "#FFD426", 14);
      strokedText(ctx, "COMENTA \"PARTE 2\" 👇", W / 2, H * 0.22, 68, "#5CE65C", 16);
    } else if (envName === "dti_hook") {
      drawSunburst(ctx, W, H, t, "#EC4899", "#4C1D95");
      drawSpeedLines(ctx, W, H, t);
      strokedText(ctx, "E SE SUA MÃE JOGASSE", W / 2, H * 0.105, Math.round(62 * S), "#FFFFFF", 15);
      strokedText(ctx, "DRESS TO IMPRESS", W / 2, H * 0.175, Math.round(76 * S), "#FFD426", 18);
      strokedText(ctx, "NA VIDA REAL?!", W / 2, H * 0.242, Math.round(68 * S), "#5CE65C", 16);
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.56, scale: 1.65 * S, expr: "shocked_extreme", t });
    } else if (envName === "dti_quarto") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#581C87";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#2E1065";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 110, 22, "#16182D", 6, 0);
      strokedText(ctx, "👗 TEMA: CHURRASCO DE DOMINGO", W / 2, 232, Math.round(34 * S), "#FF66B2", 7);
      strokedText(ctx, "⏱ 10 SEGUNDOS RESTANTES!", W / 2, 276, Math.round(32 * S), "#FFD426", 7);
      VB.drawBoy(ctx, { x: W * 0.5, y: floorY - 120 * S, scale: 1.45 * S, expr: "shocked_extreme", goldenShoes: true, nametag: "Look_Churrasco", t });
    } else if (envName === "dti_passarela_mae") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#831843";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#4C0519";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.fillStyle = "#EC4899";
      ctx.fillRect(W * 0.15, floorY, W * 0.7, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 106, 22, "#16182D", 6, 0);
      strokedText(ctx, "⭐ NOTA DA MÃE: 1 ESTRELA!", W / 2, 232, Math.round(36 * S), "#FF5733", 7);
      strokedText(ctx, "\"Cadê a meia e o casaco?!\"", W / 2, 274, Math.round(28 * S), "#FFFFFF", 6);
      VB.drawBoy(ctx, { x: W * 0.32, y: floorY - 115 * S, scale: 1.25 * S, expr: "shocked_extreme", goldenShoes: true, t });
      VB.drawMom(ctx, { x: W * 0.7, y: floorY - 125 * S, scale: 1.32 * S, expr: "angry", nametag: "Mãe_Jurada", t });
    } else if (envName === "dti_passarela_vo") {
      drawSunburst(ctx, W, H, t, "#F472B6", "#7E22CE");
      const floorY = H * 0.68;
      ctx.fillStyle = "#FBCFE8";
      ctx.fillRect(W * 0.12, floorY, W * 0.76, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 106, 22, "#16182D", 6, 0);
      strokedText(ctx, "👑 VÓ VIP: 5 ESTRELAS!", W / 2, 232, Math.round(38 * S), "#FFD426", 7);
      strokedText(ctx, "Item Mítico: Pano de Prato Capa!", W / 2, 274, Math.round(28 * S), "#5CE65C", 6);
      VB.drawVovo(ctx, { x: W * 0.5, y: floorY - 125 * S, scale: 1.45 * S, expr: "happy", crown: true, holdingPot: true, nametag: "Vó_VIP_5Estrelas", t });
    } else if (envName === "dti_oof_cta") {
      drawSunburst(ctx, W, H, t, "#EC4899", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawBoy(ctx, { x: W * 0.34, y: H * 0.56, scale: 1.25 * S, expr: "shocked_extreme", t });
      VB.drawVovo(ctx, { x: W * 0.68, y: H * 0.56, scale: 1.28 * S, expr: "happy", crown: true, t });
      strokedText(ctx, "COMENTA AGORA:", W / 2, H * 0.11, Math.round(68 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"VIP\" 👇", W / 2, H * 0.19, Math.round(88 * S), "#FFD426", 18);
    } else if (envName === "tsunami_hook") {
      const shake = Math.sin(t * 26) * 7;
      drawSunburst(ctx, W, H, t, "#DC2626", "#1E3A8A");
      drawSpeedLines(ctx, W, H, t);
      strokedText(ctx, "E SE O ÔNIBUS ESCOLAR", W / 2, H * 0.105, Math.round(60 * S), "#FFFFFF", 15);
      strokedText(ctx, "VIRASSE UM TSUNAMI", W / 2, H * 0.175, Math.round(70 * S), "#38BDF8", 18);
      strokedText(ctx, "DO ROBLOX?!", W / 2, H * 0.242, Math.round(74 * S), "#FFD426", 16);
      VB.drawBoy(ctx, { x: W * 0.5 + shake, y: H * 0.56, scale: 1.65 * S, expr: "shocked_extreme", t });
    } else if (envName === "tsunami_fruta") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 106, 22, "#16182D", 6, 0);
      strokedText(ctx, "🍈 FRUTA DA MOCHILA PESADA", W / 2, 232, Math.round(34 * S), "#A855F7", 7);
      strokedText(ctx, "Peso +500kg • Imune a curvas!", W / 2, 274, Math.round(28 * S), "#5CE65C", 6);
      VB.drawBoy(ctx, { x: W * 0.5, y: floorY - 115 * S, scale: 1.42 * S, expr: "star_eyes", goldenShoes: true, nametag: "Mochila_Mítica", t });
    } else if (envName === "tsunami_parkour") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#1E3A8A";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 106, 22, "#16182D", 6, 0);
      strokedText(ctx, "🌊 ESCAPE TSUNAMI: FASE 2", W / 2, 232, Math.round(35 * S), "#38BDF8", 7);
      strokedText(ctx, "Parkour nos bancos do ônibus!", W / 2, 274, Math.round(28 * S), "#FFD426", 6);
      VB.celBox(ctx, W * 0.18, floorY - 70, 200, 70, 14, "#F59E0B", 5, 0);
      VB.celBox(ctx, W * 0.58, floorY - 110, 200, 70, 14, "#F59E0B", 5, 0);
      VB.drawBoy(ctx, { x: W * 0.5, y: floorY - 190 * S, scale: 1.28 * S, expr: "shocked_extreme", pose: "cheer", t });
    } else if (envName === "tsunami_freada") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#7F1D1D";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.08, 195, W * 0.84, 106, 22, "#16182D", 6, 0);
      strokedText(ctx, "🚨 FREADA BRUSCA DETECTADA!", W / 2, 232, Math.round(34 * S), "#FF5733", 7);
      strokedText(ctx, "🎫 Passe do Estudante Mítico Ativado!", W / 2, 274, Math.round(27 * S), "#FFD426", 6);
      VB.drawBoy(ctx, { x: W * 0.5, y: floorY - 115 * S, scale: 1.4 * S, expr: "happy", goldenShoes: true, nametag: "Sobrevivente_VIP", t });
    } else if (envName === "tsunami_cta") {
      drawSunburst(ctx, W, H, t, "#0284C7", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawMotorista(ctx, { x: W * 0.34, y: H * 0.56, scale: 1.24 * S, expr: "happy", nametag: "Motorista_Pro", t });
      VB.drawBoy(ctx, { x: W * 0.68, y: H * 0.56, scale: 1.28 * S, expr: "star_eyes", pose: "cheer", t });
      strokedText(ctx, "COMENTA AGORA:", W / 2, H * 0.11, Math.round(68 * S), "#FFFFFF", 15);
      strokedText(ctx, cena.cta_palavra || "\"ONIBUS\" 👇", W / 2, H * 0.19, Math.round(88 * S), "#FFD426", 18);
    } else if (envName === "brookhaven_hook") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🏠 BROOKHAVEN ATIVADO NO PRÉDIO!", W / 2, 74, 34, "#38BDF8", 8);
      strokedText(ctx, "Qualquer vizinho pode invadir sua casa!", W / 2, 118, 29, "#FFD426", 7);
      VB.drawBoy(ctx, { x: W * 0.5, y: floorY - 140 * S, scale: 1.28 * S, expr: "shocked_extreme", nametag: "Você (Sem Porta!)", t });
    } else if (envName === "brookhaven_portaria") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🚨 CAOS NA PORTARIA DO CONDOMÍNIO", W / 2, 74, 34, "#C084FC", 8);
      strokedText(ctx, "Vizinhos trocando de apartamento a cada 5 min!", W / 2, 118, 28, "#5CE65C", 7);
      VB.drawSindica(ctx, { x: W * 0.34, y: roadY - 75 * S, scale: 1.2 * S, expr: "angry", megaphone: true, nametag: "Síndica_Desesperada", t });
      VB.drawBoy(ctx, { x: W * 0.68, y: roadY - 70 * S, scale: 1.18 * S, expr: "shocked_extreme", t });
    } else if (envName === "brookhaven_cofre") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🔐 COFRE SECRETO ATRÁS DO BOTIJÃO!", W / 2, 74, 33, "#FFD426", 8);
      strokedText(ctx, "Loot Encontrado: Tupperware da Mãe!", W / 2, 118, 29, "#FF66B2", 7);
      VB.drawBoy(ctx, { x: W * 0.34, y: floorY - 140 * S, scale: 1.2 * S, expr: "star_eyes", t });
      VB.drawMom(ctx, { x: W * 0.68, y: floorY - 145 * S, scale: 1.22 * S, expr: "angry", nametag: "Não_Mexe_No_Meu_Pote", t });
    } else if (envName === "brookhaven_perseguicao") {
      const floorY = H * 0.68;
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, floorY, W, H - floorY);
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "🚫 22H: MODO BANIR DO SERVIDOR!", W / 2, 74, 34, "#FF5733", 8);
      strokedText(ctx, "Perseguição épica de patinete na garagem!", W / 2, 118, 29, "#FFD426", 7);
      VB.drawSindica(ctx, { x: W * 0.32, y: floorY - 140 * S, scale: 1.22 * S, expr: "angry", megaphone: true, nametag: "Síndica_Admin", t });
      VB.drawBoy(ctx, { x: W * 0.7, y: floorY - 135 * S, scale: 1.2 * S, expr: "shocked_extreme", goldenShoes: true, t });
    } else if (envName === "brookhaven_desfecho") {
      const roadY = H * 0.66;
      drawBrazilianNeighborhood(ctx, W, H, roadY, S);
      VB.celBox(ctx, W * 0.24, 38, W * 0.52, 114, 26, "#16182D", 6, 0);
      strokedText(ctx, "☀ SERVIDOR REINICIADO À MEIA-NOITE", W / 2, 74, 33, "#5CE65C", 8);
      strokedText(ctx, "Mas o carro do pai ainda tá na árvore...", W / 2, 118, 29, "#FFD426", 7);
      VB.drawBoy(ctx, { x: W * 0.5, y: roadY - 70 * S, scale: 1.22 * S, expr: "shocked_extreme", t });
    } else if (envName === "brookhaven_cta") {
      drawSunburst(ctx, W, H, t, "#2563EB", "#1E1B4B");
      drawSpeedLines(ctx, W, H, t);
      VB.drawSindica(ctx, { x: W * 0.25, y: H * 0.56, scale: 1.12 * S, expr: "happy", megaphone: true, t });
      VB.drawBoy(ctx, { x: W * 0.5, y: H * 0.56, scale: 1.18 * S, expr: "star_eyes", pose: "cheer", goldenShoes: true, t });
      VB.drawMom(ctx, { x: W * 0.75, y: H * 0.56, scale: 1.12 * S, expr: "happy", pose: "cheer", t });
      strokedText(ctx, "INSCREVA-SE NO VIDA DE BLOCO!", W / 2, H * 0.12, 58, "#FFD426", 14);
      strokedText(ctx, "COMENTA \"BROOKHAVEN\" 👇", W / 2, H * 0.22, 68, "#5CE65C", 16);
    } else if (envName === "casa_vo") {
      // Cozinha acolhedora da Vó com pote de sorvete abrindo na mesa + relógio de pêndulo
      const floorY = H * 0.65;
      ctx.fillStyle = "#FEF3C7";
      ctx.fillRect(0, 0, W, floorY);
      ctx.strokeStyle = "rgba(217, 119, 6, 0.16)";
      ctx.lineWidth = 3;
      for (let gx = 0; gx < W; gx += 90) {
        ctx.beginPath();
        ctx.moveTo(gx, 280);
        ctx.lineTo(gx, floorY);
        ctx.stroke();
      }
      ctx.fillStyle = "#B45309";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      VB.celBox(ctx, W * 0.1, 290, 260 * S, 200 * S, 16, "#BAE6FD", 6, 0);
      ctx.save();
      ctx.beginPath();
      ctx.rect(W * 0.1 + 10, 300, 240 * S, 180 * S);
      ctx.clip();
      VB.drawParallaxClouds(ctx, W, t, 335, 0.65 * S);
      ctx.restore();

      ctx.save();
      ctx.translate(W * 0.82, 365);
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(Math.sin(t * 4.5) * 24, 98);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#78350F";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(Math.sin(t * 4.5) * 24, 98, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      ctx.stroke();
      VB.celBox(ctx, -46, -46, 92, 92, 46, "#FDE68A", 6, 0.18);
      ctx.restore();

      const tableY = floorY - 10;
      VB.celBox(ctx, W * 0.5 - 230 * S, tableY, 460 * S, 42 * S, 14, "#92400E", 6, 0.22);
      VB.celBox(ctx, W * 0.5 - 190 * S, tableY - 8, 380 * S, 26 * S, 10, "#FDF2F8", 4.5, 0);

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.drawVovo(ctx, {
          x: W * 0.27,
          y: floorY - 155 * S,
          scale: 1.18 * S,
          expr: "happy",
          woodenSpoon: true,
          nametag: "Vó_Admin",
          t,
          progress,
        });
        VB.renderSceneActors(
          ctx,
          W,
          H,
          [{ tipo: "menino", fromX: 0.82, toX: 0.71, fromY: (floorY - 150 * S) / H, toY: (floorY - 150 * S) / H, path: "walk", expr: progress > 0.35 ? "shocked_extreme" : "happy", scale: 1.16 }],
          t,
          sceneDur,
          progress,
          S
        );
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
      VB.drawOpeningPot(ctx, W * 0.5, tableY - 78 * S, progress, t, 0.9 * S, cena.pote_conteudo || "feijao");
    } else if (envName === "escola_parkour") {
      // Corredor/sala escolar transformado em parkour obby sobre lava borbulhante!
      const lavaY = H * 0.74;
      const skyG = ctx.createLinearGradient(0, 0, 0, lavaY);
      skyG.addColorStop(0, "#1E1B4B");
      skyG.addColorStop(1, "#312E81");
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, lavaY);

      const alarmGlow = 0.45 + Math.abs(Math.sin(t * 8)) * 0.55;
      ctx.save();
      ctx.globalAlpha = alarmGlow * 0.22;
      ctx.fillStyle = "#EF4444";
      ctx.fillRect(0, 0, W, 240);
      ctx.restore();

      const hookShowing = Boolean(cena.titulo_1) && (isThumb || t <= 2.65);
      const boardY = hookShowing ? 525 : 295;
      VB.celBox(ctx, W * 0.5 - 310 * S, boardY, 620 * S, 165 * S, 18, "#064E3B", 7, 0.15);
      strokedText(ctx, cena.lousa_texto || "PROVA SURPRESA = CHÃO É LAVA!", W * 0.5, boardY + 84 * S, Math.round(30 * S), "#FEF08A", 6);

      const plats = [
        { x: W * 0.16, y: lavaY - 95 * S, c: "#38BDF8" },
        { x: W * 0.41, y: lavaY - 165 * S, c: "#FACC15" },
        { x: W * 0.66, y: lavaY - 125 * S, c: "#5CE65C" },
        { x: W * 0.84, y: lavaY - 185 * S, c: "#F472B6" },
      ];
      plats.forEach((pl, idx) => {
        const floatY = Math.sin(t * 3.5 + idx) * 6;
        VB.celBox(ctx, pl.x - 84 * S, pl.y + floatY, 168 * S, 36 * S, 12, pl.c, 6, 0.24);
      });

      VB.drawBubblingHazard(ctx, W, H, lavaY, t, cena.hazard_tipo || "lava");

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.drawProfessor(ctx, {
          x: W * 0.8,
          y: plats[3].y - 235 * S,
          scale: 1.02 * S,
          state: "idle",
          flip: true,
          nametag: "Prof_Admin",
          t,
          progress,
        });
        VB.renderSceneActors(
          ctx,
          W,
          H,
          [
            {
              tipo: "menino",
              fromX: 0.16,
              toX: 0.68,
              fromY: (plats[0].y - 235 * S) / H,
              toY: (plats[2].y - 235 * S) / H,
              path: "jump_platforms",
              hops: 3,
              jumpArc: 145 * S,
              backpack: true,
              goldenShoes: true,
              scale: 1.12,
            },
          ],
          t,
          sceneDur,
          progress,
          S
        );
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
      if (cena.titulo_1) {
        drawTimedHookTitles(cena.titulo_1, cena.titulo_2 || "", cena.titulo_3 || "");
      }
    } else if (envName === "padaria") {
      // Padaria brasileira com esteira animada abaixo dos pés, vitrine de salgados e contador Pix
      const floorY = H * 0.69;
      ctx.fillStyle = "#FFFBEB";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#78350F";
      ctx.fillRect(0, floorY, W, H - floorY);

      const stripes = 8;
      const sw = W / stripes;
      for (let i = 0; i < stripes; i++) {
        VB.celBox(ctx, i * sw, 265, sw + 4, 74 * S, [0, 0, 22, 22], i % 2 === 0 ? "#EF4444" : "#FFFFFF", 5, 0.15);
      }

      const counterY = floorY - 56 * S;
      VB.celBox(ctx, W * 0.06, counterY - 125 * S, W * 0.42, 130 * S, 18, "rgba(186, 230, 253, 0.55)", 6, 0.15);
      [-100, -32, 36, 104].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(W * 0.27 + ox * S, counterY - 40 * S, 22 * S, 0, Math.PI * 2);
        ctx.fillStyle = "#F59E0B";
        ctx.fill();
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();
      });

      // Esteira desenhada ANTES dos personagens (no nível dos pés!) para nunca cortar o tronco
      VB.drawConveyorBelt(ctx, W * 0.46, floorY - 16 * S, W * 0.48, 56 * S, t, 155);

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.drawPadeiro(ctx, { x: W * 0.24, y: floorY - 165 * S, scale: 1.14 * S, expr: "happy", nametag: "Seu_Zé", t, progress });
        VB.renderSceneActors(
          ctx,
          W,
          H,
          [{ tipo: "menino", fromX: 0.86, toX: 0.62, fromY: (floorY - 165 * S) / H, toY: (floorY - 165 * S) / H, path: "run", scale: 1.16, item_in_hand: "pix_phone", expr: "star_eyes" }],
          t,
          sceneDur,
          progress,
          S
        );
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
    } else if (envName === "rua_cidade") {
      // Rua brasileira animada com prédios em parallax, semáforo e asfalto de blocos
      const roadY = H * 0.69;
      const sky = ctx.createLinearGradient(0, 0, 0, roadY);
      sky.addColorStop(0, "#0284C7");
      sky.addColorStop(1, "#7DD3FC");
      ctx.fillRect(0, 0, W, roadY);

      VB.drawParallaxClouds(ctx, W, t, 315, 0.9 * S);

      // Prédios ao fundo com leve deslocamento parallax
      const pShift = (t * 24) % 240;
      const bColors = ["#F97316", "#8B5CF6", "#FACC15", "#EC4899", "#22C55E", "#38BDF8"];
      for (let i = -1; i < 6; i++) {
        const bx = i * 240 - pShift;
        const bh = (250 + ((i + 10) % 3) * 85) * S;
        VB.celBox(ctx, bx, roadY - bh, 222, bh, 14, bColors[(i + 10) % bColors.length], 6, 0.22);
      }

      drawStuddedStreet(ctx, W, H, roadY);

      // Semáforo interativo piscando
      const semX = W * 0.84;
      VB.celBox(ctx, semX - 8, roadY - 290 * S, 16, 290 * S, 6, "#334155", 5, 0);
      VB.celBox(ctx, semX - 32, roadY - 350 * S, 64, 136 * S, 16, "#0F172A", 5.5, 0);
      const activeLight = Math.floor(t * 1.5) % 3;
      ["#EF4444", "#FACC15", "#22C55E"].forEach((lc, li) => {
        ctx.beginPath();
        ctx.arc(semX, roadY - (322 - li * 40) * S, 14 * S, 0, Math.PI * 2);
        ctx.fillStyle = activeLight === li ? lc : "rgba(255,255,255,0.18)";
        ctx.fill();
      });

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.renderSceneActors(
          ctx,
          W,
          H,
          [
            { tipo: "menino", fromX: 0.15, toX: 0.68, fromY: (roadY - 95 * S) / H, toY: (roadY - 95 * S) / H, path: "run", goldenShoes: true, scale: 1.22 },
            { tipo: "caramelo", fromX: 0.02, toX: 0.44, fromY: (roadY - 25 * S) / H, toY: (roadY - 25 * S) / H, path: "run", crown: true, scale: 1.08 },
          ],
          t,
          sceneDur,
          progress,
          S
        );
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
      if (cena.pix_valor !== undefined) {
        VB.drawPixCounter(ctx, W * 0.48, 215, t, progress, Number(cena.pix_valor), 0.9 * S);
      }
    } else if (envName === "servidor_admin") {
      // Sala futurista do Servidor Admin com colunas neon, porta de cofre abrindo e cubos flutuantes
      const floorY = H * 0.72;
      ctx.fillStyle = "#090D1F";
      ctx.fillRect(0, 0, W, H);

      // Linhas de código/energia descendo ao fundo
      ctx.save();
      ctx.fillStyle = "rgba(34, 211, 238, 0.22)";
      for (let col = 0; col < 12; col++) {
        const cx = col * (W / 11);
        const cy = ((t * (140 + col * 18) + col * 190) % floorY);
        ctx.fillRect(cx, cy - 90, 8, 90);
      }
      ctx.restore();

      // Piso gradeado neon
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.strokeStyle = "#22D3EE";
      ctx.lineWidth = 3;
      for (let gx = 0; gx <= W; gx += 90) {
        ctx.beginPath();
        ctx.moveTo(W * 0.5 + (gx - W * 0.5) * 0.45, floorY);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 6;
      ctx.stroke();

      VB.drawAnimatedDoor(ctx, W * 0.5 - 120 * S, 365, 240 * S, 305 * S, progress, cena.porta_label || "PAINEL ADMIN");
      VB.isoCube(ctx, W * 0.16, 440 + Math.sin(t * 4) * 18, 84 * S, "#FDE047", "#EAB308", "#CA8A04", 5.5);
      VB.isoCube(ctx, W * 0.82, 460 + Math.cos(t * 4) * 18, 84 * S, "#4ADE80", "#22C55E", "#15803D", 5.5);

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.drawBoy(ctx, {
          x: W * 0.5,
          y: floorY - 150 * S,
          scale: 1.26 * S,
          state: "celebrate",
          expr: "star_eyes",
          crown: true,
          goldenShoes: true,
          nametag: "Admin_999",
          t,
          progress,
        });
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
    } else if (envName === "quarto_gamer") {
      // Quarto Gamer RGB com fita LED animada, setup duplo de monitores e janela noturna
      const floorY = H * 0.72;
      ctx.fillStyle = "#1E1B4B";
      ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = "#312E81";
      ctx.fillRect(0, floorY, W, H - floorY);
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();

      // Fita LED RGB ciclando cores na parede
      const hueColor = ["#22D3EE", "#EC4899", "#A855F7", "#5CE65C"][Math.floor(t * 3) % 4];
      ctx.fillStyle = hueColor;
      ctx.fillRect(0, 308, W, 12);

      // Mesa gamer + 2 monitores brilhantes
      const deskY = floorY - 115 * S;
      VB.celBox(ctx, W * 0.14, deskY, 440 * S, 28 * S, 10, "#0F172A", 6, 0.2);
      VB.celBox(ctx, W * 0.17, deskY - 135 * S, 185 * S, 118 * S, 14, "#111827", 6, 0);
      VB.celBox(ctx, W * 0.185, deskY - 122 * S, 155 * S, 92 * S, 8, "#06B6D4", 4, 0);
      VB.celBox(ctx, W * 0.37, deskY - 135 * S, 185 * S, 118 * S, 14, "#111827", 6, 0);
      VB.celBox(ctx, W * 0.385, deskY - 122 * S, 155 * S, 92 * S, 8, "#8B5CF6", 4, 0);

      if (!Array.isArray(cena.personagens) || cena.personagens.length === 0) {
        VB.drawBoy(ctx, { x: W * 0.68, y: floorY - 125 * S, scale: 1.28 * S, state: "talk", expr: "happy", t, progress });
      } else {
        VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
      }
      if (cena.pix_valor !== undefined) {
        VB.drawPixCounter(ctx, W * 0.48, 215, t, progress, Number(cena.pix_valor), 0.92 * S);
      }
    } else if (Array.isArray(cena.personagens) && cena.personagens.length > 0) {
      // Fallback universal customizado
      drawSunburst(ctx, W, H, t, "#4F46E5", "#312E81");
      VB.renderSceneActors(ctx, W, H, cena.personagens, t, sceneDur, progress, S);
    }

    // Em presets antigos, também permite sobrepor/adicionar personagens móveis extras via JSON!
    const isNewPreset = ["casa_vo", "escola_parkour", "padaria", "rua_cidade", "servidor_admin", "quarto_gamer"].includes(envName);
    if (!isNewPreset && Array.isArray(cena.personagens_extras) && cena.personagens_extras.length > 0) {
      VB.renderSceneActors(ctx, W, H, cena.personagens_extras, t, sceneDur, progress, S);
    }
  };

  // Overlay fixo de tela para HUD e Contador Pix (imune ao zoom/pan da câmera virtual!)
  VB.renderScreenOverlays = function (ctx, W, H, cena = {}, t = 0, progress = 0) {
    const isL = W > H;
    const S = isL ? 0.68 : 0.92;
    const badgeLabel = cena.hud_badge || cena.hud_dias;
    if (badgeLabel) {
      VB.drawHudBadge(ctx, W, badgeLabel, isL);
    }
    if (cena.pix_valor !== undefined) {
      VB.drawPixCounter(ctx, W * 0.5, isL ? 86 : 155, t, progress, Number(cena.pix_valor), S);
    }
  };

  VB.renderSubtitles = function (ctx, W, H, sceneText, highlights, progress, t = 0, wordsTiming = null) {
    if (!sceneText) return;
    const isL = W > H;

    // Escudo escuro suave na parte inferior (Y > 68%) para garantir leitura 100% nítida da legenda
    const shieldG = ctx.createLinearGradient(0, H * 0.66, 0, H);
    shieldG.addColorStop(0, "rgba(10, 8, 20, 0)");
    shieldG.addColorStop(0.55, "rgba(10, 8, 20, 0.56)");
    shieldG.addColorStop(1, "rgba(10, 8, 20, 0.78)");
    ctx.fillStyle = shieldG;
    ctx.fillRect(0, H * 0.66, W, H * 0.34);

    const chunkSize = isL ? 4 : 3;
    let activeChunkWords = [];
    let activeWordInChunk = -1;
    let chunkAgeSec = 0.2;

    if (Array.isArray(wordsTiming) && wordsTiming.length > 0) {
      // Usa os pacotes originais do texto (com pontuação preservada!) alinhados aos timestamps exatos do Edge-TTS
      const rawTokens = sceneText.trim().split(/\s+/);
      const aligned = rawTokens.map((tok, idx) => {
        const wt = wordsTiming[Math.min(idx, wordsTiming.length - 1)];
        return {
          display: tok,
          startSec: wt ? wt.startSec : 0,
          endSec: wt ? wt.endSec : 0,
        };
      });

      const chunks = [];
      for (let i = 0; i < aligned.length; i += chunkSize) {
        chunks.push(aligned.slice(i, i + chunkSize));
      }

      let chosenIdx = 0;
      for (let ci = 0; ci < chunks.length; ci++) {
        if (t >= chunks[ci][0].startSec - 0.04) {
          chosenIdx = ci;
        }
      }
      const chosen = chunks[chosenIdx];
      activeChunkWords = chosen.map((item) => item.display);
      chunkAgeSec = Math.max(0, t - chosen[0].startSec);

      for (let wi = 0; wi < chosen.length; wi++) {
        if (t >= chosen[wi].startSec - 0.03) {
          activeWordInChunk = wi;
        }
      }
    } else {
      const words = sceneText.trim().split(/\s+/);
      const chunks = [];
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize));
      }
      const idx = Math.min(chunks.length - 1, Math.floor(progress * chunks.length));
      activeChunkWords = chunks[idx];
      const localP = (progress * chunks.length) % 1;
      activeWordInChunk = Math.min(activeChunkWords.length - 1, Math.floor(localP * activeChunkWords.length));
      chunkAgeSec = localP * 0.5;
    }

    const popScale = chunkAgeSec < 0.12 ? 0.86 + (chunkAgeSec / 0.12) * 0.18 : 1.0;

    ctx.save();
    // Zona segura do YouTube Shorts: acima do rodapé do canal (0.815) e livre dos botões da direita (W * 0.465)
    const subY = H * (isL ? 0.84 : 0.815);
    const subCenterX = isL ? W / 2 : W * 0.465;
    ctx.translate(subCenterX, subY);
    ctx.scale(popScale, popScale);

    const upperWords = activeChunkWords.map((w) => w.toUpperCase());
    let fontSize = isL ? 64 : 68;
    const spaceW = 20;
    const maxAllowedW = isL ? W - 160 : W - 215;

    ctx.font = `900 ${fontSize}px 'Fredoka', 'Arial Black', sans-serif`;
    let widths = upperWords.map((w) => ctx.measureText(w).width);
    let totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (upperWords.length - 1);

    // Auto-ajuste para NUNCA cortar nenhuma palavra nas bordas da tela!
    if (totalW > maxAllowedW) {
      fontSize = Math.max(42, Math.floor(fontSize * (maxAllowedW / totalW)));
      ctx.font = `900 ${fontSize}px 'Fredoka', 'Arial Black', sans-serif`;
      widths = upperWords.map((w) => ctx.measureText(w).width);
      totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (upperWords.length - 1);
    }

    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    let curX = -totalW / 2;
    upperWords.forEach((uw, wi) => {
      const clean = uw.replace(/[.,!?":]/g, "");
      const isSpokenNow = wi === activeWordInChunk;
      const highlightColor = highlights && (highlights[uw] || highlights[clean]);
      const color = highlightColor || (isSpokenNow ? "#FFEE58" : "#FFFFFF");
      const cx = curX + widths[wi] / 2;
      const wordLift = isSpokenNow ? -6 : 0;

      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(uw, cx + 5, 8 + wordLift);

      ctx.lineWidth = isL ? 15 : 18;
      ctx.strokeStyle = "#0E0B16";
      ctx.strokeText(uw, cx, wordLift);

      ctx.fillStyle = color;
      ctx.fillText(uw, cx, wordLift);

      curX += widths[wi] + spaceW;
    });

    ctx.restore();
  };
})(window.VB);
