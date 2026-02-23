import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SignInButton } from "@/components/sign-in-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasCompletedProfile } from "@/lib/profile-completion";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        birthday: true,
        addressLine1: true,
        city: true,
        state: true,
        postalCode: true,
        country: true
      }
    });

    if (me && hasCompletedProfile(me)) {
      redirect("/groups");
    }

    redirect("/profile");
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
