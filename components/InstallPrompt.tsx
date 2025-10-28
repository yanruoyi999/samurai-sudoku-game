"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 检查是否已经安装
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isInstalled) {
      return;
    }

    // 检查是否已经关闭过安装提示
    const hasClosedInstallPrompt = localStorage.getItem('closedInstallPrompt');
    if (hasClosedInstallPrompt) {
      return;
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 延迟3秒显示安装提示
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 监听应用安装事件
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('closedInstallPrompt');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    } else {
      console.log('用户拒绝了安装');
    }

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
                安装武士数独应用
              </h3>
              <p className="text-sm text-white/90 mb-3">
                添加到主屏幕，随时随地畅玩，支持离线游戏！
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  ⚡ 快速启动
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  📴 离线可用
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  💾 自动保存
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  立即安装
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  以后再说
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
