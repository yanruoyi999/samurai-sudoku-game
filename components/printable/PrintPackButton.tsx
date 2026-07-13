"use client";

import { trackInteraction } from "@/lib/analytics/events";

interface PrintPackButtonProps {
  locale: string;
  packId: string;
  puzzleCount: number;
}

export function PrintPackButton({ locale, packId, puzzleCount }: PrintPackButtonProps) {
  const handlePrint = () => {
    trackInteraction("download_free_pdf", {
      locale,
      pack_id: packId,
      puzzle_count: puzzleCount,
      location: "pdf_sample_pack_page",
    });
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {locale === "zh" ? "打印或保存为 PDF" : "Print or save as PDF"}
    </button>
  );
}
