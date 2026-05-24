// ─────────────────────────────────────────────────────────────
//  App.jsx  —  DesignForge  |  Main Application Component
//
//  Views:
//    "hero"        Landing page
//    "categories"  Design category picker
//    "editor"      Three.js 3D modeling workspace
//    "gallery"     Public community gallery
//
//  State managed entirely with React hooks (useState / useRef /
//  useEffect / useCallback).  No external state library needed.
// ─────────────────────────────────────────────────────────────

// CDN build — React is a global.  Vite users: import React from 'react'
const {
  useState, useEffect, useRef, useCallback
} = React;

// ── CONSTANTS ─────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'cars',         name: 'Cars & Vehicles',  icon: '🚗', color: '#FF4D4D' },
  { id: '3dprints',     name: '3D Prints',         icon: '🖨️', color: '#4D9FFF' },
  { id: 'electronics',  name: 'Electronics',       icon: '⚡', color: '#FFD700' },
  { id: 'architecture', name: 'Architecture',      icon: '🏛️', color: '#50C878' },
  { id: 'furniture',    name: 'Furniture',         icon: '🪑', color: '#FF8C42' },
  { id: 'aerospace',    name: 'Aerospace',         icon: '🚀', color: '#BF5FFF' },
  { id: 'jewelry',      name: 'Jewelry',           icon: '💎', color: '#00CED1' },
  { id: 'industrial',   name: 'Industrial',        icon: '⚙️', color: '#708090' },
];

const SHAPE_COLORS = [
  '#4d9fff','#ff4d4d','#50c878','#ffd700',
  '#ff8c42','#bf5fff','#00ced1','#ff3c00',
];

// ── STYLES (all CSS-in-JS so the file is self-contained) ──────

