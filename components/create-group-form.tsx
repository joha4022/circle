"use client";

import { useState } from "react";

type Props = {
  onCreated?: (groupId: string) => void;
};

export function CreateGroupForm({ onCreated }: Props) {
  const [message, setMessage] = useState("");

  async function onSubmit(formData: FormData) {
    setMessage("Creating group...");
    const friendEmails = String(formData.get("friendEmails") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        friendEmails
      })
    });

    const json = await res.json();

    if (!res.ok) {
      setMessage(json.error ?? "Could not create group");
      return;
    }

    setMessage(json.discussionId ? "Group created. Birthday planning thread started." : "Group created. Add birthdays to trigger chat.");
    onCreated?.(json.groupId);
  }

  return (
    <form action={onSubmit}>
      <label htmlFor="name">Group name</label>
      <input id="name" name="name" required placeholder="Friday Crew" />
      <label htmlFor="friendEmails">Friend emails (comma separated)</label>
      <textarea id="friendEmails" name="friendEmails" required placeholder="alex@gmail.com, sam@gmail.com" rows={3} />
      <button className="alt" type="submit">
        Create group
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
