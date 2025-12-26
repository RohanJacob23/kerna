import { dodopaymentsClient } from "@dodopayments/better-auth";
import { createAuthClient } from "better-auth/vue";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const useAuth = () => {
	const url = useRequestURL();
	const headers = import.meta.server ? useRequestHeaders() : undefined;
	const authClient = createAuthClient({
		baseURL: url.origin,
		fetchOptions: {
			headers,
		},
		plugins: [dodopaymentsClient(), inferAdditionalFields<typeof auth>()],
	});

	const user = useState<typeof authClient.$Infer.Session.user | null>(
		"auth:user",
		() => null
	);
	const isPro = useState<boolean>("auth:isPro", () => false);

	// 2. Create a function to check Polar for benefits
	const checkProStatus = async () => {
		if (user.value) {
			try {
				// 'customer.get' fetches Polar data, including benefits
				const { data, error } =
					await authClient.dodopayments.customer.subscriptions.list({
						query: { status: "active" },
					});
				if (error) throw new Error(error.message);

				// This is our "firewall" logic, same as the backend.
				isPro.value = data.items.length > 0;
			} catch (e) {
				console.error("Failed to check Pro status:", e);
				isPro.value = false;
			}
		} else {
			isPro.value = false;
		}
	};

	const fetchSession = async () => {
		// await new Promise((resolve) => setTimeout(resolve, 2000));

		const { data } = await authClient.getSession({
			fetchOptions: {
				headers,
			},
		});
		user.value = data?.user || null;
		await checkProStatus();
	};

	const signOut = async () => {
		const { $toast: toast } = useNuxtApp();
		if (import.meta.client) {
			toast.promise(authClient.signOut, {
				loading: "Logging out",
				success: async () => {
					user.value = null;
					isPro.value = false;
					await navigateTo("/login");
					return "Logged out";
				},
				error: "Logout failed",
			});
		}
	};

	return {
		fetchSession,
		signIn: authClient.signIn,
		signUp: authClient.signUp,
		checkout: authClient.dodopayments.checkoutSession,
		portal: authClient.dodopayments.customer.portal,
		signOut,
		user,
		isPro,
	};
};
