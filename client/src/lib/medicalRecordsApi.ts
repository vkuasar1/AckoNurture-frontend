/**
 * Medical Records API integration functions
 * Handles all medical records-related API calls to the backend
 */

import { apiRequest } from "./queryClient";
import { getUserId } from "./userId";

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  uploadDate: string;
}

export interface MedicalRecord {
  recordId: string;
  profileId: string;
  userId: string;
  recordType: string;
  category: string;
  recordDate: string;
  fileUrls?: string[] | null;
  fileAttachments?: FileAttachment[] | null;
  data?: Record<string, unknown> | null;
  title: string;
  description?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;
  diagnosis?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalRecordRequest {
  profileId: string;
  userId: string;
  recordType: string;
  category: string;
  recordDate: string;
  title: string;
  description?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;
  diagnosis?: string | null;
  tags?: string[] | null;
}

export interface UpdateMedicalRecordRequest {
  profileId?: string;
  userId?: string;
  recordType?: string;
  category?: string;
  recordDate?: string;
  title?: string;
  description?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;
  diagnosis?: string | null;
  tags?: string[] | null;
}

/**
 * Get all medical records
 */
export async function getAllMedicalRecords(): Promise<MedicalRecord[]> {
  const response = await apiRequest("GET", "/api/v1/medical-records");
  return response.json();
}

/**
 * Get medical record by recordId
 */
export async function getMedicalRecordByRecordId(
  recordId: string,
): Promise<MedicalRecord> {
  const response = await apiRequest(
    "GET",
    `/api/v1/medical-records/${recordId}`,
  );
  return response.json();
}

/**
 * Get medical records by profileId
 */
export async function getMedicalRecordsByProfileId(
  profileId: string,
): Promise<MedicalRecord[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/medical-records/profile/${profileId}`,
  );
  return response.json();
}

/**
 * Get medical records by profileId with date range
 */
export async function getMedicalRecordsByProfileIdAndDateRange(
  profileId: string,
  startDate: string,
  endDate: string,
): Promise<MedicalRecord[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/medical-records/profile/${profileId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );
  return response.json();
}

/**
 * Create a new medical record
 */
export async function createMedicalRecord(
  data: Omit<CreateMedicalRecordRequest, "userId">,
  files?: File[] | null,
): Promise<MedicalRecord> {
  const userId = getUserId();

  const requestData: CreateMedicalRecordRequest = {
    profileId: data.profileId,
    userId,
    recordType: data.recordType,
    category: data.category,
    recordDate: data.recordDate,
    title: data.title,
    description: data.description ?? null,
    doctorName: data.doctorName ?? null,
    hospitalName: data.hospitalName ?? null,
    diagnosis: data.diagnosis ?? null,
    tags: data.tags ?? null,
  };

  // JSON stringify the request, then wrap in quotes (backend expects a JSON string)
  // The request parameter should be: "{\"profileId\":\"...\",...}"
  const requestJson = JSON.stringify(requestData);
  // Manually wrap in quotes and escape inner quotes to match backend expectation
  const requestString = `"${requestJson.replace(/"/g, '\\"')}"`;
  const encodedRequest = encodeURIComponent(requestString);

  // Build URL with request query parameter
  const url = `/api/v1/medical-records?request=${encodedRequest}`;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file);
    });
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

  return response.json();
}

/**
 * Update medical record
 */
export async function updateMedicalRecord(
  recordId: string,
  data: Omit<UpdateMedicalRecordRequest, "userId">,
  files?: File[] | null,
): Promise<MedicalRecord> {
  const userId = getUserId();

  const requestData: UpdateMedicalRecordRequest = {
    profileId: data.profileId,
    userId,
    recordType: data.recordType,
    category: data.category,
    recordDate: data.recordDate,
    title: data.title,
    description: data.description ?? null,
    doctorName: data.doctorName ?? null,
    hospitalName: data.hospitalName ?? null,
    diagnosis: data.diagnosis ?? null,
    tags: data.tags ?? null,
  };

  // JSON stringify the request, then wrap in quotes
  const requestJson = JSON.stringify(requestData);
  const requestString = `"${requestJson.replace(/"/g, '\\"')}"`;
  const encodedRequest = encodeURIComponent(requestString);

  // Build URL with request query parameter
  const url = `/api/v1/medical-records/${recordId}?request=${encodedRequest}`;

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
 * Delete medical record
 */
export async function deleteMedicalRecord(recordId: string): Promise<void> {
  await apiRequest("DELETE", `/api/v1/medical-records/${recordId}`);
}

/**
 * Add files to medical record
 */
export async function addFilesToMedicalRecord(
  recordId: string,
  files: File[],
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/v1/medical-records/${recordId}/files`, {
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
 * Remove file from medical record
 */
export async function removeFileFromMedicalRecord(
  recordId: string,
  fileUrl: string,
): Promise<void> {
  await apiRequest(
    "DELETE",
    `/api/v1/medical-records/${recordId}/files?fileUrl=${encodeURIComponent(fileUrl)}`,
  );
}

/**
 * Check if medical record exists
 */
export async function checkMedicalRecordExists(
  recordId: string,
): Promise<boolean> {
  const response = await apiRequest(
    "GET",
    `/api/v1/medical-records/exists/${recordId}`,
  );
  const result = await response.json();
  return result.exists === true;
}
