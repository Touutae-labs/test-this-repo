# Promotion Engine POC - Rule-Based System

## Overview

This POC demonstrates a promotion engine using a rule-based approach similar to Grule, implemented in TypeScript/NestJS using `json-rules-engine`. The system follows the **Condition → Action → Side Effect** pattern.

## Architecture

### Pattern: Condition → Action → Side Effect

1. **Condition**: Rules evaluate facts (amount, userTier, time, etc.) to determine if a promotion applies
2. **Action**: When conditions are met, actions are executed (discount, bonus, etc.)
3. **Side Effect**: After actions, side effects are triggered (logging, notifications, statistics)

### Components

#### 1. Condition Adapters (`/adapters`)

Adapters provide reusable condition logic that the rule engine can call:

- **MinimumAmountCondition**: Checks if transaction amount meets minimum thresholds
- **UserTierCondition**: Validates user membership tier (BASIC, SILVER, GOLD, VIP)
- **TimeBasedCondition**: Time-based promotions (happy hour, weekends, business hours)

Example usage in rules:
```typescript
// Rule engine can call these adapters
MinimumAmountCondition.check(amount, 1000) // Returns boolean
UserTierCondition.checkMinimumTier(userTier, 'VIP')
TimeBasedCondition.isHappyHour(currentHour)
```

#### 2. Actions

Actions are executed when rule conditions are met:

- **Percentage Discount**: Apply X% discount to transaction
- **Fixed Discount**: Apply fixed amount discount
- **Distribute Money**: Add bonus money to transaction

#### 3. Side Effects

Side effects are executed after actions:

- **Log Promotion Applied**: Persist promotion details to database
- **Update User Statistics**: Track promotion usage (placeholder)
- **Send Notifications**: Notify users of promotions (placeholder)

## Example Rules

### Rule 1: Large Transfer Discount
```typescript
Condition: amount >= 1000
Action: Apply 10% discount
Side Effect: Log to database
```

### Rule 2: VIP User Bonus
```typescript
Condition: userTier === 'VIP' AND amount >= 500
Action: Apply $50 fixed discount
Side Effect: Log + Update VIP statistics
```

### Rule 3: Happy Hour Promotion
```typescript
Condition: currentHour >= 18 AND currentHour < 22 AND amount >= 100
Action: Distribute 5% bonus money
Side Effect: Log + Send notification
```

## API Endpoints

### 1. Evaluate Promotion (with execution)
```http
POST /promotion/evaluate
Headers: x-api-key: YOUR_API_KEY
Body:
{
  "amount": 1500,
  "userTier": "VIP",
  "transactionType": "TRANSFER"
}
```

Response:
```json
{
  "success": true,
  "message": "2 promotion(s) applied",
  "data": {
    "promotionsApplied": 2,
    "results": [
      {
        "type": "percentage-discount",
        "originalAmount": 1500,
        "discount": 150,
        "finalAmount": 1350,
        "reason": "Large transfer discount",
        "percentage": 10
      },
      {
        "type": "fixed-discount",
        "originalAmount": 1500,
        "discount": 50,
        "finalAmount": 1450,
        "reason": "VIP member bonus"
      }
    ]
  }
}
```

### 2. Test Promotion (preview without execution)
```http
POST /promotion/test
Headers: x-api-key: YOUR_API_KEY
Body:
{
  "amount": 500,
  "userTier": "BASIC"
}
```

Response:
```json
{
  "success": true,
  "message": "No promotions available",
  "data": {
    "wouldApply": false,
    "promotionsCount": 0,
    "promotions": []
  }
}
```

### 3. Get Promotion History
```http
GET /promotion/history
Headers: x-api-key: YOUR_API_KEY
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 5,
    "promotions": [
      {
        "id": 1,
        "userId": 1,
        "promotionType": "percentage-discount",
        "originalAmount": 1500,
        "finalAmount": 1350,
        "discount": 150,
        "bonus": 0,
        "reason": "Large transfer discount",
        "createdAt": "2026-02-11T17:00:00.000Z"
      }
    ]
  }
}
```

## How It Works

### 1. Rule Engine Initialization

The `PromotionService` initializes a rule engine with predefined rules:

```typescript
private initializeEngine() {
  this.engine = new Engine();
  
  // Add rules
  this.engine.addRule(largeTransferRule);
  this.engine.addRule(vipUserRule);
  this.engine.addRule(happyHourRule);
}
```

### 2. Evaluation Process

```typescript
async evaluatePromotion(facts) {
  // 1. CONDITION: Engine evaluates all rules against facts
  const { events } = await this.engine.run(facts);
  
  // 2. ACTION: Execute action for each triggered rule
  for (const event of events) {
    const result = await this.executeAction(event, facts);
    
    // 3. SIDE EFFECT: Execute side effects
    await this.executeSideEffects(event, facts, result);
  }
}
```

