import { pgTable, text, serial, timestamp, json, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const painTypes = {
  RED: "sharp",
  BLUE: "dull",
  YELLOW: "burning",
  GREEN: "stiffness",
  PURPLE: "numbness"
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

export const emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  dateSubscribed: timestamp("date_subscribed").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 64 }),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
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

export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;
export type PainEntry = typeof painEntries.$inferSelect;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;