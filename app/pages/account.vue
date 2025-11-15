<script setup lang="ts">
definePageMeta({ layout: "app" });
const { $toast: toast } = useNuxtApp();
const { user, isPro, portal } = useAuth();

// // This function calls our new endpoint
const openBillingPortal = async () => {
	const id = toast.info("Opening billing portal...");
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

					<UCard>
						<template #header>
							<h3 class="font-semibold">Subscription</h3>
						</template>

						<UAlert
							v-if="isPro"
							icon="i-heroicons-check-circle"
							color="success"
							variant="soft"
							title="You are on the Kerna Pro plan!"
							description="Click the button below to manage your
								subscription, update your payment method, or
								switch between monthly and yearly billing." />

						<UAlert
							v-else
							icon="i-heroicons-no-symbol"
							color="info"
							variant="soft"
							title="You are on the Free plan."
							description="To unlock unlimited generations and save your
								history, please upgrade to Pro." />

						<template #footer
							><UButton
								label="Manage Billing"
								icon="i-heroicons-credit-card"
								block
								loading-auto
								@click="openBillingPortal"
						/></template>
					</UCard>
				</UPageList>
			</UPageBody>
		</UPage>
	</UContainer>
</template>
