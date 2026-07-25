import Link from 'next/link';

interface SiteFooterProps {
  aboutLabel: string;
  contactLabel: string;
  footerText: string;
  locale: string;
  privacyLabel: string;
}

export function SiteFooter({
  aboutLabel,
  contactLabel,
  footerText,
  locale,
  privacyLabel,
}: SiteFooterProps) {
  const isZh = locale === 'zh';

  return (
    <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
      <p>{footerText}</p>
      <nav
        aria-label={isZh ? '网站信息' : 'Site information'}
        className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2"
      >
        <Link href={`/${locale}/about`} className="text-primary hover:text-primary/80">
          {aboutLabel}
        </Link>
        <Link href={`/${locale}/about/puzzle-methodology`} className="text-primary hover:text-primary/80">
          {isZh ? '题目生成与审核方法' : 'Puzzle methodology'}
        </Link>
        <Link href={`/${locale}/contact`} className="text-primary hover:text-primary/80">
          {contactLabel}
        </Link>
        <Link href={`/${locale}/privacy`} className="text-primary hover:text-primary/80">
          {privacyLabel}
        </Link>
        <Link href={`/${locale}/terms`} className="text-primary hover:text-primary/80">
          {isZh ? '使用与购买条款' : 'Terms'}
        </Link>
        <Link href={`/${locale}/support`} className="text-primary hover:text-primary/80">
          {isZh ? '支持与订阅' : 'Support / Subscribe'}
        </Link>
        <Link href={`/${locale}/sudoku-for-kids`} className="text-primary hover:text-primary/80">
          {isZh ? '儿童 4×4 数独' : 'Kids Sudoku'}
        </Link>
        <Link href={`/${locale}/games/samurai/what-is-samurai-sudoku`} className="text-primary hover:text-primary/80">
          {isZh ? '武士数独介绍' : 'What is Samurai Sudoku?'}
        </Link>
        <Link href={`/${locale}/games/samurai/solving-tips`} className="text-primary hover:text-primary/80">
          {isZh ? '通关技巧' : 'Solving tips'}
        </Link>
        <Link href={`/${locale}/games/samurai/strategy-guide`} className="text-primary hover:text-primary/80">
          {isZh ? '高级技巧' : 'Advanced techniques'}
        </Link>
        <Link href={`/${locale}/games/samurai/common-mistakes`} className="text-primary hover:text-primary/80">
          {isZh ? '常见错误' : 'Common mistakes'}
        </Link>
        <Link href={`/${locale}/games/samurai/solver`} className="text-primary hover:text-primary/80">
          {isZh ? '提示与求解' : 'Solver hints'}
        </Link>
        <Link href={`/${locale}/printable-samurai-sudoku#free-3-puzzle-pack`} className="text-primary hover:text-primary/80">
          {isZh ? '免费 3 题打印样包' : 'Free 3-puzzle print sampler'}
        </Link>
        <Link href={`/${locale}/games/samurai/printable-practice-plan`} className="text-primary hover:text-primary/80">
          {isZh ? '打印练习计划' : 'Printable practice plan'}
        </Link>
        <Link href={`/${locale}/printable-samurai-sudoku#paid-100-puzzle-pack`} className="text-primary hover:text-primary/80">
          {isZh ? 'PDF 打印包' : 'PDF pack'}
        </Link>
        <Link href={`/${locale}/games/minesweeper`} className="text-primary hover:text-primary/80">
          {isZh ? '在线扫雷' : 'Minesweeper'}
        </Link>
      </nav>
    </footer>
  );
}
