export default defineNuxtRouteMiddleware(async (to) => {
	const publicRoutes = ["/"];

	if (publicRoutes.includes(to.path)) {
		return;
	}

	const auth = useAuth();
	await callOnce("auth-init", auth.fetchSession);

	if (auth.user.value && (to.path === "/login" || to.path === "/sign-up")) {
		return navigateTo("/app");
	}

	if (!auth.user.value) {
		return navigateTo("/login");
	}
});
