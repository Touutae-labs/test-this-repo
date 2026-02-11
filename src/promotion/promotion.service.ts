import { Injectable } from '@nestjs/common';
import { Engine, Rule } from 'json-rules-engine';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionLog } from './entities/promotion-log.entity';

@Injectable()
export class PromotionService {
  private engine: Engine;

  constructor(
    @InjectRepository(PromotionLog)
    private promotionLogRepository: Repository<PromotionLog>,
  ) {
    this.initializeEngine();
  }

  /**
   * Initialize the rule engine with promotion rules
   * This demonstrates Condition -> Action -> Side Effect pattern
   */
  private initializeEngine() {
    this.engine = new Engine();

    // Rule 1: Percentage Discount for Large Transfers
    const largeTransferRule = new Rule({
      conditions: {
        all: [
          {
            fact: 'amount',
            operator: 'greaterThanInclusive',
            value: 1000,
          },
        ],
      },
      event: {
        type: 'percentage-discount',
        params: {
          percentage: 10,
          reason: 'Large transfer discount',
        },
      },
      priority: 10,
    });

    // Rule 2: VIP User Bonus
    const vipUserRule = new Rule({
      conditions: {
        all: [
          {
            fact: 'userTier',
            operator: 'equal',
            value: 'VIP',
          },
          {
            fact: 'amount',
            operator: 'greaterThanInclusive',
            value: 500,
          },
        ],
      },
      event: {
        type: 'fixed-discount',
        params: {
          amount: 50,
          reason: 'VIP member bonus',
        },
      },
      priority: 20,
    });

    // Rule 3: Happy Hour Promotion (Evening transfers)
    const happyHourRule = new Rule({
      conditions: {
        all: [
          {
            fact: 'currentHour',
            operator: 'greaterThanInclusive',
            value: 18,
          },
          {
            fact: 'currentHour',
            operator: 'lessThan',
            value: 22,
          },
          {
            fact: 'amount',
            operator: 'greaterThanInclusive',
            value: 100,
          },
        ],
      },
      event: {
        type: 'distribute-money',
        params: {
          bonusPercentage: 5,
          reason: 'Happy hour bonus',
        },
      },
      priority: 5,
    });

    // Add rules to engine
    this.engine.addRule(largeTransferRule);
    this.engine.addRule(vipUserRule);
    this.engine.addRule(happyHourRule);

    // Register custom operators for adapters
    this.registerCustomOperators();
  }

  /**
   * Register custom operators that act as adapters
   * These adapters allow Grule-like condition checking
   */
  private registerCustomOperators() {
    // This is where you can add custom condition adapters
    // The json-rules-engine allows custom operators to be registered
  }

  /**
   * Evaluate promotion for a transaction
   * This is the main entry point that follows: Condition -> Action -> Side Effect
   */
  async evaluatePromotion(facts: {
    userId: number;
    amount: number;
    userTier: string;
    transactionType: string;
  }) {
    // Add current time facts
    const currentDate = new Date();
    const enrichedFacts = {
      ...facts,
      currentHour: currentDate.getHours(),
      currentDay: currentDate.getDay(),
    };

    // Run the engine - this evaluates all CONDITIONS
    const { events } = await this.engine.run(enrichedFacts);

    // Process each triggered event - these are the ACTIONS
    const results: any[] = [];
    for (const event of events) {
      const actionResult = await this.executeAction(event, enrichedFacts);
      if (actionResult) {
        results.push(actionResult);
      }

      // Execute SIDE EFFECTS after action
      await this.executeSideEffects(event, enrichedFacts, actionResult);
    }

    return {
      promotionsApplied: results.length,
      results,
      facts: enrichedFacts,
    };
  }

  /**
   * Execute the ACTION based on the event type
   */
  private async executeAction(event: any, facts: any) {
    switch (event.type) {
      case 'percentage-discount':
        return this.applyPercentageDiscount(event.params, facts);
      case 'fixed-discount':
        return this.applyFixedDiscount(event.params, facts);
      case 'distribute-money':
        return this.distributeMoneyBonus(event.params, facts);
      default:
        return null;
    }
  }

  /**
   * ACTION: Apply percentage discount
   */
  private applyPercentageDiscount(params: any, facts: any) {
    const discount = (facts.amount * params.percentage) / 100;
    return {
      type: 'percentage-discount',
      originalAmount: facts.amount,
      discount,
      finalAmount: facts.amount - discount,
      reason: params.reason,
      percentage: params.percentage,
    };
  }

  /**
   * ACTION: Apply fixed discount
   */
  private applyFixedDiscount(params: any, facts: any) {
    return {
      type: 'fixed-discount',
      originalAmount: facts.amount,
      discount: params.amount,
      finalAmount: facts.amount - params.amount,
      reason: params.reason,
    };
  }

  /**
   * ACTION: Distribute money bonus
   */
  private distributeMoneyBonus(params: any, facts: any) {
    const bonus = (facts.amount * params.bonusPercentage) / 100;
    return {
      type: 'distribute-money',
      originalAmount: facts.amount,
      bonus,
      finalAmount: facts.amount + bonus,
      reason: params.reason,
      bonusPercentage: params.bonusPercentage,
    };
  }

  /**
   * Execute SIDE EFFECTS after actions
   * Side effects include logging, statistics, notifications, etc.
   */
  private async executeSideEffects(event: any, facts: any, actionResult: any) {
    // Side Effect 1: Log the promotion application
    await this.logPromotionApplied(event, facts, actionResult);

    // Side Effect 2: Update user statistics (would be implemented)
    // await this.updateUserStatistics(facts.userId, actionResult);

    // Side Effect 3: Send notification (would be implemented)
    // await this.sendPromotionNotification(facts.userId, actionResult);
  }

  /**
   * SIDE EFFECT: Log promotion application to database
   */
  private async logPromotionApplied(event: any, facts: any, actionResult: any) {
    const log = this.promotionLogRepository.create({
      userId: facts.userId,
      promotionType: event.type,
      originalAmount: facts.amount,
      finalAmount: actionResult?.finalAmount || facts.amount,
      discount: actionResult?.discount || 0,
      bonus: actionResult?.bonus || 0,
      reason: event.params?.reason || 'Unknown',
      metadata: JSON.stringify({ facts, event, actionResult }),
    });

    await this.promotionLogRepository.save(log);
  }

  /**
   * Get promotion history for a user
   */
  async getPromotionHistory(userId: number) {
    return this.promotionLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Test if a promotion would apply without executing side effects
   */
  async testPromotion(facts: any) {
    const currentDate = new Date();
    const enrichedFacts = {
      ...facts,
      currentHour: currentDate.getHours(),
      currentDay: currentDate.getDay(),
    };

    const { events } = await this.engine.run(enrichedFacts);

    return {
      wouldApply: events.length > 0,
      promotionsCount: events.length,
      promotions: events.map((event) => ({
        type: event.type,
        params: event.params,
      })),
    };
  }
}
