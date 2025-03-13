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
import { eq } from "drizzle-orm";

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
    const [newLog] = await db.insert(activityLogs).values({
      ...log,
      createdAt: new Date()
    }).returning();
    return newLog;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.select().from(activityLogs).orderBy(activityLogs.createdAt);
  }

  async updateActivityLog(id: number, log: InsertActivityLog): Promise<ActivityLog | null> {
    const [updated] = await db
      .update(activityLogs)
      .set({
        ...log,
        // Don't update createdAt on edit
      })
      .where(eq(activityLogs.id, id))
      .returning();
    return updated || null;
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(activityLogs)
      .where(eq(activityLogs.id, id))
      .returning();
    return !!deleted;
  }

  async createExerciseLog(log: InsertExerciseLog): Promise<ExerciseLog> {
    const [newLog] = await db.insert(exerciseLogs).values({
      ...log,
      completed: false,
      createdAt: new Date()
    }).returning();
    return newLog;
  }

  async getExerciseLogs(): Promise<ExerciseLog[]> {
    return db.select()
      .from(exerciseLogs)
      .orderBy(exerciseLogs.date);
  }

  async updateExerciseLog(id: number, completed: boolean): Promise<boolean> {
    const [updated] = await db
      .update(exerciseLogs)
      .set({ completed })
      .where(eq(exerciseLogs.id, id))
      .returning();
    return !!updated;
  }

  async getExercises(): Promise<Exercise[]> {
    return db.select().from(exercises);
  }

  async getExerciseCategories(): Promise<ExerciseCategory[]> {
    return db.select().from(exerciseCategories).orderBy(exerciseCategories.orderIndex);
  }

  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const [newEntry] = await db.insert(painEntries).values({
      ...entry,
      date: new Date(),
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