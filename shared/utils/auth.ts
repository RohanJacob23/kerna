import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	dodopayments,
	checkout,
	portal,
	webhooks,
} from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";
import { db } from "~~/server/db"; // your drizzle instance
import { transporter } from "./transporter";
import {
	planEnum,
	subscription,
	user,
	type PlanType,
} from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "./plans";

export const dodoPayments = new DodoPayments({
	bearerToken: process.env.DODO_API_KEY!,
	environment: process.env.DODO_ENV! as "test_mode" | "live_mode", // or "live_mode" for production
});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
	}),
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 3,
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await transporter.sendMail({
				from: "Kerna<rohankoshyjacob@gmail.com>",
				to: user.email,
				subject: "Verify your email address",
				html: `<h1>Verify your email address</h1>
				<p>Click the link below to verify your email address:</p>
				<a href="${url}">${url}</a>`,
			});
		},
	},
	user: {
		additionalFields: {
			credits: {
				type: "number",
				required: true,
				input: false,
			},
			plan: {
				type: planEnum.enumValues,
				required: true,
				input: false,
			},
		},
	},
	plugins: [
		dodopayments({
			client: dodoPayments,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: process.env.DODO_CRAM_WEEK_ID!,
							slug: "cram_week",
						},
						{
							productId: process.env.DODO_MONTHLY_ID!,
							slug: "monthly",
						},
						{
							productId: process.env.DODO_ANNUAL_ID!,
							slug: "annual",
						},
					],
					successUrl: "/app",
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,

					// TODO : work on webhook for subscription renewal and payment success
					onPaymentSucceeded: async (payload) => {
						const plan = (payload.data.metadata?.plan ??
							"free") as PlanType;
						const userId = payload.data.metadata?.userId as string;

						const credits = PLANS[plan].credits;

						if (plan === "cram_week") {
							console.log(
								`Processing Cram Week for user ${userId}`
							);
							const now = new Date();
							// 7 days from now
							const expiresAt = new Date(
								now.getTime() + 7 * 24 * 60 * 60 * 1000
							);
							await db
								.update(user)
								.set({
									plan,
									credits,
									planExpiresAt: expiresAt,
									creditResetAt: null, // No recurring reset
									isDowngraded: false,
								})
								.where(eq(user.id, userId));
						}
					},
					onSubscriptionActive: async (payload) => {
						const sub = payload.data;
                        const plan = (payload.data.metadata?.plan ??
                            "free") as PlanType;
                        const userId = payload.data.metadata?.userId as string;
                        const credits = PLANS[plan].credits;

                        const now = new Date();
                        const nextBillingDate = new Date(sub.next_billing_date!);
                        let initialCreditResetDate = nextBillingDate;

                        if (plan === 'annual') {
                            // If annual, the next credit reset is next month, not next year.
                            // We calculate 1 month from today (activation date).
                            initialCreditResetDate = new Date(now.setMonth(now.getMonth() + 1));
                        }
                        // --------------------------------

                        await db.transaction(async (tx) => {
                            // Create local subscription record
                            await tx.insert(subscription).values({
                                id: sub.subscription_id,
                                currentPeriodEnd: nextBillingDate, // Keep billing sync true
                                plan,
                                status: sub.status,
                            });

                            // Link user to subscription and set initial credits & reset date
                            await tx.update(user)
                                .set({
                                    plan,
                                    subscriptionId: sub.subscription_id,
                                    credits,
                                    planExpiresAt: null,
                                    creditResetAt: initialCreditResetDate, 
                                    isDowngraded: false,
                                })
                                .where(eq(user.id, userId));
                        });
					},
					onSubscriptionRenewed: async (payload) => {
						const sub = payload.data;
						const nextBillingDate = new Date(
							sub.next_billing_date!
						);
						const plan = (payload.data.metadata?.plan ??
							"free") as PlanType;
						const userId = payload.data.metadata?.userId as string;
						const credits = PLANS[plan].credits;

						await db.transaction(async (tx) => {
							await tx
								.update(subscription)
								.set({
									currentPeriodEnd: sub.next_billing_date!,
									plan,
								})
								.where(
									eq(subscription.id, sub.subscription_id)
								);

							await tx
								.update(user)
								.set({
									credits,
									creditResetAt: nextBillingDate,
									isDowngraded: false,
								})
								.where(eq(user.id, userId));
						});
					},
					onSubscriptionCancelled: async (payload) => {
						const sub = payload.data;
						const userId = payload.data.metadata?.userId as string;

						console.log(
							`User ${userId} cancelled subscription ${sub.subscription_id}`
						);

						await db.transaction(async (tx) => {
							// Update subscription status
							await tx
								.update(subscription)
								.set({ status: "cancelled" })
								.where(
									eq(subscription.id, sub.subscription_id)
								);

							// Downgrade user to free.
							// Note: We let them keep current credits until they run out.
							await tx
								.update(user)
								.set({
									plan: "free",
									subscriptionId: null,
									creditResetAt: null,
									isDowngraded: true,
								})
								.where(eq(user.id, userId));
						});
					},
				}),
			],
		}),
	],
});
