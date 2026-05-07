import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import mapboxgl from "mapbox-gl";

function getTargetSize(zoom, lat) {
  const metersPerPixel =
    (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  return Math.max(5, 35 * metersPerPixel);
}

export function createCharacterLayer(refLngLat) {
  const refCoord = mapboxgl.MercatorCoordinate.fromLngLat(refLngLat, 0);
  const scale = refCoord.meterInMercatorCoordinateUnits();

  return {
    id: "characters-3d",
    type: "custom",
    renderingMode: "3d",

    _models: {},
    _positions: {},
    _mixers: [],
    _timer: new THREE.Timer(),

    onAdd(map, gl) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      this.map = map;

      this.scene.add(new THREE.AmbientLight(0xfff5e6, 1.2));
      const sun = new THREE.DirectionalLight(0xfff5e6, 0.8);
      sun.position.set(50, 30, 100);
      this.scene.add(sun);
      const fill = new THREE.DirectionalLight(0xe6d5b8, 0.3);
      fill.position.set(-30, -50, 50);
      this.scene.add(fill);

      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      this.renderer.autoClear = false;
    },

    loadModel(url, key) {
      if (this._models[key]) {
        this.scene.remove(this._models[key]);
        delete this._models[key];
      }

      const loader = new GLTFLoader();
      const self = this;

      loader.load(url, (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 1 / maxDim;
        model.scale.set(s, s, s);

        const box2 = new THREE.Box3().setFromObject(model);
        const center = box2.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -box2.min.y, -center.z);

        const group = new THREE.Group();
        group.add(model);
        group.rotation.x = Math.PI / 2;
        group.visible = false;

        self._models[key] = group;
        self.scene.add(group);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          self._mixers.push(mixer);
        }

        self._applyPosition(key);
      });
    },

    updatePosition(key, lngLat) {
      this._positions[key] = lngLat;
      this._applyPosition(key);
    },

    _applyPosition(key) {
      const group = this._models[key];
      const pos = this._positions[key];
      if (!group || !pos) return;

      const merc = mapboxgl.MercatorCoordinate.fromLngLat(pos, 0);
      group.position.x = (merc.x - refCoord.x) / scale;
      group.position.y = (refCoord.y - merc.y) / scale;
      group.visible = true;
      this.map?.triggerRepaint();
    },

    render(gl, matrix) {
      if (!this.renderer) return;

      this._timer.update();
      const delta = this._timer.getDelta();
      const time = this._timer.getElapsed();

      this._mixers.forEach((m) => m.update(delta));

      const zoom = this.map.getZoom();
      const lat = this.map.getCenter().lat;
      const targetSize = getTargetSize(zoom, lat);

      const offset = targetSize * 0.8;

      Object.entries(this._models).forEach(([key, group]) => {
        if (!group.visible) return;

        group.scale.set(targetSize, targetSize, targetSize);
        group.position.z =
          Math.sin(time * 1.5 + (key === "partner" ? Math.PI : 0)) * 2 + 2;
        group.rotation.y =
          time * 0.3 + (key === "partner" ? Math.PI / 3 : 0);

        const side = key === "self" ? -1 : 1;
        const baseX = this._positions[key]
          ? (mapboxgl.MercatorCoordinate.fromLngLat(this._positions[key], 0).x - refCoord.x) / scale
          : group.position.x;
        group.position.x = baseX + side * offset;
      });

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(refCoord.x, refCoord.y, 0)
        .scale(new THREE.Vector3(scale, -scale, scale));

      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
    },

    onRemove() {
      this._mixers = [];
      this._models = {};
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
    },
  };
}
