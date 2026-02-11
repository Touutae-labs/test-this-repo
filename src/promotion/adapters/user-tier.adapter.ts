/**
 * Adapter for User Tier Condition
 * This adapter checks user tier/membership level for promotions
 */
export enum UserTier {
  BASIC = 'BASIC',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  VIP = 'VIP',
}

export class UserTierCondition {
  private static tierHierarchy = {
    BASIC: 1,
    SILVER: 2,
    GOLD: 3,
    VIP: 4,
  };

  /**
   * Check if user tier matches the required tier
   * @param userTier - The user's current tier
   * @param requiredTier - The required tier for the promotion
   * @returns boolean indicating if condition is met
   */
  static check(userTier: string, requiredTier: string): boolean {
    return userTier === requiredTier;
  }

  /**
   * Check if user tier is at least the required tier
   * @param userTier - The user's current tier
   * @param requiredTier - The minimum required tier
   * @returns boolean indicating if user meets minimum tier
   */
  static checkMinimumTier(userTier: string, requiredTier: string): boolean {
    const userLevel = this.tierHierarchy[userTier] || 0;
    const requiredLevel = this.tierHierarchy[requiredTier] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Get tier multiplier for bonus calculations
   * @param userTier - The user's current tier
   * @returns multiplier based on tier
   */
  static getTierMultiplier(userTier: string): number {
    const multipliers = {
      BASIC: 1.0,
      SILVER: 1.1,
      GOLD: 1.25,
      VIP: 1.5,
    };
    return multipliers[userTier] || 1.0;
  }
}
