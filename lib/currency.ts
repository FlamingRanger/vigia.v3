/**
 * Currency Constants & Utilities
 * Dual-currency off-chain model: Vigia Tokens (VT) and API Credits (AC)
 */

// Currency Configuration
export const CURRENCY = {
  VT: "VT", // Vigia Tokens - earned from validated hazard events
  AC: "AC", // API Credits - spent on data/API access
} as const

// Conversion Rate: 10 Vigia Tokens = 1 API Credit
export const CONVERSION_RATE = 10

// Minting Configuration for Hazard Events
export const MINTING_RULES = {
  HAZARD_REWARD: {
    pothole: { base: 5, severity_multiplier: { low: 1, medium: 1.5, high: 2, critical: 3 } },
    bump: { base: 3, severity_multiplier: { low: 1, medium: 1.5, high: 2, critical: 2.5 } },
    crack: { base: 2, severity_multiplier: { low: 1, medium: 1.3, high: 1.8, critical: 2.2 } },
  },
  VALIDATION_BONUS: 2, // Bonus for passing moderation
  MINIMUM_CONFIDENCE: 0.7, // Minimum confidence to qualify for rewards
}

// Payment Configuration for Buying Credits
export const PAYMENT = {
  CURRENCY: "INR",
  RATE_PER_AC: 10, // 1 API Credit = 10 INR
  MIN_PURCHASE_AC: 10, // Minimum purchase amount
  MAX_PURCHASE_AC: 10000, // Maximum purchase amount
}

/**
 * Calculate Vigia Token reward for a hazard event
 */
export function calculateHazardReward(
  eventType: string,
  severity: "low" | "medium" | "high" | "critical",
  confidence: number,
  isValidated: boolean = false,
): number {
  // Must meet minimum confidence threshold
  if (confidence < MINTING_RULES.MINIMUM_CONFIDENCE) {
    return 0
  }

  const hazardType = eventType.toLowerCase() as keyof typeof MINTING_RULES.HAZARD_REWARD
  const config = MINTING_RULES.HAZARD_REWARD[hazardType]

  if (!config) {
    return 0
  }

  const baseReward = config.base
  const multiplier = config.severity_multiplier[severity] || 1
  const validatedBonus = isValidated ? MINTING_RULES.VALIDATION_BONUS : 0

  return Math.round(baseReward * multiplier + validatedBonus)
}

/**
 * Convert Vigia Tokens to API Credits
 */
export function convertVTtoAC(vt: number): number {
  return vt / CONVERSION_RATE
}

/**
 * Convert API Credits to Vigia Tokens (for display purposes)
 */
export function convertACtoVT(ac: number): number {
  return ac * CONVERSION_RATE
}

/**
 * Calculate INR cost for buying API Credits
 */
export function calculatePurchaseCost(ac: number): number {
  return ac * PAYMENT.RATE_PER_AC
}

/**
 * Validate purchase amount
 */
export function validatePurchaseAmount(ac: number): { valid: boolean; message?: string } {
  if (ac < PAYMENT.MIN_PURCHASE_AC) {
    return { valid: false, message: `Minimum purchase is ${PAYMENT.MIN_PURCHASE_AC} ${CURRENCY.AC}` }
  }
  if (ac > PAYMENT.MAX_PURCHASE_AC) {
    return { valid: false, message: `Maximum purchase is ${PAYMENT.MAX_PURCHASE_AC} ${CURRENCY.AC}` }
  }
  return { valid: true }
}

