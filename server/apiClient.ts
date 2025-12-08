/**
 * Backend API Client
 * 
 * This client communicates with the backend API at http://13.232.37.184:8008
 * It replaces the MemStorage implementation with actual backend API calls.
 */

const BACKEND_BASE_URL = process.env.BACKEND_API_URL || "http://13.232.37.184:8008";
const API_VERSION = "/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const url = `${BACKEND_BASE_URL}${API_VERSION}${endpoint}`;
  
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  return await response.json();
}

/**
 * Profile API Client
 * Maps to backend /api/v1/profiles endpoints
 */
export const profileApi = {
  /**
   * Get all profiles
   */
  async getAll(): Promise<any[]> {
    return apiCall<any[]>("GET", "/profiles");
  },

  /**
   * Get profile by ID
   */
  async getById(id: string): Promise<any> {
    return apiCall<any>("GET", `/profiles/${id}`);
  },

  /**
   * Get profile by profileId (UUID)
   */
  async getByProfileId(profileId: string): Promise<any> {
    return apiCall<any>("GET", `/profiles/profile-id/${profileId}`);
  },

  /**
   * Get profiles by userId
   */
  async getByUserId(userId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/profiles/user/${userId}`);
  },

  /**
   * Get profiles by userId and type
   */
  async getByUserIdAndType(userId: string, type: "baby" | "mother"): Promise<any[]> {
    return apiCall<any[]>("GET", `/profiles/user/${userId}/type/${type}`);
  },

  /**
   * Get profiles by type
   */
  async getByType(type: "baby" | "mother"): Promise<any[]> {
    return apiCall<any[]>("GET", `/profiles/type/${type}`);
  },

  /**
   * Create profile (JSON only)
   */
  async create(profile: any): Promise<any> {
    return apiCall<any>("POST", "/profiles", profile);
  },

  /**
   * Create profile with image
   */
  async createWithImage(profile: any, imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append("profile", JSON.stringify(profile));
    formData.append("image", imageFile);

    const url = `${BACKEND_BASE_URL}${API_VERSION}/profiles/with-image`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  },

  /**
   * Update profile
   */
  async update(id: string, profile: Partial<any>): Promise<any> {
    return apiCall<any>("PUT", `/profiles/${id}`, profile);
  },

  /**
   * Update profile with image
   */
  async updateWithImage(id: string, profile: Partial<any>, imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append("profile", JSON.stringify(profile));
    formData.append("image", imageFile);

    const url = `${BACKEND_BASE_URL}${API_VERSION}/profiles/${id}/with-image`;
    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  },

  /**
   * Delete profile
   */
  async delete(id: string): Promise<void> {
    await apiCall<void>("DELETE", `/profiles/${id}`);
  },

  /**
   * Check if profile exists
   */
  async exists(profileId: string): Promise<boolean> {
    try {
      await apiCall<any>("GET", `/profiles/exists/${profileId}`);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Vaccine API Client
 * Maps to backend /api/v1/vaccines endpoints
 */
export const vaccineApi = {
  /**
   * Get all vaccines
   */
  async getAll(): Promise<any[]> {
    return apiCall<any[]>("GET", "/vaccines");
  },

  /**
   * Get vaccine by ID
   */
  async getById(id: string): Promise<any> {
    return apiCall<any>("GET", `/vaccines/${id}`);
  },

  /**
   * Get vaccines by babyId
   */
  async getByBabyId(babyId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/vaccines/baby/${babyId}`);
  },

  /**
   * Get vaccines by userId
   */
  async getByUserId(userId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/vaccines/user/${userId}`);
  },

  /**
   * Get vaccines by babyId and userId
   */
  async getByBabyIdAndUserId(babyId: string, userId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/vaccines/baby/${babyId}/user/${userId}`);
  },

  /**
   * Get vaccines by babyId and status
   */
  async getByBabyIdAndStatus(babyId: string, status: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/vaccines/baby/${babyId}/status/${status}`);
  },

  /**
   * Get vaccines needing reminder by babyId
   */
  async getNeedingReminderByBabyId(babyId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/vaccines/baby/${babyId}/reminders`);
  },

  /**
   * Create vaccine
   */
  async create(vaccine: any): Promise<any> {
    return apiCall<any>("POST", "/vaccines", vaccine);
  },

  /**
   * Update vaccine
   */
  async update(id: string, vaccine: Partial<any>): Promise<any> {
    return apiCall<any>("PUT", `/vaccines/${id}`, vaccine);
  },

  /**
   * Mark vaccine as completed
   */
  async markAsCompleted(vaccineId: string, completedDate?: string, proofFile?: File): Promise<any> {
    if (proofFile) {
      const formData = new FormData();
      formData.append("proofFile", proofFile);
      
      const url = `${BACKEND_BASE_URL}${API_VERSION}/vaccines/${vaccineId}/complete${completedDate ? `?completedDate=${completedDate}` : ""}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    }

    return apiCall<any>("POST", `/vaccines/${vaccineId}/complete${completedDate ? `?completedDate=${completedDate}` : ""}`, {});
  },

  /**
   * Generate vaccine schedule from DOB
   */
  async generateScheduleFromDOB(babyId: string): Promise<any> {
    return apiCall<any>("POST", `/vaccines/generate/${babyId}`);
  },

  /**
   * Generate vaccine schedule with DOB
   */
  async generateScheduleWithDOB(babyId: string, dob: string, userId?: string): Promise<any> {
    const query = userId ? `?userId=${userId}` : "";
    return apiCall<any>("POST", `/vaccines/generate/${babyId}/dob/${dob}${query}`);
  },

  /**
   * Update vaccine statuses for a baby
   */
  async updateStatuses(babyId: string): Promise<any> {
    return apiCall<any>("POST", `/vaccines/baby/${babyId}/update-status`);
  },

  /**
   * Delete vaccine
   */
  async delete(id: string): Promise<void> {
    await apiCall<void>("DELETE", `/vaccines/${id}`);
  },
};

/**
 * Plan API Client
 * Maps to backend /api/v1/plans endpoints
 */
export const planApi = {
  /**
   * Get all plans
   */
  async getAll(): Promise<any[]> {
    return apiCall<any[]>("GET", "/plans");
  },

  /**
   * Get plan by ID
   */
  async getById(id: string): Promise<any> {
    return apiCall<any>("GET", `/plans/${id}`);
  },

  /**
   * Get plan by planId
   */
  async getByPlanId(planId: string): Promise<any> {
    return apiCall<any>("GET", `/plans/plan-id/${planId}`);
  },

  /**
   * Get plans by category
   */
  async getByCategory(category: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/plans/category/${category}`);
  },

  /**
   * Search plans by name
   */
  async searchByName(name: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/plans/search?name=${encodeURIComponent(name)}`);
  },

  /**
   * Create plan
   */
  async create(plan: any): Promise<any> {
    return apiCall<any>("POST", "/plans", plan);
  },

  /**
   * Update plan
   */
  async update(id: string, plan: Partial<any>): Promise<any> {
    return apiCall<any>("PUT", `/plans/${id}`, plan);
  },

  /**
   * Delete plan
   */
  async delete(id: string): Promise<void> {
    await apiCall<void>("DELETE", `/plans/${id}`);
  },

  /**
   * Seed plans
   */
  async seed(): Promise<any> {
    return apiCall<any>("POST", "/plans/seed");
  },
};

/**
 * User Plan API Client
 * Maps to backend /api/v1/user-plans endpoints
 */
export const userPlanApi = {
  /**
   * Get all plans for user
   */
  async getUserPlans(userId: string): Promise<any[]> {
    return apiCall<any[]>("GET", `/user-plans/user/${userId}`);
  },

  /**
   * Get active plan for user
   */
  async getActivePlan(userId: string): Promise<any> {
    return apiCall<any>("GET", `/user-plans/user/${userId}/active`);
  },

  /**
   * Check service availability
   */
  async checkServiceAvailability(userId: string, serviceName: string): Promise<any> {
    return apiCall<any>("GET", `/user-plans/user/${userId}/service/${serviceName}/availability`);
  },

  /**
   * Assign plan to user
   */
  async assignPlan(data: any): Promise<any> {
    return apiCall<any>("POST", "/user-plans/assign", data);
  },

  /**
   * Consume service
   */
  async consumeService(data: any): Promise<any> {
    return apiCall<any>("POST", "/user-plans/consume", data);
  },

  /**
   * Deactivate user plan
   */
  async deactivatePlan(userPlanId: string): Promise<any> {
    return apiCall<any>("PUT", `/user-plans/${userPlanId}/deactivate`);
  },
};

/**
 * OpenAI Chat API Client
 * Maps to backend /api/v1/openai/chat endpoints
 */
export const chatApi = {
  /**
   * Chat with pediatric assistant
   */
  async chat(data: { message: string; sessionId?: string; [key: string]: any }): Promise<any> {
    return apiCall<any>("POST", "/openai/chat", data);
  },

  /**
   * Clear conversation history
   */
  async clearSession(sessionId: string): Promise<any> {
    return apiCall<any>("DELETE", `/openai/chat/session/${sessionId}`);
  },
};

/**
 * Helper function to map frontend baby profile to backend profile format
 */
export function mapBabyProfileToBackend(profile: any): any {
  return {
    profileId: profile.id,
    userId: profile.userId || "", // You may need to get this from session/auth
    type: "baby",
    name: profile.name,
    dob: profile.dob,
    gender: profile.gender,
    imageUrl: profile.photoUrl || null,
    onboardingType: profile.onboardingType || "d2c",
    metadata: {
      hospitalName: profile.hospitalName || null,
    },
  };
}

/**
 * Helper function to map backend profile to frontend baby profile format
 */
export function mapBackendToBabyProfile(profile: any): any {
  return {
    id: profile.profileId || profile.id,
    name: profile.name,
    dob: profile.dob,
    gender: profile.gender,
    photoUrl: profile.imageUrl || null,
    onboardingType: profile.onboardingType || profile.metadata?.onboardingType || "d2c",
    hospitalName: profile.metadata?.hospitalName || null,
    createdAt: profile.createdAt,
  };
}

/**
 * Helper function to map frontend vaccine to backend vaccine format
 */
export function mapVaccineToBackend(vaccine: any): any {
  return {
    babyId: vaccine.babyId,
    userId: vaccine.userId || "", // You may need to get this from session/auth
    name: vaccine.name,
    ageGroup: vaccine.ageGroup,
    dueDate: vaccine.dueDate || null,
    reminderDate: vaccine.reminderDate || null,
    status: vaccine.status || "pending",
    completedDate: vaccine.completedDate || null,
    proofUrl: vaccine.proofUrl || null,
  };
}

/**
 * Helper function to map backend vaccine to frontend vaccine format
 */
export function mapBackendToVaccine(vaccine: any): any {
  return {
    id: vaccine.id,
    babyId: vaccine.babyId,
    userId: vaccine.userId,
    name: vaccine.name,
    ageGroup: vaccine.ageGroup,
    dueDate: vaccine.dueDate || null,
    reminderDate: vaccine.reminderDate || null,
    status: vaccine.status || "pending",
    completedDate: vaccine.completedDate || null,
    proofUrl: vaccine.proofUrl || null,
  };
}

