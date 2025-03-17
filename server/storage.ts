import { 
  type PainEntry, 
  type InsertPainEntry,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type InsertAnalyticsEvent,
  type AnalyticsEvent,
  type User,
  type InsertUser
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Temporary in-memory storage for development
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

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

export class MemStorage implements IStorage {
  private painEntries: PainEntry[] = [];
  private emailSubscriptions: EmailSubscription[] = [];
  private analyticsEvents: AnalyticsEvent[] = [];
  private users: User[] = [];
  private nextId = 1;
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    const user = {
      ...userData,
      id: this.nextId++,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  // Pain entry operations
  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const newEntry: PainEntry = {
      ...entry,
      id: this.nextId++,
      date: new Date(),
      notes: entry.notes || null,
      injuryId: entry.injuryId || null
    };
    this.painEntries.push(newEntry);
    return newEntry;
  }

  async getPainEntries(): Promise<PainEntry[]> {
    return this.painEntries;
  }

  async getPainEntry(id: number): Promise<PainEntry | undefined> {
    return this.painEntries.find(entry => entry.id === id);
  }

  // Email subscription operations
  async createEmailSubscription(data: InsertEmailSubscription): Promise<EmailSubscription> {
    const subscription: EmailSubscription = {
      id: this.nextId++,
      email: data.email,
      dateSubscribed: new Date(),
      isVerified: false,
      verificationToken: Math.random().toString(36).substring(2),
      lastUpdated: new Date()
    };
    this.emailSubscriptions.push(subscription);
    return subscription;
  }

  async verifyEmailSubscription(token: string): Promise<boolean> {
    const subscription = this.emailSubscriptions.find(s => s.verificationToken === token);
    if (subscription) {
      subscription.isVerified = true;
      subscription.verificationToken = null;
      subscription.lastUpdated = new Date();
      return true;
    }
    return false;
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    return this.emailSubscriptions.find(s => s.email === email);
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    const subscription = await this.getEmailSubscription(email);
    return !!subscription?.isVerified;
  }

  // Analytics operations
  async trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const newEvent: AnalyticsEvent = {
      ...event,
      id: this.nextId++,
      timestamp: new Date(),
      metadata: event.metadata || null,
      sessionId: event.sessionId || null,
      userAgent: event.userAgent || null
    };
    this.analyticsEvents.push(newEvent);
    return newEvent;
  }

  async getEvents(eventName?: string): Promise<AnalyticsEvent[]> {
    if (eventName) {
      return this.analyticsEvents.filter(e => e.eventName === eventName);
    }
    return this.analyticsEvents;
  }
}

// Export an instance of MemStorage instead of DatabaseStorage
export const storage = new MemStorage();