export default async function () {
	const auth = useAuth();

	if (!auth.user.value) {
		await navigateTo("/login");
		return;
	}

	const response = await auth.checkout({
		allowDiscountCodes: false,
		products: [
			"4704678a-30bb-491b-a271-b3e13a8df232",
			"e3202f58-3b3b-4c5a-bbc3-a437f3aee3c8",
			// "7376ec9f-5f84-4c6c-a148-3b936f00b83a",
			// "38bfd178-70d9-4d56-a0a0-ea93ccc66a9a",
		],
	});

	if (response.data) {
		await navigateTo(response.data.url, { external: true });
	}
}
