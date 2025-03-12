import { 
  type PainEntry, 
  type InsertPainEntry,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type InsertAnalyticsEvent,
  type AnalyticsEvent,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";

// Temporary in-memory storage for development
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
}

export class MemStorage implements IStorage {
  private painEntries: PainEntry[] = [];
  private emailSubscriptions: EmailSubscription[] = [];
  private analyticsEvents: AnalyticsEvent[] = [];
  private activityLogs: ActivityLog[] = [];
  private nextId = 1;

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      ...log,
      id: this.nextId++,
      createdAt: new Date()
    };
    this.activityLogs.push(newLog);
    return newLog;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.activityLogs;
  }

  async createPainEntry(entry: InsertPainEntry): Promise<PainEntry> {
    const newEntry = {
      ...entry,
      id: this.nextId++,
      date: new Date(),
      notes: entry.notes || null
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

  async createEmailSubscription(data: InsertEmailSubscription): Promise<EmailSubscription> {
    const subscription = {
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

  async trackEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const newEvent = {
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