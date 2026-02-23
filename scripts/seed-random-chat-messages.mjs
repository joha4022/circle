import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const QA_DISCUSSION_TITLE = "Mina's birthday gift plan (QA)";
const FAKE_EMAILS = [
  "alex.qa.circle@gmail.com",
  "sam.qa.circle@gmail.com",
  "riley.qa.circle@gmail.com",
  "jordan.qa.circle@gmail.com",
  "evekim920416@gmail.com"
];

const PHRASES = [
  "I found a better deal on this one.",
  "What if we keep the budget under $120?",
  "I like this option because shipping is fast.",
  "Can we decide by tonight?",
  "This one seems the most useful long-term.",
  "I checked reviews and they look solid.",
  "Let's compare two final choices.",
  "I can order if everyone agrees.",
  "Do we want something practical or fun?",
  "This gift has a great return policy."
];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function main() {
  const discussion = await prisma.discussion.findFirst({
    where: { title: QA_DISCUSSION_TITLE },
    select: { id: true }
  });

  if (!discussion) {
    console.log("QA discussion not found. Skipping message seed.");
    return;
  }

  const users = await prisma.user.findMany({
    where: { email: { in: FAKE_EMAILS } },
    select: { id: true, email: true }
  });

  const participantIds = new Set(
    (
      await prisma.discussionParticipant.findMany({
        where: { discussionId: discussion.id },
        select: { userId: true }
      })
    ).map((p) => p.userId)
  );

  const authors = users.filter((u) => participantIds.has(u.id));
  if (authors.length === 0) {
    console.log("No fake users are participants in the discussion. Nothing seeded.");
    return;
  }

  const now = Date.now();
  const newMessages = [];
  for (let i = 0; i < 14; i += 1) {
    const minsAgo = (14 - i) * (12 + Math.floor(Math.random() * 21));
    const createdAt = new Date(now - minsAgo * 60 * 1000);
    newMessages.push({
      discussionId: discussion.id,
      authorId: randomItem(authors).id,
      body: randomItem(PHRASES),
      createdAt
    });
  }

  await prisma.message.createMany({ data: newMessages });

  console.log(`Seeded ${newMessages.length} random messages into discussion ${discussion.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
