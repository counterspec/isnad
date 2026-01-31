import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const customStyles = {
  root: {
    '--bg-root': '#f5f5f7',
    '--bg-surface': '#ffffff',
    '--bg-subtle': '#eeeeee',
    '--border-dim': '#e0e0e0',
    '--border-highlight': '#000000',
    '--text-primary': '#000000',
    '--text-secondary': '#555555',
    '--text-tertiary': '#999999',
    '--status-green': '#00c853',
    '--status-red': '#ff3d00',
    '--status-warn': '#ffab00',
    '--space-xs': '4px',
    '--space-sm': '8px',
    '--space-md': '16px',
    '--space-lg': '24px',
    '--space-xl': '48px',
    '--font-ui': "'Space Grotesk', system-ui, -apple-system, sans-serif",
    '--font-code': "'JetBrains Mono', monospace"
  }
};

const Header = () => {
  return (
    <nav style={{
      padding: 'var(--space-lg) 0',
      borderBottom: '2px solid var(--border-highlight)',
      background: 'var(--bg-root)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="layout-container nav-inner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="logo" style={{
          fontWeight: 700,
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          letterSpacing: '-0.02em'
        }}>
          <div className="logo-dot" style={{
            width: '14px',
            height: '14px',
            background: 'var(--border-highlight)'
          }}></div>
          ISNAD_PROTOCOL
        </div>
        <div className="nav-links" style={{
          display: 'flex',
          gap: 'var(--space-xl)'
        }}>
          <Link to="/documentation" className="nav-link" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Documentation</Link>
          <Link to="/governance" className="nav-link" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Governance</Link>
          <Link to="/" className="nav-link" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Registry</Link>
        </div>
      </div>
    </nav>
  );
};

const SearchHero = ({ searchTerm, onSearchChange }) => {
  return (
    <section className="search-hero" style={{
      padding: 'var(--space-xl) 0',
      borderBottom: '1px solid var(--border-dim)',
      background: 'var(--bg-surface)'
    }}>
      <div className="layout-container">
        <div className="search-container" style={{
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <label className="search-label" style={{
            display: 'block',
            fontFamily: 'var(--font-code)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: 'var(--space-sm)',
            textTransform: 'uppercase'
          }}>Skill Security Lookup</label>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Enter skill URL or name (e.g. prompt-injection-shield.isnad)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: '72px',
              background: 'var(--bg-root)',
              border: '3px solid var(--border-highlight)',
              padding: '0 var(--space-lg)',
              fontFamily: 'var(--font-code)',
              fontSize: '20px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '6px 6px 0px var(--border-dim)'
            }}
          />
        </div>
      </div>
    </section>
  );
};

const SectionTitle = ({ children, style = {} }) => {
  return (
    <span className="section-title" style={{
      fontFamily: 'var(--font-code)',
      fontSize: '11px',
      fontWeight: 700,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: 'var(--space-sm)',
      display: 'block',
      borderBottom: '1px solid var(--border-dim)',
      paddingBottom: '4px',
      ...style
    }}>
      {children}
    </span>
  );
};

const BadgeVerified = () => {
  return (
    <div className="badge-verified" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      background: 'var(--status-green)',
      color: '#fff',
      fontFamily: 'var(--font-code)',
      fontWeight: 700,
      fontSize: '12px',
      textTransform: 'uppercase'
    }}>
      VERIFIED ✅
    </div>
  );
};

