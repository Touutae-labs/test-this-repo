/**
 * Adapter for Minimum Amount Condition
 * This adapter can be called by the rule engine to check if a minimum amount is met
 */
export class MinimumAmountCondition {
  /**
   * Check if the amount meets the minimum threshold
   * @param amount - The transaction amount
   * @param minimumAmount - The minimum required amount
   * @returns boolean indicating if condition is met
   */
  static check(amount: number, minimumAmount: number): boolean {
    return amount >= minimumAmount;
  }

  /**
   * Get the shortfall if minimum is not met
   * @param amount - The transaction amount
   * @param minimumAmount - The minimum required amount
   * @returns the shortfall amount or 0 if condition is met
   */
  static getShortfall(amount: number, minimumAmount: number): number {
    return amount < minimumAmount ? minimumAmount - amount : 0;
  }
}
