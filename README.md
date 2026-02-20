# Accordo AI — Frontend

React-based procurement negotiation platform with real-time AI strategy visualization, MESO negotiations, and vendor management.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

The app runs on **http://localhost:5001** by default.

## Environment Setup

Create `.env.local` from `.env.example`:

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

The project uses a **single `Dockerfile`** with multi-stage build targets (`dev` and `prod`) and a **single `docker-compose.yml`** with Docker Compose profiles to switch between environments.

### Development Mode

Development mode runs the Vite dev server with volume-mounted source code for hot-reload (HMR). Changes you make on the host are reflected in the browser immediately. The Vite proxy forwards `/api` requests to the backend.

```bash
# Build and start in dev mode
docker compose --profile dev up -d --build

# Follow logs
docker compose --profile dev logs -f frontend

# Rebuild after dependency changes (package.json)
docker compose --profile dev up -d --build

# Stop
docker compose --profile dev down
```

### Production Mode

Production mode compiles the app with Vite, then serves the static bundle with nginx. Gzip compression, SPA fallback routing, and security headers are configured via `nginx.conf`.

```bash
# Set required environment variables (baked into the static bundle at build time)
export VITE_BACKEND_URL=https://api.accordo.com
export VITE_FRONTEND_URL=https://app.accordo.com

# Build and start in production mode
docker compose --profile prod up -d --build

# Follow logs
docker compose --profile prod logs -f frontend-prod

# Stop
docker compose --profile prod down
```

### Building Images Directly

You can also build Docker images without Compose:

```bash
# Build dev image
docker build --target dev -t accordo-frontend:dev .

# Build production image (VITE_ vars are required at build time)
docker build --target prod \
  --build-arg VITE_BACKEND_URL=https://api.accordo.com \
  --build-arg VITE_FRONTEND_URL=https://app.accordo.com \
  -t accordo-frontend:prod .
```

### Docker Architecture

The `Dockerfile` uses multi-stage builds with two targets:

```
┌──────────────────────────────────────────────────┐
│  Stage: deps (shared)                            │
│  node:20-alpine + npm install --legacy-peer-deps │
├──────────────────────┬───────────────────────────┤
│  Target: dev         │  Stage: builder           │
│  Vite dev server     │  npm run build (tsc+vite) │
│  Volume-mounted src  │         │                 │
│  HMR enabled         │  Target: prod             │
│                      │  nginx:alpine             │
│                      │  Static assets + gzip     │
│                      │  SPA fallback routing     │
└──────────────────────┴───────────────────────────┘
```

### Docker Features

- **Unified Dockerfile** with `dev` and `prod` targets — no separate Dockerfile.dev
- **Docker Compose profiles** — `--profile dev` or `--profile prod` in a single compose file
- Multi-stage build optimized for layer caching
- Hot-reload via Vite HMR in development
- Nginx with gzip compression (level 6) in production
- Static asset caching (1 year, immutable) for hashed filenames
- SPA fallback routing (all routes serve `index.html`)
- Security headers (X-Frame-Options, X-Content-Type-Options, XSS Protection, Referrer-Policy)
- Health check endpoint (`/health`)
- Resource limits (256MB memory, 0.5 CPU) in production
- JSON file logging with rotation in production

### Docker Environment Variables

| Variable | Dev Default | Prod | Description |
|----------|-------------|------|-------------|
| `VITE_BACKEND_URL` | `http://host.docker.internal:5002` | **Required** (build arg) | Backend API URL |
| `VITE_FRONTEND_URL` | `http://localhost:5001` | **Required** (build arg) | Frontend URL |
| `VITE_ASSEST_URL` | `http://host.docker.internal:5002` | Defaults to `VITE_BACKEND_URL` | Backend URL for uploaded assets |
| `FRONTEND_PORT` | `5001` | `5001` | Host port to expose |

## Architecture

