CREATE TYPE "public"."model_type" AS ENUM('gemini_flash_8b', 'gpt_4o_mini', 'gpt_4o', 'claude_3_5_sonnet');--> statement-breakpoint
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
ALTER TABLE "feedback" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "generation" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan" "plan_type" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_daily_credit_refill_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "plan_type";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "credit_reset_at";--> statement-breakpoint
DROP TYPE "public"."plan";