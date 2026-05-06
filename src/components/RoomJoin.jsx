import { useState, useEffect } from "react";
import { createRoom, joinRoom, patchRoomState, subscribeToRoom } from "../lib/supabase";

export default function RoomJoin({ onJoined }) {
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdCode, setCreatedCode] = useState(null);
  const [createdRoom, setCreatedRoom] = useState(null);

  useEffect(() => {
    if (!createdRoom) return;

    return subscribeToRoom(createdRoom.id, (state) => {
      if (state?.playerJoined) {
        onJoined({ roomId: createdRoom.id, roomCode: createdRoom.code });
      }
    });
  }, [createdRoom, onJoined]);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const room = await createRoom();
      setCreatedCode(room.code);
      setCreatedRoom(room);
    } catch (e) {
      setError("Erreur de création. Mode local activé.");
      onJoined({ roomId: "local", roomCode: "LOCAL" });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (code.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const room = await joinRoom(code);
      await patchRoomState(room.id, { playerJoined: true });
      onJoined({ roomId: room.id, roomCode: room.code });
    } catch {
      setError("Code introuvable. Vérifiez le code.");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    onJoined({ roomId: "local", roomCode: "LOCAL" });
  }

  if (!mode) {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Connexion</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Deux téléphones</h2>
          <p style={{
            marginBottom: 24, lineHeight: 1.8,
            fontFamily: "var(--font-cursive)", color: "var(--text-dim)",
          }}>
            La mission nécessite deux agents.
            <br />
            Créez une room ou rejoignez-en une.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="btn-primary" onClick={() => { setMode("create"); handleCreate(); }}>
              Créer une room
            </button>
            <button className="btn-secondary" onClick={() => setMode("join")}>
              Rejoindre une room
            </button>
            <button className="btn-ghost" onClick={handleSkip}>
              Jouer en local (un seul téléphone)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="screen screen-padded screen-center">
        <div className="fade-in" style={{ maxWidth: 340 }}>
          <div className="tag">Room créée</div>
          {loading ? (
            <p className="pulse" style={{ fontFamily: "var(--font-cursive)" }}>Création en cours...</p>
          ) : createdCode ? (
            <>
              <h2 style={{
                fontSize: 48, letterSpacing: 8, marginBottom: 16,
                fontFamily: "var(--font-serif)",
              }}>
                {createdCode}
              </h2>
              <p style={{
                marginBottom: 8, color: "var(--text-dim)",
                fontFamily: "var(--font-cursive)",
              }}>
                Communiquez ce code à votre partenaire.
              </p>
              <p className="pulse" style={{
                color: "var(--text-dim)",
                fontFamily: "var(--font-cursive)",
                fontSize: 12,
              }}>
                En attente du joueur 2...
              </p>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-padded screen-center">
      <div className="fade-in" style={{ maxWidth: 340 }}>
        <div className="tag">Rejoindre</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Entrez le code</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="XXXX"
          maxLength={4}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 24,
            letterSpacing: 8,
            textAlign: "center",
            background: "var(--bg-card)",
            color: "var(--gold)",
            border: "2px solid var(--gold-dim)",
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
          }}
          autoFocus
        />
        {error && <p style={{ color: "var(--red)", marginBottom: 12, fontSize: 12 }}>{error}</p>}
        <button
          className="btn-primary"
          onClick={handleJoin}
          disabled={loading || code.length < 4}
          style={{ opacity: code.length < 4 ? 0.4 : 1 }}
        >
          {loading ? "Connexion..." : "Rejoindre"}
        </button>
      </div>
    </div>
  );
}
