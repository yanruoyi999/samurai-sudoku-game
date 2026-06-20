import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { ThemeProvider } from "@/components/theme-provider";
import { InstallPrompt } from "@/components/InstallPrompt";
import { TypeformFeedbackButton } from "@/components/feedback/TypeformFeedbackButton";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(',').map(k => k.trim()),
    authors: [{ name: "Samurai Sudoku" }],
    openGraph: {
      title: t('og.title'),
      description: t('og.description'),
      type: "website",
      url: buildAbsoluteUrl(`/${locale}`),
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Samurai Sudoku online puzzle board',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og.title'),
      description: t('og.description'),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="font-sans">
          {children}
          <InstallPrompt />
          <TypeformFeedbackButton locale={locale} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
