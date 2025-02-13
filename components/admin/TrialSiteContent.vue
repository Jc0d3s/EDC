<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { deleteSiteByIdAPI } from "~/services/apis/handlers/admin/site";
    import {
        trialSitePaginationListAPI,
        updateTrialSiteAPI,
    } from "~/services/apis/handlers/admin/trial-site";
    import type { ITrialSiteData } from "~/services/apis/handlers/types/admin/trial-site-types";
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
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        trialId: number;
        trialSiteId: number;
        siteId: number;
        isAssigned: boolean;
        hospitalId: number;
        siteName: string;
        siteNumber: string;
        siteGroupId: TNullableNumber;
        siteGroupName: TNullableString;
        notes: TNullableString;
        addressLine1: TNullableString;
        addressLine2: TNullableString;
        addressLine3: TNullableString;
        address: TNullableString;
        city: TNullableString;
        state: TNullableString;
        country: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        trialId: string;
        trialSiteId: string;
        siteId: string;
        isAssigned: string;
        hospitalId: string;
        siteName: string;
        siteNumber: string;
        siteGroupId: string;
        notes: string;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        address: string;
        city: string;
        state: string;
        country: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    // const popupModalStore = usePopupModalStore();
    // const newRowsList = ref<number[]>([]);
    // const trialSiteFormModel = ref<TrialSite>(new TrialSite());
    // const trialSiteFormModelRef = ref<TrialSite>(new TrialSite());
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});

    const trialSiteSearch = ref<TNullableString>(null);
    const trialSiteColumns: IColumn[] = [
        {
            field: "siteName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "siteNumber",
            header: "Site Number",
            icon: false,
            show: true,
        },
        {
            field: "address",
            header: "Address",
            icon: false,
            show: true,
        },
        {
            field: "isIncluded",
            header: "Assigned",
            icon: false,
            show: true,
        },
    ];
    const trialSiteTableData = ref<ITableData[]>([]);
    const trialSiteTableDataRef = ref<ITableData[]>(deepClone(trialSiteTableData.value));
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Trial Sites - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Trial Sites",
    );

    function getSiteAddress(rowData: ITableData | ITrialSiteData) {
        let address = "";
        if (rowData.addressLine1) address += rowData.addressLine1;
        if (rowData.addressLine2 && address.length > 0) address += ` ${rowData.addressLine2}`;
        else if (rowData.addressLine2) address += rowData.addressLine2;
        if (rowData.addressLine3 && address.length > 0) address += ` ${rowData.addressLine3}`;
        else if (rowData.addressLine3) address += rowData.addressLine3;
        if (rowData.city && address.length > 0) address += ` ${rowData.city}`;
        else if (rowData.city) address += rowData.city;
        if (rowData.state && address.length > 0) address += ` ${rowData.state}`;
        else if (rowData.state) address += rowData.state;
        if (rowData.country && address.length > 0) address += ` ${rowData.country}`;
        else if (rowData.country) address += rowData.country;
        return address;
    }

    function setTableData(tableData: ITrialSiteData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            trialId: row.trialId,
            trialSiteId: row.trialSiteId,
            siteId: row.siteId,
            isAssigned: row.isAssigned,
            hospitalId: row.hospitalId,
            siteName: row.siteName,
            siteNumber: row.siteNumber,
            siteGroupId: row.siteGroupId,
            siteGroupName: row.siteGroupName,
            notes: row.notes,
            addressLine1: row.addressLine1,
            addressLine2: row.addressLine2,
            addressLine3: row.addressLine3,
            address: getSiteAddress(row),
            city: row.city,
            state: row.state,
            country: row.country,
            updatedBy: row.updatedBy,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function trialSitesPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await trialSitePaginationListAPI(
            getAPIFilters({
                search: trialSiteSearch.value,
                filter: {
                    trialId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            trialSiteTableData.value = deepClone(tableData);
            trialSiteTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            trialSiteTableData.value = [];
            trialSiteTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetFormModel() {
        trialSiteTableData.value = deepClone(trialSiteTableDataRef.value);
    }

    function getRequestData(tableData: ITableData[]): ITrialSiteData[] {
        const result: ITrialSiteData[] = [];
        for (const row of tableData) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { address, tempID, ...rest } = row;
            const obj = { ...rest };
            result.push({
                ...obj,
                updatedBy: 0,
                id: obj.id || 0,
            });
        }
        return result;
    }

    async function updateTrialSiteAssign() {
        // const requestData = {
        //     id: trialSiteTableData.value[rowIndex].id || 0,
        //     siteGroupId: props.tabData[props.activeTab.label].data.id as number,
        //     siteName: trialSiteTableData.value[rowIndex].siteName as string,
        //     siteNumber: trialSiteTableData.value[rowIndex].siteNumber,
        //     notes: trialSiteTableData.value[rowIndex].notes,
        //     address: trialSiteTableData.value[rowIndex].address,
        //     isAssigned: trialSiteTableData.value[rowIndex].isActive,
        //     updatedBy: 0,
        // };
        const {
            message,
            status,
            // validationErrors: apiValidationErrors,
        } = await updateTrialSiteAPI(getRequestData(trialSiteTableData.value));

        if (status === 200) {
            await trialSitesPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            // if (status === 400 && apiValidationErrors) {
            //     setDefaultValueByKeyIfKeyDoesNotExists(
            //         trialSiteTableData.value[rowIndex].tempID,
            //         validationErrors.value,
            //         defaultValidationErrors(trialSiteTableData.value[rowIndex].tempID),
            //     );
            //     setAPIValidationErrors(
            //         apiValidationErrors,
            //         validationErrors.value,
            //         trialSiteTableData.value[rowIndex].tempID,
            //     );
            // }
        }
        loading.value.form = false;
    }

    async function deleteTrialSite(trialSiteId: string) {
        loading.value.form = true;
        const { status, message } = await deleteSiteByIdAPI(trialSiteId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await trialSitesPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        trialSiteTableData.value,
        trialSiteTableDataRef.value,
    );

    watch(
        () => trialSiteTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = trialSiteTableDataRef.value;
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
                trialSiteTableData.value = deepClone(trialSiteTableDataRef.value);
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await trialSitesPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="trialSiteSearch"
                            element-id="trialSiteSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await trialSitesPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#trialSiteSearch');
                                }
                            "
                        />
                        <!-- <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditTrialSiteAction()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Site</span>
                        </edc-pressable> -->
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => updateTrialSiteAssign()"
                        >
                            <edc-icon
                                icon="save"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Save</span>
                        </edc-pressable>
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => resetFormModel()"
                        >
                            <edc-icon
                                icon="undo"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Reset</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="trialSiteColumns"
                            :table-data="trialSiteTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="trialSiteSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            action-row-class="min-w-[12rem] max-w-[12rem]"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        v-model="data.siteName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteName
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-text-input
                                        v-model="data.siteNumber"
                                        type="text"
                                        placeholder="Enter number *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteNumber
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        v-model="data.address"
                                        placeholder="Enter address"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].address
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        v-model="data.isAssigned"
                                        v-tooltip.top="'Assign'"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :checked="data.isAssigned"
                                        name="isAssigned"
                                        :disabled="loading.isDisabled()"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isAssigned
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <!-- <edc-pressable
                                    v-if="!isEditable(data.tempID, editFormDetails)"
                                    v-tooltip.top="'Update'"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[0.5rem]' : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => editForm(data.tempID)"
                                >
                                    <edc-icon
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        class="h-[1.5rem]"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    v-tooltip.top="'Save'"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[0.5rem]' : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => saveAddOrEditTrialSite(index)"
                                >
                                    <edc-icon
                                        icon="save"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    v-tooltip.top="'Reset'"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails) ? 'mt-[0.5rem]' : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                trialSiteTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: trialSiteTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                trialSiteTableData[index] = deepClone(
                                                    trialSiteTableDataRef[index],
                                                );
                                            editForm(data.tempID);
                                            deleteObjectPropertyByKey(
                                                data.tempID,
                                                validationErrors,
                                            );
                                        }
                                    "
                                >
                                    <edc-icon
                                        icon="undo"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable> -->
                                <edc-delete-confirmation
                                    v-if="!isEditable(data.tempID, editFormDetails) && data.id"
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this site?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {
                                            tableLoaderDetails[index] = true;
                                            deleteTrialSite(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
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
                <!-- </div> -->
            </template>
        </admin-card-wrapper>
    </div>
    <!-- <edc-popup-modal
        :submit-label="formAction"
        @on-cancel="(closeModal) => resetFormModel(closeModal)"
        @on-submit="(closeModal) => addOrEditTrialSiteApi(closeModal)"
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>) are
            required</span
        >
        <div class="grid grid-cols-2 gap-x-[5rem] gap-y-[1rem]">
            <edc-text-input
                v-model="trialSiteFormModel.siteName"
                
                type="text"
                placeholder="Enter name"
                label="Name"
                label-class="font-bold"
                :error="trialSiteErrorModel.siteName"
            />
            <edc-text-input
                v-model="trialSiteFormModel.siteNumber"
                
                type="text"
                placeholder="Enter number"
                label="Site Number"
                label-class="font-bold"
                :error="trialSiteErrorModel.siteNumber"
            />
            <edc-text-area
                v-model="trialSiteFormModel.address"
                
                placeholder="Enter address"
                label="Address"
                label-class="font-bold"
                :error="trialSiteErrorModel.address"
            />
            <edc-text-area
                v-model="trialSiteFormModel.notes"
                
                placeholder="Enter notes"
                label="Notes"
                label-class="font-bold"
                :error="trialSiteErrorModel.notes"
            />
        </div>
    </edc-popup-modal> -->
</template>

<style scoped></style>
