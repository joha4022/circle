import type { User } from "@prisma/client";

type ProfileFields = Pick<User, "birthday" | "addressLine1" | "city" | "state" | "postalCode" | "country">;

export function hasCompletedProfile(user: ProfileFields): boolean {
  return Boolean(user.birthday && user.addressLine1 && user.city && user.state && user.postalCode && user.country);
}
