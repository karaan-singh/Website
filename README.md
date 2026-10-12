# ThoughtLab Studio

Premium, responsive Next.js experience for ThoughtLab, built with the App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, Lenis, Three.js, and React Three Fiber.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Create the optimized production bundle with `npm run build`, then serve it with `npm start`.

## Structure

- `app/` — App Router layout, page, global styles, sitemap, and robots metadata
- `components/experience.tsx` — editorial sections, navigation, service interaction, and GSAP choreography
- `components/system-core.tsx` — dynamically loaded persistent 3D system object and reduced-motion fallback
- `components/smooth-scroll.tsx` — Lenis and GSAP ScrollTrigger synchronization

The project compositions and AI network are original CSS/SVG illustrations, so the initial experience does not depend on large stock images or external image requests. The 3D scene is code-split and does not block server rendering.
