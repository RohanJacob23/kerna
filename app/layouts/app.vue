<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
	{
		label: "App",
		to: "/app",
	},
	{ label: "History", to: "/history" },
	{
		label: "Releases",
		disabled: true,
	},
];
</script>

<template>
	<section>
		<UHeader title="KERNA">
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
			<UNavigationMenu :items="items" variant="link" />
			<template #right>
				<UButton
					icon="i-simple-icons-discord"
					color="neutral"
					variant="ghost"
					to="https://go.nuxt.com/discord"
					target="_blank"
					aria-label="Discord" />
				<UButton
					icon="i-simple-icons-x"
					color="neutral"
					variant="ghost"
					to="https://go.nuxt.com/x"
					target="_blank"
					aria-label="X" />
				<UButton
					icon="i-simple-icons-github"
					color="neutral"
					variant="ghost"
					to="https://github.com/nuxt/nuxt"
					target="_blank"
					aria-label="GitHub" /> </template
		></UFooter>
	</section>
</template>
