# API Testing Guide

This guide shows you how to manually test all API endpoints using the provided `api-tests.http` file.

## 📋 Prerequisites

1. **VS Code** with **REST Client Extension**
   - Install from: https://marketplace.visualstudio.com/items?itemName=humao.rest-client
   - Or search "REST Client" in VS Code Extensions

2. **Application Running**
   ```bash
   npm install
   npm run start:dev
   ```
   The application should be running on `http://localhost:8080`

3. **External Service** (Optional - for webhook testing)
   ```bash
   docker-compose up -d backend-interview
   ```

## 🚀 Quick Start

### Method 1: Using REST Client Extension (Recommended)

1. **Open the test file**
   ```
   File: api-tests.http
   ```

2. **Execute requests**
   - Click the `Send Request` link that appears above each request
   - Or use keyboard shortcut: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

3. **View responses**
   - A new panel opens showing the response
   - Status code, headers, and body are displayed

4. **Follow the sequence**
   - Execute requests in order (1 → 2 → 3 → ...)
   - Variables are automatically extracted from responses

### Method 2: Using cURL (Command Line)

If you prefer command line, here are the cURL equivalents:

#### Register User
```bash
curl -X POST http://localhost:8080/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "securepass123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "securepass123"
  }'
```

#### Get Balance (requires API key from login/register)
```bash
curl -X GET http://localhost:8080/balance \
  -H "x-api-key: YOUR_API_KEY_HERE"
```

#### Transfer Money
```bash
curl -X POST http://localhost:8080/transfer \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "recipientUsername": "bob",
    "amount": 50
  }'
```

### Method 3: Using Postman

1. **Import Collection**
   - Open Postman
   - Click "Import" → "Raw text"
   - Copy contents of `api-tests.http`
   - Postman will parse it automatically

2. **Set Variables**
   - Create environment variables for `baseUrl`, `aliceApiKey`, `bobApiKey`
   - Update them manually after registration/login

## 📝 Test Scenarios

### Scenario 1: Basic User Flow

**Purpose**: Test complete user lifecycle

```
1. Register User Alice (Request #1)
2. Login as Alice (Request #3)
3. Check Balance (Request #7) - Should be 0
4. Get Profile (Request #5) - Should show user details
```

**Expected Results**:
- ✅ Registration returns user object and API key
- ✅ Login returns new API key
- ✅ Balance is 0 for new user
- ✅ Profile shows username and balance

### Scenario 2: Transfer Validation

**Purpose**: Test transfer validation rules

```
1. Register Alice and Bob (Requests #1, #2)
2. Try to transfer without balance (Request #11) - Should FAIL
3. Try to transfer to non-existent user (Request #12) - Should FAIL
4. Try to transfer to self (Request #13) - Should FAIL
5. Try negative amount (Request #25) - Should FAIL
6. Try zero amount (Request #26) - Should FAIL
```

**Expected Results**:
- ❌ All transfers should fail with appropriate error messages
- ✅ Error messages clearly indicate the problem

### Scenario 3: Top-up Flow

**Purpose**: Test top-up functionality

```
1. Register User (Request #1)
2. Create Top-up Request (Request #15)
3. Check Top-up History (Request #17)
4. Simulate Webhook Success (Request #19)
5. Check Balance Again (Request #7)
```

**Expected Results**:
- ✅ Top-up created with PENDING status
- ✅ Webhook processes successfully
- ✅ Balance updated after webhook (Note: requires implementation)

### Scenario 4: Authentication & Authorization

**Purpose**: Test security

```
1. Access protected endpoint without API key (Request #21) - Should FAIL
2. Access with invalid API key (Request #22) - Should FAIL
3. Access with valid API key (Request #7) - Should SUCCESS
```

**Expected Results**:
- ❌ Requests without API key return 401 Unauthorized
- ❌ Requests with invalid API key return 401 Unauthorized
- ✅ Requests with valid API key succeed

### Scenario 5: Input Validation

**Purpose**: Test input validation

```
1. Empty username (Request #23) - Should FAIL
2. Short password (Request #24) - Should FAIL
3. Negative transfer amount (Request #25) - Should FAIL
4. Invalid top-up amount (Request #27) - Should FAIL
```

**Expected Results**:
- ❌ All requests should fail with 400 Bad Request
- ✅ Error messages describe validation failures

### Scenario 6: Complete User Journey

**Purpose**: Test realistic end-to-end flow

```
Execute requests in SCENARIO section (bottom of api-tests.http):
1. Register Charlie (Scenario Step 1)
2. Check initial balance - 0 (Scenario Step 2)
3. Create top-up (Scenario Step 3)
4. Simulate webhook (Scenario Step 5)
5. Check balance after top-up (Scenario Step 6)
6. Transfer to Bob (Scenario Step 7)
7. Check final balance (Scenario Step 8)
8. Verify Bob received transfer (Scenario Step 9)
9. Check transaction histories (Scenario Steps 10-12)
```

