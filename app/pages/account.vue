<script setup lang="ts">
import type { PlanType } from "~~/server/db/schema";

definePageMeta({ layout: "app" });
useSeoMeta({ title: "Account" });

const { $toast: toast } = useNuxtApp();
const { user, portal } = useAuth();

const isPro = computed(() => user.value?.plan !== "free");
const maxCredits = computed(() => {
	const plan = user.value?.plan ?? ("free" as PlanType);
	return PLANS[plan].credits;
});

console.log(user.value?.credits);

// // This function calls our new endpoint
const openBillingPortal = async () => {
	if (!isPro.value) return;

	const id = toast.loading("Opening billing portal...");
	const res = await portal();

	if (res.data) {
		await navigateTo(res.data.url, { external: true });
		toast.success("Billing portal opened successfully!", { id: id });
	}
};
</script>

<template>
	<UContainer>
		<UPage>
			<UPageBody>
				<UPageHeader
					title="My Account"
					description="Manage your account details and subscription." />

				<UPageList class="space-y-4">
					<UCard>
						<template #header>
							<h3 class="font-semibold">Account Details</h3>
						</template>

						<div class="space-y-4">
							<UUser
								:name="user?.name"
								:description="user?.email"
								size="xl" />
						</div>
					</UCard>

					<UCard v-if="user">
						<template #header>
							<h3 class="font-semibold">Credits left</h3>
						</template>
						<p
							class="text-sm text-muted mb-2 [&_span]:text-default">
							You have <span>{{ user.credits }} /</span>
							<span>{{ "" }} {{ maxCredits }}</span> credits left
						</p>
						<UProgress
							v-model="user.credits"
							:max="
								user.credits > maxCredits
									? user.credits
									: maxCredits
							" />
					</UCard>

					<UCard>
						<template #header>
							<h3 class="font-semibold">Subscription</h3>
						</template>

						<div class="space-y-2">
							<UAlert
								v-if="user && !user.emailVerified"
								title="Please verify your email"
								description="To unlock unlimited generations and save your history, please verify your email."
								icon="hugeicons:alert-01"
								color="error"
								variant="soft" />

							<UAlert
								v-if="isPro"
								icon="hugeicons:checkmark-circle-02"
								color="success"
								variant="soft"
								:title="`You are on the Kerna's ${user?.plan} plan!`"
								description="Click the button below to manage your subscription, update your payment method, or switch between monthly and yearly billing." />

							<UAlert
								v-else
								icon="hugeicons:alert-circle"
								color="info"
								variant="soft"
								title="You are on the Free plan."
								description="To unlock unlimited generations and save your
							history, please upgrade to Pro." />
						</div>

						<template #footer
							><UButton
								label="Manage Billing"
								icon="hugeicons:credit-card"
								block
								loading-auto
								:disabled="!isPro"
								@click="openBillingPortal"
						/></template>
					</UCard>
				</UPageList>
			</UPageBody>
		</UPage>
	</UContainer>
</template>
