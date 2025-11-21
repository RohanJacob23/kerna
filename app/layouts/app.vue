<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[]>([
	{
		label: "App",
		to: "/app",
	},
	{ label: "History", to: "/history" },
]);

const footerLinks = ref<NavigationMenuItem[]>([
	{ label: "Privacy Policy", to: "/privacy" },
	{ label: "Terms of Service", to: "/terms" },
]);

const { user } = useAuth();
</script>

<template>
	<section>
		<UBanner
			v-if="user && !user.emailVerified"
			title="Please verify your email"
			icon="hugeicons:information-circle" />

		<UHeader>
			<template #title>
				<UColorModeImage
					light="/logo-light.png"
					dark="/logo-dark.png"
					class="h-12 w-auto"
					:width="500"
					:height="500"
					alt="Kerna Logo"
					preload
			/></template>
			<UNavigationMenu :items="items" />
			<template #right> <AuthButton /> </template>
			<template #body>
				<UNavigationMenu :items="items" orientation="vertical" />
			</template>
		</UHeader>

		<UMain>
			<slot />
		</UMain>

		<UFooter class="border-t border-default">
			<template #left>
				<p class="text-muted text-sm">
					Copyright ©
					<NuxtTime :datetime="Date.now()" year="numeric" />
				</p>
			</template>
			<UNavigationMenu
				:items="[...items, ...footerLinks]"
				variant="link" />
			<template #right>
				<UButton
					icon="hugeicons:new-twitter"
					color="neutral"
					variant="ghost"
					to="https://go.nuxt.com/x"
					target="_blank"
					aria-label="X" />
				<UButton
					icon="hugeicons:github"
					color="neutral"
					variant="ghost"
					to="https://github.com/nuxt/nuxt"
					target="_blank"
					aria-label="GitHub" /> </template
		></UFooter>
	</section>
</template>
