import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ giftOptionId: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const participant = await prisma.discussionParticipant.findUnique({
    where: { discussionId_userId: { discussionId: id, userId } }
  });

  if (!participant) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const option = await prisma.giftOption.findFirst({
    where: { id: parsed.data.giftOptionId, discussionId: id }
  });

  if (!option) {
    return Response.json({ error: "Gift option not found" }, { status: 404 });
  }

  await prisma.vote.deleteMany({
    where: {
      voterId: userId,
      giftOption: { discussionId: id }
    }
  });

  await prisma.vote.create({
    data: {
      voterId: userId,
      giftOptionId: parsed.data.giftOptionId
    }
  });

  return Response.json({ ok: true });
}
