<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

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

	if (data.text) {
		const res = await $fetch("/api/generate", {
			method: "POST",
			body: data,
		});

		await new Promise((res) => setTimeout(res, 2000));

		if (!res.aiResponse) {
			error.value = "Error generating study guide. Please try again.";
			toast.error("Error generating study guide. Please try again.", {
				id: loadingToast,
			});
			return;
		}

		result.value = res.aiResponse;
	} else if (data.file) {
		const formData = new FormData();
		formData.append("file", data.file);

		const res = await $fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		await new Promise((res) => setTimeout(res, 2000));

		if (!res.aiResponse) {
			error.value = "Error generating study guide. Please try again.";
			toast.error("Error generating study guide. Please try again.", {
				id: loadingToast,
			});
			return;
		}

		result.value = res.aiResponse;
	}

	toast.success("Study guide generated successfully!", { id: loadingToast });
	loading.value = false;
};
</script>

<template>
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
</template>
