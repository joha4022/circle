import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import Providers from "@/app/providers";
import { authOptions } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circle",
  description: "Plan group birthday gifts with private gift discussions and voting."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app-shell">
            <header className="app-topbar">
              <nav className="nav topbar-inner">
                <Link className="brand" href="/">
                  circle
                </Link>
                <div className="nav-links nav-tabs">
                  <Link className="tab-link" href="/groups">Groups</Link>
                  <Link className="tab-link" href="/chats">Chats</Link>
                  <Link className="tab-link" href="/calendar">Calendar</Link>
                  {session?.user ? (
                    <UserMenu
                      userName={session.user.name ?? undefined}
                      userEmail={session.user.email ?? undefined}
                      userImage={session.user.image ?? undefined}
                      avatarSeed={session.user.id ?? session.user.email ?? "circle-user"}
                    />
                  ) : (
                    <Link className="button alt" href="/login">Log in</Link>
                  )}
                </div>
              </nav>
            </header>
            {children}
          </div>
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  );
}
