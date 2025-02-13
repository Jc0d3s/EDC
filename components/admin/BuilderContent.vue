<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createTrialGroupAPI,
        updateTrialGroupAPI,
        trialGroupPaginationListAPI,
        deleteTrialGroupByIdAPI,
    } from "~/services/apis/handlers/admin/trial-group";
    import type { ITrialGroupData } from "~/services/apis/handlers/types/admin/trial-group-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        trialGroupName: TNullableString;
        trialType: string;
        trialSummary: TNullableString;
        trialDescription: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        trialGroupName: string;
        trialType: string;
        trialSummary: string;
        trialDescription: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        trialDescription: "",
        trialGroupName: "",
        trialSummary: "",
        trialType: "",
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();
    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const trialGroupSearch = ref<TNullableString>(null);
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const editFormDetails = ref<TEditFormDetail>({});
    const tableLoaderDetails = ref<TTableLoaderDetail>({});
    const trialGroupColumns: IColumn[] = [
        {
            field: "trialGroupName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "trialType",
            header: "Type",
            icon: false,
            show: true,
        },
        {
            field: "trialSummary",
            header: "Summary",
            icon: false,
            show: true,
        },
        {
            field: "trialDescription",
            header: "Description",
            icon: false,
            show: true,
        },
    ];
    const trialGroupTableData = ref<ITableData[]>([]);
    const trialGroupTableDataRef = ref<ITableData[]>(deepClone(trialGroupTableData));

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    function setTableData(tableData: ITrialGroupData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            trialDescription: row.trialDescription,
            trialGroupName: row.trialGroupName,
            trialSummary: row.trialSummary,
            trialType: row.trialType,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function trialGroupList() {
        loading.value.table = true;
        const { data, status, message } = await trialGroupPaginationListAPI(
            getAPIFilters({
                search: trialGroupSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            trialGroupTableData.value = deepClone(tableData);
            trialGroupTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            trialGroupTableData.value = [];
            trialGroupTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
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

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of trialGroupTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (!tableRow.trialGroupName) obj["trialGroupName"] = "Please enter a name";
                else if (getStringLength(tableRow.trialGroupName) > 50)
                    obj["trialGroupName"] = "Name cannot be more than 50 characters";
                else obj["trialGroupName"] = "";

                if (tableRow.trialType && getStringLength(tableRow.trialType) > 128)
                    obj["trialType"] = "Type cannot be more than 128 characters";
                else obj["trialType"] = "";

                if (tableRow.trialSummary && getStringLength(tableRow.trialSummary) > 128)
                    obj["trialSummary"] = "Summary cannot be more than 128 characters";
                else obj["trialSummary"] = "";

                if (tableRow.trialDescription && getStringLength(tableRow.trialDescription) > 128)
                    obj["trialDescription"] = "Description cannot be more than 128 characters";
                else obj["trialDescription"] = "";
                // result.push(obj);
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    // async function createOrUpdateTrialGroup(closeModal: TVoidAction) {
    async function createOrUpdateTrialGroup(rowIndex: number) {
        loading.value.form = true;
        let status = 500;
        let message = "";
        let validationErrorsData = null;
        const requestData = {
            id: trialGroupTableData.value[rowIndex].id || 0,
            trialDescription: trialGroupTableData.value[rowIndex].trialDescription,
            trialGroupName: trialGroupTableData.value[rowIndex].trialGroupName || "",
            trialSummary: trialGroupTableData.value[rowIndex].trialSummary || "",
            trialType: trialGroupTableData.value[rowIndex].trialType,
        };
        if (!trialGroupTableData.value[rowIndex].id) {
            const {
                status: apiStatus,
                message: apiMessage,
                validationErrors: apiValidationErrors,
            } = await createTrialGroupAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            validationErrorsData = apiValidationErrors;
        } else {
            const {
                status: apiStatus,
                message: apiMessage,
                validationErrors: apiValidationErrors,
            } = await updateTrialGroupAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            validationErrorsData = apiValidationErrors;
        }
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            resetEditFormDetails();
            await trialGroupList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            if (status === 400 && validationErrorsData) {
                setDefaultValueByKeyIfKeyDoesNotExists(
                    trialGroupTableData.value[rowIndex].tempID,
                    validationErrors.value,
                    defaultValidationErrors(trialGroupTableData.value[rowIndex].tempID),
                );
                setAPIValidationErrors(
                    validationErrorsData,
                    validationErrors.value,
                    trialGroupTableData.value[rowIndex].tempID,
                );
            }
        }
        loading.value.form = false;
    }

    function editForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editFormDetails.value))
            editFormDetails.value[rowIndex] = true;
        else editFormDetails.value[rowIndex] = !editFormDetails.value[rowIndex];
    }

    function addOrEditTrialGroupAction() {
        const tempID = uniqueID();
        trialGroupTableData.value.unshift({
            id: null,
            trialDescription: null,
            trialGroupName: null,
            trialSummary: null,
            trialType: "Default",
            tempID,
        });
        editForm(tempID);
        // setTimeout(() => {
        //     scrollToNewlyCreatedRow();
        // }, 10);
    }

    async function addOrEditTrialGroupApi(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            await createOrUpdateTrialGroup(rowIndex);
        }
    }

    async function deleteTrialGroupById(trialGroupId: number) {
        loading.value.form = true;
        const { status, message } = await deleteTrialGroupByIdAPI(trialGroupId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await trialGroupList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        trialGroupTableData.value,
        trialGroupTableDataRef.value,
    );

    watch(
        () => trialGroupTableData.value,
        (newModel) => {
            model.value = newModel;
            modelRef.value = trialGroupTableDataRef.value;
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
                trialGroupTableData.value = deepClone(trialGroupTableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await trialGroupList();
    });
</script>

<template>
    <!-- <div class="flex flex-row w-fit gap-[5rem]"> -->
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Trial Groups">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="w-fit flex flex-row items-center gap-[1rem]">
                            <edc-search-bar
                                v-model="trialGroupSearch"
                                element-id="trialGroupSearch"
                                :disabled="loading.isDisabled(disableAction)"
                                input-class="admin-input-font"
                                @on-search="
                                    async () => {
                                        await trialGroupList();
                                        useGlobalStore().triggerSearchBarRefocus(
                                            '#trialGroupSearch',
                                        );
                                    }
                                "
                            />
                            <edc-pressable
                                v-if="!disableAction"
                                container-class="!justify-start"
                                slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                :disabled="loading.isDisabled()"
                                :on-click="() => addOrEditTrialGroupAction()"
                            >
                                <edc-icon
                                    icon="circle-plus"
                                    :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                />
                                <span class="text-[1.3rem] secondary-text">Add Trial Group</span>
                            </edc-pressable>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="trialGroupColumns"
                                :table-data="trialGroupTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="trialGroupSearch"
                                :enable-row-click="false"
                                table-style="outlined"
                                :custom-content="true"
                                action-row-class="min-w-[12rem] max-w-[12rem]"
                            >
                                <!-- @on-row-click="
                                    (selectedRow) => {
                                        emit('on-row-select', {
                                            label: selectedRow.trialGroupName as string,
                                            module: 'Trial Group',
                                            page: 'Trial Group',
                                            data: selectedRow,
                                        });
                                    }
                                " -->
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-text-input
                                            :key="`name-${data.tempID}`"
                                            v-model="data.trialGroupName"
                                            type="text"
                                            placeholder="Enter name *"
                                            input-class="admin-input-font"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].trialGroupName
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`trialType-${data.tempID}`"
                                            v-model="data.trialType"
                                            container-class="w-[10rem]"
                                            placeholder="Select a type"
                                            option-placement="bottom"
                                            option-class="w-[10rem]"
                                            :options="[
                                                {
                                                    label: 'Default',
                                                    value: 'Default',
                                                },
                                            ]"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].trialType
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-text-area
                                            :key="`description-${data.tempID}`"
                                            v-model="data.trialDescription"
                                            placeholder="Enter description"
                                            label-class="admin-input-font"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].trialDescription
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-text-area
                                            :key="`summary-${data.tempID}`"
                                            v-model="data.trialSummary"
                                            placeholder="Enter summary"
                                            label-class="admin-input-font"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].trialSummary
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
                                        :on-click="async () => await addOrEditTrialGroupApi(index)"
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
                                                    trialGroupTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: trialGroupTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    trialGroupTableData[index] = deepClone(
                                                        trialGroupTableDataRef[index],
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
                                            !disableAction
                                        "
                                        loader-type="table"
                                        :disabled="loading.isDisabled()"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: data.trialGroupName as string,
                                                    module: 'Trial Group',
                                                    page: 'Trial Group',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Go to Trial'"
                                            icon="circle-play"
                                            :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-delete-confirmation
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this trial group?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteTrialGroupById(Number(data.id));
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
                                                :show-loader="tableLoaderDetails[index]"
                                                :disabled="loading.isDisabled()"
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
