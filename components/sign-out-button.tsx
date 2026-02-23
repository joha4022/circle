"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="ghost" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