const css = `
  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 60px;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .logo { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 2px; color: var(--text); }
  .logo span { color: var(--accent); }
  .nav-actions { display: flex; gap: 1rem; align-items: center; }

  /* ── BUTTONS ── */
  .btn {
    padding: .45rem 1.2rem; border-radius: 4px;
    font-family: var(--font-body); font-size: .85rem; font-weight: 500;
    cursor: pointer; border: none; transition: all .2s;
  }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--accent); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #ff5522; transform: translateY(-1px); }
  .btn-secondary { background: var(--accent2); color: #000; font-weight: 600; }
  .btn-secondary:hover { opacity: .85; }

  /* ── VIEWS ── */
  .app { padding-top: 60px; }

  /* ── HERO ── */
  .hero {
    position: relative; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: calc(100vh - 60px); text-align: center; padding: 4rem 2rem; overflow: hidden;
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,60,0,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,60,0,.06) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridMove 20s linear infinite;
  }
  @keyframes gridMove { from { background-position: 0 0; } to { background-position: 60px 60px; } }
  .hero-glow {
    position: absolute; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(255,60,0,.12) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
  }
  .hero-tag {
    font-family: var(--font-mono); font-size: .75rem; letter-spacing: 4px;
    color: var(--accent); text-transform: uppercase; margin-bottom: 1.5rem;
    animation: fadeUp .6s .2s both;
  }
  .hero-title {
    font-family: var(--font-display); font-size: clamp(4rem,12vw,10rem);
    line-height: .9; letter-spacing: 4px; margin-bottom: 1.5rem;
    animation: fadeUp .6s .4s both;
  }
  .hero-title .accent { color: var(--accent); }
  .hero-sub {
    font-size: 1.1rem; color: var(--muted); max-width: 500px;
    line-height: 1.7; margin-bottom: 3rem; font-weight: 300;
    animation: fadeUp .6s .6s both;
  }
  .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; animation: fadeUp .6s .8s both; }
  .hero-ctas .btn { padding: .8rem 2rem; font-size: 1rem; }
  .hero-stats { display: flex; gap: 3rem; margin-top: 5rem; animation: fadeUp .6s 1s both; }
  .stat { text-align: center; }
  .stat-num { font-family: var(--font-display); font-size: 2.5rem; color: var(--accent2); }
  .stat-label { font-size: .75rem; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── SECTION SHARED ── */
  .section { padding: 2rem; }
  .section-tag { font-family: var(--font-mono); font-size: .7rem; color: var(--accent); letter-spacing: 4px; text-transform: uppercase; margin-bottom: .5rem; }
  .section-title { font-family: var(--font-display); font-size: 3rem; letter-spacing: 2px; margin-bottom: 2.5rem; }

  /* ── CATEGORIES ── */
  .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 1.2rem; }
  .cat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 2rem 1.5rem; cursor: pointer; transition: all .3s; position: relative; overflow: hidden;
  }
  .cat-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--cat-color, var(--accent)); transform: scaleX(0); transition: transform .3s;
  }
  .cat-card:hover { transform: translateY(-4px); }
  .cat-card:hover::before { transform: scaleX(1); }
  .cat-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
  .cat-name { font-weight: 600; font-size: 1rem; margin-bottom: .3rem; }
  .cat-sub  { font-size: .8rem; color: var(--muted); font-family: var(--font-mono); }

  /* ── EDITOR ── */
  .editor-wrap { display: flex; flex-direction: column; height: calc(100vh - 60px); }
  .toolbar {
    display: flex; align-items: center; gap: .5rem; padding: .6rem 1rem;
    background: var(--surface); border-bottom: 1px solid var(--border); flex-wrap: wrap;
  }
  .toolbar-sep { width: 1px; height: 24px; background: var(--border); margin: 0 .2rem; }
  .tool-btn {
    padding: .4rem .8rem; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); border-radius: 4px; cursor: pointer; font-size: .8rem;
    font-family: var(--font-body); transition: all .15s; display: flex; align-items: center; gap: .4rem;
  }
  .tool-btn:hover, .tool-btn.active  { background: var(--accent); border-color: var(--accent); color: #fff; }
  .tool-btn.active-blue { background: var(--accent2); border-color: var(--accent2); color: #000; }
  .workspace { flex: 1; display: flex; overflow: hidden; }
  .canvas-wrap { flex: 1; position: relative; background: #080810; }
  .three-canvas { width: 100%; height: 100%; display: block; }
  .canvas-info {
    position: absolute; bottom: 1rem; left: 1rem;
    font-family: var(--font-mono); font-size: .7rem; color: var(--muted); pointer-events: none;
  }
  .canvas-info span { color: var(--accent2); }

  /* ── PROPS PANEL ── */
  .props {
    width: 260px; background: var(--surface); border-left: 1px solid var(--border);
    overflow-y: auto; padding: 1rem; flex-shrink: 0;
  }
  .props-sec { margin-bottom: 1.5rem; }
  .props-hd {
    font-family: var(--font-mono); font-size: .7rem; letter-spacing: 3px; text-transform: uppercase;
    color: var(--muted); margin-bottom: .8rem; padding-bottom: .4rem; border-bottom: 1px solid var(--border);
  }
  .prop-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6rem; gap: .5rem; }
  .prop-label { font-size: .78rem; color: var(--muted); flex-shrink: 0; }
  .prop-input {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    padding: .3rem .5rem; border-radius: 3px; font-size: .78rem; font-family: var(--font-mono);
    width: 100%; transition: border-color .2s;
  }
  .prop-input:focus { outline: none; border-color: var(--accent2); }
  .color-pick { width: 100%; height: 32px; border-radius: 3px; border: 1px solid var(--border); cursor: pointer; background: none; }
  .obj-list { list-style: none; }
  .obj-item {
    display: flex; align-items: center; gap: .5rem; padding: .4rem .6rem;
    border-radius: 4px; cursor: pointer; font-size: .82rem;
    transition: background .15s; border: 1px solid transparent;
  }
  .obj-item:hover { background: var(--surface2); }
  .obj-item.sel  { background: rgba(255,60,0,.1); border-color: var(--accent); }
  .obj-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .obj-name { flex: 1; }
  .obj-del  { color: var(--muted); cursor: pointer; font-size: .7rem; }
  .obj-del:hover { color: var(--accent); }

  /* ── GALLERY ── */
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 1.2rem; }
  .design-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    overflow: hidden; transition: all .3s; cursor: pointer;
  }
  .design-card:hover { transform: translateY(-4px); border-color: var(--accent2); }
  .design-thumb {
    width: 100%; aspect-ratio: 16/9; background: var(--surface2);
    display: flex; align-items: center; justify-content: center; font-size: 3rem;
  }
  .design-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .design-info { padding: 1rem; }
  .design-name { font-weight: 600; margin-bottom: .3rem; }
  .design-meta { display: flex; justify-content: space-between; font-size: .78rem; color: var(--muted); font-family: var(--font-mono); }
  .cat-badge {
    display: inline-block; font-size: .68rem; padding: .2rem .5rem; border-radius: 20px;
    background: var(--surface2); border: 1px solid var(--border); margin-top: .5rem;
    font-family: var(--font-mono); letter-spacing: 1px;
  }
  .empty-state { color: var(--muted); font-size: .9rem; grid-column: 1/-1; text-align: center; padding: 3rem 0; }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 2rem; width: 90%; max-width: 460px; animation: modalIn .3s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
  .modal-title { font-family: var(--font-display); font-size: 2rem; margin-bottom: 1.5rem; letter-spacing: 2px; }
  .form-group { margin-bottom: 1rem; }
  .form-label { font-size: .78rem; color: var(--muted); margin-bottom: .4rem; display: block; font-family: var(--font-mono); letter-spacing: 1px; text-transform: uppercase; }
  .form-input, .form-select, .form-textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: .6rem .8rem; border-radius: 4px;
    font-family: var(--font-body); font-size: .9rem; transition: border-color .2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--accent); }
  .form-select option { background: var(--surface); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; }
  .toggle {
    width: 44px; height: 24px; background: var(--surface2); border-radius: 12px;
    cursor: pointer; position: relative; border: 1px solid var(--border); transition: background .2s;
    flex-shrink: 0;
  }
  .toggle.on { background: var(--accent); border-color: var(--accent); }
  .toggle::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform .2s;
  }
  .toggle.on::after { transform: translateX(20px); }
  .modal-actions { display: flex; gap: .8rem; margin-top: 1.5rem; justify-content: flex-end; }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 2rem; right: 2rem; background: var(--surface);
    border: 1px solid var(--border); border-left: 3px solid var(--accent);
    padding: .8rem 1.2rem; border-radius: 6px; font-size: .85rem; z-index: 500;
    transform: translateY(100px); opacity: 0; transition: all .3s; pointer-events: none;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast.success { border-left-color: var(--accent2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .props { display: none; }
    .hero-stats { gap: 1.5rem; }
    .toolbar { overflow-x: auto; flex-wrap: nowrap; }
  }
`;

