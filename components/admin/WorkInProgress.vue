<script setup lang="ts"></script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <img
            :src="getImageSource(ImageKeys.WorkInProgress, 'image')"
            :alt="getAltTagTitle('work in progress', 'image')"
            class="h-[25rem] mx-auto mt-[10rem]"
        />
    </div>
</template>

<style scoped></style>
