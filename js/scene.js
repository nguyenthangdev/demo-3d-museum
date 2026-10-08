import * as THREE from '../vendor/three.module.min.js';

const GOLD = 0xcda768;
const STONE = 0xd1c4aa;

function mat(color, metalness = 0, roughness = 0.7) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function makeArtifact(item) {
  const group = new THREE.Group();
  const color = new THREE.Color(item.color || '#cda768');
  const body = mat(color, item.shape === 'drum' || item.shape === 'sphere' ? 0.56 : 0.1, 0.37);
  const accent = mat(GOLD, 0.68, 0.28);
  const deep = mat(0x48443d, 0.5, 0.36);

  if (item.shape === 'vase') {
    const profile = [
      [0, 0], [0.29, 0.02], [0.36, 0.15], [0.49, 0.41], [0.57, 0.74],
      [0.53, 1.02], [0.36, 1.3], [0.27, 1.57], [0.29, 1.72], [0.38, 1.78], [0.39, 1.83],
    ];
    mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48), body, group, 0, 0.1);
    [0.47, 0.55, 1.01, 1.41, 1.76].forEach((y, i) => {
      const ring = mesh(new THREE.TorusGeometry([0.52, 0.56, 0.53, 0.32, 0.37][i], 0.014, 8, 48), accent, group, 0, y);
      ring.rotation.x = Math.PI / 2;
    });
    mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.05, 32), deep, group, 0, 1.88);
  } else if (item.shape === 'drum') {
    mesh(new THREE.CylinderGeometry(0.68, 0.55, 1.13, 48), body, group, 0, 0.7);
    mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 48), accent, group, 0, 1.29);
    [0.25, 0.42, 0.59].forEach((radius) => {
      const ring = mesh(new THREE.TorusGeometry(radius, 0.015, 8, 64), deep, group, 0, 1.325);
      ring.rotation.x = Math.PI / 2;
    });
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      mesh(new THREE.SphereGeometry(0.025, 8, 8), deep, group, Math.sin(a) * 0.51, 1.33, Math.cos(a) * 0.51);
    }
    [0.28, 0.52, 1.02].forEach((y) => {
      const ring = mesh(new THREE.TorusGeometry(y === 1.02 ? 0.66 : y === 0.52 ? 0.62 : 0.57, 0.016, 8, 48), accent, group, 0, y);
      ring.rotation.x = Math.PI / 2;
    });
  } else if (item.shape === 'statue') {
    mesh(new THREE.CylinderGeometry(0.37, 0.48, 0.3, 24), accent, group, 0, 0.15);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const petal = mesh(new THREE.SphereGeometry(0.3, 16, 12), body, group, Math.sin(a) * 0.28, 0.37, Math.cos(a) * 0.28);
      petal.scale.set(0.58, 0.25, 1.2); petal.rotation.y = a;
    }
    mesh(new THREE.CylinderGeometry(0.28, 0.37, 0.83, 24), body, group, 0, 0.93);
    mesh(new THREE.SphereGeometry(0.25, 24, 24), body, group, 0, 1.59).scale.set(0.9, 1.12, 0.84);
    mesh(new THREE.CylinderGeometry(0.36, 0.25, 0.55, 24), body, group, 0, 1.21).rotation.z = 0.02;
    mesh(new THREE.TorusGeometry(0.28, 0.045, 8, 32), accent, group, 0, 1.8).rotation.x = Math.PI / 2;
  } else if (item.shape === 'sphere') {
    mesh(new THREE.CylinderGeometry(0.1, 0.37, 0.45, 20), deep, group, 0, 0.25);
    mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.45, 12), accent, group, 0, 1.15);
    mesh(new THREE.SphereGeometry(0.37, 28, 20), body, group, 0, 1.22);
    const rotations = [[0, 0, 0], [Math.PI / 2.8, 0, 0], [0, Math.PI / 2.8, 0]];
    rotations.forEach(([x, y, z]) => {
      const ring = mesh(new THREE.TorusGeometry(0.75, 0.035, 12, 72), accent, group, 0, 1.22);
      ring.rotation.set(x, y, z);
    });
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      mesh(new THREE.SphereGeometry(0.05, 10, 10), body, group, Math.sin(a) * 0.75, 1.22 + Math.cos(a) * 0.75);
    }
  } else {
    const paper = mesh(new THREE.BoxGeometry(1.5, 0.08, 1.05), body, group, 0, 0.85);
    paper.rotation.y = -0.28;
    [-0.73, 0.73].forEach((x) => {
      const roll = mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 20), accent, group, x, 0.87);
      roll.rotation.x = Math.PI / 2; roll.rotation.y = -0.28;
    });
    for (let i = 0; i < 4; i++) {
      const ink = mesh(new THREE.BoxGeometry(0.72 - i * 0.08, 0.004, 0.014), deep, group, -0.1, 0.899, -0.27 + i * 0.17);
      ink.rotation.y = -0.28;
    }
  }
  return group;
}

