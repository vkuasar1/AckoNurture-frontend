// Caregiver profile state management using localStorage

export interface CaregiverProfile {
  name: string;
  relationship: "mother" | "father" | "caregiver";
  weeksPostpartum?: number;
  setupCompleted: boolean;
  setupDate?: string;
}

const STORAGE_KEY = "nurture_caregiver_profile";

export function getCaregiverProfile(): CaregiverProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading caregiver profile:", e);
  }
  return null;
}

export function saveCaregiverProfile(profile: CaregiverProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving caregiver profile:", e);
  }
}

export function clearCaregiverProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing caregiver profile:", e);
  }
}

export function isCaregiverSetupComplete(): boolean {
  const profile = getCaregiverProfile();
  return profile?.setupCompleted === true;
}
