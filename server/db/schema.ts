import { type InferEnum, relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan_type", [
	"free",
	"cram_week",
	"monthly",
	"annual",
]);

// Define Model Types Enum (for future use)
export const modelEnum = pgEnum("model_type", [
	"gemini-2.5-flash-lite",
	"gpt-4o-mini",
	"gpt-4o",
	"claude-sonnet",
]);

export type ModelType = InferEnum<typeof modelEnum>;
export type PlanType = InferEnum<typeof planEnum>;

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),

	credits: integer("credits").default(5).notNull(),
	plan: planEnum("plan").default("free").notNull(),
	subscriptionId: text("subscription_id").references(() => subscription.id, {
		onDelete: "cascade",
	}),
	planExpiresAt: timestamp("plan_expires_at"),
	lastDailyCreditRefillAt: timestamp("last_daily_credit_refill_at"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const generations = pgTable("generation", {
	id: text("id")
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	title: text("title").notNull(), // e.g., "Chapter 4.pdf" or "History Notes"
	modelUsed: modelEnum("model_used").notNull(),
	creditsCost: integer("credits_cost").notNull(),
	// What did the AI give back?
	// We store the raw markdown string
	aiResponse: text("ai_response").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscription = pgTable("subscription", {
	id: text("id")
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	// userId: text("user_id")
	// 	.notNull()
	// 	.references(() => user.id, { onDelete: "cascade" }),
	plan: planEnum("plan").notNull(),

	// 'active', 'cancelled', 'past_due', etc.
	status: text("status").notNull(),
	currentPeriodEnd: timestamp("current_period_end").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const feedback = pgTable("feedback", {
	id: text("id")
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	message: text("message").notNull(),
	type: text("type").notNull(),
	email: text("email"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Generations = typeof generations.$inferSelect;

export const userRelations = relations(user, ({ one, many }) => ({
	generations: many(generations),
	subscription: one(subscription, {
		fields: [user.subscriptionId],
		references: [subscription.id],
	}),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
	user: one(user, {
		fields: [generations.userId],
		references: [user.id],
	}),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
	user: one(user, {
		fields: [feedback.userId],
		references: [user.id],
	}),
}));
