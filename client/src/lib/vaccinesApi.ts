/**
 * Vaccines API integration functions
 * Handles all vaccine-related API calls to the backend
 */

import { apiRequest } from "./queryClient";
import type { Vaccine } from "@shared/schema";

/**
 * Get vaccines by baby profile ID
 * If no vaccines are found and the baby has a DOB, attempts to generate a schedule
 */
export async function getVaccinesByBabyId(
  babyProfileId: string,
  babyDob?: string | null,
): Promise<Vaccine[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/vaccines/baby/${babyProfileId}`,
  );
  const vaccines = await response.json();

  // If no vaccines found and baby has DOB, try to generate schedule
  if (vaccines.length === 0 && babyDob) {
    try {
      const generateResponse = await apiRequest(
        "POST",
        `/api/v1/vaccines/generate/${babyProfileId}`,
      );
      if (generateResponse.ok) {
        // Refetch vaccines after generation
        const newResponse = await apiRequest(
          "GET",
          `/api/v1/vaccines/baby/${babyProfileId}`,
        );
        return newResponse.json();
      }
    } catch (error) {
      // If generation fails, just return empty array
      console.error("Failed to generate vaccine schedule:", error);
    }
  }

  return vaccines;
}

/**
 * Get upcoming vaccines for reminders
 */
export async function getUpcomingVaccines(
  babyProfileId: string,
  limit?: number,
): Promise<Vaccine[]> {
  const url = limit
    ? `/api/v1/vaccines/baby/${babyProfileId}/reminders/upcoming?limit=${limit}`
    : `/api/v1/vaccines/baby/${babyProfileId}/reminders/upcoming`;
  const response = await apiRequest("GET", url);
  return response.json();
}
