import { useState, useCallback } from "react";

function hasWall(walls, r1, c1, r2, c2) {
  return walls.some(
    ([[wr1, wc1], [wr2, wc2]]) =>
      (wr1 === r1 && wc1 === c1 && wr2 === r2 && wc2 === c2) ||
      (wr1 === r2 && wc1 === c2 && wr2 === r1 && wc2 === c1)
  );
}

export default function BombMaze({ module, onSuccess, onError }) {
  const { gridSize, start, end, wallsDevice } = module.device;
  const [pos, setPos] = useState([...start]);
  const [shaking, setShaking] = useState(false);

  const cellSize = Math.min(60, (window.innerWidth - 80) / gridSize);

  const move = useCallback((dr, dc) => {
    const [r, c] = pos;
    const nr = r + dr;
    const nc = c + dc;

    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) return;

    if (hasWall(wallsDevice, r, c, nr, nc)) {
      setShaking(true);
      onError();
      setTimeout(() => setShaking(false), 400);
      return;
    }

    const newPos = [nr, nc];
    setPos(newPos);

    if (nr === end[0] && nc === end[1]) {
      onSuccess();
    }
  }, [pos, gridSize, wallsDevice, end, onSuccess, onError]);

  return (
    <div className={`fade-in ${shaking ? "shake" : ""}`}>
      <p style={{ marginBottom: 12, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
        Guidez le curseur jusqu'à la sortie.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <svg
          width={gridSize * cellSize}
          height={gridSize * cellSize}
          style={{ border: "2px solid var(--gold-dim)" }}
        >
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

          {wallsDevice.map(([[r1, c1], [r2, c2]], i) => {
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
            cx={end[1] * cellSize + cellSize / 2}
            cy={end[0] * cellSize + cellSize / 2}
            r={cellSize / 4}
            fill="none" stroke="var(--red)" strokeWidth={2}
          />

          <circle
            cx={pos[1] * cellSize + cellSize / 2}
            cy={pos[0] * cellSize + cellSize / 2}
            r={cellSize / 3.5}
            fill="var(--green)"
          />
        </svg>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        maxWidth: 200,
        margin: "0 auto",
      }}>
        <div />
        <button className="btn-secondary" onClick={() => move(-1, 0)} style={{ padding: 12, fontSize: 18 }}>↑</button>
        <div />
        <button className="btn-secondary" onClick={() => move(0, -1)} style={{ padding: 12, fontSize: 18 }}>←</button>
        <div />
        <button className="btn-secondary" onClick={() => move(0, 1)} style={{ padding: 12, fontSize: 18 }}>→</button>
        <div />
        <button className="btn-secondary" onClick={() => move(1, 0)} style={{ padding: 12, fontSize: 18 }}>↓</button>
        <div />
      </div>
    </div>
  );
}
