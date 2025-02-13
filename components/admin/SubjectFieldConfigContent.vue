<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { formsListByTrialIdAPI } from "~/services/apis/handlers/admin/form";
    import { formFieldListByTrialIdAPI } from "~/services/apis/handlers/admin/form-field";
    import {
        reorderSubjectFieldConfigAPI,
        subjectFieldConfigCreateAPI,
        subjectFieldConfigDeleteAPI,
        subjectFieldConfigPaginationListAPI,
        subjectFieldConfigUpdateAPI,
    } from "~/services/apis/handlers/admin/subject-field-config";
    import { trialVisitsListByTrialIDAPI } from "~/services/apis/handlers/admin/trial-visit";
    import type { ISubjectFieldConfigData } from "~/services/apis/handlers/types/subject-field-config-types";
    import { SUBJECT_FIELD_CONFIG_SEARCH_VALUES } from "~/constants/options";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        IOptions,
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
    import useGlobalStore from "~/stores/global";

    interface IValidationError extends IBaseValidationError {
        folderId: string;
        formId: string;
        fieldId: string;
        isSummary: string;
        isHeader: string;
        isSearch: string;
        searchValue: string;
    }

    interface ITableData {
        id: TNullableNumber;
        trialId: TNullableNumber;
        folderId: TNullableNumber;
        formId: TNullableNumber;
        fieldId: TNullableNumber;
        isSummary: boolean;
        isHeader: boolean;
        isSearch: boolean;
        searchValue: TNullableString;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        tempID: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        folderId: "",
        formId: "",
        fieldId: "",
        isSummary: "",
        isHeader: "",
        isSearch: "",
        searchValue: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const loading = ref<Loading>(new Loading());

    const subjectFieldConfigSearch = ref<TNullableString>(null);
    const subjectFieldConfigColumns: IColumn[] = [
        {
            field: "folderId",
            header: "Folder",
            icon: false,
            show: true,
        },
        {
            field: "formId",
            header: "Form",
            icon: false,
            show: true,
        },
        {
            field: "fieldId",
            header: "Field",
            icon: false,
            show: true,
        },
        {
            field: "isSummary",
            header: "Is Summary",
            icon: false,
            show: true,
        },
        {
            field: "isHeader",
            header: "Is Header",
            icon: false,
            show: true,
        },
        {
            field: "isSearch",
            header: "Is Search",
            icon: false,
            show: true,
        },
        {
            field: "searchValue",
            header: "Search Value",
            icon: false,
            show: true,
        },
    ];
    const subjectFieldConfigTableData = ref<ITableData[]>([]);
    const subjectFieldConfigTableDataRef = ref<ITableData[]>(
        deepClone(subjectFieldConfigTableData.value),
    );
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const folderOptions = ref<DropdownOption>(new DropdownOption());
    const fieldOptions = ref<DropdownOption>(new DropdownOption());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));
    const folderLookups = computed(() => getOptionsList(folderOptions.value.options, "name", "id"));
    const fieldLookups = computed(() => getOptionsList(fieldOptions.value.options, "name", "id"));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Subject Fields Config - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Subject Fields Config",
    );

    const addOIDPathOptions = computed(() => {
        const result: IOptions[] = [];
        if (getArrayLength(subjectFieldConfigTableData.value) > 0)
            result.push({ label: "Top", value: "Top" });
        for (const rowData of subjectFieldConfigTableData.value) {
            if (rowData.formId && rowData.fieldId) {
                const formName = getDropdownLabelByValue(formLookups.value, rowData.formId);
                const fieldName = getDropdownLabelByValue(formLookups.value, rowData.fieldId);
                if (formName && fieldName)
                    result.push({
                        label: `${fieldName}:${formName}`,
                        value: rowData.tempID,
                    });
            }
        }
        result.push({ label: "Bottom", value: "Bottom" });
        return deepClone(result) as IOptions[];
    });

    async function trialVisitsListByTrialID() {
        folderOptions.value.loading = true;
        const { status, data, message } = await trialVisitsListByTrialIDAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            folderOptions.value.options = deepClone(data);
        } else {
            folderOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        folderOptions.value.loading = false;
    }

    async function formsListByTrialId() {
        formOptions.value.loading = true;
        const { status, data, message } = await formsListByTrialIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            formOptions.value.options = deepClone(data);
        } else {
            formOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        formOptions.value.loading = false;
    }

    async function formFieldListByTrialId() {
        fieldOptions.value.loading = true;
        const { status, data, message } = await formFieldListByTrialIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            fieldOptions.value.options = deepClone(data);
        } else {
            fieldOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        fieldOptions.value.loading = false;
    }

    function setTableData(tableData: ISubjectFieldConfigData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            trialId: row.trialId,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            isSummary: row.isSummary,
            isHeader: row.isHeader,
            isSearch: row.isSearch,
            searchValue: row.searchValue,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function subjectFieldConfigPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await subjectFieldConfigPaginationListAPI(
            getAPIFilters({
                search: subjectFieldConfigSearch.value,
                filter: {
                    trialId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            subjectFieldConfigTableData.value = deepClone(tableData);
            subjectFieldConfigTableDataRef.value = deepClone(tableData);
        } else {
            toastStore.error({
                title: "Error",
                message,
            });
            subjectFieldConfigTableData.value = [];
            subjectFieldConfigTableDataRef.value = [];
        }
        loading.value.table = false;
    }

    function editForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editFormDetails.value))
            editFormDetails.value[rowIndex] = true;
        else editFormDetails.value[rowIndex] = !editFormDetails.value[rowIndex];
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

    function addOrEditSubjectFieldConfigAction(selectedOrder: TOptionValue) {
        const newItemIndex = addItemByPosition(
            String(selectedOrder),
            subjectFieldConfigTableData.value,
            "tempID",
        );
        let formTableRef = deepClone(subjectFieldConfigTableData.value) as ITableData[];
        const tempID = uniqueID();
        formTableRef.splice(newItemIndex, 0, {
            id: null,
            trialId: Number(props.tabData[props.activeTab.label].data.id),
            fieldId: null,
            folderId: null,
            formId: null,
            isHeader: false,
            isSearch: true,
            isSummary: false,
            searchValue: "standard",
            orderNumber: 0,
            oldOrderNumber: 0,
            newOrderNumber: 0,
            tempID,
        });
        formTableRef = formTableRef.map((row, index) => ({
            ...row,
            orderNumber: index + 1,
            oldOrderNumber: index + 1,
            newOrderNumber: index + 1,
        }));
        subjectFieldConfigTableData.value = deepClone(formTableRef) as ITableData[];
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of subjectFieldConfigTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (!tableRow.formId) obj["formId"] = "Please select a form";
                else obj["formId"] = "";
                if (!tableRow.fieldId) obj["fieldId"] = "Please select a field";
                else obj["fieldId"] = "";
                // result.push(obj);
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditSubjectFieldConfigApi(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: subjectFieldConfigTableData.value[rowIndex].id || 0,
                trialId: props.tabData[props.activeTab.label].data.id as number,
                orderNumber: subjectFieldConfigTableData.value[rowIndex].orderNumber,
                oldOrderNumber: subjectFieldConfigTableData.value[rowIndex].oldOrderNumber,
                newOrderNumber: subjectFieldConfigTableData.value[rowIndex].newOrderNumber,
                folderId: subjectFieldConfigTableData.value[rowIndex].folderId || 0,
                formId: subjectFieldConfigTableData.value[rowIndex].formId as number,
                fieldId: subjectFieldConfigTableData.value[rowIndex].fieldId as number,
                isSummary: subjectFieldConfigTableData.value[rowIndex].isSummary,
                isHeader: subjectFieldConfigTableData.value[rowIndex].isHeader,
                isSearch: subjectFieldConfigTableData.value[rowIndex].isSearch,
                searchValue: subjectFieldConfigTableData.value[rowIndex].searchValue as string,
                updatedBy: 0,
            };
            if (!subjectFieldConfigTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await subjectFieldConfigCreateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await subjectFieldConfigUpdateAPI(requestData);
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
                await subjectFieldConfigPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        subjectFieldConfigTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(subjectFieldConfigTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        subjectFieldConfigTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
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
            subjectFieldConfigTableData.value = sortArray({
                data: subjectFieldConfigTableData.value.map((row) => ({
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

    const getReorderRequestBody = (): ISubjectFieldConfigData[] =>
        subjectFieldConfigTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
        })) as ISubjectFieldConfigData[];

    async function reorderForms() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderSubjectFieldConfigAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectFieldConfigPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    async function deleteSubjectFieldConfigById(subjectFieldConfigId: string) {
        loading.value.form = true;
        const { status, message } = await subjectFieldConfigDeleteAPI(subjectFieldConfigId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectFieldConfigPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        subjectFieldConfigTableData.value,
        subjectFieldConfigTableDataRef.value,
    );

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(
        subjectFieldConfigTableData.value,
        subjectFieldConfigTableDataRef.value,
        "tempID",
        "newOrderNumber",
    );

    watch(
        () => subjectFieldConfigTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = subjectFieldConfigTableDataRef.value;
            orderModel.value = newValue;
            orderModelRef.value = subjectFieldConfigTableDataRef.value;
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
                subjectFieldConfigTableData.value = deepClone(subjectFieldConfigTableDataRef.value);
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["reOrder"]);
        Promise.all([
            subjectFieldConfigPaginationList(),
            trialVisitsListByTrialID(),
            formsListByTrialId(),
            formFieldListByTrialId(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="subjectFieldConfigSearch"
                                    element-id="subjectFieldConfigSearch"
                                    input-class="admin-input-font"
                                    :disabled="loading.isDisabled(disableAction, isOrderChanged)"
                                    @on-search="
                                        async () => {
                                            await subjectFieldConfigPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#subjectFieldConfigSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                            <div class="flex flex-row items-center gap-[1rem]">
                                <edc-dropdown
                                    v-if="!disableAction && !isOrderChanged"
                                    container-class="w-[11rem]"
                                    :options="addOIDPathOptions"
                                    input-class="admin-input-font"
                                    option-placement="bottom"
                                    option-class="min-w-[11rem] max-w-[11rem]"
                                    type="label"
                                    label="Add OID Path"
                                    :reset-option="true"
                                    :disabled="loading.isDisabled()"
                                    @on-select="
                                        (selectedOptions: TOptionValue[]) => {
                                            addOrEditSubjectFieldConfigAction(selectedOptions[0]);
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
                                            subjectFieldConfigTableData = deepClone(
                                                subjectFieldConfigTableDataRef,
                                            );
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="subjectFieldConfigColumns"
                                :table-data="subjectFieldConfigTableData"
                                :loading="loading.table"
                                pagination-type="none"
                                search-key="subjectFieldConfigSearch"
                                table-style="outlined"
                                :enable-row-click="false"
                                :custom-content="true"
                                :enable-reorder="true"
                                :reorder-class="
                                    disableAction
                                        ? '!pointer-events-none [&>svg]:mt-[0.5rem]'
                                        : '[&>svg]:mt-[0.5rem]'
                                "
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
                                        <edc-dropdown
                                            :key="`folder-${data.tempID}`"
                                            v-model="data.folderId"
                                            container-class="w-[20rem]"
                                            :options="folderLookups"
                                            :default-value="
                                                isEditable(data.tempID, editFormDetails)
                                                    ? 'Folder'
                                                    : 'No Folder'
                                            "
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[20rem]"
                                            :disabled="loading.isDisabled()"
                                            :loading="folderOptions.loading"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].folderId
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                    >
                                        <edc-dropdown
                                            :key="`form-${data.tempID}`"
                                            v-model="data.formId"
                                            container-class="w-[20rem]"
                                            :options="formLookups"
                                            :default-value="
                                                isEditable(data.tempID, editFormDetails)
                                                    ? 'Form *'
                                                    : 'No Form'
                                            "
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[20rem]"
                                            :disabled="loading.isDisabled()"
                                            :loading="formOptions.loading"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].formId
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                    >
                                        <edc-dropdown
                                            :key="`field-${data.tempID}`"
                                            v-model="data.fieldId"
                                            container-class="w-[20rem]"
                                            :options="fieldLookups"
                                            :default-value="
                                                isEditable(data.tempID, editFormDetails)
                                                    ? 'Field *'
                                                    : 'No Field'
                                            "
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[20rem]"
                                            :loading="fieldOptions.loading"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].fieldId
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-checkbox
                                            :key="`isSummary-${data.tempID}`"
                                            v-model="data.isSummary"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :checked="data.isSummary"
                                            name="isSummary"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isSummary
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-checkbox
                                            :key="`isHeader-${data.tempID}`"
                                            v-model="data.isHeader"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :checked="data.isHeader"
                                            name="isHeader"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isHeader
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-checkbox
                                            :key="`isSearch-${data.tempID}`"
                                            v-model="data.isSearch"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :checked="data.isSearch"
                                            name="isSearch"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isSearch
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`searchValue-${data.tempID}`"
                                            v-model="data.searchValue"
                                            container-class="w-[11rem]"
                                            :options="SUBJECT_FIELD_CONFIG_SEARCH_VALUES"
                                            :default-value="
                                                isEditable(data.tempID, editFormDetails)
                                                    ? 'Search'
                                                    : 'No Search'
                                            "
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[11rem]"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].searchValue
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
                                        container-class="mt-[0.5rem]"
                                        loader-type="table"
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
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
                                        :on-click="
                                            async () => {
                                                await saveAddOrEditSubjectFieldConfigApi(index);
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
                                        container-class="mt-[0.5rem]"
                                        loader-type="table"
                                        :on-click="
                                            () => {
                                                if (!data.id) {
                                                    const indexOfTheItem = getIndexOfTheItem({
                                                        data: subjectFieldConfigTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    });
                                                    subjectFieldConfigTableData =
                                                        subjectFieldConfigTableData.map(
                                                            (row, index) => ({
                                                                ...row,
                                                                orderNumber:
                                                                    index > indexOfTheItem
                                                                        ? row.orderNumber - 1
                                                                        : row.orderNumber,
                                                                oldOrderNumber:
                                                                    index > indexOfTheItem
                                                                        ? row.oldOrderNumber - 1
                                                                        : row.oldOrderNumber,
                                                                newOrderNumber:
                                                                    index > indexOfTheItem
                                                                        ? row.newOrderNumber - 1
                                                                        : row.newOrderNumber,
                                                            }),
                                                        );
                                                    subjectFieldConfigTableData.splice(
                                                        indexOfTheItem,
                                                        1,
                                                    );
                                                } else
                                                    subjectFieldConfigTableData[index] = deepClone(
                                                        subjectFieldConfigTableDataRef[index],
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
                                    <edc-delete-confirmation
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction &&
                                            !isOrderChanged
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this subject field config?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteSubjectFieldConfigById(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table"
                                                container-class="mt-[0.5rem]"
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
