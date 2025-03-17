import { pgTable, text, serial, timestamp, json, integer, date, real } from "drizzle-orm/pg-core";
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

export const insertActivityLogSchema = createInsertSchema(activityLogs)
  .extend({
    date: z.coerce.date(),
    steps: z.number().min(0, "Steps must be a positive number"),
    painLevel: z.number().min(0, "Pain level must be between 0 and 5").max(5, "Pain level must be between 0 and 5"),
    activity: z.string().min(1, "Activity is required"),
    symptoms: z.string().optional()
  })
  .omit({
    id: true,
    createdAt: true
  });

// Type exports
export type PainEntry = typeof painEntries.$inferSelect;
export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;