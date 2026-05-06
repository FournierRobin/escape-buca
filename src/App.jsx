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
  const [bombState, setBombState] = useState({
    devicePlayerId: null,
    moduleIndex: 0,
    errors: 0,
    timerStart: null,
    status: "idle",
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
        const iAmDevice = state.bombDevicePlayerId === playerId;
        setScreen(iAmDevice ? SCREENS.BOMB_DEVICE : SCREENS.BOMB_MANUAL);
      }

      if (state.bombDevicePlayerId !== undefined) {
        setBombState((prev) => ({
          ...prev,
          devicePlayerId: state.bombDevicePlayerId,
          moduleIndex: state.bombModuleIndex ?? prev.moduleIndex,
          errors: state.bombErrors ?? prev.errors,
          timerStart: state.bombTimerStart ?? prev.timerStart,
          status: state.bombStatus ?? prev.status,
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
    setBombState({ devicePlayerId: null, moduleIndex: 0, errors: 0, timerStart: null, status: "idle" });
  }, []);

  const completeMission = useCallback((missionId) => {
    setCompletedMissions((prev) => {
      if (prev.includes(missionId)) return prev;
      const next = [...prev, missionId];
      syncToRoom({
        completedMissions: next,
        screen: "map",
        activeMissionId: null,
        bombDevicePlayerId: null,
        bombModuleIndex: 0,
        bombErrors: 0,
        bombTimerStart: null,
        bombStatus: "idle",
      });
      return next;
    });
    setActiveMissionId(null);
    setScreen(SCREENS.MAP);
  }, [syncToRoom]);

  const openMission = useCallback((missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    setActiveMissionId(missionId);
    if (mission.type === "gps-final") {
      setScreen(SCREENS.FINAL);
    } else {
      setScreen(SCREENS.MISSION);
    }
    syncToRoom({ screen: "mission", activeMissionId: missionId });
  }, [syncToRoom]);

  const startBomb = useCallback((role) => {
    const devicePid = role === "device" ? playerId : "__other__";
    const timerStart = Date.now();
    setBombState({
      devicePlayerId: devicePid,
      moduleIndex: 0,
      errors: 0,
      timerStart,
      status: "active",
    });
    setScreen(role === "device" ? SCREENS.BOMB_DEVICE : SCREENS.BOMB_MANUAL);
    syncToRoom({
      screen: "bomb",
      bombDevicePlayerId: devicePid,
      bombModuleIndex: 0,
      bombErrors: 0,
      bombTimerStart: timerStart,
      bombStatus: "active",
    });
  }, [playerId, syncToRoom]);

  const updateBomb = useCallback((patch) => {
    setBombState((prev) => ({ ...prev, ...patch }));
    const roomPatch = {};
    if (patch.moduleIndex !== undefined) roomPatch.bombModuleIndex = patch.moduleIndex;
    if (patch.errors !== undefined) roomPatch.bombErrors = patch.errors;
    if (patch.status !== undefined) roomPatch.bombStatus = patch.status;
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

  return (
    <>
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
        />
      )}
    </>
  );
}
