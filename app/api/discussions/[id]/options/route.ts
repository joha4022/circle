import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  title: z.string().min(2),
  notes: z.string().optional(),
  estimatedCostCents: z.number().int().positive().optional()
});
const deleteSchema = z.object({
  giftOptionId: z.string().min(1)
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = deleteSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const participant = await prisma.discussionParticipant.findUnique({
    where: { discussionId_userId: { discussionId: id, userId } }
  });

  if (!participant) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const removed = await prisma.giftOption.deleteMany({
      where: {
        id: parsed.data.giftOptionId,
        discussionId: id
      }
    });

    if (removed.count === 0) {
      return Response.json({ error: "Gift option not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return Response.json({ error: "This gift option can't be removed because it is used in checkout." }, { status: 409 });
    }

    throw error;
  }
}
