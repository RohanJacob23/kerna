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
			<UNavigationMenu :items="items" color="primary" />

			<template #right>
				<div class="flex items-center gap-2">
					<UButton color="neutral" variant="outline" to="/sign-up"
						>Sign Up</UButton
					>
					<UButton to="/login">Login</UButton>
				</div>
			</template>
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
