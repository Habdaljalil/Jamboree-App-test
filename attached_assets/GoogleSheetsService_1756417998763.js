
export class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1KCizb55EhOFAqmN-7SlBaUp0qHNJRZwFWhvG_ITno0w';
    this.API_KEY = 'AIzaSyBBJEfU6h_PQfVN4_H2eAo5spS0ZP6rsmc';
    this.MERCHANTS_RANGE = 'Sheet1!A:L'; // Merchant info in columns A to L
    this.VOLUNTEERS_RANGE = 'Sheet1!L:L'; // People list is in column L
    this.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby43gvbpZK9-5jRyrV1z1XJ4KG_MudXk0ry1IM158WrBPcF4WAfJjJNvTwpFB8DR_wV/exec';
    this.cache = new Map();
    this.cacheExpiry = 30000; // 30 seconds cache
  }

  async fetchMerchants(useCache = true) {
    const cacheKey = 'merchants';
    const now = Date.now();
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values/${this.MERCHANTS_RANGE}?key=${this.API_KEY}`;
      console.log('Fetching merchants from URL:', url);
      
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
      
      const merchants = responseData.values.slice(1).map((row, index) => {
        const merchant = {
          id: `merchant_${index}`,
          business_name: row[0] || '',   // Column A
          category: row[1] || '',        // Column B
          sub_category: row[2] || '',    // Column C
          address: row[3] || '',         // Column D
          contact_person: row[4] || '',   // Column E
          phone: row[5] || '',           // Column F
          email: row[6] || '',           // Column G
          status: row[7] || 'active',    // Column H
          // Columns I, J, K are skipped as per UI requirements
          assigned_to: row[11] || '',      // Column L (Cast Who Sold Ad)
          row_index: index + 2 
        };
        return merchant;
      }).filter(m => m.business_name.trim() !== '');

      console.log('Processed merchants:', merchants.length);
      
      this.cache.set(cacheKey, { data: merchants, timestamp: now });
      return merchants;
    } catch (error) {
      console.error('Error fetching merchants from Google Sheets:', error);
      throw error;
    }
  }

  async fetchVolunteers() {
    try {
      // Use VOLUNTEERS_RANGE which points to column L
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values/${this.VOLUNTEERS_RANGE}?key=${this.API_KEY}`;
      console.log('Fetching volunteers from URL:', url);
      
      const response = await fetch(url);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${responseData.error?.message || 'Unknown error'}`);
      }
      
      if (!responseData.values || responseData.values.length === 0) {
        throw new Error('No volunteer data found in column L.');
      }
      
      // Extract unique, non-empty names from column L
      const volunteerNames = [...new Set(responseData.values
        .slice(1) // Skip header row
        .map(row => row[0]) 
        .filter(name => name && name.trim() !== ''))];
      
      return volunteerNames.map((name, index) => ({
        id: `volunteer_${index}`,
        full_name: name,
        active: true
      }));
    } catch (error) {
      console.error('Error fetching volunteers from Google Sheets:', error);
      // As a fallback, return an empty array to prevent crashes
      return [];
    }
  }

  async updateMerchantAssignment(merchantName, volunteerName) {
    try {
      // Client-side check for 3-assignment limit to prevent unnecessary API calls
      const merchants = await this.fetchMerchants(false);
      const currentAssignments = merchants.filter(m => m.assigned_to === volunteerName).length;
      if (currentAssignments >= 3) {
        throw new Error(`${volunteerName} already has 3 assignments. Maximum limit reached.`);
      }

      // Call the Apps Script endpoint
      const response = await fetch(this.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantName, volunteerName })
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log(`✅ ${data.message}`);
        // Clear cache to force UI refresh
        this.cache.clear();
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

  getBusinessIcon(category, subCategory) {
    const iconMap = {
      'restaurant': '🍽️',
      'food': '🍔',
      'pizza': '🍕',
      'coffee': '☕',
      'bakery': '🥖',
      'grocery': '🛒',
      'fitness': '💪',
      'gym': '🏋️',
      'health': '🏥',
      'beauty': '💄',
      'salon': '✂️',
      'retail': '🛍️',
      'clothing': '👔',
      'automotive': '🚗',
      'real estate': '🏠',
      'finance': '💰',
      'technology': '💻',
      'education': '📚',
      'entertainment': '🎬',
      'services': '⚙️',
      'default': '🏢'
    };

    const key = (category + ' ' + (subCategory || '')).toLowerCase();
    
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (key.includes(keyword)) {
        return icon;
      }
    }
    
    return iconMap.default;
  }
}

export const googleSheetsService = new GoogleSheetsService();

