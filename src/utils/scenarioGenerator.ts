/**
 * Scenario Generator Utility
 *
 * Generates dynamic negotiation scenario messages based on wizard config.
 * Supports both buyer (PM) and vendor perspectives.
 *
 * Buyer perspective: Lower prices are better (target < max acceptable)
 * Vendor perspective: Higher prices are better (profit maximization)
 *
 * Created: January 2026
 * Updated: January 2026 - Added vendor perspective support
 */

import type { WizardConfig } from '../types/chatbot';

export type ScenarioType = 'HARD' | 'MEDIUM' | 'SOFT';

export interface ScenarioMessage {
  type: ScenarioType;
  message: string;
  label: string;
}

export interface ScenarioConfig {
  type: ScenarioType;
  label: string;
  color: string;
  messages: string[];
  chips?: OfferChip[];  // Visual chips for price/net/delivery (vendor mode)
}

/**
 * Offer chip for quick display of price/terms/delivery
 */
export interface OfferChip {
  label: string;
  value: string;
  type: 'price' | 'terms' | 'delivery';
}

/**
 * Vendor scenario with profit estimation (from backend)
 */
export interface VendorScenario {
  type: ScenarioType;
  label: string;
  message: string;
  offer: {
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  };
  chips?: OfferChip[];  // Visual chips for price/net/delivery
  estimatedProfit: number;
}

/**
 * Format currency value to USD string
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'within 30 days';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'within 30 days';
  }
}

/**
 * Generate negotiation-style message text
 */
function generateNegotiationText(
  price: number,
  paymentDays: number,
  delivery: string,
  tone: 'hard' | 'medium' | 'soft'
): string {
  const formattedPrice = formatCurrency(price);

  const templates: Record<typeof tone, string[]> = {
    hard: [
      `I propose a price of ${formattedPrice} per unit with Net ${paymentDays} payment terms and delivery by ${delivery}. This aligns with our target specifications and market standards.`,
      `Based on our requirements, we're offering ${formattedPrice} per unit. We expect Net ${paymentDays} payment terms and delivery by ${delivery}. This is our preferred position.`,
      `Our offer stands at ${formattedPrice} per unit with Net ${paymentDays} days payment. We require delivery by ${delivery}. This reflects our procurement standards.`,
    ],
    medium: [
      `I'd like to offer ${formattedPrice} per unit with Net ${paymentDays} payment terms. We can work with delivery by ${delivery}. I believe this is a fair middle ground.`,
      `Considering both our needs, how about ${formattedPrice} per unit? We can agree to Net ${paymentDays} days payment with delivery by ${delivery}.`,
      `Let's find balance - ${formattedPrice} per unit seems reasonable with Net ${paymentDays} terms. Delivery by ${delivery} works for our timeline.`,
    ],
    soft: [
      `We can accommodate ${formattedPrice} per unit with Net ${paymentDays} payment terms and delivery by ${delivery}. We're open to further discussion on the terms.`,
      `I'm flexible on this - ${formattedPrice} per unit works for us with Net ${paymentDays} days payment. Delivery by ${delivery} would be acceptable.`,
      `To move forward, we can accept ${formattedPrice} per unit. Net ${paymentDays} payment with delivery by ${delivery} is within our flexibility range.`,
    ],
  };

  const options = templates[tone];
  // Use deterministic selection based on price to avoid random changes
  const index = Math.floor(price * 100) % options.length;
  return options[index];
}

