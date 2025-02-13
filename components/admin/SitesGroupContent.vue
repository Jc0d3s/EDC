<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createSiteGroupAPI,
        deleteSiteGroupAPI,
        siteGroupPaginationListAPI,
        updateSiteGroupAPI,
    } from "~/services/apis/handlers/admin/site-group";
    import type { ISiteGroupData } from "~/services/apis/handlers/types/admin/site-group-types";
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
        siteGroupName: TNullableString;
        siteDescription: TNullableString;
        assignedSites: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteDescription: string;
        siteGroupName: string;
        assignedSites: string;
    }

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const siteGroupSearch = ref<TNullableString>(null);
    const siteGroupColumns: IColumn[] = [
        {
            field: "siteGroupName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "siteDescription",
            header: "Description",
            icon: false,
            show: true,
        },
        {
            field: "assignedSites",
            header: "Assigned Sites",
            icon: false,
            show: true,
        },
    ];
    const siteGroupTableData = ref<ITableData[]>([]);
    const siteGroupTableDataRef = ref<ITableData[]>(deepClone(siteGroupTableData.value));
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const loading = ref<Loading>(new Loading());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        siteDescription: "",
        siteGroupName: "",
        assignedSites: "",
    });

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

    function addOrEditSiteGroupAction() {
        const tempID = uniqueID();
        siteGroupTableData.value.unshift({
            id: null,
            siteDescription: null,
            siteGroupName: null,
            assignedSites: null,
            tempID,
        });
        editForm(tempID);
    }

    function setTableData(tableData: ISiteGroupData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            siteDescription: row.siteDescription,
            siteGroupName: row.siteGroupName,
            assignedSites: row.assignedSites,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function siteGroupPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await siteGroupPaginationListAPI(
            getAPIFilters({
                search: siteGroupSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            siteGroupTableData.value = deepClone(tableData);
            siteGroupTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            siteGroupTableData.value = [];
            siteGroupTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of siteGroupTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.siteGroupName) === 0)
                    obj["siteGroupName"] = "Please enter a name";
                else obj["siteGroupName"] = "";
                if (tableRow.siteDescription && getStringLength(tableRow.siteDescription) > 256)
                    obj["siteDescription"] = "Description cannot be more than 256 characters";
                else obj["siteDescription"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditSiteGroup(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            loading.value.form = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: siteGroupTableData.value[rowIndex].id || 0,
                siteDescription: siteGroupTableData.value[rowIndex].siteDescription,
                siteGroupName: siteGroupTableData.value[rowIndex].siteGroupName,
                assignedSites: siteGroupTableData.value[rowIndex].assignedSites,
                trialId: 0,
                siteId: 0,
                updatedBy: 0,
            };
            if (!siteGroupTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createSiteGroupAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateSiteGroupAPI(requestData);
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
                await siteGroupPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        siteGroupTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(siteGroupTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        siteGroupTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteSiteGroupById(siteGroupId: string) {
        loading.value.form = true;
        const { status, message } = await deleteSiteGroupAPI(siteGroupId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await siteGroupPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        siteGroupTableData.value,
        siteGroupTableDataRef.value,
    );

    watch(
        () => siteGroupTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = siteGroupTableDataRef.value;
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
                siteGroupTableData.value = deepClone(siteGroupTableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await siteGroupPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Sites Group">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="siteGroupSearch"
                            element-id="siteGroupSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteGroupPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#siteGroupSearch');
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditSiteGroupAction()"
                            :disabled="loading.isDisabled()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Site Group</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="siteGroupColumns"
                            :table-data="siteGroupTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="siteGroupSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[25rem]"
                                >
                                    <edc-text-input
                                        :key="`siteGroupName-${data.tempID}`"
                                        v-model="data.siteGroupName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteGroupName
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`siteDescription-${data.tempID}`"
                                        v-model="data.siteDescription"
                                        placeholder="Enter description"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteDescription
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`assignedSites-${data.tempID}`"
                                        v-model="data.assignedSites"
                                        placeholder="Enter description"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].assignedSites
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
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
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
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditSiteGroup(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <!-- <edc-pressable
                                    v-if="isEditable(index, editFormDetails)"
                                    v-tooltip.top="'Cancel'"
                                    :container-class="
                                        !isEditable(index, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
                                    :on-click="() => resetFormModel()"
                                >
                                    <edc-icon
                                        icon="circle-close"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable> -->
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                siteGroupTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: siteGroupTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                siteGroupTableData[index] = deepClone(
                                                    siteGroupTableDataRef[index],
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
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this site group?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteSiteGroupById(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :disabled="loading.isDisabled()"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[1rem]'
                                                    : ''
                                            "
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
