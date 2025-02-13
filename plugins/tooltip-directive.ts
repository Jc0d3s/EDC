// function getPositionClass(modifiers: Record<string, boolean>) {
//     if (modifiers.top) {
//         return "top";
//     } else if (modifiers.bottom) {
//         return "bottom";
//     } else if (modifiers.left) {
//         return "left";
//     } else if (modifiers.right) {
//         return "right";
//     }

//     return "top";
// }

export default defineNuxtPlugin(() => {
    // Doing something with nuxtApp
    // nuxtApp.vueApp.directive("tooltip", {
    //     mounted: (el, binding) => {
    //         el.setAttribute("data-tooltip", binding.value?.text || binding.value);
    //         el.classList.add("with-tooltip");
    //         const position = binding.value.position || getPositionClass(binding.modifiers);
    //         el.classList.add(`tooltip-${position}`);
    //     },
    // });
    // nuxtApp.vueApp.directive("tooltip", vTooltip);
});

// To fix getSSRProps while nuxt generate please do one of the below steps
// 1. Add a corresponding .server.ts file with empty directive
// export default defineNuxtPlugin(({vueApp}) => {
//     vueApp.directive('tooltip', {});
//   });
// 2. or rename the file extension from .client.ts to .ts
