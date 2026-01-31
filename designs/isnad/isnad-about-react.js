import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Logo = () => (
  <Link to="/" className="logo" style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
    <div className="logo-dot" style={{ width: '14px', height: '14px', background: 'var(--text-primary)' }}></div>
    ISNAD_PROTOCOL
  </Link>
);

const NavLinks = () => (
  <div className="nav-links" style={{ display: 'flex', gap: 'var(--space-xl)' }}>
    <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documentation</a>
    <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Governance</a>
    <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Launch App</a>
  </div>
);

const Navigation = () => (
  <nav style={{ padding: 'var(--space-lg) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--text-primary)', background: 'var(--bg-root)', position: 'sticky', top: 0, zIndex: 100 }}>
    <div className="layout-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-lg)', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <Logo />
      <NavLinks />
    </div>
  </nav>
);

const HeroSection = () => {
  const calligraphyCanvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);

  useEffect(() => {
    const calligraphyCanvas = calligraphyCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    
    if (!calligraphyCanvas || !backgroundCanvas) return;

    const ctx = calligraphyCanvas.getContext('2d');
    const bgCtx = backgroundCanvas.getContext('2d');

    const resize = () => {
      calligraphyCanvas.width = window.innerWidth;
      calligraphyCanvas.height = window.innerHeight * 0.85;
    };

    const resizeBg = () => {
      backgroundCanvas.width = window.innerWidth;
      backgroundCanvas.height = window.innerHeight * 0.85;
    };

    resize();
    resizeBg();

    window.addEventListener('resize', resize);
    window.addEventListener('resize', resizeBg);

    let nodes = [];
    let time = 0;
    const numNodes = 12;

    class Node {
      constructor(index) {
        this.index = index;
        this.angle = (index / numNodes) * Math.PI * 2;
        this.radius = Math.min(calligraphyCanvas.width, calligraphyCanvas.height) * 0.42;
        this.x = 0;
        this.y = 0;
        this.size = 8;
        this.activeConnection = null;
        this.activationTime = Math.random() * 200;
      }
      update() {
        const rotation = time * 0.003;
        const currentAngle = this.angle + rotation;
        const breathe = Math.sin(time * 0.002) * 20;

        this.x = calligraphyCanvas.width / 2 + Math.cos(currentAngle) * (this.radius + breathe);
        this.y = calligraphyCanvas.height / 2 + Math.sin(currentAngle) * (this.radius + breathe);

        const pulse = Math.sin(time * 0.05 + this.index * 0.5) * 0.3 + 1;
        this.currentSize = this.size * pulse;
      }
      draw() {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.6)';
        ctx.fillStyle = '#C5A059';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < numNodes; i++) {
      nodes.push(new Node(i));
    }

    const animate = () => {
      time++;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, calligraphyCanvas.width, calligraphyCanvas.height);

      nodes.forEach(n => n.update());

      for (let i = 0; i < nodes.length; i++) {
        const current = nodes[i];
        const next = nodes[(i + 1) % nodes.length];

        const signalProgress = ((time * 0.01 + i * 0.3) % 1);
        const signalX = current.x + (next.x - current.x) * signalProgress;
        const signalY = current.y + (next.y - current.y) * signalProgress;

        const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
        gradient.addColorStop(0, 'rgba(197, 160, 89, 0.3)');
        gradient.addColorStop(signalProgress, 'rgba(220, 180, 100, 0.8)');
        gradient.addColorStop(1, 'rgba(197, 160, 89, 0.3)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(220, 180, 100, 0.9)';
        ctx.fillStyle = 'rgba(220, 180, 100, 0.9)';
        ctx.beginPath();
        ctx.arc(signalX, signalY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      nodes.forEach(n => n.draw());

      requestAnimationFrame(animate);
    };

    let particles = [];
    let bgTime = 0;
    const numParticles = 80;

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * backgroundCanvas.height;
      }
      reset() {
        this.x = Math.random() * backgroundCanvas.width;
        this.y = -10;
        this.speed = 0.5 + Math.random() * 1.5;
        this.size = 1 + Math.random() * 2;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.drift = (Math.random() - 0.5) * 0.5;
      }
      update() {
        this.y += this.speed;
        this.x += this.drift;

        if (this.y > backgroundCanvas.height) {
          this.reset();
        }
      }
      draw() {
        bgCtx.fillStyle = `rgba(197, 160, 89, ${this.opacity})`;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    const animateBg = () => {
      bgTime++;
      bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.15;
            bgCtx.strokeStyle = `rgba(197, 160, 89, ${opacity})`;
            bgCtx.lineWidth = 0.5;
            bgCtx.beginPath();
            bgCtx.moveTo(particles[i].x, particles[i].y);
            bgCtx.lineTo(particles[j].x, particles[j].y);
            bgCtx.stroke();
          }
        }
      }

      requestAnimationFrame(animateBg);
    };

    animate();
    animateBg();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', resizeBg);
    };
  }, []);

  return (
    <section className="about-hero" style={{ height: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', background: 'white', borderBottom: '2px solid var(--text-primary)' }}>
      <canvas ref={calligraphyCanvasRef} id="calligraphy-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, opacity: 0.75, pointerEvents: 'none' }}></canvas>
      <canvas ref={backgroundCanvasRef} id="background-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}></canvas>
      <div className="calligraphy-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', marginBottom: 'var(--space-xl)' }}>
        <div className="arabic-calligraphy" style={{ fontFamily: 'var(--font-arabic)', fontSize: '180px', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1, position: 'relative', zIndex: 2 }}>إسناد</div>
        <div className="hero-sub" style={{ fontFamily: 'var(--font-code)', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 'var(--space-md)', color: 'var(--text-secondary)' }}>The Chain of Attribution</div>
      </div>
    </section>
  );
};

const EditorialSection = ({ label, children }) => (
  <section className="editorial-section" style={{ padding: 'var(--space-2xl) 0', borderBottom: '1px solid var(--border-dim)' }}>
    <div className="editorial-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--space-2xl)' }}>
      <div className="editorial-label" style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', position: 'sticky', top: '120px', height: 'fit-content' }}>
        {label}
        <span style={{ content: '""', display: 'block', width: '40px', height: '2px', background: 'var(--accent-gold)', marginTop: 'var(--space-sm)' }}></span>
      </div>
      <div className="editorial-content">
        {children}
      </div>
    </div>
  </section>
);

const MemberCard = ({ name, role }) => (
  <div className="member-card" style={{ border: '1px solid var(--border-dim)', padding: 'var(--space-lg)', background: 'white' }}>
    <div className="member-name" style={{ fontWeight: 700, fontSize: '18px', marginBottom: 'var(--space-xs)' }}>{name}</div>
    <div className="member-role" style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{role}</div>
  </div>
);

const Footer = () => (
  <footer className="footer-socials" style={{ display: 'flex', gap: 'var(--space-xl)', padding: 'var(--space-xl) 0', borderTop: '2px solid var(--text-primary)', marginTop: 'var(--space-2xl)' }}>
    <a href="#" className="social-link" style={{ fontFamily: 'var(--font-code)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>GITHUB / isnad-core</a>
    <a href="#" className="social-link" style={{ fontFamily: 'var(--font-code)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>TWITTER / @isnad_proto</a>
    <a href="#" className="social-link" style={{ fontFamily: 'var(--font-code)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>MOLTBOOK / isnad.molt</a>
  </footer>
);

const AboutPage = () => {
  return (
    <>
      <HeroSection />
      <div className="layout-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-lg)' }}>
        <EditorialSection label="Etymology">
          <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, marginBottom: 'var(--space-lg)', maxWidth: '700px' }}>From Hadith to Hash.</h2>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', maxWidth: '650px' }}>
            In classical Islamic scholarship, <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Isnad</span> refers to the chain of authorities attesting to the historical authenticity of a particular narrative. It is a system of verification that relies on the credibility of every link in the transmission.
          </p>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', maxWidth: '650px' }}>
            We have adapted this ancient philosophical framework for the age of silicon. As AI agents begin to act autonomously in our economy, the question of 'Who authorized this?' becomes paramount. ISNAD provides the cryptographic chain of trust for the synthetic era.
          </p>
        </EditorialSection>

        <EditorialSection label="The Thesis">
          <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, marginBottom: 'var(--space-lg)', maxWidth: '700px' }}>Why we built this.</h2>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', maxWidth: '650px' }}>
            The proliferation of autonomous code presents a paradox: we require agents to be independent to be useful, yet we fear their independence when it lacks accountability.
          </p>
          <blockquote style={{ borderLeft: '4px solid var(--accent-gold)', paddingLeft: 'var(--space-lg)', margin: 'var(--space-xl) 0', fontStyle: 'italic', fontSize: '24px', color: 'var(--text-primary)' }}>
            "Trust is not the absence of risk, but the mathematical certainty of attribution."
          </blockquote>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', maxWidth: '650px' }}>
            Current security models are reactive. ISNAD is proactive. By requiring auditors to stake their own capital on the behavior of an agent, we align economic incentives with technical safety. If an agent fails its mandate, the chain of trust breaks—and the financial consequences are immediate.
          </p>
        </EditorialSection>

        <EditorialSection label="The Guardians">
          <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, marginBottom: 'var(--space-lg)', maxWidth: '700px' }}>Contributors.</h2>
          <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', marginTop: 'var(--space-xl)' }}>
            <MemberCard name="Malik Al-Farabi" role="Protocol Architect" />
            <MemberCard name="Sarah Chen" role="Zero-Knowledge Lead" />
            <MemberCard name="Julian Vane" role="Mechanism Design" />
          </div>
        </EditorialSection>

        <Footer />
      </div>
    </>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-root: #f5f5f7;
        --bg-surface: #ffffff;
        --bg-subtle: #eeeeee;
        --border-dim: #e0e0e0;
        --border-highlight: #000000;
        --text-primary: #000000;
        --text-secondary: #555555;
        --text-tertiary: #999999;
        --accent-gold: #C5A059;
        --radius-sm: 0px;
        --space-xs: 4px;
        --space-sm: 8px;
        --space-md: 16px;
        --space-lg: 24px;
        --space-xl: 48px;
        --space-2xl: 80px;
        --font-ui: 'Space Grotesk', system-ui, -apple-system, sans-serif;
        --font-code: 'JetBrains Mono', monospace;
        --font-arabic: 'Noto Sans Arabic', serif;
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
        font-size: 16px;
        line-height: 1.6;
        overflow-x: hidden;
      }
      .social-link:hover {
        color: var(--accent-gold);
      }
      @media (max-width: 768px) {
        .editorial-grid { grid-template-columns: 1fr !important; gap: var(--space-lg) !important; }
        .editorial-label { position: static !important; }
        .arabic-calligraphy { font-size: 100px !important; }
        .team-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);

    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@300;700&display=swap'
    ];

    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<AboutPage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;