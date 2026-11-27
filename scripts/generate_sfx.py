import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for s in samples:
            clamped = max(-0.98, min(0.98, s))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wf.writeframes(bytes(frames))


def gen_whoosh(dur: float = 0.24) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(42)
    out = []
    lp = 0.0
    for i in range(n):
        p = i / n
        env = math.sin(p * math.pi) ** 1.4
        noise = rng.uniform(-1.0, 1.0)
        alpha = 0.06 + 0.35 * math.sin(p * math.pi)
        lp = lp + alpha * (noise - lp)
        sweep = math.sin(2 * math.pi * (180 + 520 * (1 - p)) * (i / SAMPLE_RATE)) * 0.25
        out.append((lp * 0.75 + sweep) * env * 0.65)
    return out


def gen_pop(dur: float = 0.15) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        p = i / n
        freq = 320 + 720 * (p ** 0.58)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = (1 - p) ** 2.1
        out.append(math.sin(phase) * env * 0.72)
    return out


def gen_jump(dur: float = 0.28) -> list[float]:
    """Pulo elástico arcade estilo plataforma/Roblox."""
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        p = i / n
        freq = 210 + 590 * (p ** 0.65)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = math.sin(min(1.0, p * 1.1) * math.pi) * ((1 - p) ** 0.55)
        wave_s = 0.75 * math.sin(phase) + 0.25 * math.sin(phase * 2)
        out.append(wave_s * env * 0.68)
    return out


def gen_land(dur: float = 0.18) -> list[float]:
    """Impacto curto e macio de aterrissagem na plataforma."""
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(17)
    out = []
    phase = 0.0
    lp = 0.0
    for i in range(n):
        p = i / n
        freq = max(55.0, 190.0 * ((1 - p) ** 1.6))
        phase += 2 * math.pi * freq / SAMPLE_RATE
        thud = math.sin(phase) * ((1 - p) ** 2.3)
        lp = lp + 0.14 * (rng.uniform(-1, 1) - lp)
        out.append((thud * 0.8 + lp * ((1 - p) ** 2.8) * 0.35) * 0.75)
    return out


def gen_shock(dur: float = 0.42) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        p = i / n
        env = (1 - p) ** 1.5
        s = (
            math.sin(2 * math.pi * 220 * t)
            + 0.8 * math.sin(2 * math.pi * 311.13 * t)
            + 0.7 * math.sin(2 * math.pi * 440 * t)
            + 0.4 * math.sin(2 * math.pi * 622.25 * t)
        ) / 2.9
        out.append(s * env * 0.75)
    return out


def gen_lava_burn(dur: float = 0.55) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(99)
    out = []
    phase = 0.0
    lp = 0.0
    for i in range(n):
        p = i / n
        freq = max(90.0, 420.0 - p * 520.0)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        drop = math.sin(phase) * ((1 - p) ** 1.8) * 0.55
        noise = rng.uniform(-1, 1)
        lp = lp + 0.22 * (noise - lp)
        sizzle = lp * math.sin(min(1.0, p * 2.2) * math.pi) * 0.62
        out.append((drop + sizzle) * 0.76)
    return out


def gen_error_buzzer(dur: float = 0.44) -> list[float]:
    """Buzzer duplo de erro / BAN."""
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        p = i / n
        gate = 1.0 if (p < 0.42 or p > 0.54) else 0.08
        env = gate * ((1 - p * 0.45))
        saw = (
            math.sin(2 * math.pi * 138.59 * t)
            + 0.65 * math.sin(2 * math.pi * 146.83 * t)
            + 0.5 * math.sin(2 * math.pi * 277.18 * t)
            + 0.35 * math.sin(2 * math.pi * 415.30 * t)
        ) / 2.5
        out.append(saw * env * 0.68)
    return out


def gen_pix_ding(dur: float = 0.48) -> list[float]:
    """Sino cristalino de duas notas estilo notificação Pix."""
    n = int(SAMPLE_RATE * dur)
    out = []
    split = int(n * 0.28)
    for i in range(n):
        t = i / SAMPLE_RATE
        if i < split:
            lp = i / split
            freq = 987.77  # B5
            env = math.exp(-lp * 3.2)
        else:
            lp = (i - split) / (n - split)
            freq = 1318.51  # E6
            env = math.exp(-lp * 4.0)
        bell = 0.72 * math.sin(2 * math.pi * freq * t) + 0.28 * math.sin(2 * math.pi * (freq * 2.0) * t)
        out.append(bell * env * 0.72)
    return out


def gen_cash_register(dur: float = 0.56) -> list[float]:
    """Cha-ching metálico de caixa registradora."""
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(77)
    out = []
    split = int(n * 0.22)
    hp = 0.0
    prev = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        noise = rng.uniform(-1, 1)
        hp = noise - prev
        prev = noise
        if i < split:
            lp = i / split
            drawer = hp * (1 - lp) * 0.45
            out.append(drawer)
        else:
            lp = (i - split) / (n - split)
            env = math.exp(-lp * 4.5)
            ring = (
                0.55 * math.sin(2 * math.pi * 1567.98 * t)
                + 0.30 * math.sin(2 * math.pi * 2349.32 * t)
                + 0.15 * math.sin(2 * math.pi * 3135.96 * t)
            )
            out.append((ring * env + hp * math.exp(-lp * 12) * 0.18) * 0.72)
    return out


