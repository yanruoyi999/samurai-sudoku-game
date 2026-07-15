"use client";

import Script from "next/script";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackInteraction } from "@/lib/analytics/events";
import {
  parsePayPalCaptureResponse,
  parsePayPalCreateResponse,
  type PayPalCreateResponse,
} from "@/lib/paypal-checkout";

const STORAGE_KEY = "samurai-pdf-pack-paypal-order";

interface PayPalCheckoutProps {
  autoDeliveryEnabled: boolean;
  clientId: string;
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
  onCancel: () => void;
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
  const [downloadUrl, setDownloadUrl] = useState("");

  const captureOrder = useCallback(
    async (order: PayPalCreateResponse, recovery = false) => {
      setStatus("capturing");
      setError("");
      const response = await fetch("/api/paypal/orders/capture", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const body = await readJson(response);
      if (!response.ok) {
        throw new Error(getApiError(body, isZh ? "付款尚未完成，请返回 PayPal 完成批准。" : "Payment is not complete yet. Return to PayPal and approve it first."));
      }

      const captured = parsePayPalCaptureResponse(body);
      setDownloadUrl(captured.downloadUrl);
      setStatus("complete");
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...order, completed: true, downloadUrl: captured.downloadUrl }),
      );
      trackInteraction(recovery ? "paid_pack_download_recovered" : "paid_pack_purchase", {
        locale,
        order_id: captured.orderID,
        product: "100_printable_pack",
        provider: "paypal",
        price,
        experiment_id: experimentId,
      });
    },
    [experimentId, isZh, locale, price],
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
    if (
      !activated ||
      !autoDeliveryEnabled ||
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
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
        setStatus("idle");
        trackInteraction("paid_pack_checkout_created", {
          locale,
          product: "100_printable_pack",
          provider: "paypal",
          price,
          experiment_id: experimentId,
        });
        return order.orderID;
      },
      onApprove: async ({ orderID }) => {
        const order = activeOrderRef.current ?? readSavedOrder();
        if (!order || order.orderID !== orderID) {
          throw new Error(isZh ? "订单恢复信息缺失，请刷新后重试。" : "Order recovery details are missing. Refresh and try again.");
        }
        await captureOrder(order);
      },
      onCancel: () => {
        setStatus("idle");
        trackInteraction("paid_pack_checkout_cancel", {
          locale,
          provider: "paypal",
          experiment_id: experimentId,
        });
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
  }, [activated, autoDeliveryEnabled, captureOrder, experimentId, isZh, locale, price, scriptReady]);

  if (!autoDeliveryEnabled) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm" role="status">
        <p className="font-medium">
          {isZh ? "结账暂时不可用" : "Checkout temporarily unavailable"}
        </p>
        <p className="mt-1 text-muted-foreground">
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
        {isZh ? `以 ${price} 购买 100 题` : `Buy 100 puzzles for ${price}`}
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
      <div ref={containerRef} aria-label={isZh ? "PayPal 安全结账" : "Secure PayPal checkout"} />
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
        <a
          href={downloadUrl}
          className="mt-3 inline-flex w-full justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={() => trackInteraction("paid_pack_download", {
            locale,
            provider: "paypal",
            experiment_id: experimentId,
          })}
        >
          {isZh ? "下载 100 题 PDF 包" : "Download the 100-puzzle PDF pack"}
        </a>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm" role="alert">
          <p>{error}</p>
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
