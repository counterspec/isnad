import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

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
    '--accent-gold': '#000000',
    '--accent-gold-dim': 'rgba(0, 0, 0, 0.05)',
    '--accent-gold-glow': 'rgba(0, 0, 0, 0.1)',
    '--status-green': '#00c853',
    '--status-red': '#ff3d00',
    '--radius-sm': '0px',
    '--radius-md': '0px',
    '--radius-lg': '0px',
    '--radius-pill': '0px',
    '--space-xs': '4px',
    '--space-sm': '8px',
    '--space-md': '16px',
    '--space-lg': '24px',
    '--space-xl': '48px',
    '--font-ui': "'Space Grotesk', system-ui, -apple-system, sans-serif",
    '--font-code': "'JetBrains Mono', monospace"
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    padding: '0 var(--space-lg)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.1s ease',
    cursor: 'pointer',
    border: '2px solid var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const variantStyles = {
    primary: {
      background: 'var(--text-primary)',
      color: '#fff'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)'
    }
  };

  const hoverStyle = variant === 'primary' 
    ? { background: 'var(--text-secondary)', borderColor: 'var(--text-secondary)' }
    : { background: 'var(--text-primary)', color: '#fff' };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      onClick={onClick}
      className={className}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...(isHovered ? hoverStyle : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </a>
  );
};

const Navigation = () => {
  return (
    <nav style={{
      padding: 'var(--space-lg) 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid var(--text-primary)',
      background: 'var(--bg-root)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 var(--space-lg)',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontWeight: '700',
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
        <div style={{
          display: 'flex',
          gap: 'var(--space-xl)'
        }}>
          <Link to="/documentation" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Documentation</Link>
          <Link to="/governance" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Governance</Link>
          <Link to="/app" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Launch App</Link>
        </div>
      </div>
    </nav>
  );
};

const HeroCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const nodes = [];
    const nodeCount = 12;

    class Node {
      constructor() {
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, 4, 4);
      }
    }

    for (let i = 0; i < nodeCount; i++) nodes.push(new Node());

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#000';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + 2, nodes[i].y + 2);
          ctx.lineTo(nodes[j].x + 2, nodes[j].y + 2);
          ctx.stroke();
        }
        nodes[i].update();
        nodes[i].draw();
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '500px',
        height: '500px',
        zIndex: 1,
        opacity: 0.1,
        pointerEvents: 'none',
        filter: 'grayscale(1)'
      }}
    />
  );
};

