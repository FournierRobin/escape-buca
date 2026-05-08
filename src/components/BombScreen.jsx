import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { bombModules } from "../data/bombModules";
import BombMaze from "./BombMaze";

const BOMB_TIMER = 300;

const FAIL_TEXTS = [
  "BOUM.\n\nExplosion purement administrative.\nAucun dégât, sauf dans le dossier de réputation de Sherlock.\n\nMais Sherlock est patient.\nUne deuxième chance s'impose.",
  "Re-BOUM.\n\nSherlock commence à douter de son recrutement.\nMais il refuse d'abandonner.\n\nUn dernier essai ?",
  "BOUM. Encore.\n\nÀ ce stade, Bucarest s'est habituée.\nLes pigeons ne réagissent même plus.\n\nSherlock vous accorde une grâce infinie.",
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─── Seeded RNG ─── */

function createRng(seed) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleWith(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomWith(arr, n, rng) {
  return shuffleWith(arr, rng).slice(0, n);
}

/* ─── Random wire generation ─── */

const WIRE_POOL = [
  { label: "ROUGE", color: "#c44b4b" },
  { label: "BLEU", color: "#4b7cc4" },
  { label: "JAUNE", color: "#c9a84c" },
  { label: "NOIR", color: "#333" },
  { label: "BLANC", color: "#e8e0d0" },
];

function generateWires(rng) {
  const mandatory = [
    { label: "JAUNE", color: "#c9a84c" },
    { label: "BLEU", color: "#4b7cc4" },
  ];
  const extra = [];
  for (let i = 0; i < 3; i++) {
    extra.push(WIRE_POOL[Math.floor(rng() * WIRE_POOL.length)]);
  }
  const allWires = shuffleWith([...mandatory, ...extra], rng);
  const wires = allWires.map((w, i) => ({
    id: `${w.label.toLowerCase()}_${i}`,
    label: w.label,
    color: w.color,
  }));

  const redCount = wires.filter((w) => w.label === "ROUGE").length;
  const jauneInPos3or4 = [2, 3].some((i) => wires[i]?.label === "JAUNE");

  let answer;
  if (redCount > 1) {
    if (jauneInPos3or4) {
      answer = wires.find((w) => w.label === "JAUNE").id;
    } else {
      answer = wires[4].id;
    }
  } else if (redCount === 1) {
    if (wires[0].label === "BLANC") {
      answer = wires.find((w) => w.label === "BLEU").id;
    } else {
      answer = wires.find((w) => w.label === "ROUGE").id;
    }
  } else {
    answer = wires[1].id;
  }

  return { options: wires, answer };
}

/* ─── Random symbol generation ─── */

const ALL_SYMBOL_IDS = [
  "spiral", "trident", "omega", "eye", "zigzag", "crossCircle",
  "diamondTail", "starSix", "moon", "wave", "arrowLoop",
  "triangleDot", "hook", "sunBurst",
];

function generateSymbols(rng) {
  const shuffled = shuffleWith([...ALL_SYMBOL_IDS], rng);
  const deviceSymbols = shuffled.slice(0, 4);
  const otherSymbols = shuffled.slice(4);

  const correctCol = shuffleWith(
    [...deviceSymbols, ...pickRandomWith(otherSymbols, 3, rng)],
    rng
  );
  const answer = correctCol.filter((s) => deviceSymbols.includes(s));

  const wrongCols = [];
  for (let i = 0; i < 5; i++) {
    const pair = pickRandomWith(deviceSymbols, 2, rng);
    const others = pickRandomWith(otherSymbols, 5, rng);
    wrongCols.push(shuffleWith([...pair, ...others], rng));
  }

  const correctIdx = Math.floor(rng() * 6);
  const columns = [...wrongCols];
  columns.splice(correctIdx, 0, correctCol);

  return { symbols: deviceSymbols, answer, columns };
}

/* ─── Symbol SVG renderers ─── */

function SymbolIcon({ id, size = 40 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ display: "block" }}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {SYMBOL_PATHS[id]}
      </g>
    </svg>
  );
}

