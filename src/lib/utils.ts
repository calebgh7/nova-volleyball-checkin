import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  // Handle date string properly to avoid timezone issues
  const [year, month, day] = date.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
}

export function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateTime: string) {
  return new Date(dateTime).toLocaleString();
}

export function isWaiverExpired(expirationDate?: string): boolean {
  if (!expirationDate) return false;
  return new Date(expirationDate) <= new Date();
}

export function getWaiverStatus(hasValidWaiver: boolean, expirationDate?: string) {
  if (!hasValidWaiver) return { status: 'none', color: 'bg-red-100 text-red-800' };
  if (isWaiverExpired(expirationDate)) return { status: 'expired', color: 'bg-red-100 text-red-800' };
  return { status: 'valid', color: 'bg-green-100 text-green-800' };
}
