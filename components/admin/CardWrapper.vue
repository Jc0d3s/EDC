<script setup lang="ts">
    const props = withDefaults(
        defineProps<{
            groupLabel?: string;
            containerClass?: string;
            wrapperClass?: string;
        }>(),
        {
            groupLabel: "",
            containerClass: "",
            wrapperClass: "",
        },
    );

    const containerClasses = computed(() => ({
        "w-full": true,
        [props.containerClass]: props.containerClass,
    }));

    const wrapperClasses = computed(() => ({
        "wrapper p-[2rem]": true,
        [props.wrapperClass]: props.wrapperClass,
    }));
</script>

<template>
    <div :class="containerClasses">
        <div
            v-if="groupLabel"
            class="bg-[var(--color-secondary)] white-text text-[1.2rem] w-fit font-bold py-[0.2rem] px-[0.5rem] rounded-t-[var(--border-radius-6)]"
        >
            {{ groupLabel }}
        </div>
        <div :class="wrapperClasses">
            <slot name="content" />
        </div>
    </div>
</template>

<style scoped>
    .wrapper {
        /* rounded-[var(--border-radius-6)] */
        border-bottom-right-radius: var(--border-radius-6);
        border-bottom-left-radius: var(--border-radius-6);
        border-top-right-radius: var(--border-radius-6);
        box-shadow:
            rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
            rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    }
</style>
