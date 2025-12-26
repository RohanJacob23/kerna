import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	runtimeConfig: {
		public: {
			dodoCramWeek: process.env.DODO_CRAM_WEEK_ID,
			dodoMonthly: process.env.DODO_MONTHLY_ID,
			dodoAnnual: process.env.DODO_ANNUAL_ID,
		},
		googleAiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		openrouterApiKey: process.env.OPENROUTER_API_KEY,
		dodoApiKey: process.env.DODO_API_KEY,
		smtpKey: process.env.SMTP_KEY,
		smtpHost: process.env.SMTP_HOST,
		smtpUser: process.env.SMTP_USER,
		smtpPass: process.env.SMTP_PASS,
	},
	css: ["./app/assets/css/main.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	modules: [
		"@nuxt/eslint",
		"@nuxt/image",
		"@nuxt/ui",
		"@nuxt/content",
		"@nuxtjs/mdc",
		"vue-sonner/nuxt",
		"motion-v/nuxt",
		"@nuxt/hints",
	],
	content: {
		experimental: { nativeSqlite: true },
	},
	colorMode: {
		preference: "system", // default value of $colorMode.preference
		fallback: "light", // fallback value if not system preference found
		classPrefix: "",
		classSuffix: "",
	},
});
