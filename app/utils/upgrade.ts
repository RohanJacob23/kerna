export default async function (plan: "pro-montly" | "pro-yearly") {
	const auth = useAuth();

	if (!auth.user.value) {
		await navigateTo("/login");
		return;
	}

	const response = await auth.checkout({
		slug: plan,
	});

	if (response.data) {
		await navigateTo(response.data.url, { external: true });
	}
}
