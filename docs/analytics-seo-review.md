# Samurai Sudoku Analytics And SEO Review

Use this checklist after every production analytics or SEO change.

## Data Rules

- Do not infer traffic, conversions, or errors from code presence alone.
- Treat GSC as search-result truth. Direct browser, curl, and Codex visits do not affect GSC.
- Treat GA4, Clarity, Vercel Analytics, and Typeform as site-interaction data that can include internal testing unless opt-out is enabled.
- `localhost`, loopback IPs, and `*.localhost` opt out by default, and opted-out pages do not load the Clarity recorder. Use `?analytics=off` on preview or staging hosts before manual smoke tests.
- Use `?analytics=on` only for a narrow analytics-pipeline diagnostic; it explicitly overrides the local guard for that page load.
- The Google tag bootstrap owns the initial `page_view`. GA4 Enhanced Measurement owns SPA history-change page views while `pageChangesEnabled=true`; do not mount a second route listener for the same transition.
- Wait 24-48 hours after a tracking deploy before judging GA4 aggregate reports.

## Fixed Read Order

1. GSC Performance for `https://www.samuraisudoku.net/`: clicks, impressions, CTR, average position, top queries, top pages, and last update time.
2. GA4 `Samurai Sudoku` property: active users, event count, new users, page_view count, realtime users, and top page titles.
3. Clarity project `xafqjlouqo`: sessions, bot exclusion, top pages, referrers, mobile browser mix, dead/rage/quick-back signals, and JavaScript errors.
4. Typeform `Samurai Sudoku Feedback` form `d3MXx9rn`: views, starts, submissions, completion rate, and whether response details were opened.
5. Vercel: latest production deployment, aliases, runtime logs, and smoke checks for `/daily`, `/en`, `/zh`, `/sitemap.xml`, and the latest puzzle URL.

## Post-Deploy Checks

- Confirm `/daily`, `/en/daily`, and `/zh/daily` redirect to playable pages.
- Confirm `/en` title and description match the current GSC query cluster.
- Confirm production HTML contains the GA measurement ID and `samurai-ga-ready`.
- Confirm production HTML uses `send_page_view: true`, then compare complete-day `screenPageViews / sessions` and check that one SPA navigation produces one page view.
- Confirm `?analytics=off` prevents GA pageview/event queueing and prevents Clarity loading.
- Record findings in `ops/daily-growth/reviews/YYYY-MM-DD.md`, `source-ledger/YYYY-MM-DD.md`, and the relevant metrics CSV only when the data was actually read.

## Follow-Up Windows

- Same day: deployment status, redirects, HTML metadata, sitemap, robots, and visible console/runtime errors.
- 24-48 hours: GA4 page_view recovery, event volume, and realtime sanity.
- 7-14 days: GSC query movement, `/daily` disappearance from Clarity top pages, Typeform starts versus submissions, and mobile interaction issues.

## 2026-07-18 Local Remediation

- Evidence: 2026-07-17 had 4 GA4 sessions but only 1 view, and four other dates in the 28-day window had sessions with zero views. Production HTML disabled the automatic initial page view.
- Root cause: the initial view depended on a hydration-time listener even though GA4 Enhanced Measurement already had history-change page views enabled.
- Local change: the bootstrap now sends the initial view and the duplicate manual route listener is no longer mounted.
- Verification: targeted bootstrap tests, the full 35-file / 144-test suite, lint, the production build, page-quality and internal-link audits, plus 1440px and 390px browser checks passed.
- Status: local repair complete; wait for deployment and a 24-48 hour complete-day GA4 window before judging production recovery.

## 2026-07-19 Local Remediation

- Evidence: GA4 counted `print_puzzle` on the printable hub and printable detail routes, while source inspection showed that six navigation links and the real `window.print()` handler shared that event name.
- Root cause: opening a printable page and invoking the browser print dialog were represented as the same conversion step.
- Local change: printable-page navigation now uses `printable_puzzle_open_click`; only the handler that calls `window.print()` emits `print_puzzle`.
- Verification: the event-contract test, the full 36-file / 147-test suite, lint, the production build, 460-page quality audit, 872-page internal-link audit, and 1440px / 390px browser checks passed.
- Status: local repair complete and not deployed. Historical `print_puzzle` data remains mixed; evaluate only events collected after deployment.

## 2026-07-21 Local Remediation

- Evidence: the GA4 Data API reported one 2026-07-20 session attributed to `number_pad`; the 2026-07-14 through 2026-07-20 window also contained `daily` as a session source. Event-level inspection tied the polluted acquisition row to interaction events rather than an external referrer.
- Root cause: the shared analytics adapter forwarded the internal interaction property `source` to GA4 unchanged. `source` is reserved for traffic attribution, and several Sudoku interactions use it for UI context.
- Local change: Vercel Analytics still receives the existing `source` value, while the GA4 payload removes `source` and sends the same context as `interaction_source`. The adapter-level fix covers all current and future callers.
- Verification: the new adapter contract tests, the full 37-file / 149-test suite, lint, the 489-page production build, 464-page quality audit, 880-page internal-link audit, and 1440px / 390px browser checks passed with no console errors.
- Status: local repair complete and not deployed. Historical `number_pad` and `daily` acquisition rows will not be rewritten; verify only data collected 24-48 hours after deployment.
