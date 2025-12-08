import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// BabyCare Schema

export const babyProfiles = pgTable("baby_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  photoUrl: text("photo_url"),
  onboardingType: text("onboarding_type").notNull().default("d2c"),
  hospitalName: text("hospital_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBabyProfileSchema = createInsertSchema(babyProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertBabyProfile = z.infer<typeof insertBabyProfileSchema>;
export type BabyProfile = typeof babyProfiles.$inferSelect;

export const vaccines = pgTable("vaccines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  name: text("name").notNull(),
  ageGroup: text("age_group").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("pending"),
  completedDate: text("completed_date"),
  proofUrl: text("proof_url"),
});

export const insertVaccineSchema = createInsertSchema(vaccines).omit({
  id: true,
});

export type InsertVaccine = z.infer<typeof insertVaccineSchema>;
export type Vaccine = typeof vaccines.$inferSelect;

export const growthEntries = pgTable("growth_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  percentile: integer("percentile"),
  recordedAt: text("recorded_at").notNull(),
});

export const insertGrowthEntrySchema = createInsertSchema(growthEntries).omit({
  id: true,
});

export type InsertGrowthEntry = z.infer<typeof insertGrowthEntrySchema>;
export type GrowthEntry = typeof growthEntries.$inferSelect;

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ageGroup: text("age_group").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: text("completed_at"),
  lastPhotoUrl: text("last_photo_url"),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
});

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// Mother Profile
export const motherProfiles = pgTable("mother_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  deliveryType: text("delivery_type").notNull(), // "normal" | "csection" | "planned"
  feedingType: text("feeding_type").notNull(), // "breastfeeding" | "formula" | "combo"
  currentMood: text("current_mood"), // "good" | "okay" | "not_good"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMotherProfileSchema = createInsertSchema(motherProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertMotherProfile = z.infer<typeof insertMotherProfileSchema>;
export type MotherProfile = typeof motherProfiles.$inferSelect;

// User Preferences (what they need help with + location)
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  helpPreferences: text("help_preferences").array(), // ["vaccination", "growth", "milestones", "sleep", "feeding", "return_to_work", "nanny"]
  city: text("city"),
  areaPincode: text("area_pincode"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Milestone Memories - Photos/memories attached to milestones
export const milestoneMemories = pgTable("milestone_memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  milestoneId: varchar("milestone_id").notNull(),
  babyId: varchar("baby_id").notNull(),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  takenAt: text("taken_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMilestoneMemorySchema = createInsertSchema(milestoneMemories).omit({
  id: true,
  createdAt: true,
});

export type InsertMilestoneMemory = z.infer<typeof insertMilestoneMemorySchema>;
export type MilestoneMemory = typeof milestoneMemories.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Doctor Visits
export const doctorVisits = pgTable("doctor_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  visitDate: text("visit_date").notNull(),
  doctorName: text("doctor_name"),
  clinicName: text("clinic_name"),
  reason: text("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDoctorVisitSchema = createInsertSchema(doctorVisits).omit({
  id: true,
  createdAt: true,
});

export type InsertDoctorVisit = z.infer<typeof insertDoctorVisitSchema>;
export type DoctorVisit = typeof doctorVisits.$inferSelect;

// Medical Reports
export const medicalReports = pgTable("medical_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  babyId: varchar("baby_id").notNull(),
  reportDate: text("report_date").notNull(),
  title: text("title").notNull(),
  reportType: text("report_type").notNull(), // "prescription", "lab_result", "scan", "other"
  notes: text("notes"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicalReportSchema = createInsertSchema(medicalReports).omit({
  id: true,
  createdAt: true,
});

export type InsertMedicalReport = z.infer<typeof insertMedicalReportSchema>;
export type MedicalReport = typeof medicalReports.$inferSelect;

// Vaccine schedule data
export const VACCINE_SCHEDULE = [
  { ageGroup: "Birth", vaccines: ["BCG", "Hepatitis B - Birth Dose", "OPV - 0"] },
  { ageGroup: "6 Weeks", vaccines: ["DTwP/DTaP - 1", "IPV - 1", "Hib - 1", "Hepatitis B - 1", "Rotavirus - 1", "PCV - 1"] },
  { ageGroup: "10 Weeks", vaccines: ["DTwP/DTaP - 2", "IPV - 2", "Hib - 2", "Hepatitis B - 2", "Rotavirus - 2", "PCV - 2"] },
  { ageGroup: "14 Weeks", vaccines: ["DTwP/DTaP - 3", "IPV - 3", "Hib - 3", "Hepatitis B - 3", "Rotavirus - 3", "PCV - 3"] },
  { ageGroup: "6 Months", vaccines: ["OPV - 1", "Hepatitis B - 4"] },
  { ageGroup: "9 Months", vaccines: ["MMR - 1", "OPV - 2"] },
  { ageGroup: "12 Months", vaccines: ["Hepatitis A - 1", "PCV Booster"] },
  { ageGroup: "15 Months", vaccines: ["MMR - 2", "Varicella - 1"] },
  { ageGroup: "16-18 Months", vaccines: ["DTwP/DTaP Booster - 1", "Hib Booster", "IPV Booster"] },
  { ageGroup: "18 Months", vaccines: ["Hepatitis A - 2"] },
  { ageGroup: "4-6 Years", vaccines: ["DTwP/DTaP Booster - 2", "OPV - 3", "Varicella - 2", "MMR - 3"] },
];

// Milestone data by age
export const MILESTONE_DATA = [
  { ageGroup: "0-3 Months", milestones: [
    { title: "Social Smile", description: "Baby starts smiling in response to people" },
    { title: "Head Control", description: "Can hold head up when on tummy" },
    { title: "Follows Objects", description: "Eyes follow moving objects" },
    { title: "Coos and Gurgles", description: "Makes cooing sounds" },
  ]},
  { ageGroup: "4-6 Months", milestones: [
    { title: "Rolls Over", description: "Can roll from tummy to back and back to tummy" },
    { title: "Reaches for Toys", description: "Reaches out to grab objects" },
    { title: "Sits with Support", description: "Can sit with help" },
    { title: "Laughs Out Loud", description: "Laughs and squeals with delight" },
  ]},
  { ageGroup: "7-9 Months", milestones: [
    { title: "Sits Independently", description: "Can sit without support" },
    { title: "Crawls", description: "Moves on hands and knees" },
    { title: "Says Mama/Dada", description: "Babbles with consonant sounds" },
    { title: "Picks Up Small Objects", description: "Uses thumb and finger to pick up things" },
  ]},
  { ageGroup: "10-12 Months", milestones: [
    { title: "Stands with Support", description: "Pulls to stand holding furniture" },
    { title: "First Steps", description: "Takes first steps or cruises along furniture" },
    { title: "Waves Bye-Bye", description: "Understands and uses gestures" },
    { title: "First Words", description: "Says 1-3 meaningful words" },
  ]},
  { ageGroup: "1-2 Years", milestones: [
    { title: "Walks Independently", description: "Walks without holding on" },
    { title: "Stacks Blocks", description: "Can stack 2-4 blocks" },
    { title: "Two-Word Phrases", description: "Combines two words together" },
    { title: "Follows Simple Instructions", description: "Understands and follows simple commands" },
  ]},
];