/**
 * Generate all scenario messages based on wizard config
 *
 * VENDOR PERSPECTIVE (January 2026 Update):
 * These Quick Offers represent the vendor's position in negotiations.
 * Vendors want HIGHER prices (profit maximization).
 *
 * Scenarios use the following logic:
 * - HARD (Strong Position): HIGHEST price - aggressive vendor stance, maximum profit
 * - MEDIUM (Balanced Offer): MID-RANGE price - fair deal, moderate profit
 * - SOFT (Flexible Offer): LOWEST price - near PM's target, quick close
 *
 * Price calculation from PM's perspective:
 * - targetUnitPrice = PM's ideal price (what PM wants to pay)
 * - maxAcceptablePrice = PM's ceiling (PM walks away above this)
 *
 * Vendor pricing (relative to PM's range):
 * - HARD: 15% above PM's max (aggressive, risks rejection)
 * - MEDIUM: At PM's max (competitive but profitable)
 * - SOFT: Near PM's target (quick close, lower profit)
 *
 * For payment terms (vendor prefers shorter terms = faster payment):
 * - HARD: Min days (shortest terms, best for vendor cash flow)
 * - MEDIUM: Average of min and max
 * - SOFT: Max days (longest terms, more flexible for buyer)
 */
export function generateScenarioMessages(
  wizardConfig: WizardConfig | null | undefined,
  currentRound: number = 0
): ScenarioConfig[] {
  // Return defaults if no wizard config
  if (!wizardConfig) {
    return getDefaultScenarios();
  }

  const { priceQuantity, paymentTerms, delivery } = wizardConfig;

  // Extract values with fallbacks
  const targetPrice = priceQuantity?.targetUnitPrice || 0;
  const maxPrice = priceQuantity?.maxAcceptablePrice || targetPrice * 1.2;

  const paymentMin = paymentTerms?.minDays || 30;
  const paymentMax = paymentTerms?.maxDays || 60;

  const deliveryPreferred = delivery?.preferredDate;
  const deliveryRequired = delivery?.requiredDate;

  // If we don't have essential data, use defaults
  if (!targetPrice || targetPrice <= 0) {
    return getDefaultScenarios();
  }

  // Calculate the price range between PM's target and max
  const priceRange = maxPrice - targetPrice;

  // VENDOR PERSPECTIVE: Higher prices = better for vendor
  // Adjust slightly per round for variety
  const roundAdjustment = currentRound * 0.01; // 1% adjustment per round

  // HARD (Strong Position): 15% above PM's max - aggressive vendor stance
  // Example: If PM's max is $100, HARD price is ~$115
  const hardPrice = Math.round((maxPrice * (1.15 - roundAdjustment)) * 100) / 100;

  // MEDIUM (Balanced Offer): At or slightly above PM's max - fair middle ground
  // Example: If PM's max is $100 and target is $90, MEDIUM is ~$97.50 (75% of range)
  const mediumPrice = Math.round((targetPrice + priceRange * (0.75 - roundAdjustment)) * 100) / 100;

  // SOFT (Flexible Offer): Near PM's target - quick close, lower vendor profit
  // Example: If PM's target is $90 and max is $100, SOFT is ~$92.50 (25% of range)
  const softPrice = Math.round((targetPrice + priceRange * (0.25 - roundAdjustment)) * 100) / 100;

  // VENDOR PERSPECTIVE: Shorter payment terms = better for vendor (faster cash)
  const hardPayment = paymentMin; // Shortest terms (best for vendor cash flow)
  const mediumPayment = Math.round((paymentMin + paymentMax) / 2);
  const softPayment = paymentMax; // Longest terms (more flexible for buyer)

  // Format delivery dates
  const deliveryDate = formatDate(deliveryPreferred || deliveryRequired);

  // Generate messages for each scenario
  return [
    {
      type: 'HARD' as ScenarioType,
      label: 'Strong Position',
      color: 'red',
      messages: [
        generateNegotiationText(hardPrice, hardPayment, deliveryDate, 'hard'),
        generateNegotiationText(hardPrice * 0.98, hardPayment, deliveryDate, 'hard'),
        generateNegotiationText(hardPrice * 1.02, hardPayment + 5, deliveryDate, 'hard'),
      ],
    },
    {
      type: 'MEDIUM' as ScenarioType,
      label: 'Balanced Offer',
      color: 'orange',
      messages: [
        generateNegotiationText(mediumPrice, mediumPayment, deliveryDate, 'medium'),
        generateNegotiationText(mediumPrice * 0.98, mediumPayment, deliveryDate, 'medium'),
        generateNegotiationText(mediumPrice * 1.02, mediumPayment + 5, deliveryDate, 'medium'),
      ],
    },
    {
      type: 'SOFT' as ScenarioType,
      label: 'Flexible Offer',
      color: 'green',
      messages: [
        generateNegotiationText(softPrice, softPayment, deliveryDate, 'soft'),
        generateNegotiationText(softPrice * 0.98, softPayment + 5, deliveryDate, 'soft'),
        generateNegotiationText(softPrice * 1.02, softPayment, deliveryDate, 'soft'),
      ],
    },
  ];
}

