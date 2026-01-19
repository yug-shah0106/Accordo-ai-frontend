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
 * Scenarios use the following logic:
 * - HARD: Target values (what we want)
 * - MEDIUM: 30% toward max acceptable
 * - SOFT: 60% toward max acceptable
 *
 * For payment terms:
 * - HARD: Max days (longest terms, best for buyer)
 * - MEDIUM: Average of min and max
 * - SOFT: Min days (shortest terms)
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

  // Calculate scenario prices (adjust based on current round for variety)
  const roundAdjustment = currentRound * 0.02; // 2% adjustment per round
  const hardPrice = targetPrice;
  const mediumPrice = targetPrice + (maxPrice - targetPrice) * (0.3 + roundAdjustment);
  const softPrice = targetPrice + (maxPrice - targetPrice) * (0.6 + roundAdjustment);

  // Calculate payment terms
  const hardPayment = paymentMax; // Longest terms (best for buyer)
  const mediumPayment = Math.round((paymentMin + paymentMax) / 2);
  const softPayment = paymentMin; // Shortest terms

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
        generateNegotiationText(hardPrice * 1.02, hardPayment - 5, deliveryDate, 'hard'),
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
export function generateVendorFallbackScenarios(
  pmLastOffer: {
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  } | null
): ScenarioConfig[] {
  if (!pmLastOffer) {
    // No PM offer yet, use generic messages
    return [
      {
        type: 'HARD',
        label: 'Maximum Profit',
        color: 'red',
        messages: [
          'I appreciate your interest. Based on our costs and market conditions, I need to propose a higher price point.',
          'Considering our quality standards and reliability, my pricing reflects the value we provide.',
          'Our pricing is competitive for the quality level we deliver. Let me share our offer.',
        ],
      },
      {
        type: 'MEDIUM',
        label: 'Balanced Deal',
        color: 'orange',
        messages: [
          "Let's find a middle ground that works for both of us. I can be somewhat flexible on terms.",
          "I'm open to negotiation on the terms while maintaining fair margins for our business.",
          "We value this partnership opportunity. Here's a proposal that balances both our needs.",
        ],
      },
      {
        type: 'SOFT',
        label: 'Quick Close',
        color: 'green',
        messages: [
          "To expedite this deal, I'm willing to offer more favorable terms.",
          "I want to build a long-term relationship. Here's a competitive offer to get us started.",
          "We're flexible and eager to close this deal. Let me make a compelling offer.",
        ],
      },
    ];
  }

  // Calculate counter-offer prices based on PM's offer
  const pmPrice = pmLastOffer.price;
  const hardPrice = pmPrice * 1.15; // 15% higher (maximum profit)
  const mediumPrice = pmPrice * 1.08; // 8% higher (balanced)
  const softPrice = pmPrice * 1.03; // 3% higher (quick close)

  return [
    {
      type: 'HARD',
      label: 'Maximum Profit',
      color: 'red',
      messages: [
        `Given our quality and service level, I propose ${formatCurrency(hardPrice)} per unit with ${pmLastOffer.paymentTerms} terms and delivery by ${pmLastOffer.deliveryDate}.`,
        `Based on current market conditions and our costs, ${formatCurrency(hardPrice)} per unit is our best offer.`,
        `To maintain our quality standards, we need ${formatCurrency(hardPrice)} per unit with the stated terms.`,
      ],
    },
    {
      type: 'MEDIUM',
      label: 'Balanced Deal',
      color: 'orange',
      messages: [
        `I can work with ${formatCurrency(mediumPrice)} per unit while keeping the terms flexible. This is a fair middle ground.`,
        `Let's meet in the middle - ${formatCurrency(mediumPrice)} per unit with ${pmLastOffer.paymentTerms} payment terms.`,
        `I'm willing to come down to ${formatCurrency(mediumPrice)} per unit for a mutually beneficial deal.`,
      ],
    },
    {
      type: 'SOFT',
      label: 'Quick Close',
      color: 'green',
      messages: [
        `To close this deal quickly, I can offer ${formatCurrency(softPrice)} per unit with your preferred terms.`,
        `I want to make this work - ${formatCurrency(softPrice)} per unit is very competitive for our quality level.`,
        `For a quick close, I'll accept ${formatCurrency(softPrice)} per unit with delivery by ${pmLastOffer.deliveryDate}.`,
      ],
    },
  ];
}
