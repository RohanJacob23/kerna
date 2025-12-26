<script setup lang="ts">
import type { NuxtError } from "#app";
import { useCompletion } from "@ai-sdk/vue";

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

const upgradeError = ref(false);

const { $toast: toast } = useNuxtApp();

const url = ref("");
const file = ref<File | null>(null);
const model = ref("gemini-2.5-flash-lite");
const error = ref<NuxtError>();

const { input, isLoading, complete, completion } = useCompletion({
	api: "/api/generate",
	body: {
		modelChoice: model.value,
	},
	onError: (err) => {
		const parsedError = JSON.parse(err.message) as NuxtError;

		if (parsedError.statusCode === 402) {
			upgradeError.value = true;
			toast.error(parsedError.message);
		} else {
			toast.error(parsedError.message);
			error.value = parsedError;
		}
	},
});

const generateStudyGuide = async () => {
	if (input.value) {
		await complete(input.value);
	} else if (file.value) {
		const formData = new FormData();
		formData.append("file", file.value);

		await complete(input.value, { body: formData });
	} else if (url.value) {
		await complete(url.value);
	}
	input.value = "";
	clearNuxtData("history");
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
					label: 'Upgrade Now',
					color: 'warning',
					variant: 'subtle',
					to: '/#pricing',
				},
			]"
			@close="upgradeError = false" />

		<UPageHero
			title="Kerna"
			description="Turn any text into a summary, key terms, and a practice quiz.">
			<div class="space-y-4 sticky top-8">
				<UChatPrompt v-model="input" :error="error">
					<template #footer>
						<div class="flex gap-2">
							<UFileUpload
								id="file-input"
								v-model="file"
								variant="button"
								icon="hugeicons:upload-01"
								:disabled="isLoading"
								:ui="{ base: 'border-solid' }"
								accept=".pdf,.doc,.docx,.txt"
								size="sm" />
							<UPopover
								mode="click"
								:ui="{ content: 'p-2 w-80' }">
								<UButton
									icon="hugeicons:link-04"
									:variant="url ? 'subtle' : 'outline'"
									color="neutral"
									size="sm"
									:disabled="isLoading" />

								<template #content="{ close }">
									<div class="flex gap-2">
										<UInput
											v-model="url"
											placeholder="https://example.com/article"
											icon="hugeicons:globe-02"
											autofocus
											class="flex-1"
											@keyup.enter="close" />
										<UButton
											v-if="url"
											icon="hugeicons:delete-02"
											color="error"
											variant="ghost"
											size="xs"
											@click="url = ''" />
									</div>
								</template>
							</UPopover>
							<ModelSelect v-model="model" />
						</div>
						<UChatPromptSubmit
							:status="isLoading ? 'streaming' : 'ready'"
							:disabled="!file && !input && !url"
							:class="{ '[&_span]:animate-spin': isLoading }"
							streaming-icon="hugeicons:loading-03"
							@click="generateStudyGuide" />
					</template>
				</UChatPrompt>

				<UAlert
					v-if="error"
					:title="error.message"
					color="error"
					variant="soft"
					size="lg"
					icon="hugeicons:alert-01"
					close
					@update:open="
						(open) => {
							error = undefined;
							open = false;
						}
					" />

				<UCard v-if="completion" class="mt-8">
					<template #header>
						<h3 class="text-lg font-semibold">Your Study Guide</h3>
					</template>
					<MDC
						:value="completion"
						class="prose dark:prose-invert max-w-none" />
				</UCard>
			</div>
		</UPageHero>
	</section>
</template>
