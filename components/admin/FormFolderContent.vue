<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createTrialVisitAPI,
        deleteTrialVisitByIdAPI,
        reorderTrialVisitsAPI,
        trialVisitPaginationListAPI,
        updateTrialVisitAPI,
    } from "~/services/apis/handlers/admin/trial-visit";
    import type { ITrialVisit } from "~/services/apis/handlers/types/admin/trial-visit-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
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
        name: TNullableString;
        oid: TNullableString;
        // parentFolderId: TNullableNumber;
        access: TNullableNumber;
        start: TNullableNumber;
        target: TNullableNumber;
        end: TNullableNumber;
        overDue: TNullableNumber;
        close: TNullableNumber;
        reusable: boolean;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        name: string;
        oid: string;
        // parentFolderId: string;
        access: string;
        start: string;
        target: string;
        end: string;
        overdue: string;
        close: string;
        reusable: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        name: "",
        oid: "",
        // parentFolderId: "",
        access: "",
        start: "",
        target: "",
        end: "",
        overdue: "",
        close: "",
        reusable: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const folderSearch = ref<TNullableString>(null);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
            sort: false,
        },
        {
            field: "oid",
            header: "OID",
            icon: false,
            show: true,
        },
        // {
        //     field: "parentFolderId",
        //     header: "Parent Folder",
        //     icon: false,
        //     show: true,
        // },
        {
            field: "access",
            header: "Access",
            icon: false,
            show: true,
        },
        {
            field: "start",
            header: "Start",
            icon: false,
            show: true,
        },
        {
            field: "target",
            header: "Target",
            icon: false,
            show: true,
        },
        {
            field: "end",
            header: "End",
            icon: false,
            show: true,
        },
        {
            field: "overdue",
            header: "Overdue",
            icon: false,
            show: true,
        },
        {
            field: "close",
            header: "Close",
            icon: false,
            show: true,
        },
        {
            field: "reusable",
            header: "Reusable",
            icon: false,
            show: true,
        },
    ];
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));
    const loading = ref<Loading>(new Loading());
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const editFormDetails = ref<TEditFormDetail>({});
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Folders - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Folders",
    );

    // const addFormOrderOptions = computed(() => {
    //     const result: IOptions[] = [{ label: "Top", value: "Top" }];
    //     for (const rowData of formTableData.value) {
    //         if (rowData.name) result.push({ label: rowData.name, value: rowData.name });
    //     }
    //     result.push({ label: "Bottom", value: "Bottom" });
    //     return deepClone(result) as IOptions[];
    // });
    const addFormOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(formTableData.value, "name")),
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

                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 50)
                    obj["name"] = "Name cannot be more than 50 characters";
                else obj["name"] = "";
                if (!tableRow.oid || getStringLength(tableRow.oid) === 0)
                    obj["oid"] = "Please enter an OID";
                else if (getStringLength(tableRow.oid) > 50)
                    obj["oid"] = "OID cannot be more than 50 characters";
                else if (!checkOID(tableRow.oid)) obj["oid"] = "Invalid OID";
                else obj["oid"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    function addOrEditFormAction(selectedOrder: TOptionValue) {
        const newItemIndex = addItemByPosition(String(selectedOrder), formTableData.value, "name");
        let formTableRef = deepClone(formTableData.value) as ITableData[];
        // const editFormDetailsRef = deepClone(editFormDetails.value) as boolean[];
        const tempID = uniqueID();
        formTableRef.splice(newItemIndex, 0, {
            id: null,
            name: null,
            oid: null,
            // parentFolderId: null,
            access: 0,
            close: 0,
            end: 0,
            orderNumber: 0,
            oldOrderNumber: 0,
            newOrderNumber: 0,
            start: 0,
            target: 0,
            overDue: 0,
            reusable: false,
            tempID,
        });
        formTableRef = formTableRef.map((row, index) => ({
            ...row,
            orderNumber: index + 1,
            oldOrderNumber: index + 1,
            newOrderNumber: index + 1,
        }));
        formTableData.value = deepClone(formTableRef) as ITableData[];
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function setTableData(tableData: ITrialVisit[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            name: row.name,
            oid: row.oid,
            // parentFolderId: row.parentFolder,
            access: row.access,
            start: row.start,
            target: row.target,
            end: row.end,
            overDue: row.overDue,
            close: row.close,
            reusable: row.reusable,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function trialVisitPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await trialVisitPaginationListAPI(
            getAPIFilters({
                search: folderSearch.value,
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
        } else if (status !== 401) {
            formTableData.value = [];
            formTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrEditFolderAPI(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: formTableData.value[rowIndex].id || 0,
                branchId: props.tabData[props.activeTab.label].data.id as number,
                orderNumber: formTableData.value[rowIndex].orderNumber,
                oldOrderNumber: formTableData.value[rowIndex].oldOrderNumber,
                newOrderNumber: formTableData.value[rowIndex].newOrderNumber,
                name: formTableData.value[rowIndex].name as string,
                oid: formTableData.value[rowIndex].oid as string,
                // parentFolder: formTableData.value[rowIndex].parentFolderId,
                access: formTableData.value[rowIndex].access as number,
                start: formTableData.value[rowIndex].start as number,
                target: formTableData.value[rowIndex].target as number,
                end: formTableData.value[rowIndex].end as number,
                overDue: formTableData.value[rowIndex].overDue as number,
                close: formTableData.value[rowIndex].close as number,
                reusable: formTableData.value[rowIndex].reusable,
                updatedBy: 0,
            };
            if (!formTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createTrialVisitAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateTrialVisitAPI(requestData);
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
                await trialVisitPaginationList();
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

    const getReorderRequestBody = (): ITrialVisit[] =>
        formTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
        })) as any[];

    async function reorderTrialVisits() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderTrialVisitsAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await trialVisitPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    // function parentFolderLookups(currentFolder: TNullableString): IOptions[] {
    //     return formTableData.value
    //         .filter((row) => row.name && row.name !== currentFolder)
    //         .map((row) => ({
    //             label: row.name as string,
    //             value: Number(row.id),
    //         }));
    // }

    async function deleteTrialVisitById(trialVisitId: string) {
        loading.value.form = true;
        const { status, message } = await deleteTrialVisitByIdAPI(trialVisitId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await trialVisitPaginationList();
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
    } = useOrderChanged(formTableData.value, formTableDataRef.value, "tempID", "newOrderNumber");

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
        await trialVisitPaginationList();
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
                                    v-model="folderSearch"
                                    element-id="folderSearch"
                                    :disabled="loading.isDisabled(disableAction, isOrderChanged)"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await trialVisitPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#folderSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                            <div class="flex flex-row items-center gap-[1rem]">
                                <edc-dropdown
                                    v-if="!disableAction && !disableAction && !isOrderChanged"
                                    container-class="w-[10rem]"
                                    :options="addFormOrderOptions"
                                    input-class="admin-input-font"
                                    option-placement="bottom"
                                    option-class="min-w-[8rem] max-w-[20rem]"
                                    type="label"
                                    label="Add Folder"
                                    :reset-option="true"
                                    :disabled="loading.isDisabled()"
                                    @on-select="
                                        (selectedOptions: TOptionValue[]) => {
                                            addOrEditFormAction(selectedOptions[0]);
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
                                            await reorderTrialVisits();
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
                                :columns="formColumns"
                                :table-data="formTableData"
                                :loading="loading.table"
                                pagination-type="none"
                                search-key="folderSearch"
                                table-style="outlined"
                                :enable-reorder="true"
                                :reorder-class="
                                    disableAction
                                        ? '!pointer-events-none [&>svg]:mt-[0.7rem]'
                                        : '[&>svg]:mt-[0.7rem]'
                                "
                                :custom-content="true"
                                :disabled="loading.isDisabled()"
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
                                    <td class="font-normal text-left font-12 custom-row w-[12rem]">
                                        <edc-text-input
                                            :key="`name-${data.tempID}`"
                                            v-model="data.name"
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
                                                    ? validationErrors[data.tempID].name
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row w-[12rem]">
                                        <edc-text-input
                                            :key="`oid-${data.tempID}`"
                                            v-model="data.oid"
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
                                                    ? validationErrors[data.tempID].oid
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <!-- <td class="font-normal text-left font-12 custom-row w-[12rem]">
                                        <edc-dropdown
                                            v-model="data.parentFolderId"
                                            container-class="w-[14rem]"
                                            :options="parentFolderLookups(data.name)"
                                            :default-value="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'No Parent folder'
                                                    : 'Choose a folder'
                                            "
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[14rem]"
                                            :enable-clear="true"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].parentFolderId
                                                    : ''
                                            "
                                        />
                                    </td> -->
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`access-${data.tempID}`"
                                            v-model="data.access"
                                            :disabled="loading.isDisabled()"
                                            type="number"
                                            placeholder="Enter access"
                                            input-class="admin-input-font"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].access
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`start-${data.tempID}`"
                                            v-model="data.start"
                                            type="number"
                                            placeholder="Enter start"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].start
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`target-${data.tempID}`"
                                            v-model="data.target"
                                            type="number"
                                            placeholder="Enter target"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].target
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`end-${data.tempID}`"
                                            v-model="data.end"
                                            type="number"
                                            placeholder="Enter end"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].end
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`overDue-${data.tempID}`"
                                            v-model="data.overDue"
                                            type="number"
                                            placeholder="Enter overdue"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].overdue
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`close-${data.tempID}`"
                                            v-model="data.close"
                                            type="number"
                                            placeholder="Enter close"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].close
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`reusable-${data.tempID}`"
                                            v-model="data.reusable"
                                            name="reusable"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].reusable
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
                                        container-class="mt-[0.7rem]"
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
                                        container-class="mt-[0.7rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="async () => await saveAddOrEditFolderAPI(index)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        container-class="mt-[0.7rem]"
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
                                    <edc-delete-confirmation
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            data.id &&
                                            !disableAction &&
                                            !isOrderChanged
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this folder?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteTrialVisitById(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table"
                                                container-class="mt-[0.7rem]"
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
                                        container-class="mt-[0.7rem]"
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
