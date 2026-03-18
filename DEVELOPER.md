# Accordo-AI Frontend — Developer Guide

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 5.4 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3.4 + MUI 6.4 |
| HTTP | Axios (3 instances: public, auth, multipart) |
| Forms | react-hook-form + yup / zod |
| Charts | Chart.js + react-chartjs-2 |
| Testing | Vitest + Testing Library |
| Icons | Lucide React + React Icons |

---

## Quick Start

```bash
npm install
cp .env.example .env.local    # edit VITE_BACKEND_URL if backend isn't on :5002
npm run dev                    # http://localhost:5001
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR (port 5001) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run type-check` | TypeScript compiler check (no emit) |
| `npm run lint` | ESLint |
| `npm run test` | Run Vitest |
| `npm run test:ui` | Vitest browser UI |
| `npm run test:coverage` | Coverage report (80% threshold) |

---

## Project Structure

```
src/
├── api/                    # Axios instances & interceptors
│   ├── index.ts            # 3 axios instances (api, authApi, authMultiFormApi)
│   └── tokenStorage.ts     # localStorage token helpers
│
├── components/             # UI components (by feature)
│   ├── chatbot/            # Negotiation UI (40+ components)
│   │   ├── chat/           #   ChatTranscript, Composer, MessageBubble, OfferCard
│   │   ├── sidebar/        #   UtilityBar, ConvergenceChart, AiReasoningModal
│   │   ├── deal-wizard/    #   4-step deal creation wizard
│   │   ├── requisition-view/ # RequisitionCard, VendorDealCard
│   │   ├── conversation/   #   ConversationRoom components
│   │   ├── deal/           #   ExplainabilityPanel
│   │   ├── navigation/     #   HistoryPanel
│   │   └── analytics/      #   ConversationAnalytics
│   ├── BidAnalysis/        # Bid comparison & winner selection
│   ├── LandingPages/       # Public landing page sections
│   ├── VendorForm/         # 8-step vendor onboarding
│   ├── Requisition/        # Requisition creation form
│   ├── Graphs/             # Chart wrapper components
│   ├── shared/             # Reusable UI primitives
│   └── theme/              # ThemeToggle, ThemeContext
│
├── hooks/                  # Custom React hooks
│   ├── chatbot/
│   │   ├── useDealActions.ts      # Core deal state & messaging
│   │   ├── useConversation.ts     # Conversation mode logic
│   │   └── useHistoryTracking.ts  # Deal view history
│   ├── bidAnalysis/
│   │   ├── useBidActions.ts
│   │   ├── useBidAnalysisDetail.ts
│   │   └── useBidAnalysisRequisitions.ts
│   ├── dashboard/
│   ├── useAutoSave.ts
│   ├── useDebounce.tsx
│   └── useFetchData.tsx
│
├── pages/                  # Route-level page components
│   ├── chatbot/            # Negotiation pages
│   │   ├── RequisitionListPage.tsx
│   │   ├── RequisitionDealsPage.tsx
│   │   ├── NegotiationRoom.tsx     # INSIGHTS mode
│   │   ├── ConversationRoom.tsx    # CONVERSATION mode
│   │   ├── NewDealPageWrapper.tsx  # Deal creation
│   │   └── SummaryPage.tsx
│   ├── bidAnalysis/
│   ├── auth/               # SignIn, SignUp, ForgotPassword, ResetPassword
│   ├── onboarding/
│   ├── vendor/              # VendorChat (public), VendorContract
│   └── management/          # Dashboard, Projects, Requisitions, POs, Users
│
├── services/               # API service functions
│   ├── chatbot.service.ts         # 1,191 lines — deals, messages, config
│   ├── vendorChat.service.ts      # Public vendor endpoints
│   ├── bidAnalysis.service.ts     # Bid comparison APIs
│   ├── export.service.ts          # PDF & CSV export
│   ├── chat.service.ts            # Legacy chat
│   └── dashboard.service.ts
│
├── types/                  # TypeScript type definitions
│   ├── chatbot.ts          # Deal, Message, Offer, NegotiationConfig, Decision
│   ├── bidAnalysis.ts      # BidStatus, ApprovalFlow
│   ├── api.ts              # Response wrappers
│   ├── components.ts       # Component prop types
│   ├── hooks.ts            # Hook return types
│   ├── management.types.ts
│   └── index.ts            # Barrel exports
│
├── utils/                  # Utility functions
│   ├── env.ts              # Runtime env resolution (window.__ENV__ || import.meta.env)
│   └── ...
│
├── layouts/                # Layout wrappers
│   ├── DashBoardLayout.tsx # Sidebar + Outlet (protected)
│   ├── ChatLayout.tsx      # Legacy chat layout
│   └── Auth.tsx            # Auth pages layout
│
├── App.tsx                 # Route definitions
├── main.tsx                # React DOM entry point
└── index.css               # Global styles + Tailwind directives
```

