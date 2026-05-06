import { useState, useEffect } from "react";
import { watchPosition, isNearby } from "../lib/geolocation";

export default function FinalReveal({ mission, onComplete }) {
  const [phase, setPhase] = useState("arrival");
  const [userPos, setUserPos] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (phase !== "map") return;
    const cleanup = watchPosition((pos) => {
      setUserPos(pos);
      if (isNearby(pos.lat, pos.lng, mission.coordinates[0], mission.coordinates[1], mission.radiusMeters)) {
        setRevealed(true);
        setPhase("reveal");
      }
    });
    return cleanup || undefined;
  }, [phase, mission]);

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
        </div>
        <button className="btn-primary" onClick={() => setPhase("map")} style={{ marginTop: 24 }}>
          Afficher le marqueur final
        </button>
      </div>
    );
  }

  if (phase === "map") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag pulse">En route</div>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            border: "3px solid var(--red)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 20px",
            color: "var(--red)",
            boxShadow: "0 0 0 6px rgba(139,26,26,0.1)",
          }}>
            ★
          </div>
          <div className="card" style={{ padding: 20, textAlign: "left" }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.mapText}
            </pre>
          </div>
          {userPos && (
            <p style={{
              fontSize: 11, color: "var(--text-dim)", marginBottom: 16,
              fontFamily: "var(--font-cursive)",
            }}>
              GPS actif — en attente de proximité...
            </p>
          )}
          <button className="btn-ghost" onClick={() => setPhase("reveal")}>
            Sherlock valide le pédalo manuellement
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
          <button className="btn-primary" onClick={() => setPhase("reward")} style={{ marginTop: 16 }}>
            Voir la récompense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-padded screen-center">
      <div className="fade-in" style={{ maxWidth: 340 }}>
        <div style={{
          fontSize: 64, marginBottom: 20,
          filter: "drop-shadow(0 0 20px rgba(139,26,26,0.2))",
        }}>
          💋
        </div>
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
