import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isToday(date: any): boolean {
  if (!date) return false;
  const d = toDate(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export function toDate(date: any): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  if (date && typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }
  return new Date(date);
}

export function handleFirestoreError(error: any, operation: string, path: string) {
  console.error(`Firestore error during ${operation} at ${path}:`, error);
  return null;
}

export function getDocFromServer(ref: any) {
  // Mock for linting, actual implementation should come from firebase/firestore
  return Promise.resolve({ exists: () => false, data: () => null });
}
