<script setup lang="ts">
    const props = withDefaults(
        defineProps<{
            containerClass?: string;
        }>(),
        {
            containerClass: "",
        },
    );

    const containerClasses = () =>
        `${props.containerClass.includes("w-[") ? "" : "w-[40%]"} ${props.containerClass.includes("h-[") ? "" : "h-[1.5rem]"} ${props.containerClass}`.trim();
</script>

<template>
    <edc-skeleton-loader :container-class="containerClasses()" loader-type="rectangle" />
</template>

<scoped></scoped>
