import { eq } from "drizzle-orm";
import { db } from "./db";
import { painEntries, type PainEntry, type InsertPainEntry } from "@shared/schema";

export interface IStorage {
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const [newEntry] = await db.insert(painEntries).values(entry).returning();
    return newEntry;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return db.select().from(painEntries);
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    const [entry] = await db.select()
      .from(painEntries)
      .where(eq(painEntries.id, id));
    return entry;
  }
}

export const storage = new DatabaseStorage();
