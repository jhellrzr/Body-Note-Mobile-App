import { eq } from "drizzle-orm";
import { db } from "./db";
import { painEntries, activityLogs, type PainEntry, type InsertPainEntry, type ActivityLog, type InsertActivityLog } from "@shared/schema";

export interface IStorage {
  // Pain Entries
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
  updateActivityLog(id: number, log: Partial<InsertActivityLog>): Promise<ActivityLog>;
  deleteActivityLog(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Pain Entry Methods
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

  // Activity Log Methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    try {
      console.log('Creating activity log with data:', log);

      // Create the database record with proper date handling
      const dbRecord = {
        date: new Date(log.date),
        steps: log.steps,
        activity: log.activity,
        painLevel: log.painLevel,
        symptoms: log.symptoms || null
      };

      console.log('Transformed database record:', dbRecord);

      const [newLog] = await db.insert(activityLogs)
        .values(dbRecord)
        .returning();

      console.log('Successfully created new log:', newLog);
      return newLog;
    } catch (error) {
      console.error('Error in createActivityLog:', error);
      throw new Error(`Failed to create activity log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.select().from(activityLogs).orderBy(activityLogs.date);
  }

  async updateActivityLog(id: number, log: Partial<InsertActivityLog>): Promise<ActivityLog> {
    const [updatedLog] = await db.update(activityLogs)
      .set({
        ...log,
        date: log.date ? new Date(log.date) : undefined
      })
      .where(eq(activityLogs.id, id))
      .returning();
    return updatedLog;
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    const [deletedLog] = await db.delete(activityLogs)
      .where(eq(activityLogs.id, id))
      .returning();
    return !!deletedLog;
  }
}

export const storage = new DatabaseStorage();