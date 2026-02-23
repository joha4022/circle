"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateGroupForm } from "@/components/create-group-form";

export function CreateGroupModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="alt" onClick={() => setOpen(true)}>
        Create new group
      </button>

      {open ? (
        <div className="chat-gift-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="chat-gift-modal group-create-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create a new group"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Create a new group</h3>
            <CreateGroupForm
              onCreated={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
