# Delar — Decentralized Digital Product Marketplace

![Sui](https://img.shields.io/badge/Built%20on-Sui-4CA2FF?style=flat-square&logo=sui&logoColor=white)
![Walrus](https://img.shields.io/badge/Storage-Walrus-6C3FC7?style=flat-square)
![Seal](https://img.shields.io/badge/Encryption-Seal-00B8A9?style=flat-square)
![Tatum](https://img.shields.io/badge/RPC-Tatum-FF6D00?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![Move](https://img.shields.io/badge/Contracts-Move-4CA2FF?style=flat-square)
![Network](https://img.shields.io/badge/Network-Testnet-yellow?style=flat-square)

**Delar** is a decentralized marketplace for digital products built on [Sui](https://sui.io). Creators publish encrypted files, buyers pay USDC on-chain, and content is gated via threshold identity-based encryption (Seal). No central server. No chargebacks. No deplatforming.

Built for the **Tatum x Walrus Hackathon**.

---

## Problem

Creators everywhere face the same problems: geo-blocked payments, delayed payouts, high platform fees, account suspensions, content takedowns, and chargeback fraud.

Traditional digital product marketplaces force creators into a broken system:

- **Geo-blocked payments** — platforms like Stripe and PayPal are unavailable or restricted in many countries
- **Delayed payouts** — waiting 30+ days to receive money already earned
- **High platform fees** — traditional marketplaces take 20–50% of every sale
- **Account suspensions & content takedowns** — centralized platforms can delist creators or freeze payouts without recourse
- **Chargeback fraud** — credit card chargebacks leave creators unpaid after delivering their work
- **Piracy through sharing** — once a file is downloaded, it can be freely redistributed

Delar changes that.

Delar is a decentralized digital marketplace built on Sui where creators can sell digital products directly to anyone in the world and get paid instantly in USDC — using on-chain settlement, decentralized encrypted storage (Walrus), and identity-based access control (Seal). The file itself never lives on a server the operator controls, and decryption is gated by ownership of a `PurchaseReceipt` that cannot be transferred or copied.

No Stripe. No PayPal. No waiting 30 days to get paid. No platform taking most of your revenue.

Built on Sui, powered by Walrus, protected by Seal.

The creator economy — without borders, without middlemen, without permission.

---

## How It Works

### For Creators
1. **Connect wallet** — sign in with any Sui-compatible wallet
2. **Upload your product** — pick a file and set your price in USDC; Delar encrypts it locally and uploads the ciphertext to Walrus automatically
3. **Get paid instantly** — every purchase triggers an on-chain USDC transfer directly to your wallet; no holding period, no withdrawal requests

### For Buyers
1. **Browse & buy** — find a product, click Buy Now, and sign a single transaction in your wallet
2. **Receive your receipt** — a soulbound on-chain receipt is minted to your wallet as proof of purchase
3. **Download & decrypt** — open your Library, click Download, sign once to create a session key, and the file decrypts locally in your browser

---

## Features

- **Product uploads in minutes** — creators publish digital products with a simple upload flow; encryption and storage happen automatically in the browser
- **Secure file encryption with Seal** — files are encrypted client-side using Mysten Labs' threshold identity-based encryption before leaving the creator's machine
- **Permanent decentralized storage on Walrus** — encrypted blobs are stored on Walrus with configurable epoch retention, not on any server Delar controls
- **Instant creator payouts in USDC** — payment flows atomically on-chain; creators receive USDC the moment a purchase completes
- **On-chain purchase receipts** — every purchase mints a soulbound `PurchaseReceipt` NFT on Sui — a permanent, non-transferable proof of purchase
- **Secure buyer-only downloads** — Seal key servers verify on-chain ownership before releasing decryption shards; only the receipt holder can decrypt
- **Transparent affiliate commissions paid automatically on-chain** — creators set affiliate rates per product; commissions are split and paid atomically at checkout with no manual payouts
- **Creator dashboard & analytics** — track sales, revenue, and product performance in one place
- **Buyer library** — purchased products live in the buyer's library, ready to download and decrypt at any time
- **Creator profiles** — public storefronts for creators to showcase their catalogue

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React App)                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Discover  │  │  Product  │  │ Dashboard│  │  Library  │  │
│  │  Page     │  │  Detail   │  │  (Creator)│  │  (Buyer)  │  │
│  └─────┬────┘  └─────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│        │              │             │              │         │
│  ┌─────┴──────────────┴─────────────┴──────────────┴─────┐  │
│  │                  Services Layer                        │  │
│  │  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │  Walrus  │ │  Seal     │ │  Tatum   │ │  Sui    │  │  │
│  │  │  (blobs) │ │  (crypto) │ │  (RPC)   │ │  (tx)   │  │  │
│  │  └────┬────┘ └─────┬─────┘ └────┬─────┘ └────┬────┘  │  │
│  └───────┼────────────┼────────────┼─────────────┼───────┘  │
└──────────┼────────────┼────────────┼─────────────┼──────────┘
           │            │            │             │
     Walrus Storage   Seal Key    Tatum RPC    Sui Fullnode
     (blobs)         Servers      Gateway
```

### Data Flow

**Publishing (Creator):**
```
Creator uploads file
  → Encrypt locally with Seal (generates random 32-byte seal_id)
  → Upload encrypted blob to Walrus → get blobId
  → Call publish_product(product_id, blob_id, seal_id, ...) on Sui
  → ProductListing created (owned by creator)
```

**Purchase (Buyer):**
```
Buyer clicks "Buy Now"
  → Wallet signs Sui Transaction calling checkout::buy()
  → USDC split: protocol fee → treasury | affiliate → referrer | rest → creator
  → PurchaseReceipt minted to buyer (contains blob_id + seal_id)
  → Receipt is soulbound (no store ability — cannot be transferred)
```

**Download & Decrypt (Buyer):**
```
Buyer clicks "Download & Decrypt"
  → Fetch encrypted blob from Walrus aggregator
  → Parse Seal ciphertext to extract identity
  → Create/restore SessionKey (sign once per 30 min)
  → Build seal_approve Move transaction (never submitted — onlyTransactionKind)
  → Seal key servers simulate the transaction to verify access
  → If access verified, key servers return decryption shards
  → Decrypt locally in browser
  → Save file with original filename
```

---

## Key Design Decisions

### Seal Identity Binding

Each product gets a random 32-byte `seal_id` generated at encrypt time. This ID is stored in both the `ProductListing` and the `PurchaseReceipt` on-chain. The `seal_approve` function checks:

```move
assert!(receipt.buyer() == ctx.sender(), ENoAccess);
assert!(id_ends_with(id, receipt.seal_id()), ENoAccess);
```

This binds the ciphertext to a specific purchase without requiring the product ID to be known ahead of time.

### SessionKey Pattern

Instead of signing every decryption request, the buyer signs one `SessionKey` per 30-minute session. The session key is cached in IndexedDB and reused across downloads. This is the same pattern used by IoTrade and is essential for production UX.

### PurchaseReceipt is Soulbound

The `PurchaseReceipt` has only `key` ability — no `store`. Sui's VM enforces that these objects cannot be transferred, sold, or shared. This makes each receipt a permanent, non-transferable proof of purchase that doubles as the Seal decryption credential.

---

## Repository Layout

```
delar/
├── README.md
├── delar/                          # Sui Move smart contracts
│   ├── Move.toml
│   ├── sources/
│   │   ├── fee.move                # ProtocolFeeConfig (shared object)
│   │   ├── product.move            # ProductListing, publish, affiliate mgmt
│   │   ├── receipt.move            # PurchaseReceipt (soulbound NFT)
│   │   ├── seal_access.move        # seal_approve access policy for Seal
│   │   └── checkout.move           # buy() entry point with USDC settlement
│   └── tests/
│       └── checkout_tests.move     # 7 unit tests
├── frontend/                       # React SPA (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DiscoverPage.jsx    # Browse marketplace products
│   │   │   ├── ProductDetailPage.jsx # Product detail + purchase
│   │   │   ├── LibraryPage.jsx     # Purchased products (download & decrypt)
│   │   │   ├── DashboardPage.jsx   # Creator dashboard + publish flow
│   │   │   └── CreatorProfilePage.jsx # Creator profile view
│   │   ├── hooks/
│   │   │   ├── useProducts.js      # Fetch product listings from Sui
│   │   │   ├── useBuy.js           # Purchase transaction hook
│   │   │   ├── useReceipts.js      # Fetch owned PurchaseReceipts
│   │   │   ├── usePublish.js       # Encrypt → upload → publish flow
│   │   │   ├── useSeal.js          # SessionKey + Seal decryption
│   │   │   ├── useSalesHistory.js  # Creator sales analytics
│   │   │   └── useAffiliates.js    # Affiliate management
│   │   ├── services/
│   │   │   ├── walrus.js           # Walrus blob upload/download
│   │   │   ├── seal.js             # Seal encryption service
│   │   │   └── tatum.js            # Tatum RPC (Sui node access)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── GeneratedThumbnail.jsx
│   │   │   └── ScrollToTop.jsx
│   │   └── ...
│   ├── package.json
│   └── .env
├── scripts/
│   ├── deploy.ts                   # Testnet deployment via Tatum RPC
│   └── constants.ts
├── netlify.toml                    # Netlify deployment config
└── IoTrade/                        # Reference project (not part of delar)
```

---

## Smart Contracts (Move, on Sui testnet)

### 1. `fee.move` — Protocol Fee Config
A shared object holding the fee rate (in basis points) and the fee recipient address. Created once during `init()`. Read by every purchase transaction. Admin can update via `AdminCap`.

### 2. `product.move` — Product Management
Creators call `publish_product()` to create a `ProductListing` (owned object). Each listing stores the blob ID, seal ID, price, product type, affiliates list, and sales count. Creators can update, deactivate, or reactivate their products. Affiliates can be added/removed per product.

### 3. `receipt.move` — Purchase Receipt
`mint_receipt()` is called by `checkout::buy()` to emit a soulbound `PurchaseReceipt` to the buyer. Contains `product_id`, `blob_id`, `seal_id`, `product_title`, `amount_paid`, and `purchased_at`. Only `checkout.move` can mint receipts (`public(package)`).

### 4. `seal_access.move` — Decryption Policy
`seal_approve()` is called by Seal key servers (simulated, never submitted). Verifies:
- The caller owns the receipt (buyer matches sender)
- The Seal identity embedded in the ciphertext ends with the receipt's `seal_id`

### 5. `checkout.move` — Purchase Settlement
Atomic PTB that:
1. Validates product is active and payment is correct
2. Splits USDC: protocol fee → treasury, affiliate commission → referrer, remainder → creator
3. Increments sales count
4. Mints PurchaseReceipt to buyer
5. Emits PurchaseCompleted event

---

## Frontend Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Sui SDK | `@mysten/sui` ^2.17.0 |
| Wallet | `@mysten/dapp-kit-react` ^2.0.3 |
| Encryption | `@mysten/seal` ^1.1.3 |
| Storage | Walrus HTTP API (publisher/aggregator) |
| RPC | Tatum Gateway + Sui Fullnode |
| State | `@tanstack/react-query` |
| Routing | `react-router-dom` v7 |

---

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/install-sui) installed
- Node.js ≥ 20
- A Sui wallet (e.g., [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil))
- Testnet SUI and USDC from the [Sui Testnet Faucet](https://faucet.sui.io/)
- A Tatum API key (for event indexing) — optional

---

## Setup & Running

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Copy the sample `.env` in `frontend/.env`. It should contain:

```env
VITE_SUI_NETWORK=testnet
VITE_TATUM_RPC_URL=https://sui-testnet.gateway.tatum.io
VITE_TATUM_API_KEY=your_tatum_api_key
VITE_PACKAGE_ID=0x...             # from deployment
VITE_FEE_CONFIG_ID=0x...          # from deployment
VITE_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
VITE_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
VITE_SEAL_KEY_SERVER_1=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75
VITE_SEAL_KEY_SERVER_2=0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
VITE_USDC_TYPE=0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC
```

### 3. Build & test Move contracts

```bash
cd delar
sui move build
sui move test
```

### 4. Deploy contracts (testnet)

```bash
DEPLOYER_PRIVATE_KEY=suiprivkey... npx tsx scripts/deploy.ts
```

This writes `scripts/deployment.json` with the `packageId` and `feeConfigId`.
Copy these into your `frontend/.env`.

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Opens at `http://localhost:5173`.

### 6. Build for production

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

---

## Deployment

Delar is configured for Netlify via `netlify.toml`. The build command is `npm run build` inside the `frontend/` directory. All routes redirect to `index.html` for SPA routing.

```bash
npx netlify deploy --prod --dir=frontend/dist
```

---

## Walrus & Seal Integration Notes

### Walrus HTTP API

```
Upload:  PUT  {PUBLISHER}/v1/blobs?epochs=5
         Body: raw bytes (encrypted ciphertext)
         Returns: { newlyCreated: { blobObject: { blobId } } }
                  or { alreadyCertified: { blobId } }

Fetch:   GET  {AGGREGATOR}/v1/blobs/{blobId}
         Returns: raw bytes
```

### Seal IBE Encryption

- Threshold: 2 (both key servers must respond)
- Identity: random 32-byte hex string generated per product
- Key servers (testnet):
  - `0x73d0...6db75`
  - `0xf5d1...623c8`
- Session key TTL: 30 minutes (cached in IndexedDB)

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

When contributing:
- Move contract changes must include updated tests in `delar/tests/`
- Frontend changes should maintain wallet connection and Seal session state handling
- Run `sui move test` and `npm run build` before opening a PR

---

## License

Built by [Rinku Technology Limited](https://rinku.technology) for the Tatum x Walrus Hackathon.
