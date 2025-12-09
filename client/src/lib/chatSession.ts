/**
 * Chat session ID management utility
 * Stores and retrieves session ID from cookies for maintaining chat context
 */

const SESSION_ID_COOKIE_NAME = "nurture_chat_session_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Gets the session ID from cookie
 */
export function getSessionId(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SESSION_ID_COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Sets the session ID in a cookie
 */
export function setSessionId(sessionId: string): void {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  document.cookie = `${SESSION_ID_COOKIE_NAME}=${encodeURIComponent(sessionId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clears the session ID cookie
 */
export function clearSessionId(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SESSION_ID_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
