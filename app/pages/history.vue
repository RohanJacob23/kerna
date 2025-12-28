<script setup lang="ts">
import type { Generations as GenrationType } from "~~/server/db/schema";
import type { SerializeObject } from "nitropack";

definePageMeta({ layout: "app" });
useSeoMeta({ title: "History" });

type Generations = Omit<GenrationType, "modelUsed" | "userId" | "creditsCost">;

const { $toast: toast } = useNuxtApp();
const isDeleting = ref(false);

const {
	data: history,
	refresh,
	pending,
	error,
} = await useLazyFetch("/api/history", {
	key: "history",
	getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
});

const searchQuery = ref("");

const filteredHistory = computed(() => {
	// Always fallback to an empty array so v-for never iterates over null
	const data = history.value || [];

	if (!searchQuery.value) {
		return data;
	}
	return data.filter((gen) =>
		gen.title.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});

// 3. State for the modal
const isModalOpen = ref(false);
const selectedGeneration = ref<SerializeObject<Generations> | null>(null);

// 4. Function to open the modal
const viewGeneration = (generation: SerializeObject<Generations>) => {
	selectedGeneration.value = generation;
	isModalOpen.value = true;
};

const handleDelete = async (id: string) => {
	isDeleting.value = true;
	const toastId = toast.loading("Deleting study guide...");

	try {
		await $fetch(`/api/history/${id}`, { method: "delete" });
		clearNuxtData("history");
		await refresh();
		toast.success("Deleted study guide", { id: toastId });
	} catch (e) {
		toast.error("Failed to delete study guide", {
			id: toastId,
			description: (e as Error).message,
		});
	}

	isDeleting.value = false;
};
</script>

<template>
	<UContainer>
		<UPage>
			<UPageHeader
				title="Generation History"
				description="Here are all the study guides you've created." />

			<UPageBody>
				<UInput
					id="search"
					v-model="searchQuery"
					placeholder="Search..."
					icon="hugeicons:search-01"
					:disabled="pending || (history && history.length === 0)"
					class="mb-4! w-full" />
				<!-- <ClientOnly> -->
				<div v-if="pending" class="space-y-4">
					<USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
				</div>
				<UAlert
					v-else-if="error"
					title="Could not load history"
					:description="error.message"
					color="error"
					variant="soft"
					icon="hugeicons:alert-01"
					class="mt-8" />
				<UEmpty
					v-else-if="history && history.length === 0"
					icon="hugeicons:file-02"
					variant="subtle"
					title="No history found"
					description="You haven't generated any study guides yet." />

				<UPageList v-else class="space-y-4">
					<UPageCard
						v-for="gen in filteredHistory"
						:key="gen.id"
						:title="gen.title"
						orientation="horizontal"
						variant="outline"
						class="hover:bg-elevated/50 relative"
						:class="{
							'text-muted before:size-full before:animate-pulse before:bg-muted before:absolute before:inset-0':
								isDeleting,
						}">
						<div class="flex gap-2 justify-self-end">
							<UButton
								icon="hugeicons:link-square-01"
								size="xs"
								variant="ghost"
								@click="viewGeneration(gen)" />
							<UButton
								icon="hugeicons:delete-02"
								size="xs"
								variant="ghost"
								color="error"
								loading-auto
								@click="handleDelete(gen.id)" />
						</div>
					</UPageCard>
				</UPageList>
				<!-- </ClientOnly> -->
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
