import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = !!supabase;

export function getPlayerId() {
  let id = sessionStorage.getItem("escape-player-id");
  if (!id) {
    if (crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
    }
    sessionStorage.setItem("escape-player-id", id);
  }
  return id;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const INITIAL_STATE = {
  completedMissions: [],
  screen: "character-select",
  activeMissionId: null,
  missionStepIndex: 0,
  bombDevicePlayerId: null,
  bombModuleIndex: 0,
  bombErrors: 0,
  bombTimerStart: null,
  bombStatus: "idle",
};

export async function createRoom() {
  if (!supabase) return { code: "LOCAL", id: "local" };

  const code = generateCode();
  const { data, error } = await supabase
    .from("rooms")
    .insert({ code, state: INITIAL_STATE })
    .select()
    .single();

  if (error) throw error;
  return { code: data.code, id: data.id };
}

export async function joinRoom(code) {
  if (!supabase) return { code: "LOCAL", id: "local" };

  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) throw new Error("Room introuvable");
  return { code: data.code, id: data.id };
}

export async function getRoomState(roomId) {
  if (!supabase || roomId === "local") return null;

  const { data } = await supabase
    .from("rooms")
    .select("state")
    .eq("id", roomId)
    .single();

  return data?.state || null;
}

export async function patchRoomState(roomId, patch) {
  if (!supabase || roomId === "local") return;

  const current = await getRoomState(roomId);
  if (!current) {
    console.warn("[patchRoomState] no current state found for room", roomId);
    return;
  }

  const merged = { ...current, ...patch };
  console.log("[patchRoomState] patching", { patchKeys: Object.keys(patch), characters: merged.characters, readyPlayers: merged.readyPlayers });
  const { error } = await supabase.from("rooms").update({ state: merged }).eq("id", roomId);
  if (error) {
    console.error("[patchRoomState] ERROR", error);
  }
}

export async function uploadPhoto(roomCode, photoKey, file) {
  if (!supabase) return URL.createObjectURL(file);

  const path = `${roomCode}/${photoKey}_${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) {
    console.warn("Upload failed, using local", error);
    return URL.createObjectURL(file);
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

let channelCounter = 0;

export function subscribeToRoom(roomId, callback) {
  if (!supabase || roomId === "local") return () => {};

  const channel = supabase
    .channel(`room-${roomId}-${++channelCounter}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
      (payload) => callback(payload.new.state)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
