# Quick Start Guide - Promotion Engine POC

## Overview
This POC demonstrates a Grule-like promotion engine using TypeScript's json-rules-engine library, implementing the **Condition → Action → Side Effect** pattern.

## Quick Test

### 1. Start the server
```bash
npm install
npm run start:dev
```

### 2. Register a user
```bash
curl -X POST http://localhost:8080/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"password123"}'
```

Response includes your API key (e.g., `ewallet_abc123...`)

### 3. Test promotions

**Test with large amount (triggers 10% discount):**
```bash
curl -X POST http://localhost:8080/promotion/test \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"userTier":"BASIC"}'
```

**Test with VIP user (triggers $50 bonus):**
```bash
curl -X POST http://localhost:8080/promotion/test \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":600,"userTier":"VIP"}'
```

**Apply promotions (with database logging):**
```bash
curl -X POST http://localhost:8080/promotion/evaluate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"userTier":"VIP"}'
```

**Check promotion history:**
```bash
curl -X GET http://localhost:8080/promotion/history \
  -H "x-api-key: YOUR_API_KEY"
```

## Demo Adapter Script

```bash
npx ts-node src/promotion/examples/adapter-demo.ts
```

This demonstrates how the adapters work independently.

## Key Files

- `src/promotion/promotion.service.ts` - Main rule engine implementation
- `src/promotion/adapters/` - Condition adapters
- `src/promotion/promotion.controller.ts` - API endpoints
- `PROMOTION_ENGINE_POC.md` - Full documentation

## Built-in Promotion Rules

1. **Large Transfer Discount**: 10% off for amounts >= $1,000
2. **VIP Bonus**: $50 off for VIP users with amount >= $500
3. **Happy Hour**: 5% bonus for amounts >= $100 during 18:00-22:00

## Pattern Explanation

```
CONDITION (Adapters check facts)
    ↓
ACTION (Apply discount/bonus)
    ↓
SIDE EFFECT (Log to database, update stats)
```

## API Endpoints

- `POST /promotion/test` - Preview promotions (no side effects)
- `POST /promotion/evaluate` - Apply promotions (with side effects)
- `GET /promotion/history` - View promotion history

## Security & Quality

✅ Build passes  
✅ Linter passes  
✅ CodeQL scan: 0 vulnerabilities  
✅ Code review: Feedback addressed  

For full documentation, see `PROMOTION_ENGINE_POC.md`
