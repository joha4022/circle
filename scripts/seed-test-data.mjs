import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OWNER_EMAIL = "joha4022@gmail.com";
const GROUP_NAME = "QA Circle Test Group";
const DISCUSSION_TITLE = "Mina's birthday gift plan (QA)";

const TEST_USERS = [
  { email: "alex.qa.circle@gmail.com", name: "Alex Park", birthday: new Date("1994-03-18") },
  { email: "mina.qa.circle@gmail.com", name: "Mina Cho", birthday: new Date("1996-04-02") },
  { email: "sam.qa.circle@gmail.com", name: "Sam Rivera", birthday: new Date("1993-05-12") },
  { email: "riley.qa.circle@gmail.com", name: "Riley Kim", birthday: new Date("1995-06-20") },
  { email: "jordan.qa.circle@gmail.com", name: "Jordan Lee", birthday: new Date("1992-07-08") }
];

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!owner) {
    throw new Error(`Owner user not found for email ${OWNER_EMAIL}. Log in once first or update OWNER_EMAIL.`);
  }

  for (const u of TEST_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, birthday: u.birthday },
      create: { email: u.email, name: u.name, birthday: u.birthday }
    });
  }

  const allMembers = await prisma.user.findMany({
    where: { email: { in: [OWNER_EMAIL, ...TEST_USERS.map((u) => u.email)] } },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" }
  });

  let group = await prisma.group.findFirst({
    where: {
      name: GROUP_NAME,
      members: { some: { userId: owner.id, role: "OWNER" } }
    }
  });

  if (!group) {
    group = await prisma.group.create({ data: { name: GROUP_NAME } });
  }

  for (const member of allMembers) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: member.id } },
      update: {},
      create: {
        groupId: group.id,
        userId: member.id,
        role: member.id === owner.id ? "OWNER" : "MEMBER"
      }
    });
  }

  const birthdayPerson = allMembers.find((u) => u.email === "mina.qa.circle@gmail.com");
  if (!birthdayPerson) {
    throw new Error("Birthday person missing from seeded members.");
  }

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 21);

  let discussion = await prisma.discussion.findFirst({
    where: { groupId: group.id, title: DISCUSSION_TITLE }
  });

  if (!discussion) {
    discussion = await prisma.discussion.create({
      data: {
        groupId: group.id,
        birthdayPersonId: birthdayPerson.id,
        eventDate,
        title: DISCUSSION_TITLE,
        status: "OPEN"
      }
    });
  }

  for (const member of allMembers) {
    if (member.id === birthdayPerson.id) continue;

    await prisma.discussionParticipant.upsert({
      where: {
        discussionId_userId: { discussionId: discussion.id, userId: member.id }
      },
      update: {},
      create: {
        discussionId: discussion.id,
        userId: member.id
      }
    });
  }

  const existingOptions = await prisma.giftOption.findMany({
    where: { discussionId: discussion.id },
    select: { title: true }
  });

  const optionTitles = new Set(existingOptions.map((o) => o.title));
  const newOptions = [
    { title: "Polaroid camera", notes: "Mini bundle + film", estimatedCostCents: 9800 },
    { title: "Spa day voucher", notes: "Local spa package", estimatedCostCents: 15500 },
    { title: "Custom cake + dinner", notes: "Group celebration", estimatedCostCents: 12000 }
  ].filter((o) => !optionTitles.has(o.title));

  if (newOptions.length > 0) {
    await prisma.giftOption.createMany({
      data: newOptions.map((o) => ({ ...o, discussionId: discussion.id }))
    });
  }

  const existingMessageCount = await prisma.message.count({ where: { discussionId: discussion.id } });

  if (existingMessageCount === 0) {
    const author = allMembers.find((m) => m.id === owner.id) ?? allMembers[0];
    const lines = [
      "Kicking off QA planning thread for Mina.",
      "Let's keep budget around $120 total.",
      "Vote by Friday so checkout can happen this weekend.",
      "Please drop links and color preferences in this chat.",
      "We can split payment once we pick the winner."
    ];

    for (const body of lines) {
      await prisma.message.create({
        data: {
          discussionId: discussion.id,
          authorId: author.id,
          body
        }
      });
    }
  }

  console.log(JSON.stringify({
    ownerEmail: OWNER_EMAIL,
    groupId: group.id,
    groupName: GROUP_NAME,
    discussionId: discussion.id,
    discussionTitle: DISCUSSION_TITLE,
    members: allMembers.map((m) => m.email)
  }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
