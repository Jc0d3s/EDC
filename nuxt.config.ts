// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    typescript: {
        typeCheck: false, // process.env.TYPE_CHECK === "true",
    },
    runtimeConfig: {
        public: {
            mode: process.env.MODE,
            apiBaseURL: process.env.API_BASE_URL,
            typeCheck: process.env.TYPE_CHECK,
            encodeKey: process.env.ENCODE_KEY,
        },
    },
    // app: {
    //     head: {
    //         link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    //     },
    // },
    // plugins: ["~/plugins/apex-charts.client.ts"],
    modules: ["@pinia/nuxt", "@vueuse/nuxt", "floating-vue/nuxt"],
    imports: {
        dirs: ["./utils/**"],
    },
    ignore: [
        // ...(process.env.MODE !== "dev" ? ["/assets/email-content.json"] : []),
        // ...(process.env.MODE !== "dev" ? ["/pages/email-template.vue"] : []),
    ],
    // extends: ["github:VHypotenuse/testing-edc-components#master"],
});
