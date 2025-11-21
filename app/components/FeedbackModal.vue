<script lang="ts" setup>
import z from "zod";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";

const isOpen = defineModel<boolean>("open");

const loading = ref(false);
const { $toast: toast } = useNuxtApp();

const types = ref<SelectItem[]>([
	{ label: "✨ Feature Request", value: "feature" },
	{ label: "qc Bug Report", value: "bug" },
	{ label: "💭 General Feedback", value: "other" },
]);

const schema = z.object({
	type: z.string(),
	message: z
		.string()
		.min(5, "Please verify your message is detailed enough."),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
	type: "feature",
	message: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true;
	const loadingToast = toast.loading("Sending feedback...");
	try {
		await $fetch("/api/feedback", {
			method: "POST",
			body: event.data,
		});
		toast.success("Thank you! Your feedback has been sent.", {
			id: loadingToast,
		});
		isOpen.value = false;
		state.message = ""; // Reset form
	} catch {
		toast.error("Failed to send feedback. Please try again.", {
			id: loadingToast,
		});
	} finally {
		loading.value = false;
		isOpen.value = false;
	}
}
</script>

<template>
	<UModal v-model:open="isOpen" title="Send Feedback">
		<template #body>
			<UForm
				id="feedback-form"
				:schema="schema"
				:state="state"
				class="space-y-4"
				:disabled="loading"
				@submit="onSubmit">
				<UFormField label="What's on your mind?" name="type">
					<USelect :items="types" class="w-full" />
				</UFormField>

				<UFormField label="Message" name="message">
					<UTextarea
						v-model="state.message"
						placeholder="Tell us what you think..."
						:rows="4"
						autoresize
						class="w-full" />
				</UFormField>

				<!-- <div class="flex justify-end gap-2 mt-4">
				
				</div> -->
			</UForm>
		</template>
		<template #footer>
			<UButton
				label="Cancel"
				color="neutral"
				variant="outline"
				block
				@click="isOpen = false" />
			<UButton
				:loading="loading"
				type="submit"
				form="feedback-form"
				label="Submit"
				color="primary"
				block />
		</template>
	</UModal>
</template>
