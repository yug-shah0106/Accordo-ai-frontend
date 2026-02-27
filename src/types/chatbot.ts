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
export type ArchiveFilter = 'active' | 'archived' | 'all';

/**
 * Context for deal operations - required for nested URL construction
 * All deal-related API calls require rfqId, vendorId, and dealId
 * to construct the proper nested URL path
 */
export interface DealContext {
  rfqId: number;
  vendorId: number;
  dealId: string;
}

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
  round: number | null;  // Which negotiation round this message belongs to
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
  total_price: number | null;
  payment_terms: string | null;
  delivery_date?: string | null;
  delivery_days?: number | null;
  meta?: {
    raw_terms_days?: number;
    non_standard_terms?: boolean;
  };
  // Legacy support - kept for backwards compatibility
  unit_price?: number | null;
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
    totalPrice: { anchor: number; target: number; max: number; step: number };
    termOptions: string[];
  };
}

// ============================================================================
// Behavioral Analysis Types (Adaptive Negotiation Engine - February 2026)
// ============================================================================

/**
 * Behavioral analysis data from the adaptive negotiation engine.
 * Returned by the /behavioral API endpoint.
 */
export interface BehavioralData {
  /** Composite momentum score: -1 (losing) to +1 (winning) */
  momentum: number;
  /** Current adaptive strategy label */
  strategy: 'Holding Firm' | 'Accelerating' | 'Matching Pace' | 'Final Push' | string;
  /** % gap reduction per round (positive = converging) */
  convergenceRate: number;
  /** Average price concession per round ($/round) */
  concessionVelocity: number;
  /** Same/similar offers for 2+ rounds */
  isStalling: boolean;
  /** Gap shrinking consistently */
  isConverging: boolean;
  /** Gap growing */
  isDiverging: boolean;
  /** Latest detected sentiment */
  latestSentiment: 'positive' | 'neutral' | 'resistant' | 'urgent' | string;
  /** Per-round history for convergence chart */
  roundHistory: Array<{
    round: number;
    vendorPrice: number | null;
    pmCounter: number | null;
    gap: number | null;
    utility: number | null;
  }>;
  /** Dynamic rounds info (null if not enabled) */
  dynamicRounds: {
    softMax: number;
    hardMax: number;
    currentRound: number;
    extendLikely: boolean;
    reason: string;
  } | null;
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

/**
 * WizardConfig - Full configuration from deal creation wizard
 * Stored in negotiationConfigJson.wizardConfig when deal is created via wizard
 */
export interface WizardConfig {
  priority: NegotiationPriority;
  priceQuantity: {
    targetUnitPrice: number;
    maxAcceptablePrice: number;
    minOrderQuantity: number;
    preferredQuantity?: number;
  };
  paymentTerms: {
    minDays: number;
    maxDays: number;
    acceptedMethods?: PaymentMethod[];
  };
  delivery: {
    requiredDate: string;
    preferredDate?: string;
    locationId?: number;
    locationAddress?: string;
    partialDelivery: {
      allowed: boolean;
      type?: PartialDeliveryType;
      minValue?: number;
    };
  };
  contractSla: {
    warrantyPeriod: WarrantyPeriod;
    customWarrantyMonths?: number;
    defectLiabilityMonths?: number;
    lateDeliveryPenaltyPerDay: number;
    maxPenaltyCap?: {
      type: PenaltyCapType;
      value?: number;
    };
    qualityStandards?: string[];
  };
  negotiationControl: {
    deadline?: string | null;
    // maxRounds and walkawayThreshold removed from UI (Feb 2026)
    // Kept as optional for backwards compatibility with existing deals
    maxRounds?: number;
    walkawayThreshold?: number;
  };
  customParameters: CustomParameter[];
}

/**
 * ExtendedNegotiationConfig - Config with optional wizardConfig for dashboard display
 * Returned by getDealConfig endpoint when deal was created via wizard
 */
export interface ExtendedNegotiationConfig extends NegotiationConfig {
  wizardConfig?: WizardConfig;
  parameterWeights?: Record<string, number>;
  /** Currency code stored on deal creation (e.g. "USD", "INR", "GBP") */
  currency?: string;
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

// ============================================================================
// Deal Wizard Types (Multi-Step Negotiation Configuration)
// ============================================================================

export type NegotiationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type WarrantyPeriod = '0_MONTHS' | '6_MONTHS' | '1_YEAR' | '2_YEARS' | '3_YEARS' | '5_YEARS' | 'CUSTOM';
export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT' | 'LC';
export type PartialDeliveryType = 'QUANTITY' | 'PERCENTAGE';
export type PenaltyCapType = 'PERCENTAGE' | 'FIXED';
export type CustomParameterType = 'BOOLEAN' | 'NUMBER' | 'TEXT' | 'DATE';
export type ParameterFlexibility = 'FIXED' | 'FLEXIBLE' | 'NICE_TO_HAVE';

/**
 * Custom negotiation parameter defined by user
 */
export interface CustomParameter {
  id?: string;
  name: string;
  type: CustomParameterType;
  targetValue: boolean | number | string;
  flexibility: ParameterFlexibility;
  includeInNegotiation: boolean;
}

/**
 * Step 1: Basic Information
 */
export interface DealWizardStepOne {
  requisitionId: number | null;
  vendorId: number | null;     // Primary vendor (SmartDefaults + single-vendor flows)
  vendorIds?: number[];        // All selected vendors (multi-vendor batch mode)
  title: string;
  mode: DealMode;
  priority: NegotiationPriority;
  vendorLocked?: boolean; // When true, vendor dropdown is disabled (pre-selected from URL params)
}

/**
 * Step 2: Price & Quantity Parameters
 */
export interface PriceQuantityParams {
  targetUnitPrice: number | null;
  maxAcceptablePrice: number | null;
  minOrderQuantity: number | null;
  preferredQuantity: number | null;
  /** Currency code selected in Step 2 (e.g. "USD", "INR", "EUR"). Persisted in formData so it survives tab switches and draft restoration. */
  currency: string | null;
}

/**
 * Step 2: Payment Terms Parameters
 */
export interface PaymentTermsParams {
  minDays: number | null;
  maxDays: number | null;
  acceptedMethods: PaymentMethod[];
}

/**
 * Step 2: Partial Delivery Configuration
 */
export interface PartialDeliveryConfig {
  allowed: boolean;
  type: PartialDeliveryType | null;
  minValue: number | null;
}

/**
 * Step 2: Delivery Parameters
 */
export interface DeliveryParams {
  requiredDate: string | null;
  preferredDate: string | null;
  locationId: string | null;  // String ID like "company-1" or "project-5"
  locationAddress: string | null;
  partialDelivery: PartialDeliveryConfig;
}

/**
 * Step 2: Commercial Parameters (combined)
 */
export interface DealWizardStepTwo {
  priceQuantity: PriceQuantityParams;
  paymentTerms: PaymentTermsParams;
  delivery: DeliveryParams;
}

/**
 * Step 3: Maximum Penalty Cap Configuration
 */
export interface PenaltyCapConfig {
  type: PenaltyCapType;
  value: number | null;
}

/**
 * Step 3: Contract & SLA Parameters
 */
export interface ContractSlaParams {
  warrantyPeriod: WarrantyPeriod | null;
  customWarrantyMonths: number | null;
  defectLiabilityMonths: number | null;
  lateDeliveryPenaltyPerDay: number | null;
  maxPenaltyCap: PenaltyCapConfig | null;
  qualityStandards: string[];
}

/**
 * Step 3: Negotiation Control Parameters
 * Updated Feb 2026: maxRounds and walkawayThreshold removed from wizard UI
 * System uses ACCORDO_DEFAULTS from backend instead
 */
export interface NegotiationControlParams {
  deadline: string | null;
  // Optional for backwards compatibility - not shown in wizard UI
  maxRounds?: number | null;
  walkawayThreshold?: number | null;
}

/**
 * Step 3: Contract & Control Parameters (combined)
 */
export interface DealWizardStepThree {
  contractSla: ContractSlaParams;
  negotiationControl: NegotiationControlParams;
  customParameters: CustomParameter[];
}

/**
 * Parameter weight for Step 4
 * Each parameter has a weight from 0-100, and all weights must sum to 100
 */
export interface ParameterWeight {
  parameterId: string;
  parameterName: string;
  weight: number; // 0-100
  source: 'step2' | 'step3' | 'custom';
  color?: string; // For donut chart visualization
}

/**
 * Step 4: Parameter Weights
 * Users adjust importance weights for all negotiation parameters
 */
export interface DealWizardStepFour {
  weights: ParameterWeight[];
  aiSuggested: boolean;
  totalWeight: number; // Should be 100
}

/**
 * Complete wizard form data
 */
export interface DealWizardFormData {
  stepOne: DealWizardStepOne;
  stepTwo: DealWizardStepTwo;
  stepThree: DealWizardStepThree;
  stepFour: DealWizardStepFour;
}

/**
 * Extended CreateDealInput with full negotiation configuration
 */
export interface CreateDealWithConfigInput {
  // Basic info (Step 1)
  title: string;
  counterparty?: string;
  mode: DealMode;
  requisitionId: number;
  vendorId: number;
  priority: NegotiationPriority;

