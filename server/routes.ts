import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPainEntrySchema, insertEmailSubscriptionSchema, insertAnalyticsEventSchema, insertActivityLogSchema, insertExerciseLogSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Extend Request type for validation
interface ValidatedRequest<T = unknown> extends Request {
  validatedData: T;
}

export async function registerRoutes(app: Express) {
  // Security: Add request validation middleware
  const validateRequest = <T>(schema: any) => {
    return (req: Request, res: Response, next: any) => {
      try {
        (req as ValidatedRequest<T>).validatedData = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({
            error: "Validation failed",
            details: validationError.message
          });
        } else {
          next(error);
        }
      }
    };
  };

  // Activity Logs Routes
  app.get("/api/activity-logs", async (_req, res) => {
    try {
      console.log('GET /api/activity-logs - Fetching activity logs');
      const logs = await storage.getActivityLogs();
      console.log(`GET /api/activity-logs - Retrieved ${logs.length} logs`);
      res.json(logs);
    } catch (error) {
      console.error('Error in GET /api/activity-logs:', error);
      res.status(500).json({ 
        error: "Failed to fetch activity logs",
        details: error.message 
      });
    }
  });

  app.post("/api/activity-logs", validateRequest(insertActivityLogSchema), async (req: ValidatedRequest, res) => {
    try {
      console.log('POST /api/activity-logs - Creating new log:', req.validatedData);
      const result = await storage.createActivityLog(req.validatedData);
      console.log('POST /api/activity-logs - Created log:', result);
      res.json(result);
    } catch (error) {
      console.error('Error in POST /api/activity-logs:', error);
      res.status(500).json({ 
        error: "Failed to create activity log",
        details: error.message 
      });
    }
  });

  app.put("/api/activity-logs/:id", validateRequest(insertActivityLogSchema), async (req: ValidatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const result = await storage.updateActivityLog(id, req.validatedData);
      if (!result) {
        return res.status(404).json({ error: "Activity log not found" });
      }
      res.json(result);
    } catch (error) {
      console.error('Error updating activity log:', error);
      res.status(500).json({ error: "Failed to update activity log", details: error.message });
    }
  });

  app.delete("/api/activity-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const success = await storage.deleteActivityLog(id);
      if (!success) {
        return res.status(404).json({ error: "Activity log not found" });
      }

      res.json({ message: "Activity log deleted successfully" });
    } catch (error) {
      console.error('Error deleting activity log:', error);
      res.status(500).json({ error: "Failed to delete activity log", details: error.message });
    }
  });

  // Exercise Logs Routes
  app.get("/api/exercise-logs", async (_req, res) => {
    try {
      console.log('GET /api/exercise-logs - Fetching exercise logs');
      const logs = await storage.getExerciseLogs();
      console.log(`GET /api/exercise-logs - Retrieved ${logs.length} logs`);
      res.json(logs);
    } catch (error) {
      console.error('Error in GET /api/exercise-logs:', error);
      res.status(500).json({ 
        error: "Failed to fetch exercise logs",
        details: error.message 
      });
    }
  });

  app.post("/api/exercise-logs", validateRequest(insertExerciseLogSchema), async (req: ValidatedRequest, res) => {
    try {
      console.log('POST /api/exercise-logs - Creating new log:', req.validatedData);
      const result = await storage.createExerciseLog(req.validatedData);
      console.log('POST /api/exercise-logs - Created log:', result);
      res.json(result);
    } catch (error) {
      console.error('Error in POST /api/exercise-logs:', error);
      res.status(500).json({ 
        error: "Failed to create exercise log",
        details: error.message 
      });
    }
  });

  app.put("/api/exercise-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const { completed } = req.body;
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: "Completed status must be a boolean" });
      }

      const success = await storage.updateExerciseLog(id, completed);
      if (!success) {
        return res.status(404).json({ error: "Exercise log not found" });
      }

      res.json({ message: "Exercise log updated successfully" });
    } catch (error) {
      console.error('Error updating exercise log:', error);
      res.status(500).json({ error: "Failed to update exercise log", details: error.message });
    }
  });

  // Exercise and Category Routes
  app.get("/api/exercises", async (_req, res) => {
    try {
      console.log('GET /api/exercises - Fetching exercises');
      const exercises = await storage.getExercises();
      console.log(`GET /api/exercises - Retrieved ${exercises.length} exercises`);
      res.json(exercises);
    } catch (error) {
      console.error('Error in GET /api/exercises:', error);
      res.status(500).json({ error: "Failed to fetch exercises", details: error.message });
    }
  });

  app.get("/api/exercise-categories", async (_req, res) => {
    try {
      console.log('GET /api/exercise-categories - Fetching exercise categories');
      const categories = await storage.getExerciseCategories();
      console.log(`GET /api/exercise-categories - Retrieved ${categories.length} categories`);
      res.json(categories);
    } catch (error) {
      console.error('Error in GET /api/exercise-categories:', error);
      res.status(500).json({ error: "Failed to fetch exercise categories", details: error.message });
    }
  });

  // Pain Entries Routes
  app.post("/api/pain-entries", validateRequest(insertPainEntrySchema), async (req: ValidatedRequest, res) => {
    try {
      console.log('POST /api/pain-entries - Creating new pain entry:', req.validatedData);
      const result = await storage.createPainEntry(req.validatedData);
      console.log('POST /api/pain-entries - Created pain entry:', result);
      res.json(result);
    } catch (error) {
      console.error('Error in POST /api/pain-entries:', error);
      res.status(500).json({ error: "Failed to create pain entry", details: error.message });
    }
  });

  app.get("/api/pain-entries", async (_req, res) => {
    try {
      console.log('GET /api/pain-entries - Fetching pain entries');
      const entries = await storage.getPainEntries();
      console.log(`GET /api/pain-entries - Retrieved ${entries.length} entries`);
      res.json(entries);
    } catch (error) {
      console.error('Error in GET /api/pain-entries:', error);
      res.status(500).json({ error: "Failed to fetch pain entries", details: error.message });
    }
  });

  app.get("/api/pain-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const entry = await storage.getPainEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Pain entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error('Error fetching pain entry:', error);
      res.status(500).json({ error: "Failed to fetch pain entry", details: error.message });
    }
  });

  // Email Subscription Routes
  app.post("/api/subscribe", validateRequest(insertEmailSubscriptionSchema), async (req: ValidatedRequest, res) => {
    try {
      console.log('POST /api/subscribe - Processing subscription:', req.validatedData);
      const existingSubscription = await storage.getEmailSubscription(req.validatedData.email);

      if (existingSubscription) {
        if (existingSubscription.isVerified) {
          return res.status(400).json({ error: "Email already subscribed" });
        } else {
          return res.status(200).json({ message: "Verification email resent" });
        }
      }

      const subscription = await storage.createEmailSubscription(req.validatedData);

      res.status(201).json({
        message: "Please check your email to verify your subscription",
        email: subscription.email
      });
    } catch (error) {
      console.error('Error in POST /api/subscribe:', error);
      res.status(500).json({ error: "Failed to process subscription", details: error.message });
    }
  });

  app.get("/api/verify-subscription/:token", async (req, res) => {
    try {
      console.log('GET /api/verify-subscription/:token - Verifying subscription');
      const success = await storage.verifyEmailSubscription(req.params.token);

      if (success) {
        res.json({ message: "Email subscription verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid or expired verification token" });
      }
    } catch (error) {
      console.error('Error in GET /api/verify-subscription/:token:', error);
      res.status(500).json({ error: "Failed to verify subscription", details: error.message });
    }
  });

  // Analytics Routes
  app.post("/api/analytics", validateRequest(insertAnalyticsEventSchema), async (req: ValidatedRequest, res) => {
    try {
      console.log('POST /api/analytics - Tracking analytics event:', req.validatedData);
      const event = await storage.trackEvent({
        ...req.validatedData,
        userAgent: req.headers['user-agent'] || null,
        sessionId: (req as any).sessionID || null
      });
      console.log('POST /api/analytics - Tracked event:', event);
      res.json(event);
    } catch (error) {
      console.error('Error in POST /api/analytics:', error);
      res.status(500).json({ error: "Failed to track event", details: error.message });
    }
  });

  return createServer(app);
}