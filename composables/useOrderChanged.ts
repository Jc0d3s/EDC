export default function useOrderChanged(
    formModel: any[],
    formModelRef: any[],
    idKey: string,
    orderKey: string,
) {
    const model = ref<any[]>(deepClone(formModel));
    const modelRef = ref<any[]>(deepClone(formModelRef));

    // const isOrderChanged = computed(() =>
    //     checkIfItemOrderChanged(model.value, modelRef.value, idKey, orderKey),
    // );
    const isOrderChanged = computed(() => {
        log("info", [
            "checkIfItemOrderChanged(model.value, modelRef.value, idKey, orderKey)",
            checkIfItemOrderChanged(model.value, modelRef.value, idKey, orderKey),
        ]);
        return checkIfItemOrderChanged(model.value, modelRef.value, idKey, orderKey);
    });

    return { isOrderChanged, model, modelRef };
}