  // Optional: Use existing contract (from "Start Negotiation" button on existing contract)
  // When provided, the backend will link the new deal to this contract
  // When not provided, a new contract will be created (1:1 with deal)
  contractId?: number;

  // Optional: Re-negotiate an escalated contract
  // When provided, a new contract will be created referencing the old one
  previousContractId?: number;

  // Commercial parameters (Step 2)
  priceQuantity: PriceQuantityParams;
  paymentTerms: PaymentTermsParams;
  delivery: DeliveryParams;

  // Contract & Control (Step 3)
  contractSla: ContractSlaParams;
  negotiationControl: NegotiationControlParams;
  customParameters: CustomParameter[];

  // Parameter Weights (Step 4)
  parameterWeights: Record<string, number>; // parameterId -> weight (0-100)
}

/**
 * Smart defaults response from backend
 */
export interface SmartDefaults {
  priceQuantity: {
    targetUnitPrice: number | null;
    maxAcceptablePrice: number | null;
    // New fields for auto-populating from requisition totals
    totalQuantity: number | null;
    totalTargetPrice: number | null;
    totalMaxPrice: number | null;
  };
  paymentTerms: {
    minDays: number;
    maxDays: number;
    // Additional payment fields from requisition
    paymentTermsText?: string | null;      // e.g., "Net 30", "Net 60"
    netPaymentDay?: number | null;         // Parsed net payment day
    prePaymentPercentage?: number | null;  // Pre-payment percentage
    postPaymentPercentage?: number | null; // Post-payment percentage
  };
  delivery: {
    typicalDeliveryDays: number | null;
    // Date fields from requisition for auto-populating wizard
    deliveryDate?: string | null;         // Maps to preferredDate in wizard
    maxDeliveryDate?: string | null;      // Maps to requiredDate in wizard
    negotiationClosureDate?: string | null; // Maps to deadline in wizard Step 3
  };
  // BATNA and discount limits from requisition
  negotiationLimits?: {
    batna: number | null;                 // Best Alternative to Negotiated Agreement
    maxDiscount: number | null;           // Maximum discount allowed
    discountedValue: number | null;       // Discounted value calculation
  };
  /** Currency code from the requisition (e.g. "USD", "INR", "GBP") */
  currency: string;
  source: 'vendor_history' | 'similar_deals' | 'industry_default' | 'combined';
  confidence: number; // 0-1
}

/**
 * Deal draft for auto-save
 */
export interface DealDraft {
  id: string;
  userId: number;
  requisitionId: number | null;
  draftData: Partial<DealWizardFormData>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Requisition summary for dropdown
 */
export interface RequisitionSummary {
  id: number;
  rfqNumber: string;
  title: string;
  projectName: string;
  status: string;
  estimatedValue: number;
  /** Currency code for estimatedValue, from the requisition (e.g. "USD", "INR", "EUR") */
  currency?: string;
  negotiationClosureDate: string | null;
  vendorCount: number;
  productCount: number;
}

/**
 * Vendor address for delivery location selection
 */
export interface VendorAddress {
  id: number;
  label: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  isDefault: boolean;
  source?: 'VENDOR' | 'BUYER';  // Indicates whether address is from vendor or buyer company
}

/**
 * Vendor summary for dropdown (attached to requisition)
 */
export interface VendorSummary {
  id: number;
  vendorId?: number;  // Vendor table ID (for matching with VendorDetails navigation)
  name: string;
  email?: string;
  companyId?: number;
  companyName: string | null;
  pastDealsCount: number;
  avgUtilityScore?: number | null;
  addresses: VendorAddress[];
}

/**
 * Delivery address
 * Note: Backend returns id as string (e.g., "company-1", "project-5")
 * to distinguish between company and project addresses
 */
export interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  type?: 'company' | 'project';
  isDefault: boolean;
}

/**
 * Quality certification
 */
export interface QualityCertification {
  id: string;
  name: string;
  category: string;
}

/**
 * Wizard step definition
 */
export interface WizardStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

/**
 * Warranty period display option
 */
export interface WarrantyOption {
  value: WarrantyPeriod;
  label: string;
  months: number;
}

export const WARRANTY_OPTIONS: WarrantyOption[] = [
  { value: '0_MONTHS', label: '0 Months', months: 0 },
  { value: '6_MONTHS', label: '6 Months', months: 6 },
  { value: '1_YEAR', label: '1 Year', months: 12 },
  { value: '2_YEARS', label: '2 Years', months: 24 },
  { value: '3_YEARS', label: '3 Years', months: 36 },
  { value: '5_YEARS', label: '5 Years', months: 60 },
];

/**
 * Default values for the wizard form
 */
// ============================================================================
// Requisition-Based Deal View Types
// ============================================================================

/**
 * Requisition with aggregated deal statistics
 * Used in the requisition list page
 */
export interface RequisitionWithDeals {
  id: number;
  rfqNumber: string;
  title: string;
  projectId: number;
  projectName: string;
  estimatedValue: number | null;
  typeOfCurrency?: string | null;
  deadline: string | null;
  createdAt: string;
  vendorCount: number;
  activeDeals: number;
  completedDeals: number;
  statusCounts: {
    negotiating: number;
    accepted: number;
    walkedAway: number;
    escalated: number;
  };
  completionPercentage: number;
  lastActivityAt: string | null;
}

/**
 * Vendor deal summary for display on the requisition deals page
 */
export interface VendorDealSummary {
  dealId: string;
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  companyName: string | null;
  status: DealStatus;
  currentRound: number;
  maxRounds: number;
  latestOffer: {
    unitPrice: number | null;
    paymentTerms: string | null;
  } | null;
  utilityScore: number | null;
  lastActivityAt: string | null;
  completedAt: string | null;
}

/**
 * Deal summary response for the modal display
 */
export interface DealSummaryResponse {
  deal: {
    id: string;
    title: string;
    status: DealStatus;
    mode: DealMode;
    vendorName: string;
    vendorEmail: string;
    companyName: string | null;
  };
  finalOffer: {
    unitPrice: number | null;
    paymentTerms: string | null;
    totalValue: number | null;
    deliveryDate: string | null;
  };
  metrics: {
    utilityScore: number | null;
    totalRounds: number;
    maxRounds: number;
    startedAt: string;
    completedAt: string | null;
    durationDays: number | null;
  };
  timeline: Array<{
    round: number;
    vendorOffer: string;
    accordoResponse: string;
    action: string;
  }>;
  chatPreview: string[];
}

/**
 * Query parameters for fetching requisitions with deals
 */
export interface RequisitionsQueryParams {
  projectId?: number;
  status?: 'active' | 'completed' | 'all';
  archived?: ArchiveFilter;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'deadline' | 'vendorCount' | 'completionPercentage';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Query parameters for fetching vendor deals for a requisition
 */
export interface RequisitionDealsQueryParams {
  status?: DealStatus;
  archived?: ArchiveFilter;
  sortBy?: 'status' | 'lastActivity' | 'utilityScore' | 'vendorName';
  sortOrder?: 'asc' | 'desc';
}

/**
 * API response for requisitions list
 */
export interface RequisitionsListResponse {
  requisitions: RequisitionWithDeals[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API response for requisition deals
 */
export interface RequisitionDealsResponse {
  requisition: {
    id: number;
    rfqNumber: string;
    title: string;
    projectName: string;
    estimatedValue: number | null;
    deadline: string | null;
    typeOfCurrency?: string | null;
  };
  deals: VendorDealSummary[];
  statusCounts: {
    negotiating: number;
    accepted: number;
    walkedAway: number;
    escalated: number;
  };
}

export const DEFAULT_WIZARD_FORM_DATA: DealWizardFormData = {
  stepOne: {
    requisitionId: null,
    vendorId: null,
    vendorIds: [],
    title: '',
    mode: 'CONVERSATION',
    priority: 'MEDIUM',
    vendorLocked: false,  // Only true when locked=true is in URL
  },
  stepTwo: {
    priceQuantity: {
      targetUnitPrice: null,
      maxAcceptablePrice: null,
      minOrderQuantity: null,
      preferredQuantity: null,
      currency: null,
    },
    paymentTerms: {
      minDays: 30,
      maxDays: 60,
      acceptedMethods: ['BANK_TRANSFER'],
    },
    delivery: {
      requiredDate: null,
      preferredDate: null,
      locationId: null,
      locationAddress: null,
      partialDelivery: {
        allowed: false,
        type: null,
        minValue: null,
      },
    },
  },
  stepThree: {
    contractSla: {
      warrantyPeriod: '1_YEAR',
      customWarrantyMonths: null,
      defectLiabilityMonths: null,
      lateDeliveryPenaltyPerDay: 1,
      maxPenaltyCap: null,
      qualityStandards: [],
    },
    negotiationControl: {
      deadline: null,
      // maxRounds and walkawayThreshold removed from wizard UI (Feb 2026)
      // System uses ACCORDO_DEFAULTS from backend
    },
    customParameters: [],
  },
  stepFour: {
    weights: [], // Will be populated from Steps 2+3 data
    aiSuggested: true,
    totalWeight: 0,
  },
};

// ============================================================================
// MESO Types (Multiple Equivalent Simultaneous Offers - February 2026)
// ============================================================================

/**
 * A single MESO option in a counter-offer round
 */
export interface MesoOption {
  /** Unique identifier for this option */
  id: string;
  /** The offer terms for this option */
  offer: Offer & {
    payment_terms_days?: number;
    advance_payment_percent?: number;
    delivery_days?: number;
    warranty_months?: number;
    volume_discount?: number;
  };
  /** Utility score for this option (should be similar across all options) */
  utility: number;
  /** Short human-readable label */
  label: string;
  /** Longer description of the option */
  description: string;
  /** Parameter this option emphasizes (can be string or array from backend) */
  emphasis: ('price' | 'payment' | 'payment_terms' | 'delivery' | 'warranty' | 'balanced')[] | 'price' | 'payment' | 'payment_terms' | 'delivery' | 'warranty' | 'balanced';
  /** Trade-off descriptions */
  tradeoffs: string[];
}

/** Negotiation phase for frontend state management (February 2026) */
export type NegotiationPhase =
  | 'NORMAL_NEGOTIATION'    // Rounds 1-5, text input enabled
  | 'MESO_PRESENTATION'     // MESO shown with Others, input disabled
  | 'OTHERS_FORM'           // Vendor clicked Others, show form
  | 'POST_OTHERS'           // Rounds after Others, text input enabled
  | 'FINAL_MESO'            // Final MESO, no Others option
  | 'STALL_QUESTION'        // "Is this your final offer?" shown
  | 'DEAL_ACCEPTED'         // Vendor selected MESO, deal closed
  | 'ESCALATED';            // Human PM takeover

/**
 * Result from MESO generation
 */
export interface MesoResult {
  /** Array of 2-3 equivalent options */
  options: MesoOption[];
  /** Target utility score for all options */
  targetUtility: number;
  /** Maximum variance from target (should be <2%) */
  variance: number;
  /** Whether generation was successful */
  success: boolean;
  /** Reason if not successful */
  reason?: string;
  // Flow control flags (February 2026 - MESO + Others flow)
  /** Whether to show "Others" button (false for final MESO) */
  showOthers?: boolean;
  /** Whether this is the final MESO (no more cycles) */
  isFinal?: boolean;
  /** Whether text input should be disabled when MESO is shown */
  inputDisabled?: boolean;
  /** Message to show when input is disabled */
  disabledMessage?: string;
  /** Current negotiation phase */
  phase?: NegotiationPhase;
  /** Stall prompt if detected ("Is this your final offer?") */
  stallPrompt?: string;
  /** Current MESO cycle number (1-5) */
  mesoCycleNumber?: number;
}

/**
 * Vendor's selection from MESO options
 */
export interface MesoSelection {
  /** ID of the selected option */
  selectedOptionId: string;
  /** The selected offer */
  selectedOffer: MesoOption['offer'];
  /** Preferences inferred from this selection */
  inferredPreferences: {
    parameter: string;
    score: number;
    description: string;
  }[];
}

/**
 * MESO round data stored in database
 */
export interface MesoRound {
  id: string;
  dealId: string;
  round: number;
  options: MesoOption[];
  targetUtility: number;
  variance: number;
  vendorSelection?: MesoSelection;
  selectedOptionId?: string;
  inferredPreferences?: MesoSelection['inferredPreferences'];
  preferenceConfidence?: number;
  createdAt: string;
}

// ============================================================================
// Value Function Types ($/Value Trade-offs - February 2026)
// ============================================================================

/**
 * Value impact for a single parameter change
 */
export interface ValueImpact {
  /** Dollar impact of the change */
  dollarImpact: number;
  /** Percentage change */
  percentChange: number;
  /** Human-readable narrative */
  narrative: string;
  /** Unit change (days, %, etc.) */
  unitChange: number;
  /** Whether this change is favorable for buyer */
  isFavorable: boolean;
}

/**
 * Complete value breakdown for an offer
 */
export interface OfferValueBreakdown {
  /** Total dollar impact across all parameters */
  totalDollarImpact: number;
  /** Per-parameter impact */
  parameterImpacts: Record<string, ValueImpact>;
  /** Key trade-offs to highlight */
  keyTradeoffs: string[];
  /** Recommendations based on value analysis */
  recommendations: string[];
}

/**
 * Analysis of trading one parameter for another
 */
export interface TradeoffAnalysis {
  /** First parameter */
  param1: {
    name: string;
    change: string;
    dollarImpact: number;
  };
  /** Second parameter */
  param2: {
    name: string;
    change: string;
    dollarImpact: number;
  };
  /** Net result description */
  netResult: string;
  /** Whether this trade is favorable */
  isFavorable: boolean;
}

// ============================================================================
// Vendor Negotiation Profile Types (February 2026)
// ============================================================================

/**
 * Vendor negotiation style
 */
export type VendorNegotiationStyle = 'aggressive' | 'collaborative' | 'passive' | 'unknown';

/**
 * Summary of vendor negotiation profile for decision making
 */
export interface VendorProfileSummary {
  vendorId: number;
  totalDeals: number;
  successRate: number;
  negotiationStyle: VendorNegotiationStyle;
  styleConfidence: number;
  avgConcessionRate: number;
  avgRoundsToClose: number;
  preferredTerms: {
    paymentTermsDays?: number;
    advancePaymentPercent?: number;
    deliveryDays?: number;
    warrantyMonths?: number;
  } | null;
  mesoPreferences: {
    scores: {
      price: number;
      paymentTerms: number;
      delivery: number;
      warranty: number;
      quality: number;
    };
    primaryPreference: string;
    confidence: number;
  } | null;
  recommendations: string[];
}
