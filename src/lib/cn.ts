import clsx, { type ClassValue } from 'clsx';

/** The only class-composition helper allowed in this project (keeps Aurora utilities readable). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
