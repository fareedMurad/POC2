/**
 * Presentation Data Storage Utility
 * Manages presentation data persistence across pages
 */

import { PresentationData } from "./apiServices";

const STORAGE_KEY = "praktice_presentation_data";

export interface StoredPresentationData extends PresentationData {
  presentationId?: string;
  objectives?: string[];
  createdAt?: Date;
}

/**
 * Save presentation data to localStorage
 */
export function savePresentationData(data: StoredPresentationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving presentation data:", error);
  }
}

/**
 * Get presentation data from localStorage
 */
export function getPresentationData(): StoredPresentationData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error retrieving presentation data:", error);
    return null;
  }
}

/**
 * Clear presentation data from localStorage
 */
export function clearPresentationData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing presentation data:", error);
  }
}

/**
 * Update presentation data with additional fields (like presentationId, objectives)
 */
export function updatePresentationData(
  updates: Partial<StoredPresentationData>
): void {
  try {
    const currentData = getPresentationData();
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      savePresentationData(updatedData);
    }
  } catch (error) {
    console.error("Error updating presentation data:", error);
  }
}

/**
 * Generate a unique presentation ID
 */
export function generatePresentationId(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${randomStr}`;
}

/**
 * Get presentation data by ID from localStorage
 * For now, we store one presentation at a time, but this can be extended to support multiple
 */
export function getPresentationById(
  presentationId: string
): StoredPresentationData | null {
  try {
    const data = getPresentationData();
    if (data && data.presentationId === presentationId) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving presentation by ID:", error);
    return null;
  }
}