**Expected Results**:
- ✅ User created with 0 balance
- ✅ Top-up request created
- ✅ Webhook processes (Note: requires implementation)
- ✅ Transfer succeeds with sufficient balance
- ✅ Both users' balances updated correctly
- ✅ Transaction histories reflect all operations

## 🔧 REST Client Extension Features

### Variables

The `.http` file uses variables that are automatically extracted:

```http
# @name registerAlice
POST {{baseUrl}}/users/register
...

### Extract from response
@aliceApiKey = {{registerAlice.response.body.$.apiKey}}
```

### Request Chaining

Responses from one request can be used in subsequent requests:

```http
### Login
# @name loginAlice
POST {{baseUrl}}/users/login
...

### Use the API key from login
GET {{baseUrl}}/balance
x-api-key: {{loginAlice.response.body.$.apiKey}}
```

### Comments

Use `###` to separate requests and `#` for comments:

```http
### This is a request separator

# This is a comment
GET {{baseUrl}}/users/me
```

## 📊 Expected Response Formats

### Success Responses

**Register/Login**:
```json
{
  "user": {
    "id": "uuid",
    "username": "alice",
    "balance": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "apiKey": "ewallet_..."
}
```

**Get Balance**:
```json
{
  "userId": "uuid",
  "balance": 0
}
```

**Transfer**:
```json
{
  "id": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": 50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

**Validation Error**:
```json
{
  "message": [
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Unauthorized**:
```json
{
  "message": "API key is required",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Not Found**:
```json
{
  "message": "Recipient not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🐛 Troubleshooting

### Issue: "Connection Refused"

**Solution**:
```bash
# Make sure the application is running
npm run start:dev

# Check if it's listening on port 8080
curl http://localhost:8080/
```

### Issue: "Invalid API Key"

**Solution**:
- Make sure you're using the API key from the most recent login/register
- API keys are regenerated on each login
- Copy the `apiKey` field from the response

### Issue: "Variables not working"

**Solution**:
- Make sure you have REST Client extension installed
- Execute requests in order (variables are extracted from previous responses)
- Check that `@name` annotations are present above requests

### Issue: "Transfer fails with insufficient balance"

**Solution**:
- This is expected! Users start with 0 balance
- Top-up functionality requires external service integration (marked as CRITICAL in code)
- For testing transfers, you'll need to implement the webhook processing

## 📖 Additional Resources

### REST Client Extension Documentation
- [GitHub Repository](https://github.com/Huachao/vscode-restclient)
- [Usage Guide](https://github.com/Huachao/vscode-restclient/blob/master/README.md)

### API Documentation
- See `SETUP.md` for detailed API documentation
- See `README.md` for project overview
- See `TODO.md` for implementation guidance

## 🎯 Testing Checklist

Use this checklist to verify all endpoints:

### User Management
- [ ] Register user - Success
- [ ] Register duplicate user - Fail with 409
- [ ] Login with correct credentials - Success
- [ ] Login with wrong password - Fail with 401
- [ ] Get user profile with valid API key - Success
- [ ] Get user profile without API key - Fail with 401

### Balance Management
- [ ] Get balance with valid API key - Success
- [ ] Get balance without API key - Fail with 401
- [ ] Get transaction history - Success (empty initially)

### Transfer
- [ ] Transfer with insufficient balance - Fail with 400
- [ ] Transfer to non-existent user - Fail with 404
- [ ] Transfer to self - Fail with 400
- [ ] Transfer with negative amount - Fail with 400
- [ ] Transfer with zero amount - Fail with 400
- [ ] Get transfer history - Success

### Top-up
- [ ] Create top-up request - Success (PENDING status)
- [ ] Get top-up history - Success
- [ ] Simulate webhook - Success (requires implementation)

### Validation
- [ ] Empty username - Fail with 400
- [ ] Short password (<6 chars) - Fail with 400
- [ ] Invalid amounts - Fail with 400

## 💡 Tips

1. **Use Comments**: Add your own comments to track test results
2. **Save Responses**: REST Client allows saving responses for comparison
3. **Environment Files**: Create different `.http` files for dev/staging/prod
4. **Keyboard Shortcuts**: Learn `Ctrl+Alt+R` for faster testing
5. **Response History**: REST Client keeps history of all responses

## 🚦 Status Codes Reference

| Code | Meaning | When You'll See It |
|------|---------|-------------------|
| 200 | OK | Successful GET requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid API key |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate username |
| 500 | Server Error | Something went wrong (bug) |

---

**Happy Testing! 🎉**

If you find any issues or have questions, refer to the main documentation files or check the inline comments in the code.
