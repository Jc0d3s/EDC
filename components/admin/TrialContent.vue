<script setup lang="ts">
    // // @ts-ignore
    // // @ts-nocheck
    import Trial from "~/services/apis/data/admin/trial";
    import Branch from "~/services/apis/data/admin/branch";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IWinFormProps,
        TAdminFormAction,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import { therapeuticAreaListAPI } from "~/services/apis/handlers/admin/therapeutic-area";
    import useToastStore from "~/stores/toast";
    import {
        trialByIdAPI,
        trialPhasesListAPI,
        updateTrialAPI,
    } from "~/services/apis/handlers/admin/trial";
    import {
        branchPaginationListAPI,
        createBranchAPI,
        deleteBranchAPI,
    } from "~/services/apis/handlers/admin/branch";
    import type { IBranchData } from "~/services/apis/handlers/types/admin/branch-types";
    import { listUsersByRoleAPI } from "~/services/apis/handlers/admin/user";
    import type { IUserData, IUserRoleData } from "~/services/apis/handlers/types/user-types";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type { IReleaseVersionData } from "~/services/apis/handlers/types/admin/release-version-types";
    import { releaseVersionPaginationListAPI } from "~/services/apis/handlers/admin/release-version";
    import useGlobalStore from "~/stores/global";

    interface IReleaseVersionTableData extends IReleaseVersionData {
        existingVersion: string;
        trialId: number;
        trialName: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });
    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<IBranchData | IReleaseVersionTableData>];
    }>();

    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const globalStore = useGlobalStore();
    const formAction = ref<TAdminFormAction>("View");
    const branchFormAction = ref<TAdminFormAction>("View");
    const trialFormModel = ref<Trial>(new Trial());
    const trialFormModelRef = ref<Trial>(new Trial());
    const trialErrorModel = ref<Trial>(new Trial());
    const branchFormModel = ref<Branch>(new Branch());
    const branchFormModelRef = ref<Branch>(new Branch());
    const branchErrorModel = ref<Branch>(new Branch());
    const loading = ref<Loading>(new Loading());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const crfBranchSearch = ref<TNullableString>(null);
    const crfBranchColumns: IColumn[] = [
        {
            field: "branchName",
            header: "Name",
            icon: false,
            show: true,
        },
    ];
    const crfBranchTableData = ref<IBranchData[]>([]);

    const crfVersionSearch = ref<TNullableString>(null);
    const crfVersionColumns: IColumn[] = [
        {
            field: "existingVersion",
            header: "CRF Versions",
            icon: false,
            show: true,
        },
    ];
    const crfVersionTableData = ref<IReleaseVersionTableData[]>([]);

    const trialSettingsGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Trial Settings - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Trial Settings",
    );

    const crfBranchesGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `CRF Branches - ${props.tabData[props.activeTab.label].data.trialName}`
            : "CRF Branches",
    );

    const crfVersionsGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `CRF Versions - ${props.tabData[props.activeTab.label].data.trialName}`
            : "CRF Versions",
    );

    const therapeuticAreaOptions = ref<DropdownOption>(new DropdownOption());
    const ownerOptions = ref<DropdownOption>(new DropdownOption());
    const phaseOptions = ref<DropdownOption>(new DropdownOption());

    const therapeuticAreaLookups = computed(() =>
        getOptionsList(therapeuticAreaOptions.value.options, "therapeuticArea", "id"),
    );

    const ownerLookups = computed(() =>
        getOptionsList(ownerOptions.value.options, "displayName", "id"),
    );

    const phaseLookups = computed(() => getOptionsList(phaseOptions.value.options, "name", "id"));

    // Trial
    function resetTrialFormModel(closeModal?: TVoidAction) {
        trialFormModel.value = new Trial();
        trialFormModelRef.value = new Trial();
        trialErrorModel.value = new Trial();
        if (closeModal) {
            formAction.value = "View";
            branchFormAction.value = "View";
            closeModal();
        }
    }

    async function createOrUpdateTrial(closeModal: TVoidAction) {
        loading.value.form = true;
        const requestData = {
            id: (trialFormModel.value.id as number) || 0,
            trialGroupId: Number(trialFormModel.value.trialGroupId),
            trialName: trialFormModel.value.trialName as string,
            ownerId: Number(trialFormModel.value.ownerId),
            protocolNumber: trialFormModel.value.protocolNumber || "",
            drugOrDevice: trialFormModel.value.drugOrDevice || "",
            compoundOrcode: trialFormModel.value.compoundOrCode || "",
            program: trialFormModel.value.program || "",
            protocol: trialFormModel.value.protocol || "",
            phaseId: trialFormModel.value.phaseId,
            indication: trialFormModel.value.indication || "",
            enrollmentTarget: trialFormModel.value.enrollmentTarget || 0,
            therapeuticAreaId: trialFormModel.value.therapeuticAreaId as TNullableNumber,
            liveDate: trialFormModel.value.liveDate
                ? getAsISOString(trialFormModel.value.liveDate)
                : null,
            closeDate: trialFormModel.value.closeDate
                ? getAsISOString(trialFormModel.value.closeDate)
                : null,
            title: trialFormModel.value.title || "",
            summary: trialFormModel.value.summary || "",
            description: trialFormModel.value.description || "",
            isProduction: trialFormModel.value.isProduction,
            updatedBy: 0,
        };
        const { status, message, validationErrors } = await updateTrialAPI(requestData);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            resetTrialFormModel(closeModal);
            await trialByID(Number(props.tabData[props.activeTab.label].data.id));
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            if (status === 400 && validationErrors) {
                setAPIValidationErrors(validationErrors, trialErrorModel.value);
            }
        }
        loading.value.form = false;
    }

    function validateAllTrial() {
        if (!trialFormModel.value.trialName)
            trialErrorModel.value.trialName = "Please enter a name";
        else if (getStringLength(trialFormModel.value.trialName) > 50)
            trialErrorModel.value.trialName = "Name cannot be more than 50 characters";
        else trialErrorModel.value.trialName = "";

        if (getStringLength(trialFormModel.value.protocolNumber) === 0)
            trialErrorModel.value.protocolNumber = "Please enter a protocol number";
        else if (getStringLength(trialFormModel.value.protocolNumber) > 50)
            trialErrorModel.value.protocolNumber =
                "Protocol number cannot be more than 50 characters";
        else trialErrorModel.value.protocolNumber = "";

        if (
            trialFormModel.value.drugOrDevice &&
            getStringLength(trialFormModel.value.drugOrDevice) > 50
        )
            trialErrorModel.value.drugOrDevice = "Drug/Device cannot be more than 50 characters";
        else trialErrorModel.value.drugOrDevice = "";

        if (
            trialFormModel.value.compoundOrCode &&
            getStringLength(trialFormModel.value.compoundOrCode) > 50
        )
            trialErrorModel.value.compoundOrCode =
                "Compound/Code cannot be more than 50 characters";
        else trialErrorModel.value.compoundOrCode = "";

        if (trialFormModel.value.program && getStringLength(trialFormModel.value.program) > 50)
            trialErrorModel.value.program = "Program cannot be more than 50 characters";
        else trialErrorModel.value.program = "";

        // if (trialFormModel.value.protocol && getStringLength(trialFormModel.value.protocol) > 50)
        //     trialErrorModel.value.protocol = "Protocol cannot be more than 50 characters";
        // else trialErrorModel.value.protocol = "";

        if (
            trialFormModel.value.indication &&
            getStringLength(trialFormModel.value.indication) > 50
        )
            trialErrorModel.value.indication = "Indication cannot be more than 50 characters";
        else trialErrorModel.value.indication = "";

        if (!trialFormModel.value.ownerId)
            trialErrorModel.value.ownerName = "Please select an owner";
        else trialErrorModel.value.ownerName = "";

        if (trialFormModel.value.isProduction && !trialFormModel.value.liveDate)
            trialErrorModel.value.liveDate = "Please select a go live date";
        else trialErrorModel.value.liveDate = "";

        if (!trialFormModel.value.phaseId)
            trialErrorModel.value.phaseName = "Please select a phase";
        else trialErrorModel.value.phaseName = "";

        if (trialFormModel.value.title && getStringLength(trialFormModel.value.title) > 128)
            trialErrorModel.value.title = "Title cannot be more than 128 characters";
        else trialErrorModel.value.title = "";

        if (trialFormModel.value.summary && getStringLength(trialFormModel.value.summary) > 255)
            trialErrorModel.value.summary = "Summary cannot be more than 255 characters";
        else trialErrorModel.value.summary = "";
    }

    async function addOrEditTrialApi(closeModal: TVoidAction) {
        validateAllTrial();
        if (!checkIfModelHasErrors(trialErrorModel.value, ["isProduction"])) {
            await createOrUpdateTrial(closeModal);
        }
        // trialGroupFormModel.value.reset();
    }

    async function trialByID(trialId: number) {
        loading.value.form = true;
        const { data, status, message } = await trialByIdAPI(trialId);
        if (status === 200) {
            trialFormModel.value.id = trialId;
            trialFormModel.value.trialName = data.trialName; // FIXME:
            trialFormModel.value.trialGroupId = data.trialGroupId;
            trialFormModel.value.ownerId = data.ownerId;
            trialFormModel.value.ownerName = data.ownerName;
            trialFormModel.value.protocolNumber = data.protocolNumber;
            trialFormModel.value.drugOrDevice = data.drugOrDevice;
            trialFormModel.value.compoundOrCode = data.compoundOrcode; // FIXME:
            trialFormModel.value.program = data.program;
            trialFormModel.value.protocol = data.protocol;
            trialFormModel.value.phaseId = data.phaseId;
            trialFormModel.value.phaseName = data.phaseName;
            trialFormModel.value.indication = data.indication;
            // trialFormModel.value.responsibleParty = data.responsibleParty;
            trialFormModel.value.enrollmentTarget = data.enrollmentTarget;
            trialFormModel.value.therapeuticAreaId = data.therapeuticAreaId;
            trialFormModel.value.therapeuticAreaName = data.therapeuticAreaName;
            trialFormModel.value.liveDate = data.liveDate ? `${data.liveDate}Z` : null;
            trialFormModel.value.closeDate = data.closeDate ? `${data.closeDate}Z` : null;
            trialFormModel.value.title = data.title;
            trialFormModel.value.summary = data.summary;
            trialFormModel.value.description = data.description;
            trialFormModel.value.isProduction = data.isProduction;

            trialFormModelRef.value.id = trialId;
            trialFormModelRef.value.trialName = data.trialName; // FIXME:
            trialFormModelRef.value.trialGroupId = data.trialGroupId;
            trialFormModelRef.value.ownerId = data.ownerId;
            trialFormModelRef.value.ownerName = data.ownerName;
            trialFormModelRef.value.protocolNumber = data.protocolNumber;
            trialFormModelRef.value.drugOrDevice = data.drugOrDevice;
            trialFormModelRef.value.compoundOrCode = data.compoundOrcode; // FIXME:
            trialFormModelRef.value.program = data.program;
            trialFormModelRef.value.protocol = data.protocol;
            trialFormModelRef.value.phaseId = data.phaseId;
            trialFormModelRef.value.phaseName = data.phaseName;
            trialFormModelRef.value.indication = data.indication;
            // trialFormModelRef.value.responsibleParty = data.responsibleParty;
            trialFormModelRef.value.enrollmentTarget = data.enrollmentTarget;
            trialFormModelRef.value.therapeuticAreaId = data.therapeuticAreaId;
            trialFormModelRef.value.therapeuticAreaName = data.therapeuticAreaName;
            trialFormModelRef.value.liveDate = data.liveDate ? `${data.liveDate}Z` : null;
            trialFormModelRef.value.closeDate = data.closeDate ? `${data.closeDate}Z` : null;
            trialFormModelRef.value.title = data.title;
            trialFormModelRef.value.summary = data.summary;
            trialFormModelRef.value.description = data.description;
            trialFormModelRef.value.isProduction = data.isProduction;
        } else if (status !== 401) {
            resetTrialFormModel();
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function getTherapeuticAreas() {
        therapeuticAreaOptions.value.loading = true;
        const { status, data } = await therapeuticAreaListAPI();
        if (status === 200) {
            therapeuticAreaOptions.value.options = deepClone(data);
        } else {
            therapeuticAreaOptions.value.options = [];
        }
        therapeuticAreaOptions.value.loading = false;
    }

    function setUserTypeData(data: IUserData[]) {
        const result: IUserRoleData[] = [];
        for (const row of data) {
            result.push({
                ...row,
                displayName: row.enterpriseName
                    ? `${row.name} (${row.enterpriseName})`
                    : `${row.name}`,
            });
        }
        return result;
    }

    async function getOwnerUserTypes() {
        ownerOptions.value.loading = true;
        const { status, data } = await listUsersByRoleAPI("Sponsor");
        if (status === 200) {
            ownerOptions.value.options = deepClone(setUserTypeData(data));
        } else {
            ownerOptions.value.options = [];
        }
        ownerOptions.value.loading = false;
    }

    async function getTrialPhases() {
        phaseOptions.value.loading = true;
        const { status, data } = await trialPhasesListAPI();
        if (status === 200) {
            phaseOptions.value.options = deepClone(data);
        } else {
            phaseOptions.value.options = [];
        }
        phaseOptions.value.loading = false;
    }

    async function editTrialAction() {
        formAction.value = "Update";
        branchFormAction.value = "View";
        await trialByID(Number(props.tabData[props.activeTab.label].data.id));
        popupModalStore.show("adminTrialModal");
        if (
            getArrayLength(therapeuticAreaOptions.value.options) === 0 ||
            getArrayLength(ownerOptions.value.options) === 0 ||
            getArrayLength(phaseOptions.value.options) === 0
        )
            Promise.all([getTherapeuticAreas(), getOwnerUserTypes(), getTrialPhases()]);
    }
    // Trial

    // Branch
    // function deleteVersion() {
    //     console.log("version deleted");
    // }

    function addOrEditBranchAction(type: TAdminFormAction) {
        branchFormAction.value = type;
        formAction.value = "View";
        popupModalStore.show("adminBranchModal");
    }

    function resetBranchFormModel(closeModal?: TVoidAction) {
        branchFormModel.value.reset(branchFormModelRef.value);
        if (closeModal) closeModal();
        branchFormAction.value = "View";
        formAction.value = "View";
    }

    async function branchPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await branchPaginationListAPI(
            getAPIFilters({
                search: crfBranchSearch.value,
                filter: {
                    trialId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            crfBranchTableData.value = deepClone(items);
            tableLoaderDetails.value = setLoaderForArrayDatas(items);
        } else if (status !== 401) {
            crfBranchTableData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function validateBranch() {
        if (!branchFormModel.value.branchName)
            branchErrorModel.value.branchName = "Please enter a name";
        else if (getStringLength(branchFormModel.value.branchName) > 50)
            branchErrorModel.value.branchName = "Name cannot be more than 50 characters";
        else branchErrorModel.value.branchName = "";
        if (getStringLength(branchFormModel.value.confirmationMessage) > 256)
            branchErrorModel.value.confirmationMessage =
                "Message cannot be more than 256 characters";
        else branchErrorModel.value.confirmationMessage = "";
    }

    async function addOrEditBranchApi(closeModal: TVoidAction) {
        validateBranch();
        if (!checkIfModelHasErrors(branchErrorModel.value, ["branchType"])) {
            loading.value.form = true;
            const { status, message, validationErrors } = await createBranchAPI({
                confirmationMessage: branchFormModel.value.confirmationMessage,
                branchName: branchFormModel.value.branchName,
                id: 0,
                isGlobal: branchFormModel.value.isGlobal,
                trialId: Number(props.tabData[props.activeTab.label].data.id),
                primaryForm: branchFormModel.value.primaryForm || 0,
                defaultMatrix: branchFormModel.value.defaultMatrix || 0,
                signaturePrompt: branchFormModel.value.signaturePrompt,
                defaultMatrixName: branchFormModel.value.defaultMatrixName || "",
                primaryFormName: branchFormModel.value.primaryFormName || "",
                updatedBy: 0,
            });
            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                closeModal();
                resetBranchFormModel(closeModal);
                await branchPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrors) {
                    setAPIValidationErrors(validationErrors, branchErrorModel.value);
                }
            }
            loading.value.form = false;
        }
        // TODO: once a branch is successfully created perform click on that branch programatically.
        // trialGroupFormModel.value.reset();
    }

    async function deleteBranchById(subjectFieldConfigId: string) {
        loading.value.form = true;
        const { status, message } = await deleteBranchAPI(subjectFieldConfigId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await branchPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Branch

    // Released Versions
    function setReleaseVersionTableData(tableData: IReleaseVersionData[]) {
        return tableData.map((row) => ({
            ...row,
            existingVersion: `${row.releaseVersionName} (${padCharactersToString(row.releaseVersionId)})`,
            trialId: props.tabData[props.activeTab.label].data.id,
            trialName: props.tabData[props.activeTab.label].data.trialName,
        })) as IReleaseVersionTableData[];
    }

    async function crfPaginationList() {
        loading.value.dynamicLoading["releaseVersionTableData"] = true;
        const { status, data } = await releaseVersionPaginationListAPI(
            getAPIFilters({
                search: crfVersionSearch.value,
                filter: {
                    trialId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setReleaseVersionTableData(items);
            crfVersionTableData.value = deepClone(tableData);
        } else if (status !== 401) {
            crfVersionTableData.value = [];
        }
        loading.value.dynamicLoading["releaseVersionTableData"] = false;
    }
    // Released Versions

    const { isModelChanged: isTrialModelChanged } = useUnsavedAlert(
        trialFormModel.value,
        trialFormModelRef.value,
    );

    const { isModelChanged: isBranchModelChanged } = useUnsavedAlert(
        branchFormModel.value,
        branchFormModelRef.value,
    );

    watch(
        () => isTrialModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => isBranchModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset") {
                if (isTrialModelChanged.value) {
                    trialFormModel.value = deepClone(trialFormModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                    formAction.value = "View";
                    popupModalStore.hide("adminTrialModal");
                } else if (isBranchModelChanged.value) {
                    branchFormModel.value = deepClone(branchFormModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                    branchFormAction.value = "View";
                    popupModalStore.hide("adminBranchModal");
                }
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["releaseVersionTableData"]);
        Promise.all([
            trialByID(Number(props.tabData[props.activeTab.label].data.id)),
            branchPaginationList(),
            crfPaginationList(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="trialSettingsGroupLabel" container-class="col-span-2">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="flex flex-row items-center self-start gap-[1rem]">
                        <edc-pressable
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => editTrialAction()"
                        >
                            <edc-icon
                                icon="edit"
                                fill="var(--color-secondary)"
                                :class="`${commonActionIconClasses('Update')}`"
                            />
                            <span class="text-[1.3rem] secondary-text inline-block">Edit</span>
                        </edc-pressable>
                    </div>
                    <!-- <div :class="['flex flex-col gap-[1rem] items-start justify-start flex-wrap']"> -->
                    <div :class="['grid grid-cols-3 gap-[1rem]']">
                        <!-- <div :class="['grid grid-cols-3 gap-[1rem]']"> -->
                        <!-- FIXME: -->
                        <admin-form-details
                            label="Name"
                            type="text"
                            :text="trialFormModel.trialName"
                        />
                        <!-- TODO: map ownerId with owner dropdown -->
                        <admin-form-details
                            label="Owner/Sponsor"
                            type="text"
                            :text="trialFormModel.ownerName"
                        />
                        <admin-form-details
                            label="Protocol Number"
                            type="text"
                            :text="trialFormModel.protocolNumber"
                        />
                        <admin-form-details
                            label="Drug or Device"
                            type="text"
                            :text="trialFormModel.drugOrDevice"
                        />
                        <admin-form-details
                            label="Compound or Code"
                            type="text"
                            :text="trialFormModel.compoundOrCode"
                        />
                        <admin-form-details
                            label="Program"
                            type="text"
                            :text="trialFormModel.program"
                        />
                        <admin-form-details
                            label="Protocol"
                            type="text"
                            :text="trialFormModel.protocol"
                        />
                        <admin-form-details
                            label="Phase"
                            type="text"
                            :text="trialFormModel.phaseName"
                        />
                        <admin-form-details
                            label="Indication"
                            type="text"
                            :text="trialFormModel.indication"
                        />
                        <!-- <admin-form-details
                            label="Responsible Party"
                            type="text"
                            :text="trialFormModel.responsibleParty"
                        /> -->
                        <admin-form-details
                            label="Enrollment Target"
                            type="text"
                            :text="String(trialFormModel.enrollmentTarget)"
                        />
                        <admin-form-details
                            label="Therapeutic Area"
                            type="text"
                            :text="trialFormModel.therapeuticAreaName"
                        />
                        <admin-form-details
                            label="Live Date"
                            type="date"
                            :text="trialFormModel.liveDate"
                        />
                        <admin-form-details
                            label="Close Date"
                            type="date"
                            :text="trialFormModel.closeDate"
                        />
                        <admin-form-details
                            label="Title"
                            type="text"
                            :text="trialFormModel.title"
                        />
                        <admin-form-details
                            label="Summary"
                            type="text"
                            :text="trialFormModel.summary"
                        />
                        <admin-form-details
                            label="Description"
                            type="text"
                            :text="trialFormModel.description"
                        />
                        <admin-form-details
                            label="Is Production"
                            type="checkbox"
                            :text="''"
                            :check-value="trialFormModel.isProduction"
                        />
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper :group-label="crfBranchesGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="crfBranchSearch"
                            element-id="crfBranchSearch"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await branchPaginationList();
                                    globalStore.triggerSearchBarRefocus('#crfBranchSearch');
                                }
                            "
                        />
                        <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditBranchAction('Add')"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Branch</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="crfBranchColumns"
                            :table-data="crfBranchTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="crfBranchSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            :disabled="loading.isDisabled()"
                            @on-row-click="
                                (selectedRow: IBranchData) => {
                                    emit('on-row-select', {
                                        label: selectedRow['branchName'] as string,
                                        module: 'Branch',
                                        page: 'Branch',
                                        data: selectedRow,
                                    });
                                }
                            "
                        >
                            <template #action="{ data, index }">
                                <edc-delete-confirmation
                                    v-if="data.id"
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteBranchConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this branch?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteBranchById(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table-save"
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
        <admin-card-wrapper :group-label="crfVersionsGroupLabel">
            <template #content>
                <!-- <div class="flex flex-col gap-[5rem] w-[30rem]"> -->
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit">
                        <edc-search-bar
                            v-model="crfVersionSearch"
                            element-id="crfVersionSearch"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await crfPaginationList();
                                    globalStore.triggerSearchBarRefocus('#crfVersionSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="crfVersionColumns"
                            :table-data="crfVersionTableData"
                            :loading="
                                checkIfKeyExistsInObject(
                                    'releaseVersionTableData',
                                    loading.dynamicLoading,
                                ) && loading.dynamicLoading['releaseVersionTableData']
                            "
                            :disabled="loading.isDisabled()"
                            pagination-type="none"
                            search-key="crfVersionSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            @on-row-click="
                                (selectedRow: IReleaseVersionTableData) => {
                                    emit('on-row-select', {
                                        label: `${selectedRow.releaseVersionName} (${padCharactersToString(selectedRow.releaseVersionId, 'start')})`,
                                        module: 'CRF Version Settings',
                                        page: 'CRF Version Settings',
                                        data: selectedRow, // selectedRow,
                                    });
                                }
                            "
                        >
                            <template #action="{ data }">
                                <edc-pressable
                                    slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                    loader-type="table"
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => {}"
                                >
                                    <edc-icon
                                        v-tooltip.top="'Schema'"
                                        icon="push-version"
                                        :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                    :disabled="loading.isDisabled()"
                                    loader-type="table"
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: data.releaseVersionName,
                                                module: 'Push CRF Version',
                                                page: 'Push CRF Version',
                                                data: data,
                                            });
                                        }
                                    "
                                >
                                    <span
                                        v-tooltip.top="'Push'"
                                        class="text-[1.3rem] secondary-text inline-block"
                                        >Push</span
                                    >
                                </edc-pressable>
                                <!-- <edc-delete-confirmation
                                    v-if="data.isPublished"
                                    message="Are you sure you want to delete this version?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {
                                            deleteVersion();
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            v-tooltip.top="'Delete'"
                                            :disabled="loading.isDisabled()"
                                            :on-click="() => {}"
                                        >
                                            <edc-icon
                                                icon="close-icon"
                                                :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation> -->
                            </template>
                        </edc-data-table>
                    </div>
                </div>
                <!-- </div> -->
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        v-if="formAction !== 'View'"
        modal-id="adminTrialModal"
        :submit-label="formAction"
        :on-cancel="(closeModal) => closeModal()"
        :on-submit="
            async (closeModal) => {
                await addOrEditTrialApi(closeModal);
            }
        "
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>) are
            required</span
        >
        <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
            <!-- FIXME: -->
            <edc-text-input
                v-model="trialFormModel.trialName"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter name"
                label="Name"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :required="true"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.trialName"
            />
            <edc-dropdown
                :key="`ownerId-${trialFormModel.ownerId ? trialFormModel.ownerId : ''}`"
                v-model="trialFormModel.ownerId"
                container-class="w-[34rem]"
                placeholder="Enter owner"
                label="Owner/Sponsor"
                :options="ownerLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :disabled="loading.isDisabled()"
                :loading="ownerOptions.loading"
                :error="trialErrorModel.ownerName"
                :ellipse-count="50"
            />
            <edc-text-input
                v-model="trialFormModel.protocolNumber"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter protocol number"
                label="Protocol number"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :required="true"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.protocolNumber"
            />
            <edc-text-input
                v-model="trialFormModel.drugOrDevice"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter drug / device"
                label="Drug / Device"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.drugOrDevice"
            />
            <edc-text-input
                v-model="trialFormModel.compoundOrCode"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter compound / code"
                label="Compound / Code"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.compoundOrCode"
            />
            <edc-text-input
                v-model="trialFormModel.program"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter program"
                label="Program"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.program"
            />
            <!-- <edc-text-input
                v-model="trialFormModel.protocol"
                type="text"
                placeholder="Enter protocol"
                label="Protocol"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.protocol"
            /> -->
            <edc-dropdown
                :key="`phaseId-${trialFormModel.phaseId ? trialFormModel.phaseId : ''}`"
                v-model="trialFormModel.phaseId"
                container-class="w-[34rem]"
                placeholder="Enter phase"
                label="Phase"
                :options="phaseLookups"
                :loading="phaseOptions.loading"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.phaseName"
                :ellipse-count="50"
            />
            <edc-text-input
                v-model="trialFormModel.indication"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter indication"
                label="Indication"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.indication"
            />
            <!-- <edc-text-input
                v-model="trialFormModel.responsibleParty"
                type="text"
                placeholder="Enter responsible party"
                label="Responsible Party"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
            /> -->
            <edc-text-input
                v-model="trialFormModel.enrollmentTarget"
                container-class="w-[34rem]"
                type="number"
                placeholder="Enter enrollment target"
                label="Enrollment Target"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.enrollmentTarget as unknown as string"
            />
            <edc-dropdown
                :key="`therapeuticAreaId-${trialFormModel.therapeuticAreaId ? trialFormModel.therapeuticAreaId : ''}`"
                v-model="trialFormModel.therapeuticAreaId"
                container-class="w-[34rem]"
                placeholder="Enter therapeutic area"
                label="Therapeutic Area"
                :options="therapeuticAreaLookups"
                :loading="therapeuticAreaOptions.loading"
                :disabled="loading.isDisabled(therapeuticAreaOptions.loading)"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :error="trialErrorModel.therapeuticAreaName"
                :ellipse-count="50"
            />
            <edc-calendar
                v-model="trialFormModel.liveDate"
                label="Go Live Date"
                picker-placement="right"
                :picker-offset="0"
                container-class="w-[34rem]"
                picker-class="w-[34rem]"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :required="trialFormModel.isProduction"
                :error="trialErrorModel.liveDate"
                :disabled="loading.isDisabled()"
            />
            <edc-calendar
                v-model="trialFormModel.closeDate"
                label="Database Lock Date"
                picker-placement="left"
                :picker-offset="0"
                container-class="w-[34rem]"
                picker-class="w-[34rem]"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :error="trialErrorModel.closeDate"
                :disabled="loading.isDisabled()"
            />
            <edc-text-input
                v-model="trialFormModel.title"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter title"
                label="Title"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.title"
            />
            <edc-text-area
                v-model="trialFormModel.summary"
                container-class="w-[34rem]"
                placeholder="Enter summary"
                label="Summary"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.summary"
            />
            <edc-text-area
                v-model="trialFormModel.description"
                container-class="w-[34rem]"
                placeholder="Enter description"
                label="Description"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="trialErrorModel.description"
            />
            <edc-checkbox
                v-model="trialFormModel.isProduction"
                label="Is Production"
                label-class="font-bold admin-input-font"
                container-class="!flex-row"
                name="isProduction"
                :disabled="loading.isDisabled()"
            />
        </div>
    </edc-popup-modal>
    <edc-popup-modal
        v-if="branchFormAction !== 'View'"
        modal-id="adminBranchModal"
        :submit-label="branchFormAction"
        :on-cancel="(closeModal) => closeModal()"
        :on-submit="
            async (closeModal) => {
                await addOrEditBranchApi(closeModal);
            }
        "
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>) are
            required</span
        >
        <div class="flex flex-row justify-between gap-[2rem]">
            <div class="flex flex-col gap-[0.5rem]">
                <edc-radio
                    key="blankProjectBranch"
                    v-model="branchFormModel.branchType"
                    value="blankProjectBranch"
                    container-class="w-fit"
                    label="Blank Project Branch"
                    name="branchType"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                />
                <edc-radio
                    key="fromProjectVersions"
                    v-model="branchFormModel.branchType"
                    value="fromProjectVersions"
                    container-class="w-fit"
                    label="From Project Versions"
                    name="branchType"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                />
                <edc-radio
                    key="fromGlobalLibraryVersions"
                    v-model="branchFormModel.branchType"
                    value="fromGlobalLibraryVersions"
                    container-class="w-fit"
                    label="From Global Library Versions"
                    name="branchType"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                />
            </div>
            <div class="grid grid-cols-1 gap-x-[5rem] gap-y-[1rem]">
                <edc-text-input
                    v-model="branchFormModel.branchName"
                    container-class="w-[34rem]"
                    type="text"
                    placeholder="Enter name"
                    label="Name"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                    :required="true"
                    :error="branchErrorModel.branchName"
                />
                <edc-text-area
                    v-model="branchFormModel.confirmationMessage"
                    container-class="w-[34rem]"
                    placeholder="Enter message"
                    label="Confirmation Message"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                    :error="branchErrorModel.confirmationMessage"
                />
            </div>
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
