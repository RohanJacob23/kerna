<script setup lang="ts">
import type { ButtonProps, PricingPlanProps } from "@nuxt/ui";
import type { PlanType } from "~~/server/db/schema";

const loading = ref(false);

const links = ref<ButtonProps[]>([
	{
		label: "Get started",
	},
	{
		label: "Learn more",
		variant: "subtle",
		trailingIcon: "hugeicons:arrow-right-02",
	},
]);

const handleUpgrade = async (plan: PlanType) => {
	loading.value = true;
	await new Promise((resolve) => setTimeout(resolve, 2000));
	await upgrade(plan).finally(() => {
		loading.value = false;
	});
};

const plans = computed<PricingPlanProps[]>(() => [
	{
		title: "Free Tier",
		description: "Perfect for trying it out.",
		price: "$0",
		billingCycle: "/day",
		billingPeriod: "forever free",
		features: [
			"5 Credits Refilled Daily",
			"Access to Gemini Flash Model",
			"PDF, Word & Text Uploads",
			"Summary, Terms & Quiz Generation",
		],
		button: {
			label: "Start for Free",
			variant: "subtle",
			to: "/app",
		},
		ui: {
			featureTitle: "whitespace-normal self-center",
			featureIcon: "h-6",
			feature: "items-start",
		},
	},
	{
		title: "Cram Week Pass",
		description: "For finals week panic.",
		price: "$3.99",
		billingCycle: "/one-time",
		billingPeriod: "7 days access",
		features: [
			"1,000 Credits (Expires in 7 days)",
			"Access All Pro Models (Claude, GPT-4)",
			"Priority Generation Queue",
			"No Daily Limits",
		],
		button: {
			label: "Get 7-Day Pass",
			loading: loading.value,
			onClick: () => handleUpgrade("cram_week"),
		},
		ui: {
			featureTitle: "whitespace-normal self-center",
			featureIcon: "h-6",
			feature: "items-start",
		},
	},
	{
		title: "Annual Pro",
		description: "Best value for serious students.",
		badge: "Save 58%",
		highlight: true,
		price: "$49",
		billingCycle: "/year",
		billingPeriod: "billed annually",
		features: [
			"5,000 Credits Per Month (Dripped)",
			"Access All Pro Models (Claude, GPT-4)",
			"Unlimited History Storage",
			"VIP Priority Support",
		],
		button: {
			label: "Get Annual Pro",
			size: "lg",
			loading: loading.value,
			onClick: () => handleUpgrade("annual"),
		},
		ui: {
			featureTitle: "whitespace-normal self-center",
			featureIcon: "h-6",
			feature: "items-start",
		},
		scale: true,
	},
	{
		title: "Semester Monthly",
		description: "For consistent students.",
		price: "$9.99",
		billingCycle: "/month",
		billingPeriod: "billed monthly",
		features: [
			"3,000 Credits Per Month",
			"Access All Pro Models (Claude, GPT-4)",
			"Full Generation History",
			"Priority Support",
		],
		button: {
			label: "Subscribe Monthly",
			variant: "subtle",
			loading: loading.value,
			onClick: () => handleUpgrade("monthly"),
		},
		ui: {
			featureTitle: "whitespace-normal self-center",
			featureIcon: "h-6",
			feature: "items-start",
		},
	},
]);

const roadmap = [
	{
		icon: "hugeicons:checkmark-circle-02",
		date: "Released",
		title: "Phase 1: The Foundation",
		description: "Core features are live and stable.",
		features: [
			"AI Summaries & Quizzes",
			"PDF & Text Processing",
			"Free & Pro Subscriptions",
			"Generation History",
		],
	},
	{
		icon: "hugeicons:checkmark-circle-02",
		date: "Released",
		title: "Phase 2: Expansion",
		description: "Widening support and usability.",
		features: [
			"Word (.docx) & Text (.txt) Support",
			"Web Article Importer (URL)",
			"Searchable History",
			"Delete/Manage History",
		],
	},
	{
		icon: "hugeicons:save-money-dollar",
		date: "Coming Soon",
		title: "Phase 3: Growth & Flexibility",
		description: "More ways to pay and easier access.",
		features: [
			"Flexible Pricing (Weekly/Lifetime)",
			"Google & GitHub Login",
			"User Feedback System",
		],
	},
	{
		icon: "hugeicons:sparkles",
		date: "Coming Soon",
		title: "Phase 4: Deep Intelligence",
		description: "Transforming documents into a study partner.",
		features: ['Interactive "Chat with PDF"', "Export to Anki/Quizlet"],
	},
];
</script>

<template>
	<section>
		<UPageHero
			title="Master Any Topic in Seconds"
			description="Stop reading endless textbook chapters. Kerna uses AI to turn your PDFs and notes into concise summaries, key terms, and practice quizzes instantly."
			orientation="horizontal"
			:ui="{
				title: 'sm:text-6xl',
				container: 'min-h-[calc(100vh-var(--ui-header-height))]',
			}">
			<template #links>
				<UButton
					to="/app"
					label="Get Started for Free"
					icon="hugeicons:rocket-01"
					size="xl" />
				<UButton
					to="/login"
					label="Log In"
					color="neutral"
					variant="ghost"
					size="xl"
					icon="hugeicons:login-03" />
			</template>

			<template #default>
				<div
					class="relative aspect-video w-full max-w-3xl mx-auto rounded-xl border border-default bg-default flex items-center justify-center overflow-hidden shadow-2xl">
					<div class="text-center space-y-2 p-8">
						<UIcon
							name="hugeicons:file-02"
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
					as="li"
					title="PDF Uploads"
					icon="hugeicons:file-add"
					description="Drag and drop your 50-page textbook chapters. We extract the text and find the gold."
					variant="subtle" />
				<UPageCard
					as="li"
					title="Instant Quizzes"
					icon="hugeicons:graduation-scroll"
					description="Test your knowledge immediately. Kerna generates multiple-choice questions with answer keys."
					variant="subtle" />
				<UPageCard
					as="li"
					title="Key Term Extraction"
					icon="hugeicons:key-01"
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
					as="li"
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
					as="li"
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
					as="li"
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

		<UPageSection
			id="pricing"
			:ui="{ container: 'min-h-[75dvh] content-center' }">
			<UPricingPlans :plans="plans" scale compact />
		</UPageSection>

		<USeparator />

		<UPageSection
			title="Our Roadmap"
			description="Kerna is just getting started. Here's what we're building next.">
			<div class="overflow-x-auto pb-2">
				<UTimeline
					:items="roadmap"
					:default-value="1"
					orientation="horizontal"
					:ui="{
						root: 'w-max min-w-full',
						description: 'text-toned',
					}">
					<template #description="{ item }">
						<p>
							{{ item.description }}
						</p>
						<ul
							class="list-disc marker:text-primary pl-4 text-muted">
							<li
								v-for="feature in item.features"
								:key="feature"
								class="text-sm">
								{{ feature }}
							</li>
						</ul>
					</template>
				</UTimeline>
			</div>
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
