<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createGlobalDictionaryAPI,
        deleteGlobalDictionaryByIdAPI,
        deleteGlobalDictionaryEntryByIdAPI,
        globalDictionaryEntriesCreateAPI,
        globalDictionaryEntriesPaginationListAPI,
        globalDictionaryEntriesUpdateAPI,
        globalDictionaryPaginationListAPI,
        reorderGlobalDictionaryEntryAPI,
        updateGlobalDictionaryAPI,
    } from "~/services/apis/handlers/admin/global-dictionary";
    import type {
        IGlobalDictionaryData,
        IGlobalDictionaryEntryData,
    } from "~/services/apis/handlers/types/admin/global-dictionary-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type {
        IBaseValidationError,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TOptionValue,
        TTableLoaderDetail,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn, IDraggableItem } from "~/types/datatable";

    interface IDictionaryData {
        id: TNullableNumber;
        name: TNullableString;
        numberOfEntries: TNullableString;
        tempID: string;
    }

    interface IDictionaryValidationError extends IBaseValidationError {
        name: string;
        numberOfEntries: string;
    }

    interface IEntryData {
        id: TNullableNumber;
        userDataString: TNullableString;
        specify: boolean;
        codedData: TNullableString;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        tempID: string;
    }

    interface IDictionaryEntryValidationError extends IBaseValidationError {
        userDataString: string;
        specify: string;
        codedData: string;
        order: string;
    }

    const defaultDictionaryValidationErrors = (tempID: string): IDictionaryValidationError => ({
        index: tempID,
        name: "",
        numberOfEntries: "",
    });

    const defaultDictionaryEntryValidationErrors = (
        tempID: string,
    ): IDictionaryEntryValidationError => ({
        index: tempID,
        userDataString: "",
        specify: "",
        codedData: "",
        order: "",
    });

    const toastStore = useToastStore();
    const globalStore = useGlobalStore();

    const loading = ref<Loading>(new Loading());
    const editDictionaryFormDetails = ref<TEditFormDetail>({});
    const editEntryFormDetails = ref<TEditFormDetail>({});
    const dictionaryValidationErrors = ref<TValidationErrorData<IDictionaryValidationError>>({});
    const dictionaryEntryValidationErrors = ref<
        TValidationErrorData<IDictionaryEntryValidationError>
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
    ];
    const selectedDictionary = ref<IDictionaryData | null>(null);
    const dictionaryTableData = ref<IDictionaryData[]>([]);
    const dictionaryTableDataRef = ref<IDictionaryData[]>(deepClone(dictionaryTableData.value));
    const dictionaryTableLoaderDetails = ref<TTableLoaderDetail>({});

    const entryFormColumns: IColumn[] = [
        {
            field: "userDataString",
            header: "User Data String",
            icon: false,
            show: true,
        },
        {
            field: "specify",
            header: "Specify",
            icon: false,
            show: true,
        },
        {
            field: "codedData",
            header: "Coded Data",
            icon: false,
            show: true,
        },
    ];
    const entryTableData = ref<IEntryData[]>([]);
    const entryTableDataRef = ref<IEntryData[]>(deepClone(entryTableData.value));
    const dictionaryEntryTableLoaderDetails = ref<TTableLoaderDetail>({});

    const disableFormAction = computed(() =>
        checkIfEditFormActive(editDictionaryFormDetails.value),
    );
    const disableEntryAction = computed(() => checkIfEditFormActive(editEntryFormDetails.value));

    function dictionaryValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IDictionaryValidationError> = {
            ...dictionaryValidationErrors.value,
        };
        for (const [index, tableRow] of dictionaryTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IDictionaryValidationError = {
                    ...defaultDictionaryValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 256)
                    obj["name"] = "Name cannot be more than 256 characters";
                else obj["name"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        dictionaryValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function editDictionaryForm(tempID: string) {
        // const objectKey = typeof key !== "undefined" ? key : dictionaryTableData.value.length - 1;
        if (!checkIfKeyExistsInObject(tempID, editDictionaryFormDetails.value))
            editDictionaryFormDetails.value[tempID] = true;
        else editDictionaryFormDetails.value[tempID] = !editDictionaryFormDetails.value[tempID];
    }

    function resetDictionaryEditFormDetails(tempID?: string) {
        if (tempID) {
            editDictionaryForm(tempID);
            deleteObjectPropertyByKey(tempID, dictionaryValidationErrors.value);
        } else {
            editDictionaryFormDetails.value = {};
            dictionaryValidationErrors.value = {};
        }
    }

    function addOrEditForm(key?: string) {
        let tempID = "";
        if (typeof key === "undefined") {
            tempID = uniqueID();
            dictionaryTableData.value.unshift({
                id: null,
                name: null,
                numberOfEntries: null,
                tempID,
            });
            // setTimeout(() => {
            //     scrollToNewlyCreatedRow(undefined, "dictionaryTable");
            // }, 10);
        }
        const objectKey = typeof key !== "undefined" ? key : tempID;
        editDictionaryForm(objectKey);
    }

    function setDictionaryTableData(tableData: IGlobalDictionaryData[]) {
        dictionaryTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            name: row.name,
            numberOfEntries: row.numberOfEntries as TNullableNumber,
            tempID: uniqueID(),
            updatedBy: 0,
        })) as IGlobalDictionaryData[];
    }

    async function dictionaryPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await globalDictionaryPaginationListAPI(
            getAPIFilters({
                search: dictionarySearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setDictionaryTableData(items);
            dictionaryTableData.value = deepClone(tableData);
            dictionaryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            dictionaryTableData.value = [];
            dictionaryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrEditDictionaryApi(rowIndex: number) {
        dictionaryValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(dictionaryValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: dictionaryTableData.value[rowIndex].id || 0,
                name: dictionaryTableData.value[rowIndex].name as string,
                numberOfEntries: Number(dictionaryTableData.value[rowIndex].numberOfEntries),
                updatedBy: 0,
            };
            if (!dictionaryTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await createGlobalDictionaryAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await updateGlobalDictionaryAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetDictionaryEditFormDetails();
                await dictionaryPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        dictionaryTableData.value[rowIndex].tempID,
                        dictionaryValidationErrors.value,
                        defaultDictionaryValidationErrors(
                            dictionaryTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        dictionaryValidationErrors.value,
                        dictionaryTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteDictionaryById(dictionaryId: string) {
        loading.value.form = true;
        const { status, message } = await deleteGlobalDictionaryByIdAPI(dictionaryId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await dictionaryPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Dictionaries

    // Entries
    const addEntryOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(entryTableData.value, "userDataString")),
    );

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editEntryFormDetails.value))
            editEntryFormDetails.value[key] = true;
        else editEntryFormDetails.value[key] = !editEntryFormDetails.value[key];
    }

    function resetDictionaryEntryEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, dictionaryEntryValidationErrors.value);
        } else {
            editEntryFormDetails.value = {};
            dictionaryEntryValidationErrors.value = {};
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
            codedData: null,
            orderNumber: 0,
            oldOrderNumber: 0,
            newOrderNumber: 0,
            specify: false,
            userDataString: null,
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
            scrollToNewlyCreatedRow(newItemIndex, "dictionaryEntryTable");
        }, 10);
    }

    function dictionaryEntryValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IDictionaryEntryValidationError> = {
            ...dictionaryEntryValidationErrors.value,
        };
        for (const [index, tableRow] of entryTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IDictionaryEntryValidationError = {
                    ...defaultDictionaryEntryValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.userDataString) === 0)
                    obj["userDataString"] = "Please enter a name";
                else if (getStringLength(tableRow.userDataString) > 256)
                    obj["userDataString"] = "User data string cannot be more than 256 characters";
                else obj["userDataString"] = "";
                if (getStringLength(tableRow.codedData) === 0)
                    obj["codedData"] = "Please enter a coded data";
                else if (getStringLength(tableRow.codedData) > 256)
                    obj["codedData"] = "Coded data cannot be more than 256 characters";
                else obj["codedData"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        dictionaryEntryValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableData: IGlobalDictionaryEntryData[]): IEntryData[] {
        dictionaryEntryTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            codedData: row.codedData,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            specify: row.specify,
            userDataString: row.userDataString,
            tempID: uniqueID(),
        }));
    }

    async function dictionaryEntryPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await globalDictionaryEntriesPaginationListAPI(
            getAPIFilters({
                search: entrySearch.value,
                filter: {
                    dataDictionaryId: Number(selectedDictionary.value?.id),
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

    async function saveAddOrEditDictionaryEntry(rowIndex: number) {
        dictionaryEntryValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(dictionaryEntryValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: entryTableData.value[rowIndex].id || 0,
                dataDictionaryId: selectedDictionary.value
                    ? (selectedDictionary.value.id as number)
                    : 0,
                userDataString: entryTableData.value[rowIndex].userDataString as string,
                specify: entryTableData.value[rowIndex].specify,
                codedData: entryTableData.value[rowIndex].codedData || "",
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
                } = await globalDictionaryEntriesCreateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await globalDictionaryEntriesUpdateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetDictionaryEntryEditFormDetails();
                await Promise.all([dictionaryPaginationList(), dictionaryEntryPaginationList()]);
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        entryTableData.value[rowIndex].tempID,
                        dictionaryEntryValidationErrors.value,
                        defaultDictionaryEntryValidationErrors(
                            entryTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        dictionaryEntryValidationErrors.value,
                        entryTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function getEntryDetails() {
        showEntries.value = true;
        await dictionaryEntryPaginationList();
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

    const getReorderRequestBody = (): IGlobalDictionaryEntryData[] =>
        entryTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
            dataDictionaryId: selectedDictionary.value ? selectedDictionary.value.id : 0,
        })) as IGlobalDictionaryEntryData[];

    async function reorderEntries() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderGlobalDictionaryEntryAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await dictionaryEntryPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    async function deleteDictionaryEntryById(dictionaryEntryId: string) {
        loading.value.form = true;
        const { status, message } = await deleteGlobalDictionaryEntryByIdAPI(dictionaryEntryId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await dictionaryEntryPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Entries

    const { model: dictionaryModel, modelRef: dictionaryModelRef } = useUnsavedAlert(
        dictionaryTableData.value,
        dictionaryTableDataRef.value,
    );
    const { model: entryModel, modelRef: entryModelRef } = useUnsavedAlert(
        entryTableData.value,
        entryTableDataRef.value,
    );

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(entryTableData.value, entryTableDataRef.value, "tempID", "newOrderNumber");

    watch(
        () => dictionaryTableData.value,
        (newValue) => {
            dictionaryModel.value = newValue;
            dictionaryModelRef.value = dictionaryTableDataRef.value;
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

    onMounted(async () => {
        loading.value.setDynamicLoading(["reOrder"]);
        await dictionaryPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Global Dictionaries">
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
                                                await dictionaryPaginationList();
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
                                    table-id="dictionaryTable"
                                    :columns="formColumns"
                                    :table-data="dictionaryTableData"
                                    :loading="loading.table"
                                    :disabled="loading.isDisabled(showEntries)"
                                    pagination-type="none"
                                    search-key="dictionarySearch"
                                    table-style="outlined"
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
                                                        editDictionaryFormDetails,
                                                    )
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        dictionaryValidationErrors,
                                                    )
                                                        ? dictionaryValidationErrors[data.tempID]
                                                              .name
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
                                                        dictionaryValidationErrors,
                                                    )
                                                        ? dictionaryValidationErrors[data.tempID]
                                                              .numberOfEntries
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
                                                    editDictionaryFormDetails,
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
                                                isEditable(data.tempID, editDictionaryFormDetails)
                                            "
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                async () => await saveAddOrEditDictionaryApi(index)
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
                                                isEditable(data.tempID, editDictionaryFormDetails)
                                            "
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                () => {
                                                    if (!data.id)
                                                        dictionaryTableData.splice(
                                                            getIndexOfTheItem({
                                                                data: dictionaryTableData,
                                                                type: 'object',
                                                                value: data.tempID,
                                                                key: 'tempID',
                                                            }),
                                                            1,
                                                        );
                                                    else
                                                        dictionaryTableData[index] = deepClone(
                                                            dictionaryTableDataRef[index],
                                                        );
                                                    resetDictionaryEditFormDetails(data.tempID);
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
                                                    editDictionaryFormDetails,
                                                ) && !disableFormAction
                                            "
                                            loader-type="table"
                                            :disabled="loading.isDisabled(showEntries)"
                                            container-class="mt-[0.5rem]"
                                            :on-click="
                                                async () => {
                                                    selectedDictionary = deepClone(data);
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
                                                    editDictionaryFormDetails,
                                                ) &&
                                                data.id &&
                                                !disableFormAction
                                            "
                                            :key="`${checkIfKeyExistsInObject(index, dictionaryTableLoaderDetails) && dictionaryTableLoaderDetails[index] ? 'show' : 'hide'}DeleteDictionaryConfirmation${data.tempID}`"
                                            message="Are you sure you want to delete this dictionary?"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-delete="
                                                async () => {
                                                    dictionaryTableLoaderDetails[index] = true;
                                                    await deleteDictionaryById(String(data.id));
                                                    dictionaryTableLoaderDetails[index] = false;
                                                }
                                            "
                                        >
                                            <template #icon>
                                                <edc-pressable
                                                    loader-type="table"
                                                    container-class="mt-[0.5rem]"
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
                                                await dictionaryEntryPaginationList();
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
                                        v-if="
                                            isOrderChanged &&
                                            !checkIfEditFormActive(editEntryFormDetails)
                                        "
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
                                    table-id="dictionaryEntryTable"
                                    :columns="entryFormColumns"
                                    :table-data="entryTableData"
                                    :loading="loading.secondaryTable"
                                    pagination-type="none"
                                    table-style="outlined"
                                    search-key="entrySearch"
                                    :enable-reorder="true"
                                    :custom-content="true"
                                    :reorder-class="
                                        checkIfEditFormActive(editEntryFormDetails)
                                            ? '!pointer-events-none [&>svg]:mt-[0.5rem]'
                                            : '[&>svg]:mt-[0.5rem]'
                                    "
                                    :disabled="loading.isDisabled()"
                                    skeleton-loader-class="w-[60%]"
                                    @on-select="
                                        (selectedOptions: TOptionValue[]) => {
                                            addOrEditEntryAction(selectedOptions[0]);
                                        }
                                    "
                                    @on-drop="
                                        (
                                            event: DragEvent,
                                            slotProps: IDraggableItem<IEntryData>,
                                            clearData: TVoidAction,
                                        ) => onDragDrop(event, slotProps, clearData)
                                    "
                                >
                                    <template #custom-content="{ data }">
                                        <td class="font-normal text-left font-12 custom-row">
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
                                                        dictionaryEntryValidationErrors,
                                                    )
                                                        ? dictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].userDataString
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-checkbox
                                                :key="`specify-${data.tempID}`"
                                                v-model="data.specify"
                                                name="specify"
                                                :disabled="loading.isDisabled()"
                                                :read-only="
                                                    !isEditable(data.tempID, editEntryFormDetails)
                                                "
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        dictionaryEntryValidationErrors,
                                                    )
                                                        ? dictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].specify
                                                        : ''
                                                "
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`codedData-${data.tempID}`"
                                                v-model="data.codedData"
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
                                                        dictionaryEntryValidationErrors,
                                                    )
                                                        ? dictionaryEntryValidationErrors[
                                                              data.tempID
                                                          ].codedData
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
                                            v-if="isEditable(data.tempID, editEntryFormDetails)"
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled()"
                                            :on-click="
                                                async () =>
                                                    await saveAddOrEditDictionaryEntry(index)
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
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
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
                                                    resetDictionaryEntryEditFormDetails(
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
                                            message="Are you sure you want to delete this dictionary entry?"
                                            :disabled="loading.isDisabled()"
                                            :on-delete="
                                                async () => {
                                                    dictionaryEntryTableLoaderDetails[index] = true;
                                                    await deleteDictionaryEntryById(
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
