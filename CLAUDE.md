# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 5001
npm run build        # Production build (tsc + vite, outputs to dist/)
npm run type-check   # TypeScript type checking without emit
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Testing

```bash
npm run test              # Run all tests with Vitest
npm run test:ui           # Run tests with Vitest UI
npm run test:coverage     # Run tests with coverage report
npx vitest path/to/file   # Run a single test file
npx vitest -t "test name" # Run tests matching a pattern
```

Tests use Vitest with jsdom environment. Test files are in `tests/` directory. Coverage thresholds are set to 80% for lines, functions, branches, and statements.

### Docker

```bash
docker build -t accordo-frontend .
docker run -p 5001:5001 accordo-frontend
```

## Environment Setup

Create `.env.local` with:
```env
VITE_BACKEND_URL=http://localhost:5002
VITE_FRONTEND_URL=http://localhost:5001
VITE_ASSEST_URL=http://localhost:5002
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5001
```

The dev server proxies `/api` requests to `VITE_BACKEND_URL`.

### Port Configuration (January 2026)

All services are configured to run on sequential ports starting from 5001:

> **Note**: Port 5000 is reserved by macOS AirPlay Receiver. Frontend uses port 5001.

| Service | Port | Environment Variable | Description |
|---------|------|---------------------|-------------|
| Frontend | 5001 | `VITE_DEV_PORT` | React/Vite frontend application |
| Backend API | 5002 | `PORT` | Express.js backend server |
| Embedding Service | 5003 | `EMBEDDING_SERVICE_PORT` | Python FastAPI embedding service |
| MailHog SMTP | 5004 | `SENDMAIL_DEV_PORT` | Email testing SMTP server |
| MailHog Web UI | 5005 | `MAILHOG_WEB_PORT` | Email testing web interface |

## Architecture

### Tech Stack
- React 19 + Vite + TypeScript
- React Router v7 for routing
- Tailwind CSS for styling
- MUI (Material-UI) v6 components
- Axios for API calls
- react-hook-form + yup/zod for form validation
- Chart.js for data visualization
- react-hot-toast for notifications

### Path Aliases

The `@/` alias resolves to `./src/` (configured in vitest.config.ts for tests).

### Project Structure

```
src/
├── api/index.ts             # Axios instances with auth interceptors
├── services/                # API service modules
│   ├── chat.service.ts      # Legacy AI chat service
│   ├── chatbot.service.ts   # Negotiation chatbot API client (47+ methods)
│   ├── bidAnalysis.service.ts # Bid comparison API client
│   └── export.service.ts    # PDF/CSV export utilities
├── hooks/                   # Custom React hooks
│   └── chatbot/             # Chatbot-specific hooks
│       ├── useDealActions.ts    # Advanced hook with permissions & utility
│       ├── useConversation.ts   # Conversation mode hook
│       └── useHistoryTracking.ts # Deal history tracking
├── types/                   # TypeScript type definitions
│   ├── chatbot.ts           # Comprehensive chatbot types (900+ lines)
│   └── index.ts             # Barrel exports
├── utils/                   # Utilities (tokenStorage, permissions, scenarioGenerator)
├── Layout/                  # Page layouts (Auth, DashBoardLayout, ChatLayout)
├── components/              # UI components organized by feature
│   ├── LandingPages/        # Public landing page components
│   ├── Requisition/         # Requisition management (multi-step form)
│   ├── VendorForm/          # Vendor onboarding (multi-step form)
│   ├── SideBar/             # Navigation sidebar
│   ├── Graphs/              # Chart.js graph components
│   ├── vendor/              # Vendor-related views
│   ├── po/                  # Purchase order management
│   ├── user/                # User management
│   ├── settings/            # User settings
│   ├── chat/                # AI negotiation chat (legacy)
│   └── chatbot/             # Negotiation chatbot components
│       ├── chat/            # Chat UI (MessageBubble, Composer, ChatTranscript, etc.)
│       ├── common/          # Shared components (ConfirmDialog, ArchiveFilterDropdown)
│       ├── deal-wizard/     # Multi-step deal creation wizard
│       ├── requisition-view/ # Requisition-based deal views
│       └── sidebar/         # Utility sidebar components
└── pages/                   # Route-level page components
    └── chatbot/             # Chatbot pages
        ├── RequisitionListPage.tsx      # Main requisition list
        ├── RequisitionDealsPage.tsx     # Deals for a requisition
        ├── NewDealPage.tsx              # 4-step deal creation wizard
        ├── NegotiationRoom.tsx          # Main negotiation interface
        ├── ArchivedRequisitionsPage.tsx # Archived requisitions
        └── ArchivedDealsForRequisitionPage.tsx # Archived deals
```

