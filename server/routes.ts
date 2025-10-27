import type { Express } from "express";
import { createServer, type Server } from "http";

// Import Google Sheets Service
const SHEET_ID = "1KCizb55EhOFAqmN-7SlBaUp0qHNJRZwFWhvG_ITno0w";
const API_KEY = "AIzaSyBBJEfU6h_PQfVN4_H2eAo5spS0ZP6rsmc";
const MERCHANTS_RANGE = "Sheet1!A:L";
const VOLUNTEERS_RANGE = "Sheet1!L:L";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby43gvbpZK9-5jRyrV1z1XJ4KG_MudXk0ry1IM158WrBPcF4WAfJjJNvTwpFB8DR_wV/exec";
const MAX_ASSIGNMENTS_PER_VOLUNTEER = 3;

// Cache for Google Sheets data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

async function fetchFromGoogleSheets(range: string, useCache = true) {
  const cacheKey = `sheets_${range}`;
  const now = Date.now();

  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Google Sheets API error: ${data.error?.message || "Unknown error"}`,
    );
  }

  cache.set(cacheKey, { data, timestamp: now });
  return data;
}

function formatAddress(
  street: string,
  streetMaster: string,
  number: string,
  town: string,
  state: string,
): string {
  const parts: string[] = [];

  // Use street number if available
  if (number && number.trim()) {
    parts.push(number.trim());
  }

  // Use the main street name (prefer streetMaster if available, otherwise use street)
  const streetName =
    (streetMaster && streetMaster.trim()) || (street && street.trim());
  if (streetName) {
    parts.push(streetName);
  }

  // Add town and state
  if (town && town.trim()) {
    const townPart = town.trim();
    if (state && state.trim()) {
      parts.push(`${townPart}, ${state.trim()}`);
    } else {
      parts.push(townPart);
    }
  }

  return parts.join(" ");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Merchants endpoints
  app.get("/api/merchants", async (req, res) => {
    try {
      const responseData = await fetchFromGoogleSheets(MERCHANTS_RANGE);

      if (!responseData.values || responseData.values.length === 0) {
        return res.json([]);
      }

      const merchants = responseData.values
        .slice(1)
        .map((row: string[], index: number) => ({
          id: `merchant_${index}`,
          business_name: row[0] || "",
          category: row[7] || "", // Column H - Index Category
          sub_category: "", // Will be set dynamically in UI
          address: formatAddress(
            row[1] || "",
            row[2] || "",
            row[3] || "",
            row[4] || "",
            row[5] || "",
          ), // Column B-F for address
          contact_person: row[10] || "", // Column K - Advertiser Contact
          phone: row[8] || "", // Column I - Merchant Phone
          email: row[9] || "", // Column J - Advertiser E-mail
          status: "active",
          assigned_to: row[11] || null, // Column L - Cast Who Sold Ad
        }))
        .filter(
          (m: any) => m.business_name.trim() !== "" && m.category.trim() !== "",
        );

      res.json(merchants);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch merchants from Google Sheets" });
    }
  });

  // Volunteers endpoints
  app.get("/api/volunteers", async (req, res) => {
    try {
      const responseData = await fetchFromGoogleSheets(VOLUNTEERS_RANGE);

      if (!responseData.values || responseData.values.length === 0) {
        return res.json([]);
      }

      const volunteerNames = Array.from(
        new Set(
          responseData.values
            .slice(1)
            .map((row: string[]) => row[0])
            .filter((name: string) => name && name.trim() !== ""),
        ),
      );

      const volunteers = volunteerNames.map((name: string, index: number) => ({
        id: `volunteer_${index}`,
        full_name: name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
        phone: `(201) 555-${String(index + 1000).padStart(4, "0")}`,
        role: "volunteer",
        active: true,
      }));

      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch volunteers from Google Sheets" });
    }
  });

  // Assignment endpoints
  app.post("/api/assignments", async (req, res) => {
    try {
      const { merchantName, volunteerName } = req.body;

      if (!merchantName || !volunteerName) {
        return res
          .status(400)
          .json({ message: "Merchant name and volunteer name are required" });
      }

      // Check current assignments for the volunteer
      const responseData = await fetchFromGoogleSheets(MERCHANTS_RANGE, false);
      if (responseData.values) {
        const currentAssignments = responseData.values
          .slice(1)
          .filter((row: string[]) => row[11] === volunteerName).length;

        // if (currentAssignments >= MAX_ASSIGNMENTS_PER_VOLUNTEER) {
        //   return res
        //     .status(400)
        //     .json({
        //       message: "Volunteer already has maximum of 3 assignments",
        //     });
        // }
      }

      // Call the Apps Script endpoint to update the sheet
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantName, volunteerName }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Clear cache to force refresh
        cache.clear();
        res.json({ success: true, message: data.message });
      } else {
        res.status(400).json({ message: data.message || "Assignment failed" });
      }
    } catch (error) {
      console.error("Assignment error:", error);
      res.status(500).json({ message: "Failed to assign merchant" });
    }
  });

  app.get("/api/assignments/:volunteerName", async (req, res) => {
    try {
      const volunteerName = req.params.volunteerName;
      const responseData = await fetchFromGoogleSheets(MERCHANTS_RANGE);

      if (!responseData.values || responseData.values.length === 0) {
        return res.json([]);
      }

      const assignments = responseData.values
        .slice(1)
        .filter((row: string[]) => row[11] === volunteerName)
        .map((row: string[], index: number) => ({
          id: `merchant_${index}`,
          business_name: row[0] || "",
          category: row[3] || "",
          sub_category: row[2] || "",
          address: row[3] || "",
          contact_person: row[4] || "",
          phone: row[5] || "",
          email: row[6] || "",
          status: row[7] || "active",
          assigned_to: row[11] || null,
        }));

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
