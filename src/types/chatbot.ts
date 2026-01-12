/**
 * Chatbot-specific type definitions
 *
 * Types for the negotiation chatbot module, including deals, messages,
 * negotiation config, and conversation state.
 */

// ============================================================================
// Deal Types
// ============================================================================

export type DealStatus = 'NEGOTIATING' | 'ACCEPTED' | 'WALKED_AWAY' | 'ESCALATED';
export type DealMode = 'INSIGHTS' | 'CONVERSATION';

export interface Deal {
  id: string;
  title: string;
  counterparty: string | null;
  status: DealStatus;
  round: number;
  mode: DealMode;
  latestOfferJson: Offer | null;
  latestVendorOffer: Offer | null;
  latestDecisionAction: DecisionAction | null;
  latestUtility: number | null;
  convoStateJson: ConversationState | null;
  templateId: string | null;
  requisitionId: number | null;
  contractId: number | null;
  userId: number | null;
  vendorId: number | null;
  archivedAt: string | null;
  deletedAt: string | null;
  lastAccessed: string | null;
  lastMessageAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealInput {
  title: string;
  counterparty?: string;
  mode?: DealMode;
  templateId?: string;
  requisitionId?: number;
  contractId?: number;
  vendorId?: number;
}

export interface ListDealsParams {
  status?: DealStatus;
  mode?: DealMode;
  archived?: boolean;
  deleted?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'VENDOR' | 'ACCORDO' | 'SYSTEM';
export type DecisionAction = 'ACCEPT' | 'COUNTER' | 'WALK_AWAY' | 'ESCALATE' | 'ASK_CLARIFY';

export interface Message {
  id: string;
  dealId: string;
  role: MessageRole;
  content: string;
  extractedOffer: Offer | null;
  engineDecision: Decision | null;
  decisionAction: DecisionAction | null;
  utilityScore: number | null;
  counterOffer: Offer | null;
  explainabilityJson: Explainability | null;
  createdAt: string;
}

export interface SendMessageInput {
  content: string;
  role?: MessageRole;
}

// ============================================================================
// Offer Types
// ============================================================================

export interface Offer {
  unit_price: number | null;
  payment_terms: string | null;
  meta?: {
    raw_terms_days?: number;
    non_standard_terms?: boolean;
  };
}

// ============================================================================
// Decision Engine Types
// ============================================================================

export interface Decision {
  action: DecisionAction;
  reasons: string[];
  counterOffer?: Offer | null;
  utilityScore?: number;
}

export interface Explainability {
  vendorOffer: Offer;
  utilities: {
    priceUtility: number | null;
    termsUtility: number | null;
    weightedPrice: number | null;
    weightedTerms: number | null;
    total: number | null;
  };
  decision: Decision;
  configSnapshot: {
    weights: { price: number; terms: number };
    thresholds: { accept: number; walkaway: number };
    unitPrice: { anchor: number; target: number; max: number; step: number };
    termOptions: string[];
  };
}

// ============================================================================
// Negotiation Config Types
// ============================================================================

export type PriceDirection = 'lower_better' | 'higher_better';
export type PaymentTermOption = 'Net 30' | 'Net 60' | 'Net 90';

export interface NegotiationConfig {
  parameters: {
    unit_price: {
      weight: number;
      direction: PriceDirection;
      anchor: number;
      target: number;
      max_acceptable: number;
      concession_step: number;
    };
    payment_terms: {
      weight: number;
      options: readonly PaymentTermOption[];
      utility: {
        'Net 30': number;
        'Net 60': number;
        'Net 90': number;
      };
    };
  };
  accept_threshold: number;
  walkaway_threshold: number;
  max_rounds: number;
}

// ============================================================================
// Conversation State Types
// ============================================================================

export type ConversationPhase = 'WAITING_FOR_OFFER' | 'NEGOTIATING' | 'TERMINAL';
export type ConversationIntent =
  | 'GREET'
  | 'ASK_FOR_OFFER'
  | 'SMALL_TALK'
  | 'ASK_CLARIFY'
  | 'PROVIDE_OFFER'
  | 'REFUSAL'
  | 'UNKNOWN';

export type RefusalType = 'NO' | 'LATER' | 'ALREADY_SHARED' | 'CONFUSED';

export interface ConversationState {
  phase: ConversationPhase;
  lastVendorOffer: Offer | null;
  pendingCounter: Offer | null;
  refusalCount: number;
  turnCount: number;
  greetingSent: boolean;
}

export interface ConversationMessageResponse {
  vendorMessage: Message;
  accordoMessage: Message;
  conversationState: ConversationState;
  revealAvailable: boolean;
}

// ============================================================================
// Template Types
// ============================================================================

export interface NegotiationTemplate {
  id: string;
  name: string;
  description: string | null;
  config: NegotiationConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  config: NegotiationConfig;
  isDefault?: boolean;
}

// ============================================================================
// Demo Scenario Types
// ============================================================================

export type DemoScenarioType = 'HARD' | 'SOFT' | 'WALK_AWAY';

export interface DemoScenario {
  type: DemoScenarioType;
  label: string;
  description: string;
  messages: string[];
}

// ============================================================================
// Vendor Policy Types (for vendor simulation)
// ============================================================================

export type VendorPolicyType = 'HARD' | 'SOFT' | 'WALK_AWAY';

export interface VendorPolicy {
  type: VendorPolicyType;
  minPrice: number;
  targetPrice: number;
  preferredTerms: PaymentTermOption;
  flexibility: number; // 0-1 scale
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ListDealsResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data?: Deal[]; // Backend returns both 'deals' and 'data' in some cases
}

export interface GetDealResponse {
  deal: Deal;
  messages: Message[];
}

export interface SendMessageResponse {
  deal: Deal;
  messages: Message[];
  decision?: Decision;
  reply?: string;
}

export interface RunDemoResponse {
  deal: Deal;
  messages: Message[];
  steps: Array<{
    vendorMessage: Message;
    accordoMessage: Message;
  }>;
}

export interface ConversationStartResponse {
  deal: Deal;
  messages: Message[];
  revealAvailable: boolean;
}

// ============================================================================
// Component Props Types (used by chatbot components)
// ============================================================================

export interface ChatTranscriptProps {
  messages: Message[];
  loading?: boolean;
  sending?: boolean;
  isProcessing?: boolean;
  MessageComponent?: React.ComponentType<any>;
}

export interface MessageBubbleProps {
  message: Message;
}

export interface ComposerProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  sending?: boolean;
  inputText?: string;
  onInputChange?: (text: string) => void;
  dealStatus?: string;
  canSend?: boolean;
  placeholder?: string;
  showScenarios?: boolean;
}

export interface DecisionBadgeProps {
  action: DecisionAction;
  size?: 'sm' | 'md' | 'lg';
}

export interface OfferCardProps {
  offer: Offer;
  title?: string;
}

export interface OutcomeBannerProps {
  status: DealStatus;
  finalOffer?: Offer;
  finalUtility?: number;
}

export interface ExplainabilityPanelProps {
  explainability: Explainability;
  isOpen: boolean;
  onClose: () => void;
}

export interface NegotiationConfigPanelProps {
  config: NegotiationConfig;
}

export interface DealCardProps {
  deal: Deal;
  onClick?: (dealId: string) => void;
}

export interface DealFiltersProps {
  filters: ListDealsParams;
  onFilterChange: (filters: ListDealsParams) => void;
}
