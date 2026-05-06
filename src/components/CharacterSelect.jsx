import { useState } from "react";
import { characters } from "../data/characters";
import { patchRoomState, getRoomState } from "../lib/supabase";

export default function CharacterSelect({ onReady, roomId, playerId, partnerChoice }) {
  const [myChoice, setMyChoice] = useState(null);

  const isOnline = roomId && roomId !== "local";

  async function handleSelect(charId) {
    setMyChoice(charId);
    if (isOnline) {
      const current = await getRoomState(roomId);
      const currentChars = current?.characters || {};
      patchRoomState(roomId, {
        characters: { ...currentChars, [playerId]: charId },
      });
    }
  }

  function handleContinue() {
    if (!myChoice) return;

    let partnerId = partnerChoice;
    if (!partnerId) {
      const remaining = characters.filter((c) => c.id !== myChoice);
      partnerId = remaining[Math.floor(Math.random() * remaining.length)].id;
    }

    onReady(myChoice, partnerId);
  }

  const canContinue = isOnline ? myChoice && partnerChoice : myChoice;

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in">
        <div className="tag">Dossier Personnel</div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Choisissez votre agent</h2>
        <p style={{
          fontSize: 11, color: "var(--text-dim)", marginBottom: 20,
          fontFamily: "var(--font-cursive)", lineHeight: 1.6,
        }}>
          {isOnline
            ? "Chaque agent est unique — pas de doublons dans l'équipe."
            : "Sélectionnez votre personnage pour l'enquête."}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}>
          {characters.map((char) => {
            const isMine = myChoice === char.id;
            const isTaken = partnerChoice === char.id;

            return (
              <button
                key={char.id}
                disabled={isTaken}
                onClick={() => handleSelect(char.id)}
                style={{
                  padding: "16px 12px",
                  background: isMine
                    ? "var(--bg-dark)"
                    : isTaken
                    ? "rgba(196,169,120,0.3)"
                    : "var(--bg-card)",
                  border: isMine
                    ? "2px solid var(--red)"
                    : "1px solid var(--gold-dim)",
                  color: isMine
                    ? "var(--text-light)"
                    : isTaken
                    ? "var(--gold-dim)"
                    : "var(--text)",
                  textAlign: "center",
                  opacity: isTaken ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{char.emoji}</div>
                <div style={{
                  fontFamily: "var(--font-cursive)",
                  fontSize: 13,
                  letterSpacing: 0.5,
                }}>
                  {char.name}
                </div>
                {isTaken && (
                  <div style={{
                    fontSize: 9, marginTop: 4,
                    fontFamily: "var(--font-cursive)",
                    color: "var(--text-dim)",
                  }}>
                    Pris par l'autre
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isOnline && partnerChoice && (
          <div style={{
            marginTop: 16, textAlign: "center",
            fontSize: 11, color: "var(--text-dim)",
            fontFamily: "var(--font-cursive)",
          }}>
            Votre partenaire a choisi : {characters.find((c) => c.id === partnerChoice)?.name}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {canContinue ? (
          <button className="btn-primary" onClick={handleContinue}>
            Commencer l'enquête
          </button>
        ) : (
          <p style={{
            textAlign: "center", fontSize: 11,
            color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
          }}>
            {isOnline && myChoice && !partnerChoice
              ? "En attente du choix de votre partenaire..."
              : "Sélectionnez votre agent"}
          </p>
        )}
      </div>
    </div>
  );
}
