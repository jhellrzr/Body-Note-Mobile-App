import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  type PainEntry, 
  type InsertPainEntry,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type InsertAnalyticsEvent,
  type AnalyticsEvent,
  type User,
  type InsertUser,
  type Injury,
  type InsertInjury,
  users,
  injuries,
  painEntries,
  emailSubscriptions,
  analyticsEvents
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Injury operations
  createInjury(injury: InsertInjury): Promise<Injury>;
  getInjuries(userId: number): Promise<Injury[]>;
  getInjury(id: number): Promise<Injury | undefined>;

  // Existing operations
  createPainEntry(entry: InsertPainEntry): Promise<PainEntry>;
  getPainEntries(): Promise<PainEntry[]>;
  getPainEntry(id: number): Promise<PainEntry | undefined>;
  createEmailSubscription(email: InsertEmailSubscription): Promise<EmailSubscription>;
  verifyEmailSubscription(token: string): Promise<boolean>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  isEmailSubscribed(email: string): Promise<boolean>;
  trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getEvents(eventName?: string): Promise<AnalyticsEvent[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // Injury operations
  async createInjury(injuryData: InsertInjury): Promise<Injury> {
    const [injury] = await db.insert(injuries).values(injuryData).returning();
    return injury;
  }

  async getInjuries(userId: number): Promise<Injury[]> {
    return db.select().from(injuries).where(eq(injuries.userId, userId));
  }

  async getInjury(id: number): Promise<Injury | undefined> {
    const [injury] = await db.select().from(injuries).where(eq(injuries.id, id));
    return injury;
  }

  // Pain entry operations
  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    // Ensure painMarkers is properly structured as an array
    const [painEntry] = await db.insert(painEntries).values({
      ...entry,
      painMarkers: Array.isArray(entry.painMarkers) ? entry.painMarkers : []
    }).returning();
    return painEntry;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return db.select().from(painEntries);
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    const [entry] = await db.select().from(painEntries).where(eq(painEntries.id, id));
    return entry;
  }

  // Email subscription operations
  async createEmailSubscription(data: InsertEmailSubscription): Promise<EmailSubscription> {
    const [subscription] = await db
      .insert(emailSubscriptions)
      .values({
        ...data,
        isVerified: false,
        verificationToken: Math.random().toString(36).substring(2),
      })
      .returning();
    return subscription;
  }

  async verifyEmailSubscription(token: string): Promise<boolean> {
    const [subscription] = await db
      .update(emailSubscriptions)
      .set({ isVerified: true, verificationToken: null })
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

  // Analytics operations
  async trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [analyticsEvent] = await db
      .insert(analyticsEvents)
      .values(event)
      .returning();
    return analyticsEvent;
  }

  async getEvents(eventName?: string): Promise<AnalyticsEvent[]> {
    if (eventName) {
      return db
        .select()
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventName, eventName));
    }
    return db.select().from(analyticsEvents);
  }
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();