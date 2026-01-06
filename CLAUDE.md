# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build (outputs to dist/)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Docker

```bash
docker build -t accordo-frontend .
docker run -p 3000:3000 accordo-frontend
```

## Environment Setup

Create `.env.local` with:
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:3000
VITE_ASSEST_URL=http://localhost:8000
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=3000
```

The dev server proxies `/api` requests to `VITE_BACKEND_URL`.

## Architecture

### Tech Stack
- React 18 + Vite
- React Router v7 for routing
- Tailwind CSS for styling
- MUI (Material-UI) components
- Axios for API calls
- react-hook-form + yup/zod for form validation
- Chart.js for data visualization

### Project Structure

```
src/
├── api/index.js         # Axios instances with auth interceptors
├── services/            # API service modules
│   ├── chat.service.js  # Legacy AI chat service
│   └── chatbot.service.js # Negotiation chatbot API client
├── hooks/               # Custom React hooks
│   └── chatbot/         # Chatbot-specific hooks (useDeal, useDealActions)
├── utils/               # Utilities (tokenStorage, permissions)
├── Layout/              # Page layouts (Auth, DashBoardLayout, ChatLayout)
├── components/          # UI components organized by feature
│   ├── LandingPages/    # Public landing page components
│   ├── Requisition/     # Requisition management (multi-step form)
│   ├── VendorForm/      # Vendor onboarding (multi-step form)
│   ├── SideBar/         # Navigation sidebar
│   ├── Graphs/          # Chart.js graph components
│   ├── vendor/          # Vendor-related views
│   ├── po/              # Purchase order management
│   ├── user/            # User management
│   ├── settings/        # User settings
│   ├── chat/            # AI negotiation chat (legacy)
│   └── chatbot/         # Negotiation chatbot components
│       └── chat/        # Chat UI (MessageBubble, Composer, ChatTranscript, etc.)
└── pages/               # Route-level page components
    └── chatbot/         # Chatbot pages (DealsPage, NegotiationRoom, NewDealPage)
```

### API Layer

Three axios instances in `src/api/index.js`:
- `api` - Unauthenticated requests
- `authApi` - Authenticated JSON requests (auto-adds Bearer token)
- `authMultiFormApi` - Authenticated multipart/form-data requests

All auth instances include:
- Automatic token refresh on 401 responses
- Request queuing during token refresh
- Redirect to `/sign-in` on auth failure

### Authentication

Tokens stored in localStorage via `src/utils/tokenStorage.js`:
- `%accessToken%` - JWT access token
- `%refreshToken%` - Refresh token

### Routing Structure

Key route groups in `src/App.jsx`:
- `/` - Public landing page
- `/sign-in`, `/sign-up`, `/forgot-password` - Auth flows (Auth layout)
- `/dashboard` - Main dashboard (DashBoardLayout)
- `/project-management` - Project CRUD
- `/requisition-management` - Requisitions with contract negotiation
- `/vendor-management` - Vendor CRUD
- `/po-management` - Purchase orders
- `/user-management` - Users and roles
- `/chat` - AI negotiation chat (ChatLayout - legacy)
- `/chatbot` - Negotiation chatbot (DashBoardLayout)
  - `/chatbot` - Deals list (DealsPage)
  - `/chatbot/deals/new` - Create new deal (NewDealPage)
  - `/chatbot/deals/:dealId` - Negotiation interface (NegotiationRoom)
- `/vendor-contract/:id` - Public vendor contract acceptance

### Forms

Multi-step forms use react-hook-form with step components:
- `AddRequisition` - Steps: BasicInformation → ProductDetails → VendorDetails → NegotiationParameters
- `AddVendor` - Steps: VendorBasicInformation → VendorGeneralInformation → VendorCurrencyDetails → VendorContactDetails → VendorBankDetails → VendorReview

### Fonts

Custom fonts: Montserrat (primary), Roboto (secondary) - configured in `tailwind.config.js`

## Integration Notes

### Vendor Portal Access

Vendors access the portal via email links sent by the backend:
- URL format: `/vendor?token={uniqueToken}`
- The `uniqueToken` is generated when a contract is created
- This token authenticates the vendor without requiring login

### Backend Integration

The frontend communicates with the Accordo backend (default: `http://localhost:8000`):
- Email notifications are sent from the backend when vendors are attached to requisitions
- Vendors receive links to both this portal and the AI Negotiation chatbot (`http://localhost:5173`)

## Negotiation Chatbot Module

### Overview

The Negotiation Chatbot is a utility-based AI decision engine for procurement negotiations. It operates in two modes:
- **INSIGHTS Mode** (Demo): Deterministic decision engine with utility scoring
- **CONVERSATION Mode**: LLM-driven conversational negotiation (future enhancement)

### File Structure

