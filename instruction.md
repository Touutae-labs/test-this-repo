# Backend Engineer Exam - E-Wallet Service

## Overview

You are a backend engineer working under Mr. Roney Jae, the CTO of a new generation fintech ecosystem. Mr. Roney Jae wants you to implement a POC e-wallet backend system that they will use to raise funds for their visionary fintech startup.

## Required Features

### 1. 👤 User Management

- **Create User** [REQUIRED]: Simple username and password authentication
- **User Registration** [REQUIRED]: Allow new users to sign up with basic credentials
- **User Authentication** [REQUIRED]: Ensure that users are authenticated in order to use the API; the authentication method is freely chosen.

### 2. 💰 Balance Management

- **View Balance** [REQUIRED]: Each user should be able to view their current wallet balance
- **Balance History** [OPTIONAL]: Track balance changes over time (optional but recommended)

### 3. 💳 Top-up Functionality

- **External Service Integration** [REQUIRED]: Use the external service provided in docker-compose.yml
- **Top-up Process** [REQUIRED]: Implement secure top-up flow using external payment service
- **Transaction Recording** [OPTIONAL]: Record all top-up transactions

### 4. 🔄 Money Transfer

- **Transfer Money** [REQUIRED]: Allow users to transfer money between accounts
- **Transfer Validation** [REQUIRED]: Ensure sufficient balance and valid recipient
- **Transfer History** [OPTIONAL]: Track all transfer transactions

## Technical Requirements

### Framework & Language

- **NestJS**: Use NestJS framework for the backend service
- **TypeScript**: Implement in TypeScript for type safety
- **Node.js**: Latest LTS version recommended

### Database

- **Free Choice**: You can choose any database (PostgreSQL, MySQL, MongoDB, etc.) or no database at all.
- **Data Persistence**: Ensure all user data, balances, and transactions are properly stored
- **Data Integrity**: Implement proper constraints and validations

### API Design

- **RESTful API**: Design clean, RESTful endpoints
- **Free Choice**: You have complete freedom in API endpoint design

## External Service Integration

### Service Details

The external service is provided via Docker Compose with the following configuration:

```yaml
services:
  backend-interview:
    image: apemon/backend-interview:latest
    ports:
      - "3000:3000"
    environment:
      - WEBHOOK_URL=http://your-webhook-url
      - WEBHOOK_SECRET=your-webhook-secret
      - API_KEY=your-api-key
      - SUCCESS_TOPUP_STATUS_RATE=0.9
      - IGNORE_WEBHOOK_RATE=0.1
```

**API Documentation**: The external service provides Swagger documentation at `http://localhost:3000/doc` endpoint. This documentation contains all available API endpoints and request/response schemas.

### Environment Variables Explained

- **WEBHOOK_URL**: URL where the external service will send webhook notifications
- **WEBHOOK_SECRET**: Secret key for webhook signature verification
- **API_KEY**: API key for authenticating with the external service
- **SUCCESS_TOPUP_STATUS_RATE**: Probability rate for successful top-up (0.9 = 90% success rate)
- **IGNORE_WEBHOOK_RATE**: Probability rate for ignoring webhook notifications (0.1 = 10% ignore rate)

### Integration Requirements

- **API Communication**: Implement HTTP client to communicate with the external service
- **Webhook Handling**: Set up webhook endpoint to receive payment notifications

## AI Assistance Policy

- **AI Usage**: Use of AI-assisted development is acceptable.
- **Responsibility**: You are fully responsible for all code generated, whether by AI or yourself
- **Understanding**: Ensure you understand all code in your submission
- **Customization**: Customize and adapt AI-generated code to fit your specific requirements

## Submission

Submit your complete project with:

- Source code
- Setup instructions
- Any additional configuration files

Good luck with your implementation!
