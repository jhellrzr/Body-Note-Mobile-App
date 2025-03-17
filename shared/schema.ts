import { pgTable, text, serial, timestamp, json, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing pain types
export const painTypes = {
  RED: "sharp",
  BLUE: "dull",
  YELLOW: "burning",
  GREEN: "stiffness",
  PURPLE: "numbness"
} as const;

// Keep existing PainMarker interfaces
export interface PainMarker2D {
  type: keyof typeof painTypes;
  intensity: number;
  points: { x: number; y: number }[];
  brushSize: number;
}

export interface PainMarker3D {
  color: keyof typeof painTypes;
  intensity: number;
  position: { x: number; y: number; z: number };
}

export type PainMarker = PainMarker2D | PainMarker3D;

// Add users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Add injuries table
export const injuries = pgTable("injuries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dateOfInjury: timestamp("date_of_injury").notNull(),
  status: varchar("status", { length: 50 }).notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Update pain entries to optionally link to injuries
export const painEntries = pgTable("pain_entries", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  painMarkers: json("pain_markers").$type<PainMarker[]>().notNull(),
  notes: text("notes"),
  injuryId: integer("injury_id").references(() => injuries.id) // Optional reference to injury
});

// Keep existing email subscriptions and analytics tables
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

// Update and add insert schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
}).omit({
  id: true,
  createdAt: true
});

export const insertInjurySchema = createInsertSchema(injuries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPainEntrySchema = createInsertSchema(painEntries).omit({
  id: true,
  date: true
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

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInjury = z.infer<typeof insertInjurySchema>;
export type Injury = typeof injuries.$inferSelect;
export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;
export type PainEntry = typeof painEntries.$inferSelect;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;