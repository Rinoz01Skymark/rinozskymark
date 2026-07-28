import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users/Accounts table
export const users = pgTable("users", {
  id: serial().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).default(""),
  company: varchar("company", { length: 255 }).default(""),
  role: varchar("role", { length: 50 }).notNull().default("customer"), // "customer" or "admin"
  password: varchar("password", { length: 255 }).default(""), // Hashed password or empty if using Netlify Identity
  netlifyIdentityId: varchar("netlify_identity_id", { length: 255 }).default(""),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services catalog - expanded with all 7 categories
export const services = pgTable("services", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Digital Services, Business & Documentation, Government & Online Application Assistance, Career & Professional Services, Architecture & 3D Design, Education & Student Support, Other Digital Support
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  features: text("features").array().notNull().default([]),
  benefits: text("benefits").array().notNull().default([]),
  suitableCustomer: text("suitable_customer").notNull().default(""),
  pricing: varchar("pricing", { length: 255 }).notNull().default("Custom quote"),
  estimatedTurnaround: varchar("estimated_turnaround", { length: 100 }).default(""),
  icon: varchar("icon", { length: 255 }).default(""), // Icon name or emoji
  imageUrl: varchar("image_url", { length: 500 }).default(""),
  imageAlt: varchar("image_alt", { length: 255 }).default(""),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Requests - enhanced
export const serviceRequests = pgTable("service_requests", {
  id: serial().primaryKey(),
  userId: integer("user_id"),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  serviceId: integer("service_id"),
  serviceTitle: varchar("service_title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  preferredDate: varchar("preferred_date", { length: 50 }).default(""),
  documentNames: text("document_names").array().default([]), // Names of uploaded documents
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // Pending, Received, In Progress, Awaiting Customer, Completed, Cancelled
  budget: varchar("budget", { length: 100 }).default(""),
  notes: text("notes").default(""),
  adminNotes: text("admin_notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Account Profile
export const customerProfiles = pgTable("customer_profiles", {
  id: serial().primaryKey(),
  userId: integer("user_id").notNull().unique(),
  company: varchar("company", { length: 255 }).default(""),
  industry: varchar("industry", { length: 100 }).default(""),
  website: varchar("website", { length: 255 }).default(""),
  businessType: varchar("business_type", { length: 100 }).default(""), // Individual, Startup, SME, Enterprise
  location: varchar("location", { length: 255 }).default(""),
  bio: text("bio").default(""),
  profileComplete: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial().primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientCompany: varchar("client_company", { length: 255 }).default(""),
  serviceCategory: varchar("service_category", { length: 100 }).default(""),
  testimonialText: text("testimonial_text").notNull(),
  rating: integer("rating").default(5), // 1-5 stars
  photoUrl: varchar("photo_url", { length: 500 }).default(""),
  featured: boolean().notNull().default(false),
  published: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Process/How it Works
export const processSteps = pgTable("process_steps", {
  id: serial().primaryKey(),
  stepNumber: integer("step_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }).default(""),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings (legacy, kept for compatibility)
export const bookings = pgTable("bookings", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  serviceRequired: varchar("service_required", { length: 255 }).notNull(),
  preferredDate: varchar("preferred_date", { length: 50 }).notNull(),
  projectDescription: text("project_description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("New request"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inquiries (legacy, kept for compatibility)
export const inquiries = pgTable("inquiries", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).default(""),
  service: varchar("service", { length: 255 }).notNull().default("General"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients (legacy, kept for compatibility)
export const clients = pgTable("clients", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).default(""),
  company: varchar("company", { length: 255 }).default(""),
  status: varchar("status", { length: 50 }).notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("Business"),
  author: varchar("author", { length: 255 }).default("RINOZ01SKYMARK"),
  featured: boolean().notNull().default(false),
  published: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Items
export const portfolioItems = pgTable("portfolio_items", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  outcome: text("outcome").notNull().default("Completed"),
  imageUrl: varchar("image_url", { length: 500 }).default(""),
  imageAlt: varchar("image_alt", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents (legacy, kept for compatibility)
export const documents = pgTable("documents", {
  id: serial().primaryKey(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  bookingId: integer("booking_id"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Received"),
  createdAt: timestamp("created_at").defaultNow(),
});
