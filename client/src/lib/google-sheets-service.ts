import { type Merchant, type Volunteer } from "@shared/schema";

// Google Sheets Service Configuration

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const MERCHANTS_RANGE = import.meta.env.VITE_MERCHANTS_RANGE; // Merchant info in columns A to L
const VOLUNTEERS_RANGE = import.meta.env.VITE_VOLUNTEERS_RANGE; // People list is in column L
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// Cache implementation for better performance
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 30000; // 30 seconds TTL

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// Google Sheets Service Class
export class GoogleSheetsService {
  private formatAddress(
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
  async fetchMerchants(useCache = true): Promise<Merchant[]> {
    const cacheKey = "merchants";
    const now = Date.now();

    if (useCache && cache.get(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${MERCHANTS_RANGE}?key=${API_KEY}`;
      console.log("Fetching merchants from Google Sheets:", url);

      const response = await fetch(url);
      const responseData = await response.json();

      console.log("Merchants response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Google Sheets API error: ${responseData.error?.message || "Unknown error"}`,
        );
      }

      if (!responseData.values || responseData.values.length === 0) {
        throw new Error(
          "No merchant data found in range A:L. Please check if the sheet contains data in these columns.",
        );
      }

      console.log("Merchant data found:", responseData.values.length, "rows");
      console.log("First row (headers):", responseData.values[0]);

      const merchants = responseData.values
        .slice(1)
        .map((row: string[], index: number): Merchant => {
          return {
            id: `merchant_${index}`,
            business_name: row[0] || "", // Column A - Business Name
            category: row[7] || "", // Column H - Index Category
            sub_category: "", // Will be set dynamically in UI
            address: this.formatAddress(row[1], row[2], row[3], row[4], row[5]), // Formatted address
            contact_person: row[10] || "", // Column K - Advertiser Contact
            phone: row[8] || "", // Column I - Merchant Phone
            email: row[9] || "", // Column J - Advertiser E-mail
            status: "active",
            assigned_to: row[11] || null, // Column L - Cast Who Sold Ad
          };
        })
        .filter((m: Merchant) => m.business_name.trim() !== "");

      console.log("Processed merchants:", merchants.length);

      cache.set(cacheKey, merchants);
      return merchants;
    } catch (error) {
      console.error("Error fetching merchants from Google Sheets:", error);
      throw error;
    }
  }

  async fetchVolunteers(): Promise<Volunteer[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${VOLUNTEERS_RANGE}?key=${API_KEY}`;
      console.log("Fetching volunteers from Google Sheets:", url);

      const response = await fetch(url);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          `Google Sheets API error: ${responseData.error?.message || "Unknown error"}`,
        );
      }

      if (!responseData.values || responseData.values.length === 0) {
        throw new Error("No volunteer data found in column L.");
      }

      // Extract unique, non-empty names from column L
      const volunteerNames = Array.from(
        new Set(
          responseData.values
            .slice(1) // Skip header row
            .map((row: string[]) => row[0])
            .filter((name: string) => name && name.trim() !== ""),
        ),
      );

      return volunteerNames.map(
        (name: string, index: number): Volunteer => ({
          id: `volunteer_${index}`,
          full_name: name,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`, // Mock email
          phone: `(201) 555-${String(index + 1000).padStart(4, "0")}`, // Mock phone
          role: "volunteer",
          active: true,
        }),
      );
    } catch (error) {
      console.error("Error fetching volunteers from Google Sheets:", error);
      // As a fallback, return an empty array to prevent crashes
      return [];
    }
  }

  async updateMerchantAssignment(
    merchantName: string,
    volunteerName: string,
  ): Promise<boolean> {
    try {
      // Client-side check for 3-assignment limit to prevent unnecessary API calls
      const merchants = await this.fetchMerchants(false);
      const currentAssignments = merchants.filter(
        (m) => m.assigned_to === volunteerName,
      ).length;
      if (currentAssignments >= 3) {
        throw new Error(
          `${volunteerName} already has 3 assignments. Maximum limit reached.`,
        );
      }

      // Call the Apps Script endpoint
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantName, volunteerName }),
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log(`✅ ${data.message}`);
        // Clear cache to force UI refresh
        cache.clear();
        return true;
      } else {
        // Throw an error with the message from the Apps Script
        throw new Error(
          data.message || "An unknown error occurred during assignment.",
        );
      }
    } catch (err) {
      console.error("Assignment error:", err);
      // Re-throw the error so it can be caught by the UI
      throw err;
    }
  }

  async getAssignmentsByVolunteer(volunteerName: string): Promise<Merchant[]> {
    const allMerchants = await this.fetchMerchants();
    return allMerchants.filter((m) => m.assigned_to === volunteerName);
  }
}

// Business icon mapping based on category and sub-category
export function getBusinessIcon(
  category: string,
  subCategory?: string,
): string {
  const iconMap: Record<string, Record<string, string> | string> = {
    restaurant: {
      pizza: "🍕",
      coffee: "☕",
      default: "🍽️",
    },
    retail: {
      clothing: "👔",
      grocery: "🛒",
      default: "🛍️",
    },
    health: {
      salon: "✂️",
      default: "🏥",
    },
    automotive: {
      "car-repair": "🚗",
      default: "🔧",
    },
    services: "🔧",
    default: "🏢",
  };

  const categoryIcons = iconMap[category.toLowerCase()];

  if (typeof categoryIcons === "string") {
    return categoryIcons;
  }

  if (categoryIcons && subCategory) {
    return (
      categoryIcons[subCategory.toLowerCase()] ||
      categoryIcons.default ||
      (iconMap.default as string)
    );
  }

  return iconMap.default as string;
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
