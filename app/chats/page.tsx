import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { daysUntil } from "@/lib/date";
import { prisma } from "@/lib/db";

export default async function ChatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const participations = await prisma.discussionParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      discussion: {
        include: {
          birthdayPerson: true,
          group: true,
          _count: { select: { messages: true } }
        }
      }
    },
    orderBy: { discussion: { eventDate: "asc" } }
  });

  return (
    <main>
      <section className="hero">
        <p className="kicker">Chats</p>
        <h1>Your planning chats</h1>
        <p className="muted">Private discussions where gift options are proposed and voted.</p>
      </section>

      <section className="grid">
        {participations.length === 0 ? (
          <article className="card" style={{ gridColumn: "span 12" }}>
            <h3>No chats yet</h3>
            <p className="muted">Join or create a group to start planning.</p>
            <Link className="button alt" href="/groups">Go to groups</Link>
          </article>
        ) : (
          participations.map((item) => {
            const isLocked = item.discussion.status === "ORDERED";

            return (
            <article className={`card${isLocked ? " discussion-card-locked" : ""}`} style={{ gridColumn: "span 6" }} key={item.discussionId}>
              <p className="badge">{item.discussion.status}</p>
              <h3>{item.discussion.title}</h3>
              <p className="muted">
                Group: {item.discussion.group.name} • {item.discussion._count.messages} messages
              </p>
              <p className="muted">
                Birthday in {daysUntil(item.discussion.eventDate)} days ({item.discussion.birthdayPerson.name ?? item.discussion.birthdayPerson.email})
              </p>
              {isLocked ? (
                <p className="muted discussion-locked-note">Celebrated. Chat closed.</p>
              ) : (
                <Link className="button" href={`/discussions/${item.discussion.id}`}>Open chat</Link>
              )}
            </article>
          );
          })
        )}
      </section>
    </main>
  );
}
