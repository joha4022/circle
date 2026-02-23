import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { daysUntil } from "@/lib/date";
import { prisma } from "@/lib/db";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: session.user.id
      }
    }
  });

  if (!member) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      discussions: {
        include: { birthdayPerson: true, giftOptions: { include: { votes: true } } },
        orderBy: { eventDate: "asc" }
      }
    }
  });

  if (!group) {
    notFound();
  }

  return (
    <main>
      <section className="hero">
        <p className="kicker">Group details</p>
        <h1>{group.name}</h1>
        <p className="muted">Members: {group.members.map((m) => m.user.name ?? m.user.email).join(", ")}</p>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 12" }}>
          <h2>Birthday planning threads</h2>
          <div className="grid">
            {group.discussions.length === 0 ? <p className="muted">No discussions yet.</p> : null}
            {group.discussions.map((d) => (
              <div className="card" style={{ gridColumn: "span 6" }} key={d.id}>
                <p className="badge">{d.status}</p>
                <h3>{d.title}</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  For: {d.birthdayPerson.name ?? d.birthdayPerson.email} ({daysUntil(d.eventDate)} days)
                </p>
                <p className="muted">Gift options: {d.giftOptions.length}</p>
                <Link className="button" href={`/discussions/${d.id}`}>
                  Open discussion
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
