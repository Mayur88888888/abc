# WebCAD Pro - Browser-Based 3D CAD System

A professional-grade 3D CAD application running entirely in the browser, built with React, TypeScript, Three.js, and Zustand.

![WebCAD Pro](https://img.shields.io/badge/WebCAD-Pro-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-green)

## 🚀 Features

### 3D Modeling
- **Primitives**: Box, Cylinder, Sphere, Cone, Torus, Pyramid, Helix, Pipe
- **Operations**: Extrude, Revolve, Fillet, Chamfer, Shell, Hole, Patterns
- **Real-time 3D viewport** with orbit controls
- **Multiple view modes**: Shaded, Wireframe, With Edges, Hidden Line

### Selection System
- **Body selection** (default)
- **Face selection** with face identification
- **Edge selection** with wireframe overlay
- **Vertex selection** with point markers

### User Interface
- **NX-style Ribbon toolbar** with categorized commands
- **Feature tree** with context menu (right-click)
- **Command palette** (Ctrl+Shift+P) for quick command access
- **Status bar** with cursor position and selection info
- **View toolbar** for display modes and selection modes

### Productivity
- **Undo/Redo** with full history stack
- **Keyboard shortcuts** for common operations
- **Parametric modeling** - edit parameters anytime
- **Feature visibility** toggle
- **Feature suppression**

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- npm (comes with Node.js)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Mayur88888888/chili3d.git
cd chili3d

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at **http://localhost:5173**

### Windows Users
Just double-click `start.bat` for an interactive menu!

## 🎮 Usage

### Creating Primitives
1. Click on the **Home** tab in the ribbon
2. Select a primitive (Block, Cylinder, Sphere, etc.)
3. Enter parameters in the dialog
4. Click **Create**

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `B` | Create Box |
| `C` | Create Cylinder |
| `E` | Extrude |
| `F` | Fillet |
| `H` | Hole |
| `P` | Pipe |
| `1` | Body Selection Mode |
| `2` | Face Selection Mode |
| `3` | Edge Selection Mode |
| `4` | Vertex Selection Mode |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+Shift+P` | Command Palette |

### Selection Modes
- **Body Mode (1)**: Click to select entire features
- **Face Mode (2)**: Click on faces to select individual surfaces
- **Edge Mode (3)**: Click on edges with wireframe overlay
- **Vertex Mode (4)**: Click on vertices with point markers

### Context Menu
Right-click on any feature in the feature tree to:
- Rename
- Suppress/Unsuppress
- Toggle Visibility
- Edit Parameters
- Duplicate
- Isolate
- Delete

## 🏗️ Project Structure

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
│
├── components/
│   ├── CADViewport.tsx        # 3D viewport with Three.js
│   ├── Ribbon.tsx             # Top toolbar (NX-style)
│   ├── FeatureTree.tsx        # Left panel feature list
│   ├── CommandDialog.tsx      # Parameter input dialogs
│   ├── CommandPalette.tsx     # Quick command search
│   ├── StatusBar.tsx          # Bottom status bar
│   └── ViewToolbar.tsx        # Right side view controls
│
├── store/
│   └── cadStore.ts            # Zustand state management
│
└── lib/
    └── cadEngine.ts           # Core CAD engine logic
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Architecture

### Command Pattern
All operations follow the Command Pattern for consistency and extensibility:
- Each command has a unique ID, icon, and optional shortcut
- Commands are registered in the CommandRegistry
- Dialogs handle parameter input
- Store actions execute the actual operations

### State Management
Uses Zustand for simple, performant state management:
- Model state (features, parameters)
- UI state (selection, view mode, dialogs)
- History (undo/redo stack)

### 3D Rendering
Three.js with React Three Fiber:
- Real-time 3D viewport
- Orbit controls for camera
- Raycasting for selection
- Multiple display modes

## 🐛 Known Limitations

This is a **visual CAD system** using Three.js primitives. It does NOT include:
- Real B-rep geometry kernel (like OpenCASCADE)
- True boolean operations (CSG)
- Real fillet/chamfer on arbitrary edges
- STEP/IGES file import/export
- 2D sketch with constraints

For a full-featured CAD kernel, consider integrating OpenCASCADE via WebAssembly (like Chili3D does).

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Chili3D](https://github.com/Mayur88888888/chili3d) - Inspiration for browser-based CAD
- [Three.js](https://threejs.org/) - 3D rendering engine
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Zustand](https://github.com/pmndrs/zustand) - State management

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for the CAD community**
