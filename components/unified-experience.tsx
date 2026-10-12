"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ValleyJourneyScene = dynamic(() => import("@/components/valley-scene"), {
  ssr: false,
  loading: () => <div className="valley-light-placeholder" />
});

const FloatingBlob = dynamic(() => import("@/components/floating-blob"), {
  ssr: false
});

export default function UnifiedExperience() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const p = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
        setScrollProgress(p);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // GSAP reveal animations for content cards & headers
    const elements = document.querySelectorAll(".reveal-item");
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
          }
        }
      );
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Determine current atmospheric cycle based on scrollProgress
  const isNight = scrollProgress > 0.65;
  const timeLabel =
    scrollProgress < 0.45
      ? "DAWN / DAY"
      : scrollProgress < 0.68
      ? "GOLDEN SUNSET"
      : "MIDNIGHT STARS";

  return (
    <div className={`unified-light-app ${isNight ? "is-night-theme" : ""}`}>
      {/* 1. Background 3D Animated Valley Layer (Clear & High Fidelity) */}
      <div className="valley-bg-stage" aria-hidden="true">
        <ValleyJourneyScene progress={scrollProgress} />
        <div className="valley-light-vignette" />
      </div>

      {/* 2. Floating Signature Blob that navigates with scroll */}
      <FloatingBlob scrollProgress={scrollProgress} />

      {/* 3. Top Navigation Header */}
      <header className="light-header">
        <div className="header-inner">
          <a href="#top" className="light-brand" aria-label="ThoughtLab home">
            <span className="brand-dot" />
            thoughtlab<sup>®</sup>
          </a>

          <div className="light-tagline">
            Alpine Valley Experience · {timeLabel}
          </div>

          <div className="header-right">
            <a href="#contact" className="light-pill-btn">
              <span>Start a project</span>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 13 13 3M4 3h9v9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </a>
            <button
              className={`light-menu-btn ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Navigation menu"
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Fullscreen Menu Overlay */}
      <div className={`light-menu-overlay ${menuOpen ? "active" : ""}`}>
        <div className="menu-container">
          <small className="menu-kicker">Navigation</small>
          <nav className="menu-nav-links">
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            <a href="#services" onClick={() => setMenuOpen(false)}>
              Services
            </a>
            <a href="#work" onClick={() => setMenuOpen(false)}>
              Selected work
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </nav>
          <div className="menu-foot">
            <span>Independent by design. Thoughtful by nature.</span>
            <a href="mailto:hello@thoughtlab.studio">hello@thoughtlab.studio ↗</a>
          </div>
        </div>
      </div>

      {/* 4. Page Content Structure */}
      <main id="top" ref={mainRef} className="light-content-flow">
        {/* HERO SECTION */}
        <section className="light-hero">
          <div className="hero-grid-content">
            <div className="hero-text-block">
              <p className="hero-kicker-tag">Software, thoughtfully made.</p>
              <h1 className="hero-display-title">
                <span>Build</span>
                <span className="indent-line">what’s next.</span>
              </h1>
            </div>

            <div className="hero-bottom-grid">
              <p className="hero-lead-text">
                We turn ambitious ideas into useful software — from first sketch
                to the moment it makes an enduring difference.
              </p>
              <div className="hero-action-link">
                <a href="#work" className="glass-link">
                  <span>Explore our work</span>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 13 13 3M4 3h9v9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="hero-hud-footer">
              <span className="hud-badge">VALLEY EXPEDITION / {timeLabel}</span>
              <span className="hud-scroll-cue">
                <i className="cue-bar" /> Scroll down to travel from daylight to starry night
              </span>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="light-section" id="about">
          <div className="section-container">
            <div className="kicker-row reveal-item">
              <span className="kicker-dash" />
              <span>A little about us</span>
            </div>

            <h2 className="section-statement reveal-item">
              We make complex things feel{" "}
              <span className="accent-text">clear, considered, and human.</span>
            </h2>

            <div className="about-subgrid reveal-item">
              <p>
                ThoughtLab is an independent software development company for
                people building a better kind of business. We bring product
                strategy, design, and engineering into one senior, dedicated team.
              </p>
              <div className="subgrid-link">
                <a href="#services" className="glass-link">
                  <span>How we can help</span>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 13 13 3M4 3h9v9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* SERVICES LIST */}
            <div className="services-strip" id="services">
              <div className="service-card reveal-item">
                <span className="svc-idx">01</span>
                <h3>Digital product development</h3>
                <p>
                  From the first prototype to a platform ready for the real world.
                </p>
                <span className="svc-arrow">↗</span>
              </div>
              <div className="service-card reveal-item">
                <span className="svc-idx">02</span>
                <h3>Websites & platforms</h3>
                <p>Fast, accessible web experiences engineered to scale gracefully.</p>
                <span className="svc-arrow">↗</span>
              </div>
              <div className="service-card reveal-item">
                <span className="svc-idx">03</span>
                <h3>AI & intelligent tools</h3>
                <p>Useful, responsible AI that solves real operational bottlenecks.</p>
                <span className="svc-arrow">↗</span>
              </div>
              <div className="service-card reveal-item">
                <span className="svc-idx">04</span>
                <h3>Product strategy & design</h3>
                <p>Clear direction, thoughtful UX, and scalable system architecture.</p>
                <span className="svc-arrow">↗</span>
              </div>
            </div>
          </div>
        </section>

        {/* WORK SECTION */}
        <section className="light-section" id="work">
          <div className="section-container">
            <div className="work-header-wrap reveal-item">
              <div>
                <div className="kicker-row">
                  <span className="kicker-dash" />
                  <span>Selected collaborations</span>
                </div>
                <h2 className="section-heading-big">Made to matter.</h2>
              </div>
              <a href="#contact" className="glass-link">
                <span>Have a challenge? Let’s talk</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 13 13 3M4 3h9v9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </a>
            </div>

            {/* PROJECT 1 */}
            <article className="project-feature-card reveal-item">
              <div className="feature-media glass-media">
                <div className="preview-dashboard">
                  <div className="dash-bar">
                    <span className="dash-title">northstar / analytics</span>
                    <span className="dash-pill" />
                  </div>
                  <div className="dash-grid">
                    <div className="dash-stat">
                      <small>Monthly volume</small>
                      <strong>24,806</strong>
                      <div className="dash-sparkline" />
                    </div>
                    <div className="dash-stat">
                      <small>Active accounts</small>
                      <strong>1,284</strong>
                      <div className="dash-bars">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-content">
                <div className="meta-tag">Fintech · Product design · Platform</div>
                <h3>Clarity for a more confident future.</h3>
                <p>
                  A new-generation financial platform that makes the complex
                  simple — and puts decisive visibility within reach.
                </p>
                <a href="#contact" className="glass-link">
                  <span>Discuss a similar project</span> ↗
                </a>
              </div>
            </article>

            {/* PROJECT 2 */}
            <article className="project-feature-card reverse reveal-item">
              <div className="feature-media glass-media">
                <div className="orbit-interactive-mock">
                  <div className="mock-ring ring-1" />
                  <div className="mock-ring ring-2" />
                  <div className="mock-core" />
                  <div className="mock-satellite" />
                </div>
              </div>
              <div className="feature-content">
                <div className="meta-tag">
                  Climate tech · Web platform · Engineering
                </div>
                <h3>Better data. Lighter footprint.</h3>
                <p>
                  Turning fragmented environmental data into one clear picture
                  teams can act on every day.
                </p>
                <a href="#contact" className="glass-link">
                  <span>Discuss a similar project</span> ↗
                </a>
              </div>
            </article>

            {/* PROJECT 3 */}
            <article className="project-feature-card reveal-item">
              <div className="feature-media glass-media">
                <div className="mobile-shell-mock">
                  <div className="screen-notch" />
                  <div className="screen-avatar" />
                  <div className="screen-line w-long" />
                  <div className="screen-line w-short" />
                  <div className="screen-card">
                    <span />
                    <span />
                  </div>
                  <div className="screen-btn" />
                </div>
              </div>
              <div className="feature-content">
                <div className="meta-tag">
                  Health · Mobile product · Experience
                </div>
                <h3>Making everyday care feel closer.</h3>
                <p>
                  A calm, human-centered companion helping people stay connected to
                  their health care journey, on their terms.
                </p>
                <a href="#contact" className="glass-link">
                  <span>Discuss a similar project</span> ↗
                </a>
              </div>
            </article>

            {/* Statement banner */}
            <div className="editorial-callout reveal-item">
              <small className="callout-tag">A note on how we work</small>
              <p>
                Small teams. Senior minds. No theatre. Just thoughtful people
                who care about making the right thing, really well.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="light-section contact-section" id="contact">
          <div className="section-container contact-box reveal-item">
            <div className="kicker-row">
              <span className="kicker-dash" />
              <span>Have a good one in mind?</span>
            </div>
            <h2 className="contact-huge-title">
              Let’s make<br />
              <span className="accent-gray">it real.</span>
            </h2>
            <div className="contact-action-row">
              <a
                href="mailto:hello@thoughtlab.studio"
                className="light-pill-btn big"
              >
                <span>Tell us about it</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 13 13 3M4 3h9v9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="light-footer">
        <div className="footer-container">
          <span>© 2026 ThoughtLab® — Made with intention.</span>
          <div className="footer-links-group">
            <a href="mailto:hello@thoughtlab.studio">hello@thoughtlab.studio</a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
