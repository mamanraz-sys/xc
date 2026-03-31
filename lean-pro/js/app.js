/**
 * Main Application State and Logic
 */

const Tool = {
  SELECT: 'select',
  ADD_NODE: 'add_node',
  ADD_ELEMENT: 'add_element',
  ADD_SUPPORT: 'add_support',
  ADD_LOAD: 'add_load',
  ADD_DIST_LOAD: 'add_dist_load',
};

let state = {
  nodes: [],
  elements: [],
  loads: [],
  results: null,
  nextNodeId: 1,
  nextElemId: 1,
  nextLoadId: 1,

  activeTool: Tool.SELECT,
  selectedNode: null,
  selectedElement: null,
  hoveredNode: null,
  hoveredElement: null,

  // Element creation state
  pendingNodeI: null,

  // Support settings
  supportType: SupportType.PIN,
  springKx: 1000,
  springKy: 1000,
  springKm: 0,

  // Load settings
  loadType: LoadType.POINT_FORCE_Y,
  loadValue: -10,
  loadPosition: 0.5,
  distW1: -10,
  distW2: -10,

  // Section properties
  defaultE: 30000,  // MPa -> kN/m² with appropriate units
  defaultA: 0.04,   // m²
  defaultI: 0.0003, // m⁴

  // View
  showType: 'none', // 'none','bmd','sfd','deflection'
  resultScale: 1.0,

  snapToGrid: true,
  gridSize: 1.0,
};

let renderer;

// ---- Snap ----
function snapCoord(v) {
  if (!state.snapToGrid) return v;
  return Math.round(v / state.gridSize) * state.gridSize;
}

function worldCoords(e) {
  const rect = e.target.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  return {
    x: snapCoord(renderer.sw(sx)),
    y: snapCoord(renderer.sh(sy)),
    sx, sy
  };
}

function findNodeAt(x, y, radius = 0.3) {
  return state.nodes.find(n => Math.hypot(n.x - x, n.y - y) < radius);
}

