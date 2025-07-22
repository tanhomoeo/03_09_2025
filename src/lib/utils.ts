
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomUUID } from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSimpleId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments where crypto is not available (like older Node.js versions in some contexts)
  try {
    return randomUUID(); 
  } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Fallback using Math.random
  }
}
