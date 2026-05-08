import { useState, useEffect, useRef } from "react";

function PhotoCapture({ photoKey, onCapture, existingUrl }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(existingUrl || null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onCapture(photoKey, file);
  }

  if (preview) {
    return (
      <div style={{ marginTop: 12 }}>
        <img
          src={preview}
          alt="Preuve"
          style={{
            width: "100%", maxHeight: 200, objectFit: "cover",
            border: "2px solid var(--gold-dim)",
          }}
        />
        <div className="evidence-tag" style={{ marginTop: 8 }}>
          <span>●</span> Photo capturée
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        className="btn-secondary"
        onClick={() => inputRef.current?.click()}
        style={{ width: "100%" }}
      >
        Prendre une photo
      </button>
    </div>
  );
}

function DialogueMission({ mission, onComplete, missionState, onSyncState }) {
  const [stepIndex, setStepIndex] = useState(missionState?.stepIndex || 0);

  useEffect(() => {
    if (missionState?.stepIndex !== undefined && missionState.stepIndex !== stepIndex) {
      setStepIndex(missionState.stepIndex);
    }
  }, [missionState?.stepIndex, stepIndex]);

  const step = mission.steps[stepIndex];

  function handleNext() {
    if (step.isSuccess) {
      onComplete();
    } else if (stepIndex < mission.steps.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      onSyncState?.({ stepIndex: next });
    }
  }

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in" key={step.id}>
        <div className="tag">{mission.locationName}</div>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>{mission.title}</h2>
        <div className="card" style={{ padding: 20 }}>
          <pre style={{
            fontFamily: "var(--font-cursive)", fontSize: 13,
            lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
          }}>
            {step.text}
          </pre>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <button className="btn-primary" onClick={handleNext}>
          {step.button}
        </button>
      </div>
    </div>
  );
}

function RebusMission({ mission, onComplete, photos, onPhotoCapture, missionState, onSyncState }) {
  const [targetIndex, setTargetIndex] = useState(missionState?.targetIndex || 0);
  const [phase, setPhase] = useState(missionState?.phase || "intro");
  const [captured, setCaptured] = useState({});

  useEffect(() => {
    if (missionState?.phase && missionState.phase !== phase) {
      setPhase(missionState.phase);
    }
    if (missionState?.targetIndex !== undefined && missionState.targetIndex !== targetIndex) {
      setTargetIndex(missionState.targetIndex);
    }
  }, [missionState?.phase, missionState?.targetIndex, phase, targetIndex]);

  function goPhase(p, extras) {
    setPhase(p);
    onSyncState?.({ phase: p, ...extras });
  }

  if (phase === "intro") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">{mission.locationName}</div>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>{mission.title}</h2>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.intro}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={() => goPhase("hunt", { targetIndex: 0 })} style={{ marginTop: 24 }}>
          Lancer la chasse
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">{mission.locationName}</div>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.transitionText}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={onComplete} style={{ marginTop: 24 }}>
          Prochaine destination
        </button>
      </div>
    );
  }

  const target = mission.targets[targetIndex];
  const hasPhoto = captured[target.id] || photos?.[target.photoKey];

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in" key={target.id}>
        <div className="tag">Élément {targetIndex + 1} / {mission.targets.length}</div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{target.emoji}</div>
          <h3 style={{ fontSize: 18, color: "var(--gold)" }}>{target.name}</h3>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <pre style={{
            fontFamily: "var(--font-cursive)", fontSize: 13,
            lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
          }}>
            {target.instruction}
          </pre>
          <PhotoCapture
            photoKey={target.photoKey}
            existingUrl={photos?.[target.photoKey]}
            onCapture={(key, file) => {
              setCaptured((prev) => ({ ...prev, [target.id]: true }));
              onPhotoCapture?.(key, file);
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        {hasPhoto ? (
          <button
            className="btn-primary"
            onClick={() => {
              if (targetIndex < mission.targets.length - 1) {
                const next = targetIndex + 1;
                setTargetIndex(next);
                onSyncState?.({ targetIndex: next });
              } else {
                goPhase("done");
              }
            }}
          >
            {targetIndex < mission.targets.length - 1 ? "Élément suivant" : "Continuer"}
          </button>
        ) : (
          <p style={{
            textAlign: "center", fontSize: 11,
            color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
          }}>
            Prenez la photo pour continuer
          </p>
        )}
      </div>
    </div>
  );
}

