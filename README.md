# SolStream – A New Standard for Payments

Every once in a while, a product comes along that changes everything. It doesn't just improve what came before. It redefines what's possible.

Today, that product is SolStream.

## The Old Way

Online payments are stuck in the past. Businesses pay high fees to middlemen like PayPal. Stripe demands registrations, tax IDs, GST numbers, approvals. Customers are forced into clunky flows, clicking through wallets and popups, exposing themselves to scams and exploits.

It's complicated. It's insecure. It's expensive.

## The New Way

SolStream makes payments effortless.

Imagine this: a business wants to accept crypto. Instead of contracts, verifications, SDKs, or compliance hurdles, they drop a single button on their website. That's it.

A customer clicks. They enter their crypto ID. Instantly, they receive a payment request, securely delivered by email. On their trusted device, they approve it. Done.

The merchant gets an invoice. A real-time dashboard. Analytics that make sense. No noise, no friction, no middlemen.

**It just works.**

## What Sets SolStream Apart

### The Button
One line of code, and any website can accept crypto.

### Email-First Security
Payment requests flow through the inbox, not injected wallets. It's safer, simpler, human.

### Trusted Devices
Customers pay where they feel secure — their phone, their personal device — not inside an unfamiliar popup.

### Real-Time Accuracy
Powered by live price feeds, every transaction is settled at the right value, every time.

### The Merchant Hub
Invoices, analytics, and payment history in one clean dashboard. Not scattered, not hidden.

## Technical Implementation

> **Note:** SolStream currently supports Solana blockchain only. The architecture is designed to be extensible for future multi-chain support, but the current implementation focuses on Solana with Phantom wallet integration.

### Project Structure

```
src/
├── app/                           # Next.js 15 App Router
│   ├── api/                      # Backend API routes
│   │   ├── create-transaction/   # Transaction creation endpoint
│   │   ├── prices/               # Real-time crypto pricing
│   │   ├── test-pyth/            # Pyth Network testing
│   │   └── transaction-status/[id]/  # Status polling endpoint
│   ├── buttons/                  # Button management pages
│   │   ├── page.tsx              # Buttons dashboard
│   │   └── [id]/page.tsx         # Individual button view
│   ├── pay/[id]/                 # Payment completion flow
│   ├── history/                  # Transaction history
│   ├── settings/                 # User profile settings
│   ├── onboard/                  # User onboarding
│   ├── sign-in/                  # Authentication
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                  # Landing page route
│   ├── Provider.tsx              # App-wide providers
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── ui/                       # Reusable UI components (Shadcn)
│   ├── PaymentButtonPage.tsx     # Embeddable payment button
│   ├── CreateButtonDialog.tsx    # Button creation modal
│   ├── NavBar.tsx                # Navigation component
│   ├── MainDashboard.tsx         # Main dashboard
│   ├── LandingPage.tsx           # Landing page component
│   ├── ButtonsPage.tsx           # Buttons management page
│   ├── HistroyPage.tsx           # Transaction history page
│   ├── ProfileSettings.tsx       # Profile settings component
│   ├── OnBoard.tsx               # Onboarding component
│   ├── ButtonList.tsx            # Button list component
│   ├── WalletConnect.tsx         # Wallet connection component
│   └── SolanaWalletProvider.tsx  # Solana wallet provider wrapper
├── models/                        # MongoDB schemas
│   ├── buttonModel.ts            # Payment button schema
│   ├── transactionModel.ts      # Transaction schema
│   └── profileModel.ts           # User profile schema
├── actions/                       # Server actions
│   ├── buttonActions.ts          # Button CRUD operations
│   ├── transactionActions.ts    # Transaction operations
│   └── userActions.ts           # User profile operations
├── lib/                          # Utility libraries
│   ├── mail.ts                   # Email notification system
│   ├── pyth.ts                   # Pyth Network integration
│   └── utils.ts                  # Common utilities
├── utils/                         # Helper functions
│   ├── buttonComponentCode.ts    # Generated component code
│   ├── blockExplorer.ts          # Blockchain explorer utilities
│   └── chain.ts                  # Blockchain configuration
├── database/                      # Database configuration
│   └── index.ts                  # MongoDB connection
├── types/                         # TypeScript definitions
│   └── button.ts                 # Button type definitions
├── middleware.ts                  # Next.js middleware
└── Provider.tsx                   # Additional provider wrapper
```

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Merchant      │    │   Customer      │    │   Email         │
│   Dashboard     │    │   Website       │    │   Notification  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Create Button│ │    │ │Payment Btn  │ │    │ │Payment Link │ │
│ │Configure    │ │    │ │Click & ID   │ │    │ │Secure Email │ │
│ │Generate Code│ │────▶│ │Entry        │ │────▶│ │Trusted Flow │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Pyth Network  │    │   Solana        │
│   Database      │    │   Price Feeds   │    │   Blockchain    │
│                 │    │                 │    │                 │
│ • Buttons       │    │ • SOL/USD       │    │ • Solana        │
│ • Transactions  │    │ • Live Pricing   │    │   Mainnet       │
│ • Profiles      │    │ • Real-time     │    │ • Phantom Wallet│
│ • Real-time     │    │   Updates       │    │ • Wallet Adapter│
│   Updates       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Payment Flow Architecture

