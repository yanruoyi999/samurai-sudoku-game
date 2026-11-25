"use client";

import Script from "next/script";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { downloadPackFile, trackPackOutcome, type PayPalEnvironment } from "@/lib/pack-download";
import { trackInteraction } from "@/lib/analytics/events";
import { PAID_PACK_ACTIVATION_EVENT } from "@/lib/printable-offer-events";
import {
  parsePayPalCaptureResponse,
  parsePayPalCreateResponse,
  type PayPalCreateResponse,
} from "@/lib/paypal-checkout";

const STORAGE_KEY = "samurai-pdf-pack-paypal-order";

interface PayPalCheckoutProps {
  autoDeliveryEnabled: boolean;
  clientId: string;
  environment: PayPalEnvironment;
  deferUntilActivated?: boolean;
  experimentId?: string;
  locale: string;
  price: string;
  supportHref: string;
}

interface PayPalButtonsInstance {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => void;
}

interface PayPalButtonsOptions {
  style?: Record<string, string | number>;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel: (data: { orderID?: string }) => void;
  onError: (error: unknown) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
    };
  }
}

export function PayPalCheckout({
  autoDeliveryEnabled,
  clientId,
  deferUntilActivated = false,
  environment,
  experimentId,
  locale,
  price,
  supportHref,
}: PayPalCheckoutProps) {
  const isZh = locale === "zh";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<PayPalButtonsInstance | null>(null);
  const activeOrderRef = useRef<PayPalCreateResponse | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [activated, setActivated] = useState(!deferUntilActivated);
  const [status, setStatus] = useState<"idle" | "creating" | "capturing" | "complete">("idle");
  const [error, setError] = useState("");
  const [approvedOrder, setApprovedOrder] = useState<{ order: PayPalCreateResponse; amount: string } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showDirectDownload, setShowDirectDownload] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const captureOrder = useCallback(
    async (order: PayPalCreateResponse, recoverOnly = false) => {
      setStatus("capturing");
      setError("");
      const response = await fetch("/api/paypal/orders/capture", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, recoverOnly }),
      });
      const body = await readJson(response);
      if (recoverOnly && response.status === 409 && body && typeof body === "object" && "approvedAmount" in body &&
          typeof body.approvedAmount === "string" && /^\d+\.\d{2}$/.test(body.approvedAmount)) {
        setApprovedOrder({ order, amount: body.approvedAmount });
        setStatus("idle");
        return;
      }
      if (!response.ok) {
        throw new Error(getApiError(body, isZh ? "付款尚未完成，请返回 PayPal 完成批准。" : "Payment is not complete yet. Return to PayPal and approve it first."));
      }

      const captured = parsePayPalCaptureResponse(body);
      setApprovedOrder(null);
      setDownloadUrl(captured.downloadUrl);
      setStatus("complete");
      trackPackOutcome(captured.newCapture ? "paid_pack_purchase" : "paid_pack_download_recovered", {
        locale,
        product: "100_printable_pack",
        provider: "paypal",
        ...(captured.newCapture && captured.amount && captured.currency
          ? { price: `$${captured.amount}`, value: Number(captured.amount), currency: captured.currency }
          : {}),
        experiment_id: experimentId,
      }, environment);
    },
    [environment, experimentId, isZh, locale],
  );

  useEffect(() => {
    if (!autoDeliveryEnabled) return;

    const saved = readSavedOrder();
    if (!saved) return;
    activeOrderRef.current = saved;
    setActivated(true);

    void captureOrder(saved, true).catch(() => {
      setStatus("idle");
    });
  }, [autoDeliveryEnabled, captureOrder]);

  useEffect(() => {
    if (!autoDeliveryEnabled) return;

    const handleOfferActivation = () => {
      setActivated(true);
    };

    window.addEventListener(PAID_PACK_ACTIVATION_EVENT, handleOfferActivation);
    return () => {
      window.removeEventListener(PAID_PACK_ACTIVATION_EVENT, handleOfferActivation);
    };
  }, [autoDeliveryEnabled]);

  useEffect(() => {
    if (
      !activated ||
      !autoDeliveryEnabled ||
      approvedOrder ||
      !scriptReady ||
      !containerRef.current ||
      !window.paypal
    ) {
      return;
    }

    const buttons = window.paypal.Buttons({
      style: { color: "gold", height: 44, label: "paypal", layout: "vertical", shape: "rect" },
      createOrder: async () => {
        setStatus("creating");
        setError("");
        const response = await fetch("/api/paypal/orders", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        const body = await readJson(response);
        if (!response.ok) {
          throw new Error(getApiError(body, isZh ? "无法创建 PayPal 订单。" : "Unable to create the PayPal order."));
        }

        const order = parsePayPalCreateResponse(body);
        activeOrderRef.current = order;
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
        } catch {
          // This tab still has the recovery details if storage is unavailable.
        }
        setStatus("idle");
        trackPackOutcome("paid_pack_checkout_created", {
          locale,
          product: "100_printable_pack",
          provider: "paypal",
          price,
          experiment_id: experimentId,
        }, environment);
        return order.orderID;
      },
      onApprove: async ({ orderID }) => {
        const order = activeOrderRef.current ?? readSavedOrder();
        if (!order || order.orderID !== orderID) {
          throw new Error(isZh ? "订单恢复信息缺失，请刷新后重试。" : "Order recovery details are missing. Refresh and try again.");
        }
        await captureOrder(order);
      },
      onCancel: ({ orderID } = {}) => {
        const cancelledId = orderID ?? activeOrderRef.current?.orderID;
        if (cancelledId && activeOrderRef.current?.orderID === cancelledId) {
          activeOrderRef.current = null;
        }
        if (cancelledId && readSavedOrder()?.orderID === cancelledId) {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            // The active tab no longer attempts recovery for the cancelled order.
          }
        }
        setStatus("idle");
        trackPackOutcome("paid_pack_checkout_cancel", {
          locale,
          provider: "paypal",
          experiment_id: experimentId,
        }, environment);
      },
      onError: (checkoutError) => {
        console.error("PayPal checkout failed.", checkoutError);
        setStatus("idle");
        setError(isZh ? "PayPal 结账暂时不可用，请稍后重试或联系客服。" : "PayPal Checkout is temporarily unavailable. Try again later or contact support.");
        trackInteraction("paid_pack_checkout_error", {
          locale,
          provider: "paypal",
          experiment_id: experimentId,
        });
      },
    });
    buttonsRef.current = buttons;
    void buttons.render(containerRef.current).catch((renderError) => {
      console.error("PayPal buttons failed to render.", renderError);
      setStatus("idle");
      setError(
        isZh
          ? "PayPal 按钮加载失败，请稍后重试或联系客服。"
          : "PayPal buttons failed to load. Try again later or contact support.",
      );
      trackInteraction("paid_pack_checkout_error", {
        locale,
        provider: "paypal",
        experiment_id: experimentId,
      });
    });

    return () => {
      buttons.close?.();
      buttonsRef.current = null;
    };
  }, [activated, approvedOrder, autoDeliveryEnabled, captureOrder, environment, experimentId, isZh, locale, price, scriptReady]);

  if (!autoDeliveryEnabled) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm" role="status">
        <p className="font-medium">
          {isZh ? "结账暂时不可用" : "Checkout temporarily unavailable"}
        </p>
        <p className="mt-1 text-foreground/80">
          {isZh
            ? "当前未开放付款入口，不会跳转到个人收款页面。"
            : "Payments are currently paused and will not redirect to a personal payment page."}
        </p>
        <TrackedLink
          href={supportHref}
          eventName="paid_pack_checkout_support_click"
          eventProperties={{ locale, product: "100_printable_pack", provider: "paypal", price, experiment_id: experimentId }}
          className="mt-2 inline-flex font-semibold text-primary hover:underline"
        >
          {isZh ? "联系客户支持" : "Contact support"}
        </TrackedLink>
      </div>
    );
  }

  if (!activated) {
    return (
      <button
        type="button"
        className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90 sm:max-w-[320px]"
        onClick={() => {
          setActivated(true);
          trackInteraction("paid_pack_view", {
            locale,
            location: "canonical_printable_hub",
            product: "100_printable_pack",
            price,
            provider: "paypal",
            experiment_id: experimentId,
          });
        }}
      >
        {isZh ? `以 ${price} 解锁 30 天挑战` : `Unlock 30 days for ${price}`}
      </button>
    );
  }

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;

  return (
    <div className="w-full min-w-0 sm:max-w-[320px]">
      <Script
        id="paypal-checkout-sdk"
        src={sdkUrl}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setError(isZh ? "PayPal 按钮加载失败，请稍后重试或联系客服。" : "PayPal buttons failed to load. Try again later or contact support.")}
      />
      {approvedOrder && (
        <button
          type="button"
          disabled={status === "capturing"}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
          onClick={() => void captureOrder(approvedOrder.order).catch(() => {
            setStatus("idle");
            setError(isZh ? "无法完成这笔订单，请重试或联系客服。" : "Could not complete this order. Retry or contact support.");
          })}
        >
          {isZh ? `确认支付已批准订单的 $${approvedOrder.amount} 并下载` : `Pay $${approvedOrder.amount} to finish your approved order`}
        </button>
      )}
      <div hidden={Boolean(approvedOrder) || status === "capturing" || Boolean(downloadUrl)} ref={containerRef} aria-label={isZh ? "PayPal 安全结账" : "Secure PayPal checkout"} />
      {!scriptReady && (
        <p className="text-sm text-muted-foreground" role="status">
          {isZh ? "正在加载安全结账..." : "Loading secure checkout..."}
        </p>
      )}
      {(status === "creating" || status === "capturing") && (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {status === "creating"
            ? isZh ? "正在创建安全订单..." : "Creating a secure order..."
            : isZh ? "正在核验付款并准备下载..." : "Verifying payment and preparing your download..."}
        </p>
      )}
      {downloadUrl && (
        <button
          type="button"
          disabled={downloading}
          className="mt-3 inline-flex w-full justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={async () => {
            setDownloading(true);
            setShowDirectDownload(false);
            setError("");
            try {
              await downloadPackFile(downloadUrl, "application/zip", "samurai-sudoku-100-puzzle-pack.zip");
              trackPackOutcome("paid_pack_download", { locale, provider: "paypal", experiment_id: experimentId }, environment);
            } catch {
              setShowDirectDownload(true);
              setError(isZh ? "下载未完成，请重试或使用直接下载。" : "The download did not finish. Retry or use the direct download.");
            } finally {
              setDownloading(false);
            }
          }}
        >
          {isZh ? "下载 100 题 PDF 包" : "Download the 100-puzzle PDF pack"}
        </button>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm" role="alert">
          <p>{error}</p>
          {showDirectDownload && downloadUrl && (
            <button type="button" className="mt-2 block underline" onClick={() => window.location.assign(downloadUrl)}>
              {isZh ? "直接下载 ZIP" : "Download ZIP directly"}
            </button>
          )}
          <TrackedLink
            href={supportHref}
            eventName="paid_pack_checkout_support_click"
            eventProperties={{ locale, product: "100_printable_pack", provider: "paypal", price, experiment_id: experimentId }}
            className="mt-2 inline-flex font-semibold text-primary hover:underline"
          >
            {isZh ? "联系客户支持" : "Contact support"}
          </TrackedLink>
        </div>
      )}
    </div>
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiError(value: unknown, fallback: string): string {
  if (!value || typeof value !== "object") return fallback;
  const error = (value as { error?: unknown }).error;
  return typeof error === "string" && error.length > 0 ? error : fallback;
}

function readSavedOrder(): PayPalCreateResponse | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parsePayPalCreateResponse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
