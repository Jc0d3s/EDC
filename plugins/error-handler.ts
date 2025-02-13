export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        console.error("error in plugin", error);
        console.error("instance in plugin", instance);
        console.error("info in plugin", info);
    };

    // // Also possible
    // nuxtApp.hook('vue:error', (error, instance, info) => {
    //   // handle error, e.g. report to a service
    // })
});
