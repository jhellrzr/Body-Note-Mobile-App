import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const painTypes = {
  RED: "sharp",
  BLUE: "dull",
  YELLOW: "burning",
  GREEN: "stiffness",
  PURPLE: "numbness"
} as const;

export interface PainMarker {
  type: keyof typeof painTypes;
  intensity: number;
  points: { x: number; y: number }[];
  brushSize: number;
}

export const painEntries = pgTable("pain_entries", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  painMarkers: json("pain_markers").$type<PainMarker[]>().notNull(),
  notes: text("notes")
});

export const insertPainEntrySchema = createInsertSchema(painEntries).omit({
  id: true,
  date: true
});

export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;
export type PainEntry = typeof painEntries.$inferSelect;

export const injuries = pgTable("injuries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  startDate: date("start_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  injuryId: integer("injury_id").references(() => injuries.id),
  date: date("date").notNull(),
  steps: integer("steps"),
  activity: varchar("activity", { length: 255 }),
  painLevel: real("pain_level"),
  symptoms: text("symptoms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const exerciseCategories = pgTable("exercise_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull()
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => exerciseCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"), // in seconds
  notes: text("notes")
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: serial("id").primaryKey(),
  injuryId: integer("injury_id").references(() => injuries.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  actualSets: integer("actual_sets"),
  actualReps: integer("actual_reps"),
  actualDuration: integer("actual_duration"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});


export const emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  dateSubscribed: timestamp("date_subscribed").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 64 }),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  sessionId: varchar("session_id", { length: 64 }),
  userAgent: text("user_agent")
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions, {
  email: z.string().email("Invalid email format"),
}).omit({
  id: true,
  dateSubscribed: true,
  lastUpdated: true,
  isVerified: true,
  verificationToken: true
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true
});

export const insertInjurySchema = createInsertSchema(injuries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true
});

export const insertExerciseCategorySchema = createInsertSchema(exerciseCategories).omit({
  id: true
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({
  id: true,
  createdAt: true
});

export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type Injury = typeof injuries.$inferSelect;
export type InsertInjury = z.infer<typeof insertInjurySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type ExerciseCategory = typeof exerciseCategories.$inferSelect;
export type InsertExerciseCategory = z.infer<typeof insertExerciseCategorySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;
import { varchar, boolean, integer, date, real } from "drizzle-orm/pg-core";