/**
 * Structural Analysis Engine - Direct Stiffness Method (2D Frame)
 * DOFs per node: [u (horiz), v (vert), θ (rotation)]
 */

// Support types
const SupportType = {
  FREE: 'free',
  PIN: 'pin',           // סמך - fixed x,y; free rotation
  ROLLER: 'roller',     // סמך נייד - fixed y; free x, rotation
  SLIDER: 'slider',     // Slide - fixed x; free y, rotation
  FIXED: 'fixed',       // איטום - fixed x,y,rotation
  GUIDED_Y: 'guided_y', // איטום נייד (vertical) - fixed rotation+x, free y
  GUIDED_X: 'guided_x', // איטום נייד (horizontal) - fixed rotation+y, free x
  SPRING: 'spring',     // סמך קפיץ - elastic spring
};

// Load types
const LoadType = {
  POINT_FORCE_Y: 'point_fy',
  POINT_FORCE_X: 'point_fx',
  POINT_MOMENT: 'point_m',
  DIST_UNIFORM: 'dist_uniform',
  DIST_TRAPEZOIDAL: 'dist_trap',
};

/**
 * Build local stiffness matrix for 2D frame element (6x6)
 * Local coords: axial along element, transverse perpendicular
 */
function localStiffnessMatrix(E, A, I, L) {
  const EA_L = E * A / L;
  const EI = E * I;
  const k12 = 12 * EI / (L * L * L);
  const k6  =  6 * EI / (L * L);
  const k4  =  4 * EI / L;
  const k2  =  2 * EI / L;

  return [
    [ EA_L,  0,    0,   -EA_L,  0,    0   ],
    [ 0,     k12,  k6,   0,    -k12,  k6  ],
    [ 0,     k6,   k4,   0,    -k6,   k2  ],
    [-EA_L,  0,    0,    EA_L,  0,    0   ],
    [ 0,    -k12, -k6,   0,     k12, -k6  ],
    [ 0,     k6,   k2,   0,    -k6,   k4  ],
  ];
}

/**
 * Transformation matrix T (6x6) from local to global
 * angle: element angle from global x-axis (radians)
 */
function transformMatrix(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [ c,  s, 0,  0,  0, 0],
    [-s,  c, 0,  0,  0, 0],
    [ 0,  0, 1,  0,  0, 0],
    [ 0,  0, 0,  c,  s, 0],
    [ 0,  0, 0, -s,  c, 0],
    [ 0,  0, 0,  0,  0, 1],
  ];
}

