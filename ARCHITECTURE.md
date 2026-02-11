# Promotion Engine Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PROMOTION ENGINE POC                         │
│                  (Grule-like Rule-Based System)                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT REQUEST                            │
│  POST /promotion/evaluate { amount: 1500, userTier: "VIP" }        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PROMOTION CONTROLLER                           │
│  - Validates input                                                  │
│  - Extracts user ID from API key                                   │
│  - Calls PromotionService                                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PROMOTION SERVICE                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  1️⃣  CONDITION PHASE (Rule Engine Evaluation)             │   │
│  │                                                            │   │
│  │  Facts: { amount: 1500, userTier: "VIP", hour: 17 }      │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ Rule 1: Large Transfer (Priority 10)           │     │   │
│  │  │ IF amount >= 1000                               │     │   │
│  │  │ THEN trigger "percentage-discount"              │     │   │
│  │  │ ✅ TRIGGERED                                     │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ Rule 2: VIP Bonus (Priority 20)                │     │   │
│  │  │ IF userTier == "VIP" AND amount >= 500          │     │   │
│  │  │ THEN trigger "fixed-discount"                   │     │   │
│  │  │ ✅ TRIGGERED                                     │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ Rule 3: Happy Hour (Priority 5)                │     │   │
│  │  │ IF hour >= 18 AND hour < 22 AND amount >= 100  │     │   │
│  │  │ THEN trigger "distribute-money"                 │     │   │
│  │  │ ❌ NOT TRIGGERED (hour is 17)                   │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  2️⃣  ACTION PHASE (Execute Promotions)                    │   │
│  │                                                            │   │
│  │  For each triggered event:                                │   │
│  │                                                            │   │
│  │  Event 1: percentage-discount                             │   │
│  │  ┌──────────────────────────────────────────┐            │   │
│  │  │ Apply 10% discount to 1500               │            │   │
│  │  │ Discount: $150                            │            │   │
│  │  │ Final: $1350                              │            │   │
│  │  └──────────────────────────────────────────┘            │   │
│  │                                                            │   │
│  │  Event 2: fixed-discount                                  │   │
│  │  ┌──────────────────────────────────────────┐            │   │
│  │  │ Apply $50 fixed discount                 │            │   │
│  │  │ Discount: $50                             │            │   │
│  │  │ Final: $1450                              │            │   │
│  │  └──────────────────────────────────────────┘            │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  3️⃣  SIDE EFFECT PHASE (Post-Action Effects)              │   │
│  │                                                            │   │
│  │  For each action result:                                  │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────┐            │   │
│  │  │ 📝 Log to Database                        │            │   │
│  │  │ - PromotionLog table                      │            │   │
│  │  │ - Include metadata (facts, event, result) │            │   │
│  │  └──────────────────────────────────────────┘            │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────┐            │   │
│  │  │ 📊 Update Statistics (placeholder)        │            │   │
│  │  │ - Track promotion usage                   │            │   │
│  │  │ - Update user tier metrics                │            │   │
│  │  └──────────────────────────────────────────┘            │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────┐            │   │
│  │  │ 🔔 Send Notifications (placeholder)       │            │   │
│  │  │ - Notify user of promotion applied        │            │   │
│  │  └──────────────────────────────────────────┘            │   │
│  └───────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          RESPONSE                                   │
│                                                                     │
│  {                                                                  │
│    "success": true,                                                │
│    "message": "2 promotion(s) applied",                           │
│    "data": {                                                       │
│      "promotionsApplied": 2,                                       │
│      "results": [                                                  │
│        {                                                            │
│          "type": "fixed-discount",                                 │
│          "originalAmount": 1500,                                   │
│          "discount": 50,                                           │
│          "finalAmount": 1450                                       │
│        },                                                           │
│        {                                                            │
│          "type": "percentage-discount",                            │
│          "originalAmount": 1500,                                   │
│          "discount": 150,                                          │
│          "finalAmount": 1350                                       │
│        }                                                            │
│      ]                                                              │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      ADAPTER PATTERN                                │
│                                                                     │
│  Adapters provide reusable condition logic:                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  MinimumAmountCondition                                  │     │
│  │  - check(amount, minimum): boolean                       │     │
│  │  - getShortfall(amount, minimum): number                 │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  UserTierCondition                                       │     │
│  │  - check(userTier, requiredTier): boolean               │     │
│  │  - checkMinimumTier(userTier, minTier): boolean         │     │
│  │  - getTierMultiplier(userTier): number                  │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  TimeBasedCondition                                      │     │
│  │  - isHappyHour(hour): boolean                           │     │
│  │  - isWeekend(day): boolean                              │     │
│  │  - isBusinessHours(hour): boolean                       │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  These can be called from anywhere in the codebase!               │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE SCHEMA                                 │
│                                                                     │
│  PromotionLog                                                      │
│  ┌────────────────┬──────────────┬──────────────────────────┐     │
│  │ Field          │ Type         │ Description              │     │
│  ├────────────────┼──────────────┼──────────────────────────┤     │
│  │ id             │ number       │ Primary key              │     │
│  │ userId         │ number       │ User ID                  │     │
│  │ promotionType  │ string       │ Type of promotion        │     │
│  │ originalAmount │ decimal      │ Original amount          │     │
│  │ finalAmount    │ decimal      │ After promotion          │     │
│  │ discount       │ decimal      │ Discount applied         │     │
│  │ bonus          │ decimal      │ Bonus applied            │     │
│  │ reason         │ string       │ Promotion reason         │     │
│  │ metadata       │ text (JSON)  │ Full event details       │     │
│  │ createdAt      │ datetime     │ Timestamp                │     │
│  └────────────────┴──────────────┴──────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
