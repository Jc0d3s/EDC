<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        reorderEntryAPI,
        unitDictionaryCreateAPI,
        unitDictionaryDeleteByIdAPI,
        unitDictionaryEntriesCreateAPI,
        unitDictionaryEntriesPaginationListAPI,
        unitDictionaryEntriesUpdateAPI,
        unitDictionaryEntryDeleteByIdAPI,
        unitDictionaryPaginationListAPI,
        unitDictionaryUpdateAPI,
    } from "~/services/apis/handlers/admin/unit-dictionary";
    import type {
        IUnitDictionaryEntryData,
        IUnitDictionaryData as IUnitDictionaryDataApi,
    } from "~/services/apis/handlers/types/admin/unit-dictionary-types";
    import useAdminWinFormStore from "~/stores/admin-winform";
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

    interface IUnitDictionaryData {
        id: TNullableNumber;
        name: TNullableString;
        numberOfEntries: TNullableString;
        hasStandardEntries: boolean;
        tempID: string;
    }

    interface IUnitDictionaryValidationError extends IBaseValidationError {
        name: string;
        numberOfEntries: string;
        hasStandardEntries: string;
    }

    interface IEntryData {
        id: TNullableNumber;
        userDataString: TNullableString;
        standard: boolean;
        codedUnit: TNullableString;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        formula: TNullableString;
        tempID: string;
    }

    interface IUnitDictionaryEntryValidationError extends IBaseValidationError {
        userDataString: string;
        standard: string;
        codedUnit: string;
        order: string;
        formula: string;
    }

    const defaultDictionaryValidationErrors = (tempID: string): IUnitDictionaryValidationError => ({
        index: tempID,
        name: "",
        numberOfEntries: "",
        hasStandardEntries: "",
    });

    const defaultDictionaryEntryValidationErrors = (
        tempID: string,
    ): IUnitDictionaryEntryValidationError => ({
        index: tempID,
        userDataString: "",
        standard: "",
        codedUnit: "",
        order: "",
        formula: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const adminWinFormStore = useAdminWinFormStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const globalStore = useGlobalStore();

    const loading = ref<Loading>(new Loading());
    const editUnitDictionaryFormDetails = ref<TEditFormDetail>({});
    const editEntryFormDetails = ref<TEditFormDetail>({});
    const unitDictionaryValidationErrors = ref<
        TValidationErrorData<IUnitDictionaryValidationError>
    >({});
    const unitDictionaryEntryValidationErrors = ref<
        TValidationErrorData<IUnitDictionaryEntryValidationError>
    >({});

    const dictionarySearch = ref<TNullableString>(null);
    const entrySearch = ref<TNullableString>(null);
    const showEntries = ref<boolean>(false);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "numberOfEntries",
            header: "Number of Entries",
            icon: false,
            show: true,
        },
        {
            field: "hasStandardEntries",
            header: "Has Standard Entry",
            icon: false,
            show: true,
        },
    ];
    const selectedUnitDictionary = ref<IUnitDictionaryData | null>(null);
    const unitDictionaryTableData = ref<IUnitDictionaryData[]>([]);
    const unitDictionaryTableDataRef = ref<IUnitDictionaryData[]>(
        deepClone(unitDictionaryTableData.value),
    );
    const dictionaryTableLoaderDetails = ref<TTableLoaderDetail>({});

    const entryFormColumns: IColumn[] = [
        {
            field: "userDataString",
            header: "User Data String",
            icon: false,
            show: true,
        },
        {
            field: "standard",
            header: "Standard",
            icon: false,
            show: true,
        },
        {
            field: "codedUnit",
            header: "Coded Unit",
            icon: false,
            show: true,
        },
        {
            field: "formula",
            header: "Formula",
            icon: false,
            show: true,
        },
    ];
    const entryTableData = ref<IEntryData[]>([]);
    const entryTableDataRef = ref<IEntryData[]>(deepClone(entryTableData.value));
    const dictionaryEntryTableLoaderDetails = ref<TTableLoaderDetail>({});

    // Unit dictionaries
    const dictionaryGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Unit Dictionaries - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Unit Dictionaries",
    );

    const disableFormAction = computed(() =>
        checkIfEditFormActive(editUnitDictionaryFormDetails.value),
    );
    const disableEntryAction = computed(() => checkIfEditFormActive(editEntryFormDetails.value));

    function unitDictionaryValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IUnitDictionaryValidationError> = {
            ...unitDictionaryValidationErrors.value,
        };
        for (const [index, tableRow] of unitDictionaryTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IUnitDictionaryValidationError = {
                    ...defaultDictionaryValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 128)
                    obj["name"] = "Name cannot be more than 128 characters";
                else obj["name"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        unitDictionaryValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function editDictionaryForm(tempID: string) {
        if (!checkIfKeyExistsInObject(tempID, editUnitDictionaryFormDetails.value))
            editUnitDictionaryFormDetails.value[tempID] = true;
        else
            editUnitDictionaryFormDetails.value[tempID] =
                !editUnitDictionaryFormDetails.value[tempID];
    }

    function resetUnitDictionaryEditFormDetails(tempID?: string) {
        if (tempID) {
            editDictionaryForm(tempID);
            deleteObjectPropertyByKey(tempID, unitDictionaryValidationErrors.value);
        } else {
            editUnitDictionaryFormDetails.value = {};
            unitDictionaryValidationErrors.value = {};
        }
    }

    function addOrEditForm(key?: string) {
        let tempID = "";
        if (typeof key === "undefined") {
            tempID = uniqueID();
            unitDictionaryTableData.value.unshift({
                id: null,
                name: null,
                numberOfEntries: "0",
                hasStandardEntries: false,
                tempID,
            });
            setTimeout(() => {
                scrollToNewlyCreatedRow(undefined, "unitDictionaryTable");
            }, 10);
        }
        // const objectKey =
        //     typeof key !== "undefined" ? key : unitDictionaryTableData.value.length - 1;
        const objectKey = typeof key !== "undefined" ? key : tempID;
        editDictionaryForm(objectKey);
    }

    function setUnitDictionaryTableData(tableData: IUnitDictionaryDataApi[]) {
        dictionaryTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            hasStandardEntries: row.hasStandardEntries,
            id: row.id,
            name: row.name,
            numberOfEntries: row.numberOfEntries as TNullableNumber,
            tempID: uniqueID(),
        })) as IUnitDictionaryData[];
    }

    async function unitDictionaryPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await unitDictionaryPaginationListAPI(
            getAPIFilters({
                search: dictionarySearch.value,
                filter: {
                    branchId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setUnitDictionaryTableData(items);
            unitDictionaryTableData.value = deepClone(tableData);
            unitDictionaryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            unitDictionaryTableData.value = [];
            unitDictionaryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrEditUnitDictionary(rowIndex: number) {
        unitDictionaryValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(unitDictionaryValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: unitDictionaryTableData.value[rowIndex].id || 0,
                branchId: props.tabData[props.activeTab.label].data.id as number,
                name: unitDictionaryTableData.value[rowIndex].name as string,
                numberOfEntries: Number(unitDictionaryTableData.value[rowIndex].numberOfEntries),
                hasStandardEntries: unitDictionaryTableData.value[rowIndex].hasStandardEntries,
                updatedBy: 0,
            };
            if (!unitDictionaryTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await unitDictionaryCreateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await unitDictionaryUpdateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                    adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
                resetUnitDictionaryEditFormDetails();
                await unitDictionaryPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        unitDictionaryTableData.value[rowIndex].tempID,
                        unitDictionaryValidationErrors.value,
                        defaultDictionaryValidationErrors(
                            unitDictionaryTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        unitDictionaryValidationErrors.value,
                        unitDictionaryTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteUnitDictionaryById(unitDictionaryId: string) {
        loading.value.form = true;
        const { status, message } = await unitDictionaryDeleteByIdAPI(unitDictionaryId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
            await unitDictionaryPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Unit dictionaries

    // Entries
    const addEntryOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(entryTableData.value, "userDataString")),
    );

    const isStandardSetForTheEntry = computed(() => {
        let result = false;
        for (const row of entryTableData.value) {
            if (row.standard) {
                result = true;
                break;
            }
        }
        return result;
    });

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editEntryFormDetails.value))
            editEntryFormDetails.value[key] = true;
        else editEntryFormDetails.value[key] = !editEntryFormDetails.value[key];
    }

    function resetUnitDictionaryEntryEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, unitDictionaryEntryValidationErrors.value);
        } else {
            editEntryFormDetails.value = {};
            unitDictionaryEntryValidationErrors.value = {};
        }
    }

    function addOrEditEntryAction(selectedOrder: TOptionValue) {
        const newItemIndex = addItemByPosition(
            String(selectedOrder),
            entryTableData.value,
            "userDataString",
        );
        let formTableRef = deepClone(entryTableData.value) as IEntryData[];
        // const editFormDetailsRef = deepClone(editFormDetails.value) as boolean[];
        const tempID = uniqueID();
        formTableRef.splice(newItemIndex, 0, {
            id: null,
            codedUnit: null,
            orderNumber: 0,
            oldOrderNumber: 0,
            newOrderNumber: 0,
            standard: !isStandardSetForTheEntry.value,
            userDataString: null,
            formula: null,
            tempID,
        });
        formTableRef = formTableRef.map((row, index) => ({
            ...row,
            orderNumber: index + 1,
            oldOrderNumber: index + 1,
            newOrderNumber: index + 1,
        }));
        entryTableData.value = deepClone(formTableRef) as IEntryData[];
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex, "unitDictionaryEntryTable");
        }, 10);
    }

    function unitDictionaryEntryValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IUnitDictionaryEntryValidationError> = {
            ...unitDictionaryEntryValidationErrors.value,
        };
        for (const [index, tableRow] of entryTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IUnitDictionaryEntryValidationError = {
                    ...defaultDictionaryEntryValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.userDataString) === 0)
                    obj["userDataString"] = "Please enter a name";
                else if (getStringLength(tableRow.userDataString) > 256)
                    obj["userDataString"] = "User data string cannot be more than 256 characters";
                else obj["userDataString"] = "";
                result[tableRow.tempID] = obj;
                if (getStringLength(tableRow.codedUnit) === 0)
                    obj["codedUnit"] = "Please enter a name";
                else if (getStringLength(tableRow.codedUnit) > 256)
                    obj["codedUnit"] = "Coded unit cannot be more than 256 characters";
                else obj["codedUnit"] = "";
                if (getStringLength(tableRow.formula) === 0)
                    obj["formula"] = "Please enter a formula";
                else obj["formula"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        unitDictionaryEntryValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableData: IUnitDictionaryEntryData[]): IEntryData[] {
        dictionaryEntryTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            userDataString: row.userDataString,
            standard: row.standard,
            codedUnit: row.codedUnit,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            formula: row.formula,
            tempID: uniqueID(),
        }));
    }

    async function unitDictionaryEntriesPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await unitDictionaryEntriesPaginationListAPI(
            getAPIFilters({
                search: entrySearch.value,
                filter: {
                    unitDictionaryId: Number(selectedUnitDictionary.value?.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            entryTableData.value = deepClone(tableData);
            entryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            entryTableData.value = [];
            entryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }

    async function saveAddOrEditUnitDictionaryEntry(rowIndex: number) {
        unitDictionaryEntryValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(unitDictionaryEntryValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: entryTableData.value[rowIndex].id || 0,
                unitDictionaryId: selectedUnitDictionary.value
                    ? (selectedUnitDictionary.value.id as number)
                    : 0,
                userDataString: entryTableData.value[rowIndex].userDataString as string,
                standard: entryTableData.value[rowIndex].standard,
                formula: entryTableData.value[rowIndex].formula || "",
                dividend: 0,
                divisor: 0,
                formulaValueOne: 0,
                formulaValueTwo: 0,
                codedUnit: entryTableData.value[rowIndex].codedUnit || "",
                orderNumber: entryTableData.value[rowIndex].orderNumber,
                oldOrderNumber: entryTableData.value[rowIndex].oldOrderNumber,
                newOrderNumber: entryTableData.value[rowIndex].newOrderNumber,
                updatedBy: 0,
            };
            if (!entryTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await unitDictionaryEntriesCreateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await unitDictionaryEntriesUpdateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                    adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
                resetUnitDictionaryEntryEditFormDetails();
                await Promise.all([
                    unitDictionaryPaginationList(),
                    unitDictionaryEntriesPaginationList(),
                ]);
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        entryTableData.value[rowIndex].tempID,
                        unitDictionaryEntryValidationErrors.value,
                        defaultDictionaryValidationErrors(entryTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        unitDictionaryEntryValidationErrors.value,
                        entryTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function getEntryDetails() {
        showEntries.value = true;
        await unitDictionaryEntriesPaginationList();
    }

    function hideEntryDetails() {
        showEntries.value = false;
        entryTableData.value = [];
        entryTableDataRef.value = [];
    }

    function onDragDrop(
        event: DragEvent,
        slotProps: IDraggableItem<IEntryData>,
        clearTransferData: TVoidAction,
    ) {
        const draggedItem = parseJSON(
            event.dataTransfer!.getData("item"),
        ) as IDraggableItem<IEntryData>;
        if (draggedItem.index !== slotProps.index) {
            entryTableData.value = sortArray({
                data: entryTableData.value.map((row) => ({
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

    const getReorderRequestBody = (): IUnitDictionaryEntryData[] =>
        entryTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
            unitDictionaryId: selectedUnitDictionary.value ? selectedUnitDictionary.value.id : 0,
            dividend: 0,
            divisor: 0,
            formulaValueOne: 0,
            formulaValueTwo: 0,
        })) as IUnitDictionaryEntryData[];

    async function reorderEntries() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderEntryAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await unitDictionaryEntriesPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    async function deleteUnitDictionaryEntryById(unitDictionaryEntryId: string) {
        loading.value.form = true;
        const { status, message } = await unitDictionaryEntryDeleteByIdAPI(unitDictionaryEntryId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
            await unitDictionaryEntriesPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Entries

    const {
        isModelChanged: isUnitDictionaryModelChanged,
        model: unitDictionaryModel,
        modelRef: unitDictionaryModelRef,
    } = useUnsavedAlert(unitDictionaryTableData.value, unitDictionaryTableDataRef.value);
    const {
        isModelChanged: isUnitDictionaryEntryModelChanged,
        model: entryModel,
        modelRef: entryModelRef,
    } = useUnsavedAlert(entryTableData.value, entryTableDataRef.value);

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(entryTableData.value, entryTableDataRef.value, "tempID", "newOrderNumber");

    watch(
        () => unitDictionaryTableData.value,
        (newValue) => {
            unitDictionaryModel.value = newValue;
            unitDictionaryModelRef.value = unitDictionaryTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => entryTableData.value,
        (newValue) => {
            entryModel.value = newValue;
            entryModelRef.value = entryTableDataRef.value;
            orderModel.value = newValue;
            orderModelRef.value = entryTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => isUnitDictionaryModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => isUnitDictionaryEntryModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isUnitDictionaryModelChanged.value) {
                unitDictionaryTableData.value = deepClone(unitDictionaryTableDataRef.value);
                resetUnitDictionaryEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            } else if (
                newTriggerFormActionAlert === "reset" &&
                isUnitDictionaryEntryModelChanged.value
            ) {
                entryTableData.value = deepClone(entryTableDataRef.value);
                resetUnitDictionaryEntryEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        loading.value.setDynamicLoading(["reOrder"]);
        await unitDictionaryPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="dictionaryGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="grid grid-cols-2 gap-[1rem]">
                        <div class="flex flex-col gap-[1rem]">
                            <div class="flex flex-row items-center gap-[1rem]">
                                <!-- :class="[showEntries ? 'invisible' : '']" -->
                                <div class="w-fit">
                                    <edc-search-bar
                                        v-model="dictionarySearch"
                                        element-id="dictionarySearch"
                                        :disabled="
                                            loading.isDisabled(showEntries, disableFormAction)
                                        "
                                        input-class="admin-input-font"
                                        @on-search="
                                            async () => {
                                                await unitDictionaryPaginationList();
                                                globalStore.triggerSearchBarRefocus(
                                                    '#dictionarySearch',
                                                );
                                            }
                                        "
                                    />
                                </div>
                                <admin-action-label
                                    v-if="!disableFormAction"
                                    icon="circle-plus"
                                    text="Add Dictionary"
                                    :disabled="loading.isDisabled(showEntries)"
                                    :on-click="
                                        () => {
                                            addOrEditForm();
                                        }
                                    "
                                />
                            </div>
                            <div>
                                <edc-data-table
                                    table-id="unitDictionaryTable"
                                    :columns="formColumns"
                                    :table-data="unitDictionaryTableData"
                                    :loading="loading.table"
                                    pagination-type="none"
                                    table-style="outlined"
                                    search-key="dictionarySearch"
                                    :disabled="loading.isDisabled(showEntries)"
                                    :custom-content="true"
                                >
                                    <template #custom-content="{ data }">
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`name-${data.tempID}`"
                                                v-model="data.name"
                                                type="text"
                                                placeholder="Enter name"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="
                                                    !isEditable(
                                                        data.tempID,
                                                        editUnitDictionaryFormDetails,
                                                    )
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryValidationErrors,
                                                    )
                                                        ? unitDictionaryValidationErrors[
                                                              data.tempID
                                                          ].name
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`numberOfEntries-${data.tempID}`"
                                                v-model="data.numberOfEntries"
                                                type="text"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="true"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryValidationErrors,
                                                    )
                                                        ? unitDictionaryValidationErrors[
                                                              data.tempID
                                                          ].numberOfEntries
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-checkbox
                                                :key="`hasStandardEntries-${data.tempID}`"
                                                v-model="data.hasStandardEntries"
                                                name="hasStandardEntries"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="true"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryValidationErrors,
                                                    )
                                                        ? unitDictionaryValidationErrors[
                                                              data.tempID
                                                          ].hasStandardEntries
                                                        : ''
                                                "
                                            />
                                        </td>
                                    </template>
                                    <template #action="{ data, index }">
                                        <edc-pressable
                                            v-if="
                                                !isEditable(
                                                    data.tempID,
                                                    editUnitDictionaryFormDetails,
                                                ) && !disableFormAction
                                            "
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="() => addOrEditForm(data.tempID)"
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Update'"
                                                icon="edit"
                                                fill="var(--color-secondary)"
                                                :class="`${commonActionIconClasses('Update')}`"
                                            />
                                        </edc-pressable>
                                        <edc-pressable
                                            v-if="
                                                isEditable(
                                                    data.tempID,
                                                    editUnitDictionaryFormDetails,
                                                )
                                            "
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                async () => await saveAddOrEditUnitDictionary(index)
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Save'"
                                                icon="save"
                                                :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                        <edc-pressable
                                            v-if="
                                                isEditable(
                                                    data.tempID,
                                                    editUnitDictionaryFormDetails,
                                                )
                                            "
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                () => {
                                                    if (!data.id)
                                                        unitDictionaryTableData.splice(
                                                            getIndexOfTheItem({
                                                                data: unitDictionaryTableData,
                                                                type: 'object',
                                                                value: data.tempID,
                                                                key: 'tempID',
                                                            }),
                                                            1,
                                                        );
                                                    else
                                                        unitDictionaryTableData[index] = deepClone(
                                                            unitDictionaryTableDataRef[index],
                                                        );
                                                    resetUnitDictionaryEditFormDetails(data.tempID);
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
                                                !isEditable(
                                                    data.tempID,
                                                    editUnitDictionaryFormDetails,
                                                ) && !disableFormAction
                                            "
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                async () => {
                                                    selectedUnitDictionary = deepClone(data);
                                                    await getEntryDetails();
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Entries'"
                                                icon="circle-play"
                                                :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                        <edc-delete-confirmation
                                            v-if="
                                                !isEditable(
                                                    data.tempID,
                                                    editUnitDictionaryFormDetails,
                                                ) &&
                                                data.id &&
                                                !disableFormAction
                                            "
                                            :key="`${checkIfKeyExistsInObject(index, dictionaryTableLoaderDetails) && dictionaryTableLoaderDetails[index] ? 'show' : 'hide'}DeleteDictionaryConfirmation${data.tempID}`"
                                            message="Are you sure you want to delete this unit dictionary?"
                                            :disabled="loading.isDisabled()"
                                            :on-delete="
                                                async () => {
                                                    if (
                                                        adminWinFormStore.triggerGoBackPostHook
                                                            .isActionPerformed
                                                    )
                                                        adminWinFormStore.triggerGoBackPostHook.isActionPerformed = false;
                                                    dictionaryTableLoaderDetails[index] = true;
                                                    await deleteUnitDictionaryById(String(data.id));
                                                    dictionaryTableLoaderDetails[index] = false;
                                                }
                                            "
                                        >
                                            <template #icon>
                                                <edc-pressable
                                                    loader-type="table"
                                                    container-class="mt-[0.5rem]"
                                                    :disabled="loading.isDisabled(showEntries)"
                                                    :show-loader="
                                                        dictionaryTableLoaderDetails[index]
                                                    "
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
                                </edc-data-table>
                            </div>
                        </div>
                        <div v-if="showEntries" class="flex flex-col gap-[1rem]">
                            <div class="flex flex-row items-center gap-[1rem]">
                                <div class="w-fit">
                                    <edc-search-bar
                                        v-model="entrySearch"
                                        element-id="entrySearch"
                                        :disabled="
                                            loading.isDisabled(disableEntryAction, isOrderChanged)
                                        "
                                        input-class="admin-input-font"
                                        @on-search="
                                            async () => {
                                                await unitDictionaryEntriesPaginationList();
                                                globalStore.triggerSearchBarRefocus('#entrySearch');
                                            }
                                        "
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[1rem]">
                                    <admin-action-label
                                        v-if="!disableEntryAction && !isOrderChanged"
                                        icon="circle-check"
                                        text="Done"
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => hideEntryDetails()"
                                    />
                                    <edc-dropdown
                                        v-if="!isOrderChanged && !disableEntryAction"
                                        container-class="w-[10rem]"
                                        :options="addEntryOrderOptions"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="min-w-[8rem] max-w-[20rem]"
                                        type="label"
                                        label="Add Entry"
                                        :reset-option="true"
                                        :disabled="loading.isDisabled()"
                                        @on-select="
                                            (selectedOptions: TOptionValue[]) => {
                                                addOrEditEntryAction(selectedOptions[0]);
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isOrderChanged && !disableEntryAction"
                                        icon="save"
                                        text="Save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await reorderEntries();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isOrderChanged && !disableEntryAction"
                                        icon="undo"
                                        text="Reset"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                entryTableData = deepClone(entryTableDataRef);
                                            }
                                        "
                                    />
                                </div>
                            </div>
                            <div>
                                <edc-data-table
                                    table-id="unitDictionaryEntryTable"
                                    :columns="entryFormColumns"
                                    :table-data="entryTableData"
                                    :loading="loading.secondaryTable"
                                    pagination-type="none"
                                    table-style="outlined"
                                    search-key="entrySearch"
                                    :reorder-class="
                                        disableEntryAction
                                            ? '!pointer-events-none [&>svg]:mt-[0.5rem]'
                                            : '[&>svg]:mt-[0.5rem]'
                                    "
                                    :enable-reorder="true"
                                    :custom-content="true"
                                    :disabled="loading.isDisabled()"
                                    skeleton-loader-class="w-[60%]"
                                    @on-drop="
                                        (
                                            event: DragEvent,
                                            slotProps: IDraggableItem<IEntryData>,
                                            clearData: TVoidAction,
                                        ) => onDragDrop(event, slotProps, clearData)
                                    "
                                >
                                    <template #custom-content="{ data }">
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`userDataString-${data.tempID}`"
                                                v-model="data.userDataString"
                                                type="text"
                                                placeholder="Enter user data string *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="
                                                    !isEditable(data.tempID, editEntryFormDetails)
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryEntryValidationErrors,
                                                    )
                                                        ? unitDictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].userDataString
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-checkbox
                                                :key="`standard-${data.tempID}`"
                                                v-model="data.standard"
                                                name="standard"
                                                :disabled="loading.isDisabled()"
                                                :read-only="
                                                    !isEditable(data.tempID, editEntryFormDetails)
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryEntryValidationErrors,
                                                    )
                                                        ? unitDictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].standard
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`codedUnit-${data.tempID}`"
                                                v-model="data.codedUnit"
                                                type="text"
                                                placeholder="Enter coded data *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="
                                                    !isEditable(data.tempID, editEntryFormDetails)
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryEntryValidationErrors,
                                                    )
                                                        ? unitDictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].codedUnit
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`formula-${data.tempID}`"
                                                v-model="data.formula"
                                                type="text"
                                                placeholder="Enter formula *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="
                                                    !isEditable(data.tempID, editEntryFormDetails)
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        unitDictionaryEntryValidationErrors,
                                                    )
                                                        ? unitDictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].formula
                                                        : ''
                                                "
                                            />
                                        </td>
                                    </template>
                                    <template #action="{ data, index }">
                                        <edc-pressable
                                            v-if="
                                                !isEditable(data.tempID, editEntryFormDetails) &&
                                                !disableEntryAction &&
                                                !isOrderChanged
                                            "
                                            :disabled="loading.isDisabled()"
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
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
                                            v-if="isEditable(data.tempID, editEntryFormDetails)"
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled()"
                                            :on-click="
                                                async () =>
                                                    await saveAddOrEditUnitDictionaryEntry(index)
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Save'"
                                                icon="save"
                                                :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                        <edc-pressable
                                            v-if="isEditable(data.tempID, editEntryFormDetails)"
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled()"
                                            :on-click="
                                                () => {
                                                    if (!data.id) {
                                                        const indexOfTheItem = getIndexOfTheItem({
                                                            data: entryTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        });
                                                        entryTableData = entryTableData.map(
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
                                                        entryTableData.splice(indexOfTheItem, 1);
                                                    } else
                                                        entryTableData[index] = deepClone(
                                                            entryTableDataRef[index],
                                                        );
                                                    resetUnitDictionaryEntryEditFormDetails(
                                                        data.tempID,
                                                    );
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
                                                !isEditable(data.tempID, editEntryFormDetails) &&
                                                data.id &&
                                                !disableEntryAction &&
                                                !isOrderChanged
                                            "
                                            :key="`${checkIfKeyExistsInObject(index, dictionaryEntryTableLoaderDetails) && dictionaryEntryTableLoaderDetails[index] ? 'show' : 'hide'}DeleteDictionaryEntryConfirmation${data.tempID}`"
                                            message="Are you sure you want to delete this unit dictionary entry?"
                                            :disabled="loading.isDisabled()"
                                            :on-delete="
                                                async () => {
                                                    if (
                                                        adminWinFormStore.triggerGoBackPostHook
                                                            .isActionPerformed
                                                    )
                                                        adminWinFormStore.triggerGoBackPostHook.isActionPerformed = false;
                                                    dictionaryEntryTableLoaderDetails[index] = true;
                                                    await deleteUnitDictionaryEntryById(
                                                        String(data.id),
                                                    );
                                                    dictionaryEntryTableLoaderDetails[index] =
                                                        false;
                                                }
                                            "
                                        >
                                            <template #icon>
                                                <edc-pressable
                                                    loader-type="table"
                                                    container-class="mt-[0.5rem]"
                                                    :disabled="loading.isDisabled()"
                                                    :show-loader="
                                                        dictionaryEntryTableLoaderDetails[index]
                                                    "
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
                                </edc-data-table>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
