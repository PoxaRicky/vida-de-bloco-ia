const fs = require("fs");
const path = require("path");

const VALID_SPEAKERS = new Set([
  "menino",
  "mae",
  "vo",
  "vovo",
  "diretora",
  "professor",
  "padeiro",
  "amigo",
  "npc",
  "narrador",
  "caixa",
  "motorista",
  "sindica",
]);

const VALID_CHARS = new Set([
  "menino",
  "boy",
  "mae",
  "mom",
  "caramelo",
  "dog",
  "vo",
  "vovo",
  "professor",
  "prof",
  "diretora",
  "padeiro",
  "amigo",
  "npc",
  "caixa",
  "motorista",
  "sindica",
]);

const VALID_PATHS = new Set(["none", "walk", "run", "jump_platforms", "fall"]);

const VALID_SFX = new Set([
  "jump",
  "land",
  "lava",
  "lava_burn",
  "error_buzzer",
  "pix_ding",
  "cash_register",
  "whoosh",
  "pop",
  "vine_boom_lite",
  "powerup",
  "alarm",
  "shock",
  "win",
]);

function getKnownEnvPresets() {
  const envFile = path.resolve(__dirname, "../assets/scenes/environments.js");
  const presets = new Set(["custom"]);
  if (fs.existsSync(envFile)) {
    const src = fs.readFileSync(envFile, "utf-8");
    const re = /envName\s*===\s*["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      presets.add(m[1]);
    }
  }
  return presets;
}