---

## Routing Overview

### Public Routes
| Path | Page | Notes |
|---|---|---|
| `/` | HomePage | Landing page |
| `/vendor-chat/:uniqueToken` | VendorChat | Vendor negotiation portal (no auth) |
| `/vendor-contract/:id` | VendorContract | Contract acceptance (no auth) |

### Auth Routes
| Path | Page |
|---|---|
| `/sign-in` | SignIn |
| `/sign-up` | SignUp |
| `/forgot-password` | ForgotPassword |
| `/reset-password/:id` | ResetPassword |
| `/onboarding` | OnboardingPage |

### Protected Routes (require auth)
| Path | Page |
|---|---|
| `/dashboard` | Dashboard |
| `/chatbot/requisitions` | RequisitionListPage |
| `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId` | NegotiationRoom (INSIGHTS) |
| `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/conversation` | ConversationRoom |
| `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/summary` | SummaryPage |
| `/chatbot/requisitions/deals/new` | NewDealPageWrapper |
| `/bid-analysis` | BidAnalysisListPage |
| `/bid-analysis/requisitions/:requisitionId` | BidAnalysisDetailPage |
| `/project-management` | ProjectManagement |
| `/requisition-management` | RequisitionsManagement |
| `/vendor-management` | VendorManagement |
| `/po-management` | PoManagement |
| `/user-management` | UserManagement |
| `/setting` | UserInfo |

---

## API Layer

### Three Axios Instances (`src/api/index.ts`)

| Instance | Auth | Content-Type | Use Case |
|---|---|---|---|
| `api` | None | JSON | Public endpoints (vendor chat, landing) |
| `authApi` | Bearer token | JSON | All protected endpoints |
| `authMultiFormApi` | Bearer token | multipart/form-data | File uploads |

### Token Management

- Tokens stored in `localStorage` via `tokenStorage.ts`
- Keys: `%accessToken%`, `%refreshToken%`
- Access token includes `"Bearer "` prefix — used directly in headers
- 401 responses trigger automatic token refresh via `/api/auth/refresh-token`
- Failed refresh redirects to `/sign-in`

### Service Pattern

Services are plain functions that call the axios instances and return typed data:

```typescript
// Example from chatbot.service.ts
export const getDeal = async (context: DealContext): Promise<Deal> => {
  const { rfqId, vendorId, dealId } = context;
  const res = await authApi.get(
    `/chatbot/requisitions/${rfqId}/vendors/${vendorId}/deals/${dealId}`
  );
  return res.data.data;
};
```

---

## State Management

There is **no global store** (no Redux/Zustand). State is managed via:

1. **React Context** — `ThemeContext` (dark/light mode, persisted to localStorage)
2. **Custom hooks** — feature-specific state machines (e.g., `useDealActions` manages deal, messages, config, loading, permissions)
3. **URL params** — hierarchical context (`rfqId`, `vendorId`, `dealId`) from React Router
4. **Component state** — `useState` / `useReducer` for local UI state

### Key Hooks

