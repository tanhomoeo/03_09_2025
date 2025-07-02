
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSimpleId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const appendFinalTranscript = (currentValue: string | undefined | null, newTranscript: string): string => {
  let textToSet = typeof currentValue === 'string' ? currentValue : ""; 
  let processedTranscript = typeof newTranscript === 'string' ? newTranscript.trim() : ""; 

  if (!processedTranscript) {
    return textToSet;
  }

  // Add a space if current text is not empty and doesn't already end with a space or newline.
  if (textToSet.length > 0 && !/\s$/.test(textToSet)) {
    textToSet += " "; 
  }
  
  // Append the processed transcript without an extra trailing space.
  textToSet += processedTranscript; 
  
  return textToSet;
};
