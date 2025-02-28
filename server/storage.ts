import { 
  painEntries, 
  emailSubscriptions,
  analyticsEvents,
  type PainEntry, 
  type InsertPainEntry,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type InsertAnalyticsEvent,
  type AnalyticsEvent 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;

  // Email subscription methods
  createEmailSubscription(email: InsertEmailSubscription): Promise<EmailSubscription>;
  verifyEmailSubscription(token: string): Promise<boolean>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  isEmailSubscribed(email: string): Promise<boolean>;

  // Analytics tracking methods
  trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getEvents(eventName?: string): Promise<AnalyticsEvent[]>;
}

export class DatabaseStorage implements IStorage {
  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const [result] = await db.insert(painEntries).values(entry).returning();
    return result;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return db.select().from(painEntries).orderBy(painEntries.date);
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    const [entry] = await db.select().from(painEntries).where(eq(painEntries.id, id));
    return entry;
  }

  async createEmailSubscription(data: InsertEmailSubscription): Promise<EmailSubscription> {
    const verificationToken = randomBytes(32).toString('hex');

    const [subscription] = await db.insert(emailSubscriptions)
      .values({
        email: data.email,
        verificationToken,
        isVerified: false,
        dateSubscribed: new Date(),
        lastUpdated: new Date()
      })
      .returning();

    return subscription;
  }

  async verifyEmailSubscription(token: string): Promise<boolean> {
    const [subscription] = await db
      .update(emailSubscriptions)
      .set({ 
        isVerified: true, 
        verificationToken: null,
        lastUpdated: new Date()
      })
      .where(eq(emailSubscriptions.verificationToken, token))
      .returning();

    return !!subscription;
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
    const [result] = await db.insert(analyticsEvents)
      .values({
        ...event,
        timestamp: new Date()
      })
      .returning();
    return result;
  }

  async getEvents(eventName?: string): Promise<AnalyticsEvent[]> {
    const query = db.select().from(analyticsEvents);
    if (eventName) {
      query.where(eq(analyticsEvents.eventName, eventName));
    }
    return query;
  }
}

export const storage = new DatabaseStorage();