### API Layer

Three axios instances in `src/api/index.ts`:
- `api` - Unauthenticated requests
- `authApi` - Authenticated JSON requests (auto-adds Bearer token)
- `authMultiFormApi` - Authenticated multipart/form-data requests

All auth instances include:
- Automatic token refresh on 401 responses
- Request queuing during token refresh
- Redirect to `/sign-in` on auth failure

### Authentication

Tokens stored in localStorage via `src/utils/tokenStorage.ts`:
- `%accessToken%` - JWT access token
- `%refreshToken%` - Refresh token

### Routing Structure

Key route groups in `src/App.tsx`:
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
  - `/chatbot` - Requisition list (RequisitionListPage)
  - `/chatbot/requisitions/:rfqId` - Deals for requisition (RequisitionDealsPage)
  - `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/new` - Create deal (NewDealPage)
  - `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId` - Negotiation (NegotiationRoom)
  - `/chatbot/archived` - Archived requisitions
  - `/chatbot/requisitions/:rfqId/archived` - Archived deals for requisition
- `/vendor-contract/:id` - Public vendor contract acceptance

### Forms

Multi-step forms use react-hook-form with step components:
- `AddRequisition` - Steps: BasicInformation -> ProductDetails -> VendorDetails -> NegotiationParameters
- `AddVendor` - Steps: VendorBasicInformation -> VendorGeneralInformation -> VendorCurrencyDetails -> VendorContactDetails -> VendorBankDetails -> VendorReview

### Fonts

Custom fonts: Montserrat (primary), Roboto (secondary) - configured in `tailwind.config.js`

## Integration Notes

### Vendor Portal Access

Vendors access the portal via email links sent by the backend:
- URL format: `/vendor?token={uniqueToken}`
- The `uniqueToken` is generated when a contract is created
- This token authenticates the vendor without requiring login

### Backend Integration

The frontend communicates with the Accordo backend (default: `http://localhost:5002`):
- Email notifications are sent from the backend when vendors are attached to requisitions
- Vendors receive links to both this portal and the AI Negotiation chatbot

## Negotiation Chatbot Module (January 2026 Refactor)

### Overview

The Negotiation Chatbot is a utility-based AI decision engine for procurement negotiations. It now operates with a requisition-centric architecture:

**Key Changes (January 2026)**:
- Requisition-based navigation: Browse requisitions -> Select vendor -> Create/view deals
- Nested URL structure: `/api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId`
- 4-step deal creation wizard with comprehensive negotiation parameters
- Weighted utility scoring with parameter-level breakdown
- Archive/unarchive functionality at both requisition and deal levels

### Two Negotiation Modes

- **INSIGHTS Mode**: Deterministic decision engine with utility scoring (default)
- **CONVERSATION Mode**: LLM-driven conversational negotiation

### API Service (`chatbot.service.ts`)

All functions use `authApi` for authenticated requests with nested URL structure:

**URL Helpers**:
```typescript
buildDealUrl(rfqId, vendorId, dealId?, suffix?);  // Builds nested deal URLs
buildDraftUrl(rfqId, vendorId, draftId?);         // Builds nested draft URLs
```

**Requisition Views**:
- `getRequisitionsWithDeals(params)` - List requisitions with deal stats
- `getRequisitionsForNegotiation()` - Get available requisitions
- `getRequisitionDeals(rfqId, params)` - Get all deals for requisition
- `getRequisitionVendors(rfqId)` - Get vendors attached to requisition
- `archiveRequisition(rfqId)` - Archive requisition (cascades to deals)
- `unarchiveRequisition(rfqId)` - Unarchive requisition

**Smart Defaults & Drafts**:
- `getSmartDefaults(rfqId, vendorId)` - AI-suggested negotiation defaults
- `saveDraft(rfqId, vendorId, data)` - Auto-save deal draft
- `getDrafts(rfqId, vendorId)` - List user's drafts
- `deleteDraft(rfqId, vendorId, draftId)` - Delete draft