const DependencyCard = () => {
  return (
    <div className="dependency-card" style={{
      border: '1px solid var(--status-warn)',
      padding: 'var(--space-sm)',
      background: 'rgba(255, 171, 0, 0.05)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-sm)',
      marginTop: 'var(--space-sm)'
    }}>
      <span className="warn-icon" style={{
        color: 'var(--status-warn)',
        fontWeight: 900,
        fontSize: '18px'
      }}>⚠️</span>
      <div>
        <div className="nav-link" style={{
          fontSize: '11px',
          marginBottom: '2px',
          color: 'var(--text-primary)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>external_vector_db_v4</div>
        <p className="skill-version" style={{
          fontSize: '11px',
          lineHeight: 1.2,
          fontFamily: 'var(--font-code)',
          color: 'var(--text-secondary)'
        }}>Inherited risk from un-audited 3rd party API endpoint.</p>
      </div>
    </div>
  );
};

const AuditorTable = () => {
  const auditors = [
    { node: '0x_QUANT_SENTINEL', stake: '$850,000', accuracy: '99.8%', status: 'ACTIVE' },
    { node: 'NEURAL_SHIELD_INC', stake: '$620,000', accuracy: '98.2%', status: 'ACTIVE' },
    { node: 'BIT_AUDIT_DAO', stake: '$450,500', accuracy: '100.0%', status: 'ACTIVE' },
    { node: 'CYBER_DYNE_NODE_4', stake: '$220,000', accuracy: '94.1%', status: 'ACTIVE' }
  ];

  return (
    <table className="auditor-list" style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-code)',
      fontSize: '13px'
    }}>
      <thead>
        <tr>
          <th style={{
            textAlign: 'left',
            paddingBottom: 'var(--space-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '11px'
          }}>Validator Node</th>
          <th style={{
            textAlign: 'left',
            paddingBottom: 'var(--space-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '11px'
          }}>Stake Amount</th>
          <th style={{
            textAlign: 'left',
            paddingBottom: 'var(--space-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '11px'
          }}>Accuracy</th>
          <th style={{
            textAlign: 'left',
            paddingBottom: 'var(--space-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '11px'
          }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {auditors.map((auditor, index) => (
          <tr key={index}>
            <td style={{
              padding: 'var(--space-sm) 0',
              borderBottom: '1px solid var(--bg-subtle)'
            }}>{auditor.node}</td>
            <td style={{
              padding: 'var(--space-sm) 0',
              borderBottom: '1px solid var(--bg-subtle)'
            }}>{auditor.stake}</td>
            <td style={{
              padding: 'var(--space-sm) 0',
              borderBottom: '1px solid var(--bg-subtle)'
            }}>{auditor.accuracy}</td>
            <td style={{
              padding: 'var(--space-sm) 0',
              borderBottom: '1px solid var(--bg-subtle)',
              color: 'var(--status-green)'
            }}>{auditor.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <SearchHero searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main className="layout-container main-content" style={{
        padding: 'var(--space-xl) 0'
      }}>
        <div className="result-card" style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-highlight)',
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          minHeight: '500px'
        }}>
          <div className="result-sidebar" style={{
            padding: 'var(--space-lg)',
            borderRight: '2px solid var(--border-highlight)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)'
          }}>
            <div>
              <SectionTitle>Status</SectionTitle>
              <BadgeVerified />
            </div>

            <div>
              <SectionTitle>Financial Trust</SectionTitle>
              <div className="stake-value" style={{
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'var(--font-code)'
              }}>$2,140,500.00</div>
              <div className="skill-version" style={{
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                color: 'var(--text-secondary)'
              }}>Total Staked Collateral</div>
            </div>

            <div>
              <SectionTitle>Dependencies</SectionTitle>
              <DependencyCard />
            </div>

            <div className="timestamp" style={{
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              marginTop: 'auto',
              paddingTop: 'var(--space-lg)'
            }}>
              <SectionTitle style={{ border: 'none' }}>Last Audited</SectionTitle>
              2023.10.24 14:22:01 UTC<br />
              BLOCK_HEIGHT: 18,442,109
            </div>
          </div>

          <div className="result-main" style={{
            padding: 'var(--space-lg)'
          }}>
            <div className="skill-header">
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                textTransform: 'uppercase',
                lineHeight: 1,
                marginBottom: '4px'
              }}>PROMPT_SHIELD_PRO</h1>
              <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)'
              }}>
                <span className="skill-version" style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>VERSION: 2.1.0-BETA</span>
                <span className="mono-tag" style={{
                  background: 'var(--bg-subtle)',
                  padding: '2px 6px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  border: '1px solid var(--border-dim)'
                }}>0x8a2...f9e1</span>
              </div>
            </div>

            <div>
              <SectionTitle>Certified Auditors</SectionTitle>
              <AuditorTable />
            </div>

            <div style={{ marginTop: 'var(--space-xl)' }}>
              <SectionTitle>Agent Provenance Hash</SectionTitle>
              <div style={{
                background: 'var(--bg-subtle)',
                padding: 'var(--space-md)',
                border: '1px dashed var(--border-dim)',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                wordBreak: 'break-all'
              }}>
                bafybeigdyrzt5sfp7udm7hu76uh7y79hy3yp87ykf8syf6jhy6k89578y
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const DocumentationPage = () => {
  return (
    <div>
      <main className="layout-container main-content" style={{
        padding: 'var(--space-xl) 0'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-highlight)',
          padding: 'var(--space-xl)',
          minHeight: '500px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 'var(--space-lg)'
          }}>Documentation</h1>
          <p style={{
            fontFamily: 'var(--font-code)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.8
          }}>
            Documentation content will be available here. This section will contain detailed information about the ISNAD Protocol, its features, and usage guidelines.
          </p>
        </div>
      </main>
    </div>
  );
};

const GovernancePage = () => {
  return (
    <div>
      <main className="layout-container main-content" style={{
        padding: 'var(--space-xl) 0'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-highlight)',
          padding: 'var(--space-xl)',
          minHeight: '500px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 'var(--space-lg)'
          }}>Governance</h1>
          <p style={{
            fontFamily: 'var(--font-code)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.8
          }}>
            Governance information and voting mechanisms will be displayed here. This section covers protocol governance, proposals, and community decision-making processes.
          </p>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const link3 = document.createElement('link');
    link3.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
    link3.rel = 'stylesheet';
    document.head.appendChild(link3);

    const style = document.createElement('style');
    style.textContent = `
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
        overflow-x: hidden;
        min-height: 100vh;
      }
      
      .layout-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--space-lg);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
      document.head.removeChild(link3);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <div style={customStyles.root}>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/governance" element={<GovernancePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;