"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button className="alt" type="button" onClick={() => signIn("google", { callbackUrl: "/groups" })}>
      Continue with Google
    </button>
  );
}
