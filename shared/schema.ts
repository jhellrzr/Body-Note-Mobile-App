import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const painTypes = {
  RED: "Sharp Pain",
  BLUE: "Dull Pain",
  YELLOW: "Burning Pain",
  GREEN: "Stiffness",
  PURPLE: "Numbness/Tingling"
} as const;

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