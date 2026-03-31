# XC Usage Guide

This guide explains how to install, set up, and start using XC for structural finite element analysis.

## Table of Contents

1. [Installation](#installation)
2. [Your First Model](#your-first-model)
3. [Basic Concepts](#basic-concepts)
4. [Workflow Overview](#workflow-overview)
5. [Running an Analysis](#running-an-analysis)
6. [Viewing Results](#viewing-results)
7. [Examples and Tutorials](#examples-and-tutorials)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Option 1: Docker (Recommended for beginners)

Docker is the easiest way to run XC — no compilation required.

1. Install [Docker](https://docs.docker.com/get-docker/) on your system.
2. Pull and run the XC container:

```bash
docker run -it -v $(pwd):/home/xcuser/models xcfem/xc
```

This command mounts your current folder inside the container so you can edit your model files locally and run them inside XC.

Full Docker instructions: [docker_install.md](../install/docker_install.md)

---

### Option 2: Build from source (Linux)

**Requirements:** Ubuntu 20.04 or later, at least 6 GB RAM, ~30 minutes.

**Step 1 — Install dependencies:**
```bash
sudo sh install/packages_install_ubuntu_24.04.sh
```

**Step 2 — Build XC:**
```bash
mkdir build-xc
cd build-xc
cmake ../src
make -j4
sudo make install
```

**Step 3 — Install Python modules:**
```bash
cd ../python_modules
sudo sh local_install.sh
```

**Step 4 — Verify the installation:**
```bash
python3 -c "import xc; print('XC installed correctly')"
```

Full build instructions: [install.linux.md](../install/install.linux.md)

---

## Your First Model

XC models are written as Python scripts. Here is a minimal example: a single truss element under axial load.

```python
import xc
from model import predefined_spaces
from materials import typical_materials

# 1. Create the finite element problem
feProblem = xc.FEProblem()
preprocessor = feProblem.getPreprocessor

# 2. Define the coordinate space (3D, 6 DOF per node)
nodes = preprocessor.getNodeHandler
modelSpace = predefined_spaces.StructuralMechanics3D(nodes)

# 3. Create two nodes
n1 = nodes.newNodeXYZ(0, 0, 0)   # node 1 at origin
n2 = nodes.newNodeXYZ(1, 0, 0)   # node 2, 1 m away

# 4. Define material (steel, E = 210 GPa)
elast = typical_materials.defElasticMaterial(preprocessor, "steel", 210e9)

# 5. Create a truss element between the two nodes
elements = preprocessor.getElementHandler
elements.defaultMaterial = "steel"
truss = elements.newElement("Truss", xc.ID([n1.tag, n2.tag]))
truss.sectionArea = 0.01   # cross-section area in m²

# 6. Apply boundary conditions (fix node 1)
modelSpace.fixNode000_000(n1.tag)

# 7. Apply load to node 2
lp = modelSpace.newLoadPattern(name="load1")
lp.newNodalLoad(n2.tag, xc.Vector([10000, 0, 0, 0, 0, 0]))  # 10 kN in X
modelSpace.addLoadCaseToDomain("load1")

# 8. Run the analysis
analysis = predefined_spaces.simple_static_linear(feProblem)
analysis.analyze(1)

# 9. Read results
n2.getDisp   # displacement vector of node 2
print("Displacement of node 2:", n2.getDisp)
```

Save this as `truss.py` and run it:

```bash
python3 truss.py
```

---

## Basic Concepts

### Preprocessor
The `preprocessor` is the object you use to build your model: nodes, elements, materials, and boundary conditions.

### Nodes
Nodes define positions in space. Each node has degrees of freedom (DOF) representing displacements and rotations.

```python
node = nodes.newNodeXYZ(x, y, z)
```

### Elements
Elements connect nodes and represent structural members (beams, shells, solids, trusses, etc.).

```python
elements.defaultMaterial = "myMaterial"
beam = elements.newElement("ElasticBeam3d", xc.ID([n1.tag, n2.tag]))
```

### Materials
Materials define the mechanical properties used by elements.

```python
from materials import typical_materials
steel = typical_materials.defElasticMaterial(preprocessor, "steel", 210e9)
```

### Load Patterns
Loads are grouped into load patterns. You create a pattern, add loads to it, and then activate it in the domain.

```python
lp = modelSpace.newLoadPattern(name="wind")
lp.newNodalLoad(nodeTag, xc.Vector([fx, fy, fz, mx, my, mz]))
modelSpace.addLoadCaseToDomain("wind")
```

### Boundary Conditions (Constraints)
Fix degrees of freedom to model supports.

```python
modelSpace.fixNode000_000(nodeTag)   # fully fixed node (all 6 DOF)
modelSpace.fixNode000_FFF(nodeTag)   # pin support (translation fixed, rotation free)
```

---

## Workflow Overview

A typical XC analysis follows these steps:

```
1. Define geometry (nodes)
       ↓
2. Define materials
       ↓
3. Create elements
       ↓
4. Apply boundary conditions
       ↓
5. Define loads
       ↓
6. Run analysis
       ↓
7. Extract and post-process results
```

---

## Running an Analysis

### Static linear analysis
```python
from model import predefined_spaces
analysis = predefined_spaces.simple_static_linear(feProblem)
result = analysis.analyze(1)   # 1 load step
```

### Non-linear static analysis (incremental)
```python
analysis = predefined_spaces.simple_static_modified_newton(feProblem)
result = analysis.analyze(10)  # 10 increments
```

### Modal (eigenvalue) analysis
```python
analysis = predefined_spaces.frequency_analysis(feProblem)
analOk = analysis.analyze(3)   # compute first 3 modes
```

---

## Viewing Results

### Node displacements
```python
disp = node.getDisp          # full displacement vector
ux   = node.getDisp[0]       # displacement in X
uy   = node.getDisp[1]       # displacement in Y
```

### Element forces
```python
element.getResistingForce()  # internal force vector
```

### Export to VTK (for visualization in ParaView)
```python
from postprocess import output_handler
oh = output_handler.OutputHandler(modelSpace)
oh.displayLoads()
oh.displayDispRot(itemToDisp='uX')
oh.displayIntForcDiag(itemToDisp='N')  # axial force diagram
```

Open the exported `.vtk` files with [ParaView](https://www.paraview.org/) for 3D visualization.

---

## Examples and Tutorials

The best way to learn XC is through examples:

| Resource | Description |
|---|---|
| [xc_examples](https://github.com/xcfem/xc_examples) | Ready-to-run model scripts |
| [Tutorial 001](https://github.com/xcfem/xc_examples/blob/master/XC_tutorial_001/tutorial001_truss_temp.pdf) | Truss under temperature load |
| [Tutorial 002](https://raw.githubusercontent.com/xcfem/xc_examples/master/XC_tutorial_002/tutorial002_eigen_vibr_string.pdf) | Vibrating string — eigenvalue analysis |
| [Tutorial 003](https://raw.githubusercontent.com/xcfem/xc_examples/master/XC_tutorial_003/tutorial003_fiber_section.pdf) | Reinforced concrete fiber section |
| [Verification tests](../verif/tests/) | 900+ tested models covering all element types |

### Recommended learning path

1. Read [how_to_start.md](how_to_start.md)
2. Run Tutorial 001 (truss)
3. Browse `verif/tests/elements/` for element-specific examples
4. Consult the [Python API docs](https://xcfem.github.io/XCmanual/) for available classes and methods

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'xc'`
XC is not installed or not on the Python path. Check that `make install` and `local_install.sh` completed without errors.

```bash
python3 -c "import xc"
```

If this fails, re-run:
```bash
cd python_modules && sudo sh local_install.sh
```

### Analysis returns a non-zero exit code
This usually means the model is ill-conditioned (singular stiffness matrix). Common causes:
- Unrestrained rigid body motion — check that all DOF are properly constrained.
- Disconnected nodes — make sure all nodes are connected to at least one element.

### Display/VTK errors in headless environments
VTK requires a display. If running on a server without a screen, use a virtual display:
```bash
Xvfb :1 -screen 0 1024x768x24 &
export DISPLAY=:1
python3 your_model.py
```

---

## Further Reading

- [C++ API documentation](https://codedocs.xyz/xcfem/xc/index.html)
- [Python API documentation](https://xcfem.github.io/XCmanual/)
- [Project home page](https://sites.google.com/site/xcfemanalysis/)
- [OpenSees documentation](https://opensees.berkeley.edu/) (XC shares many concepts with OpenSees)
