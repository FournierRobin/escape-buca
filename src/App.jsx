import { useState, useEffect, useCallback, useRef } from "react";
import IntroScreen from "./components/IntroScreen";
import RoomJoin from "./components/RoomJoin";
import CharacterSelect from "./components/CharacterSelect";
import MapScreen from "./components/MapScreen";
import MissionScreen from "./components/MissionScreen";
import BombScreen from "./components/BombScreen";
import FinalReveal from "./components/FinalReveal";
import { missions } from "./data/missions";
import { characters } from "./data/characters";
import {
  subscribeToRoom,
  patchRoomState,
  uploadPhoto,
  isSupabaseConfigured,
  getPlayerId,
} from "./lib/supabase";

function DevMenu({ screen, onReset, onBackToMap, onGoTo }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", top: 8, right: 8, zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(44,36,22,0.6)", border: "1px solid rgba(139,107,63,0.3)",
          color: "rgba(139,107,63,0.6)", fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ...
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 36, right: 0,
          background: "var(--bg)", border: "1px solid var(--gold-dim)",
          borderRadius: 4, padding: 4, minWidth: 180,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          {screen !== "map" && screen !== "intro" && (
            <button onClick={() => { onBackToMap(); setOpen(false); }} style={devBtnStyle}>
              Retour carte
            </button>
          )}
          {missions.map((m, i) => (
            <button key={m.id} onClick={() => { onGoTo(i); setOpen(false); }} style={devBtnStyle}>
              → Mission {i + 1}: {m.title}
            </button>
          ))}
          <div style={{ borderTop: "1px solid var(--gold-dim)", margin: "4px 0" }} />
          <button onClick={() => { onReset(); setOpen(false); }} style={{ ...devBtnStyle, color: "var(--red)" }}>
            Reset complet
          </button>
        </div>
      )}
    </div>
  );
}

const devBtnStyle = {
  display: "block", width: "100%", textAlign: "left",
  padding: "8px 12px", background: "none", border: "none",
  color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)",
  cursor: "pointer",
};

const SCREENS = {
  INTRO: "intro",
  ROOM: "room",
  CHARACTER_SELECT: "character-select",
  MAP: "map",
  MISSION: "mission",
  BOMB_DEVICE: "bomb-device",
  BOMB_MANUAL: "bomb-manual",
  FINAL: "final",
};

