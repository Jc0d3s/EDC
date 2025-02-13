<script setup lang="ts">
    import { type TLogDirection } from "~/services/apis/data/admin/form";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TOptionValue,
        TTableLoaderDetail,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn, IDraggableItem } from "~/types/datatable";
    import { FORM_TYPES, LOG_DIRECTION_OPTIONS } from "~/constants/options";
    import {
        formPaginationListAPI,
        createFormAPI,
        updateFormAPI,
        reorderFormsAPI,
        deleteFormByIdAPI,
    } from "~/services/apis/handlers/admin/form";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import useToastStore from "~/stores/toast";
    import type { IFormData } from "~/services/apis/handlers/types/admin/form-types";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import { trialVisitsListByBranchIDAPI } from "~/services/apis/handlers/admin/trial-visit";
    import useGlobalStore from "~/stores/global";

    interface ITableData {
        id: TNullableNumber;
        branchId: number;
        branchName: TNullableString;
        formName: TNullableString;
        formOId: TNullableString;
        helpText: TNullableString;
        noOfFields: number; // *
        isActive: boolean; // *
        isVisible: boolean;
        otherVisit: boolean;
        isCommon: boolean;
        isLabForm: boolean;
        isNavigateToSubjectDisposition: boolean;
        logDirection: TLogDirection | null;
        saveConfirm: boolean;
        redirectLink: TNullableString;
        redirectFolderId: TNullableNumber;
        redirectFormId: TNullableNumber;
        patientCloudForm: boolean;
        signatureRequired: boolean; // *
        formOrderNumber: number;
        oldFormOrderNumber: number;
        newFormOrderNumber: number;
        isTemplate: boolean;
        tempID: string;
        formType: TNullableNumber;
    }

    interface IValidationError extends IBaseValidationError {
        formName: string;
        formOId: string;
        helpText: string;
        noOfFields: string;
        isActive: string;
        isVisible: string;
        otherVisit: string;
        isCommon: string;
        isLabForm: string;
        isNavigateToSubjectDisposition: string;
        logDirection: string;
        saveConfirm: string;
        redirectLink: string;
        redirectFolder: string;
        redirectForm: string;
        patientCloudForm: string;
        signatureRequired: string; // *
        formOrderNumber: string;
        oldFormOrderNumber: string;
        newFormOrderNumber: string;
        isTemplate: string;
        formType: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        formName: "",
        formOId: "",
        helpText: "",
        noOfFields: "",
        isActive: "",
        isVisible: "",
        otherVisit: "",
        isCommon: "",
        isLabForm: "",
        isNavigateToSubjectDisposition: "",
        logDirection: "",
        saveConfirm: "",
        redirectLink: "",
        redirectFolder: "",
        redirectForm: "",
        patientCloudForm: "",
        signatureRequired: "",
        formOrderNumber: "",
        oldFormOrderNumber: "",
        newFormOrderNumber: "",
        isTemplate: "",
        formType: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const loading = ref<Loading>(new Loading());
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const formSearch = ref<TNullableString>(null);
    const formColumns = () => {
        const columns: IColumn[] = [
            {
                field: "formName",
                header: "Form Name",
                icon: false,
                show: true,
                sort: false,
            },
            {
                field: "formOId",
                header: "OID",
                icon: false,
                show: true,
            },
            {
                field: "helpText",
                header: "Help Text",
                icon: false,
                show: true,
            },
            {
                field: "noOfFields",
                header: "#Fields",
                icon: false,
                show: true,
            },
            {
                field: "isActive",
                header: "Active",
                icon: false,
                show: true,
            },
            {
                field: "isVisible",
                header: "Visible",
                icon: false,
                show: true,
            },
            {
                field: "isTemplate",
                header: "Template",
                icon: false,
                show: true,
            },
            {
                field: "otherVisit",
                header: "Other Visit",
                icon: false,
                show: true,
            },
            {
                field: "isCommon",
                header: "Is Common Form",
                icon: false,
                show: true,
            },
            {
                field: "isLabForm",
                header: "Is Lab Form",
                icon: false,
                show: true,
            },
            {
                field: "isNavigateToSubjectDisposition",
                header: "Navigate to Subject Disposition",
                icon: false,
                show: true,
            },
            {
                field: "formType",
                header: "Form Type",
                icon: false,
                show: true,
            },
            {
                field: "logDirection",
                header: "Log Direction",
                icon: false,
                show: true,
            },
            {
                field: "signatureRequired",
                header: "Signature Required",
                icon: false,
                show: true,
            },
            {
                field: "patientCloudForm",
                header: "Patient Cloud Form",
                icon: false,
                show: true,
            },
        ];
        // if (
        //     props.tabData &&
        //     props.tabLabel &&
        //     checkIfKeyExistsInObject("tabLabel", props.tabData) &&
        //     checkIfKeyExistsInObject("confirmationMessage", props.tabData[props.tabLabel]) &&
        //     props.tabData[props.tabLabel].confirmationMessage
        // ) {
        if (confirmationMessage.value) {
            columns.splice(
                13, // 8, 9, 10, 11, 12
                0,
                {
                    field: "saveConfirm",
                    header: "Save Confirm",
                    icon: false,
                    show: true,
                },
                {
                    field: "redirectLink",
                    header: "Redirect",
                    icon: false,
                    show: true,
                },
            );
        }
        return columns;
    };
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const folderOptions = ref<DropdownOption>(new DropdownOption());

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));
    const folderLookups = computed(() => getOptionsList(folderOptions.value.options, "name", "id"));

    const confirmationMessage = computed(() =>
        props.tabData &&
        props.activeTab.label &&
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData) &&
        checkIfKeyExistsInObject("data", props.tabData[props.activeTab.label]) &&
        props.tabData[props.activeTab.label].data &&
        checkIfKeyExistsInObject("confirmationMessage", props.tabData[props.activeTab.label].data)
            ? props.tabData[props.activeTab.label].data.confirmationMessage
            : "",
    );
    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Forms - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Forms",
    );

    // const addFormOrderOptions = computed(() => {
    //     const result: IOptions[] = [{ label: "Top", value: "Top" }];
    //     for (const rowData of formTableData.value) {
    //         if (rowData.formName) result.push({ label: rowData.formName, value: rowData.formName });
    //     }
    //     result.push({ label: "Bottom", value: "Bottom" });
    //     return deepClone(result) as IOptions[];
    // });
    const addFormOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(formTableData.value, "formName")),
    );

    function resetEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, validationErrors.value);
        } else {
            editFormDetails.value = {};
            validationErrors.value = {};
        }
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of formTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.formName) === 0)
                    obj["formName"] = "Please enter a name";
                else if (getStringLength(tableRow.formName) > 128)
                    obj["formName"] = "Name cannot be more than 128 characters";
                else obj["formName"] = "";
                if (getStringLength(tableRow.formOId) === 0) obj["formOId"] = "Please enter an OID";
                else if (getStringLength(tableRow.formOId) > 50)
                    obj["formOId"] = "OID cannot be more than 50 characters";
                else if (!checkOID(tableRow.formOId || "")) obj["formOId"] = "Invalid OID";
                else obj["formOId"] = "";
                if (getStringLength(tableRow.helpText) > 512)
                    obj["helpText"] = "Help text cannot be more than 512 characters";
                else obj["helpText"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    // function getNewItemPosition(selectedOrder: string) {
    //     let order = 0;
    //     if (!["Top", "Bottom"].includes(selectedOrder)) {
    //         const indexOfSelectedRow = getIndexOfTheItem({
    //             data: formTableData.value,
    //             type: "object",
    //             value: selectedOrder,
    //             key: "formName",
    //         });
    //         order = indexOfSelectedRow + 1;
    //     } else if (selectedOrder === "Top") {
    //         order = 0;
    //     } else {
    //         order = getArrayLength(formTableData.value);
    //     }
    //     return order;
    // }

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    function addOrEditFormAction(selectedOrder: TOptionValue) {
        // const newItemIndex = getNewItemPosition(String(selectedOrder));
        const newItemIndex = addItemByPosition(
            String(selectedOrder),
            formTableData.value,
            "formName",
        );
        let formTableRef = deepClone(formTableData.value) as ITableData[];
        // const editFormDetailsRef = deepClone(editFormDetails.value) as boolean[];
        const tempID = uniqueID();
        formTableRef.splice(newItemIndex, 0, {
            id: null,
            branchId: Number(props.tabData[props.activeTab.label].data.id),
            branchName: String(props.tabData[props.activeTab.label].data.branchName),
            formName: null,
            formOId: null,
            helpText: null,
            noOfFields: 0,
            isActive: true,
            isVisible: true,
            otherVisit: false,
            isCommon: false,
            isLabForm: false,
            isNavigateToSubjectDisposition: false,
            logDirection: "vertical",
            saveConfirm: false,
            redirectLink: "No link",
            redirectFolderId: null,
            redirectFormId: null,
            signatureRequired: false,
            patientCloudForm: false,
            formOrderNumber: 0,
            oldFormOrderNumber: 0,
            newFormOrderNumber: 0,
            isTemplate: false,
            formType: 1,
            tempID,
        });
        formTableRef = formTableRef.map((row, index) => ({
            ...row,
            formOrderNumber: index + 1,
            oldFormOrderNumber: index + 1,
            newFormOrderNumber: index + 1,
        }));
        formTableData.value = deepClone(formTableRef) as ITableData[];
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function onDragDrop(
        event: DragEvent,
        slotProps: IDraggableItem<ITableData>,
        clearTransferData: TVoidAction,
    ) {
        const draggedItem = parseJSON(
            event.dataTransfer!.getData("item"),
        ) as IDraggableItem<ITableData>;
        if (draggedItem.index !== slotProps.index) {
            formTableData.value = sortArray({
                data: formTableData.value.map((row) => ({
                    ...row,
                    // formOrderNumber: getItemOrder(
                    //     row.formOrderNumber,
                    //     draggedItem.data.formOrderNumber,
                    //     slotProps.data.formOrderNumber,
                    // ),
                    oldFormOrderNumber: row.formOrderNumber,
                    newFormOrderNumber: getItemOrder(
                        row.newFormOrderNumber,
                        draggedItem.data.newFormOrderNumber,
                        slotProps.data.newFormOrderNumber,
                    ),
                })),
                key: "newFormOrderNumber",
            });
            // .sort((row1, row2) => {
            //     // if (Number(row1.formOrderNumber) > Number(row2.formOrderNumber)) return 1;
            //     // if (Number(row1.formOrderNumber) < Number(row2.formOrderNumber)) return -1;
            //     if (Number(row1.newFormOrderNumber) > Number(row2.newFormOrderNumber)) return 1;
            //     if (Number(row1.newFormOrderNumber) < Number(row2.newFormOrderNumber)) return -1;
            //     return 0;
            // });
        }
        clearTransferData();
    }

    function setTableData(tableData: IFormData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            branchId: row.branchId,
            branchName: row.branchName,
            formName: row.formName,
            formOId: row.formOId,
            helpText: row.helpText,
            otherVisit: row.otherVisit,
            isCommon: row.isCommon,
            isLabForm: row.isLabForm,
            isNavigateToSubjectDisposition: row.isNavigateToSubjectDisposition,
            logDirection: row.logDirection,
            saveConfirm: row.saveConfirm,
            redirectLink: row.redirectLink || "No link",
            redirectFolderId: row.redirectFolderId,
            redirectFormId: row.redirectFormId,
            patientCloudForm: row.patientCloudForm,
            formOrderNumber: row.formOrderNumber,
            isTemplate: row.isTemplate,
            newFormOrderNumber: row.formOrderNumber,
            oldFormOrderNumber: row.formOrderNumber,
            noOfFields: row.noOfFields,
            isActive: row.isActive,
            isVisible: row.isVisible,
            signatureRequired: row.signatureRequired,
            formType: row.formType,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function formPaginationList() {
        loading.value.table = true;
        formOptions.value.loading = true;
        const { status, data, message } = await formPaginationListAPI(
            getAPIFilters({
                search: formSearch.value,
                filter: {
                    branchId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            formTableData.value = deepClone(tableData);
            formTableDataRef.value = deepClone(tableData);
            formOptions.value.options = deepClone(items);
        } else if (status !== 401) {
            formTableData.value = [];
            formTableDataRef.value = [];
            formOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        formOptions.value.loading = false;
        loading.value.table = false;
    }

    async function saveAddOrEditFormAPI(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: formTableData.value[rowIndex].id || 0,
                branchId: props.tabData[props.activeTab.label].data.id as number,
                branchName: props.tabData[props.activeTab.label].data.branchName as string,
                formName: formTableData.value[rowIndex].formName as string,
                formOId: formTableData.value[rowIndex].formOId as string,
                helpText: formTableData.value[rowIndex].helpText,
                otherVisit: formTableData.value[rowIndex].otherVisit,
                isActive: formTableData.value[rowIndex].isActive,
                isVisible: formTableData.value[rowIndex].isVisible,
                isCommon: formTableData.value[rowIndex].isCommon,
                isLabForm: formTableData.value[rowIndex].isLabForm,
                isNavigateToSubjectDisposition:
                    formTableData.value[rowIndex].isNavigateToSubjectDisposition,
                logDirection: formTableData.value[rowIndex].logDirection as TLogDirection,
                saveConfirm: formTableData.value[rowIndex].saveConfirm,
                redirectLink: formTableData.value[rowIndex].redirectLink,
                redirectFolderId: formTableData.value[rowIndex].redirectFolderId || 0,
                redirectFormId: formTableData.value[rowIndex].redirectFormId || 0,
                patientCloudForm: formTableData.value[rowIndex].patientCloudForm,
                formOrderNumber: formTableData.value[rowIndex].formOrderNumber,
                oldFormOrderNumber: formTableData.value[rowIndex].oldFormOrderNumber,
                newFormOrderNumber: formTableData.value[rowIndex].newFormOrderNumber,
                isTemplate: formTableData.value[rowIndex].isTemplate,
                signatureRequired: formTableData.value[rowIndex].signatureRequired,
                updatedBy: 0,
                noOfFields: formTableData.value[rowIndex].noOfFields,
                formType: formTableData.value[rowIndex].formType,
            };
            if (!formTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createFormAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateFormAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetEditFormDetails();
                await formPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        formTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(formTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        formTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
        // trialGroupFormModel.value.reset();
    }

    async function foldersList() {
        folderOptions.value.loading = true;
        const { status, data } = await trialVisitsListByBranchIDAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            // const tableData = setTableData(data);
            folderOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            folderOptions.value.options = [];
        }
        folderOptions.value.loading = false;
    }

    function getCustomLinkContent(folderId: TNullableNumber, formId: TNullableNumber) {
        let folderName = "Invalid folder";
        let formName = "Invalid form";
        if (folderId) {
            const result = getDropdownLabelByValue(folderLookups.value, folderId);
            if (result) folderName = result;
        }
        if (formId) {
            const result = getDropdownLabelByValue(formLookups.value, formId);
            if (result) formName = result;
        }
        return folderName === "Invalid folder" || formName === "Invalid form"
            ? "Invalid link"
            : `${folderName}/${formName}`;
    }

    const getReorderRequestBody = (): IFormData[] =>
        formTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
        })) as IFormData[];

    async function reorderForms() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderFormsAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await formPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    async function deleteFormById(formId: string) {
        loading.value.form = true;
        const { status, message } = await deleteFormByIdAPI(formId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await formPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        formTableData.value,
        formTableDataRef.value,
    );

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(
        formTableData.value,
        formTableDataRef.value,
        "tempID",
        "newFormOrderNumber",
    );

    watch(
        () => formTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = formTableDataRef.value;
            orderModel.value = newValue;
            orderModelRef.value = formTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => isModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isModelChanged.value) {
                formTableData.value = deepClone(formTableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        loading.value.setDynamicLoading(["reOrder"]);
        await Promise.all([formPaginationList(), foldersList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="formSearch"
                                    element-id="formSearch"
                                    :disabled="loading.isDisabled(disableAction, isOrderChanged)"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await formPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus('#formSearch');
                                        }
                                    "
                                />
                            </div>
                            <div class="flex flex-row items-center gap-[1rem]">
                                <edc-dropdown
                                    v-if="!disableAction && !isOrderChanged"
                                    container-class="w-[10rem]"
                                    :options="addFormOrderOptions"
                                    input-class="admin-input-font"
                                    option-placement="bottom"
                                    option-class="min-w-[8rem] max-w-[20rem]"
                                    type="label"
                                    label="Add Form"
                                    :reset-option="true"
                                    :disabled="loading.isDisabled()"
                                    @on-select="
                                        (selectedOptions: TOptionValue[]) => {
                                            addOrEditFormAction(selectedOptions[0]);
                                        }
                                    "
                                />
                                <!-- <edc-pressable
                                
                                v-tooltip.top="'Save'"
                                container-class="mt-[0.5rem]"
                                :disabled="loading.isDisabled()"
                                :on-click="() => saveAddOrEditFormAPI(index)"
                            >
                                <edc-icon
                                    icon="save"
                                    class="h-[1.5rem] fill-[var(--color-secondary)]"
                                />
                            </edc-pressable> -->
                                <admin-action-label
                                    v-if="isOrderChanged && !disableAction"
                                    icon="save"
                                    text="Save"
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await reorderForms();
                                        }
                                    "
                                />
                                <admin-action-label
                                    v-if="isOrderChanged && !disableAction"
                                    icon="undo"
                                    text="Reset"
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            formTableData = deepClone(formTableDataRef);
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns()"
                                :table-data="formTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="formSearch"
                                table-style="outlined"
                                :enable-reorder="true"
                                :reorder-class="
                                    disableAction
                                        ? '!pointer-events-none [&>svg]:mt-[0.5rem]'
                                        : '[&>svg]:mt-[0.5rem]'
                                "
                                :custom-content="true"
                                action-row-class="min-w-[12rem] max-w-[12rem]"
                                @on-drop="
                                    (
                                        event: DragEvent,
                                        slotProps: IDraggableItem<ITableData>,
                                        clearData: TVoidAction,
                                    ) => onDragDrop(event, slotProps, clearData)
                                "
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <edc-text-input
                                            :key="`formName-${data.tempID}`"
                                            v-model="data.formName"
                                            type="text"
                                            placeholder="Enter name *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].formName
                                                    : ''
                                            "
                                        />
                                        <!-- <span v-else>{{ data.formName }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <!-- <span>{{ data.formOId }}</span> -->
                                        <edc-text-input
                                            :key="`formOID-${data.tempID}`"
                                            v-model="data.formOId"
                                            type="text"
                                            placeholder="Enter OID *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="
                                                !isEditable(data.tempID, editFormDetails) ||
                                                !!data.id
                                            "
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].formOId
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                    >
                                        <edc-text-area
                                            :key="`helpText-${data.tempID}`"
                                            v-model="data.helpText"
                                            placeholder="Enter help text"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :ellipse-count="20"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].helpText
                                                    : ''
                                            "
                                        />
                                        <!-- <span v-else>{{ data.helpText }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-text-input
                                            :key="`noOfFields-${data.tempID}`"
                                            v-model="data.noOfFields"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? ''
                                                    : '-mt-[0.8rem]'
                                            "
                                            type="text"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].noOfFields
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isActive-${data.tempID}`"
                                            v-model="data.isActive"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isActive"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isActive
                                                    : ''
                                            "
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isVisible-${data.tempID}`"
                                            v-model="data.isVisible"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isVisible"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isVisible
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isTemplate-${data.tempID}`"
                                            v-model="data.isTemplate"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isTemplate"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isTemplate
                                                    : ''
                                            "
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`otherVisit-${data.tempID}`"
                                            v-model="data.otherVisit"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="otherVisit"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].otherVisit
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isCommon-${data.tempID}`"
                                            v-model="data.isCommon"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isCommon"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isCommon
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isLabForm-${data.tempID}`"
                                            v-model="data.isLabForm"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isLabForm"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isLabForm
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isNavigateToSubjectDisposition-${data.tempID}`"
                                            v-model="data.isNavigateToSubjectDisposition"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isNavigateToSubjectDisposition"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID]
                                                          .isNavigateToSubjectDisposition
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`formType-${data.tempID}`"
                                            v-model="data.formType"
                                            container-class="w-[11rem]"
                                            :options="FORM_TYPES"
                                            default-value="Type"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[11rem]"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].formType
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`logDirection-${data.tempID}`"
                                            v-model="data.logDirection"
                                            container-class="w-[11rem]"
                                            :options="LOG_DIRECTION_OPTIONS"
                                            default-value="Direction"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[11rem]"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].logDirection
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        v-if="confirmationMessage"
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`saveConfirm-${data.tempID}`"
                                            v-model="data.saveConfirm"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="saveConfirm"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].saveConfirm
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        v-if="confirmationMessage"
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <!-- <edc-text-input
                                            v-model="data.redirectLink"
                                            
                                            type="text"
                                            placeholder="Enter redirect link"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].redirectLink
                                                    : ''
                                            "
                                        /> -->
                                        <div v-if="!isEditable(data.tempID, editFormDetails)">
                                            <p
                                                v-if="data.redirectLink !== 'Custom link'"
                                                class="text-[1.2rem] mt-[0.5rem]"
                                            >
                                                {{ data.redirectLink }}
                                            </p>
                                            <p v-else>
                                                {{
                                                    getCustomLinkContent(
                                                        data.redirectFolderId,
                                                        data.redirectFormId,
                                                    )
                                                }}
                                            </p>
                                        </div>
                                        <div v-else class="flex flex-col">
                                            <edc-radio
                                                v-model="data.redirectLink"
                                                value="No link"
                                                container-class="w-fit"
                                                label="No Link"
                                                name="redirectLink"
                                                label-class="font-bold admin-input-font"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                            />
                                            <edc-radio
                                                v-model="data.redirectLink"
                                                value="Next link"
                                                container-class="w-fit"
                                                label="Link Next"
                                                name="redirectLink"
                                                label-class="font-bold admin-input-font"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                            />
                                            <div
                                                class="flex flex-row items-center gap-[1rem]"
                                                :class="[
                                                    data.redirectLink === 'Custom link'
                                                        ? '-mt-[0.5rem]'
                                                        : '',
                                                ]"
                                            >
                                                <edc-radio
                                                    v-model="data.redirectLink"
                                                    value="Custom link"
                                                    container-class="w-fit"
                                                    label="Custom Link"
                                                    name="redirectLink"
                                                    label-class="font-bold admin-input-font"
                                                    input-class="admin-input-font"
                                                    :disabled="loading.isDisabled()"
                                                />
                                                <edc-dropdown
                                                    v-if="data.redirectLink === 'Custom link'"
                                                    :key="`folderList-${data.tempID}`"
                                                    v-model="data.redirectFolderId"
                                                    container-class="w-[13rem] mb-[0.3rem] mr-[0.5rem] !flex-row !items-center"
                                                    :options="folderLookups"
                                                    default-value="Folder"
                                                    label="Folder"
                                                    label-class="mb-0 font-bold admin-input-font mr-[0.5rem]"
                                                    input-class="admin-input-font w-[10rem]"
                                                    option-placement="bottom"
                                                    option-class="min-w-[10rem]"
                                                    :loading="folderOptions.loading"
                                                    :disabled="loading.isDisabled()"
                                                    :read-only="
                                                        !isEditable(data.tempID, editFormDetails)
                                                    "
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            validationErrors,
                                                        )
                                                            ? validationErrors[data.tempID]
                                                                  .redirectFolder
                                                            : ''
                                                    "
                                                />
                                                <edc-dropdown
                                                    v-if="data.redirectLink === 'Custom link'"
                                                    :key="`formList-${data.tempID}`"
                                                    v-model="data.redirectFormId"
                                                    container-class="w-[13rem] mb-[0.3rem] !flex-row !items-center"
                                                    :options="
                                                        formLookups.filter(
                                                            (row) => row.value !== data.id,
                                                        )
                                                    "
                                                    default-value="Form"
                                                    label="Form"
                                                    label-class="mb-0 font-bold admin-input-font mr-[0.5rem]"
                                                    input-class="admin-input-font"
                                                    option-placement="bottom"
                                                    option-class="min-w-[10rem]"
                                                    :loading="formOptions.loading"
                                                    :disabled="loading.isDisabled()"
                                                    :read-only="
                                                        !isEditable(data.tempID, editFormDetails)
                                                    "
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            validationErrors,
                                                        )
                                                            ? validationErrors[data.tempID]
                                                                  .redirectForm
                                                            : ''
                                                    "
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`signatureRequired-${data.tempID}`"
                                            v-model="data.signatureRequired"
                                            name="signatureRequired"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID]
                                                          .signatureRequired
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`patientCloudForm-${data.tempID}`"
                                            v-model="data.patientCloudForm"
                                            name="patientCloudForm"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].patientCloudForm
                                                    : ''
                                            "
                                        />
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction &&
                                            !isOrderChanged
                                        "
                                        loader-type="table"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => editForm(data.tempID)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        loader-type="table-save"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :disabled="loading.isDisabled()"
                                        :on-click="async () => await saveAddOrEditFormAPI(index)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id) {
                                                    const indexOfTheItem = getIndexOfTheItem({
                                                        data: formTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    });
                                                    formTableData = formTableData.map(
                                                        (row, index) => ({
                                                            ...row,
                                                            formOrderNumber:
                                                                index > indexOfTheItem
                                                                    ? row.formOrderNumber - 1
                                                                    : row.formOrderNumber,
                                                            oldFormOrderNumber:
                                                                index > indexOfTheItem
                                                                    ? row.oldFormOrderNumber - 1
                                                                    : row.oldFormOrderNumber,
                                                            newFormOrderNumber:
                                                                index > indexOfTheItem
                                                                    ? row.newFormOrderNumber - 1
                                                                    : row.newFormOrderNumber,
                                                        }),
                                                    );
                                                    formTableData.splice(indexOfTheItem, 1);
                                                } else
                                                    formTableData[index] = deepClone(
                                                        formTableDataRef[index],
                                                    );
                                                resetEditFormDetails(data.tempID);
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Reset'"
                                            icon="undo"
                                            :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="
                                            data.id &&
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction &&
                                            !isOrderChanged
                                        "
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :disabled="loading.isDisabled()"
                                        loader-type="table"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.formName),
                                                    module: 'Form Fields',
                                                    page: 'Form Fields',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Assign Fields'"
                                            icon="form-fields"
                                            :class="`${commonActionIconClasses('Fields')} stroke-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-delete-confirmation
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            data.id &&
                                            !disableAction &&
                                            !isOrderChanged
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this form?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteFormById(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table"
                                                :container-class="
                                                    !isEditable(data.tempID, editFormDetails)
                                                        ? 'mt-[0.5rem]'
                                                        : ''
                                                "
                                                :disabled="loading.isDisabled()"
                                                :show-loader="tableLoaderDetails[index]"
                                            >
                                                <edc-icon
                                                    v-tooltip.top="'Delete'"
                                                    icon="close-icon"
                                                    :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                                />
                                            </edc-pressable>
                                        </template>
                                    </edc-delete-confirmation>
                                </template>
                                <template #errorMessage="{ data }">
                                    <edc-error-text
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(
                                                data.tempID,
                                                validationErrors,
                                            ) &&
                                            checkIfObjectHasErrors(validationErrors[data.tempID])
                                                ? 'No error'
                                                : ''
                                        "
                                        container-class="mt-[0.3rem]"
                                    />
                                </template>
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
