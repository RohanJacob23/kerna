export default defineNuxtRouteMiddleware(async (to) => {
	const publicRoutes = ["/", "/privacy", "/terms"];
	const authRoutes = ["/login", "/sign-up"]; // Routes only for unauthenticated users

	if (publicRoutes.includes(to.path)) {
		return;
	}

	const auth = useAuth();
	await callOnce("auth-init", auth.fetchSession);

	const userIsAuthenticated = !!auth.user.value;

	if (authRoutes.includes(to.path)) {
		if (userIsAuthenticated) {
			return navigateTo("/app");
		}
		return;
	}

	if (!userIsAuthenticated) {
		return navigateTo("/login");
	}
});
