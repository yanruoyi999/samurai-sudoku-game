import Link from "next/link";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { getPdfPackPrice } from "@/lib/paypal";
import { buildSiteNavigation } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  locale: string;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const navigation = buildSiteNavigation(locale, getPdfPackPrice());

  return (
    <header
      data-site-header
      className="sticky top-0 z-40 h-[5.5rem] border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90 print:hidden"
    >
      <TrackedLink
        href={navigation.offer.href}
        eventName="global_printable_offer_click"
        eventProperties={{ locale, location: "site_header_offer" }}
        className="flex h-8 items-center justify-center gap-2 overflow-hidden bg-primary px-3 text-center text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:text-xs"
      >
        <span className="truncate">{navigation.offer.label}</span>
        <span className="shrink-0" aria-hidden>
          →
        </span>
      </TrackedLink>

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <Link
          href={navigation.homeHref}
          aria-label={navigation.homeLabel}
          className="shrink-0 font-display text-base font-semibold leading-none text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-lg"
        >
          <span className="sm:hidden">Samurai</span>
          <span className="hidden sm:inline">Samurai Sudoku</span>
        </Link>

        <div className="h-6 w-px shrink-0 bg-border" aria-hidden />

        <nav
          aria-label={navigation.navLabel}
          className="site-nav-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain"
        >
          {navigation.items.map((item) => (
            <TrackedLink
              key={item.id}
              href={item.href}
              eventName="global_nav_click"
              eventProperties={{
                item: item.id,
                locale,
                location: "site_header_primary",
              }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
                item.featured
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                item.id === "pdf-pack" &&
                  "border border-border bg-background text-foreground hover:border-primary hover:bg-primary/5",
              )}
            >
              {item.label}
            </TrackedLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
