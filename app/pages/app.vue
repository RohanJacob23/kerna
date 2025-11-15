<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

definePageMeta({ layout: "app" });

const route = useRoute();
const router = useRouter();

// --- Handle Payment Success ---
onMounted(() => {
	// Check if the URL has ?payment=success
	if (route.query.checkout_id) {
		toast.success("Welcome to Pro! Your limits have been removed.");

		// This is important:
		// It removes the query parameter from the URL, so the toast
		// doesn't show up again if the user refreshes the page.
		router.replace({ query: {} });
	}

	// You could also check for a cancelled payment
	if (route.query.payment === "cancelled") {
		toast.info(
			"Your upgrade was cancelled. You are still on the free plan."
		);
		router.replace({ query: {} });
	}
});

const formSchema = z.object({
	text: z.string().optional(),
	file: z.file().mime("application/pdf").optional(),
});

type FormSchema = z.infer<typeof formSchema>;

// --- State ---
// Holds the text from the <textarea>
const formState = reactive<Partial<FormSchema>>({ text: "", file: undefined });
// Stores the final AI-generated response (as Markdown)
const result = ref("");
// Tracks the loading state for the API call
const loading = ref(false);
// Holds any error messages
const error = ref<string | null>(null);
const upgradeError = ref(false);

const { $toast: toast } = useNuxtApp();

// --- Logic ---
/**
 * This function is called when the user submits the form.
 * It sends the `textInput` to our backend API endpoint.
 */
const handleSubmit = async ({ data }: FormSubmitEvent<FormSchema>) => {
	result.value = "";
	loading.value = true;
	const loadingToast = toast.loading("Generating study guide...");

	try {
		if (data.text) {
			const res = await $fetch("/api/generate", {
				method: "POST",
				body: data,
			});

			if (!res.aiResponse) {
				error.value = "Error generating study guide. Please try again.";
				toast.error("Error generating study guide. Please try again.", {
					id: loadingToast,
				});
				return;
			}

			toast.success("Study guide generated successfully!", {
				id: loadingToast,
			});

			clearNuxtData("history");
			result.value = res.aiResponse;
		} else if (data.file) {
			const formData = new FormData();
			formData.append("file", data.file);

			const res = await $fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.aiResponse) {
				error.value = "Error generating study guide. Please try again.";
				toast.error("Error generating study guide. Please try again.", {
					id: loadingToast,
				});
				return;
			}

			toast.success("Study guide generated successfully!", {
				id: loadingToast,
			});

			clearNuxtData("history");
			result.value = res.aiResponse;
		}
	} catch (e) {
		if (e instanceof Error) {
			if ("status" in e && e.status === 429) {
				upgradeError.value = true;
				toast.warning("Upgrade to Pro", {
					id: loadingToast,
					description: "You have reached your free plan limit.",
				});
			} else {
				error.value = e.message;
				toast.error(e.message, { id: loadingToast });
			}
		}
	}
	loading.value = false;
};

const handleUpgrade = async () => {
	const loadingToast = toast.loading("Upgrading to Pro");
	await upgrade().finally(() => {
		toast.info("Redirecting to payment", { id: loadingToast });
	});
};
</script>

<template>
	<section>
		<UAlert
			v-if="upgradeError"
			title="Upgrade to Pro"
			description="Unlock the full potential of Kerna by upgrading to our Pro plan."
			color="warning"
			variant="soft"
			icon="i-heroicons-exclamation-triangle"
			class="rounded-none justify-center gap-8"
			:ui="{ wrapper: 'flex-none' }"
			orientation="horizontal"
			:actions="[
				{
					label: 'Upgrade',
					color: 'warning',
					variant: 'subtle',
					onClick: handleUpgrade,
				},
			]"
			@close="upgradeError = false" />

		<UPageHero
			title="Kerna"
			description="Turn any text into a summary, key terms, and a practice quiz.">
			<div class="space-y-4">
				<UForm
					class="space-y-4"
					:state="formState"
					:schema="formSchema"
					@submit="handleSubmit">
					<UFormField label="Option 1: Paste Your Text" name="text">
						<UTextarea
							v-model="formState.text"
							class="w-full"
							placeholder="Paste your textbook chapter, lecture notes, or any article here..."
							:disabled="loading"
							autoresize />
					</UFormField>

					<USeparator label="OR" />

					<UFormField label="Option 2: Upload a PDF" name="file">
						<UFileUpload
							id="file-input"
							v-model="formState.file"
							variant="button"
							size="xl"
							:disabled="loading"
							accept=".pdf" />
					</UFormField>

					<UButton
						type="submit"
						label="Generate Study Guide"
						:loading="loading"
						size="xl"
						icon="lucide:sparkles"
						:disabled="!!!formState.text && !!!formState.file"
						block />
				</UForm>

				<UAlert
					v-if="error"
					:title="error"
					color="error"
					variant="soft"
					icon="lucide:triangle-alert"
					close
					@update:open="() => (error = null)"
					@close="error = null" />

				<UCard v-if="result" class="mt-8">
					<template #header>
						<h3 class="text-lg font-semibold">Your Study Guide</h3>
					</template>

					<MDC :value="result" class="" />
				</UCard>
			</div>
		</UPageHero>
	</section>
</template>
