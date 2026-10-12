"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SystemCore = dynamic(() => import("@/components/system-core"), {
  ssr: false,
  loading: () => <div className="core-stage core-stage--loading" aria-hidden="true"><span /></div>
});

gsap.registerPlugin(ScrollTrigger);

const services = [
  { id: "01", title: "Software engineering", detail: "Purpose-built platforms, products, and enterprise systems — engineered for the long run, not the launch day." },
  { id: "02", title: "Generative AI", detail: "Useful intelligence, woven into the work people already do. From private models to production-ready copilots." },
  { id: "03", title: "Agentic systems", detail: "Agents that can reason, use tools, and complete real workflows — with the safeguards and visibility businesses need." },
  { id: "04", title: "Mobile applications", detail: "Native-feeling iOS and Android experiences that keep the essential close, fast, and easy to use." },
  { id: "05", title: "ERP & operations", detail: "Connected operational software that brings people, processes, and business data into clearer focus." },
  { id: "06", title: "Automation", detail: "Less repetitive work. Thoughtful orchestration across teams, systems, and the edges between them." },
  { id: "07", title: "Cloud & APIs", detail: "Resilient cloud foundations and carefully designed APIs that make an evolving technology stack work as one." },
  { id: "08", title: "Product experience", detail: "Research, interface design, and front-end craft that turn complex workflows into confident experiences." }
];

function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return <svg className="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d={diagonal ? "M4 16 16 4M6 4h10v10" : "M3 10h13m-5-5 5 5-5 5"} stroke="currentColor" strokeWidth="1.35" /></svg>;
}

