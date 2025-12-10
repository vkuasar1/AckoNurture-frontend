/**
 * Vaccines API integration functions
 * Handles all vaccine-related API calls to the backend
 */

import { apiRequest } from "./queryClient";
import type { Vaccine } from "@shared/schema";

export interface MarkVaccineCompleteRequest {
  id: string;
  completedDate: string;
  file?: File | null;
}

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

/**
 * Mark a vaccine as complete
 * Supports optional file upload for proof
 */
export async function markVaccineComplete(
  data: MarkVaccineCompleteRequest,
): Promise<void> {
  const url = `/api/v1/vaccines/${data.id}/complete?completedDate=${data.completedDate}`;

  if (data.file) {
    // Validate file has content
    if (data.file.size === 0) {
      throw new Error(
        "Selected file is empty. Please choose a different file.",
      );
    }

    const formData = new FormData();
    formData.append("proofFile", data.file, data.file.name);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text}`);
    }
  } else {
    // JSON request with empty body (completedDate is in query param)
    await apiRequest("POST", url, {});
  }
}
