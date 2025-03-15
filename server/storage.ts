import { db } from "./db";
import { 
  painEntries,
  emailSubscriptions,
  analyticsEvents,
  activityLogs,
  exerciseLogs,
  exercises,
  exerciseCategories,
  type PainEntry, 
  type InsertPainEntry,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type InsertAnalyticsEvent,
  type AnalyticsEvent,
  type ActivityLog,
  type InsertActivityLog,
  type ExerciseLog,
  type InsertExerciseLog,
  type Exercise,
  type ExerciseCategory
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;
  createEmailSubscription(email: InsertEmailSubscription): Promise<EmailSubscription>;
  verifyEmailSubscription(token: string): Promise<boolean>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  isEmailSubscribed(email: string): Promise<boolean>;
  trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getEvents(eventName?: string): Promise<AnalyticsEvent[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
  updateActivityLog(id: number, log: InsertActivityLog): Promise<ActivityLog | null>;
  deleteActivityLog(id: number): Promise<boolean>;
  createExerciseLog(log: InsertExerciseLog): Promise<ExerciseLog>;
  getExerciseLogs(): Promise<ExerciseLog[]>;
  updateExerciseLog(id: number, completed: boolean): Promise<boolean>;
  getExercises(): Promise<Exercise[]>;
  getExerciseCategories(): Promise<ExerciseCategory[]>;
}

export class DatabaseStorage implements IStorage {
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    try {
      console.log('Creating activity log:', log);
      const [newLog] = await db.insert(activityLogs).values({
        ...log,
        createdAt: new Date()
      }).returning();
      console.log('Activity log created:', newLog);
      return newLog;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw new Error(`Failed to create activity log: ${error.message}`);
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      console.log('Fetching activity logs');
      const logs = await db.select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.date));
      console.log(`Retrieved ${logs.length} activity logs`);
      return logs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }
  }

  async updateActivityLog(id: number, log: InsertActivityLog): Promise<ActivityLog | null> {
    try {
      console.log('Updating activity log:', { id, log });
      const [updated] = await db
        .update(activityLogs)
        .set(log)
        .where(eq(activityLogs.id, id))
        .returning();
      console.log('Activity log updated:', updated);
      return updated || null;
    } catch (error) {
      console.error('Error updating activity log:', error);
      throw new Error(`Failed to update activity log: ${error.message}`);
    }
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    try {
      console.log('Deleting activity log:', id);
      const [deleted] = await db
        .delete(activityLogs)
        .where(eq(activityLogs.id, id))
        .returning();
      console.log('Activity log deleted:', deleted);
      return !!deleted;
    } catch (error) {
      console.error('Error deleting activity log:', error);
      throw new Error(`Failed to delete activity log: ${error.message}`);
    }
  }

  async createExerciseLog(log: InsertExerciseLog): Promise<ExerciseLog> {
    try {
      console.log('Creating exercise log:', log);
      const [newLog] = await db.insert(exerciseLogs).values({
        ...log,
        completed: false,
        createdAt: new Date()
      }).returning();
      console.log('Exercise log created:', newLog);
      return newLog;
    } catch (error) {
      console.error('Error creating exercise log:', error);
      throw new Error(`Failed to create exercise log: ${error.message}`);
    }
  }

  async getExerciseLogs(): Promise<ExerciseLog[]> {
    try {
      console.log('Fetching exercise logs');
      const logs = await db.select()
        .from(exerciseLogs)
        .orderBy(exerciseLogs.date);
      console.log(`Retrieved ${logs.length} exercise logs`);
      return logs;
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
      throw new Error(`Failed to fetch exercise logs: ${error.message}`);
    }
  }

  async updateExerciseLog(id: number, completed: boolean): Promise<boolean> {
    try {
      console.log('Updating exercise log:', { id, completed });
      const [updated] = await db
        .update(exerciseLogs)
        .set({ completed })
        .where(eq(exerciseLogs.id, id))
        .returning();
      console.log('Exercise log updated:', updated);
      return !!updated;
    } catch (error) {
      console.error('Error updating exercise log:', error);
      throw new Error(`Failed to update exercise log: ${error.message}`);
    }
  }

  async getExercises(): Promise<Exercise[]> {
    try {
      console.log('Fetching exercises');
      const exercises = await db.select().from(exercises);
      console.log(`Retrieved ${exercises.length} exercises`);
      return exercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw new Error(`Failed to fetch exercises: ${error.message}`);
    }
  }

  async getExerciseCategories(): Promise<ExerciseCategory[]> {
    try {
      console.log('Fetching exercise categories');
      const categories = await db.select()
        .from(exerciseCategories)
        .orderBy(exerciseCategories.orderIndex);
      console.log(`Retrieved ${categories.length} exercise categories`);
      return categories;
    } catch (error) {
      console.error('Error fetching exercise categories:', error);
      throw new Error(`Failed to fetch exercise categories: ${error.message}`);
    }
  }

  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const [newEntry] = await db.insert(painEntries).values({
      ...entry,
      createdAt: new Date(),
      notes: entry.notes || null
    }).returning();
    return newEntry;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return db.select().from(painEntries);
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    const [entry] = await db.select().from(painEntries).where(eq(painEntries.id, id));
    return entry;
  }

  async createEmailSubscription(data: InsertEmailSubscription): Promise<EmailSubscription> {
    const [subscription] = await db.insert(emailSubscriptions).values({
      email: data.email,
      dateSubscribed: new Date(),
      isVerified: false,
      verificationToken: Math.random().toString(36).substring(2),
      lastUpdated: new Date()
    }).returning();
    return subscription;
  }

  async verifyEmailSubscription(token: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.verificationToken, token));

    if (subscription) {
      await db
        .update(emailSubscriptions)
        .set({
          isVerified: true,
          verificationToken: null,
          lastUpdated: new Date()
        })
        .where(eq(emailSubscriptions.id, subscription.id));
      return true;
    }
    return false;
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email));
    return subscription;
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    const subscription = await this.getEmailSubscription(email);
    return !!subscription?.isVerified;
  }

  async trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await db.insert(analyticsEvents).values({
      ...event,
      timestamp: new Date(),
      metadata: event.metadata || {},
      sessionId: event.sessionId || null,
      userAgent: event.userAgent || null
    }).returning();
    return newEvent;
  }

  async getEvents(eventName?: string): Promise<AnalyticsEvent[]> {
    if (eventName) {
      return db.select().from(analyticsEvents).where(eq(analyticsEvents.eventName, eventName));
    }
    return db.select().from(analyticsEvents);
  }
}

export const storage = new DatabaseStorage();