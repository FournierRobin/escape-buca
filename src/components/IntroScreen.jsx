import { useState } from "react";

export default function IntroScreen({ onStart }) {
  const [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <div className="screen screen-padded screen-center" style={{ position: "relative" }}>
        <div style={{
          position: "absolute", width: 120, height: 120,
          borderRadius: "50%", border: "2px solid rgba(139,90,43,0.12)",
          top: -30, right: -20, pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", inset: 8, borderRadius: "50%",
            border: "1px solid rgba(139,90,43,0.08)",
          }} />
        </div>

        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Confidentiel</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
            Dossier<br />
            <em style={{ fontStyle: "italic", fontWeight: 400, fontSize: 28, color: "var(--text-dim)" }}>
              Sherlock
            </em>
          </h1>
          <div className="divider">✦</div>
          <p style={{
            marginBottom: 32, lineHeight: 1.8,
            fontFamily: "var(--font-cursive)", color: "var(--text-dim)", fontSize: 14,
          }}>
            Bucarest, Roumanie.
            <br />
            Un dossier classifié vient d'être ouvert.
          </p>
          <button className="btn-primary" onClick={() => setStep(1)}>
            Ouvrir le dossier
          </button>
          <div style={{
            textAlign: "center", fontFamily: "var(--font-mono)",
            fontSize: 11, color: "var(--text-dim)", marginTop: 40, letterSpacing: 4,
          }}>
            — 1 / 6 —
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-padded screen-center" style={{ position: "relative" }}>
      <div className="fade-in" style={{ maxWidth: 340 }}>
        <div className="tag">Briefing</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Agent Mariarty</h2>
        <div className="card" style={{ textAlign: "left" }}>
          <div className="pin" />
          <p style={{ marginBottom: 12, lineHeight: 1.8, fontFamily: "var(--font-cursive)" }}>
            Sherlock a disparu quelque part dans Bucarest.
          </p>
          <p style={{ marginBottom: 12, lineHeight: 1.8, fontFamily: "var(--font-cursive)" }}>
            Il a laissé des indices à travers la ville.
            Votre mission : suivre sa piste.
          </p>
          <div className="handwritten">
            "Ne faites confiance à personne. Surtout pas à Sherlock." — S.H.
          </div>
        </div>
        <p style={{
          marginBottom: 32, lineHeight: 1.8, color: "var(--text-dim)",
          fontFamily: "var(--font-cursive)", fontSize: 13,
        }}>
          Vous aurez besoin de deux téléphones.
          <br />
          Ne montrez jamais votre écran à votre partenaire.
        </p>
        <button className="btn-primary" onClick={onStart}>
          Accepter la mission
        </button>
      </div>
    </div>
  );
}
