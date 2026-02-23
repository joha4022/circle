import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const profileSchema = z.object({
  image: z
    .string()
    .max(2_000_000)
    .refine((value) => value.startsWith("data:image/") || value.startsWith("/profile-pack/") || value.startsWith("http"), {
      message: "Invalid image format"
    })
    .optional(),
  birthday: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1)
});

function parseDataUrlImage(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, base64] = match;
  return { mime, bytes: Buffer.from(base64, "base64") };
}

function extensionFromMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

async function persistProfileImage(image: string, userId: string): Promise<string> {
  if (!image.startsWith("data:image/")) return image;

  const parsed = parseDataUrlImage(image);
  if (!parsed) throw new Error("Invalid image data URL");

  const ext = extensionFromMime(parsed.mime);
  if (!ext) throw new Error("Unsupported image type");

  const relativeDir = path.join("uploads", "profiles");
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const fileName = `${userId}-${randomUUID()}.${ext}`;
  const absolutePath = path.join(absoluteDir, fileName);
  await writeFile(absolutePath, parsed.bytes);

  return `/${relativeDir}/${fileName}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = profileSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let imagePath: string | undefined = undefined;

  if (typeof data.image === "string") {
    try {
      imagePath = await persistProfileImage(data.image, userId);
    } catch {
      return Response.json({ error: "Invalid image upload" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      image: imagePath,
      birthday: data.birthday ? new Date(data.birthday) : null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country
    }
  });

  return Response.json({ ok: true });
}
