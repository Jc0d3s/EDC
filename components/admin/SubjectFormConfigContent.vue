<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { controlTypesListAPI } from "~/services/apis/handlers/admin/form-field";
    import {
        reorderSubjectFormConfigAPI,
        subjectFormConfigCreateAPI,
        subjectFormConfigDeleteAPI,
        subjectFormConfigPaginationListAPI,
        subjectFormConfigUpdateAPI,
    } from "~/services/apis/handlers/admin/subject-form-config";
    import type { ISubjectFormConfigData } from "~/services/apis/handlers/types/subject-form-config-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
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

    interface ITableData {
        id: TNullableNumber;
        trialId: number;
        label: TNullableString;
        controlTypeId: TNullableNumber;
        helpText: TNullableString;
        format: TNullableString;
        isMandatory: boolean;
        isActive: boolean;
        isSpecify: boolean;
        oldOrderNumber: number;
        newOrderNumber: number;
        orderNumber: number;
        defaultValue: TNullableString;
        readOnly: boolean;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        label: string;
        controlTypeId: string;
        isMandatory: string;
        isActive: string;
        isSpecify: string;
        helpText: TNullableString;
        format: TNullableString;
        defaultValue: TNullableString;
        readOnly: TNullableString;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        controlTypeId: "",
        isActive: "",
        isMandatory: "",
        isSpecify: "",
        format: "",
        helpText: "",
        label: "",
        defaultValue: "",
        readOnly: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const subjectFormConfigSearch = ref<TNullableString>(null);
    const controlTypeOptions = ref<DropdownOption>(new DropdownOption());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const subjectConfigColumns: IColumn[] = [
        {
            field: "label",
            header: "Label",
            icon: false,
            show: true,
        },
        {
            field: "controlType",
            header: "Control Type",
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
            field: "format",
            header: "Format",
            icon: false,
            show: true,
        },
        {
            field: "isSpecify",
            header: "Is Specify",
            icon: false,
            show: true,
        },
        {
            field: "isMandatory",
            header: "Is Mandatory",
            icon: false,
            show: true,
        },
        {
            field: "isActive",
            header: "Is Active",
            icon: false,
            show: true,
        },
        {
            field: "readOnly",
            header: "Read Only",
            icon: false,
            show: true,
        },
        {
            field: "defaultValue",
            header: "Default Value",
            icon: false,
            show: true,
        },
    ];

    const tableData = ref<ITableData[]>([]);
    const tableDataRef = ref<ITableData[]>(deepClone(tableData.value));

    const addSubjectLabelOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(tableData.value, "label")),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Subject Form Config - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Subject Form Config",
    );

    const controlTypeLookups = computed(() =>
        getOptionsList(controlTypeOptions.value.options, "name", "id"),
    );

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    function resetEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, validationErrors.value);
        } else {
            editFormDetails.value = {};
            validationErrors.value = {};
        }
    }

    function addOrEditSubjectFormConfigAction(selectedOrder: TOptionValue) {
        const newItemIndex = addItemByPosition(String(selectedOrder), tableData.value, "label");
        let tableRef = deepClone(tableData.value) as ITableData[];
        const tempID = uniqueID();
        tableRef.splice(newItemIndex, 0, {
            id: null,
            trialId: props.tabData[props.activeTab.label].data.id as number,
            controlTypeId: null,
            isActive: true,
            isMandatory: false,
            label: null,
            format: null,
            helpText: null,
            isSpecify: false,
            oldOrderNumber: 0,
            newOrderNumber: 0,
            orderNumber: 0,
            defaultValue: null,
            readOnly: false,
            tempID,
        });
        tableRef = tableRef.map((row, index) => ({
            ...row,
            orderNumber: index + 1,
            oldOrderNumber: index + 1,
            newOrderNumber: index + 1,
        }));
        tableData.value = deepClone(tableRef) as ITableData[];
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of tableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.label) === 0) obj["label"] = "Please enter a label";
                else if (getStringLength(tableRow.label) > 128)
                    obj["label"] = "Label cannot be more than 128 characters";
                else obj["label"] = "";
                if (getStringLength(tableRow.controlTypeId) === 0)
                    obj["controlTypeId"] = "Please select a control type";
                else obj["controlTypeId"] = "";
                if (getStringLength(tableRow.helpText) > 256)
                    obj["helpText"] = "Help text cannot be more than 256 characters";
                else obj["helpText"] = "";
                if (getStringLength(tableRow.format) > 256)
                    obj["format"] = "Format cannot be more than 256 characters";
                else obj["format"] = "";
                if (getStringLength(tableRow.defaultValue) > 256)
                    obj["defaultValue"] = "Default Value cannot be more than 256 characters";
                else obj["defaultValue"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(processedTableData: ISubjectFormConfigData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(processedTableData);
        return processedTableData.map((row) => ({
            id: row.id,
            trialId: row.trialId,
            label: row.label,
            controlTypeId: row.controlTypeId,
            helpText: row.helpText,
            format: row.format,
            isSpecify: row.isSpecify,
            isMandatory: row.isMandatory,
            isActive: row.isActive,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            defaultValue: row.defaultValue,
            readOnly: row.readOnly,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function subjectFormConfigPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await subjectFormConfigPaginationListAPI(
            getAPIFilters({
                search: subjectFormConfigSearch.value,
                filter: {
                    trialId: props.tabData[props.activeTab.label].data.id as number,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const processedTableData = setTableData(items);
            tableData.value = deepClone(processedTableData);
            tableDataRef.value = deepClone(processedTableData);
        } else if (status !== 401) {
            tableData.value = [];
            tableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrEditSubjectFormConfig(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: tableData.value[rowIndex].id || 0,
                trialId: tableData.value[rowIndex].trialId,
                label: tableData.value[rowIndex].label as string,
                controlTypeId: tableData.value[rowIndex].controlTypeId as number,
                helpText: tableData.value[rowIndex].helpText,
                format: tableData.value[rowIndex].format,
                isSpecify: tableData.value[rowIndex].isSpecify,
                isMandatory: tableData.value[rowIndex].isMandatory,
                isActive: tableData.value[rowIndex].isActive,
                orderNumber: tableData.value[rowIndex].orderNumber,
                oldOrderNumber: tableData.value[rowIndex].oldOrderNumber,
                newOrderNumber: tableData.value[rowIndex].newOrderNumber,
                subjectDetailsId: 0,
                subjectId: 0,
                subjectFormConfigId: 0,
                fieldValue: null,
                readOnly: tableData.value[rowIndex].readOnly,
                defaultValue: tableData.value[rowIndex].defaultValue,
                updatedBy: 0,
            };
            if (!tableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await subjectFormConfigCreateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await subjectFormConfigUpdateAPI(requestData);
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
                await subjectFormConfigPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        tableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(tableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        tableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteSubjectFormConfig(subjectFormConfigId: string) {
        loading.value.form = true;
        const { status, message } = await subjectFormConfigDeleteAPI(subjectFormConfigId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectFormConfigPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function controlTypesList() {
        controlTypeOptions.value.loading = true;
        const { status, data, message } = await controlTypesListAPI();
        if (status === 200) {
            controlTypeOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            controlTypeOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        controlTypeOptions.value.loading = false;
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
            tableData.value = sortArray({
                data: tableData.value.map((row) => ({
                    ...row,
                    oldOrderNumber: row.orderNumber,
                    newOrderNumber: getItemOrder(
                        row.newOrderNumber,
                        draggedItem.data.newOrderNumber,
                        slotProps.data.newOrderNumber,
                    ),
                })),
                key: "newOrderNumber",
            });
        }
        clearTransferData();
    }

    const getReorderRequestBody = (): ISubjectFormConfigData[] =>
        tableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
        })) as any[];

    async function reorderSubjectFormConfigs() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderSubjectFormConfigAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectFormConfigPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        tableData.value,
        tableDataRef.value,
    );

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(tableData.value, tableDataRef.value, "tempID", "newOrderNumber");

    watch(
        () => tableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = tableDataRef.value;
            orderModel.value = newValue;
            orderModelRef.value = tableDataRef.value;
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
                tableData.value = deepClone(tableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["reOrder"]);
        Promise.all([controlTypesList(), subjectFormConfigPaginationList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="subjectFormConfigSearch"
                            element-id="subjectFormConfigSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await subjectFormConfigPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus(
                                        '#subjectFormConfigSearch',
                                    );
                                }
                            "
                        />
                        <edc-dropdown
                            v-if="!disableAction && !isOrderChanged"
                            container-class="w-[15rem]"
                            :options="addSubjectLabelOrderOptions"
                            input-class="admin-input-font"
                            option-placement="bottom"
                            option-class="min-w-[13rem] max-w-[20rem]"
                            type="label"
                            label="Add Subject Config"
                            :reset-option="true"
                            :disabled="loading.isDisabled()"
                            @on-select="
                                (selectedOptions: TOptionValue[]) => {
                                    addOrEditSubjectFormConfigAction(selectedOptions[0]);
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isOrderChanged && !disableAction"
                            icon="save"
                            text="Save"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                async () => {
                                    await reorderSubjectFormConfigs();
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
                                    tableData = deepClone(tableDataRef);
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="subjectConfigColumns"
                            :table-data="tableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="subjectFormConfigSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            action-row-class="min-w-[12rem] max-w-[12rem]"
                            :enable-reorder="true"
                            :reorder-class="
                                disableAction
                                    ? '!pointer-events-none [&>svg]:mt-[0.7rem]'
                                    : '[&>svg]:mt-[0.7rem]'
                            "
                            :disabled="loading.isDisabled()"
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
                                    class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`label-${data.tempID}`"
                                        v-model="data.label"
                                        type="text"
                                        placeholder="Enter label *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].label
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                >
                                    <edc-dropdown
                                        :key="`controlType-${data.tempID}`"
                                        v-model="data.controlTypeId"
                                        :options="controlTypeLookups"
                                        default-value="Select an control type *"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[18rem]"
                                        :disabled="loading.isDisabled()"
                                        :loading="controlTypeOptions.loading"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].controlTypeId
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[25rem]"
                                >
                                    <edc-text-area
                                        :key="`helpText-${data.tempID}`"
                                        v-model="data.helpText"
                                        placeholder="Enter help text"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :ellipse-count="30"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].helpText
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                >
                                    <edc-text-input
                                        :key="`format-${data.tempID}`"
                                        v-model="data.format"
                                        type="text"
                                        placeholder="Enter format"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].format
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-checkbox
                                        :key="`isSpecify-${data.tempID}`"
                                        v-model="data.isSpecify"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isSpecify"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isSpecify
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-checkbox
                                        :key="`isMandatory-${data.tempID}`"
                                        v-model="data.isMandatory"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isMandatory"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isMandatory
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        :key="`isActive-${data.tempID}`"
                                        v-model="data.isActive"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isActive"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isActive
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        :key="`readOnly-${data.tempID}`"
                                        v-model="data.readOnly"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="readOnly"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].readOnly
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                >
                                    <edc-text-input
                                        :key="`defaultValue-${data.tempID}`"
                                        v-model="data.defaultValue"
                                        type="text"
                                        placeholder="Enter default value"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].defaultValue
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.7rem]'
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
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditSubjectFormConfig(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
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
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                tableData.splice(
                                                    getIndexOfTheItem({
                                                        data: tableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else tableData[index] = deepClone(tableDataRef[index]);
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
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) &&
                                        data.id &&
                                        !disableAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this label?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteSubjectFormConfig(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.7rem]'
                                                    : ''
                                            "
                                            :disabled="loading.isDisabled()"
                                            :show-loader="tableLoaderDetails[index]"
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                class="stroke-[var(--color-error)] !w-[1.1rem] !h-[1.1rem]"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template>
                            <template #errorMessage="{ data }">
                                <edc-error-text
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    :error="
                                        checkIfKeyExistsInObject(data.tempID, validationErrors) &&
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
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