1. **Button Creation Flow:**
   Merchant → CreateButtonDialog → MongoDB → Generated Embed Code

2. **Payment Initiation Flow:**
   Customer → PaymentButton → Crypto ID → Email Notification

3. **Payment Completion Flow:**
   Email Link → pay/[id] → Solana Wallet Connect (Phantom) → Transaction → Status Update

4. **Real-time Updates:**
   Transaction Status → Polling → MongoDB → Merchant Dashboard

### Core Components

#### 1. PaymentButtonPage.tsx - The Embeddable Button

```typescript
interface PaymentButtonProps {
  buttonId: string;
  amountUsd: number;
  currency?: string;
  merchantName?: string;
  onTransactionStateChange?: (
    state: "success" | "failed" | "timeout" | "error",
    transactionId: string
  ) => void;
}

// Key Features:
// - Crypto ID input collection via dialog
// - Real-time transaction status polling
// - Status state management (creating, pending, success, failed)
// - Automatic cleanup and reset functionality
// - Toast notifications for user feedback
// - Transaction timeout handling
```

#### 2. pay/[id]/page.tsx - Payment Completion Interface

```typescript
// Solana payment processing with:
// - Solana Wallet Adapter for blockchain interaction
// - Real-time price fetching from Pyth Network (SOL/USD)
// - Phantom wallet integration
// - Transaction confirmation and status updates
// - Connection to Solana mainnet via RPC endpoint

// Supported Chain:
// - "solana": Solana Mainnet
```

#### 3. Database Models & Relationships

**Button Model (buttonModel.ts)**
```typescript
{
  userId: string,           // Creator's Clerk user ID
  name: string,            // Display name for button
  description?: string,    // Optional product description
  amountUsd: number,       // Fixed USD amount
  chainId: string[],       // Supported blockchain networks
  merchantAddress: string, // Merchant's receiving wallet
  transactions: ObjectId[], // Associated transaction refs
  isActive: boolean,       // Button enable/disable status
  timestamps: true         // Auto createdAt/updatedAt
}
```

**Transaction Model (transactionModel.ts)**
```typescript
{
  from: string,            // Customer email address
  to: string,             // Merchant wallet address
  signature?: string,     // Blockchain transaction hash
  chainId: string,        // Blockchain network ID
  time: Date,            // Transaction creation time
  status: "pending" | "success" | "failed",
  buttonId: ObjectId,    // Reference to originating button
  amountUsd: number,     // Original USD amount
}
```

**Profile Model (profileModel.ts)**
```typescript
{
  userId: string,         // Unique Clerk user ID
  email: string,         // User email (unique)
  cryptId: string,       // Custom crypto identifier (unique)
  username: string,      // Display username (unique)
  buttons: ObjectId[]    // Array of created button references
}
```

#### 4. Real-Time Price Integration

**Pyth Network Price Feeds (prices/route.ts & lib/pyth.ts)**

```typescript
const PRICE_FEED_IDS = {
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' // SOL/USD
};

// Live price calculation for any USD amount on Solana
GET /api/prices?amount=100&chainId=solana
// Returns: { nativeAmount: 0.234, tokenSymbol: "SOL", price: 427.45 }

// Get conversions for all supported chains (currently Solana only)
GET /api/prices?amount=100
// Returns: { usdAmount: 100, conversions: { solana: { nativeAmount: 0.234, tokenSymbol: "SOL", price: 427.45 } } }
```

#### 5. Email Notification System

**Secure Payment Links (mail.ts)**

```typescript
const payUrl = `${process.env.API_URL}/pay/${transactionId}`;

// HTML email template with:
// - Payment amount and details
// - Secure payment link to pay/[id] page
// - Professional SolStream branding
// - Anti-phishing security measures
```

### Transaction Lifecycle

1. **BUTTON_CREATION**
   Merchant → CreateButtonDialog → buttonActions.createButton() → MongoDB

2. **PAYMENT_INITIATION**
   Customer → PaymentButton → Crypto ID → create-transaction API

3. **EMAIL_NOTIFICATION**
   Transaction Created → sendTransactionMail() → Customer Email

4. **PAYMENT_COMPLETION**
   Email Link → pay/[id] → Wallet Connect → Blockchain Transaction

