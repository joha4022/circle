import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CreateGroupForm } from "@/components/create-group-form";
import { ProfileForm } from "@/components/profile-form";
import { authOptions } from "@/lib/auth";
import { getNextBirthdayDate } from "@/lib/date";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [me, memberships] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id }
    }),
    prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            discussions: {
              include: {
                birthdayPerson: true
              },
              orderBy: { eventDate: "asc" }
            }
          }
        }
      }
    })
  ]);

  return (
    <main>
      <section className="hero">
        <p className="kicker">Your Circle dashboard</p>
        <h1>Welcome back, {me.name ?? me.email}</h1>
        <p className="muted">Capture your address + birthday, then create circles to kick off private gift planning.</p>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 5" }}>
          <h2>Profile</h2>
          <p className="muted">Birthday and address are used for gift planning and shipping.</p>
          <ProfileForm
            defaultValues={{
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

        <article className="card" style={{ gridColumn: "span 7" }}>
          <h2>Create a circle</h2>
          <p className="muted">Add friend emails. Circle auto-generates a planning thread for the nearest birthday in that group.</p>
          <CreateGroupForm />
        </article>

        <article className="card" style={{ gridColumn: "span 12" }}>
          <h2>Your groups</h2>
          {memberships.length === 0 ? (
            <p className="muted">No groups yet.</p>
          ) : (
            <div className="grid">
              {memberships.map((m) => (
                <div className="card" key={m.groupId} style={{ gridColumn: "span 6" }}>
                  <h3 style={{ marginTop: 0 }}>{m.group.name}</h3>
                  <Link href={`/groups/${m.group.id}`} className="button ghost">
                    Open group
                  </Link>
                  <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                    {m.group.discussions.slice(0, 2).map((d) => (
                      <Link key={d.id} href={`/discussions/${d.id}`} className="card" style={{ display: "block" }}>
                        <p style={{ margin: 0 }}>{d.title}</p>
                        <p className="muted" style={{ margin: 0 }}>
                          {getNextBirthdayDate(d.birthdayPerson.birthday ?? d.eventDate).toDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
