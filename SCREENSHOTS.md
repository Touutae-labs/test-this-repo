# API Testing Screenshots & Examples

This document shows visual examples of how to use the `api-tests.http` file.

## 📸 Visual Guide

### 1. REST Client Extension in VS Code

When you open `api-tests.http` in VS Code with the REST Client extension, you'll see:

```
### 1. Register User - Alice
# @name registerAlice
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securepass123"
}
```

**Above the request**, you'll see a clickable `Send Request` link.

### 2. Sending a Request

Click `Send Request` and a new panel opens showing:

**Request Tab**:
```
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securepass123"
}
```

**Response Tab**:
```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 234

{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "alice",
    "balance": 0,
    "createdAt": "2024-10-07T10:30:00.000Z",
    "updatedAt": "2024-10-07T10:30:00.000Z"
  },
  "apiKey": "ewallet_a1b2c3d4e5f67890abcdef1234567890"
}
```

### 3. Using Variables

After executing the register request, the API key is automatically extracted:

```http
### Extract Alice's API Key
@aliceApiKey = {{registerAlice.response.body.$.apiKey}}
```

Now you can use `{{aliceApiKey}}` in subsequent requests:

```http
### 5. Get User Profile - Alice
GET http://localhost:8080/users/me
x-api-key: {{aliceApiKey}}
```

The `{{aliceApiKey}}` will be automatically replaced with the actual key.

### 4. Example Request Flow

**Step 1: Register**
```http
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securepass123"
}
```

Response:
```json
{
  "user": { ... },
  "apiKey": "ewallet_abc123..."
}
```

**Step 2: Get Balance**
```http
GET http://localhost:8080/balance
x-api-key: {{aliceApiKey}}
```

Response:
```json
{
  "userId": "a1b2c3...",
  "balance": 0
}
```

**Step 3: Try Transfer (will fail)**
```http
POST http://localhost:8080/transfer
Content-Type: application/json
x-api-key: {{aliceApiKey}}

{
  "recipientUsername": "bob",
  "amount": 50
}
```

Response:
```json
{
  "message": "Insufficient balance",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🎨 Color Coding

In VS Code with REST Client:
- **Request method** (POST, GET): Blue/Green
- **URL**: Blue underlined
- **Headers**: Gray
- **JSON body**: Color-coded (keys, strings, numbers)
- **Variables** ({{variable}}): Purple/Orange

## 📝 Example Test Session

### Complete User Journey

1. **Register Alice**
   ```
   ✅ 201 Created
   Got API key: ewallet_abc123...
   ```

2. **Check Balance**
   ```
   ✅ 200 OK
   Balance: 0
   ```

3. **Create Top-up**
   ```
   ✅ 201 Created
   Status: PENDING
   ```

4. **Try Transfer (fails)**
   ```
   ❌ 400 Bad Request
   Message: "Insufficient balance"
   ```

5. **Check History**
   ```
   ✅ 200 OK
   Transactions: []
   ```

## 🔍 Response Examples

### Success Response - Register
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "user": {
    "id": "uuid-here",
    "username": "alice",
    "balance": 0,
    "createdAt": "2024-10-07T10:30:00.000Z",
    "updatedAt": "2024-10-07T10:30:00.000Z"
  },
  "apiKey": "ewallet_longkeyhere"
}
```

### Error Response - Validation
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "message": [
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Error Response - Unauthorized
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "API key is required",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### Error Response - Not Found
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "Recipient not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🎯 Tips for Using REST Client

### Keyboard Shortcuts
- **Send Request**: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)
- **Send All Requests in File**: `Ctrl+Alt+L` or `Cmd+Alt+L`
- **Cancel Request**: `Ctrl+Alt+K` or `Cmd+Alt+K`

### Environment Variables
You can create a `.vscode/settings.json` file:

```json
{
  "rest-client.environmentVariables": {
    "$shared": {
      "baseUrl": "http://localhost:8080"
    },
    "local": {
      "baseUrl": "http://localhost:8080"
    },
    "staging": {
      "baseUrl": "https://staging.example.com"
    },
    "production": {
      "baseUrl": "https://api.example.com"
    }
  }
}
```

### Response History
- REST Client saves all responses
- Access via command palette: `Rest Client: Request History`
- Compare responses side-by-side

### Save Response to File
Right-click on response panel → `Save Response` → Choose location

## 🚀 Advanced Usage

### Dynamic Variables
```http
### Using timestamp
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "user_{{$timestamp}}",
  "password": "password123"
}
```

### Request with Multiple Headers
```http
POST http://localhost:8080/transfer
Content-Type: application/json
x-api-key: {{aliceApiKey}}
x-request-id: {{$guid}}
x-timestamp: {{$timestamp}}

{
  "recipientUsername": "bob",
  "amount": 50
}
```

### Debugging
Add comments to track your testing:
```http
### Test Case: Transfer with insufficient balance
### Expected: 400 Bad Request
### Date: 2024-10-07
POST http://localhost:8080/transfer
Content-Type: application/json
x-api-key: {{aliceApiKey}}

{
  "recipientUsername": "bob",
  "amount": 50
}

### Result: ✅ Passed - Got 400 as expected
### Message: "Insufficient balance"
```

## 📊 Testing Checklist

Use this visual checklist while testing:

```
User Management
├── ✅ Register user (alice)
├── ✅ Register user (bob)
├── ✅ Login as alice
├── ✅ Get alice profile
├── ❌ Duplicate registration (should fail)
└── ❌ Wrong password (should fail)

Balance Management
├── ✅ Check balance (alice)
├── ✅ Check balance (bob)
├── ✅ Get transaction history (alice)
└── ✅ Get transaction history (bob)

Transfer
├── ❌ Transfer without balance (should fail)
├── ❌ Transfer to non-existent user (should fail)
├── ❌ Transfer to self (should fail)
├── ❌ Transfer negative amount (should fail)
└── ✅ Get transfer history

Top-up
├── ✅ Create top-up request
├── ✅ Get top-up history
├── ⚠️  Simulate webhook (requires implementation)
└── ⚠️  Check balance after top-up (requires implementation)

Authentication
├── ❌ Access without API key (should fail)
└── ❌ Access with invalid key (should fail)

Validation
├── ❌ Empty username (should fail)
├── ❌ Short password (should fail)
└── ❌ Invalid amounts (should fail)
```

Legend:
- ✅ Success expected and working
- ❌ Failure expected and working
- ⚠️ Requires additional implementation

---

**Note**: Replace this document with actual screenshots if needed. This text-based guide shows what you'll see when using the REST Client extension.
