import fs from "node:fs";
import path from "node:path";

const PROFILE_PACK_DIR = path.join(process.cwd(), "public", "profile-pack");
let cachedPaths: string[] | null = null;

function getProfilePackPaths(): string[] {
  if (cachedPaths) {
    return cachedPaths;
  }

  const files = fs
    .readdirSync(PROFILE_PACK_DIR)
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, "en"));

  cachedPaths = files.map((name) => `/profile-pack/${encodeURIComponent(name)}`);
  return cachedPaths;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getProfilePackImageByIndex(index: number): string {
  const paths = getProfilePackPaths();
  if (paths.length === 0) {
    return "";
  }
  const normalized = ((Math.trunc(index) % paths.length) + paths.length) % paths.length;
  return paths[normalized];
}

export function getProfilePackImageFromSeed(seed: string): string {
  const paths = getProfilePackPaths();
  if (paths.length === 0) {
    return "";
  }
  if (!seed) return paths[0];
  return getProfilePackImageByIndex(hashSeed(seed));
}

export function getRandomProfilePackImage(): string {
  const paths = getProfilePackPaths();
  if (paths.length === 0) {
    return "";
  }
  return getProfilePackImageByIndex(Math.floor(Math.random() * paths.length));
}
