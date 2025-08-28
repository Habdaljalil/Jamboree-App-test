import { type Merchant, type Volunteer } from "@shared/schema";

// Google Sheets Service Configuration
const SHEET_ID = '1KCizb55EhOFAqmN-7SlBaUp0qHNJRZwFWhvG_ITno0w';
const API_KEY = 'AIzaSyBBJEfU6h_PQfVN4_H2eAo5spS0ZP6rsmc';
const MERCHANTS_RANGE = 'Sheet1!A:L'; // Merchant info in columns A to L
const VOLUNTEERS_RANGE = 'Sheet1!L:L'; // People list is in column L
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby43gvbpZK9-5jRyrV1z1XJ4KG_MudXk0ry1IM158WrBPcF4WAfJjJNvTwpFB8DR_wV/exec';

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
  async fetchMerchants(useCache = true): Promise<Merchant[]> {
    const cacheKey = 'merchants';
    const now = Date.now();
    
    if (useCache && cache.get(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${MERCHANTS_RANGE}?key=${API_KEY}`;
      console.log('Fetching merchants from Google Sheets:', url);
      
      const response = await fetch(url);
      const responseData = await response.json();
      
      console.log('Merchants response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${responseData.error?.message || 'Unknown error'}`);
      }
      
      if (!responseData.values || responseData.values.length === 0) {
        throw new Error('No merchant data found in range A:L. Please check if the sheet contains data in these columns.');
      }

      console.log('Merchant data found:', responseData.values.length, 'rows');
      console.log('First row (headers):', responseData.values[0]);
      
      const merchants = responseData.values.slice(1).map((row: string[], index: number): Merchant => {
        return {
          id: `merchant_${index}`,
          business_name: row[0] || '',   // Column A
          category: row[1] || '',        // Column B
          sub_category: row[2] || '',    // Column C
          address: row[3] || '',         // Column D
          contact_person: row[4] || '',   // Column E
          phone: row[5] || '',           // Column F
          email: row[6] || '',           // Column G
          status: row[7] || 'active',    // Column H
          assigned_to: row[11] || null,  // Column L (Cast Who Sold Ad)
        };
      }).filter((m: Merchant) => m.business_name.trim() !== '');

      console.log('Processed merchants:', merchants.length);
      
      cache.set(cacheKey, merchants);
      return merchants;
    } catch (error) {
      console.error('Error fetching merchants from Google Sheets:', error);
      throw error;
    }
  }

  async fetchVolunteers(): Promise<Volunteer[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${VOLUNTEERS_RANGE}?key=${API_KEY}`;
      console.log('Fetching volunteers from Google Sheets:', url);
      
      const response = await fetch(url);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${responseData.error?.message || 'Unknown error'}`);
      }
      
      if (!responseData.values || responseData.values.length === 0) {
        throw new Error('No volunteer data found in column L.');
      }
      
      // Extract unique, non-empty names from column L
      const volunteerNames = Array.from(new Set(responseData.values
        .slice(1) // Skip header row
        .map((row: string[]) => row[0]) 
        .filter((name: string) => name && name.trim() !== '')));
      
      return volunteerNames.map((name: string, index: number): Volunteer => ({
        id: `volunteer_${index}`,
        full_name: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`, // Mock email
        phone: `(201) 555-${String(index + 1000).padStart(4, '0')}`, // Mock phone
        role: "volunteer",
        active: true
      }));
    } catch (error) {
      console.error('Error fetching volunteers from Google Sheets:', error);
      // As a fallback, return an empty array to prevent crashes
      return [];
    }
  }

  async updateMerchantAssignment(merchantName: string, volunteerName: string): Promise<boolean> {
    try {
      // Client-side check for 3-assignment limit to prevent unnecessary API calls
      const merchants = await this.fetchMerchants(false);
      const currentAssignments = merchants.filter(m => m.assigned_to === volunteerName).length;
      if (currentAssignments >= 3) {
        throw new Error(`${volunteerName} already has 3 assignments. Maximum limit reached.`);
      }

      // Call the Apps Script endpoint
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantName, volunteerName })
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log(`✅ ${data.message}`);
        // Clear cache to force UI refresh
        cache.clear();
        return true;
      } else {
        // Throw an error with the message from the Apps Script
        throw new Error(data.message || "An unknown error occurred during assignment.");
      }
    } catch (err) {
      console.error("Assignment error:", err);
      // Re-throw the error so it can be caught by the UI
      throw err;
    }
  }

  async getAssignmentsByVolunteer(volunteerName: string): Promise<Merchant[]> {
    const allMerchants = await this.fetchMerchants();
    return allMerchants.filter(m => m.assigned_to === volunteerName);
  }
}

// Business icon mapping based on category and sub-category
export function getBusinessIcon(category: string, subCategory?: string): string {
  const iconMap: Record<string, Record<string, string> | string> = {
    restaurant: {
      pizza: "🍕",
      coffee: "☕",
      default: "🍽️"
    },
    retail: {
      clothing: "👔",
      grocery: "🛒",
      default: "🛍️"
    },
    health: {
      salon: "✂️",
      default: "🏥"
    },
    automotive: {
      "car-repair": "🚗",
      default: "🔧"
    },
    services: "🔧",
    default: "🏢"
  };

  const categoryIcons = iconMap[category.toLowerCase()];
  
  if (typeof categoryIcons === 'string') {
    return categoryIcons;
  }
  
  if (categoryIcons && subCategory) {
    return categoryIcons[subCategory.toLowerCase()] || categoryIcons.default || iconMap.default as string;
  }
  
  return iconMap.default as string;
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
