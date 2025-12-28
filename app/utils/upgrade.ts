import type { PlanType } from "~~/server/db/schema";

export default async function (plan: PlanType) {
	const auth = useAuth();

	if (!auth.user.value) {
		await navigateTo("/login");
		return;
	}

	const response = await auth.checkout({
		slug: plan,
		metadata: { plan, userId: auth.user.value.id },
	});

	if (response.data) {
		await navigateTo(response.data.url, { external: true });
	}
}
