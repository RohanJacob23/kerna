import { createAuthClient } from "better-auth/vue";

export const useAuth = () => {
	const url = useRequestURL();
	const headers = import.meta.server ? useRequestHeaders() : undefined;
	const authClient = createAuthClient({
		baseURL: url.origin,
		fetchOptions: {
			headers,
		},
	});

	const user = useState<typeof authClient.$Infer.Session.user | null>(
		"auth:user",
		() => null
	);

	const fetchSession = async () => {
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
				success: () => {
					user.value = null;
					navigateTo("/login");
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
		signOut,
		user,
	};
};
