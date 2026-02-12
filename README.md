# Accordo AI — Frontend

React-based procurement negotiation platform with real-time AI strategy visualization and vendor management.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp env.local.template .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

The app runs on **http://localhost:5001** by default.

## Environment Setup

Create `.env.local` with:

```env
VITE_BACKEND_URL=http://localhost:5002
VITE_FRONTEND_URL=http://localhost:5001
VITE_ASSEST_URL=http://localhost:5002
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5001
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:5002` | Backend API base URL |
| `VITE_FRONTEND_URL` | `http://localhost:5001` | Frontend URL (for contract links) |
| `VITE_ASSEST_URL` | `http://localhost:5002` | Backend URL for uploaded assets |
| `VITE_DEV_HOST` | `0.0.0.0` | Dev server host |
| `VITE_DEV_PORT` | `5001` | Dev server port |

The Vite dev server proxies `/api` requests to `VITE_BACKEND_URL` automatically.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server on port 5001
npm run build        # TypeScript check + production build (tsc && vite build)
npm run type-check   # TypeScript type-checking only
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Testing (Vitest)
npm test             # Run all tests
npm run test:ui      # Interactive test UI
npm run test:coverage # Tests with coverage report
```

## Docker

```bash
# Build and start
docker compose up -d --build

# With custom backend URL
VITE_BACKEND_URL=http://api.example.com docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

The Docker setup uses a multi-stage build:
1. **deps** — Install node_modules (cached layer)
2. **builder** — TypeScript type-check + Vite production build
3. **production** — Nginx serving static assets with gzip, caching, and SPA fallback

## Architecture

```
src/
├── api/                 # Axios instances with auth interceptors
├── services/            # API service modules
│   ├── chatbot.service.ts    # Negotiation chatbot API client (50+ methods)
│   ├── bidAnalysis.service.ts # Bid comparison API client
│   ├── vendorChat.service.ts  # Vendor portal API client
│   └── export.service.ts     # PDF/CSV export utilities
├── hooks/               # Custom React hooks
│   └── chatbot/         # Deal actions, conversation, history tracking
├── types/               # TypeScript type definitions
├── utils/               # Token storage, permissions, utilities
├── components/
│   ├── chatbot/
│   │   ├── chat/        # MessageBubble, ChatTranscript, Composer, DecisionBadge
│   │   ├── sidebar/     # Utility bars, convergence chart, parameter display
│   │   ├── deal-wizard/ # 4-step deal creation wizard
│   │   └── common/      # ConfirmDialog, shared components
│   ├── BidAnalysis/     # Bid comparison table, vendor cards, winner selection
│   ├── Requisition/     # Multi-step requisition form
│   ├── VendorForm/      # Multi-step vendor onboarding
│   └── ...              # SideBar, Graphs, settings, user management
├── pages/
│   ├── chatbot/         # NegotiationRoom, NewDealPage, RequisitionListPage, etc.
│   ├── BidAnalysis/     # Bid comparison pages
│   └── vendorChat/      # Vendor-facing negotiation portal
└── Layout/              # Auth, DashBoard, Chat layouts
```

### Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Requisition List | `/chatbot` | Browse requisitions with deal statistics |
| Requisition Deals | `/chatbot/requisitions/:rfqId` | Vendor deals for a requisition |
| New Deal | `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/new` | 4-step deal creation wizard |
| Negotiation Room | `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId` | Main negotiation interface |
| Bid Analysis | `/bid-analysis/:rfqId` | Compare vendor bids |

### Negotiation Room Features

- **Chat Panel**: Real-time message transcript with smart auto-scroll and round dividers
- **AI Strategy Sidebar**: Momentum bar, convergence rate, vendor pace, sentiment badges
- **Convergence Chart**: Chart.js visualization of vendor/PM offer convergence over rounds
- **Weighted Utility Display**: Parameter-level utility breakdown with threshold zones
- **Dynamic Round Counter**: Shows soft/hard max with extension status
- **Enhanced Round Dividers**: Strategy labels and utility scores per round (color-coded)

### Sidebar Components (`components/chatbot/sidebar/`)

| Component | Purpose |
|-----------|---------|
| `UnifiedUtilityBar` | Combined utility scoring with decision threshold zones |
| `WeightedUtilityBar` | Parameter-level weighted breakdown |
| `ConvergenceChart` | Chart.js line chart — vendor offers vs PM counters over rounds |
| `ParameterWeightsChart` | Visual weight distribution across parameters |
| `CollapsibleSection` | Accordion sections for parameter groups |
| `DecisionThresholdZones` | Accept/counter/escalate/walk-away zone visualization |
| `parameterFormatter` | Formatting utilities for parameter display |

## Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | **5001** | **This React/Vite app** |
| Backend API | 5002 | Express.js server |
| Embedding Service | 5003 | Python FastAPI (optional) |

> Port 5000 is reserved by macOS AirPlay Receiver.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS + MUI v6
- **Routing**: React Router v7
- **HTTP**: Axios with JWT auth interceptors
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: react-hook-form + yup/zod validation
- **Notifications**: react-hot-toast
- **Testing**: Vitest + Testing Library
- **Production**: Nginx (Docker) with gzip and SPA fallback