### 3. Adapter Pattern

Adapters allow Grule-like condition checking:

```typescript
// Instead of writing complex rule conditions, use adapters:
UserTierCondition.check(userTier, 'VIP')
MinimumAmountCondition.check(amount, 1000)
TimeBasedCondition.isHappyHour(currentHour)
```

## Extending the System

### Adding New Rules

```typescript
const newRule = new Rule({
  conditions: {
    all: [
      { fact: 'amount', operator: 'greaterThan', value: 5000 },
      { fact: 'transactionType', operator: 'equal', value: 'TOPUP' }
    ]
  },
  event: {
    type: 'premium-bonus',
    params: { percentage: 15, reason: 'Premium top-up bonus' }
  }
});

this.engine.addRule(newRule);
```

### Adding New Adapters

Create a new adapter in `/adapters`:

```typescript
export class LocationBasedCondition {
  static checkCountry(country: string, allowedCountries: string[]): boolean {
    return allowedCountries.includes(country);
  }
}
```

### Adding New Actions

Add action handler in `PromotionService`:

```typescript
private async executeAction(event: any, facts: any) {
  switch (event.type) {
    case 'cashback':
      return this.applyCashback(event.params, facts);
    // ... other cases
  }
}
```

## Database Schema

### PromotionLog Table

| Column | Type | Description |
|--------|------|-------------|
| id | number | Primary key |
| userId | number | User who received promotion |
| promotionType | string | Type of promotion applied |
| originalAmount | decimal | Original transaction amount |
| finalAmount | decimal | Amount after promotion |
| discount | decimal | Discount amount |
| bonus | decimal | Bonus amount |
| reason | string | Promotion reason/description |
| metadata | text | JSON metadata |
| createdAt | datetime | Timestamp |

## Testing the POC

### 1. Start the application
```bash
npm run start:dev
```

### 2. Register and login
```bash
# Register
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Login (get API key)
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### 3. Test promotions
```bash
# Test large amount (should trigger percentage discount)
curl -X POST http://localhost:3001/promotion/evaluate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"userTier":"BASIC"}'

# Test VIP tier (should trigger VIP discount)
curl -X POST http://localhost:3001/promotion/evaluate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":600,"userTier":"VIP"}'

# Preview promotion without executing
curl -X POST http://localhost:3001/promotion/test \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"userTier":"BASIC"}'
```

## Key Features

✅ **Rule-based engine** using json-rules-engine (TypeScript equivalent to Grule)  
✅ **Condition → Action → Side Effect** pattern implementation  
✅ **Reusable adapters** for condition checking  
✅ **Multiple promotion types** (discounts, bonuses, distribution)  
✅ **Database logging** of all promotions applied  
✅ **Preview mode** to test promotions without execution  
✅ **Time-based rules** (happy hour, weekends)  
✅ **User tier support** (BASIC, SILVER, GOLD, VIP)  
✅ **Extensible architecture** for adding new rules and adapters  

## Comparison to Grule

| Feature | Grule (Go) | This POC (TypeScript) |
|---------|------------|----------------------|
| Language | Go | TypeScript/JavaScript |
| Rule Definition | DSL or JSON | JSON |
| Condition Adapters | ✅ Custom functions | ✅ Adapter classes |
| Pattern Support | ✅ Condition→Action | ✅ Condition→Action→Side Effect |
| Runtime Evaluation | ✅ | ✅ |
| Custom Operators | ✅ | ✅ (via operators) |

## Answers to Original Question

**Q: Is it possible to use Grule for a promotion engine that can ask if promotions apply or distribute money with Condition → Action → Side Effect pattern, where I write adapters for Conditions that Grule can call?**

**A: Yes! This POC demonstrates:**

1. ✅ **Promotion Engine**: Evaluates if promotions should apply
2. ✅ **Distribute Money**: `distribute-money` action adds bonus to transactions
3. ✅ **Condition → Action → Side Effect**: Fully implemented pattern
4. ✅ **Condition Adapters**: Reusable adapter classes (MinimumAmountCondition, UserTierCondition, TimeBasedCondition)
5. ✅ **Rule Engine Calls Adapters**: Conditions reference facts that adapters can validate

While this uses `json-rules-engine` (TypeScript) instead of Grule (Go), the architecture and pattern are identical. For a Go implementation, you would use Grule's native DSL with the same adapter pattern.

## Production Considerations

- [ ] Add Redis caching for rule evaluation results
- [ ] Implement rate limiting per user/promotion
- [ ] Add promotion budget caps and expiration dates
- [ ] Implement A/B testing for promotions
- [ ] Add fraud detection rules
- [ ] Create admin API for rule management
- [ ] Add analytics and reporting
- [ ] Implement promotion stacking limits
- [ ] Add webhook notifications for promotion events
