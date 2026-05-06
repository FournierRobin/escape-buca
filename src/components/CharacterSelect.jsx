import { useState, useEffect, useRef } from "react";
import { characters } from "../data/characters";
import { patchRoomState, getRoomState, subscribeToRoom } from "../lib/supabase";
import CharacterPreview from "./CharacterPreview";

export default function CharacterSelect({ onReady, roomId, playerId }) {
  const [myChoice, setMyChoice] = useState(null);
  const [partnerChoice, setPartnerChoice] = useState(null);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const hasLaunched = useRef(false);

  const isOnline = roomId && roomId !== "local";
  const selectedChar = characters.find((c) => c.id === myChoice);
  const partnerChar = characters.find((c) => c.id === partnerChoice);

  const readyCount = readyPlayers.length;
  const amReady = readyPlayers.includes(playerId);
  const bothSelected = isOnline ? !!(myChoice && partnerChoice) : !!myChoice;

  console.log("[CharSelect] render", {
    playerId: playerId?.slice(0, 8),
    isOnline,
    roomId: roomId?.slice(0, 8),
    myChoice,
    partnerChoice,
    readyPlayers,
    readyCount,
    amReady,
    bothSelected,
  });

  useEffect(() => {
    if (!isOnline) {
      console.log("[CharSelect] offline mode, skipping subscription");
      return;
    }

    console.log("[CharSelect] setting up subscription for room", roomId?.slice(0, 8));

    getRoomState(roomId).then((state) => {
      console.log("[CharSelect] initial state loaded", {
        characters: state?.characters,
        readyPlayers: state?.readyPlayers,
      });
      if (!state) return;
      if (state.characters) {
        Object.entries(state.characters).forEach(([pid, charId]) => {
          if (pid === playerId) setMyChoice(charId);
          else setPartnerChoice(charId);
        });
      }
      if (state.readyPlayers) setReadyPlayers(state.readyPlayers);
    });

    return subscribeToRoom(roomId, (state) => {
      console.log("[CharSelect] subscription update received", {
        characters: state?.characters,
        readyPlayers: state?.readyPlayers,
        screen: state?.screen,
        fullKeys: state ? Object.keys(state) : "null",
      });

      if (!state) return;

      if (state.characters) {
        const entries = Object.entries(state.characters);
        entries.forEach(([pid, charId]) => {
          const isMe = pid === playerId;
          console.log("[CharSelect] character entry", {
            pid: pid.slice(0, 8),
            charId,
            isMe,
          });
          if (isMe) {
            setMyChoice((prev) => prev || charId);
          } else {
            setPartnerChoice(charId);
          }
        });
      } else {
        console.log("[CharSelect] no characters in state update");
      }

      const ready = state.readyPlayers || [];
      setReadyPlayers(ready);

      if (ready.length >= 2 && !hasLaunched.current && state.characters) {
        const chars = state.characters;
        const myId = chars[playerId];
        const partnerId = Object.entries(chars).find(([pid]) => pid !== playerId)?.[1];
        console.log("[CharSelect] LAUNCH condition met", { myId, partnerId });
        if (myId && partnerId) {
          hasLaunched.current = true;
          onReady(myId, partnerId);
        }
      }
    });
  }, [isOnline, roomId, playerId, onReady]);

  async function handleSelect(charId) {
    console.log("[CharSelect] handleSelect", { charId, currentChoice: myChoice, amReady });
    if (charId === myChoice && amReady) return;
    setMyChoice(charId);

    if (isOnline) {
      const current = await getRoomState(roomId);
      const currentChars = current?.characters || {};
      const currentReady = current?.readyPlayers || [];
      const patch = {
        characters: { ...currentChars, [playerId]: charId },
        readyPlayers: currentReady.filter((pid) => pid !== playerId),
      };
      console.log("[CharSelect] patching room", {
        currentChars,
        newChars: patch.characters,
        newReady: patch.readyPlayers,
      });
      const result = await patchRoomState(roomId, patch);
      console.log("[CharSelect] patch result", result);
    }
  }

  async function handleReady() {
    console.log("[CharSelect] handleReady", { myChoice, isOnline });

    if (!isOnline) {
      const remaining = characters.filter((c) => c.id !== myChoice);
      const partnerId = remaining[Math.floor(Math.random() * remaining.length)].id;
      onReady(myChoice, partnerId);
      return;
    }

    const current = await getRoomState(roomId);
    const currentReady = current?.readyPlayers || [];
    console.log("[CharSelect] current readyPlayers from DB", currentReady);

    if (currentReady.includes(playerId)) {
      console.log("[CharSelect] already ready, skipping");
      return;
    }

    const newReady = [...currentReady, playerId];
    console.log("[CharSelect] setting readyPlayers to", newReady);
    setReadyPlayers(newReady);
    await patchRoomState(roomId, { readyPlayers: newReady });

    if (newReady.length >= 2 && !hasLaunched.current) {
      hasLaunched.current = true;
      const chars = current?.characters || {};
      const myId = chars[playerId] || myChoice;
      const partnerId = Object.entries(chars).find(([pid]) => pid !== playerId)?.[1] || partnerChoice;
      console.log("[CharSelect] LAUNCH from handleReady", { myId, partnerId });
      if (myId && partnerId) {
        onReady(myId, partnerId);
      }
    }
  }

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in" style={{ overflow: "auto", flex: 1 }}>
        <div className="tag">Dossier Personnel</div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Choisissez votre agent</h2>
        <p style={{
          fontSize: 11, color: "var(--text-dim)", marginBottom: 12,
          fontFamily: "var(--font-cursive)", lineHeight: 1.6,
        }}>
          {isOnline
            ? "Chaque agent est unique — pas de doublons dans l'équipe."
            : "Sélectionnez votre personnage pour l'enquête."}
        </p>

        {selectedChar ? (
          <div style={{
            marginBottom: 12,
            border: "1px solid var(--gold-dim)",
            background: "rgba(44,36,22,0.05)",
            position: "relative",
            overflow: "hidden",
            borderRadius: 4,
          }}>
            <CharacterPreview
              modelUrl={selectedChar.model}
              partnerModelUrl={partnerChar?.model}
            />
            <div style={{
              position: "absolute", bottom: 8, left: 0, right: 0,
              display: "flex", justifyContent: partnerChar ? "space-around" : "center",
              fontFamily: "var(--font-serif)", fontSize: 13,
              fontWeight: 700,
              textShadow: "0 1px 3px rgba(44,36,22,0.6)",
            }}>
              <span style={{ color: "var(--gold)" }}>{selectedChar.name}</span>
              {partnerChar && (
                <span style={{ color: "var(--red)" }}>{partnerChar.name}</span>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            height: 180, marginBottom: 12,
            border: "1px dashed var(--gold-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
            fontSize: 12, borderRadius: 4,
          }}>
            Sélectionnez un agent
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {characters.map((char) => {
            const isMine = myChoice === char.id;
            const isTaken = isOnline && partnerChoice === char.id;

            return (
              <button
                key={char.id}
                disabled={isTaken}
                onClick={() => handleSelect(char.id)}
                style={{
                  padding: "10px 4px",
                  background: isMine
                    ? "var(--bg-dark)"
                    : isTaken
                    ? "rgba(139,26,26,0.12)"
                    : "var(--bg-card)",
                  border: isMine
                    ? "2px solid var(--gold)"
                    : isTaken
                    ? "2px solid var(--red)"
                    : "1px solid var(--gold-dim)",
                  color: isMine
                    ? "var(--text-light)"
                    : isTaken
                    ? "var(--red)"
                    : "var(--text)",
                  textAlign: "center",
                  opacity: isTaken ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 2 }}>{char.emoji}</div>
                <div style={{
                  fontFamily: "var(--font-cursive)",
                  fontSize: 10,
                  letterSpacing: 0.3,
                }}>
                  {char.name}
                </div>
                {isTaken && (
                  <div style={{
                    fontSize: 8, marginTop: 2,
                    fontFamily: "var(--font-cursive)",
                    color: "var(--red)",
                    fontWeight: 700,
                  }}>
                    Pris
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isOnline && partnerChoice && partnerChar && (
          <div style={{
            marginTop: 12, textAlign: "center",
            padding: "8px 12px",
            background: "rgba(139,26,26,0.08)",
            border: "1px solid rgba(139,26,26,0.2)",
            borderRadius: 4,
            fontSize: 11, color: "var(--text)",
            fontFamily: "var(--font-cursive)",
          }}>
            Votre coéquipier a choisi : <strong style={{ color: "var(--red)" }}>{partnerChar.name} {partnerChar.emoji}</strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, flexShrink: 0 }}>
        {!isOnline ? (
          myChoice ? (
            <button className="btn-primary" onClick={handleReady}>
              Commencer l'enquête
            </button>
          ) : (
            <p style={{
              textAlign: "center", fontSize: 11,
              color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
            }}>
              Sélectionnez votre agent
            </p>
          )
        ) : bothSelected ? (
          amReady ? (
            <button className="btn-primary" disabled style={{ opacity: 0.7 }}>
              En attente... ({readyCount}/2)
            </button>
          ) : (
            <button className="btn-primary" onClick={handleReady}>
              C'est parti ! ({readyCount}/2)
            </button>
          )
        ) : (
          <p style={{
            textAlign: "center", fontSize: 11,
            color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
          }}>
            {myChoice && !partnerChoice
              ? "En attente du choix de votre coéquipier..."
              : "Sélectionnez votre agent"}
          </p>
        )}
      </div>
    </div>
  );
}
