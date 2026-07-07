"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  locale: string;
}

const INSTALL_PROMPT_DELAY_MS = 90_000;

export function InstallPrompt({ locale }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const pathname = usePathname();
  const isZh = locale === 'zh';
  const dailyPath = `/${locale}/games/samurai`;
  const isEligiblePath =
    pathname === `/${locale}`
    || pathname === dailyPath
    || new RegExp(`^${dailyPath}/\\d{4}-\\d{2}-\\d{2}$`).test(pathname);

  useEffect(() => {
    if (!isEligiblePath) {
      setShowInstallBanner(false);
      return;
    }

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
      || document.referrer.includes('android-app://');

    if (isInstalled) {
      return;
    }

    const hasClosedInstallPrompt = localStorage.getItem('closedInstallPrompt');
    if (hasClosedInstallPrompt) {
      return;
    }

    let showTimer: ReturnType<typeof setTimeout> | null = null;
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      showTimer = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          setShowInstallBanner(true);
        }
      }, INSTALL_PROMPT_DELAY_MS);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('closedInstallPrompt');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isEligiblePath]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleClose = () => {
    setShowInstallBanner(false);
    localStorage.setItem('closedInstallPrompt', 'true');
  };

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-2xl bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              📱
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {isZh ? '安装武士数独应用' : 'Install Samurai Sudoku'}
              </h3>
              <p className="text-sm text-white/90 mb-3">
                {isZh
                  ? '添加到主屏幕，快速启动并继续本地保存的进度。'
                  : 'Add it to your home screen for quick access and locally saved progress.'}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {isZh ? '⚡ 快速启动' : '⚡ Quick launch'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {isZh ? '📴 离线支持' : '📴 Offline support'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {isZh ? '💾 自动保存' : '💾 Auto-save'}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {isZh ? '立即安装' : 'Install'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isZh ? '以后再说' : 'Not now'}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isZh ? '关闭' : 'Close'}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
