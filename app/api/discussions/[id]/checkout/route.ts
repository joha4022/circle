import { DiscussionStatus, PaymentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  giftOptionId: z.string().min(1),
  paymentProvider: z.string().min(1).default("pending_selection")
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

  const option = await prisma.giftOption.findFirst({
    where: { id: parsed.data.giftOptionId, discussionId: id }
  });

  if (!option) {
    return Response.json({ error: "Gift option not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.discussion.update({
      where: { id },
      data: {
        selectedGiftOptionId: option.id,
        status: DiscussionStatus.DECIDED
      }
    }),
    prisma.giftOrder.upsert({
      where: { discussionId: id },
      create: {
        discussionId: id,
        giftOptionId: option.id,
        paymentProvider: parsed.data.paymentProvider,
        paymentStatus: PaymentStatus.PENDING
      },
      update: {
        giftOptionId: option.id,
        paymentProvider: parsed.data.paymentProvider,
        paymentStatus: PaymentStatus.PENDING
      }
    })
  ]);

  return Response.json({
    ok: true,
    nextStep: "Integrate a real checkout provider (Stripe, PayPal, or Splitwise-like flow)."
  });
}
