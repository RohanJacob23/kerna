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
	toast.promise(async () => auth.signUp.email(data), {
		loading: "Signing up",
		success: async () => {
			await auth.fetchSession();
			await navigateTo("/");
			return "Signed up";
		},
		error: "Sign up failed",
		finally: () => {
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