function makePainting(scene, x, z, width, colors) {
  const frame = mat(0x6e5638, 0.4, 0.5);
  mesh(new THREE.BoxGeometry(width + 0.18, 2.22, 0.11), frame, scene, x, 3.15, z);
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 340;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 340);
  grad.addColorStop(0, colors[0]); grad.addColorStop(0.52, colors[1]); grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 340);
  ctx.globalAlpha = 0.42;
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? '#eadcc2' : '#3c4a4c';
    ctx.beginPath(); ctx.ellipse(90 + i * 53, 190 + Math.sin(i * 1.9) * 60, 20 + i * 4, 80 + i * 3, i * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const art = new THREE.Mesh(new THREE.PlaneGeometry(width, 2.04), new THREE.MeshBasicMaterial({ map: texture }));
  art.position.set(x, 3.15, z + 0.065); scene.add(art);
}

export function createMuseumScene({ container, exhibits, hotspotsContainer, preview = false, onSelect = () => {} }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11171a);
  scene.fog = new THREE.Fog(0x11171a, 17, 38);
  const camera = new THREE.PerspectiveCamera(preview ? 47 : 66, 1, 0.08, 70);
  const rig = new THREE.Group(); scene.add(rig); rig.add(camera);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = !preview;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Không gian bảo tàng 3D');

  scene.add(new THREE.HemisphereLight(0xb8c5c2, 0x403426, 2.5));
  const floor = mesh(new THREE.PlaneGeometry(28, 28), mat(0x6d6860, 0.08, 0.8), scene, 0, 0, -2);
  floor.rotation.x = -Math.PI / 2;
  const gridMat = new THREE.MeshStandardMaterial({ color: 0x9b9181, transparent: true, opacity: 0.27 });
  for (let x = -12; x <= 12; x += 2) mesh(new THREE.BoxGeometry(0.012, 0.003, 26), gridMat, scene, x, 0.005, -2);
  for (let z = -14; z <= 10; z += 2) mesh(new THREE.BoxGeometry(24, 0.003, 0.012), gridMat, scene, 0, 0.005, z);
  mesh(new THREE.BoxGeometry(26, 8, 0.38), mat(0x30383a), scene, 0, 4, -14);
  mesh(new THREE.BoxGeometry(0.36, 8, 27), mat(0x293235), scene, -12.4, 4, -2);
  mesh(new THREE.BoxGeometry(0.36, 8, 27), mat(0x293235), scene, 12.4, 4, -2);
  mesh(new THREE.BoxGeometry(25, 0.26, 27), mat(0x383d3d), scene, 0, 7.5, -2);
  for (const x of [-11.8, -8, -4, 0, 4, 8, 11.8]) {
    const z = -13.7;
    mesh(new THREE.BoxGeometry(0.35, 7, 0.34), mat(0x5b5e58), scene, x, 3.45, z);
    mesh(new THREE.BoxGeometry(0.57, 0.17, 0.57), mat(GOLD, 0.55, 0.4), scene, x, 6.9, z);
  }
  makePainting(scene, -9, -13.48, 2.4, ['#29434a', '#9b8265', '#dfb678']);
  makePainting(scene, 9, -13.48, 2.4, ['#3a514b', '#857263', '#c4a676']);
  for (let x of [-9, -3, 3, 9]) {
    const light = new THREE.SpotLight(0xffe9bd, 65, 15, 0.52, 0.75, 1.4);
    light.position.set(x, 6.9, -1.2); light.target.position.set(x, 0, -4.6);
    light.castShadow = true; light.shadow.mapSize.set(512, 512);
    scene.add(light, light.target);
    mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.18, 24), mat(0x222522, 0.4), scene, x, 7.18, -1.2);
  }
  for (const x of [-11.7, 11.7]) for (const z of [-8, 2]) {
    mesh(new THREE.CylinderGeometry(0.52, 0.62, 4.8, 24), mat(0x4a504d), scene, x, 2.4, z);
    mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), mat(0x8b816f), scene, x, 4.88, z);
  }
  const glow = new THREE.PointLight(0xe1a65f, 13, 17, 1.8); glow.position.set(0, 4, -9); scene.add(glow);

  const targets = [];
  const artifactGroups = [];
  const hotspots = [];
  const ordered = [...exhibits].sort((a, b) => a.order - b.order);
  ordered.forEach((item) => {
    const [x, z] = item.position;
    mesh(new THREE.CylinderGeometry(1.03, 1.13, 0.12, 32), mat(0x2c3433), scene, x, 0.08, z);
    mesh(new THREE.CylinderGeometry(0.78, 0.82, 1.08, 32), mat(0x90938a, 0.18, 0.66), scene, x, 0.64, z);
    mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.09, 32), mat(0xb6aa90, 0.4, 0.4), scene, x, 1.23, z);
    const artifact = makeArtifact(item);
    artifact.position.set(x, 1.27, z);
    artifact.traverse((child) => { if (child.isMesh) { child.userData.exhibitId = item.id; targets.push(child); } });
    scene.add(artifact); artifactGroups.push(artifact);
    const lamp = new THREE.PointLight(new THREE.Color(item.color), 4, 5);
    lamp.position.set(x, 2.6, z); scene.add(lamp);
    if (hotspotsContainer) {
      const button = document.createElement('button');
      button.className = 'hotspot'; button.type = 'button';
      button.dataset.id = item.id;
      button.innerHTML = `<span class="hotspot__pulse"></span><span class="hotspot__label">${item.name}</span>`;
      button.setAttribute('aria-label', `Xem ${item.name}`);
      button.addEventListener('click', () => onSelect(item.id));
      hotspotsContainer.append(button);
      hotspots.push({ button, position: new THREE.Vector3(x, 3.18, z) });
    }
  });

  if (!preview) {
    for (let index = 0; index < 2; index++) {
      const controller = renderer.xr.getController(index);
      const beam = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.8 }),
      );
      controller.add(beam);
      controller.addEventListener('select', () => {
        const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(controller.getWorldQuaternion(new THREE.Quaternion()));
        const hits = new THREE.Raycaster(origin, direction, 0, 8).intersectObjects(targets, false);
        if (hits[0]) onSelect(hits[0].object.userData.exhibitId);
      });
      scene.add(controller);
    }
  }

  const keys = new Set();
  const keyDown = (event) => { if (/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(event.code) && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) { keys.add(event.code); event.preventDefault(); } };
  const keyUp = (event) => keys.delete(event.code);
  if (!preview) { window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp); }
  let joystick = { x: 0, y: 0 };
  let yaw = 0, pitch = -0.04, dragging = false, moved = false, pointerX = 0, pointerY = 0;
  let selectedId = null, previewTime = 0;
  rig.position.set(0, 0, preview ? 12.2 : 8.5);
  camera.position.set(0, preview ? 3.2 : 1.7, 0);
  if (preview) camera.lookAt(0, 1.5, -5);
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  function handleDown(event) { if (preview || event.button !== 0) return; dragging = true; moved = false; pointerX = event.clientX; pointerY = event.clientY; renderer.domElement.setPointerCapture(event.pointerId); }
  function handleMove(event) {
    if (!dragging) return;
    const dx = event.clientX - pointerX, dy = event.clientY - pointerY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    if (moved) { yaw -= dx * 0.0036; pitch = THREE.MathUtils.clamp(pitch - dy * 0.0034, -0.8, 0.7); }
    pointerX = event.clientX; pointerY = event.clientY;
  }
  function handleUp(event) {
    if (!dragging) return;
    dragging = false;
    if (moved) return;
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(targets, false)[0];
    if (hit) onSelect(hit.object.userData.exhibitId);
  }
  renderer.domElement.addEventListener('pointerdown', handleDown);
  renderer.domElement.addEventListener('pointermove', handleMove);
  renderer.domElement.addEventListener('pointerup', handleUp);

  const clock = new THREE.Clock();
  function resize() { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();

  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (preview) {
      previewTime += dt;
      rig.position.x = Math.sin(previewTime * 0.18) * 1.5;
      rig.position.z = 12.1 + Math.sin(previewTime * 0.13) * 0.4;
      camera.lookAt(0, 1.55, -5);
      artifactGroups.forEach((group, index) => { if (index === 3) group.rotation.y += dt * 0.15; });
    } else {
      rig.rotation.y = yaw;
      camera.rotation.x = pitch;
      let forward = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - joystick.y;
      let side = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + joystick.x;
      if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        for (const source of session?.inputSources || []) {
          const axes = source.gamepad?.axes || [];
          if (axes.length >= 4) { side += Math.abs(axes[2]) > 0.15 ? axes[2] : 0; forward -= Math.abs(axes[3]) > 0.15 ? axes[3] : 0; }
          else if (axes.length >= 2) { side += Math.abs(axes[0]) > 0.15 ? axes[0] : 0; forward -= Math.abs(axes[1]) > 0.15 ? axes[1] : 0; }
        }
      }
      const length = Math.hypot(forward, side) || 1;
      rig.translateX(side / length * dt * 3.2);
      rig.translateZ(-forward / length * dt * 3.2);
      rig.position.x = THREE.MathUtils.clamp(rig.position.x, -10.7, 10.7);
      rig.position.z = THREE.MathUtils.clamp(rig.position.z, -11.8, 8.8);
    }
    hotspots.forEach(({ button, position }) => {
      const projected = position.clone().project(camera);
      const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.08 && Math.abs(projected.y) < 1.08 && !renderer.xr.isPresenting;
      button.hidden = !visible;
      if (visible) { button.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`; button.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`; button.classList.toggle('is-selected', button.dataset.id === selectedId); }
    });
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  async function enterVR() {
    if (!navigator.xr) throw new Error('WebXR không khả dụng trong trình duyệt này.');
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
    await renderer.xr.setSession(session);
    return session;
  }

  function destroy() {
    renderer.setAnimationLoop(null); observer.disconnect();
    window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp);
    renderer.dispose(); renderer.domElement.remove();
  }

  return { setJoystick(x, y) { joystick = { x, y }; }, setSelected(id) { selectedId = id; }, enterVR, destroy };
}
