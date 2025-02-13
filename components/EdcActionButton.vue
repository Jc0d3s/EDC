<script setup lang="ts">
import type { TButtonAction } from "~/types/common";

// Define props with TypeScript and default values
const props = withDefaults(
    defineProps<{
        containerClass?: string;
        labelClass?: string;
        label: string;
        type?: "cancel" | "submit" | "delete";
        disabled?: boolean;
        showLoader?: boolean;
        tabindex?: number;
        isDisabledStateStyle?: boolean;
        onClick: TButtonAction;
        onKeyUp?: TButtonAction;
    }>(),
    {
        disabled: false,
        type: "submit",
        containerClass: "md:py-[0.4rem] md:px-[3rem] lg:py-[0.8rem] lg:px-[6rem]",
        labelClass: "",
        showLoader: false,
        tabindex: undefined,
        isDisabledStateStyle: true,
        onKeyUp: () => {},
    },
);

// Reactive loading state
const loading = ref<boolean>(false);

// Computed classes for the container
const containerClasses = computed(() => ({
    container: true,
    [`${props.type}-container`]: !loading.value || props.type === "cancel",
    "container-striped-bg": (loading.value || props.showLoader) && props.type === "submit",
    [props.containerClass]: true,
    [props.containerClass.includes("rounded") ? "" : "md:rounded-[--border-radius-6] lg:rounded-[--border-radius-10]"]: true,
    disabled: props.isDisabledStateStyle,
}));

// Computed classes for the label
const labelClasses = computed(() => ({
    [props.labelClass]: true,
    "font-bold button-text": true,
    "text-[var(--color-white)]": props.type === "submit" || props.type === "delete",
    "text-[var(--color-gray-cancel-text)]": props.type === "cancel",
}));

// Handle button click
async function handleClick() {
    loading.value = true;
    await props.onClick();
    loading.value = false;
}

// Helper function to determine if the button is disabled
function isElementDisabled(loading: boolean, disabled: boolean): boolean {
    return loading || disabled;
}
</script>

<template>
    <button
        type="button"
        :class="containerClasses"
        :disabled="isElementDisabled(loading, disabled)"
        :tabindex="tabindex"
        @click="handleClick"
        @keyup.enter="props.onKeyUp"
    >
        <span :class="labelClasses">{{ label }}</span>
    </button>
</template>

<style scoped>
.container {
    width: fit-content;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    @apply transition-all;
}

.button-text {
    font-size: var(--text-11);
}

.submit-container {
    color: var(--color-white);
    background-color: var(--color-accent);
}
.submit-container:hover {
    background-color: var(--color-accent-hover);
}
.submit-container.disabled:disabled {
    opacity: 0.7;
}

.cancel-container {
    color: var(--color-gray-cancel-text);
    background-color: var(--color-gray-cancel);
}
.cancel-container:hover {
    background-color: var(--color-gray-cancel-hover);
}
.cancel-container:disabled {
    opacity: 0.7;
}

.delete-container {
    color: var(--color-white);
    background-color: var(--color-error);
}
.delete-container:hover {
    background-color: var(--color-error-hover);
}
.delete-container:disabled {
    opacity: 0.7;
}

.container-striped-bg {
    background-color: var(--color-primary);
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23003465' fill-opacity='0.42' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
    animation: barberpole 3s linear infinite;
}

@keyframes barberpole {
    100% {
        background-position: 200% 200%;
    }
}

@media screen and (min-width: 1024px) {
    .button-text {
        font-size: var(--text-12);
    }
}
</style>