5. **STATUS_TRACKING**
   Real-time Polling → transaction-status/[id] → Status Updates

6. **CONFIRMATION**
   Success → updateTransactionStatus() → Merchant Notification

### API Endpoints

#### Transaction Management

**POST /api/create-transaction**
```typescript
// Creates transaction record and sends email notification
{
  buttonId: string,
  cryptoId: string,
  amountUsd: number,
  currency?: string
}
```

**GET /api/transaction-status/[id]**
```typescript
// Real-time transaction status polling
// Returns: { status: "pending" | "success" | "failed" }
```

#### Price Management

**GET /api/prices?amount={usd}&chainId={chain}**
```typescript
// Multi-chain price calculation using Pyth feeds
// Returns current crypto equivalent for USD amount
```

**GET /api/test-pyth**
```typescript
// Pyth Network connectivity testing endpoint
```

### Security Features

- **Email-First Architecture** - No wallet injections or popups
- **Clerk Authentication** - Secure user session management
- **Unique Crypto IDs** - Custom identifiers linked to emails
- **Real-Time Price Protection** - Pyth Network prevents manipulation
- **Solana Blockchain** - Fast, low-cost transactions on Solana mainnet
- **Phantom Wallet Integration** - Seamless wallet connection via Solana Wallet Adapter
- **Trusted Device Approval** - Payments on user's preferred device

### Technology Stack

#### Core Framework
- **Next.js 15.5.4** (App Router)
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 4**

#### Blockchain (Solana)
- **@solana/web3.js 1.98.4** (Solana JavaScript library)
- **@solana/wallet-adapter-react 0.15.39** (Wallet adapter)
- **@solana/wallet-adapter-phantom 0.9.28** (Phantom wallet support)
- **@solana/wallet-adapter-react-ui 0.9.39** (Wallet UI components)

#### Database & Auth
- **MongoDB 6.19.0**
- **Mongoose 8.18.1**
- **Clerk (@clerk/nextjs 6.31.10)** (Authentication)

#### External APIs
- **Pyth Network** (SOL/USD price feeds)
- **Nodemailer 7.0.6** (Email delivery via Gmail SMTP)

#### UI Components
- **Shadcn UI 3.3.1** (Component library)
- **Radix UI** (Primitive components)
- **Lucide React 0.544.0** (Icons)
- **Sonner 2.0.7** (Toast notifications)
- **Next Themes 0.4.6** (Theme provider)

## Why This Matters

Business owners want to focus on running their business, not on chasing invoices or wrestling with gateways. They want payments that are direct, reliable, transparent.

SolStream gives them exactly that. No GST numbers. No endless approvals. No 3% fees. Just a button, a request, and a payment.

For customers, it means trust. No wallet popups. No phishing risk. No confusion. Just a request they can see, approve, and move on.

It's the simplicity of PayPal, without the cost. The reach of Stripe, without the red tape. And the power of crypto, without the chaos.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas or local instance)
- Gmail account with App Password (for email notifications)
- Clerk account (for authentication)
- Solana wallet (Phantom recommended for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solstream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env.local file with required variables:
   MONGO_URL=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   MAIL_PASS=your_gmail_app_password
   API_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # Optional: Custom Solana RPC endpoint (defaults to Ankr public RPC)
   NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.ankr.com/solana
   ```

4. **Run development server**
   ```bash
   npm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Quick Start Guide

1. **Sign up** - Create your SolStream account via Clerk authentication
2. **Onboard** - Complete your profile setup with username and crypto ID
3. **Connect wallet** - Link your Solana receiving wallet address
4. **Create button** - Set amount, description, and configure your payment button
5. **Get embed code** - Copy the generated button code from the button details page
6. **Add to website** - Paste the code wherever you want payments
7. **Start receiving** - Customers can now pay with SOL via email

### Deployment

#### Environment Setup
```bash
# Production build
npm run build

# Start production server
npm start
```

#### Platform Support
- **Vercel** - Optimized for Next.js deployment (recommended)
- **AWS/Digital Ocean** - Full Node.js server support
- **Docker** - Containerized deployment ready

#### Important Notes for Deployment

- Ensure all environment variables are set in your hosting platform
- MongoDB connection string must be accessible from your deployment environment
- Gmail App Password must be configured for email notifications
- Clerk authentication keys must be set for production
- Solana RPC endpoint: Defaults to Ankr public RPC, but consider using a dedicated RPC provider for production (e.g., Helius, QuickNode) for better reliability

## The Vision

One button that works everywhere. One dashboard that tells you everything. One place to pay any kind of request.

This is not just another tool. It's a new standard. A standard for how payments should be: simple, transparent, and human.

With SolStream, we're not just building a product. We're reimagining commerce itself.

---

**Built with ❤️ for the future of payments**
