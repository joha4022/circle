import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  title: z.string().min(2),
  notes: z.string().optional(),
  estimatedCostCents: z.number().int().positive().optional()
});

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

  await prisma.giftOption.create({
    data: {
      discussionId: id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      estimatedCostCents: parsed.data.estimatedCostCents
    }
  });

  return Response.json({ ok: true });
}
