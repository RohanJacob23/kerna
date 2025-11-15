export default defineNuxtRouteMiddleware(async (to) => {
	// These routes are accessible to unauthenticated users
	const publicRoutes = ["/", "/login", "/sign-up"];

	// If the user is just visiting the homepage, let them proceed without any session check.
	if (to.path === "/") {
		return;
	}

	// For all other routes, get auth state
	const auth = useAuth();
	await callOnce("auth-init", auth.fetchSession);

	const userIsAuthenticated = !!auth.user.value;
	const routeIsPublic = publicRoutes.includes(to.path);

	// Case 1: User is authenticated
	if (userIsAuthenticated) {
		// If they try to visit login or sign-up, redirect them to the app
		if (to.path === "/login" || to.path === "/sign-up") {
			return navigateTo("/app");
		}

		// Otherwise, let them proceed
		return;
	}

	// Case 2: User is NOT authenticated
	if (!userIsAuthenticated) {
		// If they are trying to access a public route (e.g., /login), let them
		if (routeIsPublic) {
			return;
		}

		// If they are trying to access a protected route, redirect to login
		return navigateTo("/login");
	}
});
