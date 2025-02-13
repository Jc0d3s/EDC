export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;
    if (checkIfAuthorizedAdminRoutes(to.fullPath) && !checkIfUserIsAuthorized()) {
        triggerUnauthorizedToastMessage();
        return navigateTo(
            getRouteNavigationData({
                path: AdminPath.Login,
            }),
        );
    }
});
