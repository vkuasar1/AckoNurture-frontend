import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBabyProfileSchema, 
  insertVaccineSchema, 
  insertGrowthEntrySchema, 
  insertMilestoneSchema, 
  insertMilestoneMemorySchema,
  insertChatMessageSchema,
  insertDoctorVisitSchema,
  insertMedicalReportSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Baby Profile routes
  app.get("/api/baby-profiles", async (req, res) => {
    const profiles = await storage.getAllBabyProfiles();
    res.json(profiles);
  });

  app.get("/api/baby-profiles/:id", async (req, res) => {
    const profile = await storage.getBabyProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Baby profile not found" });
    }
    res.json(profile);
  });

  app.post("/api/baby-profiles", async (req, res) => {
    const parsed = insertBabyProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const profile = await storage.createBabyProfile(parsed.data);
    
    // Initialize vaccines and milestones for the baby
    await storage.initializeVaccinesForBaby(profile.id, profile.dob);
    await storage.initializeMilestonesForBaby(profile.id);
    
    res.status(201).json(profile);
  });

  app.patch("/api/baby-profiles/:id", async (req, res) => {
    const updated = await storage.updateBabyProfile(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Baby profile not found" });
    }
    res.json(updated);
  });

  // Vaccine routes
  app.get("/api/baby-profiles/:babyId/vaccines", async (req, res) => {
    const vaccines = await storage.getVaccinesByBabyId(req.params.babyId);
    res.json(vaccines);
  });

  app.patch("/api/vaccines/:id", async (req, res) => {
    const updated = await storage.updateVaccine(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Vaccine not found" });
    }
    res.json(updated);
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

  // Chat routes
  app.get("/api/baby-profiles/:babyId/chat", async (req, res) => {
    const messages = await storage.getChatMessagesByBabyId(req.params.babyId);
    res.json(messages);
  });

  app.post("/api/baby-profiles/:babyId/chat", async (req, res) => {
    const parsed = insertChatMessageSchema.safeParse({
      ...req.body,
      babyId: req.params.babyId,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    
    const message = await storage.createChatMessage(parsed.data);
    res.status(201).json(message);
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

  return httpServer;
}
