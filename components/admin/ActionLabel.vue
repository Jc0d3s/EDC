<script setup lang="ts">
    import type { TVoidAction } from "~/types/common";

    const props = withDefaults(
        defineProps<{
            icon: TIcon;
            text: string;
            onClick: TVoidAction;
            containerClass?: string;
            disabled?: boolean;
            confirmationMessage?: string;
            type?: "confirmation" | "default";
        }>(),
        {
            containerClass: "",
            disabled: false,
            confirmationMessage: "",
            type: "default",
        },
    );

    const containerClasses = () => `!justify-start ${props.containerClass}`.trim();
</script>

<template>
    <template v-if="type === 'confirmation'">
        <edc-delete-confirmation
            :message="confirmationMessage"
            :disabled="disabled"
            type="submit"
            :on-delete="
                () => {
                    onClick();
                }
            "
        >
            <template #icon>
                <edc-pressable
                    :container-class="containerClasses()"
                    slot-wrapper-class="flex flex-row items-center gap-[0.5rem] relative"
                    :disabled="disabled"
                >
                    <edc-icon
                        :icon="icon"
                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                        fill="var(--color-secondary)"
                    />
                    <span class="text-[1.3rem] secondary-text">{{ text }}</span>
                </edc-pressable>
            </template>
        </edc-delete-confirmation>
    </template>
    <template v-else>
        <edc-pressable
            :container-class="containerClasses()"
            slot-wrapper-class="flex flex-row items-center gap-[0.5rem] relative"
            :disabled="disabled"
            :on-click="() => onClick()"
        >
            <edc-icon
                :icon="icon"
                :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                fill="var(--color-secondary)"
            />
            <span class="text-[1.3rem] secondary-text">{{ text }}</span>
        </edc-pressable>
    </template>
</template>
