export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_SUDOKU_GA_ID ||
  process.env.NEXT_PUBLIC_SUDOKU_GA4_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
  "";

export const GA_READY_EVENT = "samurai-ga-ready";
