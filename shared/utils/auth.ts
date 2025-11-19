import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dodopayments, checkout, portal } from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";
import { db } from "~~/db"; // your drizzle instance
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST, // e.g., 'smtp-relay.brevo.com'
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER, // Your Brevo/Gmail email
		pass: process.env.SMTP_PASS, // Your API Key or App Password
	},
});

export const dodoPayments = new DodoPayments({
	bearerToken: process.env.DODO_API_KEY!,
	environment: process.env.DODO_ENV! as "test_mode" | "live_mode", // or "live_mode" for production
});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
	}),
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
	plugins: [
		dodopayments({
			client: dodoPayments,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: process.env.DODO_PRODUCT_ID_MONTHLY!,
							slug: "pro-montly",
						},
						{
							productId: process.env.DODO_PRODUCT_ID_YEARLY!,
							slug: "pro-yearly",
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
