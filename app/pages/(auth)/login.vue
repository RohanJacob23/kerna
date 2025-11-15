<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

definePageMeta({ layout: "auth" });

const fields = ref<AuthFormField[]>([
	{
		name: "email",
		type: "text",
		label: "Email",
	},
	{
		name: "password",
		type: "password",
		label: "Password",
	},
]);

const schema = z.object({
	email: z.email("Invalid email"),
	password: z
		.string("Password is required")
		.min(3, "Must be at least 3 characters"),
});

type Schema = z.infer<typeof schema>;

const loading = ref(false);
const { $toast: toast } = useNuxtApp();
const auth = useAuth();

const handleSubmit = async ({ data }: FormSubmitEvent<Schema>) => {
	loading.value = true;
	const loadingToast = toast.loading("Logging in...");

	await auth.signIn.email(data, {
		async onSuccess() {
			await auth.fetchSession();
			toast.success("Logged in successfully", { id: loadingToast });
			await navigateTo("/app");
			loading.value = false;
		},
		onError(context) {
			toast.error(context.error.message, { id: loadingToast });
			loading.value = false;
		},
	});
};
</script>

<template>
	<UPageHero>
		<UPageCard class="w-full max-w-md mx-auto">
			<UAuthForm
				:schema="schema"
				:fields="fields"
				title="Login"
				description="Enter your credentials to access your account."
				:loading="loading"
				@submit="handleSubmit"
				><template #footer>
					Don't have an account?
					<ULink to="/sign-up" class="text-primary font-medium"
						>Sign Up</ULink
					>.
				</template></UAuthForm
			>
		</UPageCard>
	</UPageHero>
</template>
