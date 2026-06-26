import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial().primaryKey(),
  title: text().notNull(),
  category: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),
  features: text().array().notNull().default([]),
  benefits: text().array().notNull().default([]),
  pricing: text().notNull().default("Custom quote"),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial().primaryKey(),
  name: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  serviceRequired: text("service_required").notNull(),
  preferredDate: text("preferred_date").notNull(),
  projectDescription: text("project_description").notNull(),
  status: text().notNull().default("New request"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull().default(""),
  service: text().notNull().default("General"),
  message: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text().notNull().default(""),
  company: text().notNull().default(""),
  status: text().notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial().primaryKey(),
  title: text().notNull(),
  slug: text().notNull().unique(),
  excerpt: text().notNull(),
  content: text().notNull(),
  category: text().notNull().default("Business"),
  published: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial().primaryKey(),
  title: text().notNull(),
  category: text().notNull(),
  description: text().notNull(),
  outcome: text().notNull().default("Completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial().primaryKey(),
  clientEmail: text("client_email").notNull(),
  bookingId: integer("booking_id"),
  fileName: text("file_name").notNull(),
  status: text().notNull().default("Received"),
  createdAt: timestamp("created_at").defaultNow(),
});
