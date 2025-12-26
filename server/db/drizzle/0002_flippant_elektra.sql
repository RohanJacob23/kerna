DROP TYPE "public"."model_type";--> statement-breakpoint
CREATE TYPE "public"."model_type" AS ENUM('gemini-2.5-flash-lite', 'gpt-4o-mini', 'gpt-4o', 'claude-sonnet');