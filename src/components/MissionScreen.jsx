import { useState, useRef } from "react";

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

function DialogueMission({ mission, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = mission.steps[stepIndex];

  function handleNext() {
    if (step.isSuccess) {
      onComplete();
    } else if (stepIndex < mission.steps.length - 1) {
      setStepIndex(stepIndex + 1);
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

function RebusMission({ mission, onComplete, photos, onPhotoCapture }) {
  const [targetIndex, setTargetIndex] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [captured, setCaptured] = useState({});

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
        <button className="btn-primary" onClick={() => setPhase("hunt")} style={{ marginTop: 24 }}>
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
                setTargetIndex(targetIndex + 1);
              } else {
                setPhase("done");
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

function PhotoMission({ mission, onComplete, photos, onPhotoCapture }) {
  const [poseIndex, setPoseIndex] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [captured, setCaptured] = useState({});
  const [guess, setGuess] = useState("");
  const [guessError, setGuessError] = useState(false);

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
        <button className="btn-primary" onClick={() => setPhase("poses")} style={{ marginTop: 24 }}>
          C'est parti
        </button>
      </div>
    );
  }

  if (phase === "assembly") {
    const rebusPhotos = [
      { key: "peche", label: "?" },
      { key: "lentilles", label: "?" },
      { key: "pose_o", label: "?" },
    ];

    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className="fade-in">
          <div className="tag">Assemblage</div>
          <div className="card" style={{ padding: 20 }}>
            <pre style={{
              fontFamily: "var(--font-cursive)", fontSize: 13,
              lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)",
              marginBottom: 16,
            }}>
              {mission.assemblyInstruction}
            </pre>

            <div style={{
              display: "flex", gap: 8, justifyContent: "center",
              marginBottom: 16,
            }}>
              {rebusPhotos.map((rp) => {
                const url = photos?.[rp.key];
                return (
                  <div key={rp.key} style={{
                    width: 90, height: 90,
                    border: "2px solid var(--gold-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", background: "var(--bg-card)",
                  }}>
                    {url ? (
                      <img src={url} alt="" style={{
                        width: "100%", height: "100%", objectFit: "cover",
                      }} />
                    ) : (
                      <span style={{
                        fontSize: 24, color: "var(--gold-dim)",
                        fontFamily: "var(--font-serif)",
                      }}>
                        {rp.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{
              display: "flex", justifyContent: "center", gap: 8,
              fontSize: 20, fontFamily: "var(--font-serif)",
              fontWeight: 700, color: "var(--gold-dim)",
              marginBottom: 16,
            }}>
              <span>?</span><span>+</span><span>?</span><span>+</span><span>?</span><span>=</span><span>???</span>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setPhase("guess")} style={{ marginTop: 24 }}>
          Deviner le mot
        </button>
      </div>
    );
  }

  if (phase === "guess") {
    function normalize(s) {
      return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    }

    function handleGuess() {
      if (normalize(guess) === normalize(mission.correctAnswer)) {
        setPhase("success");
      } else {
        setGuessError(true);
        setTimeout(() => setGuessError(false), 600);
      }
    }

    return (
      <div className="screen screen-padded" style={{ justifyContent: "space-between" }}>
        <div className={`fade-in ${guessError ? "shake" : ""}`}>
          <div className="tag">Rébus</div>
          <h3 style={{ fontSize: 18, marginBottom: 16, color: "var(--gold)" }}>
            Quel mot forment ces 3 éléments ?
          </h3>
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              display: "flex", gap: 8, justifyContent: "center",
              marginBottom: 20,
            }}>
              {["peche", "lentilles", "pose_o"].map((key) => {
                const url = photos?.[key];
                return (
                  <div key={key} style={{
                    width: 70, height: 70,
                    border: "2px solid var(--gold-dim)",
                    overflow: "hidden", background: "var(--bg-card)",
                  }}>
                    {url ? (
                      <img src={url} alt="" style={{
                        width: "100%", height: "100%", objectFit: "cover",
                      }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, color: "var(--gold-dim)",
                      }}>?</div>
                    )}
                  </div>
                );
              })}
            </div>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Votre réponse..."
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              style={{
                width: "100%", padding: "14px 16px",
                background: "var(--bg-card)", border: "1px solid var(--gold-dim)",
                color: "var(--text)", fontSize: 18,
                fontFamily: "var(--font-serif)", fontWeight: 700,
                textAlign: "center", letterSpacing: 3,
              }}
            />
          </div>
        </div>
        <button className="btn-primary" onClick={handleGuess} style={{ marginTop: 24 }}>
          Valider
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
    setTimeout(() => setPhase("assembly"), 300);
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
              style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
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
                setPoseIndex(poseIndex + 1);
              } else {
                setPhase("assembly");
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

function BombIntro({ mission, onStartBomb, onBack }) {
  const [showRule, setShowRule] = useState(false);

  if (!showRule) {
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
              {mission.intro.text}
            </pre>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => setShowRule(true)}>
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

export default function MissionScreen({ mission, onComplete, onStartBomb, onBack, photos, onPhotoCapture }) {
  if (mission.type === "coop-bomb") {
    return <BombIntro mission={mission} onStartBomb={onStartBomb} onBack={onBack} />;
  }

  if (mission.type === "rebus") {
    return (
      <RebusMission
        mission={mission}
        onComplete={onComplete}
        photos={photos}
        onPhotoCapture={onPhotoCapture}
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
      />
    );
  }

  return <DialogueMission mission={mission} onComplete={onComplete} />;
}