function loadProgress() {
  try {
    const saved = localStorage.getItem("escape-progress");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveProgress(state) {
  localStorage.setItem("escape-progress", JSON.stringify(state));
}

export default function App() {
  const saved = loadProgress();
  const playerId = useRef(getPlayerId()).current;
  const ignoreNextSync = useRef(false);

  const [screen, setScreen] = useState(saved?.screen || SCREENS.INTRO);
  const [completedMissions, setCompletedMissions] = useState(saved?.completedMissions || []);
  const [activeMissionId, setActiveMissionId] = useState(saved?.activeMissionId || null);
  const [roomId, setRoomId] = useState(saved?.roomId || "local");
  const [roomCode, setRoomCode] = useState(saved?.roomCode || "LOCAL");
  const [myCharacterId, setMyCharacterId] = useState(saved?.myCharacterId || null);
  const [partnerCharacterId, setPartnerCharacterId] = useState(saved?.partnerCharacterId || null);
  const [photos, setPhotos] = useState(saved?.photos || {});
  const [missionState, setMissionState] = useState({});
  const missionStateRef = useRef({});
  const [bombState, setBombState] = useState({
    devicePlayerId: null,
    manualPlayerId: null,
    moduleIndex: 0,
    errors: 0,
    timerStart: null,
    status: "idle",
    mazePos: null,
    seed: null,
    attempts: 0,
  });

  useEffect(() => {
    saveProgress({
      screen, completedMissions, activeMissionId,
      roomId, roomCode, myCharacterId, partnerCharacterId, photos,
    });
  }, [screen, completedMissions, activeMissionId, roomId, roomCode, myCharacterId, partnerCharacterId, photos]);

  const isOnline = roomId && roomId !== "local";

  const syncToRoom = useCallback((patch) => {
    if (!isOnline) return;
    ignoreNextSync.current = true;
    patchRoomState(roomId, patch);
  }, [isOnline, roomId]);

  useEffect(() => {
    if (!isOnline) return;

    return subscribeToRoom(roomId, (state) => {
      if (ignoreNextSync.current) {
        console.log("[App] ignoreNextSync=true, SKIPPING update", { screen: state?.screen, characters: state?.characters, readyPlayers: state?.readyPlayers });
        ignoreNextSync.current = false;
        return;
      }
      if (!state) return;
      console.log("[App] processing subscription update", { screen: state?.screen, characters: state?.characters, readyPlayers: state?.readyPlayers });

      if (state.completedMissions) {
        setCompletedMissions(state.completedMissions);
      }

      if (state.photos) {
        setPhotos((prev) => ({ ...prev, ...state.photos }));
      }

      if (state.missionState !== undefined) {
        missionStateRef.current = state.missionState;
        setMissionState(state.missionState);
      }

      if (state.screen === "character-select") {
        setScreen(SCREENS.CHARACTER_SELECT);
      } else if (state.screen === "map") {
        if (state.characters) {
          const myEntry = Object.entries(state.characters).find(([pid]) => pid === playerId);
          const partnerEntry = Object.entries(state.characters).find(([pid]) => pid !== playerId);
          if (myEntry) setMyCharacterId(myEntry[1]);
          if (partnerEntry) setPartnerCharacterId(partnerEntry[1]);
        }
        setActiveMissionId(null);
        setScreen(SCREENS.MAP);
      } else if (state.screen === "mission" && state.activeMissionId) {
        setActiveMissionId(state.activeMissionId);
        const mission = missions.find((m) => m.id === state.activeMissionId);
        if (mission?.type === "gps-final") {
          setScreen(SCREENS.FINAL);
        } else {
          setScreen(SCREENS.MISSION);
        }
      } else if (state.screen === "bomb") {
        setActiveMissionId("cec-bomb");
        const iAmDevice = state.bombDevicePlayerId === playerId ||
          (state.bombManualPlayerId && state.bombManualPlayerId !== playerId);
        setScreen(iAmDevice ? SCREENS.BOMB_DEVICE : SCREENS.BOMB_MANUAL);
      }

      if (state.bombDevicePlayerId !== undefined || state.bombManualPlayerId !== undefined) {
        setBombState((prev) => ({
          ...prev,
          devicePlayerId: state.bombDevicePlayerId ?? prev.devicePlayerId,
          manualPlayerId: state.bombManualPlayerId ?? prev.manualPlayerId,
          moduleIndex: state.bombModuleIndex ?? prev.moduleIndex,
          errors: state.bombErrors ?? prev.errors,
          timerStart: state.bombTimerStart ?? prev.timerStart,
          status: state.bombStatus ?? prev.status,
          mazePos: state.bombMazePos ?? prev.mazePos,
          seed: state.bombSeed ?? prev.seed,
          attempts: state.bombAttempts ?? prev.attempts,
        }));
      }
    });
  }, [isOnline, roomId, playerId]);

  const resetGame = useCallback(() => {
    localStorage.removeItem("escape-progress");
    setScreen(SCREENS.INTRO);
    setCompletedMissions([]);
    setActiveMissionId(null);
    setRoomId("local");
    setRoomCode("LOCAL");
    setMyCharacterId(null);
    setPartnerCharacterId(null);
    setPhotos({});
    setMissionState({});
    missionStateRef.current = {};
    setBombState({ devicePlayerId: null, manualPlayerId: null, moduleIndex: 0, errors: 0, timerStart: null, status: "idle", mazePos: null, seed: null, attempts: 0 });
  }, []);

  const completeMission = useCallback((missionId) => {
    setCompletedMissions((prev) => {
      if (prev.includes(missionId)) return prev;
      const next = [...prev, missionId];
      syncToRoom({
        completedMissions: next,
        screen: "map",
        activeMissionId: null,
        missionState: {},
        bombDevicePlayerId: null,
        bombManualPlayerId: null,
        bombModuleIndex: 0,
        bombErrors: 0,
        bombTimerStart: null,
        bombStatus: "idle",
        bombSeed: null,
        bombAttempts: 0,
      });
      return next;
    });
    setActiveMissionId(null);
    setScreen(SCREENS.MAP);
  }, [syncToRoom]);

  const syncMissionState = useCallback((patch) => {
    const next = { ...missionStateRef.current, ...patch };
    missionStateRef.current = next;
    setMissionState(next);
    syncToRoom({ missionState: next });
  }, [syncToRoom]);

  const openMission = useCallback((missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    missionStateRef.current = {};
    setMissionState({});
    setActiveMissionId(missionId);
    if (mission.type === "gps-final") {
      setScreen(SCREENS.FINAL);
    } else {
      setScreen(SCREENS.MISSION);
    }
    syncToRoom({ screen: "mission", activeMissionId: missionId, missionState: {} });
  }, [syncToRoom]);

  const startBomb = useCallback((role) => {
    const devicePid = role === "device" ? playerId : null;
    const manualPid = role === "manual" ? playerId : null;
    const timerStart = Date.now();
    const seed = timerStart;
    setBombState({
      devicePlayerId: devicePid,
      manualPlayerId: manualPid,
      moduleIndex: 0,
      errors: 0,
      timerStart,
      status: "active",
      mazePos: null,
      seed,
      attempts: 0,
    });
    setScreen(role === "device" ? SCREENS.BOMB_DEVICE : SCREENS.BOMB_MANUAL);
    syncToRoom({
      screen: "bomb",
      bombDevicePlayerId: devicePid,
      bombManualPlayerId: manualPid,
      bombModuleIndex: 0,
      bombErrors: 0,
      bombTimerStart: timerStart,
      bombStatus: "active",
      bombSeed: seed,
      bombAttempts: 0,
    });
  }, [playerId, syncToRoom]);

  const updateBomb = useCallback((patch) => {
    setBombState((prev) => ({ ...prev, ...patch }));
    const roomPatch = {};
    if (patch.moduleIndex !== undefined) roomPatch.bombModuleIndex = patch.moduleIndex;
    if (patch.errors !== undefined) roomPatch.bombErrors = patch.errors;
    if (patch.status !== undefined) roomPatch.bombStatus = patch.status;
    if (patch.mazePos !== undefined) roomPatch.bombMazePos = patch.mazePos;
    if (patch.timerStart !== undefined) roomPatch.bombTimerStart = patch.timerStart;
    if (patch.attempts !== undefined) roomPatch.bombAttempts = patch.attempts;
    if (Object.keys(roomPatch).length > 0) {
      syncToRoom(roomPatch);
    }
  }, [syncToRoom]);

  const handleIntroStart = useCallback(() => {
    if (isSupabaseConfigured) {
      setScreen(SCREENS.ROOM);
    } else {
      setRoomId("local");
      setRoomCode("LOCAL");
      setScreen(SCREENS.CHARACTER_SELECT);
    }
  }, []);

  const handleRoomJoined = useCallback(({ roomId: id, roomCode: code }) => {
    setRoomId(id);
    setRoomCode(code);
    setScreen(SCREENS.CHARACTER_SELECT);
  }, []);

  const handleCharacterReady = useCallback((myId, partnerId) => {
    setMyCharacterId(myId);
    setPartnerCharacterId(partnerId);
    setScreen(SCREENS.MAP);
    syncToRoom({ screen: "map" });
  }, [syncToRoom]);

  const handlePhotoCapture = useCallback(async (photoKey, file) => {
    const url = await uploadPhoto(roomCode, photoKey, file);
    setPhotos((prev) => {
      const next = { ...prev, [photoKey]: url };
      syncToRoom({ photos: next });
      return next;
    });
  }, [roomCode, syncToRoom]);

  const activeMission = missions.find((m) => m.id === activeMissionId);

  const myCharacter = characters.find((c) => c.id === myCharacterId);
  const partnerCharacter = characters.find((c) => c.id === partnerCharacterId);

  const unlockedMissionIds = missions.reduce((acc, mission, i) => {
    if (i === 0) {
      acc.push(mission.id);
    } else {
      const prev = missions[i - 1];
      if (completedMissions.includes(prev.id)) {
        acc.push(mission.id);
      }
    }
    return acc;
  }, []);

  const devGoTo = useCallback((missionIndex) => {
    const completed = missions.slice(0, missionIndex).map((m) => m.id);
    setCompletedMissions(completed);
    setActiveMissionId(null);
    setScreen(SCREENS.MAP);
    setMissionState({});
    missionStateRef.current = {};
    setBombState({ devicePlayerId: null, manualPlayerId: null, moduleIndex: 0, errors: 0, timerStart: null, status: "idle", mazePos: null, seed: null, attempts: 0 });
  }, []);

  return (
    <>
      <DevMenu
        screen={screen}
        onReset={resetGame}
        onBackToMap={() => { setActiveMissionId(null); setScreen(SCREENS.MAP); }}
        onGoTo={devGoTo}
      />
      {screen === SCREENS.INTRO && (
        <IntroScreen onStart={handleIntroStart} />
      )}

      {screen === SCREENS.ROOM && (
        <RoomJoin onJoined={handleRoomJoined} />
      )}

      {screen === SCREENS.CHARACTER_SELECT && (
        <CharacterSelect
          onReady={handleCharacterReady}
          roomId={roomId}
          playerId={playerId}
        />
      )}

      {screen === SCREENS.MAP && (
        <MapScreen
          missions={missions}
          completedMissions={completedMissions}
          unlockedMissionIds={unlockedMissionIds}
          onSelectMission={openMission}
          onReset={resetGame}
          myCharacter={myCharacter}
          partnerCharacter={partnerCharacter}
        />
      )}

      {screen === SCREENS.MISSION && activeMission && (
        <MissionScreen
          mission={activeMission}
          onComplete={() => completeMission(activeMission.id)}
          onStartBomb={startBomb}
          onBack={() => { setScreen(SCREENS.MAP); syncToRoom({ screen: "map", activeMissionId: null }); }}
          photos={photos}
          onPhotoCapture={handlePhotoCapture}
          missionState={missionState}
          onSyncState={syncMissionState}
        />
      )}

      {(screen === SCREENS.BOMB_DEVICE || screen === SCREENS.BOMB_MANUAL) && (
        <BombScreen
          role={screen === SCREENS.BOMB_DEVICE ? "device" : "manual"}
          bombState={bombState}
          onUpdateBomb={updateBomb}
          onComplete={() => completeMission("cec-bomb")}
        />
      )}

      {screen === SCREENS.FINAL && activeMission && (
        <FinalReveal
          mission={activeMission}
          onComplete={() => completeMission(activeMission.id)}
          missionState={missionState}
          onSyncState={syncMissionState}
          photos={photos}
        />
      )}
    </>
  );
}
