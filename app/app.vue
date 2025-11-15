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

const auth = useAuth();
callOnce("auth-init", auth.fetchSession);
</script>

<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
			<AppSonner />
		</NuxtLayout>
	</UApp>
</template>
