ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "short_description" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "full_description" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "suitable_customer" text DEFAULT '' NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "estimated_turnaround" varchar(100) DEFAULT '';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "icon" varchar(255) DEFAULT '';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "image_url" varchar(500) DEFAULT '';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "image_alt" varchar(255) DEFAULT '';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
UPDATE "services" SET "short_description" = COALESCE("short_description", "description", 'Professional service support.');
UPDATE "services" SET "full_description" = COALESCE("full_description", "description", "short_description", 'Professional service support.');
ALTER TABLE "services" ALTER COLUMN "short_description" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "full_description" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "description" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "phone" varchar(20) DEFAULT '',
  "company" varchar(255) DEFAULT '',
  "role" varchar(50) DEFAULT 'customer' NOT NULL,
  "netlify_identity_id" varchar(255) DEFAULT '',
  "status" varchar(50) DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "users_identity_id_idx" ON "users" ("netlify_identity_id");

CREATE TABLE IF NOT EXISTS "service_requests" (
  "id" serial PRIMARY KEY,
  "user_id" integer,
  "email" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "phone" varchar(20) NOT NULL,
  "service_id" integer,
  "service_title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "preferred_date" varchar(50) DEFAULT '',
  "document_names" text[] DEFAULT '{}'::text[],
  "document_keys" text[] DEFAULT '{}'::text[],
  "status" varchar(50) DEFAULT 'Pending' NOT NULL,
  "budget" varchar(100) DEFAULT '',
  "notes" text DEFAULT '',
  "admin_notes" text DEFAULT '',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "service_requests_user_id_idx" ON "service_requests" ("user_id");
CREATE INDEX IF NOT EXISTS "service_requests_status_idx" ON "service_requests" ("status");

CREATE TABLE IF NOT EXISTS "customer_profiles" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL UNIQUE,
  "company" varchar(255) DEFAULT '',
  "industry" varchar(100) DEFAULT '',
  "website" varchar(255) DEFAULT '',
  "business_type" varchar(100) DEFAULT '',
  "location" varchar(255) DEFAULT '',
  "bio" text DEFAULT '',
  "profile_complete" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" serial PRIMARY KEY,
  "client_name" varchar(255) NOT NULL,
  "client_company" varchar(255) DEFAULT '',
  "service_category" varchar(100) DEFAULT '',
  "testimonial_text" text NOT NULL,
  "rating" integer DEFAULT 5,
  "photo_url" varchar(500) DEFAULT '',
  "featured" boolean DEFAULT false NOT NULL,
  "published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "process_steps" (
  "id" serial PRIMARY KEY,
  "step_number" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "icon" varchar(255) DEFAULT '',
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "author" varchar(255) DEFAULT 'RINOZ01SKYMARK';
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

ALTER TABLE "portfolio_items" ADD COLUMN IF NOT EXISTS "image_url" varchar(500) DEFAULT '';
ALTER TABLE "portfolio_items" ADD COLUMN IF NOT EXISTS "image_alt" varchar(255) DEFAULT '';
