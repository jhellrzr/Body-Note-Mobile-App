import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPainEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/pain-entries", async (req, res) => {
    try {
      const entry = insertPainEntrySchema.parse(req.body);
      const result = await storage.createPainEntry(entry);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid pain entry data" });
    }
  });

  app.get("/api/pain-entries", async (_req, res) => {
    const entries = await storage.getPainEntries();
    res.json(entries);
  });

  app.get("/api/pain-entries/:id", async (req, res) => {
    const entry = await storage.getPainEntry(Number(req.params.id));
    if (!entry) {
      res.status(404).json({ error: "Pain entry not found" });
      return;
    }
    res.json(entry);
  });

  return createServer(app);
}