const SYMBOL_PATHS = {
  spiral: (
    <path d="M20 22 C17 22 15 20 15 17 C15 13 19 11 23 13 C27 15 27 21 23 25 C17 31 9 27 9 19 C9 11 17 5 25 7" />
  ),
  trident: (
    <>
      <line x1="20" y1="10" x2="20" y2="34" />
      <path d="M10 8 Q10 20 20 24" />
      <path d="M30 8 Q30 20 20 24" />
    </>
  ),
  omega: (
    <path d="M10 32 L16 32 L16 28 Q12 24 12 18 Q12 10 20 10 Q28 10 28 18 Q28 24 24 28 L24 32 L30 32" />
  ),
  eye: (
    <>
      <path d="M6 20 Q20 8 34 20 Q20 32 6 20 Z" />
      <circle cx="20" cy="20" r="5" />
    </>
  ),
  zigzag: (
    <polyline points="6,28 14,12 20,28 26,12 34,28" />
  ),
  crossCircle: (
    <>
      <circle cx="20" cy="20" r="14" />
      <line x1="10" y1="10" x2="30" y2="30" />
      <line x1="30" y1="10" x2="10" y2="30" />
    </>
  ),
  diamondTail: (
    <>
      <polygon points="20,6 30,18 20,30 10,18" />
      <line x1="20" y1="30" x2="20" y2="38" />
    </>
  ),
  starSix: (
    <>
      <polygon points="20,4 34,30 6,30" />
      <polygon points="20,36 34,10 6,10" />
    </>
  ),
  moon: (
    <path d="M24 6 Q16 10 16 20 Q16 30 24 34 Q12 30 12 20 Q12 10 24 6 Z" fill="currentColor" stroke="none" />
  ),
  wave: (
    <path d="M4 20 Q10 8 16 20 Q22 32 28 20 Q34 8 40 20" />
  ),
  arrowLoop: (
    <>
      <path d="M28 12 Q12 12 12 24 Q12 32 20 32 Q28 32 28 24 L28 18" />
      <polyline points="24,22 28,18 32,22" />
    </>
  ),
  triangleDot: (
    <>
      <polygon points="20,6 34,34 6,34" />
      <circle cx="20" cy="24" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  hook: (
    <path d="M16 6 L16 24 Q16 34 24 34 Q32 34 32 26" />
  ),
  sunBurst: (
    <>
      <circle cx="20" cy="20" r="4" fill="currentColor" stroke="none" />
      <line x1="20" y1="2" x2="20" y2="10" />
      <line x1="20" y1="30" x2="20" y2="38" />
      <line x1="2" y1="20" x2="10" y2="20" />
      <line x1="30" y1="20" x2="38" y2="20" />
      <line x1="7" y1="7" x2="13" y2="13" />
      <line x1="27" y1="27" x2="33" y2="33" />
      <line x1="33" y1="7" x2="27" y2="13" />
      <line x1="7" y1="33" x2="13" y2="27" />
    </>
  ),
};

/* ─── Module components ─── */

function WiresModule({ wireData, onSuccess, onError }) {
  const [shaking, setShaking] = useState(null);
  const { options, answer } = wireData;

  function handleCut(wireId) {
    if (wireId === answer) {
      onSuccess();
    } else {
      setShaking(wireId);
      onError();
      setTimeout(() => setShaking(null), 400);
    }
  }

  return (
    <div className="fade-in">
      <p style={{ marginBottom: 16, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
        Cinq fils. Un seul à couper.{"\n"}Décrivez les couleurs à votre partenaire.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((wire, i) => (
          <button
            key={wire.id}
            className={shaking === wire.id ? "shake" : ""}
            onClick={() => handleCut(wire.id)}
            style={{
              padding: "14px",
              background: wire.color,
              color: ["NOIR", "BLEU"].includes(wire.label) ? "#ddd" : "#1a1510",
              fontFamily: "var(--font-cursive)",
              fontSize: 13,
              fontWeight: 500,
              border: `2px solid ${wire.color}`,
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            Fil {i + 1} — {wire.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LettersModule({ module, onSuccess, onError }) {
  const [entered, setEntered] = useState([]);
  const [shaking, setShaking] = useState(false);
  const answer = module.device.answer;

  function handlePress(letter) {
    const next = [...entered, letter];
    const expected = answer[entered.length];

    if (letter === expected) {
      setEntered(next);
      if (next.length === answer.length) {
        onSuccess();
      }
    } else {
      setShaking(true);
      onError();
      setEntered([]);
      setTimeout(() => setShaking(false), 400);
    }
  }

  return (
    <div className={`fade-in ${shaking ? "shake" : ""}`}>
      <p style={{ marginBottom: 12, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
        {module.device.instruction}
      </p>
      <div style={{
        display: "flex", gap: 8, marginBottom: 16, justifyContent: "center",
        minHeight: 48, alignItems: "center",
      }}>
        {answer.map((_, i) => (
          <span key={i} style={{
            width: 36, height: 42,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--gold-dim)",
            fontSize: 20, fontFamily: "var(--font-serif)", fontWeight: 700,
            color: "var(--gold)",
            background: entered[i] ? "var(--bg-card)" : "transparent",
          }}>
            {entered[i] || ""}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {module.device.scrambledLetters.map((letter) => (
          <button
            key={letter}
            onClick={() => handlePress(letter)}
            disabled={entered.includes(letter)}
            style={{
              padding: "14px",
              background: entered.includes(letter) ? "rgba(196,169,120,0.4)" : "var(--bg-card)",
              color: entered.includes(letter) ? "rgba(44,36,22,0.3)" : "var(--text)",
              border: "1px solid var(--gold-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: 18,
            }}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

function CodeModule({ module, onSuccess, onError }) {
  const [digits, setDigits] = useState(Array(module.device.digits).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [shaking, setShaking] = useState(false);

  function handleDigit(d) {
    if (activeIndex >= module.device.digits) return;
    const next = [...digits];
    next[activeIndex] = String(d);
    setDigits(next);

    if (activeIndex === module.device.digits - 1) {
      const code = next.join("");
      if (code === module.device.answer) {
        onSuccess();
      } else {
        setShaking(true);
        onError();
        setTimeout(() => {
          setDigits(Array(module.device.digits).fill(""));
          setActiveIndex(0);
          setShaking(false);
        }, 500);
      }
    } else {
      setActiveIndex(activeIndex + 1);
    }
  }

  function handleBackspace() {
    if (activeIndex <= 0 && digits[0] === "") return;
    const idx = digits[activeIndex] !== "" ? activeIndex : activeIndex - 1;
    if (idx < 0) return;
    const next = [...digits];
    next[idx] = "";
    setDigits(next);
    setActiveIndex(idx);
  }

  return (
    <div className={`fade-in ${shaking ? "shake" : ""}`}>
      <p style={{ marginBottom: 12, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
        {module.device.instruction}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
        {digits.map((d, i) => (
          <span key={i} style={{
            width: 44, height: 52,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: i === activeIndex ? "2px solid var(--red)" : "1px solid var(--gold-dim)",
            fontSize: 24, fontFamily: "var(--font-mono)", fontWeight: 500,
            color: "var(--gold)",
            background: "var(--bg-card)",
          }}>
            {d}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 240, margin: "0 auto" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "back"].map((d, i) => {
          if (d === null) return <div key={i} />;
          if (d === "back") {
            return (
              <button key={i} onClick={handleBackspace} style={{
                padding: "14px",
                background: "var(--bg-card)",
                color: "var(--text-dim)",
                border: "1px solid var(--gold-dim)",
                fontFamily: "var(--font-mono)",
                fontSize: 16,
              }}>
                ←
              </button>
            );
          }
          return (
            <button key={i} onClick={() => handleDigit(d)} style={{
              padding: "14px",
              background: "var(--bg-card)",
              color: "var(--text)",
              border: "1px solid var(--gold-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: 18,
            }}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SymbolesModule({ symbolData, onSuccess, onError }) {
  const [pressed, setPressed] = useState([]);
  const [shaking, setShaking] = useState(false);
  const { symbols, answer } = symbolData;

  function handlePress(symbolId) {
    if (pressed.includes(symbolId)) return;

    const expected = answer[pressed.length];
    if (symbolId === expected) {
      const next = [...pressed, symbolId];
      setPressed(next);
      if (next.length === answer.length) {
        onSuccess();
      }
    } else {
      setShaking(true);
      onError();
      setPressed([]);
      setTimeout(() => setShaking(false), 400);
    }
  }

  return (
    <div className={`fade-in ${shaking ? "shake" : ""}`}>
      <p style={{ marginBottom: 16, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
        Décrivez ces symboles à votre partenaire.{"\n"}Appuyez dans l'ordre qu'il vous indique.
      </p>

      <div style={{
        display: "flex", gap: 6, marginBottom: 16, justifyContent: "center",
      }}>
        {answer.map((_, i) => (
          <span key={i} style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--gold-dim)",
            fontSize: 16, fontFamily: "var(--font-mono)",
            color: pressed[i] ? "var(--green)" : "var(--gold-dim)",
            background: pressed[i] ? "rgba(74,124,89,0.15)" : "transparent",
          }}>
            {pressed[i] ? "✓" : i + 1}
          </span>
        ))}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12, maxWidth: 280, margin: "0 auto",
      }}>
        {symbols.map((symbolId) => {
          const done = pressed.includes(symbolId);
          return (
            <button
              key={symbolId}
              onClick={() => handlePress(symbolId)}
              disabled={done}
              style={{
                padding: 16,
                background: done ? "rgba(74,124,89,0.2)" : "var(--bg-card)",
                color: done ? "var(--green)" : "var(--gold)",
                border: done ? "2px solid var(--green)" : "2px solid var(--gold-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: done ? 0.5 : 1,
              }}
            >
              <SymbolIcon id={symbolId} size={52} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Manual view ─── */

function SymbolColumns({ columns }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      gap: 8, marginTop: 12,
    }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{
          border: "1px solid var(--gold-dim)",
          padding: 6,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <div style={{
            fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--font-mono)",
            marginBottom: 2, letterSpacing: 1,
          }}>
            COL {ci + 1}
          </div>
          {col.map((symbolId, si) => (
            <div key={si} style={{ color: "var(--gold)" }}>
              <SymbolIcon id={symbolId} size={28} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ManualView({ modules, currentModule, errors, timerStart, mazePos, status, attempts, symbolColumns }) {
  const [timeLeft, setTimeLeft] = useState(BOMB_TIMER);

  useEffect(() => {
    if (!timerStart || status === "exploded" || status === "timeout" || status === "defused") return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      setTimeLeft(Math.max(0, BOMB_TIMER - elapsed));
    }, 500);
    return () => clearInterval(interval);
  }, [timerStart, status]);

  if (status === "defused") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag text-green" style={{ borderColor: "var(--green)", color: "var(--green)" }}>
            Désamorcée
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {"Bombe désamorcée.\n\nBravo. Votre rôle de consultant était essentiel."}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (status === "exploded" || status === "timeout") {
    const failText = FAIL_TEXTS[Math.min(attempts || 0, FAIL_TEXTS.length - 1)];
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Boum</div>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {failText}
            </pre>
          </div>
          <p style={{
            fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
            textAlign: "center", marginTop: 16,
          }}>
            En attente de Mariarty...
          </p>
        </div>
      </div>
    );
  }

  const mod = modules[currentModule];
  if (!mod) return null;

  return (
    <div className="screen screen-padded">
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--gold-dim)",
      }}>
        <div>
          <div style={{
            fontSize: 22, fontFamily: "var(--font-mono)", fontWeight: 500,
            color: timeLeft < 60 ? "var(--red)" : "var(--text-dim)",
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>Erreurs</div>
          <div style={{ fontSize: 16, color: errors > 0 ? "var(--red)" : "var(--text-dim)" }}>
            {errors} / 3
          </div>
        </div>
      </div>

      <div className="tag" style={{ marginBottom: 8 }}>Manuel — ne pas montrer</div>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>{mod.manual.title}</h2>
      <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 16, fontFamily: "var(--font-cursive)" }}>
        Module {currentModule + 1} / {modules.length}
      </p>
      <div className="card" style={{ padding: 20 }}>
        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.8,
          whiteSpace: "pre-wrap", color: "var(--text)",
        }}>
          {mod.manual.text}
        </pre>
      </div>

      {mod.id === "symbols" && symbolColumns && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4, fontFamily: "var(--font-cursive)" }}>
            Colonnes de référence :
          </p>
          <SymbolColumns columns={symbolColumns} />
        </div>
      )}

      {mod.id === "maze" && mod.manual.wallsManual && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, fontFamily: "var(--font-cursive)" }}>
            Vos murs (grille 6×6) :
          </p>
          <MazeGrid
            gridSize={6}
            walls={mod.manual.wallsManual}
            start={mod.device.start}
            end={mod.device.end}
            ballPos={mazePos}
          />
        </div>
      )}
    </div>
  );
}

function MazeGrid({ gridSize, walls, start, end, ballPos }) {
  const labelSize = 18;
  const cellSize = Math.min(50, (window.innerWidth - 80 - labelSize) / gridSize);
  const showBall = ballPos || start;

  return (
    <svg
      width={gridSize * cellSize + labelSize}
      height={gridSize * cellSize + labelSize}
      style={{ border: "2px solid var(--gold-dim)" }}
    >
      {Array.from({ length: gridSize }, (_, c) => (
        <text
          key={`col-${c}`}
          x={labelSize + c * cellSize + cellSize / 2}
          y={labelSize - 4}
          textAnchor="middle"
          style={{ fontSize: 10, fill: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
        >
          {String.fromCharCode(65 + c)}
        </text>
      ))}
      {Array.from({ length: gridSize }, (_, r) => (
        <text
          key={`row-${r}`}
          x={labelSize / 2}
          y={labelSize + r * cellSize + cellSize / 2 + 4}
          textAnchor="middle"
          style={{ fontSize: 10, fill: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
        >
          {r + 1}
        </text>
      ))}
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={labelSize + c * cellSize} y={labelSize + r * cellSize}
            width={cellSize} height={cellSize}
            fill="transparent" stroke="rgba(139,107,63,0.2)" strokeWidth={0.5}
          />
        ))
      )}
      {walls.map(([[r1,c1],[r2,c2]], i) => {
        const isHorizontal = r1 === r2;
        if (isHorizontal) {
          const minC = Math.min(c1, c2);
          return (
            <line key={i}
              x1={labelSize + (minC + 1) * cellSize} y1={labelSize + r1 * cellSize}
              x2={labelSize + (minC + 1) * cellSize} y2={labelSize + (r1 + 1) * cellSize}
              stroke="#8b1a1a" strokeWidth={3}
            />
          );
        } else {
          const minR = Math.min(r1, r2);
          return (
            <line key={i}
              x1={labelSize + c1 * cellSize} y1={labelSize + (minR + 1) * cellSize}
              x2={labelSize + (c1 + 1) * cellSize} y2={labelSize + (minR + 1) * cellSize}
              stroke="#8b1a1a" strokeWidth={3}
            />
          );
        }
      })}
      <circle
        cx={labelSize + end[1] * cellSize + cellSize / 2}
        cy={labelSize + end[0] * cellSize + cellSize / 2}
        r={8} fill="none" stroke="var(--red)" strokeWidth={2}
      />
      <circle
        cx={labelSize + showBall[1] * cellSize + cellSize / 2}
        cy={labelSize + showBall[0] * cellSize + cellSize / 2}
        r={8} fill="var(--green)"
      />
    </svg>
  );
}

/* ─── Main BombScreen ─── */

export default function BombScreen({ role, bombState, onUpdateBomb, onComplete }) {
  const { moduleIndex, errors, timerStart, status } = bombState;
  const attempts = bombState.attempts || 0;
  const seed = bombState.seed || bombState.timerStart;
  const [timeLeft, setTimeLeft] = useState(BOMB_TIMER);
  const timerRef = useRef(null);

  const randomData = useMemo(() => {
    if (!seed) return null;
    const rng = createRng(seed);
    return {
      wires: generateWires(rng),
      symbols: generateSymbols(rng),
    };
  }, [seed]);

  useEffect(() => {
    if (role !== "device" || status !== "active" || !timerStart) return;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const remaining = Math.max(0, BOMB_TIMER - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        onUpdateBomb({ status: "timeout" });
      }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [role, status, timerStart, onUpdateBomb]);

  const handleError = useCallback(() => {
    const next = errors + 1;
    if (next >= 3) {
      clearInterval(timerRef.current);
      onUpdateBomb({ errors: next, status: "exploded" });
    } else {
      onUpdateBomb({ errors: next });
    }
  }, [errors, onUpdateBomb]);

  const handleModuleSuccess = useCallback(() => {
    if (moduleIndex < bombModules.length - 1) {
      onUpdateBomb({ moduleIndex: moduleIndex + 1 });
    } else {
      clearInterval(timerRef.current);
      onUpdateBomb({ status: "defused" });
    }
  }, [moduleIndex, onUpdateBomb]);

  const handleRetry = useCallback(() => {
    onUpdateBomb({
      moduleIndex: 0,
      errors: 0,
      timerStart: Date.now(),
      status: "active",
      mazePos: null,
      attempts: attempts + 1,
    });
  }, [attempts, onUpdateBomb]);

  if (role === "manual") {
    return (
      <ManualView
        modules={bombModules}
        currentModule={moduleIndex}
        errors={errors}
        timerStart={timerStart}
        mazePos={bombState.mazePos}
        status={status}
        attempts={attempts}
        symbolColumns={randomData?.symbols?.columns}
      />
    );
  }

  if (status === "defused") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag text-green" style={{ borderColor: "var(--green)", color: "var(--green)" }}>
            Désamorcée
          </div>
          <div className="card" style={{ padding: 20, textAlign: "left" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {"Bombe désamorcée.\n\nBucarest pourra dormir sur ses 2 oreilles ce soir.\nSherlock a récupéré un indice.\n\nINDICE : PASSAGE JAUNE"}
            </pre>
          </div>
          <button className="btn-primary" onClick={onComplete}>
            Prochaine destination
          </button>
        </div>
      </div>
    );
  }

  if (status === "exploded" || status === "timeout") {
    const failText = FAIL_TEXTS[Math.min(attempts, FAIL_TEXTS.length - 1)];
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Boum</div>
          <div className="card" style={{ padding: 20, textAlign: "left" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {failText}
            </pre>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={handleRetry}>
              Réessayer
            </button>
            {attempts >= 1 && (
              <button className="btn-ghost" onClick={() => {
                onUpdateBomb({ status: "defused" });
              }}>
                Abandonner — l'indice quand même
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const mod = bombModules[moduleIndex];

  return (
    <div className="screen screen-padded">
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--gold-dim)",
      }}>
        <div>
          <div style={{
            fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 500,
            color: timeLeft < 60 ? "var(--red)" : "var(--gold)",
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>Erreurs</div>
          <div style={{ fontSize: 16, color: errors > 0 ? "var(--red)" : "var(--text-dim)" }}>
            {errors} / 3
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
          color: "var(--text-dim)", marginBottom: 4, fontFamily: "var(--font-cursive)",
        }}>
          Module {moduleIndex + 1} / {bombModules.length}
        </div>
        <h3 style={{ fontSize: 16, color: "var(--gold)" }}>{mod.title}</h3>
      </div>

      {mod.id === "wires" && randomData && (
        <WiresModule wireData={randomData.wires} onSuccess={handleModuleSuccess} onError={handleError} />
      )}
      {mod.id === "code" && <CodeModule module={mod} onSuccess={handleModuleSuccess} onError={handleError} />}
      {mod.id === "symbols" && randomData && (
        <SymbolesModule symbolData={randomData.symbols} onSuccess={handleModuleSuccess} onError={handleError} />
      )}
      {mod.id === "letters" && <LettersModule module={mod} onSuccess={handleModuleSuccess} onError={handleError} />}
      {mod.id === "maze" && (
        <BombMaze
          module={mod}
          onSuccess={handleModuleSuccess}
          onError={handleError}
          onMoveSync={(pos) => onUpdateBomb({ mazePos: pos })}
        />
      )}
    </div>
  );
}
