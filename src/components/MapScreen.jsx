import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { createCharacterLayer } from "../lib/characterLayer";
import { watchPosition } from "../lib/geolocation";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

const MAP_CENTER = [26.0950, 44.4360];
const MAP_ZOOM = 14;
const SOURCE_ID = "missions-source";
const CIRCLE_LAYER = "missions-circles";
const LABEL_LAYER = "missions-labels";

function buildGeoJSON(missions, completedMissions, unlockedMissionIds) {
  const features = [];

  missions.forEach((mission, i) => {
    const isCompleted = completedMissions.includes(mission.id);
    const isUnlocked = unlockedMissionIds.includes(mission.id);
    const isFinal = mission.type === "gps-final";
    const allPreviousCompleted = completedMissions.length >= missions.length - 1;

    if (isFinal && !allPreviousCompleted) return;

    let color = "#c4a978";
    let borderColor = "#a8956a";
    let textColor = "#8b6b3f";
    if (isCompleted) { color = "#4a7c59"; borderColor = "#6aa876"; textColor = "#f4e4c1"; }
    else if (isUnlocked) { color = "#8b1a1a"; borderColor = "#c44b4b"; textColor = "#f4e4c1"; }

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [mission.coordinates[1], mission.coordinates[0]],
      },
      properties: {
        id: mission.id,
        label: isFinal ? "★" : String(i + 1),
        color,
        borderColor,
        textColor,
        radius: isFinal ? 21 : 18,
        clickable: isUnlocked && !isCompleted ? "true" : "false",
      },
    });
  });

  return { type: "FeatureCollection", features };
}

export default function MapScreen({ missions, completedMissions, unlockedMissionIds, onSelectMission, onReset, myCharacter, partnerCharacter }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const loadedRef = useRef(false);
  const charLayerRef = useRef(null);
  const modelsLoadedRef = useRef(false);
  const [selectedMission, setSelectedMission] = useState(null);

  const updateSource = useCallback(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const geojson = buildGeoJSON(missions, completedMissions, unlockedMissionIds);
    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData(geojson);
    }
  }, [missions, completedMissions, unlockedMissionIds]);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      const geojson = buildGeoJSON(missions, completedMissions, unlockedMissionIds);

      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

      map.addLayer({
        id: CIRCLE_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "borderColor"],
        },
      });

      map.addLayer({
        id: LABEL_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "text-field": ["get", "label"],
          "text-size": 14,
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": ["get", "textColor"],
        },
      });

      const charLayer = createCharacterLayer(MAP_CENTER);
      map.addLayer(charLayer);
      charLayerRef.current = charLayer;

      charLayer.updatePosition("self", MAP_CENTER);
      charLayer.updatePosition("partner", MAP_CENTER);

      loadedRef.current = true;
    });

    map.on("click", CIRCLE_LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature || feature.properties.clickable !== "true") return;

      const mission = missions.find((m) => m.id === feature.properties.id);
      if (mission) setSelectedMission(mission);
    });

    map.on("mouseenter", CIRCLE_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", CIRCLE_LAYER, () => { map.getCanvas().style.cursor = ""; });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      charLayerRef.current = null;
      loadedRef.current = false;
      modelsLoadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const layer = charLayerRef.current;
    if (!layer || !loadedRef.current || modelsLoadedRef.current) return;

    const selfModel = myCharacter?.model || "/cute_chick.glb";
    const partnerModel = partnerCharacter?.model || "/toothless_cute.glb";

    layer.loadModel(selfModel, "self");
    layer.loadModel(partnerModel, "partner");
    modelsLoadedRef.current = true;
  }, [myCharacter, partnerCharacter, loadedRef.current]);

  useEffect(() => {
    const cleanup = watchPosition((pos) => {
      const layer = charLayerRef.current;
      if (!layer) return;

      const lngLat = [pos.lng, pos.lat];
      layer.updatePosition("self", lngLat);
      layer.updatePosition("partner", lngLat);
    });
    return cleanup || undefined;
  }, []);

  useEffect(() => {
    updateSource();
  }, [updateSource]);

  return (
    <div className="screen" style={{ position: "relative" }}>
      <div
        ref={mapContainer}
        style={{
          flex: 1, width: "100%",
          filter: "sepia(0.35) saturate(1.3) brightness(0.85) hue-rotate(-10deg)",
        }}
      />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        background: "rgba(244,228,193,0.92)", backdropFilter: "blur(8px)",
        padding: "12px 16px", borderBottom: "2px solid var(--gold-dim)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 3px 12px rgba(44,36,22,0.15)",
        zIndex: 5,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 700,
            letterSpacing: 1, color: "var(--gold)", marginBottom: 2,
          }}>
            Dossier Sherlock
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-cursive)" }}>
            {completedMissions.length} / {missions.length - 1} missions accomplies
          </div>
        </div>
        <button
          onClick={() => { if (confirm("Recommencer depuis le début ?")) onReset(); }}
          style={{
            background: "transparent", border: "1px dashed var(--gold-dim)",
            color: "var(--text-dim)", fontSize: 10, padding: "5px 10px",
            fontFamily: "var(--font-cursive)", letterSpacing: 1,
          }}
        >
          Reset
        </button>
      </div>

      {selectedMission && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(244,228,193,0.95)", backdropFilter: "blur(8px)",
          padding: "20px 20px 24px", borderTop: "2px solid var(--gold-dim)",
          boxShadow: "0 -3px 12px rgba(44,36,22,0.15)",
          zIndex: 5,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-cursive)", fontSize: 10,
                letterSpacing: 2, textTransform: "uppercase",
                color: "var(--text-dim)", marginBottom: 6,
              }}>
                {selectedMission.locationName}
              </div>
              <h3 style={{ fontSize: 18, color: "var(--gold)" }}>{selectedMission.mapTitle}</h3>
            </div>
            <button
              onClick={() => setSelectedMission(null)}
              style={{
                background: "transparent", color: "var(--text-dim)",
                fontSize: 18, padding: 4, fontFamily: "var(--font-mono)",
              }}
            >
              ✕
            </button>
          </div>
          <button className="btn-primary" onClick={() => onSelectMission(selectedMission.id)}>
            Commencer la mission
          </button>
        </div>
      )}
    </div>
  );
}
