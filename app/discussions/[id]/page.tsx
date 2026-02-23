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
        include: { votes: true },
        orderBy: { createdAt: "asc" }
      },
      giftOrder: true
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
          Birthday friend excluded: {discussion.birthdayPerson.name ?? discussion.birthdayPerson.email}
        </p>
        {discussion.giftOrder ? (
          <p className="badge">Payment: {discussion.giftOrder.paymentProvider} ({discussion.giftOrder.paymentStatus})</p>
        ) : null}
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 12" }}>
          <h2>Group chat</h2>
          <div className="chat">
            {discussion.messages.map((m) => (
              <div className="msg" key={m.id}>
                <strong>{m.author.name ?? m.author.email}</strong>
                <p style={{ margin: "0.2rem 0 0" }}>{m.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <DiscussionActions
        discussionId={discussion.id}
        options={discussion.giftOptions.map((o) => ({
          id: o.id,
          title: o.title,
          notes: o.notes,
          estimatedCostCents: o.estimatedCostCents,
          votes: o.votes.length
        }))}
      />
    </main>
  );
}
