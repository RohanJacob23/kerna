<script setup lang="ts">
useHead({
	htmlAttrs: {
		lang: "en",
	},
});
useSeoMeta({
	title: "My Amazing Site",
	ogTitle: "My Amazing Site",
	description: "This is my amazing site, let me tell you all about it.",
	ogDescription: "This is my amazing site, let me tell you all about it.",
	ogImage: "https://example.com/image.png",
	twitterCard: "summary_large_image",
});
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
		<AppSonner />
	</NuxtLayout>
</template>