// Inject styles once
(function injectStyles() {
  if (document.getElementById('df-styles')) return;
  const el = document.createElement('style');
  el.id = 'df-styles';
  el.textContent = css;
  document.head.appendChild(el);
})();

// ── THREE.JS HELPER ────────────────────────────────────────────

function buildScene(canvas, container) {
  const scene    = new THREE.Scene();
  scene.background = new THREE.Color(0x080810);
  scene.fog        = new THREE.Fog(0x080810, 20, 60);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type  = THREE.PCFSoftShadowMap;
  renderer.toneMapping     = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 10, 5); dir.castShadow = true; scene.add(dir);
  const fill = new THREE.DirectionalLight(0x00d4ff, 0.3); fill.position.set(-5,-2,-5); scene.add(fill);
  const rim  = new THREE.DirectionalLight(0xff3c00, 0.2); rim.position.set(0,-5,5); scene.add(rim);

  // Grid + floor
  scene.add(new THREE.GridHelper(20, 20, 0x2a2a3a, 0x1a1a2a));
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x0c0c14, roughness: 0.9, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.userData.isFloor = true;
  scene.add(floor);

  return { scene, camera, renderer };
}

function makeGeometry(type) {
  const s = 1;
  const map = {
    box:      () => new THREE.BoxGeometry(s, s, s),
    sphere:   () => new THREE.SphereGeometry(s * 0.6, 32, 32),
    cylinder: () => new THREE.CylinderGeometry(s * 0.5, s * 0.5, s, 32),
    cone:     () => new THREE.ConeGeometry(s * 0.5, s, 32),
    torus:    () => new THREE.TorusGeometry(s * 0.4, s * 0.15, 16, 64),
  };
  return (map[type] || map.box)();
}

