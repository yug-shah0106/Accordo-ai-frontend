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
    volumeDiscountExpectation?: number;
  };
  paymentTerms: {
    minDays: number;
    maxDays: number;
    advancePaymentLimit?: number;
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
    maxRounds: number;
    walkawayThreshold: number;
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
export type WarrantyPeriod = '6_MONTHS' | '1_YEAR' | '2_YEARS' | '3_YEARS';
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
  vendorId: number | null;
  title: string;
  mode: DealMode;
  priority: NegotiationPriority;
}

/**
 * Step 2: Price & Quantity Parameters
 */
export interface PriceQuantityParams {
  targetUnitPrice: number | null;
  maxAcceptablePrice: number | null;
  minOrderQuantity: number | null;
  preferredQuantity: number | null;
  volumeDiscountExpectation: number | null;
}

/**
 * Step 2: Payment Terms Parameters
 */
export interface PaymentTermsParams {
  minDays: number | null;
  maxDays: number | null;
  advancePaymentLimit: number | null;
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
  defectLiabilityMonths: number | null;
  lateDeliveryPenaltyPerDay: number | null;
  maxPenaltyCap: PenaltyCapConfig | null;
  qualityStandards: string[];
}

/**
 * Step 3: Negotiation Control Parameters
 */
export interface NegotiationControlParams {
  deadline: string | null;
  maxRounds: number | null;
  walkawayThreshold: number | null;
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
    volumeDiscountExpectation: number | null;
  };
  paymentTerms: {
    minDays: number;
    maxDays: number;
    advancePaymentLimit: number | null;
  };
  delivery: {
    typicalDeliveryDays: number | null;
  };
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
  { value: '6_MONTHS', label: '6 Months', months: 6 },
  { value: '1_YEAR', label: '1 Year', months: 12 },
  { value: '2_YEARS', label: '2 Years', months: 24 },
  { value: '3_YEARS', label: '3 Years', months: 36 },
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
    title: '',
    mode: 'CONVERSATION',
    priority: 'MEDIUM',
  },
  stepTwo: {
    priceQuantity: {
      targetUnitPrice: null,
      maxAcceptablePrice: null,
      minOrderQuantity: null,
      preferredQuantity: null,
      volumeDiscountExpectation: null,
    },
    paymentTerms: {
      minDays: 30,
      maxDays: 60,
      advancePaymentLimit: null,
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
      defectLiabilityMonths: null,
      lateDeliveryPenaltyPerDay: 1,
      maxPenaltyCap: null,
      qualityStandards: [],
    },
    negotiationControl: {
      deadline: null,
      maxRounds: 10,
      walkawayThreshold: 20,
    },
    customParameters: [],
  },
  stepFour: {
    weights: [], // Will be populated from Steps 2+3 data
    aiSuggested: true,
    totalWeight: 0,
  },
};
