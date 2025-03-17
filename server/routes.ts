import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPainEntrySchema, insertActivityLogSchema } from "@shared/schema";
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

  app.post("/api/activity-logs", validateRequest(insertActivityLogSchema), async (req: any, res) => {
    try {
      console.log('Received activity log data:', req.validatedData);

      const result = await storage.createActivityLog(req.validatedData);
      console.log('Created activity log:', result);

      res.json(result);
    } catch (error) {
      console.error('Error creating activity log:', error);
      res.status(500).json({ 
        error: "Failed to create activity log",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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

  return createServer(app);
}