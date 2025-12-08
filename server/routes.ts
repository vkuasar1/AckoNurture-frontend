import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  profileApi, 
  vaccineApi, 
  planApi,
  userPlanApi,
  chatApi,
  mapBabyProfileToBackend,
  mapBackendToBabyProfile,
  mapVaccineToBackend,
  mapBackendToVaccine
} from "./apiClient";
import { 
  insertBabyProfileSchema, 
  insertVaccineSchema, 
  insertGrowthEntrySchema, 
  insertMilestoneSchema, 
  insertMilestoneMemorySchema,
  insertChatMessageSchema,
  insertDoctorVisitSchema,
  insertMedicalReportSchema,
  insertMotherProfileSchema,
  insertUserPreferencesSchema
} from "@shared/schema";

// TODO: These features are not yet available in the backend API
// They will need to be implemented in the backend or stored locally
// - Growth entries
// - Milestones
// - Milestone memories
// - Doctor visits
// - Medical reports
// - User preferences
// For now, we'll use a temporary in-memory storage for these
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Baby Profile routes - Using Backend API
  app.get("/api/baby-profiles", async (req, res) => {
    try {
      // Get all profiles and filter for baby type
      const allProfiles = await profileApi.getByType("baby");
      const babyProfiles = allProfiles.map(mapBackendToBabyProfile);
      res.json(babyProfiles);
    } catch (error: any) {
      console.error("Error fetching baby profiles:", error);
      res.status(500).json({ error: error.message || "Failed to fetch baby profiles" });
    }
  });

  app.get("/api/baby-profiles/:id", async (req, res) => {
    try {
      const profile = await profileApi.getByProfileId(req.params.id);
      if (!profile || profile.type !== "baby") {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      res.json(mapBackendToBabyProfile(profile));
    } catch (error: any) {
      console.error("Error fetching baby profile:", error);
      if (error.message?.includes("404")) {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      res.status(500).json({ error: error.message || "Failed to fetch baby profile" });
    }
  });

  app.post("/api/baby-profiles", async (req, res) => {
    try {
      const parsed = insertBabyProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // Map to backend format
      const backendProfile = mapBabyProfileToBackend(parsed.data);
      
      // Create profile in backend
      const createdProfile = await profileApi.create(backendProfile);
      const frontendProfile = mapBackendToBabyProfile(createdProfile);
      
      // Initialize vaccines for the baby
      try {
        await vaccineApi.generateScheduleWithDOB(frontendProfile.id, frontendProfile.dob);
      } catch (vaccineError) {
        console.warn("Failed to initialize vaccines:", vaccineError);
        // Continue even if vaccine initialization fails
      }
      
      // TODO: Initialize milestones - backend API doesn't have this yet
      // For now, we'll use local storage for milestones
      try {
        await storage.initializeMilestonesForBaby(frontendProfile.id);
      } catch (milestoneError) {
        console.warn("Failed to initialize milestones:", milestoneError);
      }
      
      res.status(201).json(frontendProfile);
    } catch (error: any) {
      console.error("Error creating baby profile:", error);
      res.status(500).json({ error: error.message || "Failed to create baby profile" });
    }
  });

  app.patch("/api/baby-profiles/:id", async (req, res) => {
    try {
      // Get existing profile first
      const existing = await profileApi.getByProfileId(req.params.id);
      if (!existing || existing.type !== "baby") {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      
      // Merge updates
      const updates = {
        ...existing,
        ...req.body,
        // Ensure type stays as "baby"
        type: "baby",
      };
      
      const updated = await profileApi.update(existing.id, updates);
      res.json(mapBackendToBabyProfile(updated));
    } catch (error: any) {
      console.error("Error updating baby profile:", error);
      if (error.message?.includes("404")) {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      res.status(500).json({ error: error.message || "Failed to update baby profile" });
    }
  });

  // Vaccine routes - Using Backend API
  app.get("/api/baby-profiles/:babyId/vaccines", async (req, res) => {
    try {
      const vaccines = await vaccineApi.getByBabyId(req.params.babyId);
      const frontendVaccines = vaccines.map(mapBackendToVaccine);
      res.json(frontendVaccines);
    } catch (error: any) {
      console.error("Error fetching vaccines:", error);
      res.status(500).json({ error: error.message || "Failed to fetch vaccines" });
    }
  });

  app.patch("/api/vaccines/:id", async (req, res) => {
    try {
      // Get existing vaccine first
      const existing = await vaccineApi.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Vaccine not found" });
      }
      
      // Merge updates
      const updates = { ...existing, ...req.body };
      const updated = await vaccineApi.update(req.params.id, updates);
      res.json(mapBackendToVaccine(updated));
    } catch (error: any) {
      console.error("Error updating vaccine:", error);
      if (error.message?.includes("404")) {
        return res.status(404).json({ error: "Vaccine not found" });
      }
      res.status(500).json({ error: error.message || "Failed to update vaccine" });
    }
  });

  // Growth Entry routes
  app.get("/api/baby-profiles/:babyId/growth", async (req, res) => {
    const entries = await storage.getGrowthEntriesByBabyId(req.params.babyId);
    res.json(entries);
  });

  app.post("/api/baby-profiles/:babyId/growth", async (req, res) => {
    const parsed = insertGrowthEntrySchema.safeParse({
      ...req.body,
      babyId: req.params.babyId,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const entry = await storage.createGrowthEntry(parsed.data);
    res.status(201).json(entry);
  });

  // Milestone routes
  app.get("/api/baby-profiles/:babyId/milestones", async (req, res) => {
    const milestones = await storage.getMilestonesByBabyId(req.params.babyId);
    res.json(milestones);
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    const updated = await storage.updateMilestone(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    res.json(updated);
  });

  // Milestone Memory routes
  app.get("/api/baby-profiles/:babyId/memories", async (req, res) => {
    const memories = await storage.getMilestoneMemoriesByBabyId(req.params.babyId);
    res.json(memories);
  });

  app.get("/api/milestones/:milestoneId/memories", async (req, res) => {
    const memories = await storage.getMilestoneMemoriesByMilestoneId(req.params.milestoneId);
    res.json(memories);
  });

  app.post("/api/baby-profiles/:babyId/memories", async (req, res) => {
    const parsed = insertMilestoneMemorySchema.safeParse({
      ...req.body,
      babyId: req.params.babyId,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const memory = await storage.createMilestoneMemory(parsed.data);
    res.status(201).json(memory);
  });

  app.delete("/api/memories/:id", async (req, res) => {
    const deleted = await storage.deleteMilestoneMemory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Memory not found" });
    }
    res.status(204).send();
  });

  // Chat routes - Using Backend OpenAI Chat API
  app.get("/api/baby-profiles/:babyId/chat", async (req, res) => {
    // TODO: Backend API doesn't have a chat history endpoint
    // For now, return empty array or use local storage
    // You may want to implement chat history in the backend
    try {
      const messages = await storage.getChatMessagesByBabyId(req.params.babyId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.json([]); // Return empty array if storage fails
    }
  });

  app.post("/api/baby-profiles/:babyId/chat", async (req, res) => {
    try {
      const parsed = insertChatMessageSchema.safeParse({
        ...req.body,
        babyId: req.params.babyId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // If it's a user message, also send to OpenAI chat API
      if (parsed.data.role === "user") {
        try {
          const sessionId = req.body.sessionId || req.params.babyId;
          const aiResponse = await chatApi.chat({
            message: parsed.data.content,
            sessionId: sessionId,
            babyId: req.params.babyId,
          });
          
          // Store both user message and AI response
          const userMessage = await storage.createChatMessage(parsed.data);
          
          const aiMessage = await storage.createChatMessage({
            babyId: req.params.babyId,
            role: "assistant",
            content: aiResponse.response || aiResponse.message || "I'm here to help!",
            timestamp: new Date().toISOString(),
          });
          
          res.status(201).json([userMessage, aiMessage]);
          return;
        } catch (aiError) {
          console.error("Error calling OpenAI API:", aiError);
          // Continue to store message even if AI fails
        }
      }
      
      // Store message locally (backend doesn't have chat storage yet)
      const message = await storage.createChatMessage(parsed.data);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: error.message || "Failed to create chat message" });
    }
  });

  // Doctor Visit routes
  app.get("/api/baby-profiles/:babyId/visits", async (req, res) => {
    const visits = await storage.getDoctorVisitsByBabyId(req.params.babyId);
    res.json(visits);
  });

  app.post("/api/baby-profiles/:babyId/visits", async (req, res) => {
    const parsed = insertDoctorVisitSchema.safeParse({
      ...req.body,
      babyId: req.params.babyId,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const visit = await storage.createDoctorVisit(parsed.data);
    res.status(201).json(visit);
  });

  // Medical Report routes
  app.get("/api/baby-profiles/:babyId/reports", async (req, res) => {
    const reports = await storage.getMedicalReportsByBabyId(req.params.babyId);
    res.json(reports);
  });

  app.post("/api/baby-profiles/:babyId/reports", async (req, res) => {
    const parsed = insertMedicalReportSchema.safeParse({
      ...req.body,
      babyId: req.params.babyId,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const report = await storage.createMedicalReport(parsed.data);
    res.status(201).json(report);
  });

  // Mother Profile routes - Using Backend API
  app.get("/api/mother-profiles/:babyId", async (req, res) => {
    try {
      // Get baby profile first to find userId
      const babyProfile = await profileApi.getByProfileId(req.params.babyId);
      if (!babyProfile) {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      
      // Get mother profiles for this user
      const motherProfiles = await profileApi.getByUserIdAndType(babyProfile.userId, "mother");
      
      // Find the one associated with this baby (you may need to check metadata)
      const profile = motherProfiles.find((p: any) => 
        p.metadata?.babyId === req.params.babyId || 
        p.profileId === req.params.babyId // Adjust based on your data model
      );
      
      if (!profile) {
        return res.status(404).json({ error: "Mother profile not found" });
      }
      
      // Map to frontend format
      const frontendProfile = {
        id: profile.profileId || profile.id,
        babyId: req.params.babyId,
        deliveryType: profile.metadata?.deliveryType || "",
        feedingType: profile.metadata?.feedingType || "",
        currentMood: profile.metadata?.currentMood || null,
        createdAt: profile.createdAt,
      };
      
      res.json(frontendProfile);
    } catch (error: any) {
      console.error("Error fetching mother profile:", error);
      if (error.message?.includes("404")) {
        return res.status(404).json({ error: "Mother profile not found" });
      }
      res.status(500).json({ error: error.message || "Failed to fetch mother profile" });
    }
  });

  app.post("/api/mother-profiles", async (req, res) => {
    try {
      const parsed = insertMotherProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // Get baby profile to get userId
      const babyProfile = await profileApi.getByProfileId(parsed.data.babyId);
      if (!babyProfile) {
        return res.status(404).json({ error: "Baby profile not found" });
      }
      
      // Create mother profile in backend
      const backendProfile = {
        profileId: `mother-${Date.now()}`, // Generate unique ID
        userId: babyProfile.userId,
        type: "mother",
        name: babyProfile.name ? `${babyProfile.name}'s Mother` : "Mother",
        metadata: {
          babyId: parsed.data.babyId,
          deliveryType: parsed.data.deliveryType,
          feedingType: parsed.data.feedingType,
          currentMood: parsed.data.currentMood || null,
        },
      };
      
      const createdProfile = await profileApi.create(backendProfile);
      
      // Map to frontend format
      const frontendProfile = {
        id: createdProfile.profileId || createdProfile.id,
        babyId: parsed.data.babyId,
        deliveryType: parsed.data.deliveryType,
        feedingType: parsed.data.feedingType,
        currentMood: parsed.data.currentMood || null,
        createdAt: createdProfile.createdAt || new Date().toISOString(),
      };
      
      res.status(201).json(frontendProfile);
    } catch (error: any) {
      console.error("Error creating mother profile:", error);
      res.status(500).json({ error: error.message || "Failed to create mother profile" });
    }
  });

  // User Preferences routes
  app.get("/api/user-preferences/:babyId", async (req, res) => {
    const prefs = await storage.getUserPreferencesByBabyId(req.params.babyId);
    if (!prefs) {
      return res.status(404).json({ error: "User preferences not found" });
    }
    res.json(prefs);
  });

  app.post("/api/user-preferences", async (req, res) => {
    const parsed = insertUserPreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const prefs = await storage.createUserPreferences(parsed.data);
    res.status(201).json(prefs);
  });

  return httpServer;
}
