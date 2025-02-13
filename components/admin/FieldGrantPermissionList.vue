<script setup lang="ts">
    import type { IOptions, TOptionValue } from "~/types/common";

    const modelValue = defineModel<TOptionValue[]>({
        default: [],
    });

    const props = withDefaults(
        defineProps<{
            list: IOptions[];
            defaultValues?: TOptionValue[];
            containerClass?: string;
            disabled?: boolean;
            name: string;
        }>(),
        {
            defaultValues: () => [],
            containerClass: "",
            disabled: false,
        },
    );

    const containerClasses = computed(() => ({
        // "w-fit border-[var(--color-black)] border-[0.1rem] p-[0.5rem] ml-[1rem] grid grid-cols-3 gap-[1rem]":
        "w-fit border-[var(--color-black)] border-[0.1rem] p-[0.5rem] ml-[1rem] flex flex-row items-center justify-start flex-wrap gap-[1rem]":
            true,
        [props.containerClass]: props.containerClass,
    }));

    function handleSelect(selectedValue: TOptionValue, action: "add" | "remove") {
        if (action === "add") modelValue.value.push(selectedValue);
        else {
            const itemIndex = getIndexOfTheItem({
                data: modelValue.value,
                type: "primitive",
                value: selectedValue,
            });
            if (itemIndex >= 0) modelValue.value.splice(itemIndex, 1);
        }
    }

    function checkIfRoleChecked(roleValue: TOptionValue) {
        return modelValue.value.includes(roleValue);
    }

    onMounted(() => {
        if (getArrayLength(props.defaultValues) > 0) {
            modelValue.value = [...props.defaultValues];
        }
    });
</script>

<template>
    <div :class="containerClasses">
        <template v-if="getArrayLength(list) > 0">
            <edc-checkbox
                v-for="listRow of list"
                :key="listRow.value"
                :label="listRow.label"
                label-class="!mb-[0rem] admin-input-font"
                input-class="admin-input-font"
                :name="name"
                :checked="checkIfRoleChecked(listRow.value)"
                :disabled="disabled"
                :set-checked-to-model="true"
                @on-change="
                    (currentValue) => {
                        handleSelect(listRow.value, currentValue ? 'add' : 'remove');
                    }
                "
            />
        </template>
        <span v-else class="admin-input-font">No roles to display</span>
    </div>
</template>
