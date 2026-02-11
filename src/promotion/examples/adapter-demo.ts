/**
 * Example demonstrating how the adapters work
 * This shows how Grule-like adapters can be called to check conditions
 */

import { MinimumAmountCondition } from '../adapters/minimum-amount.adapter';
import { UserTierCondition } from '../adapters/user-tier.adapter';
import { TimeBasedCondition } from '../adapters/time-based.adapter';

console.log('=== Promotion Engine Adapter Examples ===\n');

// Example 1: Minimum Amount Condition
console.log('1. Minimum Amount Condition Adapter:');
console.log(
  '   Check if 1500 >= 1000:',
  MinimumAmountCondition.check(1500, 1000),
);
console.log(
  '   Check if 500 >= 1000:',
  MinimumAmountCondition.check(500, 1000),
);
console.log(
  '   Shortfall for 500 (min 1000):',
  MinimumAmountCondition.getShortfall(500, 1000),
);
console.log('');

// Example 2: User Tier Condition
console.log('2. User Tier Condition Adapter:');
console.log('   Is VIP tier VIP?:', UserTierCondition.check('VIP', 'VIP'));
console.log('   Is BASIC tier VIP?:', UserTierCondition.check('BASIC', 'VIP'));
console.log(
  '   Is GOLD at least SILVER?:',
  UserTierCondition.checkMinimumTier('GOLD', 'SILVER'),
);
console.log(
  '   Is BASIC at least GOLD?:',
  UserTierCondition.checkMinimumTier('BASIC', 'GOLD'),
);
console.log(
  '   VIP tier multiplier:',
  UserTierCondition.getTierMultiplier('VIP'),
);
console.log(
  '   BASIC tier multiplier:',
  UserTierCondition.getTierMultiplier('BASIC'),
);
console.log('');

// Example 3: Time-Based Condition
console.log('3. Time-Based Condition Adapter:');
const now = new Date();
const currentHour = now.getHours();
const currentDay = now.getDay();

console.log(`   Current hour: ${currentHour}`);
console.log(`   Current day: ${currentDay} (0=Sun, 6=Sat)`);
console.log(
  '   Is Happy Hour (18-22)?:',
  TimeBasedCondition.isHappyHour(currentHour),
);
console.log(
  '   Is Business Hours (9-17)?:',
  TimeBasedCondition.isBusinessHours(currentHour),
);
console.log('   Is Weekend?:', TimeBasedCondition.isWeekend(currentDay));
console.log('   Is Weekday?:', TimeBasedCondition.isWeekday(currentDay));
console.log('   Is 20:00 Happy Hour?:', TimeBasedCondition.isHappyHour(20));
console.log('   Is 16:00 Happy Hour?:', TimeBasedCondition.isHappyHour(16));
console.log('');

// Example 4: Combining Adapters for Complex Rules
console.log('4. Combined Adapter Example (Complex Rule):');
const transaction = {
  amount: 1500,
  userTier: 'VIP',
  hour: 19,
};

const isLargeTransaction = MinimumAmountCondition.check(
  transaction.amount,
  1000,
);
const isVipUser = UserTierCondition.check(transaction.userTier, 'VIP');
const isHappyHour = TimeBasedCondition.isHappyHour(transaction.hour);

console.log('   Transaction details:', transaction);
console.log('   Is large transaction (>= 1000)?:', isLargeTransaction);
console.log('   Is VIP user?:', isVipUser);
console.log('   Is during happy hour?:', isHappyHour);

if (isLargeTransaction && isVipUser && isHappyHour) {
  console.log('   ✅ PROMOTION APPLIES: VIP Happy Hour Special!');
  const baseBonus = (transaction.amount * 10) / 100;
  const tierMultiplier = UserTierCondition.getTierMultiplier(
    transaction.userTier,
  );
  const finalBonus = baseBonus * tierMultiplier;
  console.log(`   Base bonus: $${baseBonus}`);
  console.log(`   Tier multiplier: ${tierMultiplier}x`);
  console.log(`   Final bonus: $${finalBonus}`);
} else {
  console.log('   ❌ Promotion does not apply');
}

console.log('\n=== End of Examples ===');
