import { 
  type User, 
  type InsertUser,
  type BabyProfile,
  type InsertBabyProfile,
  type Vaccine,
  type InsertVaccine,
  type GrowthEntry,
  type InsertGrowthEntry,
  type Milestone,
  type InsertMilestone,
  type MilestoneMemory,
  type InsertMilestoneMemory,
  type ChatMessage,
  type InsertChatMessage,
  type DoctorVisit,
  type InsertDoctorVisit,
  type MedicalReport,
  type InsertMedicalReport,
  VACCINE_SCHEDULE,
  MILESTONE_DATA
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Baby Profile operations
  getBabyProfile(id: string): Promise<BabyProfile | undefined>;
  getAllBabyProfiles(): Promise<BabyProfile[]>;
  createBabyProfile(profile: InsertBabyProfile): Promise<BabyProfile>;
  updateBabyProfile(id: string, profile: Partial<InsertBabyProfile>): Promise<BabyProfile | undefined>;
  
  // Vaccine operations
  getVaccinesByBabyId(babyId: string): Promise<Vaccine[]>;
  createVaccine(vaccine: InsertVaccine): Promise<Vaccine>;
  updateVaccine(id: string, vaccine: Partial<InsertVaccine>): Promise<Vaccine | undefined>;
  initializeVaccinesForBaby(babyId: string, dob: string): Promise<void>;
  
  // Growth Entry operations
  getGrowthEntriesByBabyId(babyId: string): Promise<GrowthEntry[]>;
  createGrowthEntry(entry: InsertGrowthEntry): Promise<GrowthEntry>;
  
  // Milestone operations
  getMilestonesByBabyId(babyId: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  initializeMilestonesForBaby(babyId: string): Promise<void>;
  
  // Milestone Memory operations
  getMilestoneMemoriesByBabyId(babyId: string): Promise<MilestoneMemory[]>;
  getMilestoneMemoriesByMilestoneId(milestoneId: string): Promise<MilestoneMemory[]>;
  createMilestoneMemory(memory: InsertMilestoneMemory): Promise<MilestoneMemory>;
  deleteMilestoneMemory(id: string): Promise<boolean>;
  
  // Chat operations
  getChatMessagesByBabyId(babyId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Doctor Visit operations
  getDoctorVisitsByBabyId(babyId: string): Promise<DoctorVisit[]>;
  createDoctorVisit(visit: InsertDoctorVisit): Promise<DoctorVisit>;
  
  // Medical Report operations
  getMedicalReportsByBabyId(babyId: string): Promise<MedicalReport[]>;
  createMedicalReport(report: InsertMedicalReport): Promise<MedicalReport>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private babyProfiles: Map<string, BabyProfile>;
  private vaccines: Map<string, Vaccine>;
  private growthEntries: Map<string, GrowthEntry>;
  private milestones: Map<string, Milestone>;
  private milestoneMemories: Map<string, MilestoneMemory>;
  private chatMessages: Map<string, ChatMessage>;
  private doctorVisits: Map<string, DoctorVisit>;
  private medicalReports: Map<string, MedicalReport>;

  constructor() {
    this.users = new Map();
    this.babyProfiles = new Map();
    this.vaccines = new Map();
    this.growthEntries = new Map();
    this.milestones = new Map();
    this.milestoneMemories = new Map();
    this.chatMessages = new Map();
    this.doctorVisits = new Map();
    this.medicalReports = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Baby Profile operations
  async getBabyProfile(id: string): Promise<BabyProfile | undefined> {
    return this.babyProfiles.get(id);
  }

  async getAllBabyProfiles(): Promise<BabyProfile[]> {
    return Array.from(this.babyProfiles.values());
  }

  async createBabyProfile(insertProfile: InsertBabyProfile): Promise<BabyProfile> {
    const id = randomUUID();
    const profile: BabyProfile = {
      id,
      name: insertProfile.name,
      dob: insertProfile.dob,
      gender: insertProfile.gender,
      photoUrl: insertProfile.photoUrl ?? null,
      onboardingType: insertProfile.onboardingType ?? "d2c",
      hospitalName: insertProfile.hospitalName ?? null,
      createdAt: new Date(),
    };
    this.babyProfiles.set(id, profile);
    return profile;
  }

  async updateBabyProfile(id: string, updates: Partial<InsertBabyProfile>): Promise<BabyProfile | undefined> {
    const existing = this.babyProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: BabyProfile = { ...existing, ...updates };
    this.babyProfiles.set(id, updated);
    return updated;
  }

  // Vaccine operations
  async getVaccinesByBabyId(babyId: string): Promise<Vaccine[]> {
    return Array.from(this.vaccines.values()).filter(v => v.babyId === babyId);
  }

  async createVaccine(insertVaccine: InsertVaccine): Promise<Vaccine> {
    const id = randomUUID();
    const vaccine: Vaccine = {
      id,
      babyId: insertVaccine.babyId,
      name: insertVaccine.name,
      ageGroup: insertVaccine.ageGroup,
      dueDate: insertVaccine.dueDate ?? null,
      status: insertVaccine.status ?? "pending",
      completedDate: insertVaccine.completedDate ?? null,
      proofUrl: insertVaccine.proofUrl ?? null,
    };
    this.vaccines.set(id, vaccine);
    return vaccine;
  }

  async updateVaccine(id: string, updates: Partial<InsertVaccine>): Promise<Vaccine | undefined> {
    const existing = this.vaccines.get(id);
    if (!existing) return undefined;
    
    const updated: Vaccine = { ...existing, ...updates };
    this.vaccines.set(id, updated);
    return updated;
  }

  async initializeVaccinesForBaby(babyId: string, dob: string): Promise<void> {
    const birthDate = new Date(dob);
    
    for (const group of VACCINE_SCHEDULE) {
      for (const vaccineName of group.vaccines) {
        const dueDate = this.calculateDueDate(birthDate, group.ageGroup);
        await this.createVaccine({
          babyId,
          name: vaccineName,
          ageGroup: group.ageGroup,
          dueDate: dueDate.toISOString().split('T')[0],
          status: "pending",
          completedDate: null,
          proofUrl: null,
        });
      }
    }
  }

  private calculateDueDate(birthDate: Date, ageGroup: string): Date {
    const date = new Date(birthDate);
    
    if (ageGroup === "Birth") return date;
    if (ageGroup === "6 Weeks") { date.setDate(date.getDate() + 42); return date; }
    if (ageGroup === "10 Weeks") { date.setDate(date.getDate() + 70); return date; }
    if (ageGroup === "14 Weeks") { date.setDate(date.getDate() + 98); return date; }
    if (ageGroup === "6 Months") { date.setMonth(date.getMonth() + 6); return date; }
    if (ageGroup === "9 Months") { date.setMonth(date.getMonth() + 9); return date; }
    if (ageGroup === "12 Months") { date.setFullYear(date.getFullYear() + 1); return date; }
    if (ageGroup === "15 Months") { date.setMonth(date.getMonth() + 15); return date; }
    if (ageGroup === "16-18 Months") { date.setMonth(date.getMonth() + 17); return date; }
    if (ageGroup === "18 Months") { date.setMonth(date.getMonth() + 18); return date; }
    if (ageGroup === "4-6 Years") { date.setFullYear(date.getFullYear() + 5); return date; }
    
    return date;
  }

  // Growth Entry operations
  async getGrowthEntriesByBabyId(babyId: string): Promise<GrowthEntry[]> {
    return Array.from(this.growthEntries.values())
      .filter(e => e.babyId === babyId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  async createGrowthEntry(insertEntry: InsertGrowthEntry): Promise<GrowthEntry> {
    const id = randomUUID();
    const entry: GrowthEntry = {
      id,
      babyId: insertEntry.babyId,
      type: insertEntry.type,
      value: insertEntry.value,
      percentile: insertEntry.percentile ?? null,
      recordedAt: insertEntry.recordedAt,
    };
    this.growthEntries.set(id, entry);
    return entry;
  }

  // Milestone operations
  async getMilestonesByBabyId(babyId: string): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(m => m.babyId === babyId);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = randomUUID();
    const milestone: Milestone = {
      id,
      babyId: insertMilestone.babyId,
      title: insertMilestone.title,
      description: insertMilestone.description ?? null,
      ageGroup: insertMilestone.ageGroup,
      completed: insertMilestone.completed ?? false,
      completedAt: insertMilestone.completedAt ?? null,
      lastPhotoUrl: insertMilestone.lastPhotoUrl ?? null,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existing = this.milestones.get(id);
    if (!existing) return undefined;
    
    const updated: Milestone = { ...existing, ...updates };
    this.milestones.set(id, updated);
    return updated;
  }

  async initializeMilestonesForBaby(babyId: string): Promise<void> {
    for (const group of MILESTONE_DATA) {
      for (const m of group.milestones) {
        await this.createMilestone({
          babyId,
          title: m.title,
          description: m.description,
          ageGroup: group.ageGroup,
          completed: false,
          completedAt: null,
          lastPhotoUrl: null,
        });
      }
    }
  }

  // Milestone Memory operations
  async getMilestoneMemoriesByBabyId(babyId: string): Promise<MilestoneMemory[]> {
    return Array.from(this.milestoneMemories.values())
      .filter(m => m.babyId === babyId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  }

  async getMilestoneMemoriesByMilestoneId(milestoneId: string): Promise<MilestoneMemory[]> {
    return Array.from(this.milestoneMemories.values())
      .filter(m => m.milestoneId === milestoneId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  }

  async createMilestoneMemory(insertMemory: InsertMilestoneMemory): Promise<MilestoneMemory> {
    const id = randomUUID();
    const memory: MilestoneMemory = {
      id,
      milestoneId: insertMemory.milestoneId,
      babyId: insertMemory.babyId,
      photoUrl: insertMemory.photoUrl,
      caption: insertMemory.caption ?? null,
      takenAt: insertMemory.takenAt,
      createdAt: new Date(),
    };
    this.milestoneMemories.set(id, memory);
    return memory;
  }

  async deleteMilestoneMemory(id: string): Promise<boolean> {
    return this.milestoneMemories.delete(id);
  }

  // Chat operations
  async getChatMessagesByBabyId(babyId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.babyId === babyId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { ...insertMessage, id };
    this.chatMessages.set(id, message);
    return message;
  }

  // Doctor Visit operations
  async getDoctorVisitsByBabyId(babyId: string): Promise<DoctorVisit[]> {
    return Array.from(this.doctorVisits.values())
      .filter(v => v.babyId === babyId)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }

  async createDoctorVisit(insertVisit: InsertDoctorVisit): Promise<DoctorVisit> {
    const id = randomUUID();
    const visit: DoctorVisit = {
      id,
      babyId: insertVisit.babyId,
      visitDate: insertVisit.visitDate,
      doctorName: insertVisit.doctorName ?? null,
      clinicName: insertVisit.clinicName ?? null,
      reason: insertVisit.reason,
      notes: insertVisit.notes ?? null,
      createdAt: new Date(),
    };
    this.doctorVisits.set(id, visit);
    return visit;
  }

  // Medical Report operations
  async getMedicalReportsByBabyId(babyId: string): Promise<MedicalReport[]> {
    return Array.from(this.medicalReports.values())
      .filter(r => r.babyId === babyId)
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }

  async createMedicalReport(insertReport: InsertMedicalReport): Promise<MedicalReport> {
    const id = randomUUID();
    const report: MedicalReport = {
      id,
      babyId: insertReport.babyId,
      reportDate: insertReport.reportDate,
      title: insertReport.title,
      reportType: insertReport.reportType,
      notes: insertReport.notes ?? null,
      fileUrl: insertReport.fileUrl ?? null,
      createdAt: new Date(),
    };
    this.medicalReports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