```
src/
├── api/                 # Axios instances with auth interceptors
├── services/            # API service modules
│   ├── chatbot.service.ts    # Negotiation chatbot API client (50+ methods)
│   ├── bidAnalysis.service.ts # Bid comparison API client
│   ├── vendorChat.service.ts  # Vendor portal API client (MESO flow)
│   └── export.service.ts     # PDF/CSV export utilities
├── hooks/               # Custom React hooks
│   └── chatbot/         # Deal actions, conversation, history tracking
├── types/               # TypeScript type definitions
│   └── chatbot.ts       # Comprehensive chatbot types (NegotiationPhase, MesoResult, etc.)
├── utils/               # Token storage, permissions, utilities
├── components/
│   ├── chatbot/
│   │   ├── chat/        # MessageBubble, ChatTranscript, Composer, DecisionBadge
│   │   ├── sidebar/     # Utility bars, convergence chart, AI reasoning modal
│   │   ├── deal-wizard/ # 4-step deal creation wizard
│   │   ├── MesoOptions.tsx  # MESO offer cards with "Others" button
│   │   └── common/      # ConfirmDialog, shared components
│   ├── BidAnalysis/     # Bid comparison table, vendor cards, winner selection
│   ├── Requisition/     # Multi-step requisition form
│   ├── VendorForm/      # Multi-step vendor onboarding
│   └── ...              # SideBar, Graphs, settings, user management
├── pages/
│   ├── chatbot/         # NegotiationRoom, NewDealPage, RequisitionListPage, etc.
│   ├── BidAnalysis/     # Bid comparison pages
│   └── vendorChat/      # Vendor-facing negotiation portal with MESO flow
└── Layout/              # Auth, DashBoard, Chat layouts
```

## Key Features

### Negotiation Room

| Feature | Description |
|---------|-------------|
| Chat Panel | Real-time message transcript with smart auto-scroll and round dividers |
| AI Strategy Sidebar | Momentum bar, convergence rate, vendor pace, sentiment badges |
| AI Reasoning Modal | Detailed explainability for AI decisions |
| Convergence Chart | Chart.js visualization of vendor/PM offer convergence |
| Weighted Utility Display | Parameter-level utility breakdown with threshold zones |
| Dynamic Round Counter | Shows soft/hard max with extension status |

### MESO + Others Flow (Vendor Portal)

The vendor negotiation portal (`/vendor-chat/:token`) implements a phased MESO approach:

| Phase | Rounds | Behavior |
|-------|--------|----------|
| Normal Negotiation | 1-5 | Text-based negotiation, no MESO |
| MESO Presentation | After 5 | Show 3 MESO offers + "Others" button |
| Others Form | On click | Price + payment terms form input |
| Post-Others | 4 rounds | Text negotiation before next MESO |
| Final MESO | After stall | No "Others" option, must select offer |

**MESO Components:**
- `MesoOptions.tsx` — Displays 3 MESO offer cards with selection
- `OthersForm` — Custom price/terms input form
- `DisabledInputMessage` — Shown when MESO is displayed
- Input state machine: `text` → `disabled` → `others_form`

### Vendor Chat Service Methods

```typescript
// MESO flow endpoints
vendorChatService.selectMesoOption(token, optionId)  // Auto-accept deal
vendorChatService.submitOthers(token, price, days)   // Submit custom offer
vendorChatService.confirmFinalOffer(token, isConfirmed)  // Final offer response
```

## Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Requisition List | `/chatbot` | Browse requisitions with deal statistics |
| Requisition Deals | `/chatbot/requisitions/:rfqId` | Vendor deals for a requisition |
| New Deal | `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/new` | 4-step deal creation wizard |
| Negotiation Room | `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId` | Main negotiation interface |
| Bid Analysis | `/bid-analysis/:rfqId` | Compare vendor bids |
| Vendor Chat | `/vendor-chat/:token` | Vendor-facing MESO negotiation |

## Sidebar Components

| Component | Purpose |
|-----------|---------|
| `UnifiedUtilityBar` | Combined utility scoring with decision threshold zones |
| `WeightedUtilityBar` | Parameter-level weighted breakdown |
| `ConvergenceChart` | Chart.js line chart — vendor offers vs PM counters |
| `AiReasoningModal` | Detailed AI decision explainability |
| `CollapsibleSection` | Accordion sections for parameter groups |
| `DecisionThresholdZones` | Accept/counter/escalate/walk-away visualization |

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

## Type Definitions

Key types in `src/types/chatbot.ts`:

```typescript
// Negotiation flow phases
type NegotiationPhase =
  | 'NORMAL_NEGOTIATION'
  | 'MESO_PRESENTATION'
  | 'OTHERS_FORM'
  | 'POST_OTHERS'
  | 'FINAL_MESO'
  | 'STALL_QUESTION'
  | 'DEAL_ACCEPTED'
  | 'ESCALATED';

// MESO result with flow control
interface MesoResult {
  options: MesoOption[];
  showOthers: boolean;      // Show "Others" button
  isFinal: boolean;         // Final MESO (no Others)
  inputDisabled: boolean;   // Disable text input
  phase: NegotiationPhase;
}
```

## License

Proprietary — Accordo AI