/**
 * Get default scenarios when wizard config is not available
 */
function getDefaultScenarios(): ScenarioConfig[] {
  return [
    {
      type: 'HARD',
      label: 'Strong Position',
      color: 'red',
      messages: [
        'I propose we discuss the pricing and terms. What are your best rates for this order?',
        'Based on market research, we have specific targets in mind. Can you share your best offer?',
        'We have clear requirements for this procurement. Please provide your most competitive terms.',
      ],
    },
    {
      type: 'MEDIUM',
      label: 'Balanced Offer',
      color: 'orange',
      messages: [
        "Let's find a middle ground that works for both parties. What terms can you offer?",
        'I believe we can reach a fair agreement. What flexibility do you have on pricing and terms?',
        "We're open to negotiation. Can you outline your standard terms for orders like this?",
      ],
    },
    {
      type: 'SOFT',
      label: 'Flexible Offer',
      color: 'green',
      messages: [
        "I'm open to discussing various options. What do you recommend for this order?",
        "We have some flexibility in our requirements. What's the best package you can put together?",
        "I'd like to understand your offerings better. Can you walk me through your pricing structure?",
      ],
    },
  ];
}

/**
 * Get scenario config by type
 */
export function getScenarioByType(
  scenarios: ScenarioConfig[],
  type: ScenarioType
): ScenarioConfig | undefined {
  return scenarios.find((s) => s.type === type);
}

/**
 * Get scenario color class for Tailwind
 */
