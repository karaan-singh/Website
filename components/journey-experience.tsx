"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ValleyJourneyScene = dynamic(() => import("@/components/valley-scene"), {
  ssr: false,
  loading: () => <div className="valley-loader-bg" />
});

const CHAPTERS = [
  {
    index: "01",
    text: "The world opens\nwhen you stay.",
    range: [0.18, 0.38]
  },
  {
    index: "02",
    text: "Night settles\nover the valley.",
    range: [0.46, 0.64]
  },
  {
    index: "03",
    text: "A river of light,\ntoward the Milky Way.",
    range: [0.72, 0.94]
  }
];

export default function JourneyExperience() {
  const [hasStarted, setHasStarted] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const progressRef = useRef(0);
  const holdRef = useRef(false);

  // Initial Preloader percentage counter animation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setLoaderProgress(current);
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Sync ref
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Smooth wheel scroll handler
  useEffect(() => {
    if (!hasStarted) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00065;
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
      setProgress(next);
      if (next >= 0.98) {
        setShowSummary(true);
      } else {
        setShowSummary(false);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [hasStarted]);

  // Hold-to-advance animation frame loop
  useEffect(() => {
    let animId: number;
    const tick = () => {
      if (holdRef.current) {
        const next = Math.min(progressRef.current + 0.0028, 1);
        setProgress(next);
        if (next >= 0.98) {
          setShowSummary(true);
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = () => {
    holdRef.current = true;
    setIsHolding(true);
  };

  const handlePointerUp = () => {
    holdRef.current = false;
    setIsHolding(false);
  };

  // Find active poetic chapter
  const currentChapter = CHAPTERS.find(
    (c) => progress >= c.range[0] && progress <= c.range[1]
  );

  return (
    <div className="journey-viewport">
      {/* 3D WebGL Canvas Layer */}
      <div className="journey-canvas-container">
        <ValleyJourneyScene progress={progress} />
      </div>

      {/* Intro Preloader Screen */}
      {!hasStarted && (
        <div className="journey-preloader">
          <div className="preloader-content">
            <div className="preloader-logo">
              <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
                <path
                  d="M10 24C12 28 17 31 22 29C27 27 28 20 28 14C28 10 26 8 20 9C14 10 10 16 10 24Z"
                  stroke="#385438"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="18" r="1.5" fill="#385438" />
                <circle cx="24" cy="17" r="1.5" fill="#385438" />
              </svg>
            </div>
            <h1 className="preloader-title">Hiromu</h1>
            <div className="preloader-counter">{loaderProgress}%</div>
            <div className="preloader-status">JOURNEY READY</div>

            {loaderProgress === 100 && (
              <button
                className="preloader-enter-btn"
                onClick={() => setHasStarted(true)}
              >
                <span>ENTER THE JOURNEY</span>
                <span className="btn-arrow">↗</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Experience HUD / Navigation */}
      {hasStarted && (
        <>
          {/* Top Left Header Brand */}
          <header className="journey-hud-header">
            <div className="hud-brand">JOURNEY</div>
            <div className="hud-sub">REBUILT IN THREE.JS & WEBGL</div>
          </header>

          {/* Right Progress indicator track */}
          <div className="journey-hud-timeline">
            <div className="timeline-track">
              <div
                className="timeline-thumb"
                style={{ height: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Dynamic Chapter Text */}
          <div
            className={`journey-poetic-text ${
              currentChapter ? "is-visible" : ""
            }`}
          >
            {currentChapter && (
              <>
                <div className="poetic-num">{currentChapter.index}</div>
                <div className="poetic-quote">
                  {currentChapter.text.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Interactive Hold / Scroll Widget */}
          {!showSummary && (
            <div className="journey-hud-bottom">
              <button
                className={`journey-hold-btn ${isHolding ? "is-holding" : ""}`}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <div className="hold-ring">
                  <svg viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="19"
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="19"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="120"
                      strokeDashoffset={120 - 120 * progress}
                      transform="rotate(-90 22 22)"
                    />
                  </svg>
                </div>
                <span className="hold-label">
                  {isHolding ? "TRAVELING" : "SCROLL OR HOLD"}
                </span>
              </button>
            </div>
          )}

          {/* End Summary Card (Matching 01:18 in rec1.mp4) */}
          {showSummary && (
            <div className="journey-summary-overlay">
              <div className="summary-nav">
                <span className="summary-title">Hiromu / Journey</span>
                <div className="summary-links">
                  <span>HOME</span>
                  <span>PROJECT</span>
                  <span>PORTFOLIO ↗</span>
                </div>
              </div>

              <div className="summary-hero">
                <div className="summary-meta">FIELD REFERENCE / KAMIKOCHI</div>
                <h2 className="summary-h1">Journey</h2>
                <p className="summary-sub">
                  A memory of Kamikochi, rebuilt as an interactive landscape.
                </p>
                <button
                  className="summary-restart-btn"
                  onClick={() => {
                    setProgress(0);
                    setShowSummary(false);
                  }}
                >
                  EXPERIENCE JOURNEY ↗
                </button>
              </div>

              <div className="summary-footer-grid">
                <div>
                  <small>ROLE</small>
                  <p>ART DIRECTION / 3D / DEVELOPMENT</p>
                </div>
                <div>
                  <small>INTERACTION</small>
                  <p>SCROLL / HOLD / SPATIAL AUDIO</p>
                </div>
                <div>
                  <small>BUILT WITH</small>
                  <p>THREE.JS / REACT / WEBGL</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