const Card = ({ icon, title, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isHovered ? 'var(--text-primary)' : 'var(--border-dim)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        transition: 'border-color 0.2s',
        boxShadow: isHovered ? '4px 4px 0px var(--text-primary)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-md)',
        paddingBottom: 'var(--space-sm)',
        borderBottom: '1px solid var(--border-dim)'
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>{title}</span>
        <span style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-code)',
          fontSize: '11px',
          fontWeight: '700',
          background: 'var(--bg-subtle)',
          padding: '2px 6px',
          border: '1px solid var(--text-primary)'
        }}>{icon}</span>
      </div>
      <div style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        {children}
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <main style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 var(--space-lg)',
      position: 'relative',
      zIndex: 1
    }}>
      <section style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: '100px'
      }}>
        <HeroCanvas />
        <div style={{
          position: 'relative',
          zIndex: 2,
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{
            fontFamily: 'var(--font-code)',
            color: 'var(--text-primary)',
            textDecoration: 'underline',
            fontSize: '12px',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: 'var(--status-green)'
            }}></span>
            MAINNET_BETA_V1.0
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            letterSpacing: '-0.04em',
            marginBottom: 'var(--space-sm)',
            textTransform: 'uppercase'
          }}>
            The Trust Layer<br />for AI Agents
          </h1>
          <p style={{
            fontSize: '18px',
            marginTop: 'var(--space-sm)',
            fontWeight: '500',
            color: 'var(--text-primary)',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            Decentralized provenance for autonomous code. Auditors stake tokens to vouch for agent behavior. Malware burns stakes.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-xl)'
          }}>
            <Button variant="primary">Check a Skill</Button>
            <Button variant="secondary">Read Whitepaper</Button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border-dim)',
          border: '2px solid var(--text-primary)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)'
          }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: '700',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '0',
                background: 'var(--status-green)',
                marginRight: '8px'
              }}></span>
              Skills Audited
            </span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'var(--font-code)',
              color: 'var(--text-primary)'
            }}>12,847</span>
          </div>
          <div style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)'
          }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: '700',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Total Value Staked</span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'var(--font-code)',
              color: 'var(--text-primary)'
            }}>$42,900,120</span>
          </div>
          <div style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)'
          }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: '700',
              fontSize: '11px',
              color: 'var(--status-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Threats Intercepted</span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'var(--font-code)',
              color: 'var(--text-primary)'
            }}>942</span>
          </div>
        </div>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        marginBottom: '100px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '700',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '2px solid var(--text-primary)',
            paddingBottom: '4px'
          }}>Participants</h2>
          <Card icon="0x_PUB" title="Agent Authors">
            Deploy autonomous agents with a cryptographic "Quality Seal". Staked agents receive 40% higher API throughput priority.
          </Card>
          <Card icon="VALIDATOR" title="Security Auditors">
            Review agent logic and stake ISNAD tokens on safety. Earn yield for clean epochs. Slashing conditions apply for false positives.
          </Card>
          <Card icon="CONSUMER" title="Enterprise Users">
            Integrate AI agents with insurance-backed guarantees. If an audited agent acts maliciously, the stake covers damages.
          </Card>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '700',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '2px solid var(--text-primary)',
            paddingBottom: '4px'
          }}>Consensus Logic</h2>
          <div style={{ position: 'relative', paddingLeft: '0' }}>
            <div style={{
              position: 'relative',
              marginBottom: 'var(--space-xl)',
              paddingBottom: 'var(--space-lg)',
              borderBottom: '1px solid var(--border-dim)'
            }}>
              <span style={{
                fontFamily: 'var(--font-code)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                marginBottom: 'var(--space-xs)',
                display: 'block',
                background: '#000',
                color: '#fff',
                width: 'fit-content',
                padding: '0 4px'
              }}>BLOCK: 0x1A</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textTransform: 'uppercase'
              }}>Agent Registration</h3>
              <p style={{
                fontSize: '13px',
                marginTop: '4px',
                color: 'var(--text-secondary)'
              }}>
                Developer submits agent hash and deposits base collateral. Code is frozen on IPFS.
              </p>
              <div style={{
                background: '#fff',
                border: '1px solid var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-md)',
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-md)',
                boxShadow: '4px 4px 0px var(--bg-subtle)'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>01</span>
                  <span>
                    <span style={{ textDecoration: 'underline' }}>init_audit</span>(agent_id, stake_amt)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>02</span>
                  <span style={{ color: 'var(--text-secondary)' }}>// WAITING FOR VALIDATORS...</span>
                </div>
              </div>
            </div>

            <div style={{
              position: 'relative',
              marginBottom: 'var(--space-xl)',
              paddingBottom: 'var(--space-lg)',
              borderBottom: '1px solid var(--border-dim)'
            }}>
              <span style={{
                fontFamily: 'var(--font-code)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                marginBottom: 'var(--space-xs)',
                display: 'block',
                background: '#000',
                color: '#fff',
                width: 'fit-content',
                padding: '0 4px'
              }}>BLOCK: 0x1B</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textTransform: 'uppercase'
              }}>Proof-of-Audit</h3>
              <p style={{
                fontSize: '13px',
                marginTop: '4px',
                color: 'var(--text-secondary)'
              }}>
                Randomized committee of auditors reviews heuristics. 2/3 consensus required to whitelist.
              </p>
            </div>

            <div style={{
              position: 'relative',
              marginBottom: 'var(--space-xl)',
              paddingBottom: 'var(--space-lg)',
              borderBottom: '1px solid var(--border-dim)'
            }}>
              <span style={{
                fontFamily: 'var(--font-code)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                marginBottom: 'var(--space-xs)',
                display: 'block',
                background: '#000',
                color: '#fff',
                width: 'fit-content',
                padding: '0 4px'
              }}>BLOCK: 0x1C</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textTransform: 'uppercase'
              }}>Trust Bond Minted</h3>
              <p style={{
                fontSize: '13px',
                marginTop: '4px',
                color: 'var(--text-secondary)'
              }}>
                Agent receives a dynamic trust score. Users can verify the audit trail on-chain before execution.
              </p>
              <div style={{
                background: '#fff',
                border: '2px solid var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-md)',
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-md)',
                boxShadow: '4px 4px 0px var(--bg-subtle)'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>03</span>
                  <span>
                    <span style={{ fontWeight: '700', color: '#000' }}>return</span>{' '}
                    <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"VERIFIED"</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const DocumentationPage = () => {
  return (
    <main style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '100px var(--space-lg)',
      minHeight: '70vh'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        letterSpacing: '-0.04em',
        marginBottom: 'var(--space-xl)',
        textTransform: 'uppercase'
      }}>Documentation</h1>
      <p style={{ fontSize: '16px', marginBottom: 'var(--space-lg)' }}>
        Technical documentation for the ISNAD protocol is coming soon.
      </p>
    </main>
  );
};

const GovernancePage = () => {
  return (
    <main style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '100px var(--space-lg)',
      minHeight: '70vh'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        letterSpacing: '-0.04em',
        marginBottom: 'var(--space-xl)',
        textTransform: 'uppercase'
      }}>Governance</h1>
      <p style={{ fontSize: '16px', marginBottom: 'var(--space-lg)' }}>
        Participate in protocol governance and vote on proposals.
      </p>
    </main>
  );
};

const AppPage = () => {
  return (
    <main style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '100px var(--space-lg)',
      minHeight: '70vh'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        letterSpacing: '-0.04em',
        marginBottom: 'var(--space-xl)',
        textTransform: 'uppercase'
      }}>Launch App</h1>
      <p style={{ fontSize: '16px', marginBottom: 'var(--space-lg)' }}>
        The ISNAD application interface is launching soon.
      </p>
    </main>
  );
};

const App = () => {
  useEffect(() => {
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
      }
      @media (max-width: 768px) {
        .grid-section { grid-template-columns: 1fr !important; }
        canvas { display: none !important; }
        .stats-bar { grid-template-columns: 1fr !important; }
        .hero { min-height: auto !important; padding-bottom: var(--space-xl) !important; }
        h1 { font-size: 32px !important; }
      }
    `;
    document.head.appendChild(style);

    const linkElement = document.createElement('link');
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    linkElement.rel = 'stylesheet';
    document.head.appendChild(linkElement);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(linkElement);
    };
  }, []);

  return (
    <Router basename="/">
      <div style={customStyles.root}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;