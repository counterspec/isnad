import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-root: #f5f5f7;
        --bg-surface: #ffffff;
        --border-dim: #e0e0e0;
        --border-highlight: #000000;
        
        --text-primary: #000000;
        --text-secondary: #555555;
        --text-tertiary: #999999;
        
        --rank-1: #FFD700;
        --rank-2: #C0C0C0;
        --rank-3: #CD7F32;
        
        --status-green: #00c853;
        
        --radius-sm: 0px; 
        --radius-md: 0px;
        
        --space-xs: 4px;
        --space-sm: 8px;
        --space-md: 16px;
        --space-lg: 24px;
        --space-xl: 48px;
        
        --font-ui: 'Inter', -apple-system, system-ui, sans-serif;
        --font-code: 'JetBrains Mono', monospace;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }

      body {
        background-color: var(--bg-root);
        color: var(--text-primary);
        font-family: var(--font-ui);
        font-size: 14px;
        line-height: 1.5;
      }

      .layout-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--space-lg);
      }

      nav {
        padding: var(--space-lg) 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--text-primary);
        background: var(--bg-root);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .logo {
        font-weight: 700;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        letter-spacing: -0.02em;
      }
      .logo-dot {
        width: 14px;
        height: 14px;
        background: var(--text-primary);
      }

      .nav-links {
        display: flex;
        gap: var(--space-xl);
      }
      .nav-link {
        text-decoration: none;
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      header {
        padding: 60px 0 40px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .subheader {
        color: var(--text-secondary);
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .leaderboard-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: var(--bg-surface);
        border: 2px solid var(--text-primary);
        margin-bottom: 100px;
      }

      .leaderboard-table th {
        text-align: left;
        padding: 16px 24px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-secondary);
        border-bottom: 2px solid var(--text-primary);
        background: #fafafa;
      }

      .leaderboard-table td {
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-dim);
        vertical-align: middle;
      }

      .leaderboard-table tr:hover td {
        background-color: #fcfcfc;
      }

      .rank-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        font-family: var(--font-code);
        font-weight: 700;
        font-size: 14px;
        border: 1px solid var(--text-primary);
      }

      .rank-1 .rank-badge { background-color: var(--rank-1); box-shadow: 3px 3px 0px var(--text-primary); }
      .rank-2 .rank-badge { background-color: var(--rank-2); box-shadow: 3px 3px 0px var(--text-primary); }
      .rank-3 .rank-badge { background-color: var(--rank-3); box-shadow: 3px 3px 0px var(--text-primary); }

      .participant-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .identicon {
        width: 32px;
        height: 32px;
        border: 1px solid var(--text-primary);
      }

      .wallet-address {
        font-family: var(--font-code);
        font-weight: 500;
        color: var(--text-primary);
      }

      .mono-val {
        font-family: var(--font-code);
        font-weight: 500;
        font-size: 15px;
      }

      .trend-up { color: var(--status-green); font-size: 12px; margin-left: 4px; }

      .stat-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-bottom: 40px;
      }

      .stat-card {
        background: var(--bg-surface);
        border: 2px solid var(--text-primary);
        padding: 20px;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 8px;
        display: block;
      }

      .stat-val {
        font-size: 24px;
        font-family: var(--font-code);
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
    
    const fontLink1 = document.createElement('link');
    fontLink1.rel = 'preconnect';
    fontLink1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink1);
    
    const fontLink2 = document.createElement('link');
    fontLink2.rel = 'preconnect';
    fontLink2.href = 'https://fonts.gstatic.com';
    fontLink2.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink2);
    
    const fontLink3 = document.createElement('link');
    fontLink3.rel = 'stylesheet';
    fontLink3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(fontLink3);
    
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(fontLink1);
      document.head.removeChild(fontLink2);
      document.head.removeChild(fontLink3);
    };
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState('leaderboard');

  const leaderboardData = [
    {
      rank: 1,
      rankClass: 'rank-1',
      wallet: '0x71C...4921',
      gradient: 'linear-gradient(45deg, #FF3B30, #FF9500)',
      staked: '842,000 ISNAD',
      skills: '142',
      reliability: '100.00%',
      trending: true,
      rewards: '42.10 ETH'
    },
    {
      rank: 2,
      rankClass: 'rank-2',
      wallet: '0x3A2...9B11',
      gradient: 'linear-gradient(45deg, #007AFF, #5856D6)',
      staked: '712,400 ISNAD',
      skills: '98',
      reliability: '99.99%',
      trending: true,
      rewards: '38.45 ETH'
    },
    {
      rank: 3,
      rankClass: 'rank-3',
      wallet: '0xF21...EE42',
      gradient: 'linear-gradient(45deg, #34C759, #30B0C7)',
      staked: '690,120 ISNAD',
      skills: '121',
      reliability: '99.97%',
      trending: false,
      rewards: '31.20 ETH'
    },
    {
      rank: 4,
      rankClass: '',
      wallet: '0x992...28A1',
      gradient: 'linear-gradient(45deg, #FFCC00, #FF2D55)',
      staked: '450,000 ISNAD',
      skills: '84',
      reliability: '99.95%',
      trending: false,
      rewards: '18.90 ETH'
    },
    {
      rank: 5,
      rankClass: '',
      wallet: '0x112...004C',
      gradient: 'linear-gradient(45deg, #8E8E93, #000000)',
      staked: '321,900 ISNAD',
      skills: '42',
      reliability: '99.91%',
      trending: false,
      rewards: '12.11 ETH'
    },
    {
      rank: 6,
      rankClass: '',
      wallet: '0xBB4...712E',
      gradient: 'linear-gradient(45deg, #AF52DE, #FF2D55)',
      staked: '210,500 ISNAD',
      skills: '39',
      reliability: '99.88%',
      trending: false,
      rewards: '9.40 ETH'
    },
    {
      rank: 7,
      rankClass: '',
      wallet: '0xCC1...09F1',
      gradient: 'linear-gradient(45deg, #5AC8FA, #4CD964)',
      staked: '188,400 ISNAD',
      skills: '21',
      reliability: '99.82%',
      trending: false,
      rewards: '7.20 ETH'
    }
  ];

  return (
    <>
      <nav>
        <div className="layout-container" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <div className="logo">
            <div className="logo-dot"></div>
            ISNAD_PROTOCOL
          </div>
          <div className="nav-links">
            <Link to="#" className="nav-link">Documentation</Link>
            <Link to="#" className="nav-link">Governance</Link>
            <Link to="#" className="nav-link">Launch App</Link>
          </div>
        </div>
      </nav>

      <main className="layout-container">
        <header>
          <h1>Audit Leaderboard</h1>
          <div className="subheader">
            <span>Top performing security auditors and agent authors by stake-adjusted reliability.</span>
            <span className="wallet-address" style={{ fontSize: '12px' }}>EPOCH: 482 // REFRESH: 04:12m</span>
          </div>
        </header>

        <div className="stat-summary">
          <div className="stat-card">
            <span className="stat-label">Active Auditors</span>
            <span className="stat-val">1,402</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Stake</span>
            <span className="stat-val">12.4M ISNAD</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg Reliability</span>
            <span className="stat-val">99.98%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Slashing Events (24H)</span>
            <span className="stat-val">0</span>
          </div>
        </div>

        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Rank</th>
              <th>Participant</th>
              <th>Total Staked</th>
              <th>Verified Skills</th>
              <th>Reliability Score</th>
              <th style={{ textAlign: 'right' }}>Total Rewards</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr key={index} className={entry.rankClass}>
                <td>
                  <div className="rank-badge">{entry.rank}</div>
                </td>
                <td>
                  <div className="participant-cell">
                    <div className="identicon" style={{ background: entry.gradient }}></div>
                    <span className="wallet-address">{entry.wallet}</span>
                  </div>
                </td>
                <td className="mono-val">{entry.staked}</td>
                <td className="mono-val">{entry.skills}</td>
                <td className="mono-val">
                  {entry.reliability}
                  {entry.trending && <span className="trend-up">▲</span>}
                </td>
                <td className="mono-val" style={{ textAlign: 'right' }}>{entry.rewards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default App;