**Deal Management (Nested URLs)**:
- `listDeals(rfqId, vendorId, params)` - List deals for RFQ+Vendor
- `createDealWithConfig(rfqId, vendorId, data)` - Create deal with full config
- `getDeal(ctx)` - Get deal + messages
- `getDealConfig(ctx)` - Get negotiation config
- `getDealUtility(ctx)` - Get weighted utility breakdown
- `getDealSummary(ctx)` - Get deal summary for modal

**Messaging (Unified for both modes)**:
- `sendMessage(ctx, content, role, mode)` - Send message (INSIGHTS or CONVERSATION)
- `startConversation(ctx)` - Start conversation mode
- `getSuggestedCounters(ctx)` - Get AI-generated response suggestions

**Deal Lifecycle**:
- `resetDeal(ctx)` - Reset deal to round 0
- `archiveDeal(ctx)` - Archive deal
- `unarchiveDeal(ctx)` - Unarchive deal
- `retryDealEmail(ctx)` - Retry sending vendor notification

**Vendor Simulation**:
- `generateVendorMessage(ctx, scenario)` - Simulate vendor response
- `runDemo(ctx, scenarioType)` - Run full demo scenario

### DealContext Type

All deal operations require a context object:
```typescript
interface DealContext {
  rfqId: number;
  vendorId: number;
  dealId: string;
}
```

### Custom Hooks

**`useDealActions(rfqId, vendorId, dealId)`**:
Returns:
- `deal` - Deal object with status, round, title
- `messages` - Array of messages (VENDOR, ACCORDO, SYSTEM)
- `config` - Negotiation config (parameters, thresholds, weights)
- `utility` - Weighted utility breakdown with recommendations
- `loading`, `error`, `sending` - Loading states
- `canNegotiate`, `canSend`, `canReset` - Permission flags
- `maxRounds` - Max negotiation rounds from config
- `sendVendorMessage(content)` - Send message as vendor
- `reset()` - Reset deal with confirmation
- `reload()` - Refresh deal data

**`useConversation(dealContext)`**:
Conversation mode specific hook with:
- LLM-driven response handling
- Reveal offer tracking
- Turn counting

### Pages

**`RequisitionListPage.tsx`** (`/chatbot`):
- Requisition cards with deal statistics
- Archive filter (active/archived/all)
- Search by RFQ number or title
- Click card -> `/chatbot/requisitions/:rfqId`

**`RequisitionDealsPage.tsx`** (`/chatbot/requisitions/:rfqId`):
- Vendor deal cards with status and progress
- Status filter (all/negotiating/accepted/walked_away/escalated)
- Archive filter for deals
- "Start Negotiation" button -> `/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/new`

**`NewDealPage.tsx`** (`/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/new`):
4-step wizard:
1. **Step 1 - Basic Info**: Mode selection, priority
2. **Step 2 - Commercial**: Price targets, payment terms, delivery
3. **Step 3 - Contract/SLA**: Warranty, penalties, quality standards
4. **Step 4 - Weights**: Parameter importance weights (must sum to 100)
5. **Review**: Final review before creation

**`NegotiationRoom.tsx`** (`/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId`):
- **Header**: Back button, deal title/status, round counter, actions
- **Main area**: ChatTranscript + Composer
- **Sidebar**: Weighted utility breakdown, parameter details, thresholds
- Supports both INSIGHTS and CONVERSATION modes

### Components

**`MessageBubble.tsx`**:
- Vendor messages: left-aligned, white background
- Accordo messages: right-aligned, blue background
- Shows decision metadata (action, utility score, round)
- "Show more" for long messages (>300 chars)

**`DecisionBadge.tsx`**:
Color-coded action badges:
- ACCEPT -> Green
- COUNTER -> Blue
- WALK_AWAY -> Red
- ESCALATE -> Orange
- ASK_CLARIFY -> Yellow

**`Composer.tsx`**:
- Text input with send button
- AI-suggested response chips (Strong Position, Balanced Offer, Flexible Offer)
- Pre-written message templates per scenario with **VENDOR PERSPECTIVE** pricing
- Interactive emphasis chips for filtering suggestions by priority (price/terms/delivery)
- Disabled when deal is not NEGOTIATING

### Quick Offers - Vendor Perspective Pricing (January 2026)

All Quick Offers in the Composer use **vendor perspective** pricing - vendors want HIGHER prices (profit maximization).

**Scenario Pricing Logic** (`src/utils/scenarioGenerator.ts`):

