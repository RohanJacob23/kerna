import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { db } from "~~/db"; // your drizzle instance

const polarClient = new Polar({
	accessToken: process.env.POLAR_API_KEY,
	// Use 'sandbox' if you're using the Polar Sandbox environment
	// Remember that access tokens, products, etc. are completely separated between environments.
	// Access tokens obtained in Production are for instance not usable in the Sandbox environment.
	server: "production",
});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
	}),
	emailAndPassword: { enabled: true, minPasswordLength: 3 },
	plugins: [
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					successUrl: "/app?checkout_id={CHECKOUT_ID}",
					returnUrl: "/app",
					authenticatedUsersOnly: true,
				}),
				portal(),
			],
		}),
	],
});
