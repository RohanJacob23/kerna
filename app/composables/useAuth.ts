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

	const fetchSession = async () => {
		// await new Promise((resolve) => setTimeout(resolve, 2000));

		const { data } = await authClient.getSession({
			fetchOptions: {
				headers,
			},
		});
		user.value = data?.user || null;
	};

	const signOut = async () => {
		const { $toast: toast } = useNuxtApp();
		if (import.meta.client) {
			toast.promise(authClient.signOut, {
				loading: "Logging out",
				success: async () => {
					user.value = null;
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
	};
};
