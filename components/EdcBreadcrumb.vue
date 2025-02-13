<script setup lang="ts">
import { computed } from "vue";
import useStudyStore from "~/stores/study";

// Define props with TypeScript and default values
const props = withDefaults(
    defineProps<{
        breadCrumbDetails: string[];
        type?: "clinical-trials" | "discrepancy-modal";
    }>(),
    {
        type: "clinical-trials",
    },
);

// Access the study store
const studyStore = useStudyStore();

// Computed classes for the breadcrumb labels
const labelClasses = computed(() => ({
    "font-bold": true,
    "text-[1.2rem] lg:text-[1.3rem] accent-text": props.type === "clinical-trials",
    "text-[1.3rem] lg:text-[1.4rem]": props.type === "discrepancy-modal",
}));

// Debugging: Log breadcrumb details
console.log("Breadcrumb Loaded:", props.breadCrumbDetails);
</script>

<template>
    <section
        v-if="breadCrumbDetails.length > 0"
        class="flex flex-row items-center self-start gap-4 mb-8"
    >
        <template v-for="(crumb, index) in breadCrumbDetails" :key="index">
            <!-- Skeleton loader for loading state -->
            <edc-skeleton-loader
                v-if="studyStore.loading.pageDetails"
                container-class="w-36 h-8"
            />

            <!-- Breadcrumb label -->
            <span
                v-else
                :class="[labelClasses, index === breadCrumbDetails.length - 1 ? 'opacity-60' : '']"
            >
                {{ crumb }}
            </span>

            <!-- Chevron icon separator (Not for last breadcrumb) -->
            <edc-icon
                v-if="index < breadCrumbDetails.length - 1"
                icon="chevron-right-sharp"
                class="w-5 h-5 opacity-60"
                fill="var(--color-accent)"
            />
        </template>
    </section>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>
