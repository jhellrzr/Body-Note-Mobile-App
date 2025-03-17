import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPainEntrySchema, insertEmailSubscriptionSchema, insertAnalyticsEventSchema } from "@shared/schema";
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

  app.post("/api/pain-entries", validateRequest(insertPainEntrySchema), async (req, res) => {
    try {
      const result = await storage.createPainEntry(req.validatedData);
      res.json(result);
    } catch (error) {
      // Security: Don't expose internal error details
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
      // Security: Validate id parameter
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

  // Email subscription routes
  app.post("/api/subscribe", validateRequest(insertEmailSubscriptionSchema), async (req, res) => {
    try {
      const existingSubscription = await storage.getEmailSubscription(req.validatedData.email);

      if (existingSubscription) {
        if (existingSubscription.isVerified) {
          return res.status(400).json({ error: "Email already subscribed" });
        } else {
          // Resend verification email logic would go here
          return res.status(200).json({ message: "Verification email resent" });
        }
      }

      const subscription = await storage.createEmailSubscription(req.validatedData);

      // Here you would send a verification email with the token
      // We'll keep this part secure by not exposing the token in the response

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

  // Analytics tracking endpoint
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