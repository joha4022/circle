import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const PROFILE_PACK_DIR = path.join(process.cwd(), "public", "profile-pack");
const PROFILE_PACK_PATHS = fs
  .readdirSync(PROFILE_PACK_DIR)
  .filter((name) => name.toLowerCase().endsWith(".png"))
  .sort((a, b) => a.localeCompare(b, "en"))
  .map((name) => `/profile-pack/${encodeURIComponent(name)}`);

function hashSeed(seed) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getProfilePackImageFromSeed(seed) {
  if (PROFILE_PACK_PATHS.length === 0) {
    return null;
  }
  const index = hashSeed(seed) % PROFILE_PACK_PATHS.length;
  return PROFILE_PACK_PATHS[index];
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  if (PROFILE_PACK_PATHS.length === 0) {
    console.log("No PNG profile pack files found; skipped.");
    return;
  }

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { image: getProfilePackImageFromSeed(user.id) }
    });
  }

  console.log(`Updated ${users.length} users with profile-pack images.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
