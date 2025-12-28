<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";

const model = defineModel<string>({
	default: "gemini-2.5-flash-lite",
	required: true,
});

const models = ref<SelectItem[]>([
	{
		label: "Google/gemini-2.5-Flash-Lite",
		id: "gemini-2.5-flash-lite",
	},
	{
		label: "OpenAI/gpt-4o-mini (soon...)",
		id: "gpt-4o-mini",
		disabled: true,
	},
	{
		label: "OpenAI/gpt-4o (soon...)",
		id: "gpt-4o",
		disabled: true,
	},
	{
		label: "Claude/sonnet (soon...)",
		id: "claude-sonnet",
		disabled: true,
	},
]);
</script>

<template>
	<USelect
		v-model="model"
		value-key="id"
		:items="models"
		variant="outline"
		size="sm" />
</template>
