"use client";

import { useState } from "react";

export default function ManageSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chargebee/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to open billing portal");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form className="manage-subscription" onSubmit={openPortal}>
      <label htmlFor="portal-email">Already subscribed? Manage billing:</label>
      <div className="manage-subscription-row">
        <input
          id="portal-email"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" className="portal-button" disabled={loading}>
          {loading ? "Opening…" : "Open billing portal"}
        </button>
      </div>
      {error && <p className="checkout-error">{error}</p>}
    </form>
  );
}
