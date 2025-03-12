import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPainEntrySchema, insertEmailSubscriptionSchema, insertAnalyticsEventSchema, insertActivityLogSchema, insertExerciseLogSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express) {
  // Security: Add request validation middleware
  const validateRequest = (schema: any) => {
    return (req: any, res: any, next: any) => {
      try {
        req.validatedData = schema.parse(req.body);
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
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", validateRequest(insertActivityLogSchema), async (req, res) => {
    try {
      const result = await storage.createActivityLog(req.validatedData);
      res.json(result);
    } catch (error) {
      console.error('Error creating activity log:', error);
      res.status(500).json({ error: "Failed to create activity log" });
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
      res.status(500).json({ error: "Failed to delete activity log" });
    }
  });

  // Exercise Logs Routes
  app.get("/api/exercise-logs", async (_req, res) => {
    try {
      const logs = await storage.getExerciseLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
      res.status(500).json({ error: "Failed to fetch exercise logs" });
    }
  });

  app.post("/api/exercise-logs", validateRequest(insertExerciseLogSchema), async (req, res) => {
    try {
      const result = await storage.createExerciseLog(req.validatedData);
      res.json(result);
    } catch (error) {
      console.error('Error creating exercise log:', error);
      res.status(500).json({ error: "Failed to create exercise log" });
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
      res.status(500).json({ error: "Failed to update exercise log" });
    }
  });

  //New Routes
  app.get("/api/exercises", async (_req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercise-categories", async (_req, res) => {
    try {
      const categories = await storage.getExerciseCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching exercise categories:', error);
      res.status(500).json({ error: "Failed to fetch exercise categories" });
    }
  });


  app.post("/api/pain-entries", validateRequest(insertPainEntrySchema), async (req, res) => {
    try {
      const result = await storage.createPainEntry(req.validatedData);
      res.json(result);
    } catch (error) {
      console.error('Error creating pain entry:', error);
      res.status(500).json({ error: "Failed to create pain entry" });
    }
  });

  app.get("/api/pain-entries", async (_req, res) => {
    try {
      const entries = await storage.getPainEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching pain entries:', error);
      res.status(500).json({ error: "Failed to fetch pain entries" });
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
      res.status(500).json({ error: "Failed to fetch pain entry" });
    }
  });

  app.post("/api/subscribe", validateRequest(insertEmailSubscriptionSchema), async (req, res) => {
    try {
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
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  app.get("/api/verify-subscription/:token", async (req, res) => {
    try {
      const success = await storage.verifyEmailSubscription(req.params.token);

      if (success) {
        res.json({ message: "Email subscription verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid or expired verification token" });
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      res.status(500).json({ error: "Failed to verify subscription" });
    }
  });

  app.post("/api/analytics", validateRequest(insertAnalyticsEventSchema), async (req, res) => {
    try {
      const event = await storage.trackEvent({
        ...req.validatedData,
        userAgent: req.headers['user-agent'],
        sessionId: req.sessionID
      });
      res.json(event);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  return createServer(app);
}