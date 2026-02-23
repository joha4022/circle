import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ body: z.string().min(1).max(500) });

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

  const message = await prisma.message.create({
    data: {
      discussionId: id,
      authorId: userId,
      body: parsed.data.body
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  });

  return Response.json({
    ok: true,
    message: {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      authorName: message.author.name ?? message.author.email ?? "Circle user",
      authorImage: message.author.image ?? null
    }
  });
}
