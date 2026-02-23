import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SignInButton } from "@/components/sign-in-button";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <section className="card" style={{ maxWidth: 460, margin: "1.5rem auto" }}>
        <p className="kicker">Sign in</p>
        <h1 style={{ marginTop: 0 }}>Sign in to Circle</h1>
        <p className="muted">Use your Google account to access groups, chat threads, and birthday gift voting.</p>
        <SignInButton />
      </section>
    </main>
  );
}
