<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

definePageMeta({ layout: "app" });
useSeoMeta({ title: "App" });

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
	file: z
		.file()
		.mime([
			"application/pdf",
			"text/plain",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		])
		.optional(),
	url: z.url().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

// --- State ---
// Holds the text from the <textarea>
const formState = reactive<Partial<FormSchema>>({
	text: "",
	url: undefined,
	file: undefined,
});
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

	try {
		if (data.text) {
			const res = await $fetch("/api/generate", {
				method: "POST",
				body: data,
			});

			if (!res.aiResponse) {
				error.value = "Error generating study guide. Please try again.";
				toast.error("Error generating study guide. Please try again.");
				return;
			}

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
				toast.error("Error generating study guide. Please try again.");
				return;
			}
			clearNuxtData("history");
			result.value = res.aiResponse;
		} else if (data.url) {
			const res = await $fetch("/api/scrape", {
				method: "POST",
				body: data,
			});

			if (!res.aiResponse) {
				error.value = "Error generating study guide. Please try again.";
				toast.error("Error generating study guide. Please try again.");
				return;
			}
			clearNuxtData("history");
			result.value = res.aiResponse;
		}
	} catch (e) {
		if (e instanceof Error) {
			if ("status" in e && e.status === 429) {
				upgradeError.value = true;
				toast.warning("Upgrade to Pro", {
					description: "You have reached your free plan limit.",
				});
			} else {
				error.value = e.message;
				toast.error(e.message);
			}
		}
	}
	loading.value = false;
};

const handleUpgrade = async (plan: "pro-montly" | "pro-yearly") => {
	const loadingToast = toast.loading("Upgrading to Pro");
	await upgrade(plan).finally(() => {
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
			icon="hugeicons:alert-01"
			class="rounded-none justify-center gap-8"
			:ui="{ wrapper: 'flex-none' }"
			orientation="horizontal"
			:actions="[
				{
					label: 'Upgrade Monthly',
					color: 'warning',
					variant: 'subtle',
					onClick: () => handleUpgrade('pro-montly'),
				},
				{
					label: 'Upgrade Yearly',
					color: 'warning',
					variant: 'subtle',
					onClick: () => handleUpgrade('pro-yearly'),
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
							:disabled="
								loading || !!formState.url || !!formState.file
							"
							autoresize />
					</UFormField>

					<USeparator label="OR" />

					<UFormField label="Option 2: Paste a URL" name="url">
						<UInput
							v-model="formState.url"
							placeholder="Paste a URL here..."
							:disabled="
								loading || !!formState.text || !!formState.file
							"
							class="w-full" />
					</UFormField>

					<USeparator label="OR" />

					<UFormField
						label="Option 3: Upload a PDF, Doc, or Text File"
						name="file">
						<UFileUpload
							id="file-input"
							v-model="formState.file"
							variant="button"
							icon="hugeicons:upload-01"
							:disabled="
								loading || !!formState.url || !!formState.text
							"
							accept=".pdf,.doc,.docx,.txt" />
					</UFormField>

					<UButton
						type="submit"
						label="Generate Study Guide"
						:loading="loading"
						size="lg"
						icon="hugeicons:sparkles"
						:disabled="
							!!!formState.text &&
							!!!formState.file &&
							!!!formState.url
						"
						block />
				</UForm>

				<UAlert
					v-if="error"
					:title="error"
					color="error"
					variant="soft"
					size="lg"
					icon="hugeicons:alert-01"
					close
					@update:open="() => (error = null)"
					@close="error = null" />

				<UCard v-if="result" class="mt-8">
					<template #header>
						<h3 class="text-lg font-semibold">Your Study Guide</h3>
					</template>

					<MDC :value="result" class="font-lora" />
				</UCard>
			</div>
		</UPageHero>
	</section>
</template>
