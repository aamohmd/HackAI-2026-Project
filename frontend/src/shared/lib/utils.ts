import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserDisplayName(user: { full_name?: string | null; email: string } | null | undefined) {
  if (!user) return "User";
  return user.full_name || user.email.split('@')[0];
}
