"use client";

import { useState } from "react";

type Option = {
  id: string;
  title: string;
  notes: string | null;
  estimatedCostCents: number | null;
  votes: number;
};

type Props = {
  discussionId: string;
  options: Option[];
};

export function DiscussionActions({ discussionId, options }: Props) {
  const [note, setNote] = useState("");

  async function addMessage(formData: FormData) {
    const body = String(formData.get("body") ?? "");
    if (!body) return;
    await fetch(`/api/discussions/${discussionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    window.location.reload();
  }

  async function addOption(formData: FormData) {
    const payload = {
      title: String(formData.get("title") ?? ""),
      notes: String(formData.get("notes") ?? "") || undefined,
      estimatedCostCents: Number(formData.get("estimatedCostCents") || 0) || undefined
    };

    await fetch(`/api/discussions/${discussionId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    window.location.reload();
  }

  async function vote(optionId: string) {
    await fetch(`/api/discussions/${discussionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftOptionId: optionId })
    });
    window.location.reload();
  }

  async function decide(formData: FormData) {
    const payload = {
      giftOptionId: String(formData.get("giftOptionId") ?? ""),
      paymentProvider: String(formData.get("paymentProvider") ?? "pending_selection")
    };

    const res = await fetch(`/api/discussions/${discussionId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    setNote(json.nextStep ?? "Decision saved.");
    window.location.reload();
  }

  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: "span 6" }}>
        <h3>Send message</h3>
        <form action={addMessage}>
          <textarea name="body" rows={3} required placeholder="Let's go with a shared budget around $100..." />
          <button type="submit">Post</button>
        </form>
      </section>

      <section className="card" style={{ gridColumn: "span 6" }}>
        <h3>Add gift option</h3>
        <form action={addOption}>
          <input name="title" required placeholder="Noise-canceling headphones" />
          <input name="notes" placeholder="Model + color ideas" />
          <input name="estimatedCostCents" type="number" min={1} step={100} placeholder="15000" />
          <button type="submit">Add option</button>
        </form>
      </section>

      <section className="card" style={{ gridColumn: "span 12" }}>
        <h3>Vote</h3>
        <div className="grid">
          {options.map((option) => (
            <article className="card" key={option.id} style={{ gridColumn: "span 4" }}>
              <h4>{option.title}</h4>
              <p className="muted">{option.notes ?? "No notes"}</p>
              <p>{option.estimatedCostCents ? `$${(option.estimatedCostCents / 100).toFixed(2)}` : "No estimate"}</p>
              <p>
                <strong>{option.votes}</strong> votes
              </p>
              <button type="button" onClick={() => vote(option.id)}>
                Vote
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" style={{ gridColumn: "span 12" }}>
        <h3>Finalize gift + checkout handoff</h3>
        <form action={decide}>
          <select name="giftOptionId" required>
            <option value="">Select winning option</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} ({option.votes} votes)
              </option>
            ))}
          </select>
          <select name="paymentProvider">
            <option value="pending_selection">Choose later</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
          </select>
          <button className="alt" type="submit">
            Confirm and create order
          </button>
        </form>
        {note ? <p className="muted">{note}</p> : null}
      </section>
    </div>
  );
}
