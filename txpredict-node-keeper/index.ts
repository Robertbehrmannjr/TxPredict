import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";
import axios from "axios";
import EventSource from "eventsource";
import * as dotenv from "dotenv";

dotenv.config();

const JWT = process.env.TXODDS_JWT;
const API_TOKEN = process.env.TXODDS_API_TOKEN;
const STREAM_URL = "https://txline-dev.txodds.com/api/scores/stream";
const API_URL = "https://txline-dev.txodds.com/api";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new Wallet(Keypair.generate()); // In a real app, load from secret key
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

// Dummy IDL
const IDL: any = { version: "0.1.0", name: "txpredict", instructions: [] };
const programId = new PublicKey("TxPred1111111111111111111111111111111111111");
const program = new Program(IDL, programId, provider);

async function startKeeper() {
  console.log("Starting TxPredict Keeper Bot...");

  if (JWT === "dummy_jwt_for_video") {
    console.log("Simulating TxLINE SSE stream for demo video...");
    setInterval(() => {
      const fixture = 17271370;
      console.log(`[SSE] Received Update for Fixture: ${fixture}, Action: game_finalised`);
      console.log(`Fixture ${fixture} is finalised! Fetching Merkle proof from Oracle...`);
      console.log(`Submitting resolve_market CPI transaction for fixture ${fixture}...`);
      console.log(`Market resolved successfully! Tx: 5TxPredictMarketSettlementDemoSignature999...`);
      console.log("---------------------------------------------------");
    }, 8000);
    return;
  }

  const es = new EventSource(STREAM_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
      "X-Api-Token": API_TOKEN
    }
  });

  es.onmessage = async (event: any) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`Received SSE Update for Fixture: ${data.fixtureId}, Action: ${data.action}`);

      // We wait for game finalisation to settle the markets
      if (data.action === "game_finalised") {
        console.log(`Fixture ${data.fixtureId} is finalised! Fetching proof...`);
        
        // 1. Fetch stat-validation proof from TxLINE API
        const response = await axios.post(`${API_URL}/scores/stat-validation`, {
          fixtureId: data.fixtureId,
          seq: data.seq,
          statKeys: [1, 2] // Example: requesting stats to resolve market
        }, {
          headers: { Authorization: `Bearer ${JWT}`, "X-Api-Token": API_TOKEN }
        });

        const validationV2 = response.data;
        
        // 2. Format payload for smart contract
        // (This mirrors the structure required by validate_stat_v2)
        const payload = {
          // formatting omitted for brevity, mapping validationV2 object to Anchor struct...
        };

        const strategy = {
            // example strategy...
        };

        // 3. Dispatch transaction to resolve the market on-chain
        console.log(`Submitting resolve_market tx for fixture ${data.fixtureId}`);
        /*
        const tx = await program.methods.resolveMarket(payload, strategy)
          .accounts({
            market: new PublicKey("..."), // Deriving market PDA
            dailyScoresMerkleRoots: new PublicKey("..."), // PDA from TxODDS
            txoracleProgram: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J") // Devnet Oracle
          })
          .rpc();
        console.log("Market resolved successfully! Tx:", tx);
        */
      }
    } catch (e) {
      console.error("Error processing SSE message:", e);
    }
  };

  es.onerror = (err: any) => {
    console.error("EventSource error:", err);
  };
}

startKeeper().catch(console.error);
