import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DiscussionActions } from "@/components/discussion-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const participant = await prisma.discussionParticipant.findUnique({
    where: {
      discussionId_userId: {
        discussionId: id,
        userId: session.user.id
      }
    }
  });

  if (!participant) {
    notFound();
  }

  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      birthdayPerson: true,
      messages: {
        include: { author: true },
        orderBy: { createdAt: "asc" }
      },
      giftOptions: {
        include: {
          _count: { select: { votes: true } },
          votes: {
            where: { voterId: session.user.id },
            select: { id: true }
          }
        },
        orderBy: { createdAt: "asc" }
      },
      giftOrder: true,
      _count: {
        select: { participants: true }
      }
    }
  });

  if (!discussion) {
    notFound();
  }

  return (
    <main>
      <section className="hero">
        <p className="kicker">Private discussion</p>
        <h1>{discussion.title}</h1>
        <p className="muted">
          Planning for {discussion.birthdayPerson.name ?? discussion.birthdayPerson.email}&apos;s birthday on {discussion.eventDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>
        {discussion.giftOrder ? (
          <p className="badge">Payment: {discussion.giftOrder.paymentProvider} ({discussion.giftOrder.paymentStatus})</p>
        ) : null}
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 12" }}>
          <h2>Group chat</h2>
          <div className="chat-shell">
            <DiscussionActions
              discussionId={discussion.id}
              mode="chat"
              chatMessages={discussion.messages.map((m) => ({
                id: m.id,
                authorName: m.author.name ?? m.author.email ?? "Circle user",
                body: m.body,
                createdAt: m.createdAt.toISOString(),
                authorImage: m.author.image
              }))}
              currentUserLabel={session.user.name ?? session.user.email ?? "You"}
              currentUserImage={session.user.image ?? undefined}
              splitParticipantCount={discussion._count.participants}
              options={[]}
            />
          </div>
        </article>
      </section>

      <DiscussionActions
        discussionId={discussion.id}
        mode="gift"
        options={discussion.giftOptions.map((o) => ({
          id: o.id,
          title: o.title,
          notes: o.notes,
          estimatedCostCents: o.estimatedCostCents,
          votes: o._count.votes,
          hasVoted: o.votes.length > 0
        }))}
        splitParticipantCount={discussion._count.participants}
      />
    </main>
  );
}
