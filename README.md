# VisionPulse AI — Realtime Object Detection & Analytics Platform

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**VisionPulse** is an enterprise-grade, client-side computer vision telemetry and logging platform designed for real-time edge processing. Built on top of **TensorFlow.js** and the **COCO-SSD (MobileNetV2)** neural network, inference executes entirely inside the user's browser via WebGL acceleration, achieving sub-45ms latencies without server roundtrips.

---

## ✨ Key Features

### 1. 🎯 Real-Time Laptop Webcam Inference
- Direct hardware access via `navigator.mediaDevices.getUserMedia()`.
- Synchronized canvas overlay drawing accurate bounding boxes with class-specific colors.
- Real-time label rendering with dynamic confidence percentages.
- Measured **FPS counter** and **hardware inference latency (ms)** tracking (no hardcoded estimates).
- Full stream lifecycle management with clean camera track teardown on stop or unmount.

### 2. 🛡️ Intelligent Event Deduplication
- High-frequency 60 FPS video streams can easily flood audit trails with duplicate events. VisionPulse features a configurable **per-class cooldown window** (0.5s – 10.0s).
- New entities or distinct classification state transitions are captured immediately.

### 3. 📋 Structured Detection Event Ledger
- Searchable, filterable, and sortable event logging.
- Filter by date, object category, confidence range, and input source (Webcam, Upload, Sample).
- Export filtered audit logs to standard **CSV format**.
- Download structured **Session Reports** in JSON format.
- Client-side persistence in browser `localStorage`.

### 4. 📊 Computer Vision Analytics
- Real-time detection velocity area chart with time range filters (15m, 1h, 24h, All).
- Top detected categories distribution horizontal bar chart.
- Confidence score spread histogram (20-40%, 40-60%, 60-70%, 70-80%, 80-90%, 90-100%).
- Multi-session volume breakdown.

### 5. 🧪 Image Testing Lab
- Upload custom images (PNG, JPG, WebP) via drag-and-drop or file picker.
- Pre-loaded sample scenarios (Workspace desk, City street, Living room pet, Coffee table) for testing without a physical webcam.

### 6. 🎨 Professional Light Theme UI
- Modern, clean aesthetic with white, warm white, and light slate palettes.
- Crisp typography using Inter and JetBrains Mono.
- Accessible contrast ratios, keyboard navigation support, and smooth micro-animations.

---

## 🔒 100% Privacy Guarantee
VisionPulse executes all neural network inferences directly on your local GPU via browser WebGL shaders. **No video streams, webcam feeds, or snapshots are ever transmitted to any remote server.** Frame snapshots are only saved locally when you explicitly click the "Capture Frame Snapshot" button.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended, tested on v24.x)
- Modern web browser (Chrome, Edge, Firefox, or Safari) with WebGL support

### Installation
```bash
# Clone the repository
git clone https://github.com/vishnuvardhan8936-sketch/community-.git
cd community-

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### Preview Production Build Locally
```bash
npm run preview
```

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Computer Vision Engine** | TensorFlow.js + COCO-SSD (MobileNetV2) |
| **Data Visualization** | Recharts 3 |
| **Icons & Design** | Lucide React |
| **Styling** | Vanilla CSS Design System (Light Theme Tokens) |

---

## 📦 Supported Object Classes (80 COCO Categories)
`person`, `bicycle`, `car`, `motorcycle`, `airplane`, `bus`, `train`, `truck`, `boat`, `traffic light`, `fire hydrant`, `stop sign`, `parking meter`, `bench`, `bird`, `cat`, `dog`, `horse`, `sheep`, `cow`, `elephant`, `bear`, `zebra`, `giraffe`, `backpack`, `umbrella`, `handbag`, `tie`, `suitcase`, `frisbee`, `skis`, `snowboard`, `sports ball`, `kite`, `baseball bat`, `baseball glove`, `skateboard`, `surfboard`, `tennis racket`, `bottle`, `wine glass`, `cup`, `fork`, `knife`, `spoon`, `bowl`, `banana`, `apple`, `sandwich`, `orange`, `broccoli`, `carrot`, `hot dog`, `pizza`, `donut`, `cake`, `chair`, `couch`, `potted plant`, `bed`, `dining table`, `toilet`, `tv`, `laptop`, `mouse`, `remote`, `keyboard`, `cell phone`, `microwave`, `oven`, `toaster`, `sink`, `refrigerator`, `book`, `clock`, `vase`, `scissors`, `teddy bear`, `hair drier`, `toothbrush`.

---

## 📄 License
This project is open-source under the MIT License.
