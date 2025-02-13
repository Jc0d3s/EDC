<script setup lang="ts">
    import type { TNullableNumber, TNullableString } from "~/types/common";
    import type { IRadioProps } from "~/types/form-generation";

    const modelValue = defineModel<TNullableString | TNullableNumber>({
        default: null,
    });
    // -bottom-[12rem]
    const props = withDefaults(defineProps<IRadioProps>(), {
        label: "",
        elementId: "",
        containerClass: "",
        inputClass: "",
        labelClass: "",
        checked: false,
        required: false,
        error: null,
        allowDeselect: false,
        disabled: false,
        tabindex: undefined,
    });

    const emit = defineEmits<{
        "on-change": [selectedValue: string];
    }>();

    const preSelected = ref<boolean>(props.checked);
    const getInputId = useMemoize(
        () =>
            props.elementId ||
            convertWordsIntoCasedWords(
                props.label ? `${props.name}_${props.label}` : "",
                "camel case",
            ),
    );

    const containerClasess = computed(() => ({
        container: true,
        [props.containerClass]: props.containerClass,
    }));

    const inputClasses = computed(() => ({
        "input-value radio-input": true,
        [props.inputClass]: props.inputClass,
        "input-font !w-fit": !props.inputClass.includes("font"),
        "w-[1.2rem] h-[1.2rem]": props.labelClass.includes("admin-input-font"),
    }));

    function onChange(event: Event) {
        const selectedValue = (event.currentTarget as HTMLInputElement).value;
        emit("on-change", selectedValue);
    }

    function handleDeselect(event: Event) {
        const selectedValue = (event.currentTarget as HTMLInputElement).value;
        if (props.allowDeselect && modelValue.value === selectedValue) modelValue.value = null;
    }

    onMounted(() => {
        // if (modelValue.value === props.value) modelValue.value = props.value;
        if (modelValue.value === props.value) preSelected.value = true;
    });
</script>
<template>
    <div :class="containerClasess">
        <div class="relative">
            <input
                :id="getInputId()"
                v-model="modelValue"
                :value="value"
                type="radio"
                :class="inputClasses"
                :name="name"
                :checked="preSelected"
                :disabled="isElementDisabled(disabled)"
                :tabindex="tabindex"
                @change="onChange($event)"
                @click="handleDeselect($event)"
            />
        </div>
        <edc-form-label
            :input-id="getInputId()"
            :label="label"
            :required="required"
            :label-class="labelClass"
            :disabled="disabled"
        />
    </div>
</template>
<style scoped>
    .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .text-label {
        width: 100%;
    }

    div.optionsContainer p:first-child {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
    }
    div.optionsContainer p:last-child {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
    }
</style>
