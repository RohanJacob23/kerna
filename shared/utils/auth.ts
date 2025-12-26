import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dodopayments, checkout, portal } from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";
import { db } from "~~/server/db"; // your drizzle instance
import { transporter } from "./transporter";
import { planEnum } from "~~/server/db/schema";

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
					successUrl: "/app?checkout_id={CHECKOUT_ID}",
					authenticatedUsersOnly: true,
				}),
				portal(),
			],
		}),
	],
});
