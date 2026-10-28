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
ALTER TABLE "services" ALTER COLUMN "pricing" SET DATA TYPE varchar(255) USING "pricing"::varchar(255);