function ProjectArt({ kind }: { kind: "school" | "ledger" | "flow" }) {
  if (kind === "school") return (
    <div className="product-window school-window" aria-hidden="true">
      <div className="window-top"><span className="window-symbol">a.</span><span>ATLAS / LEARNING</span><span>SPRING TERM&nbsp; ↗</span></div>
      <div className="school-layout"><aside><i /><i /><i /><i /></aside><div className="school-main"><div className="mini-label">TUESDAY, 24 SEPTEMBER</div><div className="school-title">Good morning,<br /><span>Amara.</span></div><div className="class-row"><span>01</span><b>Mathematics</b><small>08:30 — 09:20</small><em>→</em></div><div className="class-row"><span>02</span><b>Design studio</b><small>09:40 — 10:30</small><em>→</em></div><div className="class-row"><span>03</span><b>World history</b><small>11:00 — 11:50</small><em>→</em></div></div><div className="school-side"><small>YOUR WEEK</small><div className="week-ring"><strong>82%</strong><span>on track</span></div><div className="week-lines"><i /><i /><i /></div></div></div>
    </div>
  );
  if (kind === "ledger") return (
    <div className="product-window ledger-window" aria-hidden="true">
      <div className="ledger-rail"><b>n/</b><span>⌂</span><span>◫</span><span>⌁</span><span>＋</span></div><div className="ledger-body"><div className="window-top"><span>OVERVIEW / Q3</span><span>LAST 30 DAYS&nbsp;⌄</span></div><div className="ledger-heading">A clearer view<br />of your business.</div><div className="metric-row"><div><small>NET REVENUE</small><b>$284,390</b><em>↗ 12.8%</em></div><div><small>OPERATING COST</small><b>$91,240</b><em>↘ 3.4%</em></div></div><div className="chart"><div className="chart-grid"><i /><i /><i /><i /></div><svg viewBox="0 0 540 110" preserveAspectRatio="none"><path d="M0 88 C45 74 46 86 92 66 S151 75 185 51 226 69 272 38 328 56 364 30 408 52 448 18 490 28 540 8" fill="none" stroke="#6384ff" strokeWidth="2" /><path d="M0 88 C45 74 46 86 92 66 S151 75 185 51 226 69 272 38 328 56 364 30 408 52 448 18 490 28 540 8 L540 110 L0 110Z" fill="url(#chartFade)" opacity=".25" /><defs><linearGradient id="chartFade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6384ff" /><stop offset="1" stopColor="#6384ff" stopOpacity="0" /></linearGradient></defs></svg></div></div>
    </div>
  );
  return (
    <div className="flow-art" aria-hidden="true"><div className="flow-top"><span>WORKFLOW / 07</span><span>LIVE&nbsp; <i /></span></div><div className="flow-path"><div className="flow-node flow-trigger"><small>WHEN</small><b>New request</b><span>Customer portal</span></div><div className="flow-wire"><i /><i /><i /></div><div className="flow-node flow-agent"><div className="agent-mark">✳</div><small>AGENT</small><b>Understand<br />the request</b><span>Reasoning · 1.2s</span></div><div className="flow-wire"><i /><i /><i /></div><div className="flow-node flow-action"><small>THEN</small><b>Route to team</b><span>CRM + Slack</span></div></div><div className="flow-footer"><span><i /> 3 steps connected</span><span>Run history&nbsp; ↗</span></div></div>
  );
}

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const [activeService, setActiveService] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [cursorActive, setCursorActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (!reduceMotion) {
        document.documentElement.classList.add("motion-ready");
        gsap.fromTo(".hero-kicker, .hero-title-line, .hero-deck, .hero-actions", { y: 38, opacity: 0, clipPath: "inset(0 0 18% 0)" }, { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1.1, stagger: 0.13, ease: "power4.out", delay: 0.16 });
        gsap.to(".hero-title .shift-word", { yPercent: -17, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.1 } });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(element, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>("[data-image-reveal]").forEach((element) => {
          gsap.fromTo(element, { clipPath: "inset(8% 8% 8% 8%)", scale: 1.045 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "power3.inOut", scrollTrigger: { trigger: element, start: "top 82%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>(".service-item").forEach((element, index) => {
          ScrollTrigger.create({ trigger: element, start: "top 68%", end: "bottom 40%", onEnter: () => setActiveService(index), onEnterBack: () => setActiveService(index) });
        });
      }
    }, root);

    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);

    const cursor = document.querySelector<HTMLElement>(".cursor-orbit");
    let moveX: ((value: number) => void) | undefined;
    let moveY: ((value: number) => void) | undefined;
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !cursor) return;
      if (!moveX) { moveX = gsap.quickTo(cursor, "x", { duration: 0.32, ease: "power3" }); moveY = gsap.quickTo(cursor, "y", { duration: 0.32, ease: "power3" }); }
      moveX(event.clientX); moveY?.(event.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    const hoverTargets = document.querySelectorAll<HTMLElement>("[data-cursor]");
    const enter = (event: Event) => { setCursorText((event.currentTarget as HTMLElement).dataset.cursor || ""); setCursorActive(true); };
    const leave = () => { setCursorText(""); setCursorActive(false); };
    hoverTargets.forEach((target) => { target.addEventListener("pointerenter", enter); target.addEventListener("pointerleave", leave); });

    return () => {
      context.revert();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onPointer);
      hoverTargets.forEach((target) => { target.removeEventListener("pointerenter", enter); target.removeEventListener("pointerleave", leave); });
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="experience" ref={root}>
      <SystemCore />
      <div className={`cursor-orbit${cursorActive ? " is-active" : ""}`} aria-hidden="true"><span>{cursorText}</span></div>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <a className="wordmark" href="#top" aria-label="ThoughtLab, home"><span className="brand-glyph"><i /><i /><i /></span><span>thoughtlab<sup>®</sup></span></a>
        <p className="header-note">INDEPENDENT DIGITAL SYSTEMS STUDIO</p>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#work">Work</a><a href="#services">Expertise</a><a href="#about">Studio</a><a className="nav-contact" href="#contact">Let’s talk <Arrow /></a></nav>
        <button className={`menu-toggle${menuOpen ? " is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      </header>
      <div className={`mobile-menu${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation"><a onClick={closeMenu} href="#work">Work <span>01</span></a><a onClick={closeMenu} href="#services">Expertise <span>02</span></a><a onClick={closeMenu} href="#about">Studio <span>03</span></a><a onClick={closeMenu} href="#contact">Contact <span>04</span></a></nav>
        <p>THOUGHTFUL TECHNOLOGY. BUILT TO MOVE.</p>
      </div>

      <section className="hero section-frame" id="top" aria-labelledby="hero-title">
        <div className="hero-grid-mark" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow hero-kicker"><span className="signal-dot" /> WE BUILD WHAT’S NEXT <span className="eyebrow-rule" /> EST. FOR WHAT’S AHEAD</p>
          <h1 className="hero-title" id="hero-title"><span className="hero-title-line">Software that</span><span className="hero-title-line"><span className="shift-word">moves</span> business</span><span className="hero-title-line hero-title-last">forward<span className="title-period">.</span></span></h1>
          <div className="hero-bottom hero-deck"><div className="hero-categories">AI <i /> SOFTWARE <i /> AUTOMATION <i /> DIGITAL PRODUCTS</div><div className="hero-actions"><p>We turn complexity into capable, considered technology — built for the way your business moves.</p><a className="button-primary magnetic" href="#contact" data-cursor="LET’S TALK">Start a project <Arrow /></a><a className="button-text" href="#work">Explore our work <span>↓</span></a></div></div>
        </div>
        <div className="hero-index"><span>01 / 06</span><span>SCROLL TO EXPLORE</span><span className="index-line" /></div>
        <div className="hero-coordinate" aria-hidden="true">51°30′26.4″N<br />00°07′39.6″W</div>
      </section>

      <section className="about section-frame" id="about" aria-labelledby="about-title">
        <div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">01</span> / THE STUDIO</p><p className="section-aside">A SMALL, SENIOR TEAM<br />FOR AMBITIOUS PROBLEMS.</p></div>
        <div className="about-layout">
          <h2 className="editorial-heading" id="about-title" data-reveal>We don’t just build software.<br /><span>We engineer systems.</span></h2>
          <div className="about-side" data-reveal><p className="lead-copy">The best technology doesn’t ask for attention. It gives people more room to do remarkable things.</p><p>We bring product thinking, engineering depth, and a healthy respect for complexity to every challenge — from a first sketch to the systems a business depends on.</p><a className="text-link" href="#services">Meet our approach <Arrow /></a></div>
        </div>
        <div className="principles" data-reveal><div className="principle-stamp"><span>THOUGHT<br />INTO<br />THING</span><i>✳</i></div><div><span>01 — MAKE IT MATTER</span><p>Technology starts with people, not a toolset. We find the useful thing first.</p></div><div><span>02 — BUILD FOR CHANGE</span><p>Clear foundations. Composable systems. Room to become something more.</p></div><div><span>03 — STAY CLOSE</span><p>Senior minds, working alongside yours. No hand-offs into the unknown.</p></div></div>
      </section>

      <section className="services section-frame" id="services" aria-labelledby="services-title">
        <div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">02</span> / WHAT WE MAKE</p><p className="section-aside">THE RIGHT PEOPLE.<br />THE RIGHT KIND OF BUILD.</p></div>
        <div className="services-layout"><div className="services-intro" data-reveal><h2 className="section-title" id="services-title">Capability<br />without the<br /><span>complication.</span></h2><p>From one well-chosen intervention to a platform that changes how the whole business works.</p><div className="service-active-note"><span>0{activeService + 1}</span><i /> SELECTED DISCIPLINE</div></div>
          <div className="service-list" role="list">{services.map((service, index) => <article className={`service-item${activeService === index ? " is-active" : ""}`} key={service.id} role="listitem"><button type="button" aria-expanded={activeService === index} onClick={() => setActiveService(index)}><span className="service-id">{service.id}</span><span className="service-name">{service.title}</span><span className="service-control">{activeService === index ? "−" : "+"}</span></button><div className="service-detail" aria-hidden={activeService !== index}><p>{service.detail}</p><span>STRATEGY&nbsp; / &nbsp;DESIGN&nbsp; / &nbsp;ENGINEERING</span></div></article>)}</div>
        </div>
        <div className="services-foot"><span>ONE TEAM. END TO END.</span><span>SCROLL OR SELECT TO EXPLORE</span></div>
      </section>

      <section className="intelligence section-frame" id="intelligence" aria-labelledby="intelligence-title">
        <div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">03</span> / INTELLIGENCE, APPLIED</p><p className="section-aside">LESS HYPE.<br />MORE INDEPENDENT THOUGHT.</p></div>
        <div className="intelligence-layout"><div className="intelligence-copy" data-reveal><p className="eyebrow red-eyebrow"><span className="signal-dot" /> BUILT TO DO, NOT JUST SAY</p><h2 id="intelligence-title">From software that responds <span>to software that thinks.</span></h2><p className="lead-copy">We connect intelligent models to the tools, data, and decisions that move real work forward — with human judgment exactly where it belongs.</p><a className="text-link" href="#contact">Explore AI with us <Arrow /></a></div>
          <div className="network-art" data-image-reveal aria-label="Diagram showing an AI agent connecting a user to business tools and actions"><div className="network-label">A REASONING SYSTEM / IN PRODUCTION</div><svg className="network-lines" viewBox="0 0 600 470" fill="none" aria-hidden="true"><path d="M80 72 292 122 512 72M80 72 108 238 292 122 492 238 512 72M108 238 292 355 492 238M108 238 80 402 292 355 512 402 492 238" stroke="#444a56" strokeWidth="1" /><path className="trace trace-blue" d="M80 72 292 122 492 238 292 355 80 402" stroke="#6685ff" strokeWidth="1.5" /><path className="trace trace-red" d="M512 72 492 238 292 355 512 402" stroke="#fd5365" strokeWidth="1.2" /><circle r="3" fill="#a8baff"><animateMotion dur="5s" repeatCount="indefinite" path="M80 72 292 122 492 238 292 355 80 402" /></circle><circle r="2.5" fill="#fd5365"><animateMotion dur="4s" begin="1s" repeatCount="indefinite" path="M512 72 492 238 292 355 512 402" /></circle></svg><div className="network-node node-user"><span>01</span><b>Person</b><small>intent</small></div><div className="network-node node-agent"><span>02</span><b>Agent</b><small>reason + plan</small></div><div className="network-node node-tools"><span>03</span><b>Tools</b><small>systems + APIs</small></div><div className="network-node node-data"><span>04</span><b>Context</b><small>trusted data</small></div><div className="network-node node-action"><span>05</span><b>Action</b><small>reviewed outcome</small></div><div className="network-caption"><span><i /> ORCHESTRATION ACTIVE</span><span>HUMAN-IN-THE-LOOP BY DESIGN</span></div></div>
        </div>
        <div className="intelligence-foot"><span>PRIVATE BY DEFAULT</span><span>OBSERVABLE BY DESIGN</span><span>ACCOUNTABLE IN PRACTICE</span></div>
      </section>

      <section className="work section-frame" id="work" aria-labelledby="work-title">
        <div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">04</span> / SELECTED COLLABORATIONS</p><p className="section-aside">REAL CHALLENGES.<br />BETTER SYSTEMS.</p></div>
        <div className="work-heading" data-reveal><h2 className="section-title" id="work-title">Made for the<br /><span>work that matters.</span></h2><p>Three snapshots of a bigger idea:<br />technology should move people forward.</p></div>
        <article className="project project-school" data-image-reveal><div className="project-visual visual-school"><ProjectArt kind="school" /><span className="visual-index">FIG. 01 — LEARNING, RECONNECTED</span></div><div className="project-info"><p className="project-overline"><span>01</span> / EDUCATION TECHNOLOGY</p><h3>A better way<br />to <em>learn together.</em></h3><p>A school platform that puts the day in view — and gives every student, teacher, and family a little more clarity.</p><div className="project-stack"><span>PRODUCT DESIGN</span><span>AI</span><span>NEXT.JS</span><span>PLATFORM</span></div><a href="#contact" className="project-link" data-cursor="START A PROJECT">EXPLORE A SIMILAR CHALLENGE <Arrow /></a></div></article>
        <article className="project project-ledger" data-image-reveal><div className="project-visual visual-ledger"><ProjectArt kind="ledger" /><span className="visual-index">FIG. 02 — BUSINESS, IN BETTER BALANCE</span></div><div className="project-info"><p className="project-overline"><span>02</span> / ENTERPRISE SYSTEMS</p><h3>Complexity,<br />in <em>better balance.</em></h3><p>One connected operational picture, designed around the people making decisions — not the shape of the database.</p><div className="project-stack"><span>ERP</span><span>CLOUD</span><span>API DESIGN</span><span>DATA</span></div><a href="#contact" className="project-link" data-cursor="START A PROJECT">EXPLORE A SIMILAR CHALLENGE <Arrow /></a></div></article>
        <article className="project project-flow" data-image-reveal><div className="project-visual visual-flow"><ProjectArt kind="flow" /><span className="visual-index">FIG. 03 — BUSYWORK, REIMAGINED</span></div><div className="project-info"><p className="project-overline"><span>03</span> / INTELLIGENT AUTOMATION</p><h3>Give good work<br />a <em>clearer path.</em></h3><p>A reliable agent workflow that takes the repetitive steps off the team's hands — and leaves the important calls to people.</p><div className="project-stack"><span>AGENTIC AI</span><span>WORKFLOWS</span><span>INTEGRATION</span><span>GOVERNANCE</span></div><a href="#contact" className="project-link" data-cursor="START A PROJECT">EXPLORE A SIMILAR CHALLENGE <Arrow /></a></div></article>
        <div className="work-endnote"><span>GOOD WORK IS NEVER ONE-SIZE-FITS-ALL.</span><a href="#contact">Tell us what you’re working on <Arrow /></a></div>
      </section>

      <section className="approach section-frame" aria-labelledby="approach-title"><div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">05</span> / HOW WE WORK</p><p className="section-aside">CLEAR AT EVERY STEP.<br />CAPABLE AT EVERY SCALE.</p></div><div className="approach-layout"><h2 className="editorial-heading" id="approach-title" data-reveal>Good technology<br />feels <span>inevitable.</span></h2><div className="approach-steps" data-reveal><div><span>01 / LISTEN</span><p>Get close to the real problem. Understand the people, the constraints, and what a better day looks like.</p></div><div><span>02 / SHAPE</span><p>Find the smallest useful first step — with a system design that doesn't paint the next one into a corner.</p></div><div><span>03 / MAKE</span><p>Work in the open, test with real users, and ship in purposeful increments. No black boxes, including ours.</p></div><div><span>04 / GROW</span><p>Measure what changed, learn what didn't, and stay in it long enough to make the difference last.</p></div></div></div></section>

      <section className="contact section-frame" id="contact" aria-labelledby="contact-title"><div className="contact-orbit" aria-hidden="true"><i /><i /><i /></div><div className="section-head" data-reveal><p className="eyebrow"><span className="section-number">06</span> / THE NEXT GOOD THING</p><p className="section-aside">GOOD WORK STARTS<br />WITH A CONVERSATION.</p></div><div className="contact-layout" data-reveal><div><p className="eyebrow red-eyebrow"><span className="signal-dot" /> TELL US WHAT YOU’RE THINKING</p><h2 id="contact-title">What could<br />we <em>move</em><br />forward?</h2></div><div className="contact-action"><p>Big plan, tricky problem, half-formed idea. We’re happy to start wherever you are.</p><a className="button-primary button-large magnetic" href="mailto:hello@thoughtlab.studio" data-cursor="SAY HELLO">Start a conversation <Arrow /></a><a className="contact-email" href="mailto:hello@thoughtlab.studio">hello@thoughtlab.studio</a></div></div><div className="contact-meta"><span>INDEPENDENT BY DESIGN. THOUGHTFUL BY NATURE.</span><span>BUILT TO MOVE BUSINESS FORWARD.</span></div></section>

      <footer className="site-footer section-frame"><a className="wordmark" href="#top"><span className="brand-glyph"><i /><i /><i /></span><span>thoughtlab<sup>®</sup></span></a><span>© {new Date().getFullYear()} THOUGHTLAB STUDIO</span><div><a href="mailto:hello@thoughtlab.studio">EMAIL ↗</a><a href="#top">BACK TO TOP ↑</a></div></footer>
    </main>
  );
}
