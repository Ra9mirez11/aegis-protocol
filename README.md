# Aegis Protocol

**Zero-Knowledge Web3 Security & Treasury Suite**

Aegis Protocol is a non-custodial, client-side Web3 security and treasury management application supporting 14 EVM chains and Solana. It combines wallet hygiene, tax-loss harvesting, token approval auditing, and zero-knowledge digital inheritance into a single unified interface.

---

## Core Modules

### 1. DustSweeper & Tax Harvester
- Identifies low-value dust tokens and illiquid/abandoned ("dead") tokens across connected wallets.
- Batch-sweeps recoverable dust into native network assets or burns dead tokens to realize capital losses.
- Generates downloadable CSV tax reports formatted for capital loss harvesting.

### 2. Approval Sentinel
- Scans active token allowances and classifies spender exposure by risk level (`Critical`, `High`, `Medium`, `Low`).
- Highlights unlimited approvals and unverified contract spenders.
- Supports single and batch revocation of risky token approvals.

### 3. InheritSafe Vault (Zero-Knowledge Dead Man's Switch)
- Client-side encrypted inheritance vault using the native browser **Web Crypto API**.
- **Key Derivation**: `PBKDF2` with `150,000` iterations (`SHA-256`) and random 128-bit salt.
- **Encryption**: `AES-256-GCM` authenticated encryption with 96-bit initialization vector (IV).
- **Key Splitting**: 2-of-2 Shamir's Secret Sharing over `GF(256)` (`Share A` + `Share B`), ensuring neither party can reconstruct the secret independently.
- Configurable inactivity timers (`30`, `90`, `180`, `365` days) with a 14-day grace period and portable `.aegis` encrypted vault export/import.

### 4. Wallet Health Score
- Real-time security telemetry scoring (0–100) calculated from active unlimited approvals, critical spender risks, dust/dead token clutter, and inheritance vault status.

---

## Supported Networks (15 Chains)

| Network | Chain ID | Type | Native Asset |
| :--- | :--- | :--- | :--- |
| Ethereum | `1` | EVM | `ETH` |
| Base | `8453` | EVM | `ETH` |
| Arbitrum One | `42161` | EVM | `ETH` |
| Optimism | `10` | EVM | `ETH` |
| Polygon | `137` | EVM | `POL` |
| Solana | `0` | SVM | `SOL` |
| Avalanche | `43114` | EVM | `AVAX` |
| BNB Smart Chain | `56` | EVM | `BNB` |
| zkSync Era | `324` | EVM | `ETH` |
| Linea | `59144` | EVM | `ETH` |
| Scroll | `534352` | EVM | `ETH` |
| Blast | `81457` | EVM | `ETH` |
| Sonic | `146` | EVM | `S` |
| Mantle | `5000` | EVM | `MNT` |
| Berachain | `80094` | EVM | `BERA` |

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling & Motion**: Tailwind CSS, Framer Motion, Lucide Icons
- **Cryptography**: Native Web Crypto API (`PBKDF2`, `AES-256-GCM`), finite field arithmetic over `GF(256)`
- **Web3 Integration**: EIP-1193 EVM providers, Solana wallet standard (`window.solana` / `window.solflare`), CoinGecko live price feeds with fallback telemetry

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/Ra9mirez11/aegis-protocol.git
cd aegis-protocol
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure the optional service fee and treasury parameters:

```bash
cp .env.example .env
```

### Development & Build

```bash
# Start local development server
npm run dev

# Type-check TypeScript
npm run typecheck

# Production build
npm run build
```

---

## Security Architecture

- **100% Client-Side Execution**: Sensitive payloads, seed phrases, and encryption keys never leave the browser in plaintext.
- **Non-Custodial**: All blockchain transactions require explicit signature confirmation from the user's connected Web3 wallet.
- **Zero-Knowledge Vaults**: Encrypted `.aegis` vault payloads cannot be decrypted without both Shamir shares (`Share A` + `Share B`) over `GF(256)`.

---

## License

Distributed under the [MIT License](LICENSE).
