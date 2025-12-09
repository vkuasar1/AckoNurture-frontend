/**
 * Profile API integration functions
 * Handles all profile-related API calls to the backend
 */

import { apiRequest, queryClient } from "./queryClient";
import { getUserId } from "./userId";

export interface Profile {
  id: string;
  profileId: string;
  userId: string;
  type: "mother" | "father" | "caregiver" | "baby";
  name: string;
  dob?: string | null;
  gender?: "M" | "F" | null;
  imageUrl?: string | null;
  onboardingType?: string | null;
  guardianProfileId?: string | null;
  pincode?: string | null;
  metadata?: Record<string, unknown> | null;
  milestoneProfileType?: string | null;
  milestoneScoreRatio?: number | null;
  milestoneCategoryRatios?: Record<string, number> | null;
  milestoneScoreUpdatedAt?: string | null;
  createdAt?: string;
}

export interface OnboardingRequest {
  parentName: string;
  parentType: "mother" | "father" | "caregiver";
  userId: string;
  parentPincode?: string;
  babyName: string;
  babyDob: string;
  babyGender: "M" | "F";
  babyPincode?: string;
  hospitalName?: string;
}

export interface CreateProfileRequest {
  userId: string;
  type: "mother" | "father" | "caregiver" | "baby";
  name: string;
  dob?: string;
  gender?: "boy" | "girl";
  imageUrl?: string;
  onboardingType?: string;
  guardianProfileId?: string;
  pincode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Get all profiles for the current user
 */
export async function getProfiles(): Promise<Profile[]> {
  const userId = getUserId();
  const response = await apiRequest("GET", `/api/v1/profiles/user/${userId}`);
  return response.json();
}

/**
 * Get profiles by type for the current user
 */
export async function getProfilesByType(
  type: "mother" | "father" | "caregiver" | "baby",
): Promise<Profile[]> {
  const userId = getUserId();
  const response = await apiRequest(
    "GET",
    `/api/v1/profiles/user/${userId}/type/${type}`,
  );
  return response.json();
}

/**
 * Create parent and baby profiles together (onboarding)
 */
export async function onboardParentAndBaby(
  data: Omit<OnboardingRequest, "userId">,
): Promise<{ parent: Profile; baby: Profile }> {
  const userId = getUserId();
  // Explicitly construct requestData to ensure profileId is never included
  const requestData: OnboardingRequest = {
    userId,
    parentName: data.parentName,
    parentType: data.parentType,
    parentPincode: data.parentPincode,
    babyName: data.babyName,
    babyDob: data.babyDob,
    babyGender: data.babyGender,
    babyPincode: data.babyPincode,
    hospitalName: data.hospitalName,
  };
  const response = await apiRequest(
    "POST",
    "/api/v1/profiles/onboard",
    requestData,
  );
  const result = await response.json();

  // Invalidate profiles query
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/profiles/user/${userId}`],
  });

  return result;
}

/**
 * Create a single profile
 */
export async function createProfile(
  data: Omit<CreateProfileRequest, "userId">,
): Promise<Profile> {
  const userId = getUserId();
  // Explicitly construct requestData to ensure profileId is never included
  const requestData: CreateProfileRequest = {
    userId,
    type: data.type,
    name: data.name,
    dob: data.dob,
    gender: data.gender,
    imageUrl: data.imageUrl,
    onboardingType: data.onboardingType,
    guardianProfileId: data.guardianProfileId,
    pincode: data.pincode,
    metadata: data.metadata,
  };
  const response = await apiRequest("POST", "/api/v1/profiles", requestData);
  const profile = await response.json();

  // Invalidate profiles query
  queryClient.invalidateQueries({
    queryKey: [`/api/v1/profiles/user/${userId}`],
  });

  return profile;
}

/**
 * Get profile by profileId
 */
export async function getProfileByProfileId(
  profileId: string,
): Promise<Profile> {
  const response = await apiRequest(
    "GET",
    `/api/v1/profiles/profile-id/${profileId}`,
  );
  return response.json();
}

/**
 * Get all babies for a guardian
 */
export async function getBabiesByGuardianProfileId(
  guardianProfileId: string,
): Promise<Profile[]> {
  const response = await apiRequest(
    "GET",
    `/api/v1/profiles/guardian/${guardianProfileId}/babies`,
  );
  return response.json();
}
