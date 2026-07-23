"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

import { trackInteraction } from "@/lib/analytics/events";
import {
  FREE_PACK_DOWNLOADED_EVENT,
  PAID_PACK_ACTIVATION_EVENT,
  type FreePackDownloadedDetail,
} from "@/lib/printable-offer-events";

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

interface PrintableFreeDownloadLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  children: ReactNode;
  eventProperties: AnalyticsProperties;
  href: string;
}

interface PrintablePackOfferProps {
  checkoutAvailable: boolean;
  experimentId: string;
  freePdfHref: string;
  locale: string;
  price: string;
}

export function PrintableFreeDownloadLink({
  children,
  eventProperties,
  href,
  ...anchorProps
}: PrintableFreeDownloadLinkProps) {
  const handleClick = () => {
    trackInteraction("download_free_pdf", eventProperties);
    window.dispatchEvent(
      new CustomEvent<FreePackDownloadedDetail>(FREE_PACK_DOWNLOADED_EVENT, {
        detail: {
          location:
            typeof eventProperties.location === "string"
              ? eventProperties.location
              : "canonical_printable_hub",
        },
      }),
    );
  };

  return (
    <a {...anchorProps} href={href} download onClick={handleClick}>
      {children}
    </a>
  );
}

export function PrintablePackOffer({
  checkoutAvailable,
  experimentId,
  freePdfHref,
  locale,
  price,
}: PrintablePackOfferProps) {
  const isZh = locale === "zh";
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const pdfArrivalTrackedRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const parsedPrice = Number(price.replace(/[^\d.]/g, ""));
  const dailyPrice = Number.isFinite(parsedPrice) ? (parsedPrice / 30).toFixed(2) : "0.33";

  useEffect(() => {
    if (pdfArrivalTrackedRef.current) return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("utm_source") !== "free_pdf") return;

    pdfArrivalTrackedRef.current = true;
    trackInteraction("pdf_expert_preview_arrival", {
      locale,
      location: "expert_preview_pdf",
      product: "100_printable_pack",
      price,
      experiment_id: experimentId,
      campaign: query.get("utm_campaign") ?? "expert_preview",
      content: query.get("utm_content") ?? "puzzle_3_lock",
    });
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event(PAID_PACK_ACTIVATION_EVENT));
    });
  }, [experimentId, locale, price]);

  useEffect(() => {
    const handleFreePackDownload = (event: Event) => {
      const detail = (event as CustomEvent<FreePackDownloadedDetail>).detail;
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShowUpgradePrompt(true);
      trackInteraction("free_pack_upgrade_prompt_view", {
        locale,
        location: detail?.location ?? "canonical_printable_hub",
        product: "100_printable_pack",
        price,
        experiment_id: experimentId,
      });
    };

    window.addEventListener(FREE_PACK_DOWNLOADED_EVENT, handleFreePackDownload);
    return () => {
      window.removeEventListener(FREE_PACK_DOWNLOADED_EVENT, handleFreePackDownload);
    };
  }, [experimentId, locale, price]);

  useEffect(() => {
    if (!showUpgradePrompt) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUpgradePrompt(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [showUpgradePrompt]);

  const activatePaidOffer = (location: string) => {
    trackInteraction("paid_pack_view", {
      locale,
      location,
      product: "100_printable_pack",
      provider: "paypal",
      price,
      experiment_id: experimentId,
    });
    window.dispatchEvent(new Event(PAID_PACK_ACTIVATION_EVENT));
    window.requestAnimationFrame(() => {
      document
        .getElementById("paid-100-puzzle-pack")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <section id="pack-options" className="scroll-mt-28 border-b bg-secondary/20 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase text-primary">
            {isZh ? "先体验，再决定是否升级" : "Try it free, then choose your depth"}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {isZh ? "选择适合你的可打印题包" : "Choose your printable Samurai Sudoku pack"}
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
            {isZh
              ? "免费包用 3 道精选题建立信心、进入状态，再给 Expert 预览一道真实第一步提示并锁住后续。完整库解锁讲解与答案，再扩展成一个月的每日数独冥想。"
              : "The sampler builds confidence, finds a rhythm, then gives the Expert preview one real first-step hint before locking the rest. The complete library unlocks the walkthrough and answer, then extends that quality into a month of daily puzzle meditation."}
          </p>

          <div className="mt-6 overflow-hidden rounded-lg border bg-background">
            <div className="grid md:grid-cols-2">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {isZh ? "免费体验包" : "Free starter pack"}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">
                      {isZh ? "3 题精选" : "3 curated puzzles"}
                    </h3>
                  </div>
                  <p className="text-2xl font-semibold">$0</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  {isZh
                    ? "1 题 Easy 建立信心，1 题 Medium 进入状态，最后用 1 道 Expert 预览检验你的极限。"
                    : "Build confidence with 1 Easy puzzle, find your rhythm with 1 Medium, then test your limit with an Expert preview."}
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  <li><strong>3</strong> {isZh ? "道经过难度评分的精选题" : "hand-picked, difficulty-scored puzzles"}</li>
                  <li>{isZh ? "前 2 题附答案，第 3 题答案在完整库中" : "Answers for the first 2; puzzle 3 unlocks in the full library"}</li>
                  <li>{isZh ? "A4 与 US Letter 版本" : "A4 and US Letter editions"}</li>
                  <li>{isZh ? "无需注册或邮箱" : "No signup or email required"}</li>
                </ul>
              </div>

              <div className="border-t border-primary/30 bg-primary/5 p-5 sm:p-6 md:border-l md:border-t-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {isZh ? "完整训练库" : "Complete training library"}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">
                      {isZh ? "100 题" : "100 puzzles"}
                    </h3>
                  </div>
                  <p className="text-2xl font-semibold">{price}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  {isZh
                    ? "先解锁免费包 Expert 预览题的 12 步开局讲解与完整答案，再用一个月的每日数独冥想继续训练。"
                    : "First unlock the Expert preview's verified 12-step opening and full answer, then continue with a month of daily Sudoku meditation."}
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  <li>{isZh ? "免费包第 3 题：12 步真实开局讲解 + 完整答案" : "Free-pack puzzle 3: verified 12-step opening + full answer"}</li>
                  <li><strong>30</strong> {isZh ? "天每日挑战：Easy 到 Expert 循序推进" : "daily challenges progressing from Easy to Expert"}</li>
                  <li><strong>100</strong> {isZh ? "道精选题，包含第 3 题答案" : "curated puzzles, including the answer to puzzle 3"}</li>
                  <li>{isZh ? "独立答案区，完成后集中核对" : "Separate answer sections for focused checking"}</li>
                  <li>{isZh ? "A4 与 US Letter 版本" : "A4 and US Letter editions"}</li>
                  <li>{isZh ? "随身打印版：一页 2 题，节省纸张，通勤和旅行随时玩" : "Portable print edition: 2 puzzles per page for commutes and travel"}</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3 border-t p-4 sm:grid-cols-2 sm:p-5">
              <PrintableFreeDownloadLink
                href={freePdfHref}
                eventProperties={{
                  locale,
                  pack_id: "curated_sampler_3",
                  paper: "a4",
                  location: "pack_comparison",
                  experiment_id: experimentId,
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary px-4 py-3 text-center font-semibold text-primary hover:bg-primary/10"
              >
                {isZh ? "下载免费包（含 Expert 预览）" : "Download Free Pack (Expert Preview Included)"}
              </PrintableFreeDownloadLink>
              <a
                href="#paid-100-puzzle-pack"
                onClick={() => activatePaidOffer("pack_comparison")}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {checkoutAvailable
                  ? isZh
                    ? `购买完整库（${price}）`
                    : `Buy the complete library (${price})`
                  : isZh
                    ? `查看完整库（${price}）`
                    : `View the complete library (${price})`}
              </a>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {isZh
              ? `免费品尝 3 题精选 → 解锁 100 题完整训练库。平均每天 $${dailyPrice}，一次购买，不自动续费。`
              : `Taste 3 curated puzzles free, then unlock the complete 100-puzzle training library for $${dailyPrice} a day over 30 days. One-time purchase, no renewal.`}
          </p>
        </div>
      </section>

      {showUpgradePrompt ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/55 p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowUpgradePrompt(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="free-pack-upgrade-title"
            tabIndex={-1}
            className="w-full max-w-lg rounded-lg border bg-background p-5 shadow-2xl outline-none sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {isZh ? "下载已开始" : "Your download has started"}
                </p>
                <h2 id="free-pack-upgrade-title" className="mt-2 text-2xl font-semibold">
                  {isZh ? "想把这次体验变成 30 天训练吗？" : "Want to turn this session into 30 days of practice?"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradePrompt(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-lg font-semibold hover:bg-accent"
                aria-label={isZh ? "关闭" : "Close"}
              >
                X
              </button>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {isZh
                ? `3 题精选试玩包已经开始下载。第 3 题的 12 步开局讲解、完整答案和另外 97 道精选题都在完整库中。${price} 获得 30 天每日挑战，平均每天 $${dailyPrice}。`
                : `Your 3-puzzle sampler is downloading. Puzzle 3's verified 12-step opening, full answer, and 97 more curated puzzles are in the complete library. Get 30 daily challenges for ${price}, just $${dailyPrice} a day.`}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <a
                href="#paid-100-puzzle-pack"
                onClick={() => {
                  setShowUpgradePrompt(false);
                  activatePaidOffer("free_download_upgrade_prompt");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isZh ? "查看完整库详情" : "View the complete library"}
              </a>
              <button
                type="button"
                onClick={() => setShowUpgradePrompt(false)}
                className="min-h-11 rounded-lg border px-4 py-3 font-semibold hover:bg-accent"
              >
                {isZh ? "先用免费包" : "Keep the free pack"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
