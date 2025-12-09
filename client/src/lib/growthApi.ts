/**
 * Growth API integration functions
 * Handles all growth-related API calls to the backend
 */

import { apiRequest } from "./queryClient";
import { getUserId } from "./userId";

export interface DocumentAttachment {
  fileName: string;
  documentUrl: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  uploadDate: string;
}

export interface BabyGrowth {
  growthId: string;
  profileId: string;
  userId: string;
  measurementDate: string;
  height?: number | null;
  weight?: number | null;
  headCircumference?: number | null;
  bmi?: number | null;
  ageInDays?: number | null;
  notes?: string | null;
  documentUrls?: string[] | null;
  documentAttachments?: DocumentAttachment[] | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGrowthRequest {
  profileId: string;
  userId: string;
  measurementDate: string;
  height?: number | null;
  weight?: number | null;
  headCircumference?: number | null;
  notes?: string | null;
}

export interface UpdateGrowthRequest {
  profileId?: string;
  userId?: string;
  measurementDate?: string;
  height?: number | null;
  weight?: number | null;
  headCircumference?: number | null;
  notes?: string | null;
}

/**
 * Get all growth records
 */
export async function getAllGrowth(): Promise<BabyGrowth[]> {
  const response = await apiRequest("GET", "/api/v1/baby-growth");
  return response.json();
}

/**
 * Get growth record by growthId
 */
export async function getGrowthByGrowthId(
  growthId: string,
): Promise<BabyGrowth> {
  const response = await apiRequest("GET", `/api/v1/baby-growth/${growthId}`);
  return response.json();
}

/**
 * Get growth records by profileId
 */
export async function getGrowthByProfileId(
  profileId: string,
): Promise<BabyGrowth[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/baby-growth/profile/${profileId}`,
  );
  return response.json();
}

/**
 * Get growth records by profileId with date range
 */
export async function getGrowthByProfileIdAndDateRange(
  profileId: string,
  startDate: string,
  endDate: string,
): Promise<BabyGrowth[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/baby-growth/profile/${profileId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return response.json();
}

/**
 * Create a new growth record
 */
export async function createGrowth(
  data: Omit<CreateGrowthRequest, "userId">,
): Promise<BabyGrowth> {
  const userId = getUserId();

  const requestData: CreateGrowthRequest = {
    profileId: data.profileId,
    userId,
    measurementDate: data.measurementDate,
    height: data.height ?? null,
    weight: data.weight ?? null,
    headCircumference: data.headCircumference ?? null,
    notes: data.notes ?? null,
  };

  const response = await apiRequest("POST", "/api/v1/baby-growth", requestData);
  return response.json();
}

/**
 * Update growth record
 */
export async function updateGrowth(
  growthId: string,
  data: Omit<UpdateGrowthRequest, "userId">,
  files?: File[] | null,
): Promise<BabyGrowth> {
  const userId = getUserId();

  const requestData: UpdateGrowthRequest = {
    profileId: data.profileId,
    userId,
    measurementDate: data.measurementDate,
    height: data.height,
    weight: data.weight,
    headCircumference: data.headCircumference,
    notes: data.notes,
  };

  // JSON stringify the request, then wrap in quotes
  const requestJson = JSON.stringify(requestData);
  const requestString = `"${requestJson.replace(/"/g, '\\"')}"`;
  const encodedRequest = encodeURIComponent(requestString);

  // Build URL with request query parameter
  const url = `/api/v1/baby-growth/${growthId}?request=${encodedRequest}`;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  // Use fetch directly for multipart/form-data
  const response = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Delete growth record
 */
export async function deleteGrowth(growthId: string): Promise<void> {
  await apiRequest("DELETE", `/api/v1/baby-growth/${growthId}`);
}

/**
 * Add files to growth record
 */
export async function addFilesToGrowth(
  growthId: string,
  files: File[],
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/v1/baby-growth/${growthId}/files`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }
}

/**
 * Check if growth record exists
 */
export async function checkGrowthExists(growthId: string): Promise<boolean> {
  const response = await apiRequest(
    "GET",
    `/api/v1/baby-growth/exists/${growthId}`,
  );
  const result = await response.json();
  return result.exists === true;
}
