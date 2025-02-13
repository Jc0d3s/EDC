import useUnsavedAlertStore from "~/stores/unsaved-alert";

export default function useUnsavedAlert(formModel: any, formModelRef: any) {
    const unsavedAlertStore = useUnsavedAlertStore();

    const model = ref<any>(formModel);
    const modelRef = ref<any>(formModelRef);
    const isModelChanged = ref<boolean>(false);

    function preventRefreshOrNavigation(event: any) {
        if (!unsavedAlertStore.isUnsavedChanges) return;
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "";
    }

    onBeforeMount(() => {
        window.addEventListener("beforeunload", preventRefreshOrNavigation);
    });

    onBeforeUnmount(() => {
        window.removeEventListener("beforeunload", preventRefreshOrNavigation);
    });

    const handleFormUnsavedEditing = () => {
        if (unsavedAlertStore.isUnsavedChanges) {
            if (!window.confirm("You have unsaved changes do you want to continue?")) {
                return false;
            }
            unsavedAlertStore.clearStore();
        }
        return true;
    };

    onBeforeRouteLeave((_to, _from, next) => {
        if (!handleFormUnsavedEditing()) {
            window.history.forward();
            return;
        }
        next();
    });

    // watch(
    //     () => formModel,
    //     (newFormModel) => {
    //         console.log("newFormModel", newFormModel);
    //         console.log("formModelRef", formModelRef);
    //         if (checkIfModelChanged(newFormModel, formModelRef)) {
    //             console.log("newFormModel true");
    //             unsavedAlertStore.isUnsavedChanges = true;
    //         } else {
    //             console.log("newFormModel false");
    //             unsavedAlertStore.isUnsavedChanges = false;
    //         }
    //     },
    //     { deep: true },
    // );

    watch(
        () => model.value,
        (newFormModel) => {
            if (checkIfModelChanged(newFormModel, modelRef.value)) {
                unsavedAlertStore.isUnsavedChanges = true;
                isModelChanged.value = true;
            } else {
                unsavedAlertStore.isUnsavedChanges = false;
                isModelChanged.value = false;
            }
        },
        { deep: true },
    );

    return { isModelChanged, model, modelRef };
}