def gen_vine_boom_lite(dur: float = 0.58) -> list[float]:
    """Sub-grave dramático limpo para close-up/choque."""
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(12)
    out = []
    phase = 0.0
    for i in range(n):
        p = i / n
        freq = 44.0 + 96.0 * math.exp(-p * 9.5)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = math.exp(-p * 3.6)
        transient = rng.uniform(-1, 1) * math.exp(-p * 32.0) * 0.35
        sub = math.tanh(math.sin(phase) * 1.45) * env
        out.append((sub * 0.82 + transient) * 0.78)
    return out


def gen_powerup(dur: float = 0.52) -> list[float]:
    """Arpejo ascendente energético de upgrade / VIP."""
    notes = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51]
    n = int(SAMPLE_RATE * dur)
    seg = max(1, n // len(notes))
    out = []
    for i in range(n):
        idx = min(len(notes) - 1, i // seg)
        lp = (i % seg) / seg
        t = i / SAMPLE_RATE
        freq = notes[idx]
        env = 1.0 - lp * 0.45
        s = 0.68 * math.sin(2 * math.pi * freq * t) + 0.32 * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env * 0.62)
    return out


def gen_alarm(dur: float = 0.62) -> list[float]:
    """Sirene urgente escolar / alerta do servidor."""
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        p = i / n
        lfo = math.sin(2 * math.pi * 4.5 * (i / SAMPLE_RATE))
        freq = 740.0 + 220.0 * lfo
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = math.sin(min(1.0, p * 8) * math.pi * 0.5) * (1 - max(0.0, (p - 0.8) / 0.2))
        s = 0.75 * math.sin(phase) + 0.25 * math.sin(phase * 3)
        out.append(s * env * 0.56)
    return out


def gen_win(dur: float = 0.52) -> list[float]:
    notes = [523.25, 659.25, 783.99, 1046.50]
    n = int(SAMPLE_RATE * dur)
    out = []
    seg = n // len(notes)
    for i in range(n):
        idx = min(len(notes) - 1, i // seg)
        local_p = (i % seg) / seg
        freq = notes[idx]
        t = i / SAMPLE_RATE
        env = 1 - local_p * 0.65
        s = 0.7 * math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env * 0.6)
    return out


def gen_bgm_loop(dur: float = 16.0) -> list[float]:
    """Trilha leve, animada e 100% autoral estilo marimba/blocos (120 BPM)."""
    bpm = 120.0
    step_sec = (60.0 / bpm) / 2.0
    melody = [
        523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46,
        493.88, 587.33, 783.99, 587.33, 523.25, 659.25, 783.99, 1046.50,
    ]
    bass = [130.81, 146.83, 98.00, 130.81]
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        step = int(t / step_sec)
        local_t = t - step * step_sec
        local_p = local_t / step_sec

        m_freq = melody[step % len(melody)]
        m_env = math.exp(-local_p * 4.5)
        marimba = (
            0.75 * math.sin(2 * math.pi * m_freq * local_t)
            + 0.25 * math.sin(2 * math.pi * m_freq * 3 * local_t)
        ) * m_env

        b_step = int(t / (step_sec * 4))
        b_local_p = (t % (step_sec * 4)) / (step_sec * 4)
        b_freq = bass[b_step % len(bass)]
        bass_wave = math.sin(2 * math.pi * b_freq * t) * math.exp(-b_local_p * 2.5) * 0.45

        out.append((marimba * 0.55 + bass_wave) * 0.45)
    return out


def main() -> None:
    sfx_dir = Path("assets/sfx")
    lava_samples = gen_lava_burn()
    catalog = {
        "whoosh.wav": gen_whoosh(),
        "pop.wav": gen_pop(),
        "jump.wav": gen_jump(),
        "land.wav": gen_land(),
        "shock.wav": gen_shock(),
        "lava.wav": lava_samples,
        "lava_burn.wav": lava_samples,
        "error_buzzer.wav": gen_error_buzzer(),
        "pix_ding.wav": gen_pix_ding(),
        "cash_register.wav": gen_cash_register(),
        "vine_boom_lite.wav": gen_vine_boom_lite(),
        "powerup.wav": gen_powerup(),
        "alarm.wav": gen_alarm(),
        "win.wav": gen_win(),
        "bgm_loop.wav": gen_bgm_loop(16.0),
    }
    for filename, samples in catalog.items():
        write_wav(sfx_dir / filename, samples)
    print(f"Biblioteca procedural com {len(catalog)} arquivos WAV gerada em {sfx_dir}")


if __name__ == "__main__":
    main()
