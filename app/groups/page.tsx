import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CreateGroupModal } from "@/components/create-group-modal";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasCompletedProfile } from "@/lib/profile-completion";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const me = await prisma.user.findUniqueOrThrow({
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

  if (!hasCompletedProfile(me)) {
    redirect("/profile");
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  image: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              userId: "asc"
            }
          },
          _count: { select: { members: true, discussions: true } }
        }
      }
    },
    orderBy: { groupId: "asc" }
  });

  return (
    <main>
      <section className="hero">
        <p className="kicker">Groups</p>
        <h1>Your circles</h1>
        <p className="muted">View group members and open birthday planning threads.</p>
        <div style={{ marginTop: "0.9rem" }}>
          <CreateGroupModal />
        </div>
      </section>

      <section className="grid">
        {memberships.length === 0 ? (
          <article className="card" style={{ gridColumn: "span 12" }}>
            <h3>No groups yet</h3>
            <p className="muted">Create your first group to start planning birthdays.</p>
          </article>
        ) : (
          memberships.map((membership) => (
            <article className="card" style={{ gridColumn: "span 6" }} key={membership.groupId}>
              <div className="group-heading">
                <h3>{membership.group.name}</h3>
                <div className="group-avatar-stack" aria-label={`${membership.group.name} members`}>
                  {membership.group.members.slice(0, 6).map((member) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={member.user.id}
                      className="group-avatar"
                      src={member.user.image ?? "/profile-pack/Phibi.png"}
                      alt={member.user.name ?? member.user.email ?? "Group member avatar"}
                      title={member.user.name ?? member.user.email ?? "Group member"}
                    />
                  ))}
                  {membership.group.members.length > 6 ? (
                    <span className="group-avatar-more" aria-label={`${membership.group.members.length - 6} more members`}>
                      +{membership.group.members.length - 6}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="muted">
                {membership.group._count.members} members • {membership.group._count.discussions} chats
              </p>
              <Link className="button" href={`/groups/${membership.group.id}`}>Open group</Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
