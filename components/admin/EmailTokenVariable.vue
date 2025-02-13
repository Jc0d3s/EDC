<script setup lang="ts">
    import type { ITokenVariableDragItem, TTokenType } from "~/types/common";

    const props = withDefaults(
        defineProps<{
            label: string;
            disabled?: boolean;
            isTokenUsed?: boolean;
            type: TTokenType;
        }>(),
        {
            disabled: false,
            isTokenUsed: false,
        },
    );

    const emit = defineEmits<{
        "on-drag": [event: DragEvent, slotProps: ITokenVariableDragItem];
        "on-click": [event: MouseEvent, slotProps: ITokenVariableDragItem];
    }>();

    const isLabelDragged = ref<boolean>(false);

    const containerClasses = computed(() => ({
        "transition-all flex flex-row items-center justify-center w-fit rounded-[var(--border-radius-16)] px-[1rem] py-[0.2rem] translate-x-0 translate-y-0":
            true,
        "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] cursor-pointer":
            !props.isTokenUsed,
        "bg-[var(--color-gray-cancel)] pointer-events-none": props.isTokenUsed,
    }));

    const labelClasses = computed(() => ({
        "inline-block font-semibold font-11": true,
        "white-text": !props.isTokenUsed,
        "black-text": props.isTokenUsed,
    }));

    function startDrag(event: DragEvent, slotProps: ITokenVariableDragItem) {
        event.dataTransfer!.dropEffect = "move";
        event.dataTransfer!.effectAllowed = "move";
        event.dataTransfer!.setData("item", JSON.stringify(slotProps));
        emit("on-drag", event, slotProps);
        isLabelDragged.value = true;
    }

    function onDrop(event: DragEvent, slotProps: ITokenVariableDragItem) {
        log("info", ["slotProps in onDrop email-token-variable", slotProps]);
        event.dataTransfer!.clearData("item");
        // emit("on-drop", evt, slotProps, () => evt.dataTransfer!.clearData("item"));
        isLabelDragged.value = false;
    }

    function handleClick(event: MouseEvent, slotProps: ITokenVariableDragItem) {
        if (!isLabelDragged.value) {
            emit("on-click", event, slotProps);
        }
        if (isLabelDragged.value) isLabelDragged.value = false;
    }
</script>

<template>
    <div
        :draggable="true"
        :class="containerClasses"
        :disabled="isElementDisabled(disabled)"
        @dragstart="
            startDrag($event, {
                label,
                type,
            })
        "
        @drop="
            onDrop($event, {
                label,
                type,
            })
        "
        @dragend="
            () => {
                if (isLabelDragged) isLabelDragged = false;
            }
        "
        @dragover.prevent
        @dragenter.prevent
        @mouseup.left="
            handleClick($event, {
                label,
                type,
            })
        "
    >
        <span :class="labelClasses">{{ label }}</span>
    </div>
</template>

<style scoped></style>
