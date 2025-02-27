import { painEntries, type PainEntry, type InsertPainEntry } from "@shared/schema";

export interface IStorage {
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, PainEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async createPainEntry(insertEntry: InsertPainEntry): Promise<PainEntry> {
    const id = this.currentId++;
    const entry: PainEntry = {
      ...insertEntry,
      id,
      date: new Date()
    };
    this.entries.set(id, entry);
    return entry;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return Array.from(this.entries.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    return this.entries.get(id);
  }
}

export const storage = new MemStorage();
