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
        include: {
          birthdayPerson: true,
          giftOptions: { include: { votes: true } },
          participants: {
            where: { userId: session.user.id },
            select: { userId: true }
          }
        },
        orderBy: { eventDate: "asc" }
      }
    }
  });

  if (!group) {
    notFound();
  }

  const visibleDiscussions = group.discussions.filter((d) => d.participants.length > 0);

  return (
    <main>
      <section className="hero">
        <p className="kicker">Group details</p>
        <div className="group-hero-heading">
          <h1>{group.name}</h1>
          <div className="group-avatar-stack" aria-label={`${group.name} members`}>
            {group.members.slice(0, 8).map((member) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={member.user.id}
                className="group-avatar"
                src={member.user.image ?? "/profile-pack/Phibi.png"}
                alt={member.user.name ?? member.user.email ?? "Group member avatar"}
                title={member.user.name ?? member.user.email ?? "Group member"}
              />
            ))}
            {group.members.length > 8 ? (
              <span className="group-avatar-more" aria-label={`${group.members.length - 8} more members`}>
                +{group.members.length - 8}
              </span>
            ) : null}
          </div>
        </div>
        <p className="muted">Members: {group.members.map((m) => m.user.name ?? m.user.email).join(", ")}</p>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 12" }}>
          <h2>Birthday planning threads</h2>
          <div className="grid">
            {visibleDiscussions.length === 0 ? <p className="muted">No discussions available for you right now.</p> : null}
            {visibleDiscussions.map((d) => {
              const isLocked = d.status === "ORDERED";

              return (
              <div className={`card${isLocked ? " discussion-card-locked" : ""}`} style={{ gridColumn: "span 6" }} key={d.id}>
                <p className="badge">{d.status}</p>
                <h3>{d.title}</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  For: {d.birthdayPerson.name ?? d.birthdayPerson.email} ({daysUntil(d.eventDate)} days)
                </p>
                <p className="muted">Gift options: {d.giftOptions.length}</p>
                {isLocked ? (
                  <p className="muted discussion-locked-note">Celebrated. Discussion closed.</p>
                ) : (
                  <Link className="button" href={`/discussions/${d.id}`}>
                    Open discussion
                  </Link>
                )}
              </div>
            );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