function PhotoMission({ mission, onComplete, photos, onPhotoCapture, missionState, onSyncState }) {
  const [poseIndex, setPoseIndex] = useState(missionState?.poseIndex || 0);
  const [phase, setPhase] = useState(missionState?.phase || "intro");
  const [captured, setCaptured] = useState({});

  useEffect(() => {
    if (missionState?.phase && missionState.phase !== phase) {
      setPhase(missionState.phase);
    }
    if (missionState?.poseIndex !== undefined && missionState.poseIndex !== poseIndex) {
      setPoseIndex(missionState.poseIndex);
    }
  }, [missionState?.phase, missionState?.poseIndex, phase, poseIndex]);

  function goPhase(p, extras) {
    setPhase(p);
    onSyncState?.({ phase: p, ...extras });
  }

  if (phase === "intro") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">{mission.locationName}</div>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>{mission.title}</h2>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.intro}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={() => goPhase("poses", { poseIndex: 0 })} style={{ marginTop: 24 }}>
          C'est parti
        </button>
      </div>
    );
  }

  if (phase === "assembly") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">Analyse</div>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.assemblyInstruction}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={() => goPhase("success")} style={{ marginTop: 24 }}>
          Continuer
        </button>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag" style={{ borderColor: "var(--green)", color: "var(--green)" }}>
            Résolu
          </div>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.successText}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={onComplete} style={{ marginTop: 24 }}>
          Prochaine destination
        </button>
      </div>
    );
  }

  const currentPose = mission.poses[poseIndex];
  if (!currentPose) {
    setTimeout(() => goPhase("assembly"), 300);
    return null;
  }

  const hasPhoto = captured[currentPose.id] || photos?.[currentPose.photoKey];

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in" key={currentPose.id} style={{ overflow: "auto", flex: 1 }}>
        <div className="tag">Pose {poseIndex + 1} / {mission.poses.length}</div>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: "var(--gold)" }}>{currentPose.title}</h3>

        {currentPose.referenceImage && (
          <div style={{
            marginBottom: 16, borderRadius: 4, overflow: "hidden",
            border: "2px solid var(--gold-dim)",
            position: "relative",
          }}>
            <img
              src={currentPose.referenceImage}
              alt="Pose de référence"
              style={{ width: "100%", objectFit: "contain", display: "block" }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(44,36,22,0.8))",
              padding: "12px 12px 8px",
              fontFamily: "var(--font-cursive)", fontSize: 10,
              color: "var(--text-light)", letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Pose à reproduire
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 20 }}>
          <pre style={{
            fontFamily: "var(--font-cursive)", fontSize: 13,
            lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
          }}>
            {currentPose.instruction}
          </pre>
          <PhotoCapture
            photoKey={currentPose.photoKey}
            existingUrl={photos?.[currentPose.photoKey]}
            onCapture={(key, file) => {
              setCaptured((prev) => ({ ...prev, [currentPose.id]: true }));
              onPhotoCapture?.(key, file);
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        {hasPhoto ? (
          <button
            className="btn-primary"
            onClick={() => {
              if (poseIndex < mission.poses.length - 1) {
                const next = poseIndex + 1;
                setPoseIndex(next);
                onSyncState?.({ poseIndex: next });
              } else {
                goPhase("assembly");
              }
            }}
          >
            {poseIndex < mission.poses.length - 1 ? "Pose suivante" : "Assembler les preuves"}
          </button>
        ) : (
          <p style={{
            textAlign: "center", fontSize: 11,
            color: "var(--text-dim)", fontFamily: "var(--font-cursive)",
          }}>
            Prenez la photo pour continuer
          </p>
        )}
      </div>
    </div>
  );
}

function BombIntro({ mission, onStartBomb, onBack, missionState, onSyncState }) {
  const [phase, setPhase] = useState(missionState?.bombIntroPhase || "chill");

  useEffect(() => {
    if (missionState?.bombIntroPhase && missionState.bombIntroPhase !== phase) {
      setPhase(missionState.bombIntroPhase);
    }
  }, [missionState?.bombIntroPhase, phase]);

  function goPhase(p) {
    setPhase(p);
    onSyncState?.({ bombIntroPhase: p });
  }

  if (phase === "chill") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">{mission.locationName}</div>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>{mission.title}</h2>
          <div className="card" style={{ padding: 20 }}>
            <div className="pin" />
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 14,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {"Aaaah on est pas bien le matin, y'a dégun, pas un casse couille..."}
            </pre>
          </div>
        </div>
        <button className="btn-primary" onClick={() => goPhase("alert")} style={{ marginTop: 24 }}>
          Profiter du moment
        </button>
      </div>
    );
  }

  if (phase === "alert") {
    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in shake">
          <div className="tag" style={{ borderColor: "var(--red)", color: "var(--red)" }}>Alerte générale</div>
          <div className="card" style={{ padding: 20 }}>
            <div className="pin" />
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
            }}>
              {mission.intro.text}
            </pre>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => goPhase("rule")}>
            Continuer
          </button>
          <button className="btn-ghost" onClick={onBack}>
            Retour à la carte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
      <div className="fade-in">
        <div className="tag">Règles</div>
        <div className="card" style={{ padding: 20 }}>
          <pre style={{
            fontFamily: "var(--font-cursive)", fontSize: 13, lineHeight: 1.8,
            whiteSpace: "pre-wrap", marginBottom: 8, color: "var(--text)",
          }}>
            {mission.intro.rule}
          </pre>
          <div className="evidence-tag">
            <span>●</span> Priorité haute
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn-primary" onClick={() => onStartBomb("device")}>
          J'ai la bombe — Mariarty
        </button>
        <button className="btn-secondary" onClick={() => onStartBomb("manual")}>
          J'ai le manuel — Sherlock
        </button>
      </div>
    </div>
  );
}


export default function MissionScreen({ mission, onComplete, onStartBomb, onBack, photos, onPhotoCapture, missionState, onSyncState }) {
  if (mission.type === "coop-bomb") {
    return <BombIntro mission={mission} onStartBomb={onStartBomb} onBack={onBack} missionState={missionState} onSyncState={onSyncState} />;
  }

  if (mission.type === "rebus") {
    return (
      <RebusMission
        mission={mission}
        onComplete={onComplete}
        photos={photos}
        onPhotoCapture={onPhotoCapture}
        missionState={missionState}
        onSyncState={onSyncState}
      />
    );
  }

  if (mission.type === "photo") {
    return (
      <PhotoMission
        mission={mission}
        onComplete={onComplete}
        photos={photos}
        onPhotoCapture={onPhotoCapture}
        missionState={missionState}
        onSyncState={onSyncState}
      />
    );
  }

  return (
    <DialogueMission
      mission={mission}
      onComplete={onComplete}
      missionState={missionState}
      onSyncState={onSyncState}
    />
  );
}
