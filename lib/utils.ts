import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const year = date.getFullYear();

  const time = date.toLocaleString("en-US", {
    hour: "numeric", // removed leading zero
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year} - ${time}`;
}

export function getAuthToken(): string | null {
  // Try localStorage first
  const tokenFromLocal = localStorage.getItem("authToken");
  if (tokenFromLocal) return tokenFromLocal;

  // Check cookies
  const match = document.cookie.match(/authToken=([^;]+)/);
  if (match) return match[1];

  return null;
}
