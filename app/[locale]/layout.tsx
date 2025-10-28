import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { ThemeProvider } from "@/components/theme-provider";
import { InstallPrompt } from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

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
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og.title'),
      description: t('og.description'),
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
        <div className={inter.className}>
          {children}
          <InstallPrompt />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
