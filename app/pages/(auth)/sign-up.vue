<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

definePageMeta({ layout: "auth" });

const fields = ref<AuthFormField[]>([
	{
		name: "name",
		type: "text",
		label: "Name",
	},
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
	name: z.string("Name is required").min(3, "Must be at least 3 characters"),
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

	await auth.signUp.email(data, {
		async onSuccess() {
			await auth.fetchSession();
			toast.success("Signed in successfully", { id: loadingToast });
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
				title="Sign Up"
				description="Enter your credentials to create your account."
				:fields="fields"
				:loading="loading"
				@submit="handleSubmit">
				<template #footer>
					Already have an account?
					<ULink to="/login" class="text-primary font-medium"
						>Login</ULink
					>.
				</template></UAuthForm
			>
		</UPageCard>
	</UPageHero>
</template>
