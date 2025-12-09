// Reminder settings store for vaccine notifications
// In production, this would sync with backend/push notification service

export interface ReminderSettings {
  globalRemindersEnabled: boolean;
  callRemindersEnabled: boolean;
  notificationRemindersEnabled: boolean;
  reminderDaysBefore: number; // Default 2 days before
  disabledVaccineIds: string[]; // Vaccines with individual reminders disabled
}

const REMINDER_STORAGE_KEY = "babycare_reminder_settings";

const DEFAULT_SETTINGS: ReminderSettings = {
  globalRemindersEnabled: true,
  callRemindersEnabled: true,
  notificationRemindersEnabled: true,
  reminderDaysBefore: 2,
  disabledVaccineIds: [],
};

export function getReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to parse reminder settings:", e);
  }

  return DEFAULT_SETTINGS;
}

export function setReminderSettings(settings: Partial<ReminderSettings>): void {
  if (typeof window === "undefined") return;

  const current = getReminderSettings();
  const updated = { ...current, ...settings };

  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save reminder settings:", e);
  }
}

export function toggleVaccineReminder(
  vaccineId: string,
  enabled: boolean,
): void {
  const settings = getReminderSettings();
  let disabledIds = [...settings.disabledVaccineIds];

  if (enabled) {
    // Remove from disabled list
    disabledIds = disabledIds.filter((id) => id !== vaccineId);
  } else {
    // Add to disabled list
    if (!disabledIds.includes(vaccineId)) {
      disabledIds.push(vaccineId);
    }
  }

  setReminderSettings({ disabledVaccineIds: disabledIds });
}

export function isVaccineReminderEnabled(vaccineId: string): boolean {
  const settings = getReminderSettings();
  return (
    settings.globalRemindersEnabled &&
    !settings.disabledVaccineIds.includes(vaccineId)
  );
}

// Helper to format reminder message
export function getReminderMessage(
  vaccineName: string,
  daysUntilDue: number,
): string {
  if (daysUntilDue === 0) {
    return `${vaccineName} is due today!`;
  } else if (daysUntilDue === 1) {
    return `${vaccineName} is due tomorrow!`;
  } else if (daysUntilDue > 0) {
    return `${vaccineName} is due in ${daysUntilDue} days`;
  } else {
    return `${vaccineName} is overdue by ${Math.abs(daysUntilDue)} days`;
  }
}
