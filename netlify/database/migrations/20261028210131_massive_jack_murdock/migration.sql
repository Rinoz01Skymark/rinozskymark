CREATE TABLE "customer_profiles" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL UNIQUE,
	"company" varchar(255) DEFAULT '',
	"industry" varchar(100) DEFAULT '',
	"website" varchar(255) DEFAULT '',
	"business_type" varchar(100) DEFAULT '',
	"location" varchar(255) DEFAULT '',
	"bio" text DEFAULT '',
	"profileComplete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "process_steps" (
	"id" serial PRIMARY KEY,
	"step_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(255) DEFAULT '',
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
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
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"budget" varchar(100) DEFAULT '',
	"notes" text DEFAULT '',
	"admin_notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) DEFAULT '',
	"company" varchar(255) DEFAULT '',
	"role" varchar(50) DEFAULT 'customer' NOT NULL,
	"password" varchar(255) DEFAULT '',
	"netlify_identity_id" varchar(255) DEFAULT '',
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author" varchar(255) DEFAULT 'RINOZ01SKYMARK';--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "image_url" varchar(500) DEFAULT '';--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "image_alt" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "short_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "full_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "suitable_customer" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "estimated_turnaround" varchar(100) DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "icon" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "image_url" varchar(500) DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "image_alt" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "title" SET DATA TYPE varchar(255) USING "title"::varchar(255);--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "slug" SET DATA TYPE varchar(255) USING "slug"::varchar(255);--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "category" SET DATA TYPE varchar(100) USING "category"::varchar(100);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "phone" SET DATA TYPE varchar(20) USING "phone"::varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_required" SET DATA TYPE varchar(255) USING "service_required"::varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "preferred_date" SET DATA TYPE varchar(50) USING "preferred_date"::varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE varchar(50) USING "status"::varchar(50);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "phone" SET DATA TYPE varchar(20) USING "phone"::varchar(20);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "company" SET DATA TYPE varchar(255) USING "company"::varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "company" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "status" SET DATA TYPE varchar(50) USING "status"::varchar(50);--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "client_email" SET DATA TYPE varchar(255) USING "client_email"::varchar(255);--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "file_name" SET DATA TYPE varchar(255) USING "file_name"::varchar(255);--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DATA TYPE varchar(50) USING "status"::varchar(50);--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "phone" SET DATA TYPE varchar(20) USING "phone"::varchar(20);--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "service" SET DATA TYPE varchar(255) USING "service"::varchar(255);--> statement-breakpoint
ALTER TABLE "portfolio_items" ALTER COLUMN "title" SET DATA TYPE varchar(255) USING "title"::varchar(255);--> statement-breakpoint
ALTER TABLE "portfolio_items" ALTER COLUMN "category" SET DATA TYPE varchar(100) USING "category"::varchar(100);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "title" SET DATA TYPE varchar(255) USING "title"::varchar(255);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE varchar(100) USING "category"::varchar(100);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "slug" SET DATA TYPE varchar(255) USING "slug"::varchar(255);--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "pricing" SET DATA TYPE varchar(255) USING "pricing"::varchar(255);