```
src/
├── services/chatbot.service.js          # API client (14 functions)
├── hooks/chatbot/
│   ├── useDeal.js                       # Simple deal management hook
│   ├── useDealActions.js                # Advanced hook with permissions
│   └── index.js                         # Barrel exports
├── components/chatbot/chat/
│   ├── ChatTranscript.jsx               # Message list with auto-scroll
│   ├── Composer.jsx                     # Input with scenario chips
│   ├── MessageBubble.jsx                # Role-based message display
│   ├── DecisionBadge.jsx                # Color-coded action badges
│   ├── OfferCard.jsx                    # Offer display card
│   └── index.js                         # Barrel exports
└── pages/chatbot/
    ├── DealsPage.jsx                    # Deal listing with filters
    ├── NewDealPage.jsx                  # Deal creation form
    └── NegotiationRoom.jsx              # Main negotiation interface
```

### API Service (`chatbot.service.js`)

All functions use `authApi` for authenticated requests to `/api/chatbot/*`:

**Deal Management**:
- `createDeal(data)` - Create new deal
- `listDeals(params)` - List deals with filters (status, mode, archived, deleted)
- `getDeal(dealId)` - Get deal + messages
- `getDealConfig(dealId)` - Get negotiation config

**Messaging**:
- `sendMessage(dealId, content, role)` - Send vendor/accordo message

**Lifecycle**:
- `resetDeal(dealId)` - Reset to round 0
- `archiveDeal(dealId)` - Archive deal
- `unarchiveDeal(dealId)` - Unarchive deal
- `softDeleteDeal(dealId)` - Soft delete (recoverable)
- `restoreDeal(dealId)` - Restore from deleted
- `permanentlyDeleteDeal(dealId)` - Hard delete

**Insights**:
- `getExplainability(dealId)` - Get negotiation audit trail

### Custom Hooks

**`useDealActions(dealId)`**:
Returns:
- `deal` - Deal object with status, round, title
- `messages` - Array of messages (VENDOR, ACCORDO, SYSTEM)
- `config` - Negotiation config (price params, terms, thresholds)
- `loading`, `error`, `sending` - Loading states
- `canNegotiate`, `canSend`, `canReset` - Permission flags
- `maxRounds` - Max negotiation rounds from config
- `sendVendorMessage(content)` - Send message as vendor
- `reset()` - Reset deal with confirmation
- `reload()` - Refresh deal data

**`useDeal(dealId)`**:
Simpler hook for basic operations (no config/permissions).

### Pages

**`DealsPage.jsx`** (`/chatbot`):
- Deal cards with status badges
- Filters: status, mode, archived, deleted
- Pagination (10 items per page)
- "New Deal" button → `/chatbot/deals/new`
- Click card → `/chatbot/deals/:dealId`

**`NewDealPage.jsx`** (`/chatbot/deals/new`):
- Form fields: title, counterparty, mode (CONVERSATION/INSIGHTS)
- Auto-navigates to deal after creation
- Cancel button → back to deals list

**`NegotiationRoom.jsx`** (`/chatbot/deals/:dealId`):
- **Header**: Deal title, status badge, round counter, Refresh/Reset buttons
- **Main area**: ChatTranscript + Composer
- **Sidebar**: Negotiation config display
  - Price parameters (target, min, max)
  - Payment terms (ideal, acceptable)
  - Thresholds (accept_threshold, walkaway_threshold)
  - Max rounds

### Components

**`MessageBubble.jsx`**:
- Vendor messages: left-aligned, white background
- Accordo messages: right-aligned, blue background
- Shows decision metadata (action, utility score, round)
- "Show more" for long messages (>300 chars)

**`DecisionBadge.jsx`**:
Color-coded action badges:
- ACCEPT → Green
- COUNTER → Blue
- WALK_AWAY → Red
- ESCALATE → Orange
- ASK_CLARIFY → Yellow

**`Composer.jsx`**:
- Text input with send button
- Scenario chips: HARD, SOFT, WALK_AWAY
- Pre-written message templates per scenario
- Disabled when deal is not NEGOTIATING

**`ChatTranscript.jsx`**:
- Auto-scroll to latest message
- Round dividers between negotiation rounds
- Processing indicator (animated dots)
- Empty state when no messages
- Message grouping (consecutive same-role messages)

### Deal Statuses

- `NEGOTIATING` - Active negotiation
- `ACCEPTED` - Vendor accepted final offer
- `WALKED_AWAY` - Accordo walked away (utility too low)
- `ESCALATED` - Max rounds exceeded

### Integration Points

**Authentication**:
- All API calls use `authApi` with automatic Bearer token
- Token refresh on 401 (transparent to user)

**Navigation**:
- Sidebar item: "Negotiation Chatbot" (no permission required)
- Nested under `DashBoardLayout` for consistent UI

