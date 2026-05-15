import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserDisplayName(user: { full_name?: string | null; phone_number: string } | null | undefined) {
  if (!user) return "User";
  return user.full_name || user.phone_number;
}
