<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        matricesCreateAPI,
        matricesPaginationListAPI,
        matricesUpdateAPI,
        matrixDeleteByIdAPI,
    } from "~/services/apis/handlers/admin/matrix";
    import type { IMatrixData } from "~/services/apis/handlers/types/admin/matrix-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        name: TNullableString;
        oid: TNullableString;
        allowAdd: boolean;
        max: number;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        name: string;
        oid: string;
        allowAdd: string;
        max: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        name: "",
        oid: "",
        allowAdd: "",
        max: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const loading = ref<Loading>(new Loading());
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

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
        {
            field: "allowAdd",
            header: "Allow Add",
            icon: false,
            show: true,
        },
        {
            field: "max",
            header: "Max",
            icon: false,
            show: true,
        },
    ];

    const toastStore = useToastStore();
    const matrixSearch = ref<TNullableString>(null);
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));

    const matricesGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Matrices - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Matrices",
    );

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    // const addFormOrderOptions = computed(() => {
    //     const result: IOptions[] = [{ label: "Top", value: "Top" }];
    //     for (const rowData of formTableData.value) {
    //         if (rowData.name) result.push({ label: rowData.name, value: rowData.name });
    //     }
    //     result.push({ label: "Bottom", value: "Bottom" });
    //     return deepClone(result) as IOptions[];
    // });
    // const addFormOrderOptions = computed(() =>
    //     deepClone(getFormOrderOptions(formTableData.value, "name")),
    // );

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = {
            ...validationErrors.value,
        };
        for (const [index, tableRow] of formTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 256)
                    obj["name"] = "Name cannot be more than 256 characters";
                else obj["name"] = "";
                if (!tableRow.oid || getStringLength(tableRow.oid) === 0)
                    obj["oid"] = "Please enter an oid";
                else if (getStringLength(tableRow.oid) > 256)
                    obj["oid"] = "OID cannot be more than 256 characters";
                else if (!checkOID(tableRow.oid)) obj["oid"] = "Please enter a valid oid";
                else obj["oid"] = "";
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
    //             key: "name",
    //         });
    //         order = indexOfSelectedRow + 1;
    //     } else if (selectedOrder === "Top") {
    //         order = 0;
    //     } else {
    //         order = formTableData.value.length;
    //     }
    //     return order;
    // }

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

    // function addOrEditFormAction(selectedOrder: TOptionValue) {
    //     const newItemIndex = getNewItemPosition(String(selectedOrder));
    //     let formTableRef = deepClone(formTableData.value) as ITableData[];
    //     // const editFormDetailsRef = deepClone(editFormDetails.value) as boolean[];
    //     const tempID = uniqueID();
    //     formTableRef.splice(newItemIndex, 0, {
    // id: null,
    // name: null,
    // oid: null,
    // allowAdd: false,
    // max: 0,
    // tempID,
    //     });
    //     formTableRef = formTableRef.map((row, index) => ({
    //         ...row,
    //         formOrderNumber: index + 1,
    //     }));
    //     formTableData.value = deepClone(formTableRef) as ITableData[];
    //     editForm(tempID);
    //     setTimeout(() => {
    //         scrollToNewlyCreatedRow(newItemIndex, "matrixTable");
    //     }, 10);
    // }
    function addOrEditFormAction() {
        const tempID = uniqueID();
        formTableData.value.unshift({
            id: null,
            name: null,
            oid: null,
            allowAdd: false,
            max: 0,
            tempID,
        });
        editForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow();
        }, 10);
    }

    function setTableData(tableData: IMatrixData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            ...row,
            tempID: uniqueID(),
        }));
    }
    async function matricesPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await matricesPaginationListAPI(
            getAPIFilters({
                search: matrixSearch.value,
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

    async function saveAddOrEditMatrix(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: formTableData.value[rowIndex].id || 0,
                branchId: props.tabData[props.activeTab.label].data.id as number,
                name: formTableData.value[rowIndex].name as string,
                oid: formTableData.value[rowIndex].oid as string,
                allowAdd: formTableData.value[rowIndex].allowAdd,
                max: formTableData.value[rowIndex].max,
                updatedBy: 0,
            };
            if (!formTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await matricesCreateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: statusMessage,
                    validationErrors: apiValidationErrors,
                } = await matricesUpdateAPI(requestData);
                message = apiMessage;
                status = statusMessage;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetEditFormDetails();
                await matricesPaginationList();
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

    // function onDragDrop(
    //     event: DragEvent,
    //     slotProps: IDraggableItem<ITableData>,
    //     clearTransferData: TVoidAction,
    // ) {
    //     const draggedItem = parseJSON(
    //         event.dataTransfer!.getData("item"),
    //     ) as IDraggableItem<ITableData>;
    //     if (draggedItem.index !== slotProps.index) {
    //         formTableData.value = formTableData.value
    //             .map((row) => ({
    //                 ...row,
    //                 formOrderNumber: getItemOrder(
    //                     row.formOrderNumber,
    //                     draggedItem.data.formOrderNumber,
    //                     slotProps.data.formOrderNumber,
    //                 ),
    //             }))
    //             .sort((row1, row2) => {
    //                 if (Number(row1.formOrderNumber) > Number(row2.formOrderNumber)) return 1;
    //                 if (Number(row1.formOrderNumber) < Number(row2.formOrderNumber)) return -1;
    //                 return 0;
    //             });
    //     }
    //     clearTransferData();
    // }

    async function deleteMatrixById(matrixId: string) {
        loading.value.form = true;
        const { status, message } = await matrixDeleteByIdAPI(matrixId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await matricesPaginationList();
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

    watch(
        () => formTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = formTableDataRef.value;
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
        await matricesPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="matricesGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="matrixSearch"
                                    element-id="matrixSearch"
                                    :disabled="loading.isDisabled(disableAction)"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await matricesPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#matrixSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                            <!-- <edc-dropdown
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
                            /> -->
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Matrix"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditFormAction();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                table-id="matrixTable"
                                :columns="formColumns"
                                :table-data="formTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="matrixSearch"
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
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`oid-${data.tempID}`"
                                            v-model="data.oid"
                                            type="text"
                                            placeholder="Enter OID"
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
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`allowAdd-${data.tempID}`"
                                            v-model="data.allowAdd"
                                            name="allowAdd"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].allowAdd
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`max-${data.tempID}`"
                                            v-model="data.max"
                                            type="number"
                                            placeholder="Enter max"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="
                                                !isEditable(data.tempID, editFormDetails) ||
                                                !data.allowAdd
                                            "
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].max
                                                    : ''
                                            "
                                        />
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
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
                                        :disabled="loading.isDisabled()"
                                        :on-click="async () => await saveAddOrEditMatrix(index)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    formTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: formTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
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
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
                                        container-class="mt-[0.5rem]"
                                        loader-type="table"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.name),
                                                    module: 'Matrices',
                                                    page: 'Assign Matrices',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Assign Forms & Folders'"
                                            icon="form-fields"
                                            class="stroke-[var(--color-secondary)] !w-[1.7rem] !h-[1.7rem]"
                                            :class="`${commonActionIconClasses('Fields')} stroke-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-delete-confirmation
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            data.id &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this matrix?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteMatrixById(String(data.id));
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
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
