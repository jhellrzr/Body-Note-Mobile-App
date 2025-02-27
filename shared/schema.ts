import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const painTypes = {
  RED: "sharp",
  BLUE: "dull",
  YELLOW: "burning",
  GREEN: "tingling",
  PURPLE: "throbbing"
} as const;

export const painEntries = pgTable("pain_entries", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  painMarkers: json("pain_markers").$type<{
    type: keyof typeof painTypes;
    intensity: number;
    points: { x: number; y: number }[];
    brushSize: number;
  }[]>().notNull(),
  notes: text("notes")
});

export const insertPainEntrySchema = createInsertSchema(painEntries).omit({
  id: true,
  date: true
});

export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;
export type PainEntry = typeof painEntries.$inferSelect;