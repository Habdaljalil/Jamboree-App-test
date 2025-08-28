import { type Merchant, type InsertMerchant, type Volunteer, type InsertVolunteer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Merchants
  getMerchants(): Promise<Merchant[]>;
  getMerchant(id: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  updateMerchant(id: string, merchant: Partial<Merchant>): Promise<Merchant | undefined>;
  
  // Volunteers
  getVolunteers(): Promise<Volunteer[]>;
  getVolunteer(id: string): Promise<Volunteer | undefined>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  
  // Assignment operations
  assignMerchantToVolunteer(merchantId: string, volunteerName: string): Promise<Merchant | undefined>;
  getAssignmentsByVolunteer(volunteerName: string): Promise<Merchant[]>;
}

export class MemStorage implements IStorage {
  private merchants: Map<string, Merchant>;
  private volunteers: Map<string, Volunteer>;

  constructor() {
    this.merchants = new Map();
    this.volunteers = new Map();
    this.seedData();
  }

  private seedData() {
    // Sample merchants
    const sampleMerchants: InsertMerchant[] = [
      {
        business_name: "Tony's Pizza Palace",
        category: "restaurant",
        sub_category: "pizza",
        address: "123 Main Street, Ridgewood, NJ 07450",
        contact_person: "Tony Rossi",
        phone: "(201) 555-0123",
        email: "tony@tonypizza.com",
        status: "active",
        assigned_to: null,
      },
      {
        business_name: "Bella's Beauty Salon",
        category: "health",
        sub_category: "salon",
        address: "456 Oak Avenue, Ridgewood, NJ 07450",
        contact_person: "Isabella Martinez",
        phone: "(201) 555-0456",
        email: "bella@bellasalon.com",
        status: "active",
        assigned_to: "Sarah Johnson",
      },
      {
        business_name: "Ridgewood Coffee Co.",
        category: "restaurant",
        sub_category: "coffee",
        address: "789 Elm Street, Ridgewood, NJ 07450",
        contact_person: "Jake Morrison",
        phone: "(201) 555-0789",
        email: "info@ridgewoodcoffee.com",
        status: "active",
        assigned_to: null,
      },
      {
        business_name: "Elite Auto Repair",
        category: "automotive",
        sub_category: "car-repair",
        address: "321 Pine Road, Ridgewood, NJ 07450",
        contact_person: "Marcus Williams",
        phone: "(201) 555-0321",
        email: "marcus@eliteauto.com",
        status: "active",
        assigned_to: "Mike Chen",
      },
      {
        business_name: "Fashion Forward Boutique",
        category: "retail",
        sub_category: "clothing",
        address: "654 Cedar Lane, Ridgewood, NJ 07450",
        contact_person: "Amanda Foster",
        phone: "(201) 555-0654",
        email: "amanda@fashionforward.com",
        status: "active",
        assigned_to: null,
      },
      {
        business_name: "Green Garden Market",
        category: "retail",
        sub_category: "grocery",
        address: "987 Maple Drive, Ridgewood, NJ 07450",
        contact_person: "Tom Anderson",
        phone: "(201) 555-0987",
        email: "tom@greengardenmarket.com",
        status: "active",
        assigned_to: "Sarah Johnson",
      },
    ];

    // Sample volunteers
    const sampleVolunteers: InsertVolunteer[] = [
      {
        full_name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "(201) 555-1001",
        role: "volunteer",
        active: true,
      },
      {
        full_name: "Mike Chen",
        email: "mike.chen@email.com",
        phone: "(201) 555-1002",
        role: "volunteer",
        active: true,
      },
      {
        full_name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        phone: "(201) 555-1003",
        role: "volunteer",
        active: true,
      },
      {
        full_name: "David Kim",
        email: "david.kim@email.com",
        phone: "(201) 555-1004",
        role: "volunteer",
        active: true,
      },
      {
        full_name: "Lisa Thompson",
        email: "lisa.thompson@email.com",
        phone: "(201) 555-1005",
        role: "volunteer",
        active: true,
      },
    ];

    // Seed merchants
    sampleMerchants.forEach(merchant => {
      const id = randomUUID();
      this.merchants.set(id, { ...merchant, id });
    });

    // Seed volunteers
    sampleVolunteers.forEach(volunteer => {
      const id = randomUUID();
      this.volunteers.set(id, { ...volunteer, id });
    });
  }

  async getMerchants(): Promise<Merchant[]> {
    return Array.from(this.merchants.values());
  }

  async getMerchant(id: string): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const id = randomUUID();
    const merchant: Merchant = { ...insertMerchant, id };
    this.merchants.set(id, merchant);
    return merchant;
  }

  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<Merchant | undefined> {
    const merchant = this.merchants.get(id);
    if (!merchant) return undefined;
    
    const updatedMerchant = { ...merchant, ...updates };
    this.merchants.set(id, updatedMerchant);
    return updatedMerchant;
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values());
  }

  async getVolunteer(id: string): Promise<Volunteer | undefined> {
    return this.volunteers.get(id);
  }

  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    const id = randomUUID();
    const volunteer: Volunteer = { ...insertVolunteer, id };
    this.volunteers.set(id, volunteer);
    return volunteer;
  }

  async assignMerchantToVolunteer(merchantId: string, volunteerName: string): Promise<Merchant | undefined> {
    return this.updateMerchant(merchantId, { assigned_to: volunteerName });
  }

  async getAssignmentsByVolunteer(volunteerName: string): Promise<Merchant[]> {
    const allMerchants = await this.getMerchants();
    return allMerchants.filter(m => m.assigned_to === volunteerName);
  }
}

export const storage = new MemStorage();
