# Samurai to Luma Contextual Links Implementation Plan

**Goal:** Add two transparent, contextual links from one relevant Samurai strategy page to the approved Luma Game Hub resources without changing the Samurai home hero, global footer, or healthy GSC reporting logic.

**Architecture:** A small bilingual recommendation component owns the two approved destinations and click analytics. The Samurai advanced strategy page renders it once near the end of the article. Existing Luma target-page work remains untouched and is verified independently.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Tailwind CSS.

---

1. Add a rendering test that enforces the two exact Luma URLs, ownership disclosure, safe external-link attributes, and absence of `nofollow` or `sponsored`.
2. Add the bilingual recommendation component with a single analytics event and destination-specific parameters.
3. Render the component once on the advanced Samurai strategy page.
4. Verify Samurai tests, lint, audits, production build, and desktop/mobile layout.
5. Verify the existing Luma Google Snake and Spend Bill Gates Money work without modifying user-owned dirty files.
