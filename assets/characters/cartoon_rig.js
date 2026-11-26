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

  function drawLightningBolt(ctx, cx, cy, s = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(6, -26);
    ctx.lineTo(-16, 4);
    ctx.lineTo(-2, 4);
    ctx.lineTo(-8, 28);
    ctx.lineTo(18, -4);
    ctx.lineTo(2, -4);
    ctx.closePath();
    ctx.fillStyle = "#FFD426";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();
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

    // Óculos quadrados modernos da Mãe com leve reflexo
    if (isMom) {
      [-52, 52].forEach((gx) => {
        ctx.save();
        VB.celBox(ctx, gx - 42, -38, 84, 58, 14, "rgba(186, 230, 253, 0.45)", 5.5, 0);
        ctx.clip();
        ctx.fillStyle = "rgba(92, 230, 120, 0.28)";
        ctx.fillRect(gx - 30, -24, 60, 22);
        ctx.restore();
      });
      // Ponte dos óculos
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(10, -12);
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
    const rawExpr = opts.expr || opts.expression || "side_eye";
    const expr = rawExpr === "shock" ? "shocked_extreme" : rawExpr;
    const {
      x = 540,
      y = 960,
      scale = 1,
      pose = "stand",
      holdingTablet = false,
      goldenShoes = false,
      backpack = false,
      breadBag = false,
      hp = null,
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

    // Mochila escolar nas costas (quando em cena de escola)
    if (backpack) {
      VB.celBox(ctx, -98, 2, 196, 152, 28, "#EF4444", 6, 0.22);
      VB.celBox(ctx, -92, 34, 184, 48, 16, "#2563EB", 5, 0.18);
    }

    // Pernas
    const shoeColor = goldenShoes ? "#FFD426" : "#231F2C";
    if (pose === "sit") {
      // Sentado no pufe rosa com pernas abertas e tênis vermelhos/dourados
      ctx.save();
      ctx.rotate(-0.35);
      VB.celBox(ctx, -115, 130, 88, 48, 20, "#2460B8", 6, 0.2);
      VB.celBox(ctx, -140, 118, 42, 68, 20, goldenShoes ? "#FFD426" : "#E64855", 6, 0.2);
      ctx.restore();

      ctx.save();
      ctx.rotate(0.35);
      VB.celBox(ctx, 27, 130, 88, 48, 20, "#2460B8", 6, 0.2);
      VB.celBox(ctx, 98, 118, 42, 68, 20, goldenShoes ? "#FFD426" : "#E64855", 6, 0.2);
      ctx.restore();
    } else {
      const runCycle = goldenShoes ? Math.sin(t * 18) * 18 : 0;
      VB.celBox(ctx, -64, 155 + runCycle * 0.4, 56, 95, 18, "#2460B8", 6, 0.25);
      VB.celBox(ctx, 8, 155 - runCycle * 0.4, 56, 95, 18, "#2460B8", 6, 0.25);
      VB.celBox(ctx, -74, 228 + runCycle * 0.4, 68, 36, 16, shoeColor, 6, 0.2);
      VB.celBox(ctx, 6, 228 - runCycle * 0.4, 68, 36, 16, shoeColor, 6, 0.2);
      if (goldenShoes && pose !== "closeup") {
        drawLightningBolt(ctx, -92, 236 + Math.sin(t * 16) * 6, 0.52);
        drawLightningBolt(ctx, 92, 236 - Math.sin(t * 16) * 6, 0.52);
      }
    }

    // Braços (moletom ciano/roxo original PoxaRique!)
    const wave = Math.sin(t * 10) * 0.12;
    if (pose === "cheer") {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 82, 32);
        ctx.rotate(dir * -2.4 + wave * dir);
        VB.celBox(ctx, -24, 0, 48, 110, 22, "#FAD4B0", 6, 0.22);
        VB.celBox(ctx, -26, -10, 52, 52, 22, "#06B6D4", 6, 0.22);
        ctx.restore();
      });
    } else {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 86, 26);
        ctx.rotate(dir * 0.22 + wave * dir);
        VB.celBox(ctx, -24, 28, 48, 96, 22, "#FAD4B0", 6, 0.22);
        VB.celBox(ctx, -28, -4, 56, 58, 24, "#06B6D4", 6, 0.22);
        ctx.restore();
      });
    }

    // Tronco moletom ciano + raio dourado original
    VB.celBox(ctx, -76, 8, 152, 164, 30, "#06B6D4", 6, 0.24);
    drawLightningBolt(ctx, 0, 82, 1.15);

    // Cabeça
    ctx.save();
    ctx.translate(0, -105);

    // Fone gamer roxo nas laterais da cabeça
    [-108, 108].forEach((hx) => {
      VB.celBox(ctx, hx - 16, -34, 32, 68, 14, "#7C3AED", 5.5, 0.2);
    });

    // Rosto quadrado arredondado
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Cabelo espetado escuro + mecha ciano original (sem boné copiado!)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-108, -32);
    ctx.lineTo(-112, -92);
    ctx.lineTo(-68, -124);
    ctx.lineTo(-24, -102);
    ctx.lineTo(14, -134);
    ctx.lineTo(58, -102);
    ctx.lineTo(106, -116);
    ctx.lineTo(108, -32);
    ctx.quadraticCurveTo(40, -60, 0, -48);
    ctx.quadraticCurveTo(-50, -62, -108, -32);
    ctx.closePath();
    ctx.fillStyle = "#1E1B4B";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // Mecha ciano estilizada na franja
    VB.celBox(ctx, -28, -94, 58, 26, 12, "#22D3EE", 4.5, 0.2);
    ctx.restore();

    // Expressão facial
    drawFace(ctx, expr, false, t);
    ctx.restore();

    if (holdingTablet) {
      VB.drawTablet(ctx, 0, 96, 1.0);
    }

    if (breadBag) {
      // Sacola kraft recheada de pães de queijo/baguetes
      VB.celBox(ctx, 56, 48, 76, 92, 14, "#D97706", 5.5, 0.22);
      VB.celBox(ctx, 66, 24, 26, 42, 12, "#FBBF24", 5, 0.18);
      VB.celBox(ctx, 94, 28, 26, 38, 12, "#F59E0B", 5, 0.18);
    }

    if (typeof hp === "number") {
      const barY = nametag ? -308 : -262;
      VB.celBox(ctx, -96, barY, 192, 28, 12, "#16182D", 5, 0);
      const fillW = Math.max(14, Math.round(180 * Math.max(0, Math.min(100, hp)) / 100));
      VB.celBox(ctx, -90, barY + 4, fillW, 20, 8, hp <= 20 ? "#EF4444" : "#22C55E", 3, 0);
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

    // Braços com manga coral/vermelha original
    const wave = Math.sin(t * 12) * 0.14;
    if (pose === "cheer" || pose === "fall") {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 84, 30);
        ctx.rotate(dir * -2.35 + wave * dir);
        VB.celBox(ctx, -24, 0, 48, 104, 22, "#F97316", 6, 0.22);
        VB.celBox(ctx, -22, 86, 44, 38, 18, "#FAD4B0", 5.5, 0.2);
        ctx.restore();
      });
    } else {
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * 90, 24);
        ctx.rotate(dir * 0.14 + wave * dir);
        VB.celBox(ctx, -25, 0, 50, 112, 22, "#F97316", 6, 0.22);
        VB.celBox(ctx, -23, 94, 46, 40, 18, "#FAD4B0", 5.5, 0.2);
        ctx.restore();
      });
    }

    // Tronco: blusa branca interna + jaqueta coral/laranja aberta com botões
    VB.celBox(ctx, -76, 8, 152, 162, 26, "#F8FAFC", 6, 0.2);
    // Abas esquerda e direita da jaqueta
    VB.celBox(ctx, -76, 8, 52, 162, 20, "#F97316", 6, 0.18);
    VB.celBox(ctx, 24, 8, 52, 162, 20, "#F97316", 6, 0.28);
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
    const x = isLandscape ? 42 : 34;
    const y = isLandscape ? H - 72 : 54;
    const scale = isLandscape ? 0.88 : 0.88;

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
  /**
   * Personagem Vó ("Vó_Admin"): proporção oficial Vida de Bloco (cabeça 204x186, tronco 152x164),
   * coque grisalho com agulha dourada, óculos redondos fofos próprios (sem óculos da Mãe!),
   * vestido lilás florido + avental creme, panela fumegante / colher de pau / nota de R$50.
   */
  VB.drawVovo = function (ctx, opts = {}) {
    const rawExpr = opts.expr || opts.expression || "happy";
    const expr = rawExpr === "shock" ? "shocked_extreme" : rawExpr;
    const {
      x = 540,
      y = 960,
      scale = 1,
      pose = "stand",
      holdingPot = false,
      woodenSpoon = false,
      moneyNote = false,
      crown = false,
      t = 0,
      nametag = "",
    } = opts;

    const bob = Math.sin(t * 4.2) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(scale, scale);

    if (pose !== "closeup") {
      ctx.beginPath();
      ctx.ellipse(0, 268, 98, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }

    // Pernas + chinelinho branco/azul
    VB.celBox(ctx, -60, 152, 54, 96, 16, "#FAD4B0", 6, 0.22);
    VB.celBox(ctx, 6, 152, 54, 96, 16, "#FAD4B0", 6, 0.22);
    VB.celBox(ctx, -70, 232, 66, 30, 14, "#F8FAFC", 6, 0.18);
    VB.celBox(ctx, 4, 232, 66, 30, 14, "#F8FAFC", 6, 0.18);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#0284C7";
    [-37, 37].forEach((cx) => {
      ctx.beginPath();
      ctx.moveTo(cx - 18, 238);
      ctx.lineTo(cx, 226);
      ctx.lineTo(cx + 18, 238);
      ctx.stroke();
    });

    // Braços acolhedores
    const wave = Math.sin(t * 9) * 0.1;
    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * 88, 26);
      ctx.rotate(pose === "cheer" ? dir * -2.2 + wave * dir : dir * 0.18 + wave * dir);
      VB.celBox(ctx, -24, 0, 48, 52, 22, "#9333EA", 6, 0.22);
      VB.celBox(ctx, -22, 38, 44, 78, 20, "#FAD4B0", 6, 0.22);
      ctx.restore();
    });

    // Tronco vestido lilás + avental creme de babado
    VB.celBox(ctx, -78, 8, 156, 164, 30, "#9333EA", 6, 0.24);
    VB.celBox(ctx, -60, 30, 120, 136, 22, "#FEF3C7", 5.5, 0.18);
    // Coração rosa bordado no avental
    ctx.beginPath();
    ctx.arc(-10, 82, 10, 0, Math.PI * 2);
    ctx.arc(10, 82, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#F472B6";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-19, 86);
    ctx.lineTo(0, 108);
    ctx.lineTo(19, 86);
    ctx.closePath();
    ctx.fill();

    // Props da Vó
    if (woodenSpoon) {
      ctx.save();
      ctx.translate(106, 46);
      ctx.rotate(0.28 + Math.sin(t * 8) * 0.12);
      VB.celBox(ctx, -8, -70, 16, 110, 8, "#B45309", 5, 0.2);
      ctx.beginPath();
      ctx.ellipse(0, -86, 22, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#D97706";
      ctx.fill();
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.restore();
    }

    if (moneyNote) {
      ctx.save();
      ctx.translate(104, 66);
      ctx.rotate(-0.18 + Math.sin(t * 10) * 0.08);
      VB.celBox(ctx, -46, -26, 92, 52, 10, "#F59E0B", 5.5, 0.15);
      ctx.font = "900 24px 'Fredoka', sans-serif";
      ctx.fillStyle = "#78350F";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("R$50", 0, 1);
      ctx.restore();
    }

    if (holdingPot) {
      VB.celBox(ctx, -68, 72, 136, 74, 18, "#EF4444", 6, 0.24);
      VB.celBox(ctx, -84, 84, 20, 16, 6, "#1E293B", 5, 0);
      VB.celBox(ctx, 64, 84, 20, 16, 6, "#1E293B", 5, 0);
      VB.celBox(ctx, -72, 62, 144, 18, 9, "#F8FAFC", 5.5, 0.15);
      // Vapor quentinho subindo
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      [-32, 0, 32].forEach((sx, si) => {
        const rise = ((t * 38 + si * 18) % 44);
        ctx.beginPath();
        ctx.moveTo(sx, 52 - rise * 0.4);
        ctx.quadraticCurveTo(sx + 12, 34 - rise * 0.6, sx - 6, 16 - rise);
        ctx.stroke();
      });
    }

    // Cabeça 204x186 (proporção exata do canal)
    ctx.save();
    ctx.translate(0, -106);

    // Coque alto grisalho + agulha de tricô dourada com bolinha coral
    ctx.save();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-64, -148);
    ctx.lineTo(68, -98);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-68, -150, 13, 0, Math.PI * 2);
    ctx.fillStyle = "#FB7185";
    ctx.fill();
    ctx.stroke();
    VB.celBox(ctx, -56, -146, 112, 68, 34, "#CBD5E1", 6, 0.24);
    ctx.restore();

    // Brincos de pérola
    [-104, 104].forEach((ex) => {
      ctx.beginPath();
      ctx.arc(ex, 22, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#FEF9C3";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    });

    // Rosto
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Bochechas rosadas fofas da Vó
    [-68, 68].forEach((bx) => {
      ctx.beginPath();
      ctx.ellipse(bx, 22, 22, 13, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 113, 133, 0.38)";
      ctx.fill();
    });

    // Franja ondulada grisalha/branca
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-106, -24);
    ctx.lineTo(-106, -58);
    ctx.bezierCurveTo(-106, -130, 106, -130, 106, -58);
    ctx.lineTo(106, -24);
    ctx.quadraticCurveTo(54, -56, 0, -44);
    ctx.quadraticCurveTo(-54, -56, -106, -24);
    ctx.closePath();
    ctx.fillStyle = "#E2E8F0";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();

    // Coroa Admin opcional
    if (crown) {
      ctx.save();
      ctx.translate(0, -152);
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

    // Expressão facial SEM óculos da Mãe (isMom = false!)
    drawFace(ctx, expr, false, t);

    // Óculos redondos dourados exclusivos da Vó + cordinha lateral
    [-48, 48].forEach((gx) => {
      ctx.beginPath();
      ctx.arc(gx, -6, 32, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(254, 249, 195, 0.28)";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#D97706";
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(16, -6);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#D97706";
    ctx.stroke();

    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, crown ? -328 : -296, nametag, "#FFD426");
    }

    ctx.restore();
  };

  /**
   * Personagem Diretora ("Diretora_Brava"): proporção 204x186 / 152x164,
   * coque rígido, óculos gatinho vermelhos (sem óculos da Mãe!), blazer azul-marinho,
   * crachá ADMIN, apito prateado, megafone e cronômetro.
   */
  VB.drawDiretora = function (ctx, opts = {}) {
    const rawExpr = opts.expr || opts.expression || "scream";
    const expr = rawExpr === "shock" ? "shocked_extreme" : rawExpr === "angry" ? "scream" : rawExpr;
    const {
      x = 540,
      y = 960,
      scale = 1,
      pose = "stand",
      megaphone = false,
      stopwatch = true,
      t = 0,
      nametag = "",
    } = opts;

    const bob = Math.sin(t * 5) * 3;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(scale, scale);

    if (pose !== "closeup") {
      ctx.beginPath();
      ctx.ellipse(0, 268, 95, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }

    // Pernas + sapatos sociais
    VB.celBox(ctx, -60, 152, 54, 100, 16, "#1E293B", 6, 0.25);
    VB.celBox(ctx, 6, 152, 54, 100, 16, "#1E293B", 6, 0.25);
    VB.celBox(ctx, -68, 232, 64, 34, 14, "#0F172A", 6, 0.2);
    VB.celBox(ctx, 4, 232, 64, 34, 14, "#0F172A", 6, 0.2);

    // Braços de blazer
    const wave = Math.sin(t * 10) * 0.12;
    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * 88, 24);
      ctx.rotate(dir * 0.2 + wave * dir);
      VB.celBox(ctx, -24, 0, 48, 94, 20, "#1E3A8A", 6, 0.22);
      VB.celBox(ctx, -22, 82, 44, 38, 16, "#FAD4B0", 5.5, 0.2);
      ctx.restore();
    });

    // Blazer azul-marinho + camisa branca + gravata vermelha + crachá ADMIN
    VB.celBox(ctx, -78, 8, 156, 164, 26, "#1E3A8A", 6, 0.24);
    VB.celBox(ctx, -28, 8, 56, 98, 12, "#F8FAFC", 5, 0);
    VB.celBox(ctx, -12, 16, 24, 78, 8, "#DC2626", 4.5, 0.2);
    VB.celBox(ctx, 22, 44, 46, 32, 8, "#FEF08A", 4.5, 0);

    // Cronômetro dourado
    if (stopwatch) {
      ctx.save();
      ctx.translate(-108, 118);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD426";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(t * 12) * 14, Math.sin(t * 12) * 14);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = "#DC2626";
      ctx.stroke();
      ctx.restore();
    }

    // Megafone soltando ondas sonoras
    if (megaphone) {
      ctx.save();
      ctx.translate(116, 62);
      ctx.rotate(-0.22);
      ctx.beginPath();
      ctx.moveTo(-22, -16);
      ctx.lineTo(48, -42);
      ctx.lineTo(48, 34);
      ctx.lineTo(-22, 12);
      ctx.closePath();
      ctx.fillStyle = "#F8FAFC";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      VB.celBox(ctx, 40, -44, 18, 80, 8, "#EF4444", 5.5, 0.2);
      ctx.restore();
    }

    // Cabeça 204x186
    ctx.save();
    ctx.translate(0, -106);

    // Coque rígido escuro no topo
    VB.celBox(ctx, -46, -142, 92, 58, 22, "#1E1B4B", 6, 0.24);
    VB.celBox(ctx, -48, -96, 96, 16, 8, "#BE123C", 5, 0);

    // Rosto
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Cabelo puxado rigoroso
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-106, -26);
    ctx.lineTo(-106, -58);
    ctx.bezierCurveTo(-106, -128, 106, -128, 106, -58);
    ctx.lineTo(106, -26);
    ctx.lineTo(0, -64);
    ctx.closePath();
    ctx.fillStyle = "#1E1B4B";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();

    drawFace(ctx, expr, false, t);

    // Óculos gatinho vermelhos exclusivos da Diretora
    [-50, 50].forEach((gx, idx) => {
      const dir = idx === 0 ? -1 : 1;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(gx - dir * 34, -4);
      ctx.lineTo(gx + dir * 44, -30);
      ctx.lineTo(gx + dir * 38, 14);
      ctx.lineTo(gx - dir * 30, 14);
      ctx.closePath();
      ctx.fillStyle = "rgba(254, 202, 202, 0.36)";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#DC2626";
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.restore();
    });
    ctx.beginPath();
    ctx.moveTo(-18, -6);
    ctx.lineTo(18, -6);
    ctx.lineWidth = 5.5;
    ctx.strokeStyle = "#DC2626";
    ctx.stroke();

    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, -278, nametag, "#FF66B2");
    }

    ctx.restore();
  };

  /**
   * Personagem Seu Zé Padeiro: chapéu branco fofo de padeiro, bigode marrom, avental e bandeja de pães de queijo.
   */
  VB.drawPadeiro = function (ctx, opts = {}) {
    const rawExpr = opts.expr || opts.expression || "shocked_extreme";
    const expr = rawExpr === "shock" ? "shocked_extreme" : rawExpr;
    const {
      x = 540,
      y = 960,
      scale = 1,
      t = 0,
      nametag = "",
    } = opts;

    const bob = Math.sin(t * 5) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.ellipse(0, 268, 95, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    VB.celBox(ctx, -60, 152, 54, 100, 16, "#334155", 6, 0.24);
    VB.celBox(ctx, 6, 152, 54, 100, 16, "#334155", 6, 0.24);
    VB.celBox(ctx, -68, 232, 64, 34, 14, "#1E293B", 6, 0.2);
    VB.celBox(ctx, 4, 232, 64, 34, 14, "#1E293B", 6, 0.2);

    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * 88, 26);
      ctx.rotate(dir * 0.22);
      VB.celBox(ctx, -24, 0, 48, 52, 20, "#FFFFFF", 6, 0.2);
      VB.celBox(ctx, -22, 42, 44, 72, 18, "#FAD4B0", 6, 0.22);
      ctx.restore();
    });

    // Camisa branca + avental bege
    VB.celBox(ctx, -78, 8, 156, 164, 28, "#FFFFFF", 6, 0.2);
    VB.celBox(ctx, -62, 26, 124, 142, 20, "#FDE68A", 5.5, 0.2);

    // Bandeja de pães de queijo dourados
    VB.celBox(ctx, -88, 92, 176, 22, 10, "#94A3B8", 5.5, 0.2);
    [-54, -18, 18, 54].forEach((px) => {
      ctx.beginPath();
      ctx.arc(px, 80, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    });

    // Cabeça 204x186 + Chapéu de Padeiro
    ctx.save();
    ctx.translate(0, -106);
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);

    // Chapéu branco alto de padeiro
    VB.celBox(ctx, -78, -162, 156, 76, 34, "#FFFFFF", 6, 0.2);
    VB.celBox(ctx, -84, -102, 168, 28, 10, "#F1F5F9", 6, 0.18);

    drawFace(ctx, expr, false, t);

    // Bigode marrom simpático
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.quadraticCurveTo(-36, 10, -56, 32);
    ctx.quadraticCurveTo(-24, 40, 0, 30);
    ctx.quadraticCurveTo(24, 40, 56, 32);
    ctx.quadraticCurveTo(36, 10, 0, 24);
    ctx.fillStyle = "#78350F";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, -296, nametag, "#FFD426");
    }

    ctx.restore();
  };

  /**
   * Prop icônico: Chinelo Mítico Brasileiro (Havaiana branca/azul com aura lendária opcional)
   */
  VB.drawChinelo = function (ctx, x, y, scale = 1, rot = 0, glow = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    if (glow) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 92, 54, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 212, 38, 0.34)";
      ctx.fill();
    }

    // Sola branca com lateral azul clássica
    VB.celBox(ctx, -68, -30, 136, 60, 28, "#38BDF8", 6, 0.2);
    VB.celBox(ctx, -64, -26, 128, 50, 24, "#F8FAFC", 5, 0.12);

    // Tiras azuis em Y
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0284C7";
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(-18, -22);
    ctx.moveTo(28, 0);
    ctx.lineTo(-18, 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(28, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#1E3A8A";
    ctx.fill();
    ctx.restore();
  };

  /**
   * Personagem Caixa de Supermercado ("Caixa_Turbo_999"): boné/viseira vermelha, colete vermelho/amarelo,
   * leitor laser de código de barras na mão, proporção oficial 204x186 / 156x164 e isMom=false!
   */
  VB.drawCaixa = function (ctx, opts = {}) {
    const rawExpr = opts.expr || opts.expression || "side_eye";
    const expr = rawExpr === "shock" ? "shocked_extreme" : rawExpr;
    const {
      x = 540,
      y = 960,
      scale = 1,
      scanner = true,
      t = 0,
      nametag = "",
    } = opts;

    const bob = Math.sin(t * 7) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.ellipse(0, 268, 95, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    VB.celBox(ctx, -60, 152, 54, 100, 16, "#1E293B", 6, 0.24);
    VB.celBox(ctx, 6, 152, 54, 100, 16, "#1E293B", 6, 0.24);
    VB.celBox(ctx, -68, 232, 64, 34, 14, "#0F172A", 6, 0.2);
    VB.celBox(ctx, 4, 232, 64, 34, 14, "#0F172A", 6, 0.2);

    const scanWave = Math.sin(t * 16) * 0.18;
    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * 88, 26);
      ctx.rotate(dir === -1 ? -0.45 + scanWave : 0.22);
      VB.celBox(ctx, -24, 0, 48, 52, 20, "#DC2626", 6, 0.22);
      VB.celBox(ctx, -22, 42, 44, 72, 18, "#FAD4B0", 6, 0.22);
      ctx.restore();
    });

    // Uniforme supermercado (camisa amarela + colete vermelho + crachá)
    VB.celBox(ctx, -78, 8, 156, 164, 28, "#FACC15", 6, 0.2);
    VB.celBox(ctx, -78, 8, 52, 164, 20, "#DC2626", 6, 0.2);
    VB.celBox(ctx, 26, 8, 52, 164, 20, "#DC2626", 6, 0.26);
    VB.celBox(ctx, 32, 46, 38, 26, 6, "#FFFFFF", 4, 0);

    // Leitor de código de barras disparando feixe vermelho!
    if (scanner) {
      ctx.save();
      ctx.translate(-118, 72 + Math.sin(t * 16) * 10);
      VB.celBox(ctx, -28, -18, 56, 32, 10, "#1E293B", 5, 0.2);
      VB.celBox(ctx, -10, 8, 20, 36, 8, "#334155", 5, 0.2);
      ctx.beginPath();
      ctx.moveTo(-28, -2);
      ctx.lineTo(-120, -28);
      ctx.lineTo(-120, 24);
      ctx.closePath();
      ctx.fillStyle = "rgba(239, 68, 68, 0.48)";
      ctx.fill();
      ctx.restore();
    }

    // Cabeça 204x186 + Boné vermelho do mercado
    ctx.save();
    ctx.translate(0, -106);
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);
    VB.celBox(ctx, -106, -118, 212, 62, 28, "#DC2626", 6, 0.22);
    VB.celBox(ctx, -124, -74, 150, 22, 10, "#991B1B", 5.5, 0);

    drawFace(ctx, expr, false, t);
    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, -278, nametag, "#FFD426");
    }

    ctx.restore();
  };

  // =========================================================================
  // MOTORISTA DO ÔNIBUS ESCOLAR
  // =========================================================================
  VB.drawMotorista = function (ctx, opts = {}) {
    const {
      x = 0,
      y = 0,
      scale = 1,
      expr = "neutral",
      t = 0,
      nametag = null,
      flip = false,
    } = opts;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip ? -scale : scale, scale);

    // Sombra no chão
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 272, 110, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas (calça azul escura)
    VB.celBox(ctx, -64, 168, 54, 96, 16, "#1E293B", 6, 0.24);
    VB.celBox(ctx, 10, 168, 54, 96, 16, "#1E293B", 6, 0.24);
    VB.celBox(ctx, -70, 244, 62, 30, 12, "#111827", 5.5, 0.2);
    VB.celBox(ctx, 8, 244, 62, 30, 12, "#111827", 5.5, 0.2);

    // Tronco (camisa azul claro de motorista + gravata)
    VB.celBox(ctx, -78, 8, 156, 164, 28, "#38BDF8", 6, 0.24);
    // Gravata azul marinho
    ctx.fillStyle = "#1E3A8A";
    ctx.strokeStyle = "#1A1423";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.lineTo(10, 16);
    ctx.lineTo(14, 95);
    ctx.lineTo(0, 114);
    ctx.lineTo(-14, 95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Braços
    VB.celBox(ctx, -124, 16, 44, 124, 20, "#38BDF8", 6, 0.22);
    VB.celBox(ctx, -122, 126, 40, 34, 14, "#FAD4B0", 5.5, 0.2);
    VB.celBox(ctx, 80, 16, 44, 124, 20, "#38BDF8", 6, 0.22);
    VB.celBox(ctx, 82, 126, 40, 34, 14, "#FAD4B0", 5.5, 0.2);

    // Cabeça 204x186 + Quepe de motorista
    ctx.save();
    ctx.translate(0, -106);
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);
    // Bigode
    VB.celBox(ctx, -42, 32, 84, 20, 10, "#334155", 4.5, 0);
    drawFace(ctx, expr, false, t);
    // Quepe azul marinho
    VB.celBox(ctx, -108, -124, 216, 56, 22, "#1E3A8A", 6, 0.24);
    VB.celBox(ctx, -120, -76, 240, 20, 10, "#0F172A", 5, 0);
    // Distintivo dourado no quepe
    VB.celBox(ctx, -18, -112, 36, 24, 8, "#FACC15", 4, 0);
    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, -278, nametag, "#38BDF8");
    }

    ctx.restore();
  };

  // =========================================================================
  // SÍNDICA DO CONDOMÍNIO (com Megafone opcional)
  // =========================================================================
  VB.drawSindica = function (ctx, opts = {}) {
    const {
      x = 0,
      y = 0,
      scale = 1,
      expr = "angry",
      t = 0,
      nametag = null,
      flip = false,
      megaphone = true,
    } = opts;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip ? -scale : scale, scale);

    // Sombra no chão
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 272, 110, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas
    VB.celBox(ctx, -60, 168, 50, 96, 16, "#312E81", 6, 0.24);
    VB.celBox(ctx, 10, 168, 50, 96, 16, "#312E81", 6, 0.24);
    VB.celBox(ctx, -66, 244, 58, 30, 12, "#111827", 5.5, 0.2);
    VB.celBox(ctx, 8, 244, 58, 30, 12, "#111827", 5.5, 0.2);

    // Tronco (blazer roxo/vinho de síndica)
    VB.celBox(ctx, -78, 8, 156, 164, 28, "#7E22CE", 6, 0.24);
    VB.celBox(ctx, -24, 14, 48, 140, 12, "#F8FAFC", 4.5, 0);

    // Braço esquerdo
    VB.celBox(ctx, -124, 16, 44, 124, 20, "#7E22CE", 6, 0.22);
    VB.celBox(ctx, -122, 126, 40, 34, 14, "#FAD4B0", 5.5, 0.2);

    // Braço direito (segurando megafone ou normal)
    if (megaphone) {
      VB.celBox(ctx, 80, 10, 44, 110, 20, "#7E22CE", 6, 0.22);
      VB.celBox(ctx, 84, -8, 40, 34, 14, "#FAD4B0", 5.5, 0.2);
      // Megafone vermelho e branco
      ctx.save();
      ctx.translate(128, -45);
      ctx.rotate(-0.15);
      VB.celBox(ctx, -16, 12, 22, 38, 8, "#334155", 4.5, 0);
      ctx.fillStyle = "#EF4444";
      ctx.strokeStyle = "#1A1423";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-20, -14);
      ctx.lineTo(54, -36);
      ctx.lineTo(54, 36);
      ctx.lineTo(-20, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      VB.celBox(ctx, 48, -38, 14, 76, 6, "#F8FAFC", 4.5, 0);
      ctx.restore();
    } else {
      VB.celBox(ctx, 80, 16, 44, 124, 20, "#7E22CE", 6, 0.22);
      VB.celBox(ctx, 82, 126, 40, 34, 14, "#FAD4B0", 5.5, 0.2);
    }

    // Cabeça 204x186 + Coque de síndica + Óculos
    ctx.save();
    ctx.translate(0, -106);
    // Coque no topo
    VB.celBox(ctx, -44, -138, 88, 56, 26, "#475569", 6, 0.22);
    VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24);
    drawFace(ctx, expr, false, t);
    // Óculos retangulares da síndica
    ctx.strokeStyle = "#1A1423";
    ctx.lineWidth = 6;
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-74, -34, 60, 42);
    ctx.strokeRect(-74, -34, 60, 42);
    ctx.fillRect(14, -34, 60, 42);
    ctx.strokeRect(14, -34, 60, 42);
    ctx.beginPath();
    ctx.moveTo(-14, -14);
    ctx.lineTo(14, -14);
    ctx.stroke();
    ctx.restore();

    if (nametag) {
      VB.drawNametag(ctx, 0, -296, nametag, "#C084FC");
    }

    ctx.restore();
  };
})(window.VB);
