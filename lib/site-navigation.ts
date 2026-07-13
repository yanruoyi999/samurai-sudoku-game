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
      href: `${localeRoot}/printable-samurai-sudoku`,
      label: isZh
        ? "20 道免费打印题 · 含答案 · A4 / US Letter · 无需注册"
        : "20 free printable puzzles · Solutions included · A4 / US Letter · No sign-up",
    },
    items: [
      {
        id: "today",
        href: `${localeRoot}/games/samurai`,
        label: isZh ? "今日题目" : "Today",
      },
      {
        id: "printable",
        href: `${localeRoot}/printable-samurai-sudoku`,
        label: isZh ? "免费打印" : "Free Printables",
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
        href: `${localeRoot}/games/samurai/pdf`,
        label: isZh
          ? `PDF 题包 · ${paidPackPrice}`
          : `PDF Pack · ${paidPackPrice}`,
      },
    ],
  };
}
