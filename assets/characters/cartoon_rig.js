// Rigs 2D/2.5D fiéis ao estilo Vida de Bloco (contorno grosso #1A1423 + cel-shading lateral 2 tons)
window.VB = window.VB || {};

(function (VB) {
  const OUTLINE = "#1A1423";

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Array.isArray(r) ? r : Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rr);
  }

  // Desenha caixa arredondada com sombra cel-shaded na direita + contorno grosso
  VB.celBox = function (ctx, x, y, w, h, r, fill, lineW = 6, shadowRatio = 0.24) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();

    if (shadowRatio > 0) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "rgba(18, 10, 32, 0.14)";
      ctx.fillRect(x + w * (1 - shadowRatio), y - 2, w * shadowRatio + 4, h + 4);
      ctx.restore();
    }

    roundRectPath(ctx, x, y, w, h, r);
    ctx.lineWidth = lineW;
    ctx.strokeStyle = OUTLINE;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  };

  // Cubo 3D isométrico com contorno grosso (estilo blocos verdes/amarelos do canal)
  VB.isoCube = function (ctx, cx, cy, size, colorTop, colorFront, colorSide, lineW = 6) {
    const hs = size / 2;
    const d = size * 0.34;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineWidth = lineW;
    ctx.strokeStyle = OUTLINE;

    // Face frontal
    ctx.beginPath();
    ctx.rect(cx - hs, cy - hs, size, size);
    ctx.fillStyle = colorFront;
    ctx.fill();
    ctx.stroke();

    // Face superior
    ctx.beginPath();
    ctx.moveTo(cx - hs, cy - hs);
    ctx.lineTo(cx - hs + d, cy - hs - d);
    ctx.lineTo(cx + hs + d, cy - hs - d);
    ctx.lineTo(cx + hs, cy - hs);
    ctx.closePath();
    ctx.fillStyle = colorTop;
    ctx.fill();
    ctx.stroke();

    // Face direita
    ctx.beginPath();
    ctx.moveTo(cx + hs, cy - hs);
    ctx.lineTo(cx + hs + d, cy - hs - d);
    ctx.lineTo(cx + hs + d, cy + hs - d);
    ctx.lineTo(cx + hs, cy + hs);
    ctx.closePath();
    ctx.fillStyle = colorSide;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  function drawSweatDrop(ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(14, 0, 14, 18, 0, 18);
    ctx.bezierCurveTo(-14, 18, -14, 0, 0, -18);
    ctx.fillStyle = "#84ECFF";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();
  }

  function drawPixelHeart(ctx, cx, cy, u = 8) {
    const rows = [
      [-2, -1, 1, 2],
      [-3, -2, -1, 0, 1, 2, 3],
      [-3, -2, -1, 0, 1, 2, 3],
      [-2, -1, 0, 1, 2],
      [-1, 0, 1],
      [0],
    ];
    ctx.fillStyle = "#FF5D8F";
    rows.forEach((cols, r) => {
      cols.forEach((c) => {
        ctx.fillRect(cx + c * u - u / 2, cy + (r - 2.5) * u, u + 0.8, u + 0.8);
      });
    });
  }

  function drawFace(ctx, expr, isMom, t) {
    ctx.save();
    ctx.strokeStyle = OUTLINE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Olhos
    if (expr === "shocked_extreme") {
      [-52, 52].forEach((ox) => {
        ctx.beginPath();
        ctx.ellipse(ox, -10, 44, 54, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ox + (ox < 0 ? 6 : -6), 14, 12, 0, Math.PI * 2);
        ctx.fillStyle = OUTLINE;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ox + (ox < 0 ? 2 : -10), 10, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      });
      // Sobrancelhas inclinadas de pânico
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-88, -56);
      ctx.lineTo(-16, -78);
      ctx.moveTo(88, -56);
      ctx.lineTo(16, -78);
      ctx.stroke();
    } else if (expr === "side_eye") {
      [-46, 46].forEach((ox) => {
        ctx.beginPath();
        ctx.ellipse(ox, -8, 26, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ox + 10, -8, 8, 0, Math.PI * 2);
        ctx.fillStyle = OUTLINE;
        ctx.fill();
      });
      drawSweatDrop(ctx, -108, -22, 1.0);
      drawSweatDrop(ctx, 108, -16, 1.1);
    } else if (expr === "happy" || expr === "star_eyes") {
      [-46, 46].forEach((ox) => {
        if (expr === "happy") {
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(ox, -2, 22, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(ox, -8, 28, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.stroke();
          // Estrelinha dourada
          ctx.fillStyle = "#FFD426";
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const rad = i % 2 === 0 ? 18 : 8;
            const ang = (i * Math.PI) / 5 - Math.PI / 2;
            ctx[i === 0 ? "moveTo" : "lineTo"](ox + Math.cos(ang) * rad, -8 + Math.sin(ang) * rad);
          }
          ctx.closePath();
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    } else {
      // Padrão / surpresa / óculos mãe
      [-48, 48].forEach((ox) => {
        ctx.beginPath();
        ctx.ellipse(ox, -8, 28, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ox, -8, 9, 0, Math.PI * 2);
        ctx.fillStyle = isMom ? "#4BD6B4" : OUTLINE;
        ctx.fill();
      });
      // Sobrancelhas arqueadas
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(-48, -32, 26, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(48, -32, 26, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // Óculos redondos da Mãe com reflexo verde da tela
    if (isMom) {
      [-52, 52].forEach((gx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(gx, -8, 44, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(162, 240, 232, 0.48)";
        ctx.fill();
        ctx.clip();
        // Brilho verde de tela do jogo
        ctx.fillStyle = "rgba(92, 230, 120, 0.38)";
        ctx.beginPath();
        ctx.ellipse(gx, -4, 28, 14, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(gx, -8, 44, 0, Math.PI * 2);
        ctx.lineWidth = 5.5;
        ctx.strokeStyle = "#2E2942";
        ctx.stroke();
      });
      // Ponte dos óculos
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = "#2E2942";
      ctx.stroke();
    }

    // Boca (com leve lip-sync pelo tempo t)
    const talkOpen = 0.85 + Math.abs(Math.sin(t * 14)) * 0.3;
    if (expr === "shocked_extreme") {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-44, 42, 88, 128 * talkOpen, 44);
      ctx.fillStyle = "#4A1525";
      ctx.fill();
      ctx.clip();
      ctx.beginPath();
      ctx.ellipse(0, 158 * talkOpen, 34, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#FF7597";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-44, 42, 88, 128 * talkOpen, 44);
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    } else if (expr === "side_eye") {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-24, 52);
      ctx.lineTo(24, 52);
      ctx.stroke();
    } else if (expr === "oval_o") {
      ctx.beginPath();
      ctx.ellipse(0, 56, 22, 30 * talkOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#5A3B5C";
      ctx.fill();
      ctx.lineWidth = 5.5;
      ctx.stroke();
    } else {
      // Boca D aberta (gritando/rindo/falando)
      const mh = (expr === "scream" ? 56 : 42) * talkOpen;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-42, 38, 84, mh, [12, 12, 38, 38]);
      ctx.fillStyle = "#4A1525";
      ctx.fill();
      ctx.clip();
      // Dentes superiores brancos
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-44, 36, 88, 14);
      // Língua rosa
      ctx.beginPath();
      ctx.ellipse(0, 38 + mh, 28, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#FF7597";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-42, 38, 84, mh, [12, 12, 38, 38]);
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    }
    ctx.restore();
  }

  VB.drawTablet = function (ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(-0.06);
    VB.celBox(ctx, -125, -68, 250, 136, 24, "#1E1B2E", 6, 0.15);
    // Adesivo rosa com estrela
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#FF66B2";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 15 : 6;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();

    // Dedinhos segurando nas laterais
    [-126, 104].forEach((fx, side) => {
      for (let k = -1; k <= 1; k++) {
        VB.celBox(ctx, fx, k * 28 - 11, 28, 20, 9, "#FAD4B0", 4.5, 0);
      }
    });
    ctx.restore();
  };

  // Personagem Menino ("Você")
  VB.drawBoy = function (ctx, opts = {}) {
    const {
      x = 540,
      y = 960,
      scale = 1,
      expr = "side_eye",
      pose = "stand",
      holdingTablet = false,
      t = 0,
      nametag = "",
    } = opts;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Sombra no chão
    if (pose !== "closeup") {
      ctx.beginPath();
      ctx.ellipse(0, 265, 95, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }

    // Pernas
    if (pose === "sit") {
      // Sentado no pufe rosa com pernas abertas e tênis vermelhos
      ctx.save();
      ctx.rotate(-0.35);
      VB.celBox(ctx, -115, 130, 88, 48, 20, "#2460B8", 6, 0.2);
      VB.celBox(ctx, -140, 118, 42, 68, 20, "#E64855", 6, 0.2);
      ctx.restore();

      ctx.save();
      ctx.rotate(0.35);
      VB.celBox(ctx, 27, 130, 88, 48, 20, "#2460B8", 6, 0.2);
      VB.celBox(ctx, 98, 118, 42, 68, 20, "#E64855", 6, 0.2);
      ctx.restore();
    } else {
      VB.celBox(ctx, -64, 155, 56, 95, 18, "#2460B8", 6, 0.25);
      VB.celBox(ctx, 8, 155, 56, 95, 18, "#2460B8", 6, 0.25);
      VB.celBox(ctx, -74, 228, 68, 36, 16, "#231F2C", 6, 0.2);
      VB.celBox(ctx, 6, 228, 68, 36, 16, "#231F2C", 6, 0.2);
    }

    // Braços (atrás ou levantados)
    const wave = Math.sin(t * 10) * 0.12;
    if (pose === "cheer") {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 82, 32);
        ctx.rotate(dir * -2.4 + wave * dir);
        VB.celBox(ctx, -24, 0, 48, 110, 22, "#FAD4B0", 6, 0.22);
        VB.celBox(ctx, -26, -10, 52, 52, 22, "#FFD426", 6, 0.22);
        ctx.restore();
      });
    } else {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 86, 26);
        ctx.rotate(dir * 0.22 + wave * dir);
        VB.celBox(ctx, -24, 28, 48, 96, 22, "#FAD4B0", 6, 0.22);
        VB.celBox(ctx, -28, -4, 56, 58, 24, "#FFD426", 6, 0.22);
        ctx.restore();
      });
    }

    // Tronco amarelo + coração pixelado
    VB.celBox(ctx, -76, 8, 152, 164, 30, "#FFD426", 6, 0.24);
    drawPixelHeart(ctx, 0, 74, 9);

    // Cabeça
    ctx.save();
    ctx.translate(0, -105);

    // Aba do boné virado pra trás (saindo no topo direito)
    ctx.save();
    ctx.translate(78, -96);
    ctx.rotate(-0.42);
    VB.celBox(ctx, -20, -24, 92, 46, 22, "#2787E8", 6, 0.3);
    ctx.restore();

    // Tufos de cabelo laranja nas têmporas
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * 96, -48);
      ctx.lineTo(dir * 122, -40);
      ctx.lineTo(dir * 104, -22);
      ctx.lineTo(dir * 118, -8);
      ctx.lineTo(dir * 96, -4);
      ctx.closePath();
      ctx.fillStyle = "#E67E22";
      ctx.fill();
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    });

    // Rosto quadrado arredondado
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Domo do boné azul
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-108, -44);
    ctx.bezierCurveTo(-108, -138, 108, -138, 108, -44);
    ctx.closePath();
    ctx.fillStyle = "#2787E8";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "rgba(15, 20, 45, 0.18)";
    ctx.fillRect(42, -140, 80, 110);
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // Abertura laranja da regulagem do boné na testa
    VB.celBox(ctx, -36, -74, 72, 30, 14, "#E67E22", 5.5, 0.2);
    ctx.beginPath();
    ctx.moveTo(-36, -56);
    ctx.lineTo(36, -56);
    ctx.lineWidth = 5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();

    // Expressão facial
    drawFace(ctx, expr, false, t);
    ctx.restore();

    if (holdingTablet) {
      VB.drawTablet(ctx, 0, 96, 1.0);
    }

    if (nametag) {
      VB.drawNametag(ctx, 0, -258, nametag, "#FFD426");
    }

    ctx.restore();
  };

  // Personagem Mãe ("Mãe")
  VB.drawMom = function (ctx, opts = {}) {
    const {
      x = 540,
      y = 960,
      scale = 1,
      expr = "scream",
      pose = "stand",
      holdingTablet = false,
      crown = false,
      t = 0,
      nametag = "",
    } = opts;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (pose !== "closeup" && pose !== "fall") {
      ctx.beginPath();
      ctx.ellipse(0, 272, 95, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }

    // Pernas roxas + sapatos escuros
    VB.celBox(ctx, -62, 152, 56, 102, 16, "#5A4688", 6, 0.25);
    VB.celBox(ctx, 6, 152, 56, 102, 16, "#5A4688", 6, 0.25);
    VB.celBox(ctx, -70, 232, 66, 36, 16, "#231F2C", 6, 0.2);
    VB.celBox(ctx, 4, 232, 66, 36, 16, "#231F2C", 6, 0.2);

    // Braços com manga verde-água
    const wave = Math.sin(t * 12) * 0.14;
    if (pose === "cheer" || pose === "fall") {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 84, 30);
        ctx.rotate(dir * -2.35 + wave * dir);
        VB.celBox(ctx, -24, 0, 48, 104, 22, "#2EC4B6", 6, 0.22);
        VB.celBox(ctx, -22, 86, 44, 38, 18, "#FAD4B0", 5.5, 0.2);
        ctx.restore();
      });
    } else {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 90, 24);
        ctx.rotate(dir * 0.14 + wave * dir);
        VB.celBox(ctx, -25, 0, 50, 112, 22, "#2EC4B6", 6, 0.22);
        VB.celBox(ctx, -23, 94, 46, 40, 18, "#FAD4B0", 5.5, 0.2);
        ctx.restore();
      });
    }

    // Tronco: blusa rosa interna + casaco verde-água aberto com botões
    VB.celBox(ctx, -76, 8, 152, 162, 26, "#F28BB2", 6, 0.2);
    // Abas esquerda e direita do cardigã
    VB.celBox(ctx, -76, 8, 52, 162, 20, "#2EC4B6", 6, 0.18);
    VB.celBox(ctx, 24, 8, 52, 162, 20, "#2EC4B6", 6, 0.28);
    // Botões brancos no cardigã
    [-42, -42].forEach((_, idx) => {
      const by = idx === 0 ? 52 : 96;
      ctx.beginPath();
      ctx.arc(-38, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#FFF5CC";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    });

    // Cabeça da Mãe
    ctx.save();
    ctx.translate(0, -106);

    // Rabo de cavalo lateral alto + elástico amarelo
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(82, -78);
    ctx.bezierCurveTo(156, -86, 168, 12, 134, 62);
    ctx.bezierCurveTo(116, 30, 108, -12, 82, -42);
    ctx.closePath();
    ctx.fillStyle = "#8D4024";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(88, -68, 14, 22, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD426";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // Brincos de argola dourados
    [-104, 104].forEach((ex) => {
      ctx.beginPath();
      ctx.arc(ex, 26, 22, 0, Math.PI * 2);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#FFD426";
      ctx.stroke();
    });

    // Rosto
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Cabelo castanho com franja dividida
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-108, -18);
    ctx.lineTo(-108, -56);
    ctx.bezierCurveTo(-108, -134, 108, -134, 108, -56);
    ctx.lineTo(108, -18);
    ctx.lineTo(92, -18);
    ctx.lineTo(92, -44);
    ctx.quadraticCurveTo(42, -52, 8, -74);
    ctx.quadraticCurveTo(-36, -46, -92, -44);
    ctx.lineTo(-92, -18);
    ctx.closePath();
    ctx.fillStyle = "#8D4024";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "rgba(15, 10, 25, 0.18)";
    ctx.fillRect(36, -136, 80, 130);
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();

    // Coroa Admin dourada (opcional para cena final)
    if (crown) {
      ctx.save();
      ctx.translate(0, -124);
      ctx.beginPath();
      ctx.moveTo(-64, 18);
      ctx.lineTo(-74, -36);
      ctx.lineTo(-32, -8);
      ctx.lineTo(0, -48);
      ctx.lineTo(32, -8);
      ctx.lineTo(74, -36);
      ctx.lineTo(64, 18);
      ctx.closePath();
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.restore();
    }

    drawFace(ctx, expr, true, t);
    ctx.restore();

    if (holdingTablet) {
      VB.drawTablet(ctx, -38, 108, 0.95);
    }

    if (nametag) {
      VB.drawNametag(ctx, 0, crown ? -290 : -258, nametag, "#FF66B2");
    }

    ctx.restore();
  };

  VB.drawNametag = function (ctx, x, y, text, color = "#FFD426") {
    ctx.save();
    ctx.font = "900 28px 'Fredoka', 'Arial Black', sans-serif";
    const tw = ctx.measureText(text).width + 34;
    ctx.beginPath();
    ctx.roundRect(x - tw / 2, y - 24, tw, 44, 14);
    ctx.fillStyle = "rgba(20, 18, 36, 0.85)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y - 1);
    ctx.restore();
  };

  // Personagem Cachorro Caramelo Brasileiro em bloco (reutilizável)
  VB.drawCaramelo = function (ctx, opts = {}) {
    const {
      x = 540,
      y = 1050,
      scale = 1,
      crown = false,
      sunglasses = false,
      pose = "stand",
      t = 0,
      nametag = "",
    } = opts;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (pose !== "closeup") {
      ctx.beginPath();
      ctx.ellipse(0, 175, 115, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }

    // Rabinho abanando
    ctx.save();
    ctx.translate(98, 42);
    ctx.rotate(Math.sin(t * 18) * 0.45 + 0.4);
    VB.celBox(ctx, -12, -58, 28, 66, 14, "#D98629", 5.5, 0.25);
    ctx.restore();

    // Patinhas traseiras e dianteiras
    const bounce = pose === "cheer" ? Math.abs(Math.sin(t * 12)) * -14 : 0;
    [-72, -22, 26, 74].forEach((lx) => {
      VB.celBox(ctx, lx - 20, 96 + bounce, 40, 76, 14, "#E59A3C", 5.5, 0.25);
      VB.celBox(ctx, lx - 22, 152 + bounce, 44, 24, 10, "#8C4A1C", 5, 0.2);
    });

    // Corpo em bloco caramelo + barriga creme
    VB.celBox(ctx, -98, 6, 196, 108, 28, "#E59A3C", 6, 0.24);
    VB.celBox(ctx, -56, 36, 112, 68, 20, "#FDE0B6", 4, 0);

    // Coleira vermelha com plaquinha dourada
    VB.celBox(ctx, -82, -8, 164, 24, 10, "#EE2B3B", 5.5, 0.2);
    ctx.beginPath();
    ctx.arc(0, 18, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD426";
    ctx.fill();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // Cabeça quadrada arredondada do Caramelo
    ctx.save();
    ctx.translate(0, -96);

    // Orelhas caídas marrons
    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * 94, -34);
      ctx.rotate(dir * (0.22 + Math.sin(t * 10) * 0.08));
      VB.celBox(ctx, -22, 0, 44, 88, 20, "#8C4A1C", 6, 0.25);
      ctx.restore();
    });

    VB.celBox(ctx, -94, -82, 188, 166, 40, "#E59A3C", 6, 0.24);

    // Olhos expressivos ou óculos escuros de patrão
    if (sunglasses) {
      VB.celBox(ctx, -82, -32, 72, 42, 10, "#111827", 5.5, 0);
      VB.celBox(ctx, 10, -32, 72, 42, 10, "#111827", 5.5, 0);
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.stroke();
      // Brilho branco na lente
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-66, -22);
      ctx.lineTo(-48, -4);
      ctx.moveTo(26, -22);
      ctx.lineTo(44, -4);
      ctx.stroke();
    } else {
      [-42, 42].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(ox, -14, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = OUTLINE;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ox, -14, 10, 0, Math.PI * 2);
        ctx.fillStyle = OUTLINE;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ox - 4, -18, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      });
    }

    // Focinho bege + nariz preto brilhante + linguinha rosa
    VB.celBox(ctx, -48, 12, 96, 58, 24, "#FDE0B6", 5.5, 0.18);
    VB.celBox(ctx, -20, 16, 40, 24, 12, "#1E1B2E", 4.5, 0);

    const pant = 22 + Math.abs(Math.sin(t * 14)) * 12;
    VB.celBox(ctx, -16, 46, 32, pant, 14, "#FF6B97", 4.5, 0);

    // Coroa Admin dourada
    if (crown) {
      ctx.save();
      ctx.translate(0, -104);
      ctx.beginPath();
      ctx.moveTo(-58, 18);
      ctx.lineTo(-68, -32);
      ctx.lineTo(-28, -6);
      ctx.lineTo(0, -44);
      ctx.lineTo(28, -6);
      ctx.lineTo(68, -32);
      ctx.lineTo(58, 18);
      ctx.closePath();
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, crown ? -246 : -210, nametag, "#FFD426");
    }

    ctx.restore();
  };

  // Marca d'água oficial do criador (PoxaRique!)
  VB.drawWatermark = function (ctx, W, H, label = "PoxaRique!", isLandscape = false) {
    if (!label) return;
    ctx.save();
    const x = isLandscape ? 42 : 38;
    const y = isLandscape ? H - 72 : 118;
    const scale = isLandscape ? 0.88 : 1.0;

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.font = "900 30px 'Fredoka', 'Arial Black', sans-serif";
    const textW = ctx.measureText(label).width;
    const boxW = textW + 74;
    const boxH = 52;

    // Pílula escura translúcida com borda dourada sutil
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.roundRect(0, -boxH / 2, boxW, boxH, 26);
    ctx.fillStyle = "rgba(18, 16, 34, 0.78)";
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#FFD426";
    ctx.stroke();

    // Cubinho ícone amarelo à esquerda
    VB.celBox(ctx, 14, -13, 26, 26, 6, "#FFD426", 3.5, 0.25);

    // Texto PoxaRique!
    ctx.globalAlpha = 0.96;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#0E0B16";
    ctx.strokeText(label, 50, 1);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(label, 50, 1);

    ctx.restore();
  };
})(window.VB);
