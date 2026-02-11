/**
 * Adapter for Time-Based Condition
 * This adapter checks time-related conditions for promotions
 */
export class TimeBasedCondition {
  /**
   * Check if current time is within a time range
   * @param currentHour - Current hour (0-23)
   * @param startHour - Start hour of the promotion
   * @param endHour - End hour of the promotion
   * @returns boolean indicating if condition is met
   */
  static checkTimeRange(
    currentHour: number,
    startHour: number,
    endHour: number,
  ): boolean {
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Check if current day is a weekend
   * @param currentDay - Current day of week (0=Sunday, 6=Saturday)
   * @returns boolean indicating if it's a weekend
   */
  static isWeekend(currentDay: number): boolean {
    return currentDay === 0 || currentDay === 6;
  }

  /**
   * Check if current day is a weekday
   * @param currentDay - Current day of week (0=Sunday, 6=Saturday)
   * @returns boolean indicating if it's a weekday
   */
  static isWeekday(currentDay: number): boolean {
    return currentDay >= 1 && currentDay <= 5;
  }

  /**
   * Check if it's happy hour (configurable hours)
   * @param currentHour - Current hour (0-23)
   * @returns boolean indicating if it's happy hour
   */
  static isHappyHour(currentHour: number): boolean {
    return this.checkTimeRange(currentHour, 18, 22);
  }

  /**
   * Check if it's business hours
   * @param currentHour - Current hour (0-23)
   * @returns boolean indicating if it's business hours
   */
  static isBusinessHours(currentHour: number): boolean {
    return this.checkTimeRange(currentHour, 9, 17);
  }
}
