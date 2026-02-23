import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ProfileForm } from "@/components/profile-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const me = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id }
  });

  return (
    <main>
      <section className="hero">
        <p className="kicker">Profile</p>
        <h1>Update your information</h1>
        <p className="muted">Keep birthday and shipping address current for gift delivery.</p>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 8" }}>
          <h2>Edit profile</h2>
          <ProfileForm
            defaultValues={{
              image: me.image ?? undefined,
              birthday: me.birthday ? me.birthday.toISOString().slice(0, 10) : undefined,
              addressLine1: me.addressLine1 ?? undefined,
              addressLine2: me.addressLine2 ?? undefined,
              city: me.city ?? undefined,
              state: me.state ?? undefined,
              postalCode: me.postalCode ?? undefined,
              country: me.country ?? undefined
            }}
          />
        </article>
      </section>
    </main>
  );
}
