# Samurai Sudoku Analytics And SEO Review

Use this checklist after every production analytics or SEO change.

## Data Rules

- Do not infer traffic, conversions, or errors from code presence alone.
- Treat GSC as search-result truth. Direct browser, curl, and Codex visits do not affect GSC.
- Treat GA4, Clarity, Vercel Analytics, and Typeform as site-interaction data that can include internal testing unless opt-out is enabled.
- Use `?analytics=off` before manual smoke tests from this machine. Use `?analytics=on` only when testing the analytics pipeline itself.
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
- Confirm `?analytics=off` prevents GA pageview/event queueing and prevents Clarity loading.
- Record findings in `ops/daily-growth/reviews/YYYY-MM-DD.md`, `source-ledger/YYYY-MM-DD.md`, and the relevant metrics CSV only when the data was actually read.

## Follow-Up Windows

- Same day: deployment status, redirects, HTML metadata, sitemap, robots, and visible console/runtime errors.
- 24-48 hours: GA4 page_view recovery, event volume, and realtime sanity.
- 7-14 days: GSC query movement, `/daily` disappearance from Clarity top pages, Typeform starts versus submissions, and mobile interaction issues.
