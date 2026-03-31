/**
 * Canvas Renderer for structural model and results
 */
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 80; // pixels per meter
    this.offsetX = 100;
    this.offsetY = 300;
    this.gridSize = 1.0; // 1 meter grid

    this.colors = {
      grid: '#e8e8e8',
      node: '#2563eb',
      nodeHover: '#f59e0b',
      element: '#1e293b',
      elementHover: '#3b82f6',
      support: '#475569',
      loadForce: '#dc2626',
      loadDist: '#ea580c',
      moment: '#7c3aed',
      sfd: '#2563eb',
      bmd: '#16a34a',
      deflection: '#dc2626',
      reaction: '#059669',
      dimensions: '#94a3b8',
      text: '#1e293b',
      background: '#f8fafc',
    };
  }

  resize() {
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  // World -> Screen
  wx(x) { return x * this.scale + this.offsetX; }
  wy(y) { return -y * this.scale + this.offsetY; }

  // Screen -> World
  sw(sx) { return (sx - this.offsetX) / this.scale; }
  sh(sy) { return -(sy - this.offsetY) / this.scale; }

  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  zoom(factor, cx, cy) {
    this.offsetX = cx + (this.offsetX - cx) * factor;
    this.offsetY = cy + (this.offsetY - cy) * factor;
    this.scale *= factor;
  }

  fitView(nodes) {
    if (!nodes || nodes.length === 0) return;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const W = this.canvas.width, H = this.canvas.height;
    const padX = 120, padY = 120;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleX = (W - 2 * padX) / rangeX;
    const scaleY = (H - 2 * padY) / rangeY;
    this.scale = Math.min(scaleX, scaleY, 200);
    this.offsetX = (W - (minX + maxX) * this.scale) / 2;
    this.offsetY = (H + (minY + maxY) * this.scale) / 2;
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;
    const W = this.canvas.width, H = this.canvas.height;
    const startX = Math.floor(this.sw(0) / this.gridSize) * this.gridSize;
    const endX   = Math.ceil(this.sw(W) / this.gridSize) * this.gridSize;
    const startY = Math.floor(this.sh(H) / this.gridSize) * this.gridSize;
    const endY   = Math.ceil(this.sh(0) / this.gridSize) * this.gridSize;

    for (let x = startX; x <= endX; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(this.wx(x), 0);
      ctx.lineTo(this.wx(x), H);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, this.wy(y));
      ctx.lineTo(W, this.wy(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, this.wy(0));
    ctx.lineTo(W, this.wy(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.wx(0), 0);
    ctx.lineTo(this.wx(0), H);
    ctx.stroke();
  }

  drawElement(el, hovered = false, selected = false) {
    const ctx = this.ctx;
    ctx.strokeStyle = selected ? '#f59e0b' : hovered ? this.colors.elementHover : this.colors.element;
    ctx.lineWidth = selected ? 4 : hovered ? 3 : 3;
    ctx.beginPath();
    ctx.moveTo(this.wx(el._ni.x), this.wy(el._ni.y));
    ctx.lineTo(this.wx(el._nj.x), this.wy(el._nj.y));
    ctx.stroke();

    // Draw hinge symbols if internal hinges
    if (el.hingeI) this._drawInternalHinge(el._ni.x, el._ni.y);
    if (el.hingeJ) this._drawInternalHinge(el._nj.x, el._nj.y);

    // Label
    const mx = (el._ni.x + el._nj.x) / 2;
    const my = (el._ni.y + el._nj.y) / 2;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    const angle = Math.atan2(el._nj.y - el._ni.y, el._nj.x - el._ni.x);
    ctx.save();
    ctx.translate(this.wx(mx), this.wy(my));
    ctx.rotate(-angle);
    ctx.fillText(`e${el.id}`, 0, -8);
    ctx.restore();
  }

  _drawInternalHinge(wx, wy) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(this.wx(wx), this.wy(wy), 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawNode(node, hovered = false, selected = false) {
    const ctx = this.ctx;
    const x = this.wx(node.x), y = this.wy(node.y);
    const r = hovered ? 7 : 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = selected ? '#f59e0b' : hovered ? this.colors.nodeHover : this.colors.node;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Node label
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`n${node.id}`, x + 8, y - 6);
  }

  drawSupport(node) {
    if (!node.support || node.support.type === SupportType.FREE) return;
    const ctx = this.ctx;
    const x = this.wx(node.x), y = this.wy(node.y);
    const sz = 18;
    ctx.strokeStyle = this.colors.support;
    ctx.fillStyle = this.colors.support;
    ctx.lineWidth = 2;

    switch (node.support.type) {
      case SupportType.PIN:
        this._drawPin(x, y, sz);
        break;
      case SupportType.ROLLER:
        this._drawRoller(x, y, sz, 'down');
        break;
      case SupportType.SLIDER:
        this._drawRoller(x, y, sz, 'right');
        break;
      case SupportType.FIXED:
        this._drawFixed(x, y, sz);
        break;
      case SupportType.GUIDED_Y:
        this._drawGuided(x, y, sz, 'horizontal');
        break;
      case SupportType.GUIDED_X:
        this._drawGuided(x, y, sz, 'vertical');
        break;
      case SupportType.SPRING:
        this._drawSpring(x, y, sz);
        break;
    }
  }

  _drawPin(x, y, sz) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - sz, y + sz * 1.2);
    ctx.lineTo(x + sz, y + sz * 1.2);
    ctx.closePath();
    ctx.stroke();
    this._drawHatchLine(x - sz - 4, y + sz * 1.2, x + sz + 4, y + sz * 1.2);
  }

  _drawRoller(x, y, sz, dir) {
    const ctx = this.ctx;
    if (dir === 'down') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - sz, y + sz * 1.2);
      ctx.lineTo(x + sz, y + sz * 1.2);
      ctx.closePath();
      ctx.stroke();
      const r = 5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(x + i * sz * 0.7, y + sz * 1.2 + r, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      this._drawHatchLine(x - sz - 4, y + sz * 1.2 + r * 2 + 2, x + sz + 4, y + sz * 1.2 + r * 2 + 2);
    } else {
      // Horizontal roller (slider)
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - sz * 1.2, y - sz);
      ctx.lineTo(x - sz * 1.2, y + sz);
      ctx.closePath();
      ctx.stroke();
      const r = 5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(x - sz * 1.2 - r, y + i * sz * 0.7, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  _drawFixed(x, y, sz) {
    const ctx = this.ctx;
    ctx.fillRect(x - sz, y, sz * 2, 6);
    this._drawHatchLine(x - sz, y + 6, x + sz, y + 6, true);
  }

  _drawGuided(x, y, sz, dir) {
    const ctx = this.ctx;
    if (dir === 'horizontal') {
      // Prevents rotation + horizontal movement
      ctx.fillRect(x - sz, y - 3, sz * 2, 6);
      ctx.beginPath();
      ctx.moveTo(x - sz - 4, y - sz);
      ctx.lineTo(x - sz - 4, y + sz);
      ctx.stroke();
      this._drawHatchLine(x - sz - 10, y - sz, x - sz - 10, y + sz, false, true);
    } else {
      ctx.fillRect(x - 3, y, 6, sz * 2);
      ctx.beginPath();
      ctx.moveTo(x - sz, y + sz + 4);
      ctx.lineTo(x + sz, y + sz + 4);
      ctx.stroke();
      this._drawHatchLine(x - sz, y + sz + 10, x + sz, y + sz + 10);
    }
  }

  _drawSpring(x, y, sz) {
    const ctx = this.ctx;
    const nCoils = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i <= nCoils * 2; i++) {
      const yy = y + (i / (nCoils * 2)) * sz * 1.5;
      const xx = x + (i % 2 === 0 ? 0 : (i % 4 < 2 ? 8 : -8));
      ctx.lineTo(xx, yy);
    }
    ctx.lineTo(x, y + sz * 1.5 + 6);
    ctx.stroke();
    this._drawHatchLine(x - sz * 0.8, y + sz * 1.5 + 6, x + sz * 0.8, y + sz * 1.5 + 6);
  }

  _drawHatchLine(x1, y1, x2, y2, vertical = false, horiz = false) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const spacing = 8;
    const len = 8;
    if (!vertical && !horiz) {
      const n = Math.floor((x2 - x1) / spacing);
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(x1 + i * spacing, y1);
        ctx.lineTo(x1 + i * spacing - len, y1 + len);
        ctx.stroke();
      }
    }
  }

  drawPointLoad(load, nodes, elements) {
    const ctx = this.ctx;
    let x, y;
    if (load.nodeId != null) {
      const n = nodes.find(n => n.id === load.nodeId);
      if (!n) return;
      x = n.x; y = n.y;
    } else {
      const el = elements.find(e => e.id === load.elementId);
      if (!el) return;
      const ni = nodes.find(n => n.id === el.nodeI);
      const nj = nodes.find(n => n.id === el.nodeJ);
      x = ni.x + (nj.x - ni.x) * (load.position || 0.5);
      y = ni.y + (nj.y - ni.y) * (load.position || 0.5);
    }
    const sx = this.wx(x), sy = this.wy(y);
    const arrowLen = 40;

    ctx.strokeStyle = this.colors.loadForce;
    ctx.fillStyle = this.colors.loadForce;
    ctx.lineWidth = 2.5;

    if (load.type === LoadType.POINT_FORCE_Y) {
      const dir = load.value > 0 ? 1 : -1; // positive = upward in math coords
      ctx.beginPath();
      ctx.moveTo(sx, sy - dir * arrowLen);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      this._arrowHead(sx, sy, 0, dir > 0 ? -1 : 1);
      ctx.fillStyle = this.colors.loadForce;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(load.value)} kN`, sx, sy - dir * arrowLen - 6);
    } else if (load.type === LoadType.POINT_FORCE_X) {
      const dir = load.value > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(sx - dir * arrowLen, sy);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      this._arrowHead(sx, sy, dir > 0 ? -1 : 1, 0);
      ctx.fillStyle = this.colors.loadForce;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(load.value)} kN`, sx - dir * arrowLen, sy - 12);
    } else if (load.type === LoadType.POINT_MOMENT) {
      const r = 18;
      ctx.beginPath();
      const startAngle = load.value > 0 ? 0.3 : Math.PI + 0.3;
      ctx.arc(sx, sy, r, startAngle, startAngle + (load.value > 0 ? 1 : -1) * 1.5 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = this.colors.moment;
      ctx.strokeStyle = this.colors.moment;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(load.value)} kNm`, sx + r + 20, sy);
    }
  }

  drawDistLoad(load, nodes, elements) {
    const ctx = this.ctx;
    const el = elements.find(e => e.id === load.elementId);
    if (!el) return;
    const ni = nodes.find(n => n.id === el.nodeI);
    const nj = nodes.find(n => n.id === el.nodeJ);
    if (!ni || !nj) return;

    const nArrows = 7;
    const w1 = load.w1 !== undefined ? load.w1 : load.value;
    const w2 = load.w2 !== undefined ? load.w2 : load.value;
    const maxArrow = 40;
    const maxW = Math.max(Math.abs(w1), Math.abs(w2)) || 1;

    ctx.strokeStyle = this.colors.loadDist;
    ctx.fillStyle = this.colors.loadDist;
    ctx.lineWidth = 2;

    const topPts = [];
    for (let k = 0; k <= nArrows; k++) {
      const t = k / nArrows;
      const w = w1 + (w2 - w1) * t;
      const arrowH = (w / maxW) * maxArrow;
      const x = ni.x + (nj.x - ni.x) * t;
      const y = ni.y + (nj.y - ni.y) * t;
      const sx = this.wx(x), sy = this.wy(y);
      topPts.push([sx, sy - arrowH]);

      if (k < nArrows || k === nArrows) {
        ctx.beginPath();
        ctx.moveTo(sx, sy - arrowH);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        if (Math.abs(arrowH) > 8) this._arrowHead(sx, sy, 0, arrowH > 0 ? 1 : -1);
      }
    }

    // Top line connecting arrow tips
    ctx.beginPath();
    ctx.moveTo(topPts[0][0], topPts[0][1]);
    for (const p of topPts) ctx.lineTo(p[0], p[1]);
    ctx.stroke();

    // Labels
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (w1 !== 0) ctx.fillText(`${w1}`, topPts[0][0], topPts[0][1] - 6);
    if (w2 !== w1) ctx.fillText(`${w2}`, topPts[topPts.length - 1][0], topPts[topPts.length - 1][1] - 6);
    else ctx.fillText(`${w1} kN/m`, topPts[Math.floor(nArrows / 2)][0], topPts[Math.floor(nArrows / 2)][1] - 6);
  }

  _arrowHead(x, y, dx, dy) {
    const ctx = this.ctx;
    const len = 10, wid = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * dy - wid * dx, y + len * dx - wid * dy);
    ctx.lineTo(x - len * dy + wid * dx, y + len * dx + wid * dy);
    ctx.closePath();
    ctx.fill();
  }

  drawResults(results, nodes, elements, showType = 'bmd', scale = 1.0) {
    if (!results) return;
    const ctx = this.ctx;

    results.elements.forEach(er => {
      const ni = nodes.find(n => n.id === er.nodeI);
      const nj = nodes.find(n => n.id === er.nodeJ);
      if (!ni || !nj) return;

      const pts = er.points;
      let color, getValue;
      switch (showType) {
        case 'sfd': color = this.colors.sfd; getValue = p => p.V; break;
        case 'bmd': color = this.colors.bmd; getValue = p => p.M; break;
        case 'deflection': color = this.colors.deflection; getValue = p => p.v || 0; break;
        default: return;
      }

      const maxVal = Math.max(...pts.map(p => Math.abs(getValue(p))));
      if (maxVal < 1e-10) return;
      const drawScale = scale * 60 / maxVal; // 60px max height

      const angle = er.angle;
      const nx = -Math.sin(angle); // normal direction
      const ny =  Math.cos(angle);

      ctx.strokeStyle = color;
      ctx.fillStyle = color + '33';
      ctx.lineWidth = 2;

      ctx.beginPath();
      pts.forEach((p, k) => {
        const t = p.xi;
        const wx = ni.x + (nj.x - ni.x) * t;
        const wy_ = ni.y + (nj.y - ni.y) * t;
        const val = getValue(p) * drawScale / this.scale;
        const px = wx + nx * val;
        const py = wy_ + ny * val;
        if (k === 0) ctx.moveTo(this.wx(px), this.wy(py));
        else ctx.lineTo(this.wx(px), this.wy(py));
      });
      ctx.stroke();

      // Fill
      ctx.beginPath();
      pts.forEach((p, k) => {
        const t = p.xi;
        const wx = ni.x + (nj.x - ni.x) * t;
        const wy_ = ni.y + (nj.y - ni.y) * t;
        const val = getValue(p) * drawScale / this.scale;
        const px = wx + nx * val;
        const py = wy_ + ny * val;
        if (k === 0) ctx.moveTo(this.wx(px), this.wy(py));
        else ctx.lineTo(this.wx(px), this.wy(py));
      });
      // Close path along element
      for (let k = pts.length - 1; k >= 0; k--) {
        const t = pts[k].xi;
        const wx = ni.x + (nj.x - ni.x) * t;
        const wy_ = ni.y + (nj.y - ni.y) * t;
        ctx.lineTo(this.wx(wx), this.wy(wy_));
      }
      ctx.closePath();
      ctx.fill();
    });

    // Draw reactions
    this.drawReactions(results, nodes);
  }

  drawReactions(results, nodes) {
    const ctx = this.ctx;
    nodes.forEach((node, i) => {
      if (!node.support || node.support.type === SupportType.FREE) return;
      const base = i * 3;
      const Rx = results.reactions[base];
      const Ry = results.reactions[base + 1];
      const Rm = results.reactions[base + 2];
      const x = this.wx(node.x), y = this.wy(node.y);
      ctx.strokeStyle = this.colors.reaction;
      ctx.fillStyle = this.colors.reaction;
      ctx.lineWidth = 2;
      ctx.font = '11px Inter, sans-serif';

      if (Math.abs(Rx) > 1e-6) {
        const dir = Rx > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x + dir * 50, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        this._arrowHead(x, y, -dir, 0);
        ctx.fillText(`${Rx.toFixed(2)} kN`, x + dir * 55, y + 4);
      }
      if (Math.abs(Ry) > 1e-6) {
        const dir = Ry > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y + dir * 50);
        ctx.lineTo(x, y);
        ctx.stroke();
        this._arrowHead(x, y, 0, dir);
        ctx.fillText(`${(-Ry).toFixed(2)} kN`, x + 6, y + dir * 55);
      }
      if (Math.abs(Rm) > 1e-6) {
        ctx.fillStyle = this.colors.moment;
        ctx.fillText(`M=${Rm.toFixed(2)} kNm`, x + 20, y - 20);
      }
    });
  }

  drawAll(state) {
    this.clear();
    this.drawGrid();

    const { nodes, elements, loads, results, showType, resultScale, hoveredNode, hoveredElement, selectedNode, selectedElement } = state;

    // Draw results underneath
    if (results && showType !== 'none') {
      this.drawResults(results, nodes, elements, showType, resultScale || 1.0);
    }

    // Draw elements
    elements.forEach(el => {
      el._ni = nodes.find(n => n.id === el.nodeI);
      el._nj = nodes.find(n => n.id === el.nodeJ);
      if (el._ni && el._nj) {
        this.drawElement(el, el.id === hoveredElement, el.id === selectedElement);
      }
    });

    // Draw supports
    nodes.forEach(n => this.drawSupport(n));

    // Draw loads
    loads.forEach(ld => {
      if (ld.type === LoadType.DIST_UNIFORM || ld.type === LoadType.DIST_TRAPEZOIDAL) {
        this.drawDistLoad(ld, nodes, elements);
      } else {
        this.drawPointLoad(ld, nodes, elements);
      }
    });

    // Draw nodes (on top)
    nodes.forEach(n => this.drawNode(n, n.id === hoveredNode, n.id === selectedNode));
  }
}