function findElementNear(x, y, radius = 0.25) {
  for (const el of state.elements) {
    const ni = state.nodes.find(n => n.id === el.nodeI);
    const nj = state.nodes.find(n => n.id === el.nodeJ);
    if (!ni || !nj) continue;
    const dist = pointToSegmentDist(x, y, ni.x, ni.y, nj.x, nj.y);
    if (dist < radius) return el;
  }
  return null;
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// ---- Canvas Events ----
function onMouseMove(e) {
  const { x, y } = worldCoords(e);
  state.hoveredNode = findNodeAt(x, y)?.id ?? null;
  state.hoveredElement = state.hoveredNode == null ? (findElementNear(x, y)?.id ?? null) : null;
  render();
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  const { x, y, sx, sy } = worldCoords(e);

  switch (state.activeTool) {
    case Tool.ADD_NODE: {
      const existing = findNodeAt(x, y);
      if (!existing) {
        state.nodes.push({ id: state.nextNodeId++, x, y, support: { type: SupportType.FREE } });
        showStatus(`נוסף קשר n${state.nextNodeId - 1} ב-(${x}, ${y})`);
      }
      break;
    }

    case Tool.ADD_ELEMENT: {
      const node = findNodeAt(x, y);
      if (!node) {
        showStatus('לחץ על קשר קיים כדי להתחיל אלמנט');
        break;
      }
      if (state.pendingNodeI == null) {
        state.pendingNodeI = node.id;
        showStatus(`קשר התחלה: n${node.id} – בחר קשר סיום`);
      } else if (state.pendingNodeI !== node.id) {
        const ni = state.pendingNodeI;
        const nj = node.id;
        const exists = state.elements.find(el => (el.nodeI === ni && el.nodeJ === nj) || (el.nodeI === nj && el.nodeJ === ni));
        if (!exists) {
          state.elements.push({
            id: state.nextElemId++,
            nodeI: ni, nodeJ: nj,
            E: state.defaultE,
            A: state.defaultA,
            I: state.defaultI,
            hingeI: false, hingeJ: false,
          });
          showStatus(`נוסף אלמנט e${state.nextElemId - 1}`);
        }
        state.pendingNodeI = null;
      }
      break;
    }

    case Tool.ADD_SUPPORT: {
      const node = findNodeAt(x, y);
      if (node) {
        node.support = buildSupport();
        showStatus(`נוסף תמיכה '${getSupportLabel(state.supportType)}' לקשר n${node.id}`);
      }
      break;
    }

    case Tool.ADD_LOAD: {
      const node = findNodeAt(x, y);
      if (node) {
        state.loads.push({
          id: state.nextLoadId++,
          type: state.loadType,
          nodeId: node.id,
          value: state.loadValue,
        });
        showStatus(`נוסף עומס על קשר n${node.id}`);
      } else {
        const el = findElementNear(x, y);
        if (el) {
          const ni = state.nodes.find(n => n.id === el.nodeI);
          const nj = state.nodes.find(n => n.id === el.nodeJ);
          const dx = nj.x - ni.x, dy = nj.y - ni.y;
          const len = Math.hypot(dx, dy);
          const tx = (x - ni.x) * dx / (len * len) + (y - ni.y) * dy / (len * len);
          state.loads.push({
            id: state.nextLoadId++,
            type: state.loadType,
            elementId: el.id,
            value: state.loadValue,
            position: Math.max(0, Math.min(1, tx)),
          });
          showStatus(`נוסף עומס על אלמנט e${el.id}`);
        }
      }
      break;
    }

    case Tool.ADD_DIST_LOAD: {
      const el = findElementNear(x, y);
      if (el) {
        const loadType = state.distW1 === state.distW2 ? LoadType.DIST_UNIFORM : LoadType.DIST_TRAPEZOIDAL;
        state.loads.push({
          id: state.nextLoadId++,
          type: loadType,
          elementId: el.id,
          w1: state.distW1,
          w2: state.distW2,
        });
        showStatus(`נוסף עומס מפורש על אלמנט e${el.id}`);
      }
      break;
    }

    case Tool.SELECT: {
      const node = findNodeAt(x, y);
      if (node) {
        state.selectedNode = node.id;
        state.selectedElement = null;
        showNodePanel(node);
      } else {
        const el = findElementNear(x, y);
        if (el) {
          state.selectedElement = el.id;
          state.selectedNode = null;
          showElementPanel(el);
        } else {
          state.selectedNode = null;
          state.selectedElement = null;
          hidePanel();
        }
      }
      break;
    }
  }

  render();
}

// Pan & Zoom
let panning = false, panStart = { x: 0, y: 0 };

function onMiddleDown(e) {
  if (e.button === 1) { panning = true; panStart = { x: e.clientX, y: e.clientY }; e.preventDefault(); }
}
function onMouseUp(e) { if (e.button === 1) panning = false; }
function onPanMove(e) {
  if (panning) {
    renderer.pan(e.clientX - panStart.x, e.clientY - panStart.y);
    panStart = { x: e.clientX, y: e.clientY };
    render();
  }
}
function onWheel(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  renderer.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  render();
}

// ---- Render ----
function render() {
  renderer.drawAll(state);
}

// ---- Analysis ----
function runAnalysis() {
  if (state.nodes.length === 0 || state.elements.length === 0) {
    showStatus('הוסף קשרים ואלמנטים לפני ניתוח');
    return;
  }
  try {
    state.results = analyze(state.nodes, state.elements, state.loads);
    updateResultsTable();
    showStatus('ניתוח הושלם בהצלחה');
    if (state.showType === 'none') state.showType = 'bmd';
    document.querySelectorAll('.result-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.show === state.showType);
    });
    render();
  } catch (err) {
    showStatus('שגיאה בניתוח: ' + err.message);
    console.error(err);
  }
}

