"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Option = {
  id: string;
  title: string;
  notes: string | null;
  estimatedCostCents: number | null;
  votes: number;
  hasVoted: boolean;
};

const EMPTY_CHAT_MESSAGES: { id: string; authorName: string; body: string; authorImage?: string | null }[] = [];

type Props = {
  discussionId: string;
  options: Option[];
  mode?: "all" | "chat" | "gift";
  chatMessages?: { id: string; authorName: string; body: string; createdAt: string; authorImage?: string | null }[];
  currentUserLabel?: string;
  currentUserImage?: string;
  splitParticipantCount?: number;
};

export function DiscussionActions({
  discussionId,
  options,
  mode = "all",
  chatMessages = EMPTY_CHAT_MESSAGES,
  currentUserLabel = "You",
  currentUserImage,
  splitParticipantCount = 1
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState(chatMessages);
  const [isGiftFormOpen, setIsGiftFormOpen] = useState(false);
  const [giftOptions, setGiftOptions] = useState(options);
  const showChatComposer = mode !== "gift";
  const showGiftActions = mode !== "chat";
  const chatFormRef = useRef<HTMLFormElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  function formatMessageTimestamp(input: string): string {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return "";

    const datePart = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
      .format(date)
      .toLowerCase();

    return `${datePart} ${timePart}`;
  }

  useEffect(() => {
    if (mode !== "chat") return;
    const chatList = chatListRef.current;
    if (!chatList) return;
    chatList.scrollTop = chatList.scrollHeight;
  }, [mode, messages]);

  useEffect(() => {
    setGiftOptions(options);
  }, [options]);

  async function addMessage(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    const res = await fetch(`/api/discussions/${discussionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });

    if (!res.ok) return;

    if (mode === "chat") {
      const json = await res.json();
      const message = json.message as { id?: string; body?: string; authorName?: string; authorImage?: string | null } | undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: message?.id ?? `local-${Date.now()}`,
          body: message?.body ?? body,
          authorName: message?.authorName ?? currentUserLabel,
          createdAt: message?.createdAt ?? new Date().toISOString(),
          authorImage: message?.authorImage ?? currentUserImage ?? null
        }
      ]);

      if (chatTextareaRef.current) {
        chatTextareaRef.current.value = "";
      }

      return;
    }

    window.location.reload();
  }

  function onChatComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatFormRef.current?.requestSubmit();
    }
  }

  async function addGiftFromChat(formData: FormData) {
    const title = String(formData.get("giftTitle") ?? "").trim();
    const url = String(formData.get("giftUrl") ?? "").trim();
    const totalPrice = Number(formData.get("giftPrice") ?? 0);
    const estimatedCostCents = Number.isFinite(totalPrice) && totalPrice > 0 ? Math.round(totalPrice * 100) : undefined;

    if (!title || !url || !estimatedCostCents) {
      return;
    }

    const res = await fetch(`/api/discussions/${discussionId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        notes: url,
        estimatedCostCents
      })
    });

    if (!res.ok) return;

    setIsGiftFormOpen(false);
    router.refresh();
  }

  async function vote(optionId: string) {
    const res = await fetch(`/api/discussions/${discussionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftOptionId: optionId })
    });
    if (!res.ok) return;
    const json = await res.json();
    const voted = Boolean(json.voted);

    setGiftOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            hasVoted: voted,
            votes: Math.max(0, voted ? opt.votes + 1 : opt.votes - 1)
          };
        }

        if (voted && opt.hasVoted) {
          return { ...opt, hasVoted: false, votes: Math.max(0, opt.votes - 1) };
        }

        return opt;
      })
    );
  }

  return (
    <div className={mode === "chat" ? undefined : "grid"}>
      {showChatComposer ? (
        mode === "chat" ? (
          <div className="chat-composer">
            <div ref={chatListRef} className="chat">
              {messages.length === 0 ? <p className="muted">No messages yet. Start the thread below.</p> : null}
              {messages.map((m) => (
                <div className="chat-msg-row" key={m.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="chat-msg-avatar" src={m.authorImage ?? "/profile-pack/Phibi.png"} alt={`${m.authorName} avatar`} />
                  <div className="msg">
                    <p className="chat-msg-author">{m.authorName}</p>
                    <p className="chat-msg-body">{m.body}</p>
                    <p className="chat-msg-time">{formatMessageTimestamp(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <form ref={chatFormRef} action={addMessage}>
              <textarea
                ref={chatTextareaRef}
                name="body"
                rows={3}
                required
                placeholder="Type a message..."
                onKeyDown={onChatComposerKeyDown}
              />
              <div className="chat-composer-actions">
                <p className="muted chat-composer-hint">Press Enter to send</p>
                <button
                  type="button"
                  className="chat-gift-button"
                  aria-label="Add gift option"
                  onClick={() => setIsGiftFormOpen((v) => !v)}
                >
                  🎁
                </button>
              </div>
            </form>
          </div>
        ) : (
          <section className="card" style={{ gridColumn: "span 6" }}>
            <h3>Send message</h3>
            <form action={addMessage}>
              <textarea name="body" rows={3} required placeholder="Let's go with a shared budget around $100..." />
              <button type="submit">Post</button>
            </form>
          </section>
        )
      ) : null}

      {mode === "chat" && isGiftFormOpen ? (
        <div className="chat-gift-modal-backdrop" role="presentation" onClick={() => setIsGiftFormOpen(false)}>
          <div
            className="chat-gift-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add gift option"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Add gift option</h3>
            <form className="chat-gift-form" action={addGiftFromChat}>
              <input name="giftTitle" required placeholder="Gift name or title" />
              <input name="giftUrl" type="url" required placeholder="Gift link (https://...)" />
              <input name="giftPrice" type="number" min={0.01} step={0.01} required placeholder="Dollar amount (USD)" />
              <div className="chat-gift-form-actions">
                <button type="button" className="ghost" onClick={() => setIsGiftFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="alt">
                  Add to vote
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showGiftActions ? (
        <>
          <section className="card" style={{ gridColumn: "span 12" }}>
            <h3>Vote</h3>
            {giftOptions.length === 0 ? (
              <p className="muted">No options yet. Use the gift button in chat to add one.</p>
            ) : (
              <div className="grid">
                {giftOptions.map((option) => (
                  <article className="card" key={option.id} style={{ gridColumn: "span 4" }}>
                    <h4>{option.title}</h4>
                    <p>{option.estimatedCostCents ? `$${(option.estimatedCostCents / 100).toFixed(2)}` : "No estimate"}</p>
                    <p className="muted">
                      Per person:{" "}
                      {option.estimatedCostCents && splitParticipantCount > 0
                        ? `$${((option.estimatedCostCents / 100) / splitParticipantCount).toFixed(2)}`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>{option.votes}</strong> votes
                    </p>
                    <div className="vote-actions">
                      <button
                        type="button"
                        aria-label={option.hasVoted ? "Un-heart gift option" : "Heart gift option"}
                        className={option.hasVoted ? "alt" : "ghost"}
                        onClick={() => vote(option.id)}
                      >
                        {option.hasVoted ? "❤️" : "🤍"}
                      </button>
                      <button
                        type="button"
                        className="button"
                        disabled={!option.notes}
                        onClick={() => {
                          if (!option.notes) return;
                          window.open(option.notes, "_blank", "noopener,noreferrer");
                        }}
                      >
                        See item
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
