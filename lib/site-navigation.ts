export type SiteNavigationItemId =
  | "today"
  | "printable"
  | "archive"
  | "guides"
  | "pdf-pack";

export interface SiteNavigationItem {
  id: SiteNavigationItemId;
  href: string;
  label: string;
  featured?: boolean;
}

export interface SiteNavigationModel {
  homeHref: string;
  homeLabel: string;
  navLabel: string;
  offer: {
    href: string;
    label: string;
  };
  items: SiteNavigationItem[];
}

export function buildSiteNavigation(
  locale: string,
  paidPackPrice: string,
): SiteNavigationModel {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const isZh = normalizedLocale === "zh";
  const localeRoot = `/${normalizedLocale}`;

  return {
    homeHref: localeRoot,
    homeLabel: isZh ? "武士数独首页" : "Samurai Sudoku home",
    navLabel: isZh ? "主要资源" : "Primary resources",
    offer: {
      href: `${localeRoot}/printable-samurai-sudoku#free-3-puzzle-pack`,
      label: isZh
        ? "3 道精选试玩题 · 含 Expert 预览与第一步提示 · A4 / US Letter"
        : "3 curated puzzles · Expert preview + first-step hint · A4 / US Letter",
    },
    items: [
      {
        id: "today",
        href: `${localeRoot}/games/samurai`,
        label: isZh ? "今日题目" : "Today",
      },
      {
        id: "printable",
        href: `${localeRoot}/printable-samurai-sudoku#free-3-puzzle-pack`,
        label: isZh ? "免费 3 题 PDF" : "Free 3-Puzzle PDF",
        featured: true,
      },
      {
        id: "archive",
        href: `${localeRoot}/games/samurai/archive`,
        label: isZh ? "全部题库" : "Archive",
      },
      {
        id: "guides",
        href: `${localeRoot}/games/samurai/how-to-play`,
        label: isZh ? "玩法攻略" : "How to Play",
      },
      {
        id: "pdf-pack",
        href: `${localeRoot}/printable-samurai-sudoku#paid-100-puzzle-pack`,
        label: isZh
          ? `PDF 题包 · ${paidPackPrice}`
          : `PDF Pack · ${paidPackPrice}`,
      },
    ],
  };
}