function updateResultsTable() {
  const res = state.results;
  if (!res) return;
  const tbody = document.getElementById('results-tbody');
  tbody.innerHTML = '';

  state.nodes.forEach((node, i) => {
    const base = i * 3;
    const u  = res.displacements[base]     * 1000; // mm
    const v  = res.displacements[base + 1] * 1000;
    const th = res.displacements[base + 2] * (180 / Math.PI); // degrees
    const Rx = res.reactions[base];
    const Ry = res.reactions[base + 1];
    const Rm = res.reactions[base + 2];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>n${node.id}</td>
      <td>${u.toFixed(3)}</td>
      <td>${v.toFixed(3)}</td>
      <td>${th.toFixed(4)}</td>
      <td>${Math.abs(Rx) > 1e-6 ? Rx.toFixed(3) : '—'}</td>
      <td>${Math.abs(Ry) > 1e-6 ? (-Ry).toFixed(3) : '—'}</td>
      <td>${Math.abs(Rm) > 1e-6 ? Rm.toFixed(3) : '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- UI Helpers ----
function buildSupport() {
  const s = { type: state.supportType };
  if (state.supportType === SupportType.SPRING) {
    s.kx = state.springKx;
    s.ky = state.springKy;
    s.km = state.springKm;
  }
  return s;
}

function getSupportLabel(type) {
  const labels = {
    [SupportType.FREE]:     'חופשי',
    [SupportType.PIN]:      'סמך (פין)',
    [SupportType.ROLLER]:   'סמך נייד (גלגל)',
    [SupportType.SLIDER]:   'Slide (אנכי)',
    [SupportType.FIXED]:    'איטום (חיבור קשיח)',
    [SupportType.GUIDED_Y]: 'איטום נייד אופקי',
    [SupportType.GUIDED_X]: 'איטום נייד אנכי',
    [SupportType.SPRING]:   'סמך קפיץ',
  };
  return labels[type] || type;
}

function setTool(tool) {
  state.activeTool = tool;
  state.pendingNodeI = null;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-tool="${tool}"]`);
  if (btn) btn.classList.add('active');
  updateToolOptions();
  showStatus(getToolHint(tool));
}

function getToolHint(tool) {
  switch (tool) {
    case Tool.SELECT:       return 'לחץ על קשר או אלמנט לבחירה';
    case Tool.ADD_NODE:     return 'לחץ על הבד להוספת קשר';
    case Tool.ADD_ELEMENT:  return 'לחץ על קשר ראשון, אחר כך שני';
    case Tool.ADD_SUPPORT:  return 'לחץ על קשר להוספת תמיכה';
    case Tool.ADD_LOAD:     return 'לחץ על קשר או אלמנט להוספת עומס ריכוזי';
    case Tool.ADD_DIST_LOAD:return 'לחץ על אלמנט להוספת עומס מפורש';
  }
}

function updateToolOptions() {
  document.getElementById('support-options').style.display  = state.activeTool === Tool.ADD_SUPPORT   ? '' : 'none';
  document.getElementById('load-options').style.display     = state.activeTool === Tool.ADD_LOAD      ? '' : 'none';
  document.getElementById('dist-load-options').style.display= state.activeTool === Tool.ADD_DIST_LOAD ? '' : 'none';
}

function showStatus(msg) {
  document.getElementById('status-bar').textContent = msg;
}

function showNodePanel(node) {
  const p = document.getElementById('properties-panel');
  p.style.display = '';
  p.innerHTML = `
    <h3>קשר n${node.id}</h3>
    <label>X: <input type="number" step="0.5" value="${node.x}" onchange="updateNodeX(${node.id}, this.value)"></label>
    <label>Y: <input type="number" step="0.5" value="${node.y}" onchange="updateNodeY(${node.id}, this.value)"></label>
    <label>תמיכה: <select onchange="updateNodeSupport(${node.id}, this.value)">
      ${Object.values(SupportType).map(t => `<option value="${t}" ${node.support?.type === t ? 'selected' : ''}>${getSupportLabel(t)}</option>`).join('')}
    </select></label>
    <button class="btn-danger" onclick="deleteNode(${node.id})">מחק קשר</button>
  `;
}

function showElementPanel(el) {
  const p = document.getElementById('properties-panel');
  p.style.display = '';
  p.innerHTML = `
    <h3>אלמנט e${el.id}</h3>
    <label>E (kN/m²): <input type="number" value="${el.E}" onchange="updateElemProp(${el.id}, 'E', this.value)"></label>
    <label>A (m²): <input type="number" step="0.001" value="${el.A}" onchange="updateElemProp(${el.id}, 'A', this.value)"></label>
    <label>I (m⁴): <input type="number" step="0.0001" value="${el.I}" onchange="updateElemProp(${el.id}, 'I', this.value)"></label>
    <label><input type="checkbox" ${el.hingeI ? 'checked' : ''} onchange="updateElemProp(${el.id}, 'hingeI', this.checked)"> פרק בקצה I</label>
    <label><input type="checkbox" ${el.hingeJ ? 'checked' : ''} onchange="updateElemProp(${el.id}, 'hingeJ', this.checked)"> פרק בקצה J</label>
    <button class="btn-danger" onclick="deleteElement(${el.id})">מחק אלמנט</button>
  `;
}

function hidePanel() {
  document.getElementById('properties-panel').style.display = 'none';
}

// ---- State mutations ----
function updateNodeX(id, v)   { const n = state.nodes.find(n => n.id === id); if (n) { n.x = parseFloat(v); state.results = null; render(); } }
function updateNodeY(id, v)   { const n = state.nodes.find(n => n.id === id); if (n) { n.y = parseFloat(v); state.results = null; render(); } }
function updateNodeSupport(id, type) {
  const n = state.nodes.find(n => n.id === id);
  if (n) { n.support = { type }; state.results = null; render(); }
}
function updateElemProp(id, prop, val) {
  const el = state.elements.find(e => e.id === id);
  if (el) { el[prop] = (prop === 'hingeI' || prop === 'hingeJ') ? val : parseFloat(val); state.results = null; render(); }
}
function deleteNode(id) {
  state.nodes = state.nodes.filter(n => n.id !== id);
  state.elements = state.elements.filter(e => e.nodeI !== id && e.nodeJ !== id);
  state.loads = state.loads.filter(l => l.nodeId !== id);
  state.selectedNode = null;
  state.results = null;
  hidePanel();
  render();
}
function deleteElement(id) {
  state.elements = state.elements.filter(e => e.id !== id);
  state.loads = state.loads.filter(l => l.elementId !== id);
  state.selectedElement = null;
  state.results = null;
  hidePanel();
  render();
}
function deleteSelectedLoad(id) {
  state.loads = state.loads.filter(l => l.id !== id);
  state.results = null;
  updateLoadsList();
  render();
}

function updateLoadsList() {
  const list = document.getElementById('loads-list');
  if (!list) return;
  list.innerHTML = state.loads.map(ld => {
    const label = ld.nodeId != null
      ? `n${ld.nodeId}`
      : `e${ld.elementId}`;
    return `<div class="load-item">
      <span>${getLoadLabel(ld.type)} @ ${label}</span>
      <button onclick="deleteSelectedLoad(${ld.id})">×</button>
    </div>`;
  }).join('');
}

function getLoadLabel(type) {
  const labels = {
    [LoadType.POINT_FORCE_Y]: 'כוח אנכי',
    [LoadType.POINT_FORCE_X]: 'כוח אופקי',
    [LoadType.POINT_MOMENT]:  'מומנט',
    [LoadType.DIST_UNIFORM]:  'עומס אחיד',
    [LoadType.DIST_TRAPEZOIDAL]: 'עומס טרפזי',
  };
  return labels[type] || type;
}

// ---- Preset structures ----
function loadPreset(name) {
  clearAll();
  switch (name) {
    case 'simple_beam': {
      state.nodes = [
        { id: 1, x: 0, y: 0, support: { type: SupportType.PIN } },
        { id: 2, x: 6, y: 0, support: { type: SupportType.ROLLER } },
      ];
      state.elements = [{ id: 1, nodeI: 1, nodeJ: 2, E: 30000, A: 0.04, I: 0.0003, hingeI: false, hingeJ: false }];
      state.loads = [{ id: 1, type: LoadType.DIST_UNIFORM, elementId: 1, w1: -10, w2: -10 }];
      state.nextNodeId = 3; state.nextElemId = 2; state.nextLoadId = 2;
      break;
    }
    case 'cantilever': {
      state.nodes = [
        { id: 1, x: 0, y: 0, support: { type: SupportType.FIXED } },
        { id: 2, x: 5, y: 0, support: { type: SupportType.FREE } },
      ];
      state.elements = [{ id: 1, nodeI: 1, nodeJ: 2, E: 30000, A: 0.04, I: 0.0003, hingeI: false, hingeJ: false }];
      state.loads = [{ id: 1, type: LoadType.POINT_FORCE_Y, nodeId: 2, value: -20 }];
      state.nextNodeId = 3; state.nextElemId = 2; state.nextLoadId = 2;
      break;
    }
    case 'continuous_beam': {
      state.nodes = [
        { id: 1, x: 0, y: 0, support: { type: SupportType.PIN } },
        { id: 2, x: 5, y: 0, support: { type: SupportType.ROLLER } },
        { id: 3, x: 10, y: 0, support: { type: SupportType.ROLLER } },
        { id: 4, x: 15, y: 0, support: { type: SupportType.ROLLER } },
      ];
      state.elements = [
        { id: 1, nodeI: 1, nodeJ: 2, E: 30000, A: 0.04, I: 0.0003, hingeI: false, hingeJ: false },
        { id: 2, nodeI: 2, nodeJ: 3, E: 30000, A: 0.04, I: 0.0003, hingeI: false, hingeJ: false },
        { id: 3, nodeI: 3, nodeJ: 4, E: 30000, A: 0.04, I: 0.0003, hingeI: false, hingeJ: false },
      ];
      state.loads = [
        { id: 1, type: LoadType.DIST_UNIFORM, elementId: 1, w1: -10, w2: -10 },
        { id: 2, type: LoadType.DIST_UNIFORM, elementId: 2, w1: -10, w2: -10 },
        { id: 3, type: LoadType.DIST_UNIFORM, elementId: 3, w1: -10, w2: -10 },
      ];
      state.nextNodeId = 5; state.nextElemId = 4; state.nextLoadId = 4;
      break;
    }
    case 'portal_frame': {
      state.nodes = [
        { id: 1, x: 0, y: 0, support: { type: SupportType.FIXED } },
        { id: 2, x: 0, y: 4, support: { type: SupportType.FREE } },
        { id: 3, x: 6, y: 4, support: { type: SupportType.FREE } },
        { id: 4, x: 6, y: 0, support: { type: SupportType.FIXED } },
      ];
      state.elements = [
        { id: 1, nodeI: 1, nodeJ: 2, E: 210000000, A: 0.01, I: 0.00008, hingeI: false, hingeJ: false },
        { id: 2, nodeI: 2, nodeJ: 3, E: 210000000, A: 0.01, I: 0.00008, hingeI: false, hingeJ: false },
        { id: 3, nodeI: 3, nodeJ: 4, E: 210000000, A: 0.01, I: 0.00008, hingeI: false, hingeJ: false },
      ];
      state.loads = [
        { id: 1, type: LoadType.DIST_UNIFORM, elementId: 2, w1: -15, w2: -15 },
        { id: 2, type: LoadType.POINT_FORCE_X, nodeId: 2, value: 10 },
      ];
      state.nextNodeId = 5; state.nextElemId = 4; state.nextLoadId = 3;
      break;
    }
  }
  state.results = null;
  renderer.fitView(state.nodes);
  updateLoadsList();
  render();
  showStatus(`נטען תצורה: ${name}`);
}

function clearAll() {
  state.nodes = [];
  state.elements = [];
  state.loads = [];
  state.results = null;
  state.selectedNode = null;
  state.selectedElement = null;
  state.nextNodeId = 1;
  state.nextElemId = 1;
  state.nextLoadId = 1;
  hidePanel();
  updateLoadsList();
  render();
}

// ---- Export ----
function exportModel() {
  const data = JSON.stringify({ nodes: state.nodes, elements: state.elements, loads: state.loads }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'model.json';
  a.click();
}

function importModel(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      clearAll();
      state.nodes = data.nodes || [];
      state.elements = data.elements || [];
      state.loads = data.loads || [];
      state.nextNodeId = Math.max(0, ...state.nodes.map(n => n.id)) + 1;
      state.nextElemId = Math.max(0, ...state.elements.map(e => e.id)) + 1;
      state.nextLoadId = Math.max(0, ...state.loads.map(l => l.id)) + 1;
      renderer.fitView(state.nodes);
      updateLoadsList();
      render();
      showStatus('המודל נטען בהצלחה');
    } catch (err) {
      showStatus('שגיאה בטעינת קובץ: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ---- Init ----
window.addEventListener('load', () => {
  const canvas = document.getElementById('main-canvas');
  renderer = new Renderer(canvas);

  function resizeCanvas() {
    renderer.resize();
    render();
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousemove', e => { onMouseMove(e); onPanMove(e); });
  canvas.addEventListener('mousedown', e => { onMouseDown(e); onMiddleDown(e); });
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // Toolbar buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
  });

  // Result tabs
  document.querySelectorAll('.result-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.showType = tab.dataset.show;
      document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render();
    });
  });

  // Support type selector
  const supportSelect = document.getElementById('support-type-select');
  if (supportSelect) {
    supportSelect.addEventListener('change', () => {
      state.supportType = supportSelect.value;
    });
  }

  // Load inputs
  document.getElementById('load-type-select')?.addEventListener('change', e => { state.loadType = e.target.value; });
  document.getElementById('load-value-input')?.addEventListener('input',  e => { state.loadValue = parseFloat(e.target.value); });
  document.getElementById('load-pos-input')?.addEventListener('input',    e => { state.loadPosition = parseFloat(e.target.value); });
  document.getElementById('dist-w1-input')?.addEventListener('input',     e => { state.distW1 = parseFloat(e.target.value); });
  document.getElementById('dist-w2-input')?.addEventListener('input',     e => { state.distW2 = parseFloat(e.target.value); });

  // Section defaults
  document.getElementById('def-E')?.addEventListener('input', e => { state.defaultE = parseFloat(e.target.value); });
  document.getElementById('def-A')?.addEventListener('input', e => { state.defaultA = parseFloat(e.target.value); });
  document.getElementById('def-I')?.addEventListener('input', e => { state.defaultI = parseFloat(e.target.value); });

  // Snap
  document.getElementById('snap-toggle')?.addEventListener('change', e => { state.snapToGrid = e.target.checked; });

  // Analyze
  document.getElementById('analyze-btn')?.addEventListener('click', runAnalysis);

  // Clear
  document.getElementById('clear-btn')?.addEventListener('click', () => { if (confirm('מחק את כל המודל?')) clearAll(); });

  // Result scale
  document.getElementById('result-scale')?.addEventListener('input', e => {
    state.resultScale = parseFloat(e.target.value);
    document.getElementById('result-scale-val').textContent = state.resultScale.toFixed(1);
    render();
  });

  // Load preset
  loadPreset('simple_beam');

  setTool(Tool.SELECT);
});
