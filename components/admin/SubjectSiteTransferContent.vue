<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { listAllSitesAPI, siteListByStudyIdAPI } from "~/services/apis/handlers/admin/site";
    import { listAllStudiesAPI } from "~/services/apis/handlers/admin/study";
    import { subjectListByStudyIdAPI } from "~/services/apis/handlers/admin/subject";
    import {
        subjectSiteTransferCreateAPI,
        subjectSiteTransferDeleteAPI,
        subjectSiteTransferDetailsByIdAPI,
        subjectSiteTransferPaginationListAPI,
        subjectSiteTransferUpdateAPI,
    } from "~/services/apis/handlers/admin/subject-site-transfer";
    import { listAllAPI } from "~/services/apis/handlers/admin/trial";
    import { trialEnvironmentListByTrialIdAPI } from "~/services/apis/handlers/admin/trial-environment";
    import type { IStudyData } from "~/services/apis/handlers/types/admin/study-types";
    import type {
        ISubjectSiteTransferData,
        ISubjectTransferCreateResponse,
    } from "~/services/apis/handlers/types/subject-site-transfer-types";
    import type { ISubjectData } from "~/services/apis/handlers/types/subject-types";
    import useGlobalStore from "~/stores/global";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IOptions,
        TAdminFormAction,
        TNullableDate,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: number;
        subjectId: number;
        subjectName: string;
        fromSiteId: number;
        fromSiteName: string;
        fromSiteNumber: string;
        toSiteId: number;
        toSiteName: string;
        toSiteNumber: string;
        transferRequestedOn: TNullableDate;
        approvalStatus: string;
        transferredOn: TNullableDate;
        transferredBy: TNullableNumber;
        transferredByName: TNullableString;
        trialId: number;
        trialName: string;
        environmentId: number;
        environmentName: string;
        tempID: string;
    }

    interface IFormModel {
        id: TNullableNumber;
        studyId: TNullableNumber;
        subjectId: TNullableNumber;
        subjectName: string;
        fromSiteId: TNullableNumber;
        fromSiteName: string;
        fromSiteNumber: string;
        toSiteId: TNullableNumber;
        toSiteName: string;
        toSiteNumber: string;
        transferRequestedOn: TNullableDate;
        approvalStatus: TNullableString;
        transferredOn: TNullableDate;
        transferredBy: TNullableNumber;
        transferredByName: TNullableString;
        trialId: number;
        trialName: string;
        environmentId: number;
        environmentName: string;
    }

    interface IErrorModel {
        studyId: string;
        subjectId: string;
        fromSiteId: string;
        toSiteId: string;
    }

    const defaultFormModel = (): IFormModel => ({
        id: null,
        studyId: null,
        subjectId: null,
        subjectName: "",
        fromSiteId: null,
        fromSiteName: "",
        fromSiteNumber: "",
        toSiteId: null,
        toSiteName: "",
        toSiteNumber: "",
        transferRequestedOn: null,
        approvalStatus: null,
        transferredOn: null,
        transferredBy: null,
        transferredByName: null,
        environmentId: 0,
        environmentName: "",
        trialId: 0,
        trialName: "",
    });
    const defaultErrorModel = (): IErrorModel => ({
        studyId: "",
        fromSiteId: "",
        subjectId: "",
        toSiteId: "",
    });

    const popupModalStore = usePopupModalStore();
    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const formAction = ref<TAdminFormAction>("View");
    const filterModel = ref<{
        search: TNullableString;
        trialId: TNullableNumber;
        environmentId: TNullableNumber;
    }>({
        search: null,
        trialId: null,
        environmentId: null,
    });
    const subjectSiteTransferColumns: IColumn[] = [
        {
            field: "subjectId",
            header: "Subject Id",
            icon: false,
            show: true,
        },
        {
            field: "fromSite",
            header: "From Site",
            icon: false,
            show: true,
        },
        {
            field: "toSite",
            header: "To Site",
            icon: false,
            show: true,
        },
        {
            field: "transferRequestedOn",
            header: "Transfer Requested On",
            icon: false,
            show: true,
        },
        {
            field: "approvalStatus",
            header: "Approval Status",
            icon: false,
            show: true,
        },
        {
            field: "transferredOn",
            header: "Transferred On",
            icon: false,
            show: true,
        },
        {
            field: "transferredBy",
            header: "Transferred By",
            icon: false,
            show: true,
        },
    ];
    const subjectSiteTransferTableData = ref<ITableData[]>([]);
    const subjectSiteTransferTableDataRef = ref<ITableData[]>(
        deepClone(subjectSiteTransferTableData.value),
    );
    const trialOptions = ref<DropdownOption>(new DropdownOption());
    const environmentOptions = ref<DropdownOption>(new DropdownOption());
    const studyOptions = ref<DropdownOption>(new DropdownOption());
    const siteOptions = ref<DropdownOption>(new DropdownOption());
    const studySiteOptions = ref<DropdownOption>(new DropdownOption());
    const subjectOptions = ref<DropdownOption>(new DropdownOption());
    const formModel = ref<IFormModel>({ ...defaultFormModel() });
    const formModelRef = ref<IFormModel>({ ...defaultFormModel() });
    const errorModel = ref<IErrorModel>({ ...defaultErrorModel() });
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const trialLookups = computed(() =>
        getOptionsList(trialOptions.value.options, "trialName", "id"),
    );
    const environmentLookups = computed(() =>
        getOptionsList(environmentOptions.value.options, "environment", "id"),
    );
    const studyLookups = computed(() => {
        const result: IOptions[] = [];
        const optionsRow = studyOptions.value.options as unknown as IStudyData[];
        for (const row of optionsRow) {
            result.push({
                label: `${row.trialName}:${row.environmentName}`,
                value: row.id,
            });
        }
        return deepClone(result) as IOptions[];
    });
    const siteLookups = computed(() => getOptionsList(siteOptions.value.options, "siteName", "id"));
    const studySiteLookups = computed(() =>
        getOptionsList(studySiteOptions.value.options, "siteName", "siteId"),
    );
    const subjectLookups = computed(() =>
        getOptionsList(subjectOptions.value.options, "fieldValue", "id"),
    );

    async function trialList() {
        trialOptions.value.loading = true;
        const { status, data, message } = await listAllAPI();
        if (status === 200) {
            trialOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            trialOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        trialOptions.value.loading = false;
    }

    async function environmentList() {
        if (filterModel.value.trialId) {
            environmentOptions.value.loading = true;
            const { status, data, message } = await trialEnvironmentListByTrialIdAPI(
                String(filterModel.value.trialId),
            );
            if (status === 200) {
                environmentOptions.value.options = deepClone(data);
            } else if (status !== 401) {
                environmentOptions.value.options = [];
                toastStore.error({
                    title: "Error",
                    message,
                });
            }
            environmentOptions.value.loading = false;
        }
    }

    async function sitesList() {
        siteOptions.value.loading = true;
        const { status, data, message } = await listAllSitesAPI();
        if (status === 200) {
            siteOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            siteOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        siteOptions.value.loading = false;
    }

    async function studySitesList() {
        studySiteOptions.value.loading = true;
        const { status, data, message } = await siteListByStudyIdAPI({
            studyId: Number(formModel.value.studyId),
            showAll: true,
        });
        if (status === 200) {
            studySiteOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            studySiteOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        studySiteOptions.value.loading = false;
    }

    async function studiesList() {
        studyOptions.value.loading = true;
        const { status, data, message } = await listAllStudiesAPI();
        if (status === 200) {
            studyOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            studyOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        studyOptions.value.loading = false;
    }

    async function subjectsList() {
        subjectOptions.value.loading = true;
        const { status, data, message } = await subjectListByStudyIdAPI(
            formModel.value.studyId as number,
        );
        if (status === 200) {
            subjectOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            subjectOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        subjectOptions.value.loading = false;
    }

    function siteBySubjectId() {
        let result = 0;
        for (const row of subjectOptions.value.options as ISubjectData[]) {
            if (isEqual(formModel.value.subjectId, row.id, "number")) {
                result = row.siteId;
                break;
            }
        }
        if (result) formModel.value.fromSiteId = result;
    }

    function studyByTrialIdAndEnvironmentId(subjectDetails: ISubjectSiteTransferData) {
        let result = 0;
        for (const row of studyOptions.value.options as unknown as IStudyData[]) {
            if (
                isEqual(row.trialId, subjectDetails.trialId, "number") &&
                isEqual(row.environmentId, subjectDetails.environmentId, "number")
            ) {
                result = row.id;
                break;
            }
        }
        if (result) {
            formModel.value.studyId = result;
            formModelRef.value.studyId = result;
        }
    }

    function resetFormModel(closeModal?: TVoidAction) {
        formModel.value = { ...defaultFormModel() };
        formModelRef.value = { ...defaultFormModel() };
        errorModel.value = { ...defaultErrorModel() };
        if (closeModal) {
            formAction.value = "View";
            closeModal();
        }
    }

    function validateAll() {
        if (!formModel.value.studyId) errorModel.value.studyId = "Please select a study";
        if (!formModel.value.subjectId) errorModel.value.subjectId = "Please select a subject";
        else errorModel.value.subjectId = "";
        if (!formModel.value.fromSiteId) errorModel.value.fromSiteId = "Please select a from site";
        else errorModel.value.fromSiteId = "";
        if (!formModel.value.toSiteId) errorModel.value.toSiteId = "Please select a to site";
        else errorModel.value.toSiteId = "";
    }

    async function createOrUpdateSubjectSiteTransferData(closeModal: TVoidAction) {
        loading.value.form = true;
        let status = 500;
        let message = "";
        let validationErrorsData = null;
        let data: ISubjectTransferCreateResponse | null = null;
        const requestData = {
            id: formModel.value.id || 0,
            subjectId: formModel.value.subjectId as number,
            subjectName: formModel.value.subjectName,
            fromSiteId: formModel.value.fromSiteId as number,
            fromSiteName: formModel.value.fromSiteName,
            fromSiteNumber: formModel.value.fromSiteNumber,
            toSiteId: formModel.value.toSiteId as number,
            toSiteName: formModel.value.toSiteName,
            toSiteNumber: formModel.value.toSiteNumber,
            approvalStatus: formModel.value.approvalStatus as string,
            transferRequestedOn: formModel.value.transferRequestedOn,
            transferredOn: formModel.value.transferredOn,
            transferredBy: formModel.value.transferredBy,
            transferredByName: formModel.value.transferredByName,
            trialId: formModel.value.trialId,
            trialName: formModel.value.trialName,
            environmentId: formModel.value.environmentId,
            environmentName: formModel.value.environmentName,
            updatedBy: 0,
        };
        if (formAction.value === "Add") {
            const {
                status: apiStatus,
                message: apiMessage,
                data: apiData,
                validationErrors: apiValidationErrors,
            } = await subjectSiteTransferCreateAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            data = apiData;
            validationErrorsData = apiValidationErrors;
        } else if (formAction.value === "Update") {
            const {
                status: apiStatus,
                message: apiMessage,
                data: apiData,
                validationErrors: apiValidationErrors,
            } = await subjectSiteTransferUpdateAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            data = apiData;
            validationErrorsData = apiValidationErrors;
        }
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            if (data && data?.subject) {
                setTimeout(() => {
                    const uniqueKey = setEmailTemplate({
                        to: data?.to || "",
                        cc: data?.cc || "",
                        bcc: data?.bcc || "",
                        subject: data?.subject || "",
                        body: data?.body || "",
                        emailDetails: {
                            id: data?.tempId || "",
                            action: data?.action || "",
                            actionDateTime: data?.actionDateTime || "",
                            subjectName: data?.subjectName || "",
                            fromSiteName: data?.fromSiteName || "",
                            toSiteName: data?.toSiteName || "",
                        },
                    });
                    renderEmailTemplate(uniqueKey);
                }, 1000);
            }
            resetFormModel(closeModal);
            await subjectSiteTransferPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            if (status === 400 && validationErrorsData) {
                setAPIValidationErrors(validationErrorsData, errorModel.value);
            }
        }
        loading.value.form = false;
    }

    async function addOrEditSubjectSiteTransferApi(closeModal: TVoidAction) {
        validateAll();
        if (!checkIfModelHasErrors(errorModel.value)) {
            await createOrUpdateSubjectSiteTransferData(closeModal);
        }
    }

    function setTableData(tableData: ISubjectSiteTransferData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            ...row,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function subjectSiteTransferPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await subjectSiteTransferPaginationListAPI(
            getAPIFilters({
                search: filterModel.value.search,
                filter: {
                    trialId: filterModel.value.trialId as number,
                    environmentId: filterModel.value.environmentId as number,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            subjectSiteTransferTableData.value = deepClone(tableData);
            subjectSiteTransferTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            subjectSiteTransferTableData.value = [];
            subjectSiteTransferTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function subjectTransferDetailsById(subjectSiteTransferId: number) {
        loading.value.form = true;
        const { data, status, message } =
            await subjectSiteTransferDetailsByIdAPI(subjectSiteTransferId);
        if (status === 200) {
            formModel.value.id = data.id;
            formModel.value.subjectId = data.subjectId;
            formModel.value.subjectName = data.subjectName;
            formModel.value.fromSiteId = data.fromSiteId;
            formModel.value.fromSiteName = data.fromSiteName;
            formModel.value.fromSiteNumber = data.fromSiteNumber;
            formModel.value.toSiteId = data.toSiteId;
            formModel.value.toSiteName = data.toSiteName;
            formModel.value.toSiteNumber = data.toSiteNumber;
            formModel.value.approvalStatus = data.approvalStatus;
            formModel.value.transferRequestedOn = data.transferRequestedOn;
            formModel.value.transferredOn = data.transferredOn;
            formModel.value.transferredBy = data.transferredBy;
            formModel.value.transferredByName = data.transferredByName;
            formModel.value.trialId = data.trialId;
            formModel.value.trialName = data.trialName;
            formModel.value.environmentId = data.environmentId;
            formModel.value.environmentName = data.environmentName;

            formModelRef.value.id = data.id;
            formModelRef.value.subjectId = data.subjectId;
            formModelRef.value.subjectName = data.subjectName;
            formModelRef.value.fromSiteId = data.fromSiteId;
            formModelRef.value.fromSiteName = data.fromSiteName;
            formModelRef.value.fromSiteNumber = data.fromSiteNumber;
            formModelRef.value.toSiteId = data.toSiteId;
            formModelRef.value.toSiteName = data.toSiteName;
            formModelRef.value.toSiteNumber = data.toSiteNumber;
            formModelRef.value.approvalStatus = data.approvalStatus;
            formModelRef.value.transferRequestedOn = data.transferRequestedOn;
            formModelRef.value.transferredOn = data.transferredOn;
            formModelRef.value.transferredBy = data.transferredBy;
            formModelRef.value.transferredByName = data.transferredByName;
            formModelRef.value.trialId = data.trialId;
            formModelRef.value.trialName = data.trialName;
            formModelRef.value.environmentId = data.environmentId;
            formModelRef.value.environmentName = data.environmentName;
        } else if (status !== 401) {
            resetFormModel();
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function addOrEditOrDeleteSubjectSiteTransferAction(
        type: TAdminFormAction,
        subjectSiteTransferDetails?: ISubjectSiteTransferData,
    ) {
        formAction.value = type;
        if (type === "Update") {
            await subjectTransferDetailsById(
                subjectSiteTransferDetails ? Number(subjectSiteTransferDetails.id) : 0,
            );
        } else if (type === "Delete") {
            formModel.value.id = Number(subjectSiteTransferDetails?.id || 0);
            formModelRef.value.id = Number(subjectSiteTransferDetails?.id || 0);
        }
        popupModalStore.show("adminSubjectSiteTransferModal");
        if (getArrayLength(studyOptions.value.options) === 0) await studiesList();
        if (type === "Update" && subjectSiteTransferDetails) {
            studyByTrialIdAndEnvironmentId(subjectSiteTransferDetails);
            appendTrialIdAndEnvironmentIdByStudyId();
            await Promise.all([subjectsList(), studySitesList()]);
            formModel.value.subjectId = subjectSiteTransferDetails.subjectId;
            formModelRef.value.subjectId = subjectSiteTransferDetails.subjectId;
            siteBySubjectId();
        }
    }

    async function deleteSubjectSiteTransfer(trialId: string) {
        loading.value.form = true;
        const { status, message } = await subjectSiteTransferDeleteAPI(trialId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectSiteTransferPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function onTrialFilterChange() {
        filterModel.value.environmentId = null;
        await Promise.all([subjectSiteTransferPaginationList(), environmentList()]);
    }

    async function onStudyChange() {
        await Promise.all([subjectsList(), studySitesList()]);
    }

    function onSubjectChange() {
        if (formModel.value.subjectId) siteBySubjectId();
    }

    function appendTrialIdAndEnvironmentIdByStudyId() {
        if (formModel.value.studyId) {
            for (const row of studyOptions.value.options as unknown as IStudyData[]) {
                if (isEqual(row.id, formModel.value.studyId, "number")) {
                    formModel.value.trialId = row.trialId;
                    formModel.value.environmentId = row.environmentId;
                    break;
                }
            }
        } else {
            formModel.value.trialId = 0;
            formModel.value.environmentId = 0;
        }
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        formModel.value,
        formModelRef.value,
    );

    watch(
        () => formModel.value,
        (newFormModel) => {
            model.value = newFormModel;
            modelRef.value = formModelRef.value;
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
                formModel.value = deepClone(formModelRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
                formAction.value = "View";
                popupModalStore.hide("adminSubjectSiteTransferModal");
            }
        },
    );

    onMounted(() => {
        Promise.all([subjectSiteTransferPaginationList(), trialList(), sitesList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Sites">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            key="subjectSiteTransferSearch"
                            v-model="filterModel.search"
                            element-id="subjectSiteTransferSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await subjectSiteTransferPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus(
                                        '#subjectSiteTransferSearch',
                                    );
                                }
                            "
                            @on-clear="
                                async () => {
                                    await subjectSiteTransferPaginationList();
                                }
                            "
                        />
                        <edc-dropdown
                            :key="filterModel.trialId ? `trial-${filterModel.trialId}` : 'trial'"
                            v-model="filterModel.trialId"
                            default-value="Trial"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(trialOptions.loading)"
                            :loading="trialOptions.loading"
                            :options="trialLookups"
                            @on-select="
                                async () => {
                                    await onTrialFilterChange();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await onTrialFilterChange();
                                }
                            "
                        />
                        <edc-dropdown
                            :key="
                                filterModel.environmentId
                                    ? `environment-${filterModel.environmentId}`
                                    : 'environment'
                            "
                            v-model="filterModel.environmentId"
                            default-value="Environment"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(environmentOptions.loading)"
                            :options="environmentLookups"
                            :loading="environmentOptions.loading"
                            @on-select="
                                async () => {
                                    await subjectSiteTransferPaginationList();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await subjectSiteTransferPaginationList();
                                }
                            "
                        />
                        <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditOrDeleteSubjectSiteTransferAction('Add')"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Site Transfer</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="subjectSiteTransferColumns"
                            :table-data="subjectSiteTransferTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="subjectSiteTransferSearch"
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
                                        :key="`subject-${data.tempID}`"
                                        v-model="data.subjectName"
                                        type="text"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-dropdown
                                        :key="`fromSite-${data.tempID}`"
                                        v-model="data.fromSiteId"
                                        container-class="w-[20rem]"
                                        :options="siteLookups"
                                        :loading="siteOptions.loading"
                                        default-value="No From Site"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[20rem]"
                                        :disabled="loading.isDisabled()"
                                        :enable-clear="true"
                                        :read-only="true"
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-dropdown
                                        :key="`toSite-${data.tempID}`"
                                        v-model="data.toSiteId"
                                        container-class="w-[20rem]"
                                        :options="siteLookups"
                                        :loading="siteOptions.loading"
                                        default-value="No To Site"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[20rem]"
                                        :disabled="loading.isDisabled()"
                                        :enable-clear="true"
                                        :read-only="true"
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-calendar
                                        :key="`transferRequestedOn-${data.tempID}`"
                                        v-model="data.transferRequestedOn"
                                        picker-placement="bottom"
                                        :picker-offset="0"
                                        picker-class="w-[29rem]"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :read-only="true"
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-input
                                        :key="`approvalStatus-${data.tempID}`"
                                        v-model="data.approvalStatus"
                                        type="text"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-calendar
                                        :key="`transferredOn-${data.tempID}`"
                                        v-model="data.transferredOn"
                                        picker-placement="bottom"
                                        :picker-offset="0"
                                        picker-class="w-[29rem]"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :read-only="true"
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-input
                                        :key="`transferredBy-${data.tempID}`"
                                        v-model="data.transferredBy"
                                        type="text"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="data.approvalStatus !== 'Approved'"
                                    container-class="mt-[0.7rem]"
                                    loader-type="table"
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () =>
                                            addOrEditOrDeleteSubjectSiteTransferAction(
                                                'Update',
                                                data as unknown as ISubjectSiteTransferData,
                                            )
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="commonActionIconClasses('Update')"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="data.approvalStatus !== 'Approved'"
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this site transfer?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteSubjectSiteTransfer(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            container-class="mt-[0.7rem]"
                                            loader-type="table"
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
            </template>
        </admin-card-wrapper>
        <edc-popup-modal
            modal-id="adminSubjectSiteTransferModal"
            :submit-label="formAction"
            :on-cancel="(closeModal) => resetFormModel(closeModal)"
            :on-submit="async (closeModal) => await addOrEditSubjectSiteTransferApi(closeModal)"
        >
            <!-- <div class="flex flex-col items-start w-[30rem] gap-[0.5rem]"> -->
            <span class="text-[1.2rem] font-semibold self-start"
                >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>)
                are required</span
            >
            <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
                <edc-dropdown
                    :key="`study-${formModel.studyId ? formModel.studyId : ''}`"
                    v-model="formModel.studyId"
                    container-class="w-[34rem]"
                    default-value="Select a study"
                    label="Study"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="studyLookups"
                    :loading="studyOptions.loading"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :required="true"
                    :disabled="loading.isDisabled(studyOptions.loading, formAction === 'Update')"
                    :error="errorModel.studyId"
                    :ellipse-count="50"
                    @on-select="
                        async () => {
                            if (formModel.studyId) await onStudyChange();
                            appendTrialIdAndEnvironmentIdByStudyId();
                        }
                    "
                />
                <edc-dropdown
                    :key="`subject-${formModel.subjectId ? formModel.subjectId : ''}`"
                    v-model="formModel.subjectId"
                    container-class="w-[34rem]"
                    default-value="Select a subject"
                    label="Subject"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="subjectLookups"
                    :loading="subjectOptions.loading"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :required="true"
                    :disabled="loading.isDisabled(subjectOptions.loading, formAction === 'Update')"
                    :error="errorModel.subjectId"
                    :ellipse-count="50"
                    @on-select="
                        () => {
                            onSubjectChange();
                        }
                    "
                />
                <edc-dropdown
                    :key="`fromSite-${formModel.fromSiteId ? formModel.fromSiteId : ''}`"
                    v-model="formModel.fromSiteId"
                    container-class="w-[34rem]"
                    default-value="Select a from site"
                    label="From Site"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="studySiteLookups.filter((row) => row.value !== formModel.toSiteId)"
                    :loading="studySiteOptions.loading"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :required="true"
                    :disabled="loading.isDisabled(studySiteOptions.loading, true)"
                    :ellipse-count="50"
                    :error="errorModel.fromSiteId"
                />
                <edc-dropdown
                    :key="`toSite-${formModel.toSiteId ? formModel.toSiteId : ''}`"
                    v-model="formModel.toSiteId"
                    container-class="w-[34rem]"
                    default-value="Select a to site"
                    label="To Site"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="studySiteLookups.filter((row) => row.value !== formModel.fromSiteId)"
                    :loading="studySiteOptions.loading"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :required="true"
                    :disabled="loading.isDisabled(studySiteOptions.loading)"
                    :ellipse-count="50"
                    :error="errorModel.toSiteId"
                />
            </div>
        </edc-popup-modal>
    </div>
</template>

<style scoped></style>
