import { useState, useEffect, useRef, useCallback } from "react";
import { bombModules } from "../data/bombModules";
import BombMaze from "./BombMaze";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function WiresModule({ module, onSuccess, onError }) {
  const [shaking, setShaking] = useState(null);

  function handleCut(wireId) {
    if (wireId === module.device.answer) {
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
        {module.device.instruction}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {module.device.options.map((wire) => (
          <button
            key={wire.id}
            className={shaking === wire.id ? "shake" : ""}
            onClick={() => handleCut(wire.id)}
            style={{
              padding: "16px",
              background: wire.color,
              color: wire.id === "black" ? "#ccc" : "#1a1510",
              fontFamily: "var(--font-cursive)",
              fontSize: 14,
              fontWeight: 500,
              border: `2px solid ${wire.color}`,
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            {wire.label}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
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
        {[1,2,3,4,5,6,7,8,9,null,0,null].map((d, i) => (
          d !== null ? (
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
          ) : <div key={i} />
        ))}
      </div>
    </div>
  );
}

function ManualView({ modules, currentModule, errors, timerStart }) {
  const [timeLeft, setTimeLeft] = useState(420);

  useEffect(() => {
    if (!timerStart) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      setTimeLeft(Math.max(0, 420 - elapsed));
    }, 500);
    return () => clearInterval(interval);
  }, [timerStart]);

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
      {mod.id === "maze" && mod.manual.wallsManual && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, fontFamily: "var(--font-cursive)" }}>
            Vos murs (grille 5×5) :
          </p>
          <MazeGrid
            gridSize={5}
            walls={mod.manual.wallsManual}
            start={mod.device.start}
            end={mod.device.end}
          />
        </div>
      )}
    </div>
  );
}

function MazeGrid({ gridSize, walls, start, end }) {
  const cellSize = 48;
  const size = gridSize * cellSize;

  return (
    <svg width={size} height={size} style={{ border: "2px solid var(--gold-dim)" }}>
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * cellSize} y={r * cellSize}
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
              x1={(minC + 1) * cellSize} y1={r1 * cellSize}
              x2={(minC + 1) * cellSize} y2={(r1 + 1) * cellSize}
              stroke="#8b1a1a" strokeWidth={3}
            />
          );
        } else {
          const minR = Math.min(r1, r2);
          return (
            <line key={i}
              x1={c1 * cellSize} y1={(minR + 1) * cellSize}
              x2={(c1 + 1) * cellSize} y2={(minR + 1) * cellSize}
              stroke="#8b1a1a" strokeWidth={3}
            />
          );
        }
      })}
      <circle
        cx={start[1] * cellSize + cellSize / 2}
        cy={start[0] * cellSize + cellSize / 2}
        r={8} fill="var(--green)"
      />
      <circle
        cx={end[1] * cellSize + cellSize / 2}
        cy={end[0] * cellSize + cellSize / 2}
        r={8} fill="var(--red)"
      />
    </svg>
  );
}

export default function BombScreen({ role, bombState, onUpdateBomb, onComplete }) {
  const { moduleIndex, errors, timerStart, status } = bombState;
  const [timeLeft, setTimeLeft] = useState(420);
  const timerRef = useRef(null);

  useEffect(() => {
    if (role !== "device" || status !== "active" || !timerStart) return;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const remaining = Math.max(0, 420 - elapsed);
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

  if (role === "manual") {
    return (
      <ManualView
        modules={bombModules}
        currentModule={moduleIndex}
        errors={errors}
        timerStart={timerStart}
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
              {"Bombe désamorcée.\n\nRésultat :\n- Bucarest est sauvée.\n- Mariarty est officiellement dangereuse avec un téléphone.\n- Sherlock a récupéré un indice.\n\nINDICE : PASSAGE JAUNE"}
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
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Boum</div>
          <div className="card" style={{ padding: 20, textAlign: "left" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {"BOUM.\n\nExplosion purement administrative.\nAucun dégât, sauf dans le dossier de réputation de Sherlock.\n\nMode secours activé :\nla bombe révèle quand même l'indice,\nparce que Mariarty avait presque raison.\n\nINDICE : PASSAGE JAUNE"}
            </pre>
          </div>
          <button className="btn-primary" onClick={onComplete}>
            Prochaine destination
          </button>
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

      {mod.id === "wires" && <WiresModule module={mod} onSuccess={handleModuleSuccess} onError={handleError} />}
      {mod.id === "letters" && <LettersModule module={mod} onSuccess={handleModuleSuccess} onError={handleError} />}
      {mod.id === "code" && <CodeModule module={mod} onSuccess={handleModuleSuccess} onError={handleError} />}
      {mod.id === "maze" && (
        <BombMaze
          module={mod}
          onSuccess={handleModuleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
