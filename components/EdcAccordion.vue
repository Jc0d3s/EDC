<script setup lang="ts">
    defineProps<{
        dataCount: number;
        loading: boolean;
        isActive: boolean;
    }>();

    const emit = defineEmits<{
        "on-heading-click": [];
    }>();

    // const activeIndex = ref<TNullableNumber>(0);

    // function toggle(index: number) {
    //     activeIndex.value = activeIndex.value === index ? null : index;
    // }
</script>

<template>
    <div class="flex flex-col gap-[1rem] w-full">
        <template v-if="loading">
            <div v-for="(rowCount, index) in dataCount" :key="index" class="accordion-item">
                <div
                    class="pointer-events-none accordion-header !py-[2rem]"
                    @click="
                        () => {
                            // toggle(index);
                            emit('on-heading-click');
                        }
                    "
                >
                    <edc-skeleton-loader
                        container-class="w-[90%] h-[1rem] my-[0.5rem]"
                        loader-type="rectangle"
                    />
                    <edc-skeleton-loader
                        container-class="w-[3%] h-[1rem] my-[0.5rem]"
                        loader-type="rectangle"
                    />
                </div>
            </div>
        </template>
        <template v-else>
            <!-- <div v-for="(item, index) in items" :key="index" class="accordion-item"> -->
            <div
                v-for="(rowCount, index) in dataCount"
                :key="index"
                class="accordion-item mb-[1rem]"
            >
                <div
                    class="accordion-header"
                    @click="
                        () => {
                            // toggle(index);
                            emit('on-heading-click');
                        }
                    "
                >
                    <slot name="header" />
                    <!-- index === activeIndex -->
                    <edc-icon
                        icon="chevron-right-sharp"
                        :class="`transition-all !w-[1.5rem] !h-[1.5rem] ${isActive ? 'rotate-90' : ''}`"
                        fill="var(--color-black)"
                    />
                </div>
                <edc-transition-height>
                    <!-- <div v-show="activeIndex === index" class="accordion-body"> -->
                    <div v-show="isActive" class="accordion-body">
                        <slot name="timeline" />
                    </div>
                </edc-transition-height>
            </div>
        </template>
    </div>
</template>

<style scoped>
    .accordion-item {
        /* border: 1px solid #ccc; */
        border: 0.1rem solid #ccc;
        /* --color-gray-line */
    }
    .accordion-header {
        padding: 1rem;
        /* background: #f1f1f1; */
        /* background: var(--color-accordion-header); */
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: start;
    }
    .accordion-body {
        padding: 1rem;
        background: var(--color-white);
    }
</style>