**`useDealActions`** — the core hook for negotiation pages:
- Loads deal, messages, config, utility scores
- Handles two-phase messaging (instant vendor message + async PM response)
- Manages permissions, loading states, PM typing indicator
- Returns: `{ deal, messages, config, context, loading, sending, pmTyping, permissions, ... }`

**`useConversation`** — conversation mode variant with LLM-driven responses

**`useHistoryTracking`** — tracks deal view history and last-accessed timestamps

---

## Styling

### Tailwind CSS (primary)

- Config: `tailwind.config.js`
- Dark mode: `class` strategy (toggled via `ThemeContext`)
- Custom color tokens: `primary-50..900`, `dark-bg`, `dark-surface`, `dark-border`, `dark-text`, `landing-*`
- Custom fonts: Montserrat (headings), Inter (body), Roboto (fallback)
- Custom animations: `marquee`, `counter`, `fade-in-up`

### MUI (secondary)

- Used for complex interactive components (dialogs, form controls)
- Styled via Emotion (`@emotion/react`, `@emotion/styled`)

### Global Styles (`src/index.css`)

- Tailwind directives
- Scroll reveal animations
- Chat bubble styles and typing indicator
- Custom scrollbar theming
- Landing page navigation styles

---

## Key Patterns

### Path Alias

All imports use `@/` which maps to `src/`:

```typescript
import { getDeal } from '@/services/chatbot.service';
import type { Deal } from '@/types';
```

### Two Negotiation Modes

| Mode | Route | Hook | Backend Flow |
|---|---|---|---|
| INSIGHTS | `NegotiationRoom` | `useDealActions` | `chatbot.service` → `decide.ts` → `responseGenerator.ts` |
| CONVERSATION | `ConversationRoom` | `useConversation` | `conversationService` → deterministic intent pipeline |

### Deal Context

Most chatbot APIs require a `DealContext` object:

```typescript
interface DealContext {
  rfqId: string;
  vendorId: string;
  dealId: string;
}
```

Extracted from URL params: `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId`

### Deal Creation Wizard

4-step flow in `NewDealPageWrapper`:
1. Select requisition & vendor
2. Configure negotiation parameters (prices, quantities)
3. Set weights & preferences
4. Review & create

---

## Testing

### Setup

- Framework: Vitest 4 + jsdom
- Libraries: Testing Library (React, jest-dom, user-event)
- Config: `vitest.config.ts`
- Setup: `tests/helpers/setup.ts`

### Running Tests

```bash
npm run test                    # Run all tests
npm run test:ui                 # Vitest UI in browser
npm run test:coverage           # Coverage report
npx vitest -t "deal actions"   # Run by pattern
npx vitest src/hooks/           # Run tests in a directory
```

### Coverage Thresholds

All metrics require **80%** minimum: lines, functions, branches, statements.

### Test Structure

```
tests/
├── unit/           # Pure function / hook tests
├── integration/    # Multi-component tests
├── components/     # Component render tests
├── helpers/        # Test utilities, mocks, setup
└── scripts/        # Test runner scripts
```

---

## Adding a New Feature (Checklist)

1. **Types** — add interfaces in `src/types/` and export from `index.ts`
2. **Service** — add API functions in `src/services/`
3. **Hook** — create a custom hook in `src/hooks/<feature>/` if state logic is complex
4. **Components** — add to `src/components/<feature>/`
5. **Page** — add route-level component in `src/pages/<feature>/`
6. **Route** — register in `src/App.tsx` under the appropriate layout
7. **Tests** — add tests in `tests/` matching the source structure

---

## Common Gotchas

- **Token prefix**: `accessToken` in localStorage already includes `"Bearer "` — don't double-add it
- **Login endpoint**: `POST /api/auth/login` (not `/signin`)
- **Price model**: All prices in the negotiation system are **total contract values**, not per-unit
- **Env at runtime**: In Docker production, env vars come from `window.__ENV__` (injected by `docker/env.sh`), not from the build
- **Strict TypeScript**: The project uses full strict mode — `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`, etc. Fix all type errors before committing