export function getScenarioColorClass(
  type: ScenarioType,
  isSelected: boolean
): string {
  const colors: Record<ScenarioType, { selected: string; unselected: string }> = {
    HARD: {
      selected: 'bg-red-600 text-white',
      unselected: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    MEDIUM: {
      selected: 'bg-orange-500 text-white',
      unselected: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    SOFT: {
      selected: 'bg-green-600 text-white',
      unselected: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  };

  return isSelected ? colors[type].selected : colors[type].unselected;
}

// ==================== VENDOR PERSPECTIVE SCENARIOS ====================

/**
 * Convert VendorScenario array (from backend) to ScenarioConfig array (for Composer)
 *
 * This converts the backend's vendor scenarios format to the frontend's ScenarioConfig
 * format used by the Composer component.
 */
export function convertVendorScenariosToConfig(
  vendorScenarios: VendorScenario[]
): ScenarioConfig[] {
  return vendorScenarios.map((scenario) => ({
    type: scenario.type,
    label: scenario.label,
    color: getScenarioColor(scenario.type),
    messages: [scenario.message], // Single message from backend (can be expanded)
    chips: scenario.chips,  // Pass through offer chips (price/net/delivery)
  }));
}

/**
 * Get scenario color string for a given type
 */
function getScenarioColor(type: ScenarioType): string {
  const colorMap: Record<ScenarioType, string> = {
    HARD: 'red',
    MEDIUM: 'orange',
    SOFT: 'green',
  };
  return colorMap[type];
}

/**
 * Get vendor scenario labels (vendor perspective)
 *
 * For vendor perspective:
 * - HARD = Maximum Profit (higher price, tougher stance)
 * - MEDIUM = Balanced Deal (moderate profit)
 * - SOFT = Quick Close (lower profit, easier close)
 */
export function getVendorScenarioLabels(): Record<ScenarioType, string> {
  return {
    HARD: 'Maximum Profit',
    MEDIUM: 'Balanced Deal',
    SOFT: 'Quick Close',
  };
}

/**
 * Generate vendor scenario description based on estimated profit
 */
export function getVendorScenarioDescription(
  type: ScenarioType,
  estimatedProfit: number
): string {
  const profitStr = `${(estimatedProfit * 100).toFixed(0)}%`;

  switch (type) {
    case 'HARD':
      return `~${profitStr} profit margin - aggressive stance`;
    case 'MEDIUM':
      return `~${profitStr} profit margin - balanced approach`;
    case 'SOFT':
      return `~${profitStr} profit margin - flexible terms`;
    default:
      return `~${profitStr} profit margin`;
  }
}

/**
 * Generate fallback vendor scenarios when backend is unavailable
 *
 * Uses PM's last offer (if available) to calculate vendor counter-offers
 */
// ==================== EMPHASIS-AWARE INSTANT FALLBACK ====================

/**
 * Structured suggestion type for emphasis-specific suggestions
 */
export interface StructuredFallbackSuggestion {
  message: string;
  price: number;
  paymentTerms: string;
  deliveryDate: string;
  deliveryDays: number;
  emphasis: 'price' | 'terms' | 'delivery' | 'value';
}

/**
 * Scenario suggestions for all scenarios
 */
export interface ScenarioFallbackSuggestions {
  HARD: StructuredFallbackSuggestion[];
  MEDIUM: StructuredFallbackSuggestion[];
  SOFT: StructuredFallbackSuggestion[];
  WALK_AWAY: StructuredFallbackSuggestion[];
}

/**
 * Generate emphasis-aware instant fallback suggestions
 *
 * VENDOR PERSPECTIVE (January 2026 Update):
 * These Quick Offers represent vendor pricing - vendors want HIGHER prices.
 *
 * When emphasis is selected:
 * - Price: 4 variations with different price points (vendor prices ABOVE PM's target)
 * - Terms: 4 variations with different payment terms (vendor prefers shorter terms)
 * - Delivery: 4 variations with different delivery options
 * - Multi-select: 4 variations blending all selected emphases
 *
 * Scenario pricing (vendor perspective):
 * - HARD: 15% above PM's max (highest price - maximum profit)
 * - MEDIUM: 75% of range from target to max (balanced deal)
 * - SOFT: 25% of range from target to max (quick close - near PM's target)
 *
 * @param wizardConfig - The wizard config for price/terms/delivery ranges
 * @param emphases - Selected emphases (price, terms, delivery)
 * @returns ScenarioFallbackSuggestions - Structured suggestions for instant display
 */
export function generateEmphasisAwareFallback(
  wizardConfig: WizardConfig | null | undefined,
  emphases: Set<'price' | 'terms' | 'delivery'>
): ScenarioFallbackSuggestions {
  // Extract values with fallbacks
  const priceTarget = wizardConfig?.priceQuantity?.targetUnitPrice || 90;
  const priceMax = wizardConfig?.priceQuantity?.maxAcceptablePrice || priceTarget * 1.3;

  // Calculate price range for vendor perspective pricing
  const priceRange = priceMax - priceTarget;

  // VENDOR PERSPECTIVE: Calculate scenario base prices
  // HARD: 15% above PM's max (highest price - maximum profit for vendor)
  const hardBasePrice = Math.round(priceMax * 1.15 * 100) / 100;
  // MEDIUM: 75% of range from target (near PM's max - balanced deal)
  const mediumBasePrice = Math.round((priceTarget + priceRange * 0.75) * 100) / 100;
  // SOFT: 25% of range from target (near PM's target - quick close)
  const softBasePrice = Math.round((priceTarget + priceRange * 0.25) * 100) / 100;

  const paymentMin = wizardConfig?.paymentTerms?.minDays || 30;
  const paymentMax = wizardConfig?.paymentTerms?.maxDays || 60;

  const deliveryRequired = wizardConfig?.delivery?.requiredDate;
  const deliveryPreferred = wizardConfig?.delivery?.preferredDate;
  const deliveryDate = deliveryPreferred || deliveryRequired ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Calculate delivery days from today
  const today = new Date();
  const deliveryDateObj = new Date(deliveryDate);
  const deliveryDays = Math.max(7, Math.ceil((deliveryDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // VENDOR PERSPECTIVE: Shorter terms = better for vendor (faster cash flow)
  const idealTerms = `Net ${paymentMin}`; // Shortest terms - best for vendor
  const acceptableTerms = `Net ${Math.round((paymentMin + paymentMax) / 2)}`;
  const flexibleTerms = `Net ${paymentMax}`; // Longest terms - most flexible for buyer

  // Determine emphasis type
  const emphasisArray = Array.from(emphases);
  const hasEmphasis = emphasisArray.length > 0;
  const primaryEmphasis = hasEmphasis ? emphasisArray[0] : null;
  const isMultiEmphasis = emphasisArray.length > 1;

  // Helper: Generate 4 PRICE-focused variations
  const generatePriceVariations = (
    basePrice: number,
    terms: string,
    scenarioType: 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY'
  ): StructuredFallbackSuggestion[] => {
    const offsets = scenarioType === 'HARD' ? [0, 2, 4, 6] :
                   scenarioType === 'MEDIUM' ? [0, 3, 6, 9] :
                   scenarioType === 'SOFT' ? [0, 2, 4, 6] :
                   [0, 3, 6, 10];
    const termsArray = [idealTerms, idealTerms, acceptableTerms, flexibleTerms];

    return [
      {
        message: `Our best price: $${basePrice.toFixed(2)} per unit with ${terms} terms and ${deliveryDays}-day delivery.`,
        price: basePrice,
        paymentTerms: terms,
        deliveryDate,
        deliveryDays,
        emphasis: 'price',
      },
      {
        message: `At $${(basePrice + offsets[1]).toFixed(2)} per unit with ${termsArray[1]} terms and ${deliveryDays}-day delivery.`,
        price: basePrice + offsets[1],
        paymentTerms: termsArray[1],
        deliveryDate,
        deliveryDays,
        emphasis: 'price',
      },
      {
        message: `For $${(basePrice + offsets[2]).toFixed(2)} per unit with ${termsArray[2]} terms, ${deliveryDays}-day delivery guaranteed.`,
        price: basePrice + offsets[2],
        paymentTerms: termsArray[2],
        deliveryDate,
        deliveryDays,
        emphasis: 'price',
      },
      {
        message: `Value option: $${(basePrice + offsets[3]).toFixed(2)} per unit, ${termsArray[3]} terms, ${deliveryDays}-day delivery.`,
        price: basePrice + offsets[3],
        paymentTerms: termsArray[3],
        deliveryDate,
        deliveryDays,
        emphasis: 'price',
      },
    ];
  };

  // Helper: Generate 4 TERMS-focused variations
  const generateTermsVariations = (
    basePrice: number,
    scenarioType: 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY'
  ): StructuredFallbackSuggestion[] => {
    const priceAdjust = scenarioType === 'HARD' ? 3 : scenarioType === 'MEDIUM' ? 5 : scenarioType === 'SOFT' ? 4 : 8;

    return [
      {
        message: `Best terms: ${idealTerms} payment at $${basePrice.toFixed(2)} per unit with ${deliveryDays}-day delivery.`,
        price: basePrice,
        paymentTerms: idealTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'terms',
      },
      {
        message: `Extended ${acceptableTerms} terms at $${(basePrice + priceAdjust).toFixed(2)} per unit with ${deliveryDays}-day delivery.`,
        price: basePrice + priceAdjust,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'terms',
      },
      {
        message: `Maximum flexibility: ${flexibleTerms} terms at $${(basePrice + priceAdjust * 1.5).toFixed(2)} per unit.`,
        price: basePrice + priceAdjust * 1.5,
        paymentTerms: flexibleTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'terms',
      },
      {
        message: `Custom terms: ${acceptableTerms} at $${(basePrice + priceAdjust * 0.5).toFixed(2)} per unit, ${deliveryDays}-day delivery.`,
        price: basePrice + priceAdjust * 0.5,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'terms',
      },
    ];
  };

  // Helper: Generate 4 DELIVERY-focused variations
  const generateDeliveryVariations = (
    basePrice: number,
    terms: string,
    scenarioType: 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY'
  ): StructuredFallbackSuggestion[] => {
    const priceAdjust = scenarioType === 'HARD' ? 4 : scenarioType === 'MEDIUM' ? 6 : scenarioType === 'SOFT' ? 5 : 10;
    const expeditedDays = Math.max(deliveryDays - 5, 7);
    const flexDays = deliveryDays + 3;

    return [
      {
        message: `Express: ${expeditedDays} days at $${(basePrice + priceAdjust).toFixed(2)} per unit with ${terms} terms.`,
        price: basePrice + priceAdjust,
        paymentTerms: terms,
        deliveryDate,
        deliveryDays: expeditedDays,
        emphasis: 'delivery',
      },
      {
        message: `Priority: ${deliveryDays} days guaranteed at $${basePrice.toFixed(2)} per unit with ${terms} terms.`,
        price: basePrice,
        paymentTerms: terms,
        deliveryDate,
        deliveryDays,
        emphasis: 'delivery',
      },
      {
        message: `Flexible: ${deliveryDays}-${flexDays} days at $${(basePrice - priceAdjust * 0.5).toFixed(2)} per unit.`,
        price: basePrice - priceAdjust * 0.5,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'delivery',
      },
      {
        message: `Standard: ${deliveryDays} days with ${terms} terms at $${(basePrice - priceAdjust * 0.3).toFixed(2)} per unit.`,
        price: basePrice - priceAdjust * 0.3,
        paymentTerms: terms,
        deliveryDate,
        deliveryDays,
        emphasis: 'delivery',
      },
    ];
  };

  // Helper: Generate 4 MULTI-EMPHASIS (blended) variations
  const generateMultiEmphasisVariations = (
    basePrice: number,
    terms: string,
    scenarioType: 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY'
  ): StructuredFallbackSuggestion[] => {
    const emphasisList = emphasisArray.join(' + ');
    const priceAdjust = scenarioType === 'HARD' ? 2 : scenarioType === 'MEDIUM' ? 4 : scenarioType === 'SOFT' ? 3 : 6;

    return [
      {
        message: `Balanced ${emphasisList}: $${basePrice.toFixed(2)} per unit, ${idealTerms} terms, ${deliveryDays}-day delivery.`,
        price: basePrice,
        paymentTerms: idealTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'value',
      },
      {
        message: `${emphasisList} focused: $${(basePrice + priceAdjust).toFixed(2)} with ${acceptableTerms} terms, ${deliveryDays}-day delivery.`,
        price: basePrice + priceAdjust,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'value',
      },
      {
        message: `Premium ${emphasisList}: $${(basePrice + priceAdjust * 1.5).toFixed(2)}, ${acceptableTerms} terms, ${Math.max(deliveryDays - 3, 7)}-day delivery.`,
        price: basePrice + priceAdjust * 1.5,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays: Math.max(deliveryDays - 3, 7),
        emphasis: 'value',
      },
      {
        message: `Flexible ${emphasisList}: $${(basePrice + priceAdjust * 0.5).toFixed(2)} per unit, ${flexibleTerms} terms, ${deliveryDays}-day delivery.`,
        price: basePrice + priceAdjust * 0.5,
        paymentTerms: flexibleTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'value',
      },
    ];
  };

  // Helper: Generate default (mixed emphasis) variations
  const generateDefaultVariations = (
    basePrice: number,
    defaultTerms: string
  ): StructuredFallbackSuggestion[] => {
    return [
      {
        message: `Our best offer: $${basePrice.toFixed(2)} per unit with ${defaultTerms} terms and ${deliveryDays}-day delivery.`,
        price: basePrice,
        paymentTerms: defaultTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'price',
      },
      {
        message: `We can work with ${defaultTerms} terms at $${(basePrice + 2).toFixed(2)} per unit, ${deliveryDays}-day delivery.`,
        price: basePrice + 2,
        paymentTerms: defaultTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'terms',
      },
      {
        message: `To meet your ${deliveryDays}-day delivery: $${(basePrice + 5).toFixed(2)} per unit with ${acceptableTerms} terms.`,
        price: basePrice + 5,
        paymentTerms: acceptableTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'delivery',
      },
      {
        message: `Complete package: $${(basePrice + 8).toFixed(2)}, ${flexibleTerms} terms, ${deliveryDays}-day delivery.`,
        price: basePrice + 8,
        paymentTerms: flexibleTerms,
        deliveryDate,
        deliveryDays,
        emphasis: 'value',
      },
    ];
  };

  // Main generator function
  const generateForScenario = (
    scenarioType: 'HARD' | 'MEDIUM' | 'SOFT' | 'WALK_AWAY',
    basePrice: number,
    defaultTerms: string
  ): StructuredFallbackSuggestion[] => {
    if (isMultiEmphasis) {
      return generateMultiEmphasisVariations(basePrice, defaultTerms, scenarioType);
    }
    if (primaryEmphasis === 'price') {
      return generatePriceVariations(basePrice, defaultTerms, scenarioType);
    }
    if (primaryEmphasis === 'terms') {
      return generateTermsVariations(basePrice, scenarioType);
    }
    if (primaryEmphasis === 'delivery') {
      return generateDeliveryVariations(basePrice, defaultTerms, scenarioType);
    }
    return generateDefaultVariations(basePrice, defaultTerms);
  };

  // VENDOR PERSPECTIVE: Use calculated vendor prices
  // HARD = highest price (aggressive), MEDIUM = mid-range, SOFT = lowest (quick close)
  return {
    HARD: generateForScenario('HARD', hardBasePrice, idealTerms),
    MEDIUM: generateForScenario('MEDIUM', mediumBasePrice, acceptableTerms),
    SOFT: generateForScenario('SOFT', softBasePrice, flexibleTerms),
    WALK_AWAY: generateForScenario('WALK_AWAY', priceMax * 1.25, idealTerms), // 25% above max - walk away price
  };
}

/**
 * Generate vendor fallback scenarios based on PM's wizard config prices
 *
 * UPDATED January 2026: Now accepts wizard config to calculate vendor prices
 * based on PM's target and max acceptable prices.
 *
 * Vendor scenarios are ABOVE PM's max price (vendors want profit):
 * - HARD: 10-25% above PM's max (aggressive, risks rejection)
 * - MEDIUM: 5-15% above PM's max (competitive but profitable)
 * - SOFT: At or near PM's max (quick close, likely to be accepted)
 *
 * User's expected behavior (for Target=$90, Max=$100):
 * - HARD: $110-$125 (above PM's max, high profit margin)
 * - MEDIUM: $95-$100 (near PM's max, balanced)
 * - SOFT: $90-$95 (near PM's target, quick close)
 */
export function generateVendorFallbackScenarios(
  pmLastOffer: {
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  } | null,
  wizardConfig?: WizardConfig | null
): ScenarioConfig[] {
  // Extract PM's price range from wizard config
  const pmTargetPrice = wizardConfig?.priceQuantity?.targetUnitPrice || 90;
  const pmMaxPrice = wizardConfig?.priceQuantity?.maxAcceptablePrice || pmTargetPrice * 1.1;

  // Payment terms from wizard config
  const paymentMin = wizardConfig?.paymentTerms?.minDays || 30;
  const paymentMax = wizardConfig?.paymentTerms?.maxDays || 60;

  // Delivery from wizard config
  const deliveryDate = wizardConfig?.delivery?.preferredDate ||
                       wizardConfig?.delivery?.requiredDate ||
                       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Calculate the range between target and max
  const priceRange = pmMaxPrice - pmTargetPrice;

  // Calculate vendor scenario prices based on PM's target/max
  // HARD: 10-25% above PM's max - aggressive vendor position
  // For Target=$90, Max=$100 -> HARD ~ $117.50 (17.5% above max)
  const hardPrice = Math.round(pmMaxPrice * 1.175 * 100) / 100;

  // MEDIUM: At or near PM's max - balanced approach
  // For Target=$90, Max=$100 -> MEDIUM ~ $97.50 (75% of range from target)
  const mediumPrice = Math.round((pmTargetPrice + priceRange * 0.75) * 100) / 100;

  // SOFT: Near PM's target - quick close
  // For Target=$90, Max=$100 -> SOFT ~ $92.50 (25% of range from target)
  const softPrice = Math.round((pmTargetPrice + priceRange * 0.25) * 100) / 100;

  // Use PM's last offer if available, otherwise use wizard config values
  const useDelivery = pmLastOffer?.deliveryDate || deliveryDate;
  const hardTerms = `Net ${paymentMin}`; // Vendor prefers shorter terms
  const mediumTerms = `Net ${Math.round((paymentMin + paymentMax) / 2)}`;
  const softTerms = pmLastOffer?.paymentTerms || `Net ${paymentMax}`; // More flexible for quick close

  // Generate chips for UI display
  const generateChips = (price: number, terms: string): OfferChip[] => [
    { label: 'Price', value: formatCurrency(price), type: 'price' },
    { label: 'Terms', value: terms, type: 'terms' },
    { label: 'Delivery', value: formatDate(useDelivery), type: 'delivery' },
  ];

  return [
    {
      type: 'HARD',
      label: 'Maximum Profit',
      color: 'red',
      messages: [
        `Given our quality and service level, I propose ${formatCurrency(hardPrice)} per unit with ${hardTerms} terms and delivery by ${formatDate(useDelivery)}.`,
        `Based on current market conditions and our costs, ${formatCurrency(hardPrice)} per unit is our best offer.`,
        `To maintain our quality standards, we need ${formatCurrency(hardPrice)} per unit with ${hardTerms} payment terms.`,
      ],
      chips: generateChips(hardPrice, hardTerms),
    },
    {
      type: 'MEDIUM',
      label: 'Balanced Deal',
      color: 'orange',
      messages: [
        `I can work with ${formatCurrency(mediumPrice)} per unit with ${mediumTerms} terms. This is a fair middle ground.`,
        `Let's meet in the middle - ${formatCurrency(mediumPrice)} per unit with ${mediumTerms} payment terms.`,
        `I'm willing to offer ${formatCurrency(mediumPrice)} per unit for a mutually beneficial deal.`,
      ],
      chips: generateChips(mediumPrice, mediumTerms),
    },
    {
      type: 'SOFT',
      label: 'Quick Close',
      color: 'green',
      messages: [
        `To close this deal quickly, I can offer ${formatCurrency(softPrice)} per unit with ${softTerms} terms.`,
        `I want to make this work - ${formatCurrency(softPrice)} per unit is very competitive for our quality level.`,
        `For a quick close, I'll accept ${formatCurrency(softPrice)} per unit with delivery by ${formatDate(useDelivery)}.`,
      ],
      chips: generateChips(softPrice, softTerms),
    },
  ];
}
