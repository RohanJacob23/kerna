export default defineNuxtRouteMiddleware(async (to) => {
	// 1. Define route categories
	const publicRoutes = ["/", "/privacy", "/terms"];
	const authRoutes = ["/login", "/sign-up"]; // Routes only for unauthenticated users

	// 2. Skip checks for public content
	if (publicRoutes.includes(to.path)) {
		return;
	}

	// 3. Fetch Session
	const auth = useAuth();
	// specific key ensures this only runs once during hydration
	await callOnce("auth-init", auth.fetchSession);

	const userIsAuthenticated = !!auth.user.value;

	// 4. Logic for Auth Routes (Login/Signup)
	if (authRoutes.includes(to.path)) {
		// If user is ALREADY logged in, kick them to the app
		if (userIsAuthenticated) {
			return navigateTo("/app");
		}
		// If not logged in, let them view the login page
		return;
	}

	// 5. Logic for Protected Routes (everything else)
	if (!userIsAuthenticated) {
		// Save the route they were trying to visit to redirect back after login (optional but recommended)
		return navigateTo("/login");
	}
});
