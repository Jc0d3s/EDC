<script setup lang="ts">
    import type { TNullableString } from "~/types/common";

    withDefaults(
        defineProps<{
            label: string;
            text?: TNullableString;
            type?: "text" | "date" | "checkbox";
            checkValue?: boolean;
        }>(),
        {
            text: "",
            type: "text",
            checkValue: false,
        },
    );

    const getLabelClasses = (isLabel = false) =>
        // `text-[1.3rem] ${isLabel ? "font-bold w-[8rem]" : "font-normal"}`;
        `admin-input-font ${isLabel ? "font-bold" : "font-normal"}`;
</script>

<template>
    <div class="flex flex-row items-center gap-[0.5rem]">
        <span :class="getLabelClasses(true)">{{ label }}:</span>
        <span v-if="checkIfNullOrUndefined(text)">-</span>
        <span v-if="type === 'date'" :class="getLabelClasses()">{{
            formatDate(text, "DD-MMM-YYYY")
        }}</span>
        <edc-icon
            v-else-if="type === 'checkbox' && checkValue"
            icon="check"
            class="fill-[var(--color-secondary)] h-[0.8rem]"
        />
        <span v-else :class="getLabelClasses()">{{ text }}</span>
    </div>
</template>

<style scoped></style>
