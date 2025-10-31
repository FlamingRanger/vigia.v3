# Dual-Currency System Documentation

## Overview

Vigia implements a two-currency off-chain model for DePIN infrastructure:

1. **Vigia Tokens (VT)** - Earned through validated hazard event contributions
2. **API Credits (AC)** - Spent on data/API access and marketplace purchases

## Currency Details

### Vigia Tokens (VT)

**Purpose:** Reward device owners for contributing validated hazard data to the network.

**Minting Rules:**
- Base reward per hazard type:
  - Pothole: 5 VT
  - Bump: 3 VT
  - Crack: 2 VT

- Severity multipliers:
  - Low: 1x
  - Medium: 1.3-1.5x
  - High: 1.8-2x
  - Critical: 2.2-3x

- Validation bonus: +2 VT for moderated/approved events
- Minimum confidence: 70% to qualify for rewards

**Example Rewards:**
| Hazard Type | Severity | Base VT | Multiplier | Total VT |
|-------------|----------|---------|------------|----------|
| Pothole | Low | 5 | 1x | 5 |
| Pothole | Medium | 5 | 1.5x | 7.5 → 8 |
| Pothole | High | 5 | 2x | 10 |
| Pothole | Critical | 5 | 3x | 15 |
| Bump | Low | 3 | 1x | 3 |
| Crack | Medium | 2 | 1.3x | 2.6 → 3 |

### API Credits (AC)

**Purpose:** Spent on data access, API calls, and marketplace purchases.

**Acquisition Methods:**

1. **Burn VT → AC** (Conversion: 10 Vigia Tokens = 1 API Credit)
   - Minimum burn: 10 VT (1 AC)
   - No maximum limit
   - One-way conversion only

2. **Purchase with INR** (Payment Simulation)
   - Rate: 1 API Credit = ₹10 INR
   - Minimum purchase: 10 AC (₹100)
   - Maximum purchase: 10,000 AC (₹1,00,000)
   - Payment methods: UPI, Card, Digital Wallet

## API Endpoints

### 1. Mint Vigia Tokens (Automatic on Event Creation)

**Endpoint:** `POST /api/events`

**Request:**
```json
{
  "device_id": "device_uuid",
  "event_type": "pothole",
  "severity": "high",
  "latitude": 19.076,
  "longitude": 72.8777,
  "confidence_score": 0.85,
  "metadata": {}
}
```

**Response:**
```json
{
  "id": "event_uuid",
  "device_id": "device_uuid",
  "vt_reward": 10,
  "created_at": "2025-10-31T..."
}
```

### 2. Burn VT → AC

**Endpoint:** `POST /api/burn`

**Request:**
```json
{
  "amount_vt": 100
}
```

**Response:**
```json
{
  "success": true,
  "vt_burned": 100,
  "ac_earned": 10,
  "new_balances": {
    "points": 450,
    "credits": 110
  }
}
```

### 3. Buy API Credits with INR (Simulated)

**Endpoint:** `POST /api/buy`

**Request:**
```json
{
  "amount_ac": 50,
  "payment_method": "UPI"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "INR1769188463Xy9F2K",
    "amount_ac": 50,
    "cost_inr": 500,
    "payment_method": "UPI",
    "status": "completed"
  },
  "invoice_url": "https://vigia.in/invoice/INR1769188463Xy9F2K",
  "new_balance": {
    "credits": 150
  }
}
```

### 4. Get Wallet Balance

**Endpoint:** `GET /api/wallet`

**Response:**
```json
{
  "user_id": "user_uuid",
  "email": "user@example.com",
  "credits": 150.5,
  "points": 450,
  "reputation_score": 125
}
```

## Transaction Types

All currency transactions are logged in the `transactions` table:

1. **`rewards`** - Vigia Tokens minted from hazard events
2. **`burn_points`** - VT converted to AC
3. **`buy_credits`** - API Credits purchased with INR
4. **`marketplace_purchase`** - AC spent on datasets

## Database Schema

### Users Table
```sql
credits DECIMAL(18, 8) DEFAULT 0  -- API Credits (AC)
points DECIMAL(18, 8) DEFAULT 0   -- Vigia Tokens (VT)
```

### Transactions Table
```sql
transaction_type TEXT CHECK (status IN ('buy_credits', 'burn_points', 'marketplace_purchase', 'rewards'))
amount DECIMAL(18, 8) NOT NULL
balance_before DECIMAL(18, 8)
balance_after DECIMAL(18, 8)
metadata JSONB  -- Additional transaction details
```

## Configuration

Edit currency rules in `lib/currency.ts`:

```typescript
// Conversion rate
export const CONVERSION_RATE = 10  // 10 VT = 1 AC

// Purchase settings
export const PAYMENT = {
  CURRENCY: "INR",
  RATE_PER_AC: 10,        // 1 AC = ₹10
  MIN_PURCHASE_AC: 10,    // Min ₹100
  MAX_PURCHASE_AC: 10000  // Max ₹1,00,000
}

// Minting rules
export const MINTING_RULES = {
  HAZARD_REWARD: {
    pothole: { base: 5, ... },
    bump: { base: 3, ... },
    crack: { base: 2, ... }
  },
  VALIDATION_BONUS: 2,
  MINIMUM_CONFIDENCE: 0.7
}
```

## Future Enhancements

### On-Chain Mirroring (Read-Only)
- Export ledger events to blockchain (Ethereum, Polygon)
- Hash-based verification
- Immutable audit trail
- No state changes on-chain

### Advanced Features
- Vigia Token staking for governance
- Credit subscription plans
- Bulk discounts
- Referral rewards
- Seasonal bonuses

## Security Notes

1. **Off-Chain Only:** All balances stored in Supabase, not blockchain
2. **Simulated Payments:** Production should integrate Razorpay/Stripe
3. **Rate Limiting:** Implement on mint/burn endpoints
4. **Audit Trail:** All transactions logged with metadata
5. **RLS Policies:** Users can only view their own transactions

## Testing

Test the currency system:

```bash
# 1. Create a hazard event (auto-mints VT)
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "dev_001",
    "event_type": "pothole",
    "severity": "high",
    "confidence_score": 0.9
  }'

# 2. Burn VT for AC
curl -X POST http://localhost:3000/api/burn \
  -H "Content-Type: application/json" \
  -d '{"amount_vt": 50}'

# 3. Buy AC with INR
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{"amount_ac": 100, "payment_method": "UPI"}'

# 4. Check balance
curl http://localhost:3000/api/wallet
```

## Support

For currency system questions or issues, check:
- `lib/currency.ts` - Core logic and constants
- API routes in `app/api/events|burn|buy|wallet`
- Database schema in `scripts/01-schema.sql`

