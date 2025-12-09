/**
 * User ID management utility
 * Generates and stores a UUID in a cookie for user identification
 */

const USER_ID_COOKIE_NAME = "nurture_user_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets the userId from cookie or generates a new one
 */
export function getUserId(): string {
  // Check if userId exists in cookie
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === USER_ID_COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }

  // Generate new userId
  const newUserId = generateUUID();
  setUserId(newUserId);
  return newUserId;
}

/**
 * Sets the userId in a cookie
 */
export function setUserId(userId: string): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  document.cookie = `${USER_ID_COOKIE_NAME}=${encodeURIComponent(userId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Initializes userId on app startup
 * Should be called once when the app loads
 */
export function initializeUserId(): string {
  return getUserId();
}

