import { GroupRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getNextBirthdayDate } from "@/lib/date";
import { prisma } from "@/lib/db";
import { getRandomProfilePackImage } from "@/lib/profile-pack";

const groupSchema = z.object({
  name: z.string().min(2),
  friendEmails: z.array(z.string().email()).min(1)
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = groupSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const requestedEmails = Array.from(new Set([...parsed.data.friendEmails, userEmail].map((e) => e.toLowerCase())));

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: requestedEmails } },
    select: { id: true, email: true }
  });

  const existingByEmail = new Map(existingUsers.map((u) => [u.email?.toLowerCase(), u.id]));

  const usersToCreate = requestedEmails.filter((email) => !existingByEmail.has(email));

  if (usersToCreate.length > 0) {
    await prisma.user.createMany({
      data: usersToCreate.map((email) => ({
        email,
        name: email.split("@")[0],
        image: getRandomProfilePackImage()
      }))
    });
  }

  const allUsers = await prisma.user.findMany({
    where: { email: { in: requestedEmails } },
    select: { id: true, email: true, birthday: true, name: true }
  });

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      members: {
        create: allUsers.map((u) => ({
          userId: u.id,
          role: u.id === userId ? GroupRole.OWNER : GroupRole.MEMBER
        }))
      }
    }
  });

  const withBirthdays = allUsers
    .filter((u): u is typeof u & { birthday: Date } => Boolean(u.birthday))
    .map((u) => ({ ...u, nextBirthday: getNextBirthdayDate(u.birthday) }))
    .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

  let discussionId: string | null = null;

  if (withBirthdays.length > 0) {
    const birthdayPerson = withBirthdays[0];
    const participants = allUsers.filter((u) => u.id !== birthdayPerson.id);

    const discussion = await prisma.discussion.create({
      data: {
        groupId: group.id,
        birthdayPersonId: birthdayPerson.id,
        eventDate: birthdayPerson.nextBirthday,
        title: `${birthdayPerson.name ?? birthdayPerson.email}'s birthday plan`,
        participants: {
          create: participants.map((p) => ({ userId: p.id }))
        },
        giftOptions: {
          create: [
            { title: "Gift card", notes: "Flexible option", estimatedCostCents: 5000 },
            { title: "Experience voucher", notes: "Dinner or activity", estimatedCostCents: 10000 },
            { title: "Shared gadget fund", notes: "Pool contributions", estimatedCostCents: 20000 }
          ]
        },
        messages: {
          create: {
            authorId: userId,
            body: `Planning started for ${birthdayPerson.name ?? birthdayPerson.email}. They are excluded from this chat.`
          }
        }
      }
    });

    discussionId = discussion.id;
  }

  return Response.json({ ok: true, groupId: group.id, discussionId });
}
