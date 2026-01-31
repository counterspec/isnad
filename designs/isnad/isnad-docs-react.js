import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

const styles = {
  root: {
    '--bg-root': '#f5f5f7',
    '--bg-surface': '#ffffff',
    '--bg-subtle': '#eeeeee',
    '--border-dim': '#e0e0e0',
    '--border-highlight': '#000000',
    '--text-primary': '#000000',
    '--text-secondary': '#555555',
    '--text-tertiary': '#999999',
    '--radius-sm': '0px',
    '--radius-md': '0px',
    '--radius-lg': '0px',
    '--space-xs': '4px',
    '--space-sm': '8px',
    '--space-md': '16px',
    '--space-lg': '24px',
    '--space-xl': '48px',
    '--font-ui': "'Space Grotesk', system-ui, -apple-system, sans-serif",
    '--font-code': "'JetBrains Mono', monospace",
    '--sidebar-width': '260px',
    '--toc-width': '220px'
  }
};

const Header = () => {
  const location = useLocation();
  
  return (
    <nav style={{
      height: '64px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid var(--text-primary)',
      background: 'var(--bg-root)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '0 var(--space-lg)'
    }}>
      <div style={{
        fontWeight: 700,
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '-0.02em'
      }}>
        <div style={{
          width: '14px',
          height: '14px',
          background: 'var(--text-primary)'
        }}></div>
        ISNAD_PROTOCOL
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
        <Link 
          to="/" 
          style={{
            textDecoration: location.pathname === '/' ? 'underline' : 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Documentation
        </Link>
        <Link 
          to="/governance" 
          style={{
            textDecoration: location.pathname === '/governance' ? 'underline' : 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Governance
        </Link>
        <Link 
          to="/launch-app" 
          style={{
            textDecoration: location.pathname === '/launch-app' ? 'underline' : 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  const navGroups = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', path: '/' },
        { label: 'Quickstart', path: '/quickstart' },
        { label: 'Protocol Overview', path: '/protocol-overview' }
      ]
    },
    {
      title: 'Concepts',
      items: [
        { label: 'AI Provenance', path: '/ai-provenance' },
        { label: 'Slashing & Rewards', path: '/slashing-rewards' },
        { label: 'Audit Committees', path: '/audit-committees' }
      ]
    },
    {
      title: 'API Reference',
      items: [
        { label: 'Authentication', path: '/authentication' },
        { label: 'Endpoints', path: '/endpoints' },
        { label: 'Errors', path: '/errors' }
      ]
    },
    {
      title: 'Smart Contracts',
      items: [
        { label: 'Registry.sol', path: '/registry-sol' },
        { label: 'StakingPool.sol', path: '/staking-pool-sol' }
      ]
    },
    {
      title: 'Integrations',
      items: [
        { label: 'Python SDK', path: '/python-sdk' },
        { label: 'Node.js Client', path: '/nodejs-client' }
      ]
    }
  ];

  return (
    <aside style={{
      borderRight: '1px solid var(--border-dim)',
      padding: 'var(--space-xl) var(--space-lg)',
      background: 'var(--bg-root)',
      position: 'sticky',
      top: '64px',
      height: 'calc(100vh - 64px)',
      overflowY: 'auto'
    }}>
      {navGroups.map((group, groupIndex) => (
        <div key={groupIndex} style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-md)'
          }}>
            {group.title}
          </div>
          <ul style={{ listStyle: 'none' }}>
            {group.items.map((item, itemIndex) => (
              <li key={itemIndex} style={{ marginBottom: 'var(--space-sm)' }}>
                <Link
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    display: 'block',
                    padding: '4px 0',
                    fontWeight: location.pathname === item.path ? 700 : 400,
                    borderLeft: location.pathname === item.path ? '2px solid var(--text-primary)' : 'none',
                    paddingLeft: location.pathname === item.path ? 'var(--space-md)' : '0',
                    marginLeft: location.pathname === item.path ? 'calc(-1 * var(--space-md))' : '0'
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

const TableOfContents = ({ items }) => {
  return (
    <aside style={{
      padding: 'var(--space-xl) var(--space-lg)',
      position: 'sticky',
      top: '64px',
      height: 'calc(100vh - 64px)'
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-md)'
      }}>
        On this page
      </div>
      <ul style={{ listStyle: 'none' }}>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: 'var(--space-sm)' }}>
            <a
              href={item.href}
              style={{
                textDecoration: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '12px',
                display: 'block'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-tertiary)'}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const CodeBlock = ({ lines }) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--text-primary)',
      padding: 'var(--space-lg)',
      fontFamily: 'var(--font-code)',
      fontSize: '13px',
      color: 'var(--text-primary)',
      margin: 'var(--space-lg) 0',
      boxShadow: '4px 4px 0px var(--bg-subtle)',
      overflowX: 'auto'
    }}>
      {lines.map((line, index) => (
        <div key={index} style={{ display: 'flex', gap: '15px' }}>
          <span style={{ color: 'var(--text-tertiary)', width: '20px', textAlign: 'right' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span dangerouslySetInnerHTML={{ __html: line }}></span>
        </div>
      ))}
    </div>
  );
};

const IntroductionPage = () => {
  const tocItems = [
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#safety-mechanisms', label: 'Safety Mechanisms' },
    { href: '#getting-started', label: 'Next Steps' }
  ];

  const codeLines = [
    '<span style="font-weight: 700; color: #000;">import</span> isnad_sdk',
    '',
    '<span style="color: var(--text-tertiary);"># Initialize an audited agent session</span>',
    'agent = isnad_sdk.<span style="text-decoration: underline;">Agent</span>(<span style="font-style: italic; color: #555;">"0x1a...f2"</span>)',
    '',
    '<span style="font-weight: 700; color: #000;">if</span> agent.<span style="text-decoration: underline;">verify_bond</span>():',
    '    print(<span style="font-style: italic; color: #555;">"Trust layer active."</span>)',
    '    agent.<span style="text-decoration: underline;">execute</span>(task_payload)'
  ];

  return (
    <>
      <main style={{
        padding: 'var(--space-xl) 60px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <article>
          <span style={{
            display: 'inline-block',
            background: '#000',
            color: '#fff',
            padding: '2px 6px',
            fontSize: '10px',
            fontFamily: 'var(--font-code)',
            marginBottom: 'var(--space-sm)'
          }}>
            v1.0.0-BETA
          </span>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            marginBottom: 'var(--space-lg)',
            letterSpacing: '-0.03em'
          }}>
            Introduction to ISNAD
          </h1>
          <p style={{
            marginBottom: 'var(--space-md)',
            fontSize: '16px',
            color: 'var(--text-secondary)'
          }}>
            ISNAD is the decentralized trust layer for autonomous AI agents. Our protocol provides a cryptographic framework to ensure that AI code behaves exactly as intended, backed by economic incentives and on-chain audits.
          </p>
          
          <h2 id="how-it-works" style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: 'var(--space-xl) 0 var(--space-md)',
            borderBottom: '1px solid var(--border-dim)',
            paddingBottom: 'var(--space-sm)'
          }}>
            How it Works
          </h2>
          <p style={{
            marginBottom: 'var(--space-md)',
            fontSize: '16px',
            color: 'var(--text-secondary)'
          }}>
            The core of the protocol relies on the <b>Proof-of-Audit</b> consensus mechanism. When an agent is deployed, a randomized committee of auditors is selected to verify its heuristic boundaries.
          </p>
          
          <CodeBlock lines={codeLines} />

          <h2 id="safety-mechanisms" style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: 'var(--space-xl) 0 var(--space-md)',
            borderBottom: '1px solid var(--border-dim)',
            paddingBottom: 'var(--space-sm)'
          }}>
            Safety Mechanisms
          </h2>
          <p style={{
            marginBottom: 'var(--space-md)',
            fontSize: '16px',
            color: 'var(--text-secondary)'
          }}>
            If an agent deviates from its audited path, the staked collateral is programmatically burned. This creates a hard economic floor for AI safety, allowing enterprise users to integrate autonomous systems with confidence.
          </p>

          <h2 id="getting-started" style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: 'var(--space-xl) 0 var(--space-md)',
            borderBottom: '1px solid var(--border-dim)',
            paddingBottom: 'var(--space-sm)'
          }}>
            Next Steps
          </h2>
          <p style={{
            marginBottom: 'var(--space-md)',
            fontSize: '16px',
            color: 'var(--text-secondary)'
          }}>
            To begin building with ISNAD, check out our Quickstart guide or browse the Smart Contract specifications.
          </p>
        </article>
      </main>
      <TableOfContents items={tocItems} />
    </>
  );
};

const GenericPage = ({ title, content }) => {
  return (
    <>
      <main style={{
        padding: 'var(--space-xl) 60px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <article>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            marginBottom: 'var(--space-lg)',
            letterSpacing: '-0.03em'
          }}>
            {title}
          </h1>
          <p style={{
            marginBottom: 'var(--space-md)',
            fontSize: '16px',
            color: 'var(--text-secondary)'
          }}>
            {content}
          </p>
        </article>
      </main>
      <TableOfContents items={[]} />
    </>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }

      body {
        background-color: var(--bg-surface);
        color: var(--text-primary);
        font-family: var(--font-ui);
        font-size: 14px;
        line-height: 1.6;
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={styles.root}>
        <Header />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'var(--sidebar-width) 1fr var(--toc-width)',
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Sidebar />
          <Routes>
            <Route path="/" element={<IntroductionPage />} />
            <Route path="/quickstart" element={<GenericPage title="Quickstart" content="Get started with ISNAD in minutes. This guide will walk you through the basic setup and your first agent deployment." />} />
            <Route path="/protocol-overview" element={<GenericPage title="Protocol Overview" content="A comprehensive overview of the ISNAD protocol architecture and core mechanisms." />} />
            <Route path="/ai-provenance" element={<GenericPage title="AI Provenance" content="Learn how ISNAD tracks and verifies the provenance of AI agent actions on-chain." />} />
            <Route path="/slashing-rewards" element={<GenericPage title="Slashing & Rewards" content="Understanding the economic incentives that secure the ISNAD network." />} />
            <Route path="/audit-committees" element={<GenericPage title="Audit Committees" content="How randomized audit committees verify agent behavior and maintain network security." />} />
            <Route path="/authentication" element={<GenericPage title="Authentication" content="API authentication methods and security best practices." />} />
            <Route path="/endpoints" element={<GenericPage title="Endpoints" content="Complete API endpoint reference with examples and response schemas." />} />
            <Route path="/errors" element={<GenericPage title="Errors" content="Error codes, descriptions, and troubleshooting guide." />} />
            <Route path="/registry-sol" element={<GenericPage title="Registry.sol" content="Smart contract documentation for the ISNAD Registry contract." />} />
            <Route path="/staking-pool-sol" element={<GenericPage title="StakingPool.sol" content="Smart contract documentation for the StakingPool contract." />} />
            <Route path="/python-sdk" element={<GenericPage title="Python SDK" content="Official Python SDK for integrating ISNAD into your Python applications." />} />
            <Route path="/nodejs-client" element={<GenericPage title="Node.js Client" content="Official Node.js client library for ISNAD integration." />} />
            <Route path="/governance" element={<GenericPage title="Governance" content="Learn about ISNAD governance mechanisms and how to participate in protocol decisions." />} />
            <Route path="/launch-app" element={<GenericPage title="Launch App" content="Access the ISNAD application to deploy and manage your AI agents." />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;