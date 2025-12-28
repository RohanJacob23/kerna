CREATE TYPE "public"."model_type" AS ENUM('gemini-2.5-flash-lite', 'gpt-4o-mini', 'gpt-4o', 'claude-sonnet');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('free', 'cram_week', 'monthly', 'annual');--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" "plan_type" NOT NULL,
	"status" text NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "generation" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "generation" ADD COLUMN "model_used" "model_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "generation" ADD COLUMN "credits_cost" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan" "plan_type" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_daily_credit_refill_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credit_reset_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_downgraded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation" DROP COLUMN "original_text";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "requests_today";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_request_at";