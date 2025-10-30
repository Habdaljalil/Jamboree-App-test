import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const merchants = pgTable("merchants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  business_name: text("business_name").notNull(),
  category: text("category").notNull(),
  sub_category: text("sub_category").notNull(),
  address: text("address").notNull(),
  contact_person: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  assigned_to: text("assigned_to"),
  previous_ad_size: text("previous_ad_size").default("did not purchase ad last year"),
  /*
  I added previous_ad_size; if there is no data, it will default to 
  `did not purchase ad last year`.
  */
});

export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  full_name: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("volunteer"),
  active: boolean("active").notNull().default(true),
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
});

export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type Merchant = typeof merchants.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;
