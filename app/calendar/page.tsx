import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BirthdayCalendar } from "@/components/birthday-calendar";
import { authOptions } from "@/lib/auth";
import { daysUntil, getNextBirthdayDate } from "@/lib/date";
import { prisma } from "@/lib/db";

type BirthdayEntry = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  birthday: Date;
  nextBirthday: Date;
  groups: string[];
};

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
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
                  name: true,
                  email: true,
                  image: true,
                  birthday: true
                }
              }
            }
          }
        }
      }
    }
  });

  const birthdayMap = new Map<string, BirthdayEntry>();

  for (const membership of memberships) {
    for (const member of membership.group.members) {
      if (member.user.id === session.user.id || !member.user.birthday) {
        continue;
      }

      const existing = birthdayMap.get(member.user.id);
      const nextBirthday = getNextBirthdayDate(member.user.birthday);

      if (!existing) {
        birthdayMap.set(member.user.id, {
          userId: member.user.id,
          name: member.user.name ?? member.user.email ?? "Circle friend",
          email: member.user.email ?? "unknown@email",
          image: member.user.image,
          birthday: member.user.birthday,
          nextBirthday,
          groups: [membership.group.name]
        });
        continue;
      }

      if (!existing.groups.includes(membership.group.name)) {
        existing.groups.push(membership.group.name);
      }
    }
  }

  const birthdays = Array.from(birthdayMap.values()).sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
  const calendarBirthdays = birthdays.map((entry) => ({
    userId: entry.userId,
    name: entry.name,
    birthdayIso: entry.birthday.toISOString()
  }));

  return (
    <main>
      <section className="hero">
        <p className="kicker">Calendar</p>
        <h1>Friends&apos; birthdays</h1>
        <p className="muted">Upcoming birthdays from all groups you&apos;re in.</p>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 12" }}>
          <BirthdayCalendar birthdays={calendarBirthdays} />
        </article>

        {birthdays.length === 0 ? (
          <article className="card" style={{ gridColumn: "span 12" }}>
            <h3>No birthdays yet</h3>
            <p className="muted">Ask your friends to add their birthday in profile to appear here.</p>
          </article>
        ) : (
          birthdays.map((entry) => (
            <article className="card" style={{ gridColumn: "span 6" }} key={entry.userId}>
              <div className="birthday-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="group-avatar"
                  src={entry.image ?? "/profile-pack/Phibi.png"}
                  alt={`${entry.name} avatar`}
                  width={36}
                  height={36}
                />
                <div>
                  <h3>{entry.name}</h3>
                  <p className="muted" style={{ margin: "0.2rem 0 0" }}>{entry.email}</p>
                </div>
              </div>
              <p className="badge" style={{ marginTop: "0.7rem" }}>
                In {daysUntil(entry.nextBirthday)} days
              </p>
              <p className="muted">
                Birthday: {entry.nextBirthday.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="muted">Groups: {entry.groups.join(", ")}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
