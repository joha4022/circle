"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

type UserMenuProps = {
  userName?: string;
  userEmail?: string;
  userImage?: string;
  avatarSeed: string;
};

const DISCORD_THEME_COLORS = [
  "#5865F2",
  "#57F287",
  "#FEE75C",
  "#EB459E",
  "#ED4245",
  "#3BA55D",
  "#4E5D94",
  "#FAA61A",
  "#00A8FC",
  "#8B5CF6"
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitial(userName?: string, userEmail?: string): string {
  const base = userName?.trim() || userEmail?.trim() || "C";
  return base[0]?.toUpperCase() ?? "C";
}

function createLetterAvatarDataUrl(initial: string, seed: string): string {
  const color = DISCORD_THEME_COLORS[hashString(seed) % DISCORD_THEME_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" role="img" aria-label="Profile avatar"><rect width="88" height="88" rx="44" fill="${color}" /><text x="44" y="56" text-anchor="middle" font-family="Manrope, Avenir Next, Segoe UI, sans-serif" font-size="38" font-weight="800" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function UserMenu({ userName, userEmail, userImage, avatarSeed }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const avatarUrl = useMemo(
    () => userImage ?? createLetterAvatarDataUrl(getInitial(userName, userEmail), avatarSeed),
    [avatarSeed, userEmail, userImage, userName]
  );
  const menuId = "user-menu-dropdown";

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        className="avatar-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="avatar-image" src={avatarUrl} alt="Profile avatar" width={44} height={44} />
      </button>

      {open ? (
        <div className="user-dropdown" role="menu" id={menuId}>
          <div className="user-head">
            <p>{userName ?? "Circle user"}</p>
            <p className="muted">{userEmail ?? ""}</p>
          </div>
          <Link className="dropdown-item" role="menuitem" href="/profile" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <button
            className="dropdown-item"
            role="menuitem"
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
