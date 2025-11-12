import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	runtimeConfig: {
		googleAiKey: process.env.GEMINI_API_KEY,
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
