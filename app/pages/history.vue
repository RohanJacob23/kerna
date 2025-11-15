<script setup lang="ts">
import type { Generations as GenrationType } from "~~/db/schema";
import type { SerializeObject } from "nitropack";

definePageMeta({ layout: "app" });

type Generations = Omit<GenrationType, "originalText" | "userId">;

const {
	data: history,
	pending,
	error,
} = await useLazyFetch("/api/history", {
	key: "history",
	server: false,
	getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
});

// 3. State for the modal
const isModalOpen = ref(false);
const selectedGeneration = ref<SerializeObject<Generations> | null>(null);

// 4. Function to open the modal
function viewGeneration(generation: SerializeObject<Generations>) {
	selectedGeneration.value = generation;
	isModalOpen.value = true;
}
</script>

<template>
	<UContainer>
		<UPage>
			<UPageHeader
				title="Generation History"
				description="Here are all the study guides you've created." />

			<UPageBody>
				<div v-if="pending" class="mt-8">
					<USkeleton
						v-for="i in 3"
						:key="i"
						class="h-16 w-full mb-4" />
				</div>
				<UAlert
					v-else-if="error"
					title="Could not load history"
					:description="error.message"
					color="error"
					variant="soft"
					icon="i-heroicons-exclamation-triangle"
					class="mt-8" />
				<UAlert
					v-else-if="history && history.length === 0"
					title="You haven't generated any study guides yet."
					class="mt-8" />

				<UPageList v-else divide>
					<UPageCard
						v-for="gen in history"
						:key="gen.id"
						:title="gen.title"
						orientation="horizontal"
						variant="ghost"
						class="hover:bg-elevated/50 hover:cursor-pointer"
						@click="viewGeneration(gen)"
						><UIcon
							name="lucide:external-link"
							class="justify-self-end size-4"
					/></UPageCard>
				</UPageList>
			</UPageBody>
		</UPage>

		<UModal
			v-model:open="isModalOpen"
			:title="selectedGeneration?.title"
			:ui="{ content: 'max-w-3xl' }">
			<template #body>
				<MDC :value="selectedGeneration?.aiResponse ?? ''" />
			</template>
		</UModal>
	</UContainer>
</template>
