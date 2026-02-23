import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { SignOutButton } from "@/components/sign-out-button";
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
    <html lang="en">
      <body>
        <Providers>
          <nav className="nav">
            <Link className="brand" href="/">
              circle
            </Link>
            <div className="nav-links">
              <Link href="/dashboard">Dashboard</Link>
              {session?.user ? <SignOutButton /> : <Link className="button" href="/login">Login</Link>}
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
