import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function CharacterPreview({ modelUrl }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const timerRef = useRef(new THREE.Timer());
  const frameRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 4.5);
    camera.lookAt(0, 0.6, 0);

    scene.add(new THREE.AmbientLight(0xfff5e6, 1.5));
    const sun = new THREE.DirectionalLight(0xfff5e6, 1.0);
    sun.position.set(3, 4, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xe6d5b8, 0.4);
    fill.position.set(-3, -1, 2);
    scene.add(fill);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);

      timerRef.current.update();
      const delta = timerRef.current.getDelta();
      const time = timerRef.current.getElapsed();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (modelRef.current) {
        modelRef.current.rotation.y = time * 0.8;
        modelRef.current.position.y = Math.sin(time * 1.5) * 0.08;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !modelUrl) return;

    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current = null;
      mixerRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const s = 1.4 / maxDim;
      model.scale.set(s, s, s);

      const box2 = new THREE.Box3().setFromObject(model);
      const center = box2.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box2.min.y, -center.z);

      const group = new THREE.Group();
      group.add(model);

      scene.add(group);
      modelRef.current = group;

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
        mixerRef.current = mixer;
      }

      timerRef.current = new THREE.Timer();
    });
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 180,
        borderRadius: 4,
      }}
    />
  );
}