| Scenario | Label | Price Calculation | Vendor Strategy |
|----------|-------|-------------------|-----------------|
| **HARD** | Strong Position | 15% above PM's max price | Maximum profit, aggressive stance |
| **MEDIUM** | Balanced Offer | 75% of range from target to max | Fair middle ground |
| **SOFT** | Flexible Offer | 25% of range from target to max | Quick close, near PM's target |

**Example** (Target=$90, Max=$100):
- Strong Position (HARD): ~$115 (15% above max)
- Balanced Offer (MEDIUM): ~$97.50 (75% of range)
- Flexible Offer (SOFT): ~$92.50 (25% of range)

**Payment Terms** (vendor prefers shorter terms = faster cash flow):
- HARD: Shortest terms (Net 30) - best for vendor
- MEDIUM: Average terms
- SOFT: Longest terms (Net 60) - more flexible for buyer

**Key Functions**:
- `generateScenarioMessages()` - Main scenario generator with vendor perspective
- `generateEmphasisAwareFallback()` - Instant fallback for emphasis-filtered suggestions
- `generateVendorFallbackScenarios()` - Vendor mode specific fallback

**`ChatTranscript.tsx`**:
- Smart auto-scroll (only when user near bottom)
- Round dividers between negotiation rounds
- Processing indicator (animated dots)
- Message grouping (consecutive same-role messages)

**`WeightedUtilityBar.tsx`**:
- Parameter-level utility breakdown
- Color-coded status (excellent/good/warning/critical)
- Progress bars with weight percentages
- Threshold zone visualization

### Deal Statuses

- `NEGOTIATING` - Active negotiation
- `ACCEPTED` - Vendor accepted final offer
- `WALKED_AWAY` - Accordo walked away (utility too low)
- `ESCALATED` - Max rounds exceeded

### Deal Wizard Types

```typescript
interface DealWizardFormData {
  stepOne: {
    requisitionId: number | null;
    vendorId: number | null;
    title: string;
    mode: 'INSIGHTS' | 'CONVERSATION';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  stepTwo: {
    priceQuantity: { targetUnitPrice, maxAcceptablePrice, minOrderQuantity, ... };
    paymentTerms: { minDays, maxDays, advancePaymentLimit, acceptedMethods };
    delivery: { requiredDate, preferredDate, locationId, partialDelivery };
  };
  stepThree: {
    contractSla: { warrantyPeriod, defectLiabilityMonths, lateDeliveryPenaltyPerDay, ... };
    negotiationControl: { deadline, maxRounds, walkawayThreshold };
    customParameters: CustomParameter[];
  };
  stepFour: {
    weights: ParameterWeight[];
    aiSuggested: boolean;
    totalWeight: number; // Must equal 100
  };
}
```

### Integration Points

**Authentication**:
- All API calls use `authApi` with automatic Bearer token
- Token refresh on 401 (transparent to user)

**Navigation**:
- Sidebar item: "AI Negotiation" -> `/chatbot`
- Nested under `DashBoardLayout` for consistent UI

**Error Handling**:
- Toast notifications via `react-hot-toast`
- ChatErrorBoundary for graceful degradation
- Error states in hooks and components

### Backend API Endpoints

All endpoints under `/api/chatbot/`:

**Requisition Views**:
```
GET    /requisitions                    # List requisitions with deal stats
GET    /requisitions/for-negotiation    # Available requisitions
GET    /requisitions/:rfqId/deals       # All deals for requisition
GET    /requisitions/:rfqId/vendors     # Vendors for requisition
POST   /requisitions/:rfqId/archive     # Archive requisition
POST   /requisitions/:rfqId/unarchive   # Unarchive requisition
```

**Deal Operations (Nested)**:
```
GET    /requisitions/:rfqId/vendors/:vendorId/deals                    # List deals
POST   /requisitions/:rfqId/vendors/:vendorId/deals                    # Create deal
GET    /requisitions/:rfqId/vendors/:vendorId/deals/:dealId            # Get deal
GET    /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/config     # Get config
GET    /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/utility    # Get utility
GET    /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/summary    # Get summary
POST   /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/messages   # Send message
POST   /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/reset      # Reset deal
POST   /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/archive    # Archive
POST   /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/unarchive  # Unarchive
POST   /requisitions/:rfqId/vendors/:vendorId/deals/:dealId/simulate   # Vendor sim
```