**Error Handling**:
- Toast notifications via `react-hot-toast`
- Error states in hooks and components
- Graceful degradation on config load failure

### Backend API Endpoints

All endpoints under `/api/chatbot/`:

```
GET    /deals                    # List deals (query: status, mode, archived, deleted, page, limit)
POST   /deals                    # Create deal (body: title, counterparty, mode)
GET    /deals/:dealId            # Get deal + messages
GET    /deals/:dealId/config     # Get negotiation config
POST   /deals/:dealId/messages   # Send message (body: content, role)
POST   /deals/:dealId/reset      # Reset deal
POST   /deals/:dealId/archive    # Archive deal
POST   /deals/:dealId/unarchive  # Unarchive deal
POST   /deals/:dealId/soft-delete # Soft delete
POST   /deals/:dealId/restore    # Restore from deleted
DELETE /deals/:dealId/permanent  # Permanent delete
GET    /deals/:dealId/explainability # Get audit trail
```

### Styling

Uses Tailwind CSS throughout:
- Responsive layout (mobile-first)
- Color palette: blue-50/100/500 (Accordo), gray-50/100/200 (neutral), green/red/yellow (status)
- Consistent spacing: p-4, px-6, py-2, etc.
- Focus states: `focus:ring-2 focus:ring-blue-500`

## UI/UX Design Standards

### Layout Architecture

**Global Scrolling Pattern** (Updated January 2026):
- All pages use natural page-level scrolling instead of viewport-locked containers
- Root element (`index.css`): `overflow: auto` allows full-page scrolling
- Layout containers: `min-h-screen` instead of `h-screen` to allow content to grow
- Main content areas: No `overflow-y-auto` or `overflow-hidden` - let browser handle scrolling naturally

**Sticky Header Pattern**:
All management screens follow this consistent pattern:
```tsx
<div className="flex flex-col min-h-full">
  {/* Sticky Header */}
  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
    {/* Back button, title, actions */}
  </div>

  {/* Scrollable Content */}
  <div className="flex-1 px-6 pb-6">
    {/* Page content */}
  </div>
</div>
```

**Standard Header Padding**:
- Top padding: `pt-6` (1.5rem / 24px)
- Bottom padding: `pb-4` (1rem / 16px)
- Horizontal padding: `px-6` (1.5rem / 24px) or `px-8 xl:px-16` for wider screens
- This ensures consistent header height and visual rhythm across all screens

**Layout Components**:
- `DashBoardLayout`: Uses `min-h-screen` for natural page growth, main content uses `min-h-full`
- `ChatLayout`: Uses `min-h-screen` for natural page growth, main content uses `min-h-full`
- `Auth`: Uses `min-h-screen` for authentication pages

### Page Component Standards

All page components (VendorManagement, ProjectManagement, PoManagement, AddVendor, AddRequisition, NegotiationRoom, etc.) follow:
1. **Outer container**: `flex flex-col min-h-full` - allows vertical layout with natural height
2. **Sticky header**: `sticky top-0 z-10 bg-white border-b pt-6 pb-4 px-6 flex-shrink-0`
3. **Content area**: `flex-1 px-6 pb-6` - grows to fill space, no overflow constraints

**Dark Mode Support**:
- Headers: `bg-white dark:bg-dark-surface`
- Borders: `border-gray-200 dark:border-dark-border`
- Text: `text-gray-900 dark:text-dark-text`
- Secondary text: `text-gray-600 dark:text-dark-text-secondary`

### Negotiation Chatbot UI Standards

**NegotiationRoom Header** (`src/pages/chatbot/NegotiationRoom.tsx`):
- Active negotiation header (line 353): `sticky top-0 z-10 bg-white dark:bg-dark-surface border-b px-6 pt-6 pb-4`
- Completed deal header (line 252): Same padding for consistency
- Three-section layout: Back button (left), Title + Status (center), Actions (right)

**NewDealPage Header** (`src/pages/chatbot/NewDealPage.tsx`):
- Sticky header with consistent `pt-6 pb-4` padding
- Structured layout with dedicated header section separate from form content
- White background to differentiate from gray content area

### Testing

Manual testing checklist:
- [ ] Create new deal
- [ ] Send vendor messages
- [ ] View decision badges and utility scores
- [ ] Reset deal (should go back to round 0)
- [ ] Filter deals by status/mode
- [ ] Archive/unarchive deals
- [ ] Soft delete/restore deals
- [ ] Navigate between deals list and negotiation room

### Future Enhancements

- Conversation mode with LLM integration
- Vendor auto-reply (simulated vendor)
- Explainability modal/drawer
- Deal summary page with outcome analysis
- Archived/deleted deals pages
- Real-time WebSocket updates
- Deal export (PDF/CSV)
- Deal cloning