function matMul(A, B) {
  const n = A.length, m = B[0].length, p = B.length;
  const C = Array.from({length: n}, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < p; k++)
      for (let j = 0; j < m; j++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

function matTranspose(A) {
  return A[0].map((_, j) => A.map(row => row[j]));
}

/**
 * Global stiffness matrix for element: Ke = T^T * k_local * T
 */
function elementGlobalStiffness(E, A, I, L, angle) {
  const kl = localStiffnessMatrix(E, A, I, L);
  const T  = transformMatrix(angle);
  const Tt = matTranspose(T);
  return matMul(Tt, matMul(kl, T));
}

/**
 * Fixed-end forces for distributed load on element (local coords)
 * w1: load intensity at node i (force/length, positive downward in local y)
 * w2: load intensity at node j
 * Returns [Qi, Mi, Qj, Mj] in local coords (axial ignored for transverse load)
 */
function fixedEndForcesDistributed(w1, w2, L) {
  // Trapezoidal load: split into uniform w1 and triangular (w2-w1)
  const w = w1; // uniform part
  const dw = w2 - w1; // triangular part (0 at i, dw at j)

  // Uniform part
  const Qi_u =  w * L / 2;
  const Qj_u =  w * L / 2;
  const Mi_u = -w * L * L / 12;
  const Mj_u =  w * L * L / 12;

  // Triangular part (0 at i, dw at j)
  const Qi_t =  3 * dw * L / 20;
  const Qj_t =  7 * dw * L / 20;
  const Mi_t = -dw * L * L / 30;
  const Mj_t =  dw * L * L / 20;

  return [
    Qi_u + Qi_t,
    Mi_u + Mi_t,
    Qj_u + Qj_t,
    Mj_u + Mj_t,
  ];
}

/**
 * Fixed-end forces for point load at distance a from node i (local y direction)
 */
function fixedEndForcesPoint(P, a, L) {
  const b = L - a;
  const Qi = P * b * b * (3 * a + b) / (L * L * L);
  const Qj = P * a * a * (a + 3 * b) / (L * L * L);
  const Mi = -P * a * b * b / (L * L);
  const Mj =  P * a * a * b / (L * L);
  return [Qi, Mi, Qj, Mj];
}

/**
 * Solve linear system Ax = b using Gaussian elimination with partial pivoting
 */
function solveLinear(A, b) {
  const n = b.length;
  // Augmented matrix
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    if (Math.abs(M[col][col]) < 1e-15) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
    x[i] /= M[i][i];
  }
  return x;
}

/**
 * Main analysis function
 * @param {Array} nodes   [{id, x, y, support: {type, kx, ky, km}}]
 * @param {Array} elements [{id, nodeI, nodeJ, E, A, I}]
 * @param {Array} loads    [{type, nodeId?, elementId?, ...params}]
 * @returns {Object} results
 */
function analyze(nodes, elements, loads) {
  const nNodes = nodes.length;
  const nDOF = nNodes * 3; // 3 DOFs per node: u, v, θ
  const nodeIndex = {};
  nodes.forEach((n, i) => nodeIndex[n.id] = i);

  // Initialize global stiffness matrix and force vector
  const K = Array.from({length: nDOF}, () => new Array(nDOF).fill(0));
  const F = new Array(nDOF).fill(0);

  // Element data
  const elemData = elements.map(el => {
    const ni = nodes[nodeIndex[el.nodeI]];
    const nj = nodes[nodeIndex[el.nodeJ]];
    const dx = nj.x - ni.x;
    const dy = nj.y - ni.y;
    const L = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return { ...el, ni, nj, dx, dy, L, angle };
  });

  // Assemble global stiffness matrix
  elemData.forEach(el => {
    const Ke = elementGlobalStiffness(el.E, el.A, el.I, el.L, el.angle);
    const dofs = [
      nodeIndex[el.nodeI] * 3,
      nodeIndex[el.nodeI] * 3 + 1,
      nodeIndex[el.nodeI] * 3 + 2,
      nodeIndex[el.nodeJ] * 3,
      nodeIndex[el.nodeJ] * 3 + 1,
      nodeIndex[el.nodeJ] * 3 + 2,
    ];
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 6; j++)
        K[dofs[i]][dofs[j]] += Ke[i][j];
  });

  // Apply loads
  loads.forEach(load => {
    if (load.type === LoadType.POINT_FORCE_Y && load.nodeId != null) {
      const idx = nodeIndex[load.nodeId];
      if (idx != null) F[idx * 3 + 1] += load.value;
    }
    if (load.type === LoadType.POINT_FORCE_X && load.nodeId != null) {
      const idx = nodeIndex[load.nodeId];
      if (idx != null) F[idx * 3] += load.value;
    }
    if (load.type === LoadType.POINT_MOMENT && load.nodeId != null) {
      const idx = nodeIndex[load.nodeId];
      if (idx != null) F[idx * 3 + 2] += load.value;
    }

    // Point load on element (converts to nodal loads via FEF)
    if (load.type === LoadType.POINT_FORCE_Y && load.elementId != null) {
      const el = elemData.find(e => e.id === load.elementId);
      if (!el) return;
      const a = load.position * el.L; // position as fraction [0,1]
      const [Qi, Mi, Qj, Mj] = fixedEndForcesPoint(load.value, a, el.L);
      // Transform back to global and subtract (FEF are reactions, loads are negatives)
      const c = Math.cos(el.angle), s = Math.sin(el.angle);
      const dofs = [
        nodeIndex[el.nodeI] * 3,
        nodeIndex[el.nodeI] * 3 + 1,
        nodeIndex[el.nodeI] * 3 + 2,
        nodeIndex[el.nodeJ] * 3,
        nodeIndex[el.nodeJ] * 3 + 1,
        nodeIndex[el.nodeJ] * 3 + 2,
      ];
      // Local FEF: [0, Qi, Mi, 0, Qj, Mj] -> transform to global
      const fefLocal = [0, Qi, Mi, 0, Qj, Mj];
      const T = transformMatrix(el.angle);
      const Tt = matTranspose(T);
      for (let i = 0; i < 6; i++) {
        let fGlobal = 0;
        for (let k = 0; k < 6; k++) fGlobal += Tt[i][k] * fefLocal[k];
        F[dofs[i]] += fGlobal;
      }
    }

    // Distributed load on element
    if (load.type === LoadType.DIST_UNIFORM || load.type === LoadType.DIST_TRAPEZOIDAL) {
      const el = elemData.find(e => e.id === load.elementId);
      if (!el) return;
      const w1 = load.w1 !== undefined ? load.w1 : load.value;
      const w2 = load.w2 !== undefined ? load.w2 : load.value;
      const [Qi, Mi, Qj, Mj] = fixedEndForcesDistributed(w1, w2, el.L);
      const fefLocal = [0, Qi, Mi, 0, Qj, Mj];
      const Tt = matTranspose(transformMatrix(el.angle));
      const dofs = [
        nodeIndex[el.nodeI] * 3,
        nodeIndex[el.nodeI] * 3 + 1,
        nodeIndex[el.nodeI] * 3 + 2,
        nodeIndex[el.nodeJ] * 3,
        nodeIndex[el.nodeJ] * 3 + 1,
        nodeIndex[el.nodeJ] * 3 + 2,
      ];
      for (let i = 0; i < 6; i++) {
        let fGlobal = 0;
        for (let k = 0; k < 6; k++) fGlobal += Tt[i][k] * fefLocal[k];
        F[dofs[i]] += fGlobal;
      }
    }
  });

  // Apply boundary conditions and solve
  // Collect constrained DOFs
  const constrained = new Array(nDOF).fill(false);
  const springStiffness = new Array(nDOF).fill(0);

  nodes.forEach((node, i) => {
    const s = node.support;
    if (!s || s.type === SupportType.FREE) return;
    const base = i * 3;
    switch (s.type) {
      case SupportType.PIN:
        constrained[base]     = true; // u
        constrained[base + 1] = true; // v
        break;
      case SupportType.ROLLER:
        constrained[base + 1] = true; // v
        break;
      case SupportType.SLIDER:
        constrained[base]     = true; // u
        break;
      case SupportType.FIXED:
        constrained[base]     = true; // u
        constrained[base + 1] = true; // v
        constrained[base + 2] = true; // θ
        break;
      case SupportType.GUIDED_Y:
        constrained[base]     = true; // u
        constrained[base + 2] = true; // θ
        break;
      case SupportType.GUIDED_X:
        constrained[base + 1] = true; // v
        constrained[base + 2] = true; // θ
        break;
      case SupportType.SPRING:
        if (s.kx) springStiffness[base]     += s.kx;
        if (s.ky) springStiffness[base + 1] += s.ky;
        if (s.km) springStiffness[base + 2] += s.km;
        break;
    }
  });

  // Add spring stiffnesses
  for (let i = 0; i < nDOF; i++) {
    if (springStiffness[i] > 0) K[i][i] += springStiffness[i];
  }

  // Penalty method for constraints (large number)
  const PENALTY = 1e14;
  const freeDOFs = [];
  for (let i = 0; i < nDOF; i++) {
    if (constrained[i]) {
      K[i][i] += PENALTY;
    } else {
      freeDOFs.push(i);
    }
  }

  // Extract free DOF submatrix and solve
  const nFree = freeDOFs.length;
  const Kf = freeDOFs.map(i => freeDOFs.map(j => K[i][j]));
  const Ff = freeDOFs.map(i => F[i]);

  let displacements = new Array(nDOF).fill(0);
  if (nFree > 0) {
    const df = solveLinear(Kf, Ff);
    freeDOFs.forEach((dof, k) => { displacements[dof] = df[k]; });
  }

  // Compute reactions: R = K_full * d - F
  const reactions = new Array(nDOF).fill(0);
  for (let i = 0; i < nDOF; i++) {
    if (constrained[i]) {
      let Kd = 0;
      for (let j = 0; j < nDOF; j++) Kd += (K[i][j] - (i === j ? PENALTY : 0)) * displacements[j];
      reactions[i] = Kd - F[i];
    }
  }

  // Compute internal forces along each element
  const elementResults = elemData.map(el => {
    const dofs = [
      nodeIndex[el.nodeI] * 3,
      nodeIndex[el.nodeI] * 3 + 1,
      nodeIndex[el.nodeI] * 3 + 2,
      nodeIndex[el.nodeJ] * 3,
      nodeIndex[el.nodeJ] * 3 + 1,
      nodeIndex[el.nodeJ] * 3 + 2,
    ];
    const d_global = dofs.map(d => displacements[d]);
    const T = transformMatrix(el.angle);
    // Local displacements: d_local = T * d_global
    const d_local = T.map(row => row.reduce((sum, v, k) => sum + v * d_global[k], 0));
    const kl = localStiffnessMatrix(el.E, el.A, el.I, el.L);
    const f_local = kl.map(row => row.reduce((sum, v, k) => sum + v * d_local[k], 0));

    // Collect element loads in local coords for internal force diagrams
    const elemLoads = loads.filter(ld => ld.elementId === el.id);
    const nPts = 51;
    const pts = [];
    for (let k = 0; k < nPts; k++) {
      const xi = k / (nPts - 1); // 0..1
      const x = xi * el.L;
      // Axial force (N), Shear (V), Moment (M) at position x
      let N = f_local[0]; // constant for simple case
      let V = f_local[1]; // shear at node i end
      let M = -f_local[2] + f_local[1] * x; // moment from end forces

      // Add contributions from distributed loads
      elemLoads.forEach(ld => {
        if (ld.type === LoadType.DIST_UNIFORM || ld.type === LoadType.DIST_TRAPEZOIDAL) {
          const w1 = ld.w1 !== undefined ? ld.w1 : ld.value;
          const w2 = ld.w2 !== undefined ? ld.w2 : ld.value;
          const wx = w1 + (w2 - w1) * xi;
          V -= w1 * x + (w2 - w1) * x * x / (2 * el.L);
          M -= w1 * x * x / 2 + (w2 - w1) * x * x * x / (6 * el.L);
        }
        if (ld.type === LoadType.POINT_FORCE_Y && ld.elementId != null) {
          const a = ld.position * el.L;
          if (x > a) {
            V -= ld.value;
            M -= ld.value * (x - a);
          }
        }
      });

      pts.push({ xi, x, N, V, M });
    }

    return {
      id: el.id,
      L: el.L,
      angle: el.angle,
      nodeI: el.nodeI,
      nodeJ: el.nodeJ,
      ni: el.ni,
      nj: el.nj,
      f_local,
      points: pts,
    };
  });

  return {
    displacements,
    reactions,
    nodeIndex,
    elements: elementResults,
  };
}