**Smart Defaults & Drafts**:
```
GET    /requisitions/:rfqId/vendors/:vendorId/smart-defaults   # Get defaults
POST   /requisitions/:rfqId/vendors/:vendorId/drafts           # Save draft
GET    /requisitions/:rfqId/vendors/:vendorId/drafts           # List drafts
DELETE /requisitions/:rfqId/vendors/:vendorId/drafts/:draftId  # Delete draft
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

All page components follow:
1. **Outer container**: `flex flex-col min-h-full` - allows vertical layout with natural height
2. **Sticky header**: `sticky top-0 z-10 bg-white border-b pt-6 pb-4 px-6 flex-shrink-0`
3. **Content area**: `flex-1 px-6 pb-6` - grows to fill space, no overflow constraints

**Dark Mode Support**:
- Headers: `bg-white dark:bg-dark-surface`
- Borders: `border-gray-200 dark:border-dark-border`
- Text: `text-gray-900 dark:text-dark-text`
- Secondary text: `text-gray-600 dark:text-dark-text-secondary`

### NegotiationRoom Layout (January 2026)

**Viewport-Locked Layout** - Slack/Discord Style:
The NegotiationRoom uses a fixed-viewport layout where the entire viewport IS the app.

```tsx
<div className="flex flex-col h-screen overflow-hidden bg-gray-100">
  {/* Fixed Header - Always visible */}
  <div className="flex-shrink-0 bg-white border-b px-6 py-4">
    {/* Back button, Deal title/status, Actions */}
  </div>

  {/* Main Content - Flex container */}
  <div className="flex-1 flex overflow-hidden">
    {/* Chat Column - Independently scrollable */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages - Scrollable area */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <ChatTranscript messages={messages} isProcessing={sending} />
      </div>

      {/* Composer - Fixed at bottom */}
      <div className="flex-shrink-0">
        <Composer onSend={handleSend} ... />
      </div>
    </div>

    {/* Sidebar - Fixed width, independently scrollable */}
    <div className="w-80 bg-white border-l flex-shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Utility breakdown, config display */}
      </div>
    </div>
  </div>
</div>
```

**Key CSS Classes**:
- `h-screen` - Full viewport height (100vh)
- `overflow-hidden` - Prevents page scrolling
- `flex-1` - Takes remaining space
- `flex-shrink-0` - Prevents shrinking (header, composer)
- `overflow-y-auto` - Independent vertical scrolling (messages, sidebar)

### Chat Component Features (January 2026)

**Smart Auto-Scroll** (`ChatTranscript.tsx`):
```tsx
const [isNearBottom, setIsNearBottom] = useState(true);

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  setIsNearBottom(distanceFromBottom < 100);
};

useEffect(() => {
  if (isNearBottom && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, isProcessing, isNearBottom]);
```

**Behavior**:
- User scrolls up to read old messages -> no auto-scroll interference
- User stays near bottom -> smooth auto-scroll to new messages
- 100px threshold for "near bottom" detection

## Bid Analysis Module (January 2026)

### Overview

The Bid Analysis module provides comprehensive vendor bid comparison and selection functionality. It allows procurement managers to compare bids across vendors for a requisition and select winning vendors.

### File Structure

```
src/
├── services/bidAnalysis.service.ts    # API client for bid analysis
├── types/bidAnalysis.ts               # TypeScript types
├── hooks/bidAnalysis/
│   └── useBidAnalysis.ts              # Data fetching hook
├── components/BidAnalysis/
│   ├── BidComparisonTable.tsx         # Comparison table with charts
│   ├── VendorBidCard.tsx              # Individual vendor bid card
│   └── WinnerSelectionModal.tsx       # Winner selection dialog
└── pages/BidAnalysis/
    ├── BidAnalysisListPage.tsx        # Requisitions with bids
    └── BidComparisonPage.tsx          # Detailed comparison view
```

### API Service (`bidAnalysis.service.ts`)

- `getRequisitionsWithBids(params)` - List requisitions with bid statistics
- `getBidComparison(rfqId)` - Get bid comparison for a requisition
- `getVendorBids(rfqId)` - Get all vendor bids for requisition
- `selectWinner(rfqId, bidId, data)` - Select winning vendor
- `downloadPdfReport(rfqId)` - Download PDF comparison report

### Routes

- `/bid-analysis` - Requisitions with bid analysis
- `/bid-analysis/:rfqId` - Detailed bid comparison view
