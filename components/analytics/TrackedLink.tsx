"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackInteraction } from "@/lib/analytics/events";

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

type TrackedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  eventName: string;
  eventProperties?: AnalyticsProperties;
  children: ReactNode;
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
}

export function TrackedLink({
  href,
  eventName,
  eventProperties,
  children,
  rel,
  target,
  ...anchorProps
}: TrackedLinkProps) {
  const handleClick = () => {
    trackInteraction(eventName, eventProperties);
  };

  if (isExternalHref(href)) {
    const safeTarget = target ?? (href.startsWith("http") ? "_blank" : undefined);
    const safeRel = rel ?? (safeTarget === "_blank" ? "noopener noreferrer" : undefined);

    return (
      <a
        {...anchorProps}
        href={href}
        target={safeTarget}
        rel={safeRel}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link {...anchorProps} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
