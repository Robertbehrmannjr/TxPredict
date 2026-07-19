# TxPredict 🏆
**Track 1: Prediction Markets and Settlement** | *TxODDS World Cup Hackathon*

TxPredict is a fully decentralized, trustless P2P prediction market built on Solana. It leverages the TxLINE cryptographic oracle to settle markets automatically without human intervention.

## 📌 The Problem
Traditional prediction markets rely on centralized oracles or human admins to verify sports outcomes and resolve bets. This introduces trust assumptions, potential delays, and single points of failure.

## 🚀 Our Solution
TxPredict utilizes **TxLINE's signed Merkle Proofs** to validate match results entirely on-chain. 

1. **Market Creation & Betting:** Users connect their Phantom wallet and place USDC bets on Yes/No pools for World Cup fixtures.
2. **Automated Settlement (The Node Keeper):** A lightweight backend listens to the TxLINE `Server-Sent Events (SSE)` stream. 
3. **Trustless Resolution:** When the `game_finalised` event is received, the Keeper fetches the cryptographic proof from TxLINE's validation endpoint and submits it to our Anchor Smart Contract.
4. **CPI Validation:** Our smart contract performs a Cross-Program Invocation (CPI) to the TxODDS `validateStatV2` instruction. If the proof is valid, the market is settled and winners can claim their funds.

## 🛠 Technical Documentation

### TxLINE Endpoints Used:
- **`GET /api/scores/stream`**: Used by our Node Keeper to listen for live match events in real-time (`game_finalised`).
- **`POST /api/scores/stat-validation`**: Used to retrieve the Merkle Proof payload for the specific fixture, which is then serialized and passed to our Solana program.

### Smart Contract Integration:
Our Anchor program (`txpredict-market`) derives the `daily_scores_roots` PDA and executes the CPI to the TxODDS Oracle Program on Devnet. This ensures that the market resolution is 100% mathematically backed by TxODDS consensus data.

## 💡 API Feedback
- **What worked well:** The SSE stream is incredibly fast and the JSON schema is perfectly normalized. The ability to verify the stats directly on-chain via CPI is a game-changer for DeFi sports betting.
- **Where we got stuck:** The structure of the `validateStatV2` payload in Rust requires precise Borsh serialization. Having more TypeScript SDK examples for fetching the proof and translating it directly into Anchor transaction arguments would speed up development for future builders.

## 💻 How to Run Locally

### 1. Smart Contract
```bash
cd txpredict-contracts
anchor build
anchor deploy --provider.cluster devnet
```

### 2. Node Keeper
```bash
cd txpredict-node-keeper
npm install
# Configure .env with TXODDS_JWT and TXODDS_API_TOKEN
npm start
```

### 3. Frontend
```bash
cd txpredict-frontend
npm install
npm run dev
```
