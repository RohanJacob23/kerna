export default defineNuxtRouteMiddleware(async () => {
	const auth = useAuth();
	await callOnce("auth-init", auth.fetchSession);
	if (!auth.user.value) {
		return navigateTo("/login");
	}
});
