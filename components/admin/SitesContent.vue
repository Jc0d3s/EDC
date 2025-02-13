<script setup lang="ts">
    import Site from "~/services/apis/data/admin/site";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createSiteAPI,
        deleteSiteByIdAPI,
        sitePaginationListAPI,
        updateSiteAPI,
    } from "~/services/apis/handlers/admin/site";
    import { siteGroupListAPI } from "~/services/apis/handlers/admin/site-group";
    import type { ISiteData } from "~/services/apis/handlers/types/admin/site-types";
    import useGlobalStore from "~/stores/global";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TAdminFormAction,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        trialId: number;
        siteGroupId: TNullableNumber;
        siteName: TNullableString;
        siteNumber: TNullableString;
        notes: TNullableString;
        addressLine1: TNullableString;
        addressLine2: TNullableString;
        addressLine3: TNullableString;
        city: TNullableString;
        country: TNullableString;
        postalCode: TNullableString;
        state: TNullableString;
        telephone: TNullableString;
        investigators: TNullableString;
        therapeuticArea: TNullableString;
        isActive: boolean;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteName: string;
        siteNumber: string;
        siteGroupId: string;
        notes: string;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        city: string;
        country: string;
        postalCode: string;
        state: string;
        telephone: string;
        isActive: string;
        therapeuticArea: string;
        investigators: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        siteGroupId: "",
        notes: "",
        siteName: "",
        siteNumber: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        country: "",
        postalCode: "",
        state: "",
        telephone: "",
        isActive: "",
        investigators: "",
        therapeuticArea: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const formAction = ref<TAdminFormAction>("View");
    const formModel = ref<Site>(new Site());
    const formModelRef = ref<Site>(new Site());
    const errorModel = ref<IValidationError>({ ...defaultValidationErrors("formModel") });
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const filterModel = ref<{
        search: TNullableString;
        siteGroupId: TNullableNumber;
    }>({
        search: null,
        siteGroupId: null,
    });
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
            field: "siteGroupId",
            header: "Site Group",
            icon: false,
            show: true,
        },
        {
            field: "notes",
            header: "Notes",
            icon: false,
            show: true,
        },
        {
            field: "therapeuticAreas",
            header: "Therapeutic area",
            icon: false,
            show: true,
        },
        {
            field: "investigators",
            header: "Investigators",
            icon: false,
            show: true,
        },
    ];
    const trialSiteTableData = ref<ITableData[]>([]);
    const trialSiteTableDataRef = ref<ITableData[]>(deepClone(trialSiteTableData.value));
    const siteGroupOptions = ref<DropdownOption>(new DropdownOption());

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const siteGroupLookups = computed(() =>
        getOptionsList(siteGroupOptions.value.options, "siteGroupName", "id"),
    );

    async function siteGroupList() {
        siteGroupOptions.value.loading = true;
        const { status, data, message } = await siteGroupListAPI();
        if (status === 200) {
            siteGroupOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            siteGroupOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        siteGroupOptions.value.loading = false;
    }

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

    function addOrEditTrialSiteAction() {
        const tempID = uniqueID();
        trialSiteTableData.value.unshift({
            id: null,
            trialId: 0,
            siteGroupId: null,
            notes: null,
            siteName: null,
            siteNumber: null,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            city: null,
            country: null,
            postalCode: null,
            state: null,
            telephone: null,
            investigators: null,
            therapeuticArea: null,
            isActive: true,
            tempID,
        });
        editForm(tempID);
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of trialSiteTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.siteName) === 0)
                    obj["siteName"] = "Please enter a name";
                else if (getStringLength(tableRow.siteName) > 128)
                    obj["siteName"] = "Name cannot be more than 128 characters";
                else obj["siteName"] = "";
                if (getStringLength(tableRow.siteNumber) === 0)
                    obj["siteNumber"] = "Please enter a number";
                else if (getStringLength(tableRow.siteNumber) > 256)
                    obj["siteNumber"] = "Number cannot be more than 256 characters";
                else obj["siteNumber"] = "";
                if (tableRow.notes && getStringLength(tableRow.notes) > 256)
                    obj["notes"] = "Notes cannot be more than 256 characters";
                else obj["notes"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableData: ISiteData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            trialId: row.trialId,
            siteGroupId: row.siteGroupId,
            notes: row.notes,
            siteName: row.siteName,
            siteNumber: row.siteNumber,
            addressLine1: row.addressLine1,
            addressLine2: row.addressLine2,
            addressLine3: row.addressLine3,
            city: row.city,
            country: row.country,
            postalCode: row.postalCode,
            state: row.state,
            telephone: row.telephone,
            isActive: row.isActive,
            investigators: row.investigators,
            therapeuticArea: row.therapeuticArea,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function sitePaginationList() {
        loading.value.table = true;
        const { status, data, message } = await sitePaginationListAPI(
            getAPIFilters({
                search: filterModel.value.search,
                filter: {
                    siteGroupId: filterModel.value.siteGroupId as number,
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

    async function saveAddOrEditTrialSite(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: trialSiteTableData.value[rowIndex].id || 0,
                trialId: 0,
                siteGroupId: trialSiteTableData.value[rowIndex].siteGroupId,
                siteName: trialSiteTableData.value[rowIndex].siteName as string,
                siteNumber: trialSiteTableData.value[rowIndex].siteNumber,
                notes: trialSiteTableData.value[rowIndex].notes,
                addressLine1: trialSiteTableData.value[rowIndex].addressLine1,
                addressLine2: trialSiteTableData.value[rowIndex].addressLine2,
                addressLine3: trialSiteTableData.value[rowIndex].addressLine3,
                city: trialSiteTableData.value[rowIndex].city,
                country: trialSiteTableData.value[rowIndex].country,
                postalCode: trialSiteTableData.value[rowIndex].postalCode,
                state: trialSiteTableData.value[rowIndex].state,
                telephone: trialSiteTableData.value[rowIndex].telephone,
                isActive: trialSiteTableData.value[rowIndex].isActive,
                investigators: trialSiteTableData.value[rowIndex].investigators,
                therapeuticArea: trialSiteTableData.value[rowIndex].therapeuticArea,
                updatedBy: 0,
            };
            if (!trialSiteTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createSiteAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateSiteAPI(requestData);
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
                await sitePaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        trialSiteTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(trialSiteTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        trialSiteTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    // function getTableDataItemByIndex(tempID: string) {
    //     const index = getIndexOfTheItem({
    //         data: trialSiteTableDataRef.value,
    //         type: "object",
    //         value: tempID,
    //         key: "tempID",
    //     });
    //     return returnNullIfIndexDoesNotExist(index, trialSiteTableDataRef.value);
    // }

    // FIXME: For reference
    // function checkIfItemSameAsRefDataByKey(key: string, value: any) {
    //     return checkIfItemExists({
    //         data: trialSiteTableDataRef.value,
    //         type: "object",
    //         value,
    //         key,
    //     });
    // }

    // function checkIfDataChanged(data: ITableData) {
    //     console.log("data", data);
    //     console.log("trialSiteTableDataRef.value", trialSiteTableDataRef.value);
    //     return !(
    //         !checkIfItemSameAsRefDataByKey("address", data.address) ||
    //         !checkIfItemSameAsRefDataByKey("isIncluded", data.isIncluded) ||
    //         !checkIfItemSameAsRefDataByKey("notes", data.notes) ||
    //         !checkIfItemSameAsRefDataByKey("siteName", data.siteName) ||
    //         !checkIfItemSameAsRefDataByKey("siteNumber", data.siteNumber) ||
    //         !checkIfItemSameAsRefDataByKey("tempID", data.tempID)
    //     );
    // }
    // FIXME: For reference

    async function deleteSiteById(siteId: string) {
        loading.value.form = true;
        const { status, message } = await deleteSiteByIdAPI(siteId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await sitePaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function showDetails(data: ITableData) {
        formModel.value.id = data.id;
        formModel.value.siteGroupId = data.siteGroupId;
        formModel.value.siteName = data.siteName;
        formModel.value.siteNumber = data.siteNumber;
        formModel.value.notes = data.notes;
        formModel.value.addressLine1 = data.addressLine1;
        formModel.value.addressLine2 = data.addressLine2;
        formModel.value.addressLine3 = data.addressLine3;
        formModel.value.city = data.city;
        formModel.value.country = data.country;
        formModel.value.postalCode = data.postalCode;
        formModel.value.state = data.state;
        formModel.value.telephone = data.telephone;
        formModel.value.isActive = data.isActive;

        formModelRef.value.id = data.id;
        formModelRef.value.siteGroupId = data.siteGroupId;
        formModelRef.value.siteName = data.siteName;
        formModelRef.value.siteNumber = data.siteNumber;
        formModelRef.value.notes = data.notes;
        formModelRef.value.addressLine1 = data.addressLine1;
        formModelRef.value.addressLine2 = data.addressLine2;
        formModelRef.value.addressLine3 = data.addressLine3;
        formModelRef.value.city = data.city;
        formModelRef.value.country = data.country;
        formModelRef.value.postalCode = data.postalCode;
        formModelRef.value.state = data.state;
        formModelRef.value.telephone = data.telephone;
        formModelRef.value.isActive = data.isActive;

        formAction.value = "Update";
        popupModalStore.show("adminSiteDetailModal");
    }

    function resetFormModel(closeModal?: TVoidAction) {
        formModel.value = new Site();
        formModelRef.value = new Site();
        if (closeModal) closeModal();
    }

    function validateDetails() {
        if (getStringLength(formModel.value.siteName) === 0)
            errorModel.value.siteName = "Please enter a name";
        else if (getStringLength(formModel.value.siteName) > 256)
            errorModel.value.siteName = "Name cannot be more than 256 characters";
        else errorModel.value.siteName = "";
        if (getStringLength(formModel.value.siteNumber) === 0)
            errorModel.value.siteNumber = "Please enter a number";
        else if (getStringLength(formModel.value.siteNumber) > 256)
            errorModel.value.siteNumber = "Number cannot be more than 256 characters";
        else errorModel.value.siteNumber = "";
        if (formModel.value.notes && getStringLength(formModel.value.notes) > 256)
            errorModel.value.notes = "Notes cannot be more than 256 characters";
        if (formModel.value.addressLine1 && getStringLength(formModel.value.addressLine1) > 256)
            errorModel.value.addressLine1 = "Address cannot be more than 256 characters";
        else errorModel.value.addressLine1 = "";
        if (formModel.value.addressLine2 && getStringLength(formModel.value.addressLine2) > 256)
            errorModel.value.addressLine2 = "Address cannot be more than 256 characters";
        else errorModel.value.addressLine2 = "";
        if (formModel.value.addressLine3 && getStringLength(formModel.value.addressLine3) > 256)
            errorModel.value.addressLine3 = "Address cannot be more than 256 characters";
        else errorModel.value.addressLine3 = "";
        if (formModel.value.city && getStringLength(formModel.value.city) > 256)
            errorModel.value.city = "City cannot be more than 256 characters";
        else errorModel.value.city = "";
        if (formModel.value.state && getStringLength(formModel.value.state) > 256)
            errorModel.value.state = "State cannot be more than 256 characters";
        else errorModel.value.state = "";
        if (formModel.value.country && getStringLength(formModel.value.country) > 256)
            errorModel.value.country = "Country cannot be more than 256 characters";
        else errorModel.value.country = "";
        if (formModel.value.postalCode && getStringLength(formModel.value.postalCode) > 256)
            errorModel.value.postalCode = "Postal code cannot be more than 256 characters";
        else errorModel.value.postalCode = "";
        if (formModel.value.telephone && getStringLength(formModel.value.telephone) > 256)
            errorModel.value.telephone = "Telephone cannot be more than 256 characters";
        else errorModel.value.telephone = "";
    }

    async function saveDetails(closeModal: TVoidAction) {
        validateDetails();
        if (!checkIfModelHasErrors(errorModel.value, ["index"])) {
            loading.value.form = true;
            const {
                message,
                status,
                validationErrors: apiValidationErrors,
            } = await updateSiteAPI({
                id: formModel.value.id || 0,
                trialId: 0,
                siteGroupId: formModel.value.siteGroupId,
                siteName: formModel.value.siteName as string,
                siteNumber: formModel.value.siteNumber,
                notes: formModel.value.notes,
                addressLine1: formModel.value.addressLine1,
                addressLine2: formModel.value.addressLine2,
                addressLine3: formModel.value.addressLine3,
                city: formModel.value.city,
                country: formModel.value.country,
                postalCode: formModel.value.postalCode,
                state: formModel.value.state,
                telephone: formModel.value.telephone,
                isActive: formModel.value.isActive,
                investigators: null,
                therapeuticArea: null,
                updatedBy: 0,
            });
            if (status === 200) {
                resetFormModel(closeModal);
                formAction.value = "View";
                toastStore.success({
                    title: "Success",
                    message,
                });
                await sitePaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && apiValidationErrors) {
                    setAPIValidationErrors(apiValidationErrors, errorModel.value);
                }
            }
            loading.value.form = false;
        }
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        trialSiteTableData.value,
        trialSiteTableDataRef.value,
    );

    useUnsavedAlert(formModel.value, formModelRef.value);

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
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
                popupModalStore.hide("adminSiteDetailModal");
            }
        },
    );

    onMounted(() => {
        // await trialSiteGroupList();
        const { queryData } = props.tabData[props.activeTab.label];
        if (queryData) {
            const { filter, search } = queryData;
            if (search) filterModel.value.search = search;
            if (filter && filter.siteGroupId) filterModel.value.siteGroupId = filter.siteGroupId;
        }
        // await siteList();
        Promise.all([sitePaginationList(), siteGroupList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Sites">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="filterModel.search"
                            element-id="siteSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled(disableAction)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await sitePaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#siteSearch');
                                }
                            "
                        />
                        <edc-dropdown
                            :key="
                                filterModel.siteGroupId
                                    ? `siteGroup-${filterModel.siteGroupId}`
                                    : 'siteGroup'
                            "
                            v-model="filterModel.siteGroupId"
                            default-value="Site group"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(disableAction)"
                            :options="siteGroupLookups"
                            :loading="siteGroupOptions.loading"
                            @on-select="
                                async () => {
                                    await sitePaginationList();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await sitePaginationList();
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditTrialSiteAction()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Site</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="trialSiteColumns"
                            :table-data="trialSiteTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="siteSearch"
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
                                        :key="`siteName-${data.tempID}`"
                                        v-model="data.siteName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
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
                                        :key="`siteNumber-${data.tempID}`"
                                        v-model="data.siteNumber"
                                        type="text"
                                        placeholder="Enter number *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteNumber
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-dropdown
                                        :key="`siteGroup-${data.tempID}`"
                                        v-model="data.siteGroupId"
                                        container-class="w-[20rem]"
                                        :options="siteGroupLookups"
                                        :default-value="
                                            isEditable(data.tempID, editFormDetails)
                                                ? 'Site group'
                                                : 'No Site group'
                                        "
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[20rem]"
                                        :disabled="loading.isDisabled()"
                                        :loading="siteGroupOptions.loading"
                                        :enable-clear="true"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteGroupId
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`notes-${data.tempID}`"
                                        v-model="data.notes"
                                        placeholder="Enter notes"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].notes
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`therapeuticArea-${data.tempID}`"
                                        v-model="data.therapeuticArea"
                                        placeholder="Enter therapeuticArea"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :ellipse-count="15"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].therapeuticArea
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`investigators-${data.tempID}`"
                                        v-model="data.investigators"
                                        placeholder="Enter investigators"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :ellipse-count="15"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].investigators
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
                                        :class="commonActionIconClasses('Update')"
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
                                    :on-click="async () => await saveAddOrEditTrialSite(index)"
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
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            showDetails(data);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Details'"
                                        icon="eye"
                                        :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: String(data.siteName),
                                                module: 'Sites',
                                                page: 'Site Entries',
                                                data,
                                            });
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Site Entries'"
                                        icon="circle-play"
                                        :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) &&
                                        data.id &&
                                        !disableAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this site?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteSiteById(String(data.id));
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
    <edc-popup-modal
        v-if="formAction !== 'View'"
        modal-id="adminSiteDetailModal"
        :on-cancel="(closeModal) => resetFormModel(closeModal)"
        :on-submit="async (closeModal) => await saveDetails(closeModal)"
    >
        <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
            <edc-text-input
                v-model="formModel.addressLine1"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter address line 1"
                label="Address line 1"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.addressLine1"
            />
            <edc-text-input
                v-model="formModel.addressLine2"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter address line 2"
                label="Address line 2"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.addressLine2"
            />
            <edc-text-input
                v-model="formModel.addressLine3"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter address line 3"
                label="Address line 3"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.addressLine3"
            />
            <edc-text-input
                v-model="formModel.city"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter city"
                label="City"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.city"
            />
            <edc-text-input
                v-model="formModel.state"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter state"
                label="State"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.state"
            />
            <edc-text-input
                v-model="formModel.postalCode"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter postal code"
                label="Postal code"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.postalCode"
            />
            <edc-text-input
                v-model="formModel.country"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter country"
                label="Country"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.country"
            />
            <edc-text-input
                v-model="formModel.telephone"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter telephone"
                label="Telephone"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.telephone"
            />
            <edc-checkbox
                v-model="formModel.isActive"
                name="isActive"
                label-class="font-bold admin-input-font"
                label="Is active"
                :disabled="loading.isDisabled()"
                :error="errorModel.isActive"
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
