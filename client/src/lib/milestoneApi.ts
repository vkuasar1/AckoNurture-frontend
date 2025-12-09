/**
 * Milestone API integration functions
 * Handles all milestone-related API calls to the backend
 */

import { apiRequest, queryClient } from "./queryClient";
import { getUserId } from "./userId";

// Types based on API schema
export interface Milestone {
  id: string;
  milestoneId: string;
  ageRangeLabel: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  items: MilestoneItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MilestoneItem {
  id: string;
  category: string;
  label: string;
  icon?: string;
  ageMinMonths: number;
  ageMaxMonths: number;
}

export interface BabyMilestoneSchedule {
  id: string;
  babyId: string;
  userId: string;
  milestoneId: string;
  milestoneItemId: string;
  category: string;
  label: string;
  icon?: string;
  ageRangeLabel: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  expectedDate: string;
  status: "PENDING" | "ACHIEVED" | "OVERDUE";
  achievedDate?: string;
  imageUrl?: string;
}

export interface MilestoneReport {
  id?: string;
  reportId?: string;
  babyId: string;
  userId: string;
  milestoneId: string;
  status: "ACHIEVED" | "NOT_ACHIEVED" | "IN_PROGRESS";
  notes?: string;
  imageUrl?: string;
  reportedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MilestoneReportRequest {
  milestoneId: string;
  status: "ACHIEVED" | "NOT_ACHIEVED" | "IN_PROGRESS";
  notes?: string;
}

export interface MilestoneProfileResult {
  profileType: string;
  ratio: number;
  categoryRatios: Record<string, number>;
  recommendedActivities: string[];
  actionItems: string[];
}

/**
 * Get all milestones
 */
export async function getAllMilestones(): Promise<Milestone[]> {
  const response = await apiRequest("GET", "/api/v1/milestones");
  return response.json();
}

/**
 * Get milestone by milestoneId
 * Note: Using milestone-id endpoint as specified
 */
export async function getMilestoneByMilestoneId(milestoneId: string): Promise<Milestone> {
  const response = await apiRequest("GET", `/api/v1/milestones/milestone-id/${milestoneId}`);
  return response.json();
}

/**
 * Get milestones by age in months
 */
export async function getMilestonesByAge(ageInMonths: number): Promise<Milestone[]> {
  const response = await apiRequest("GET", `/api/v1/milestones/age/${ageInMonths}`);
  return response.json();
}

/**
 * Get milestone schedules for a baby
 */
export async function getMilestoneSchedulesByBabyId(babyId: string): Promise<BabyMilestoneSchedule[]> {
  const response = await apiRequest("GET", `/api/v1/milestone-schedules/baby/${babyId}`);
  return response.json();
}

/**
 * Get milestone schedules by babyId and status
 */
export async function getMilestoneSchedulesByBabyIdAndStatus(
  babyId: string,
  status: "PENDING" | "ACHIEVED" | "OVERDUE"
): Promise<BabyMilestoneSchedule[]> {
  const response = await apiRequest("GET", `/api/v1/milestone-schedules/baby/${babyId}/status/${status}`);
  return response.json();
}

/**
 * Generate milestone schedule from DOB
 */
export async function generateMilestoneSchedule(babyId: string): Promise<void> {
  const response = await apiRequest("POST", `/api/v1/milestone-schedules/generate/${babyId}`);
  await response.json();
  
  // Invalidate schedules query
  queryClient.invalidateQueries({ queryKey: [`/api/v1/milestone-schedules/baby/${babyId}`] });
}

/**
 * Mark milestone schedule as achieved
 */
export async function markMilestoneAsAchieved(
  scheduleId: string,
  achievedDate?: string,
  imageFile?: File
): Promise<BabyMilestoneSchedule> {
  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile);
  }
  
  const url = achievedDate
    ? `/api/v1/milestone-schedules/${scheduleId}/achieve?achievedDate=${encodeURIComponent(achievedDate)}`
    : `/api/v1/milestone-schedules/${scheduleId}/achieve`;
  
  const response = await apiRequest("POST", url, formData);
  const result = await response.json();
  
  // Invalidate schedules query - we need babyId to invalidate properly
  // This will be handled by the caller
  queryClient.invalidateQueries({ queryKey: [`/api/v1/milestone-schedules`] });
  
  return result;
}

/**
 * Update milestone schedule statuses
 */
export async function updateMilestoneStatuses(babyId: string): Promise<void> {
  const response = await apiRequest("POST", `/api/v1/milestone-schedules/baby/${babyId}/update-status`);
  await response.json();
  
  // Invalidate schedules query
  queryClient.invalidateQueries({ queryKey: [`/api/v1/milestone-schedules/baby/${babyId}`] });
}

/**
 * Get milestone reports for a baby
 */
export async function getMilestoneReports(babyId: string): Promise<MilestoneReport[]> {
  const response = await apiRequest("GET", `/api/v1/babies/${babyId}/milestone-reports`);
  return response.json();
}

/**
 * Submit milestone report (JSON only)
 */
export async function submitMilestoneReport(
  babyId: string,
  report: MilestoneReportRequest
): Promise<MilestoneReport> {
  const userId = getUserId();
  const response = await apiRequest(
    "POST",
    `/api/v1/babies/${babyId}/milestone-reports?userId=${userId}`,
    report
  );
  const result = await response.json();
  
  // Invalidate reports query
  queryClient.invalidateQueries({ queryKey: [`/api/v1/babies/${babyId}/milestone-reports`] });
  
  return result;
}

/**
 * Submit milestone report with image
 */
export async function submitMilestoneReportWithImage(
  babyId: string,
  report: MilestoneReportRequest,
  imageFile?: File
): Promise<MilestoneReport> {
  const userId = getUserId();
  
  // If no image, use the JSON-only endpoint
  if (!imageFile) {
    return submitMilestoneReport(babyId, report);
  }
  
  const formData = new FormData();
  
  // Convert report to JSON string for multipart form
  formData.append("report", JSON.stringify(report));
  formData.append("image", imageFile);
  
  const response = await apiRequest(
    "POST",
    `/api/v1/babies/${babyId}/milestone-reports/with-image?userId=${userId}`,
    formData
  );
  const result = await response.json();
  
  // Invalidate reports query
  queryClient.invalidateQueries({ queryKey: [`/api/v1/babies/${babyId}/milestone-reports`] });
  
  return result;
}

/**
 * Get milestone report by reportId
 */
export async function getMilestoneReportById(reportId: string): Promise<MilestoneReport> {
  const response = await apiRequest("GET", `/api/v1/milestone-reports/${reportId}`);
  return response.json();
}

/**
 * Delete milestone report
 */
export async function deleteMilestoneReport(reportId: string): Promise<void> {
  await apiRequest("DELETE", `/api/v1/milestone-reports/${reportId}`);
  
  // Invalidate reports query
  queryClient.invalidateQueries({ queryKey: [`/api/v1/milestone-reports`] });
}

/**
 * Get milestone profile for a baby
 */
export async function getMilestoneProfile(babyId: string): Promise<MilestoneProfileResult> {
  const response = await apiRequest("GET", `/api/v1/babies/${babyId}/milestone-profile`);
  return response.json();
}

