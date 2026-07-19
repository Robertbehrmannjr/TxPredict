"use client";
import { useState } from "react";
import "./globals.css";

// Mock market data for the frontend
const MARKETS = [
  { id: 1, fixtureId: 17271370, title: "Will Brazil score > 2 goals vs Argentina?", yesPool: 1500, noPool: 800, resolved: false },
  { id: 2, fixtureId: 17271371, title: "Will France win in extra time?", yesPool: 3200, noPool: 4100, resolved: false },
  { id: 3, fixtureId: 17271372, title: "Total goals > 3.5 in Final?", yesPool: 10000, noPool: 2000, resolved: false },
];

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [bettingMarket, setBettingMarket] = useState<number | null>(null);
  
  const handleConnect = () => {
    setWalletConnected(true);
  };

  const handleBet = (marketId: number, isYes: boolean) => {
    if (!walletConnected) {
      alert("Please connect your Phantom wallet first!");
      return;
    }
    
    // Simulating standard Solana transaction
    alert(`Signing transaction to place ${isYes ? "YES" : "NO"} bet on market ${marketId}...`);
    setBettingMarket(marketId);
    
    setTimeout(() => {
      alert("Bet placed successfully! The market will resolve automatically when the match finishes via TxODDS Oracle.");
      setBettingMarket(null);
    }, 1500);
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", background: "linear-gradient(90deg, #3b82f6, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            TxPredict
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--gray-400)" }}>Trustless P2P World Cup Prediction Markets</p>
        </div>
        <button className="btn" onClick={handleConnect}>
          {walletConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </header>

      <section>
        <div style={{ marginBottom: "2rem", padding: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}>
          <strong>⚽ Powered by TxLINE:</strong> These markets resolve completely on-chain! When the match finishes, our Node Keeper fetches the cryptographic Merkle proof from TxODDS and settles the market via CPI. No centralized oracles required.
        </div>

        <div className="market-grid">
          {MARKETS.map(market => (
            <div key={market.id} className="glass-panel market-card">
              <h3>{market.title}</h3>
              <div style={{ fontSize: "0.85rem", color: "var(--gray-400)", marginBottom: "1rem" }}>
                Fixture ID: {market.fixtureId}
              </div>
              
              <div className="pools">
                <div>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>Yes Pool</div>
                  <span>{market.yesPool} USDC</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>No Pool</div>
                  <span className="no-pool">{market.noPool} USDC</span>
                </div>
              </div>

              <div className="bet-buttons">
                <button 
                  className="btn btn-yes" 
                  onClick={() => handleBet(market.id, true)}
                  disabled={bettingMarket === market.id}
                >
                  Bet YES
                </button>
                <button 
                  className="btn btn-no" 
                  onClick={() => handleBet(market.id, false)}
                  disabled={bettingMarket === market.id}
                >
                  Bet NO
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