function validateScript(scriptInput, opts = {}) {
  const errors = [];
  const warnings = [];
  let data = scriptInput;
  let label = "inline";

  if (typeof scriptInput === "string") {
    label = scriptInput;
    if (!fs.existsSync(scriptInput)) {
      return { valid: false, errors: [`Arquivo não encontrado: ${scriptInput}`], warnings, estimatedSec: 0 };
    }
    try {
      data = JSON.parse(fs.readFileSync(scriptInput, "utf-8"));
    } catch (err) {
      return { valid: false, errors: [`JSON inválido em ${scriptInput}: ${err.message}`], warnings, estimatedSec: 0 };
    }
  }

  if (!data || typeof data !== "object") {
    errors.push("Raiz do roteiro deve ser um objeto JSON.");
    return { valid: false, errors, warnings, estimatedSec: 0 };
  }

  const formato = String(data.formato || "short").toLowerCase();
  if (!["short", "long"].includes(formato)) {
    errors.push(`Campo 'formato' inválido ('${data.formato}'). Use 'short' ou 'long'.`);
  }

  if (!data.titulo || typeof data.titulo !== "string") {
    warnings.push("Campo 'titulo' ausente ou vazio.");
  }

  if (!Array.isArray(data.cenas) || data.cenas.length === 0) {
    errors.push("Campo 'cenas' deve ser um array não vazio.");
    return { valid: false, errors, warnings, estimatedSec: 0 };
  }

  const knownEnvs = getKnownEnvPresets();
  let totalWords = 0;

  data.cenas.forEach((cena, idx) => {
    const tag = `Cena ${idx} (${cena.id || "sem_id"})`;
    if (!cena.texto || typeof cena.texto !== "string" || !cena.texto.trim()) {
      errors.push(`${tag}: campo 'texto' é obrigatório.`);
    } else {
      const charCount = cena.texto.trim().length;
      const wordCount = cena.texto.trim().split(/\s+/).length;
      totalWords += wordCount;
      const maxChars = formato === "short" ? 150 : 260;
      if (charCount > maxChars) {
        warnings.push(`${tag}: texto longo (${charCount} chars; recomendado <= ${maxChars} para ritmo dinâmico).`);
      }
    }

    if (cena.voz && !VALID_SPEAKERS.has(String(cena.voz).toLowerCase())) {
      warnings.push(`${tag}: voz '${cena.voz}' não listada no catálogo padrão (usará fallback 'narrador').`);
    }

    const hasCustomActors = Array.isArray(cena.personagens) && cena.personagens.length > 0;
    if (!cena.ambiente && !hasCustomActors) {
      errors.push(`${tag}: informe um 'ambiente' válido ou defina 'personagens'.`);
    } else if (cena.ambiente && !knownEnvs.has(cena.ambiente) && !hasCustomActors) {
      errors.push(`${tag}: ambiente '${cena.ambiente}' desconhecido em environments.js.`);
    }

    if (Array.isArray(cena.personagens)) {
      cena.personagens.forEach((p, pi) => {
        const tipo = String(p.tipo || p.personagem || "menino").toLowerCase();
        if (!VALID_CHARS.has(tipo)) {
          warnings.push(`${tag} [personagem ${pi}]: tipo '${tipo}' usará rig modular NPC.`);
        }
        if (p.path && !VALID_PATHS.has(String(p.path).toLowerCase())) {
          errors.push(`${tag} [personagem ${pi}]: path '${p.path}' inválido. Use jump_platforms | walk | run | fall.`);
        }
      });
    }

    if (cena.sfx) {
      const list = Array.isArray(cena.sfx) ? cena.sfx : [cena.sfx];
      list.forEach((item) => {
        const rawName = typeof item === "string" ? item : item && item.name;
        const clean = String(rawName || "").replace(/\.wav$/i, "");
        if (!VALID_SFX.has(clean)) {
          errors.push(`${tag}: SFX '${rawName}' não existe em generate_sfx.py.`);
        }
      });
    }
  });

  // Estimativa de duração (~2.85 palavras/seg + 0.3s por transição/respiro)
  const estimatedSec = Number((totalWords / 2.85 + data.cenas.length * 0.28).toFixed(1));

  if (formato === "short") {
    if (estimatedSec < 18 || estimatedSec > 35) {
      warnings.push(
        `Duração estimada do Short: ~${estimatedSec}s (janela ideal recomendada para retenção: 18s a 35s).`
      );
    }

    // Gancho nos primeiros 3s (Cena 0)
    const first = data.cenas[0];
    const firstText = String(first.texto || "").toLowerCase();
    const hasHook =
      firstText.includes("e se") ||
      firstText.includes("?") ||
      firstText.includes("imagina") ||
      String(first.id || "").includes("hook") ||
      String(first.ambiente || "").includes("hook");
    if (!hasHook) {
      warnings.push("Cena 0 não parece conter um gancho explícito ('E se...?' / pergunta nos primeiros 3s).");
    }

    // CTA na última cena
    const last = data.cenas[data.cenas.length - 1];
    const lastText = String(last.texto || "").toLowerCase();
    const hasCta =
      lastText.includes("comenta") ||
      lastText.includes("inscreva") ||
      lastText.includes("curte") ||
      lastText.includes("qual") ||
      lastText.includes("deixa o like") ||
      String(last.id || "").includes("cta") ||
      String(last.ambiente || "").includes("cta");
    if (!hasCta) {
      warnings.push("Última cena não contém chamada para ação clara (CTA: 'Comenta...', 'Inscreva-se...', etc.).");
    }
  }

  const valid = errors.length === 0;
  if (!opts.silent) {
    console.log(`[Validator] '${path.basename(label)}' -> ${valid ? "OK" : "FALHOU"} (~${estimatedSec}s estimados, ${data.cenas.length} cenas)`);
    warnings.forEach((w) => console.log(`  [AVISO] ${w}`));
    errors.forEach((e) => console.error(`  [ERRO]  ${e}`));
  }

  return { valid, errors, warnings, estimatedSec };
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error("Uso: node scripts/validate_script.js <scripts/roteiro.json>");
    process.exit(1);
  }
  const res = validateScript(target);
  process.exit(res.valid ? 0 : 1);
}

module.exports = { validateScript };
