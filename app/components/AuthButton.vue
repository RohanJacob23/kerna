<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();

const isDark = computed({
	get() {
		return colorMode.value === "dark";
	},
	set(_isDark) {
		colorMode.preference = _isDark ? "dark" : "light";
	},
});

const loading = ref(false);
const auth = useAuth();

await callOnce("auth-init", auth.fetchSession);

const handleLogout = async () => {
	loading.value = true;
	await auth.signOut();
};

const items = ref<DropdownMenuItem[][]>([
	[
		{
			label: auth.user.value?.name || "User",
			description: auth.user.value?.email,
			type: "label",
		},
		{ type: "separator" },
		{ label: "Account", to: "/account" },
		{ label: "Settings", disabled: true },
		{
			label: "Toggle Theme",
			onSelect: () => (isDark.value = !isDark.value),
		},
	],
	[{ label: "Logout", color: "error", onSelect: handleLogout }],
]);
</script>

<template>
	<div v-if="auth.user.value">
		<UDropdownMenu
			:items="items"
			:ui="{ content: 'w-56' }"
			:content="{ align: 'end', sideOffset: 4 }">
			<UButton
				:avatar="{ alt: auth.user.value.name, size: 'md' }"
				variant="link"
				color="neutral"
				class="cursor-pointer rounded-full" />
		</UDropdownMenu>
	</div>
	<!-- <UButton v-if="auth.user.value" :loading="loading" @click="handleLogout"
		>Logout</UButton> -->
	<div v-else class="flex gap-2">
		<UButton to="/sign-up" color="neutral" variant="outline"
			>Sign Up</UButton
		>
		<UButton to="/login">Login</UButton>
	</div>
</template>
