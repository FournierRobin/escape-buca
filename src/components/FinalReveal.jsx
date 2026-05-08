import { useState, useEffect } from "react";

function normalize(str) {
  return str.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function FinalReveal({ mission, onComplete, missionState, onSyncState, photos }) {
  const [phase, setPhase] = useState(missionState?.phase || "arrival");
  const [guess, setGuess] = useState("");

  useEffect(() => {
    if (missionState?.phase && missionState.phase !== phase) {
      setPhase(missionState.phase);
    }
  }, [missionState?.phase, phase]);

  function goPhase(p) {
    setPhase(p);
    onSyncState?.({ phase: p });
  }

  const isCorrect = normalize(guess) === "pedalo";

  if (phase === "arrival") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">{mission.locationName}</div>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>{mission.title}</h2>
          <div className="card" style={{ padding: 20 }}>
            <div className="pin" />
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.arrivalText}
            </pre>
          </div>

          {mission.photoKeys && (
            <div style={{
              display: "flex", gap: 8, justifyContent: "center",
              marginTop: 20, marginBottom: 20,
            }}>
              {mission.photoKeys.map((key) => (
                <div key={key} style={{
                  width: 100, height: 100,
                  border: "1px solid var(--gold-dim)",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {photos?.[key] ? (
                    <img
                      src={photos[key]}
                      alt={key}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{
                      fontSize: 11, color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)", textAlign: "center", padding: 4,
                    }}>
                      ?
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, textAlign: "center" }}>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Quel mot se cache ici ?"
              style={{
                width: "100%",
                maxWidth: 260,
                padding: "12px 16px",
                fontSize: 18,
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                background: "var(--bg-card)",
                color: "var(--text)",
                border: isCorrect ? "2px solid var(--green)" : "1px solid var(--gold-dim)",
                borderRadius: 4,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            />
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => goPhase("solved")}
          disabled={!isCorrect}
          style={{ marginTop: 24, opacity: isCorrect ? 1 : 0.4 }}
        >
          Valider
        </button>
      </div>
    );
  }

  if (phase === "solved") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag text-green" style={{ borderColor: "var(--green)", color: "var(--green)" }}>
            Mot trouvé
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 20, letterSpacing: 6 }}>PÉDALO</h2>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.solvedText}
            </pre>
          </div>
          <button className="btn-primary" onClick={() => goPhase("reveal")} style={{ marginTop: 24 }}>
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (phase === "reveal") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Mission Accomplie</h1>
          <div className="card" style={{ padding: 20, textAlign: "left" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13, lineHeight: 1.8,
              whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.finalMessage}
            </pre>
          </div>
          <div className="divider">✦</div>
          <button className="btn-ghost" onClick={() => goPhase("reward")} style={{ marginTop: 16 }}>
            Sherlock active manuellement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-padded screen-center">
      <div className="fade-in" style={{ maxWidth: 340 }}>
        <img
          src="/Cat_GIF.gif"
          alt="MUA!"
          style={{
            width: 200, borderRadius: 12, marginBottom: 20,
            filter: "drop-shadow(0 0 20px rgba(139,26,26,0.2))",
          }}
        />
        <div className="card" style={{
          border: "2px solid var(--red)",
          textAlign: "left", padding: 24,
        }}>
          <div className="pin" />
          <pre style={{
            fontFamily: "var(--font-cursive)", fontSize: 13, lineHeight: 1.8,
            whiteSpace: "pre-wrap", color: "var(--text)",
          }}>
            {mission.reward}
          </pre>
          <div className="handwritten" style={{ marginTop: 16 }}>
            — Sherlock, qui ne part jamais sans enquêter.
          </div>
        </div>
        <p style={{
          marginTop: 24, fontSize: 11, color: "var(--text-dim)",
          fontFamily: "var(--font-cursive)", letterSpacing: 2,
        }}>
          Fin de l'enquête.
        </p>
      </div>
    </div>
  );
}