// ── SUB-COMPONENTS ─────────────────────────────────────────────

function Navbar({ onNav, onNewDesign }) {
  return (
    <nav className="nav">
      <div className="logo">DESIGN<span>FORGE</span></div>
      <div className="nav-actions">
        <button className="btn btn-ghost" onClick={() => onNav('gallery')}>🌐 Gallery</button>
        <button className="btn btn-ghost" onClick={() => onNav('categories')}>⊞ Categories</button>
        <button className="btn btn-primary" onClick={() => onNewDesign(null)}>+ New Design</button>
      </div>
    </nav>
  );
}

function HeroView({ onNav, onNewDesign, designCount }) {
  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="hero-glow"></div>
      <div className="hero-tag">// Professional 3D Design Platform</div>
      <h1 className="hero-title">
        <div>DESIGN</div>
        <div className="accent">FORGE</div>
      </h1>
      <p className="hero-sub">
        Where engineers, designers, and visionaries build the future —
        across cars, electronics, 3D prints, and beyond.
      </p>
      <div className="hero-ctas">
        <button className="btn btn-primary" onClick={() => onNewDesign(null)}>🚀 Start Designing</button>
        <button className="btn btn-ghost"   onClick={() => onNav('gallery')}>Explore Designs →</button>
      </div>
      <div className="hero-stats">
        <div className="stat"><div className="stat-num">{designCount}</div><div className="stat-label">Designs</div></div>
        <div className="stat"><div className="stat-num">8</div><div className="stat-label">Categories</div></div>
        <div className="stat"><div className="stat-num">∞</div><div className="stat-label">Possibilities</div></div>
      </div>
    </section>
  );
}

