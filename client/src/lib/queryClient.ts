import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getUserId } from "./userId";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const IS_DEV = import.meta.env.DEV;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Builds the full API URL
 * In development, uses relative URLs to leverage Vite proxy
 * In production, uses VITE_API_BASE_URL if set
 */
function buildApiUrl(path: string): string {
  // If path already starts with http, return as is
  if (path.startsWith("http")) {
    return path;
  }
  
  // In development, use relative URLs to leverage Vite proxy
  if (IS_DEV) {
    // Ensure path starts with /
    return path.startsWith("/") ? path : `/${path}`;
  }
  
  // In production, use API_BASE_URL if provided
  if (API_BASE_URL) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    // Ensure API_BASE_URL doesn't end with slash
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Fallback: return relative URL
  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildApiUrl(url);
  
  const isFormData = data instanceof FormData;
  const headers: HeadersInit = isFormData
    ? {} // Let browser set Content-Type with boundary for FormData
    : {
        "Content-Type": "application/json",
      };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    const fullUrl = buildApiUrl(path);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
