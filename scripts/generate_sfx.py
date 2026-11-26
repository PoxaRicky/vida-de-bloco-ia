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


def gen_pop(dur: float = 0.16) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        p = i / n
        freq = 320 + 680 * (p ** 0.6)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        env = (1 - p) ** 2.0
        out.append(math.sin(phase) * env * 0.7)
    return out


def gen_shock(dur: float = 0.42) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        p = i / n
        env = (1 - p) ** 1.5
        # Acorde dramático estilo desenho/game
        s = (
            math.sin(2 * math.pi * 220 * t)
            + 0.8 * math.sin(2 * math.pi * 311.13 * t)
            + 0.7 * math.sin(2 * math.pi * 440 * t)
            + 0.4 * math.sin(2 * math.pi * 622.25 * t)
        ) / 2.9
        out.append(s * env * 0.75)
    return out


def gen_splash_lava(dur: float = 0.55) -> list[float]:
    n = int(SAMPLE_RATE * dur)
    rng = random.Random(99)
    out = []
    phase = 0.0
    lp = 0.0
    for i in range(n):
        p = i / n
        # Queda "oof/boing" + chiado de lava
        freq = max(90.0, 420.0 - p * 520.0)
        phase += 2 * math.pi * freq / SAMPLE_RATE
        drop = math.sin(phase) * ((1 - p) ** 1.8) * 0.55
        noise = rng.uniform(-1, 1)
        lp = lp + 0.18 * (noise - lp)
        sizzle = lp * math.sin(min(1.0, p * 2.5) * math.pi) * 0.55
        out.append((drop + sizzle) * 0.75)
    return out


def gen_win(dur: float = 0.52) -> list[float]:
    notes = [523.25, 659.25, 783.99, 1046.50]  # C5 E5 G5 C6
    n = int(SAMPLE_RATE * dur)
    out = []
    seg = n // len(notes)
    for i in range(n):
        idx = min(len(notes) - 1, i // seg)
        local_p = (i % seg) / seg
        freq = notes[idx]
        t = i / SAMPLE_RATE
        env = (1 - local_p * 0.65)
        s = 0.7 * math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env * 0.6)
    return out


def gen_bgm_loop(dur: float = 16.0) -> list[float]:
    """Trilha leve, animada e 100% autoral estilo marimba/blocos (120 BPM)."""
    bpm = 120.0
    step_sec = (60.0 / bpm) / 2.0  # colcheias (0.25s)
    melody = [
        523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46,
        493.88, 587.33, 783.99, 587.33, 523.25, 659.25, 783.99, 1046.50,
    ]
    bass = [130.81, 146.83, 98.00, 130.81]  # C3 D3 G2 C3
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
    write_wav(sfx_dir / "whoosh.wav", gen_whoosh())
    write_wav(sfx_dir / "pop.wav", gen_pop())
    write_wav(sfx_dir / "shock.wav", gen_shock())
    write_wav(sfx_dir / "lava.wav", gen_splash_lava())
    write_wav(sfx_dir / "win.wav", gen_win())
    write_wav(sfx_dir / "bgm_loop.wav", gen_bgm_loop(16.0))
    print(f"SFX e trilha gerados em {sfx_dir}")


if __name__ == "__main__":
    main()
