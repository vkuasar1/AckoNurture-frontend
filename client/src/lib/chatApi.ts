/**
 * Chat API integration functions
 * Handles all chat-related API calls to the backend
 */

import { apiRequest } from "./queryClient";
import { getSessionId, setSessionId, clearSessionId } from "./chatSession";

export interface ChatRequest {
  userMessage: string;
  sessionId?: string;
}

export interface ServiceCard {
  type: string;
  title: string;
  cta: string;
}

export interface ParsedChatResponse {
  summary: string;
  redFlags?: string[];
  homeSteps?: string[];
  serviceCards?: ServiceCard[];
  disclaimer?: string;
}

export interface ChatResponse {
  userMessage: string;
  response: string; // JSON string that needs to be parsed
  sessionId: string;
  status: string;
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(
  userMessage: string,
): Promise<ChatResponse & { parsedResponse?: ParsedChatResponse }> {
  const sessionId = getSessionId();

  const requestBody: ChatRequest = {
    userMessage,
  };

  // Include sessionId if available to maintain context
  if (sessionId) {
    requestBody.sessionId = sessionId;
  }

  const response = await apiRequest("POST", "/api/v1/openai/chat", requestBody);
  const result: ChatResponse = await response.json();

  // Store sessionId from response if provided (first message)
  if (result.sessionId) {
    setSessionId(result.sessionId);
  }

  // Parse the response field (it's a JSON string)
  let parsedResponse: ParsedChatResponse | undefined;
  try {
    if (result.response) {
      parsedResponse = JSON.parse(result.response) as ParsedChatResponse;
    }
  } catch (error) {
    console.error("Error parsing chat response:", error);
  }

  return {
    ...result,
    parsedResponse,
  };
}

/**
 * Clear conversation history for the current session
 */
export async function clearChatSession(): Promise<void> {
  const sessionId = getSessionId();

  if (!sessionId) {
    return;
  }

  await apiRequest("DELETE", `/api/v1/openai/chat/session/${sessionId}`);

  // Clear the session ID from cookies
  clearSessionId();
}
