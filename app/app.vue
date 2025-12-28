<script setup lang="ts">
useHead({
	htmlAttrs: {
		lang: "en",
	},
	link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});

useSeoMeta({
	titleTemplate: (titleChunk) =>
		titleChunk ? `${titleChunk} | Kerna` : "Kerna",
	description:
		"Turn any PDF, document, or text into a comprehensive study guide, summary, and practice quiz instantly using AI.",
	// Open Graph (Facebook/LinkedIn)
	ogSiteName: "Kerna",
	ogTitle: "Kerna | AI Study Guide Generator",
	ogDescription:
		"Stop reading endless textbook chapters. Generate summaries and quizzes in seconds.",
	ogImage: "https://kerna.vercel.app/og-image.png", // We'll create this later
	ogUrl: "https://kerna.vercel.app",
	// Twitter
	twitterCard: "summary_large_image",
	twitterTitle: "Kerna | AI Study Guide Generator",
	twitterDescription:
		"Stop reading endless textbook chapters. Generate summaries and quizzes in seconds.",
	twitterImage: "https://kerna.vercel.app/og-image.png",
});

const auth = useAuth();
callOnce("auth-init", auth.fetchSession);
</script>

<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
			<AppSonner close-button />
		</NuxtLayout>
	</UApp>
</template>
