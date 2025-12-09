/**
 * Memory API integration functions
 * Handles all memory-related API calls to the backend
 */

import { apiRequest, queryClient } from "./queryClient";
import { getUserId } from "./userId";

export interface Memory {
  memoryId: string;
  profileId: string;
  userId: string;
  memoryDate: string;
  fileUrl?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMemoryRequest {
  profileId: string;
  userId: string;
  memoryDate: string;
  title?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryRequest {
  profileId?: string;
  userId?: string;
  memoryDate?: string;
  title?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Get all memories
 */
export async function getAllMemories(): Promise<Memory[]> {
  const response = await apiRequest("GET", "/api/v1/memories");
  return response.json();
}

/**
 * Get memory by memoryId
 */
export async function getMemoryByMemoryId(memoryId: string): Promise<Memory> {
  const response = await apiRequest("GET", `/api/v1/memories/${memoryId}`);
  return response.json();
}

/**
 * Get memories by profileId
 */
export async function getMemoriesByProfileId(
  profileId: string,
): Promise<Memory[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/memories/profile/${profileId}`,
  );
  return response.json();
}

/**
 * Get memories by profileId with date range
 */
export async function getMemoriesByProfileIdAndDateRange(
  profileId: string,
  startDate: string,
  endDate: string,
): Promise<Memory[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/memories/profile/${profileId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return response.json();
}

/**
 * Create a new memory
 */
export async function createMemory(
  data: Omit<CreateMemoryRequest, "userId">,
  file?: File | null,
): Promise<Memory> {
  const userId = getUserId();

  const requestData: CreateMemoryRequest = {
    profileId: data.profileId,
    userId,
    memoryDate: data.memoryDate,
    title: data.title,
    description: data.description,
    tags: data.tags,
    metadata: data.metadata,
  };

  // JSON stringify the request, then wrap in quotes (backend expects a JSON string)
  // The request parameter should be: "{\"profileId\":\"...\",...}"
  const requestJson = JSON.stringify(requestData);
  // Manually wrap in quotes and escape inner quotes to match backend expectation
  const requestString = `"${requestJson.replace(/"/g, '\\"')}"`;
  const encodedRequest = encodeURIComponent(requestString);

  // Build URL with request query parameter
  const url = `/api/v1/memories?request=${encodedRequest}`;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }

  // Use fetch directly for multipart/form-data - proxy handles the path
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  const result = await response.json();

  // Invalidate memories queries
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories/profile/${data.profileId}`],
  });
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories`],
  });

  return result;
}

/**
 * Update memory
 */
export async function updateMemory(
  memoryId: string,
  data: UpdateMemoryRequest,
  file?: File | null,
): Promise<Memory> {
  // JSON stringify the request, then wrap in quotes (backend expects a JSON string)
  // The request parameter should be: "{\"profileId\":\"...\",...}"
  const requestJson = JSON.stringify(data);
  // Manually wrap in quotes and escape inner quotes to match backend expectation
  const requestString = `"${requestJson.replace(/"/g, '\\"')}"`;
  const encodedRequest = encodeURIComponent(requestString);

  // Build URL with request query parameter
  const url = `/api/v1/memories/${memoryId}?request=${encodedRequest}`;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }

  // Use fetch directly for multipart/form-data - proxy handles the path
  const response = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  const result = await response.json();

  // Invalidate memories queries
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories/${memoryId}`],
  });
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories`],
  });

  return result;
}

/**
 * Update file in existing memory
 */
export async function updateMemoryFile(
  memoryId: string,
  file: File,
): Promise<Memory> {
  const formData = new FormData();
  formData.append("file", file);

  // Use fetch directly for multipart/form-data - proxy handles the path
  const url = `/api/v1/memories/${memoryId}/file`;
  const response = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  const result = await response.json();

  // Invalidate memories queries
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories/${memoryId}`],
  });
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories`],
  });

  return result;
}

/**
 * Delete memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  await apiRequest("DELETE", `/api/v1/memories/${memoryId}`);

  // Invalidate memories queries
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories/${memoryId}`],
  });
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/memories`],
  });
}

/**
 * Check if memory exists by memoryId
 */
export async function checkMemoryExists(memoryId: string): Promise<boolean> {
  try {
    const response = await apiRequest(
      "GET",
      `/api/v1/memories/exists/${memoryId}`,
    );
    const result = await response.json();
    // API returns an object with exists property or similar structure
    return result.exists === true || result === true;
  } catch {
    return false;
  }
}