function CategoriesView({ onNewDesign }) {
  return (
    <section className="section">
      <div className="section-tag">// EXPLORE</div>
      <div className="section-title">CATEGORIES</div>
      <div className="cat-grid">
        {CATEGORIES.map(c => (
          <div
            key={c.id}
            className="cat-card"
            style={{ '--cat-color': c.color }}
            onClick={() => onNewDesign(c.id)}
          >
            <span className="cat-icon">{c.icon}</span>
            <div className="cat-name">{c.name}</div>
            <div className="cat-sub">// DESIGN WORKSPACE</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 3D EDITOR VIEW ────────────────────────────────────────────

function EditorView({ category, onBack, onSaveSuccess }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const threeRef     = useRef(null); // { scene, camera, renderer, objects, animId }
  const camRef       = useRef({ theta: 0.8, phi: 0.6, radius: 8, target: new THREE.Vector3() });
  const mouseRef     = useRef({ down: false, pan: false, x: 0, y: 0 });
  const colorIdxRef  = useRef(0);
  const touchDistRef = useRef(0);

  const [selectedObj,  setSelectedObj]  = useState(null);
  const [objects,      setObjects]      = useState([]);
  const [transform,    setTransform]    = useState({ px:0,py:0,pz:0,sx:1,sy:1,sz:1 });
  const [material,     setMaterial]     = useState({ color:'#4d9fff', metalness:0.3, roughness:0.4 });
  const [wireframe,    setWireframe]    = useState(false);
  const [showSave,     setShowSave]     = useState(false);
  const [saveForm,     setSaveForm]     = useState({ name:'Untitled Design', desc:'', author:'', isPublic: false, category: category || 'cars' });
  const [toast,        setToast]        = useState({ msg:'', type:'', show: false });

  // ── camera ──
  const updateCamera = useCallback(() => {
    const { theta, phi, radius, target } = camRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    const cam = threeRef.current?.camera;
    if (!cam) return;
    cam.position.set(target.x + x, target.y + y, target.z + z);
    cam.lookAt(target);
  }, []);

  // ── init Three.js ──
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const { scene, camera, renderer } = buildScene(canvas, container);

    let animId;
    const objList = [];
    threeRef.current = { scene, camera, renderer, objects: objList };
    updateCamera();

    const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();
    threeRef.current.animId = animId;

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(threeRef.current.animId);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── mouse / touch handlers ──
  const handleMouseDown = useCallback((e) => {
    mouseRef.current = { down: true, pan: e.button === 2, x: e.clientX, y: e.clientY };
    if (e.button === 0) pickObject(e);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!mouseRef.current.down) return;
    const dx = e.clientX - mouseRef.current.x;
    const dy = e.clientY - mouseRef.current.y;
    const c  = camRef.current;
    if (mouseRef.current.pan) {
      const speed = 0.005 * c.radius;
      const cam   = threeRef.current.camera;
      const right = new THREE.Vector3();
      right.crossVectors(cam.getWorldDirection(new THREE.Vector3()), cam.up).normalize();
      c.target.addScaledVector(right, -dx * speed);
      c.target.addScaledVector(cam.up, dy * speed);
    } else {
      c.theta -= dx * 0.008;
      c.phi = Math.max(0.1, Math.min(Math.PI - 0.1, c.phi - dy * 0.008));
    }
    updateCamera();
    mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY;
  }, [updateCamera]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    camRef.current.radius = Math.max(1.5, Math.min(30, camRef.current.radius + e.deltaY * 0.01));
    updateCamera();
  }, [updateCamera]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      mouseRef.current = { down: true, pan: false, x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      touchDistRef.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && mouseRef.current.down) {
      const dx = e.touches[0].clientX - mouseRef.current.x;
      const dy = e.touches[0].clientY - mouseRef.current.y;
      const c  = camRef.current;
      c.theta -= dx * 0.008;
      c.phi = Math.max(0.1, Math.min(Math.PI - 0.1, c.phi - dy * 0.008));
      updateCamera();
      mouseRef.current.x = e.touches[0].clientX; mouseRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      camRef.current.radius = Math.max(1.5, Math.min(30, camRef.current.radius * (touchDistRef.current / dist)));
      touchDistRef.current = dist;
      updateCamera();
    }
  }, [updateCamera]);

  // ── object picking ──
  const pickObject = useCallback((e) => {
    const canvas    = canvasRef.current;
    const rect      = canvas.getBoundingClientRect();
    const mouse     = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  *  2 - 1,
      -((e.clientY - rect.top)  / rect.height) *  2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, threeRef.current.camera);
    const hits = raycaster.intersectObjects(threeRef.current.objects);
    if (hits.length > 0) {
      doSelect(hits[0].object);
    } else {
      doDeselect();
    }
  }, []);

  function doSelect(obj) {
    doDeselect();
    // outline
    const outline = new THREE.Mesh(obj.geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.BackSide }));
    outline.scale.multiplyScalar(1.05); outline.userData.isOutline = true;
    obj.add(outline);
    setSelectedObj(obj);
    setTransform({
      px: +obj.position.x.toFixed(2), py: +obj.position.y.toFixed(2), pz: +obj.position.z.toFixed(2),
      sx: +obj.scale.x.toFixed(2),    sy: +obj.scale.y.toFixed(2),    sz: +obj.scale.z.toFixed(2),
    });
    setMaterial({
      color: '#' + obj.material.color.getHexString(),
      metalness: obj.material.metalness,
      roughness: obj.material.roughness,
    });
  }

  function doDeselect() {
    setSelectedObj(prev => {
      if (prev) prev.children.filter(c => c.userData.isOutline).forEach(c => prev.remove(c));
      return null;
    });
  }

  // ── add shape ──
  const addShape = useCallback((type) => {
    const { scene, objects: list } = threeRef.current;
    const geo = makeGeometry(type);
    const mat = new THREE.MeshStandardMaterial({
      color: SHAPE_COLORS[colorIdxRef.current % SHAPE_COLORS.length],
      metalness: 0.3, roughness: 0.4,
    });
    colorIdxRef.current++;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random()-.5)*4, 0.5, (Math.random()-.5)*4);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.name = type.charAt(0).toUpperCase() + type.slice(1) + '_' + list.length;
    scene.add(mesh); list.push(mesh);
    setObjects([...list]);
    doSelect(mesh);
  }, []);

  // ── delete ──
  const deleteSelected = useCallback(() => {
    if (!selectedObj) return;
    threeRef.current.scene.remove(selectedObj);
    threeRef.current.objects = threeRef.current.objects.filter(o => o !== selectedObj);
    setObjects([...threeRef.current.objects]);
    setSelectedObj(null);
  }, [selectedObj]);

  // ── apply transform ──
  const applyTransform = useCallback((field, val) => {
    const next = { ...transform, [field]: +val };
    setTransform(next);
    if (!selectedObj) return;
    selectedObj.position.set(next.px, next.py, next.pz);
    selectedObj.scale.set(next.sx, next.sy, next.sz);
  }, [transform, selectedObj]);

  // ── apply material ──
  const applyMaterial = useCallback((field, val) => {
    const next = { ...material, [field]: field === 'color' ? val : +val };
    setMaterial(next);
    if (!selectedObj) return;
    selectedObj.material.color.set(next.color);
    selectedObj.material.metalness = next.metalness;
    selectedObj.material.roughness = next.roughness;
  }, [material, selectedObj]);

  // ── wireframe ──
  const toggleWireframe = useCallback(() => {
    const wf = !wireframe;
    threeRef.current.objects.forEach(o => { o.material.wireframe = wf; });
    setWireframe(wf);
  }, [wireframe]);

  // ── reset camera ──
  const resetCamera = useCallback(() => {
    camRef.current = { theta: 0.8, phi: 0.6, radius: 8, target: new THREE.Vector3() };
    updateCamera();
  }, [updateCamera]);

  // ── save design ──
  const saveDesign = useCallback(async () => {
    const thumb = threeRef.current?.renderer?.domElement?.toDataURL('image/jpeg', 0.6) || '';
    const sceneData = threeRef.current.objects.map(o => ({
      type: o.geometry.type, name: o.userData.name,
      position: o.position.toArray(), scale: o.scale.toArray(), rotation: o.rotation.toArray(),
      color: '#' + o.material.color.getHexString(),
      metalness: o.material.metalness, roughness: o.material.roughness,
    }));
    const payload = {
      name: saveForm.name, category: saveForm.category, description: saveForm.desc,
      author: saveForm.author || 'Anonymous', is_public: saveForm.isPublic,
      thumbnail: thumb, scene_data: { objects: sceneData },
    };
    try {
      const res  = await fetch('/api/designs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        setShowSave(false);
        showToast('Design saved!' + (saveForm.isPublic ? ' 🌐 Shared publicly.' : ''), 'success');
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch { showToast('Save failed — check your connection.'); }
  }, [saveForm, onSaveSuccess]);

  function showToast(msg, type = '') {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }

  const catLabel = CATEGORIES.find(c => c.id === category)?.name || 'General';

  return (
    <div className="editor-wrap">
      {/* ── TOOLBAR ── */}
      <div className="toolbar">
        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
          <button className="tool-btn" onClick={onBack}>← Back</button>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'.8rem', color:'var(--muted)' }}>// {catLabel.toUpperCase()}</span>
        </div>
        <div className="toolbar-sep"/>
        {[['box','□ Box'],['sphere','○ Sphere'],['cylinder','⬤ Cylinder'],['cone','△ Cone'],['torus','◎ Torus']].map(([t,l]) => (
          <button key={t} className="tool-btn" onClick={() => addShape(t)}>{l}</button>
        ))}
        <div className="toolbar-sep"/>
        <button className={`tool-btn${wireframe?' active':''}`} onClick={toggleWireframe}>⬡ Wireframe</button>
        <button className="tool-btn" onClick={resetCamera}>⊙ Reset View</button>
        <button className="tool-btn" style={{ color:'#ff6b6b' }} onClick={deleteSelected}>✕ Delete</button>
        <div className="toolbar-sep"/>
        <button className="tool-btn active-blue" style={{ marginLeft:'auto' }} onClick={() => setShowSave(true)}>💾 Save & Share</button>
      </div>

      {/* ── WORKSPACE ── */}
      <div className="workspace">
        <div
          className="canvas-wrap"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => { mouseRef.current.down = false; }}
          onWheel={handleWheel}
          onContextMenu={e => e.preventDefault()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => { mouseRef.current.down = false; }}
        >
          <canvas className="three-canvas" ref={canvasRef}/>
          <div className="canvas-info">
            <div>Orbit: Left drag &nbsp;|&nbsp; Pan: Right drag &nbsp;|&nbsp; Zoom: Scroll</div>
            <div>Objects: <span>{objects.length}</span> &nbsp;|&nbsp; Selected: <span>{selectedObj?.userData?.name || 'None'}</span></div>
          </div>
        </div>

        {/* ── PROPERTIES PANEL ── */}
        <div className="props">
          <div className="props-sec">
            <div className="props-hd">// TRANSFORM</div>
            {[['px','Pos X'],['py','Pos Y'],['pz','Pos Z'],['sx','Scale X'],['sy','Scale Y'],['sz','Scale Z']].map(([f,l]) => (
              <div className="prop-row" key={f}>
                <span className="prop-label">{l}</span>
                <input className="prop-input" type="number" step="0.1" value={transform[f]} onChange={e => applyTransform(f, e.target.value)}/>
              </div>
            ))}
          </div>
          <div className="props-sec">
            <div className="props-hd">// MATERIAL</div>
            <div className="prop-row"><span className="prop-label">Color</span><input className="color-pick" type="color" value={material.color} onChange={e => applyMaterial('color', e.target.value)}/></div>
            <div className="prop-row"><span className="prop-label">Metalness</span><input className="prop-input" type="number" step="0.05" min="0" max="1" value={material.metalness} onChange={e => applyMaterial('metalness', e.target.value)}/></div>
            <div className="prop-row"><span className="prop-label">Roughness</span><input className="prop-input" type="number" step="0.05" min="0" max="1" value={material.roughness} onChange={e => applyMaterial('roughness', e.target.value)}/></div>
          </div>
          <div className="props-sec">
            <div className="props-hd">// OBJECTS</div>
            <ul className="obj-list">
              {objects.map((o, i) => (
                <li key={i} className={`obj-item${o === selectedObj ? ' sel' : ''}`} onClick={() => doSelect(o)}>
                  <div className="obj-dot" style={{ background: '#' + o.material.color.getHexString() }}/>
                  <span className="obj-name">{o.userData.name}</span>
                  <span className="obj-del" onClick={ev => { ev.stopPropagation(); threeRef.current.scene.remove(o); threeRef.current.objects.splice(i,1); setObjects([...threeRef.current.objects]); if(selectedObj===o) setSelectedObj(null); }}>✕</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── SAVE MODAL ── */}
      {showSave && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">SAVE DESIGN</div>
            <div className="form-group">
              <label className="form-label">Design Name</label>
              <input className="form-input" value={saveForm.name} onChange={e => setSaveForm(f => ({...f, name: e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={saveForm.category} onChange={e => setSaveForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={saveForm.desc} onChange={e => setSaveForm(f => ({...f, desc: e.target.value}))} placeholder="Describe your design..."/>
            </div>
            <div className="form-group">
              <label className="form-label">Author</label>
              <input className="form-input" value={saveForm.author} onChange={e => setSaveForm(f => ({...f, author: e.target.value}))} placeholder="Your name / company"/>
            </div>
            <div className="form-group">
              <div className="toggle-row">
                <label className="form-label" style={{ margin:0 }}>Share Publicly</label>
                <div className={`toggle${saveForm.isPublic?' on':''}`} onClick={() => setSaveForm(f => ({...f, isPublic: !f.isPublic}))}/>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowSave(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveDesign}>💾 Save Design</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`toast${toast.type?' '+toast.type:''}${toast.show?' show':''}`}>{toast.msg}</div>
    </div>
  );
}

// ── GALLERY VIEW ───────────────────────────────────────────────

function GalleryView() {
  const [designs, setDesigns] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/designs');
      setDesigns(await res.json());
    } catch { setDesigns([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  return (
    <section className="section">
      <div className="section-tag">// COMMUNITY</div>
      <div className="section-title">PUBLIC GALLERY</div>
      <div className="gallery-grid">
        {designs === null && <div className="empty-state">Loading designs…</div>}
        {designs !== null && designs.length === 0 && <div className="empty-state">No public designs yet. Be the first to share! 🚀</div>}
        {designs && designs.map(d => {
          const cat = catMap[d.category] || { icon:'⊞', color:'#fff', name: d.category };
          return (
            <div key={d.id} className="design-card">
              <div className="design-thumb" style={{ background:`linear-gradient(135deg,var(--surface2),${cat.color}22)` }}>
                {d.thumbnail ? <img src={d.thumbnail} alt={d.name}/> : <span>{cat.icon}</span>}
              </div>
              <div className="design-info">
                <div className="design-name">{d.name}</div>
                <div className="design-meta"><span>by {d.author}</span><span>♥ {d.likes}</span></div>
                <div className="cat-badge" style={{ borderColor: cat.color, color: cat.color }}>{cat.icon} {cat.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── ROOT APP COMPONENT ────────────────────────────────────────

function App() {
  const [view,         setView]         = useState('hero');     // hero | categories | editor | gallery
  const [editorCat,    setEditorCat]    = useState(null);
  const [designCount,  setDesignCount]  = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/designs');
      const d   = await res.json();
      setDesignCount(d.length);
    } catch { /* offline / no backend — show 0 */ }
  }, []);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  const openEditor = useCallback((cat) => {
    setEditorCat(cat);
    setView('editor');
  }, []);

  return (
    <div className="app">
      <Navbar onNav={setView} onNewDesign={openEditor}/>

      {view === 'hero'       && <HeroView       onNav={setView} onNewDesign={openEditor} designCount={designCount}/>}
      {view === 'categories' && <CategoriesView onNewDesign={openEditor}/>}
      {view === 'gallery'    && <GalleryView/>}
      {view === 'editor'     && (
        <EditorView
          category={editorCat}
          onBack={() => setView('categories')}
          onSaveSuccess={fetchCount}
        />
      )}
    </div>
  );
}

// Export for main.jsx
// (In a Vite/bundler project this would be: export default App)
// In the CDN build, App is already a global — no export needed.
