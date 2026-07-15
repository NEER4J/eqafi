"use client";

import { useState } from "react";

export default function SubscribeButton({
  planId,
  className,
  children,
}: {
  planId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chargebee/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={startCheckout}
        disabled={loading}
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error && <p className="checkout-error">{error}</p>}
    </>
  );
}
