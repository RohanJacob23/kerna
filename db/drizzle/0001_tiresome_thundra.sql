ALTER TABLE "user" ADD COLUMN "requests_today" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_request_at" timestamp;