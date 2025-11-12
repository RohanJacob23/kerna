<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
	<Sonner
		class="toaster group"
		v-bind="props"
		:style="{
			'--normal-bg': 'var(--ui-bg)',
			'--normal-text': 'var(--ui-text)',
			'--normal-border': 'var(--ui-border)',
		}" />
</template>
