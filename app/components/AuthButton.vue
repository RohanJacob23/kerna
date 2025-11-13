<script setup lang="ts">
const loading = ref(false);
const auth = useAuth();

await callOnce("auth-init", auth.fetchSession);

const handleLogout = async () => {
	loading.value = true;
	await auth.signOut();
};
</script>

<template>
	<UButton v-if="auth.user.value" :loading="loading" @click="handleLogout"
		>Logout</UButton
	>
	<div v-else class="flex gap-2">
		<UButton to="/sign-up" color="neutral" variant="outline"
			>Sign Up</UButton
		>
		<UButton to="/login">Login</UButton>
	</div>
</template>
