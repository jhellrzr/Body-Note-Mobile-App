import { pgTable, text, serial, timestamp, json, varchar, boolean, integer, date, real } from "drizzle-orm/pg-core";
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

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  steps: integer("steps").notNull(),
  activity: text("activity").notNull(),
  painLevel: real("pain_level").notNull(),
  symptoms: text("symptoms"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Schemas for data insertion
export const insertPainEntrySchema = createInsertSchema(painEntries).omit({
  id: true,
  date: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true
});

// Type exports
export type PainEntry = typeof painEntries.$inferSelect;
export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;