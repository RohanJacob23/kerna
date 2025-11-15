<script setup lang="ts">
import type { ButtonProps, PricingPlanProps } from "@nuxt/ui";

const loading = ref(false);

const links = ref<ButtonProps[]>([
	{
		label: "Get started",
	},
	{
		label: "Learn more",
		variant: "subtle",
		trailingIcon: "i-lucide-arrow-right",
	},
]);

const handleUpgrade = async () => {
	loading.value = true;
	await new Promise((resolve) => setTimeout(resolve, 2000));
	await upgrade().finally(() => {
		loading.value = false;
	});
};

const plans = computed<PricingPlanProps[]>(() => [
	{
		title: "Free",
		description: "Tailored for indie hackers.",
		price: "$0",
		billingCycle: "/month",
		billingPeriod: "billed monthly",
		features: [
			"20 AI Generations per Day",
			"PDF & Text Submissions",
			"Summary & Key Term Generation",
			"Practice Quiz Generation",
		],
		button: {
			label: "Current",
			loading: loading.value,
			onClick: handleUpgrade,
		},
	},
	{
		title: "Pro Plan",
		description: "Best suited for small teams.",
		badge: "Save 20%",
		price: "$50",
		billingCycle: "/yearly",
		billingPeriod: "billed yearly",
		features: [
			"Everything in Free, plus:",
			"Unlimited AI Generations",
			"Full Generation History",
			"Priority Support",
		],
		button: {
			label: "Buy now",
			loading: loading.value,
			onClick: handleUpgrade,
		},
		scale: true,
	},
	{
		title: "Pro Plan",
		description: "Best suited for small teams.",
		price: "$5",
		billingCycle: "/month",
		billingPeriod: "billed monthly",
		features: [
			"Everything in Free, plus:",
			"Unlimited AI Generations",
			"Full Generation History",
			"Priority Support",
		],
		button: {
			label: "Buy now",
			loading: loading.value,
			onClick: handleUpgrade,
		},
	},
]);
</script>

<template>
	<section>
		<UPageHero
			title="Master Any Topic in Seconds"
			description="Stop reading endless textbook chapters. Kerna uses AI to turn your PDFs and notes into concise summaries, key terms, and practice quizzes instantly."
			orientation="horizontal"
			:ui="{ container: 'min-h-[calc(100vh-var(--ui-header-height))]' }">
			<template #links>
				<UButton
					to="/app"
					label="Get Started for Free"
					icon="i-heroicons-rocket-launch"
					size="xl" />
				<UButton
					to="/login"
					label="Log In"
					color="neutral"
					variant="ghost"
					size="xl"
					icon="i-heroicons-arrow-right-end-on-rectangle" />
			</template>

			<template #default>
				<div
					class="relative aspect-video w-full max-w-3xl mx-auto rounded-xl border border-default bg-default flex items-center justify-center overflow-hidden shadow-2xl">
					<div class="text-center space-y-2 p-8">
						<UIcon
							name="lucide:file-text"
							class="w-24 h-24 text-primary opacity-80" />
						<p class="text-muted font-medium">PDF to Quiz Engine</p>
					</div>
					<div
						class="absolute inset-0 bg-linear-to-tr from-primary-500/10 to-transparent pointer-events-none" />
				</div>
			</template>
		</UPageHero>

		<USeparator />

		<UPageSection
			title="Your Personal AI Tutor"
			description="Kerna doesn't just summarize; it helps you actively learn."
			:ui="{ container: 'min-h-[75dvh] content-center' }">
			<template #features>
				<UPageCard
					title="PDF Uploads"
					icon="lucide:file-plus"
					description="Drag and drop your 50-page textbook chapters. We extract the text and find the gold."
					variant="subtle" />
				<UPageCard
					title="Instant Quizzes"
					icon="lucide:graduation-cap"
					description="Test your knowledge immediately. Kerna generates multiple-choice questions with answer keys."
					variant="subtle" />
				<UPageCard
					title="Key Term Extraction"
					icon="lucide:key-round"
					description="Never miss a definition. We pull out the most important vocabulary automatically."
					variant="subtle" />
			</template>
		</UPageSection>

		<USeparator />

		<UPageSection
			title="How it Works"
			class="bg-muted/30"
			:ui="{ container: 'min-h-[75dvh] content-center' }">
			<template #features>
				<UPageFeature
					title="Upload or Paste"
					description="Drop in your lecture slides, PDF chapters, or raw notes."
					orientation="vertical"
					class="flex flex-col text-center">
					<template #leading
						><div
							class="size-16 text-2xl font-bold rounded-full flex items-center justify-center text-primary bg-primary/10">
							1
						</div></template
					>
				</UPageFeature>
				<UPageFeature
					title="AI Processing"
					description="Our advanced AI analyzes the text to understand the core"
					orientation="vertical"
					class="flex flex-col text-center">
					<template #leading
						><div
							class="size-16 text-2xl font-bold rounded-full flex items-center justify-center text-primary bg-primary/10">
							2
						</div></template
					>
				</UPageFeature>
				<UPageFeature
					title="Instant Quizzes"
					description="Get your summary and take the quiz instantly."
					orientation="vertical"
					class="flex flex-col text-center">
					<template #leading
						><div
							class="size-16 text-2xl font-bold rounded-full flex items-center justify-center text-primary bg-primary/10">
							3
						</div></template
					>
				</UPageFeature>
			</template>
		</UPageSection>

		<USeparator />

		<UPageSection :ui="{ container: 'min-h-[75dvh] content-center' }">
			<UPricingPlans :plans="plans" scale compact />
		</UPageSection>

		<USeparator />

		<UPageSection>
			<UPageCTA
				title="Ready to boost your grades?"
				description="Join students who are saving hours of study time every week."
				:links="links"
				variant="subtle" />
		</UPageSection>
	</section>
</template>
