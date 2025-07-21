import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSimpleId(): string {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (error) {
    console.warn("crypto.randomUUID not available, falling back to Math.random", error);
  }
  
  // Fallback for environments where crypto is not available or fails
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
