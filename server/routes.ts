import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMerchantSchema, insertVolunteerSchema, type Merchant, type Volunteer } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Merchants endpoints
  app.get("/api/merchants", async (req, res) => {
    try {
      const merchants = await storage.getMerchants();
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchants" });
    }
  });

  app.get("/api/merchants/:id", async (req, res) => {
    try {
      const merchant = await storage.getMerchant(req.params.id);
      if (!merchant) {
        return res.status(404).json({ message: "Merchant not found" });
      }
      res.json(merchant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant" });
    }
  });

  app.post("/api/merchants", async (req, res) => {
    try {
      const validatedData = insertMerchantSchema.parse(req.body);
      const merchant = await storage.createMerchant(validatedData);
      res.status(201).json(merchant);
    } catch (error) {
      res.status(400).json({ message: "Invalid merchant data" });
    }
  });

  app.patch("/api/merchants/:id", async (req, res) => {
    try {
      const merchant = await storage.updateMerchant(req.params.id, req.body);
      if (!merchant) {
        return res.status(404).json({ message: "Merchant not found" });
      }
      res.json(merchant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update merchant" });
    }
  });

  // Volunteers endpoints
  app.get("/api/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getVolunteers();
      res.json(volunteers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.post("/api/volunteers", async (req, res) => {
    try {
      const validatedData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(validatedData);
      res.status(201).json(volunteer);
    } catch (error) {
      res.status(400).json({ message: "Invalid volunteer data" });
    }
  });

  // Assignment endpoints
  app.post("/api/assignments", async (req, res) => {
    try {
      const { merchantId, volunteerName } = req.body;
      
      if (!merchantId || !volunteerName) {
        return res.status(400).json({ message: "Merchant ID and volunteer name are required" });
      }

      // Check if volunteer already has 3 assignments
      const existingAssignments = await storage.getAssignmentsByVolunteer(volunteerName);
      if (existingAssignments.length >= 3) {
        return res.status(400).json({ message: "Volunteer already has maximum of 3 assignments" });
      }

      const merchant = await storage.assignMerchantToVolunteer(merchantId, volunteerName);
      if (!merchant) {
        return res.status(404).json({ message: "Merchant not found" });
      }

      res.json(merchant);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign merchant" });
    }
  });

  app.get("/api/assignments/:volunteerName", async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByVolunteer(req.params.volunteerName);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
