<script setup lang="ts">
    import Trial from "~/services/apis/data/admin/trial";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { therapeuticAreaListAPI } from "~/services/apis/handlers/admin/therapeutic-area";
    import {
        createTrialAPI,
        trialPaginationListAPI,
        trialByIdAPI,
        trialPhasesListAPI,
        updateTrialAPI,
        deleteTrialAPI,
    } from "~/services/apis/handlers/admin/trial";
    import { listUsersByRoleAPI } from "~/services/apis/handlers/admin/user";
    import type { ITrialData } from "~/services/apis/handlers/types/admin/trial-types";
    import type { IUserData, IUserRoleData } from "~/services/apis/handlers/types/user-types";
    import useGlobalStore from "~/stores/global";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IWinFormProps,
        TAdminFormAction,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });
    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITrialData>];
    }>();
    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const formAction = ref<TAdminFormAction>("View");
    const trialSearch = ref<TNullableString>(null);
    const globalTrialSearch = ref<TNullableString>(null);
    const trialFormModel = ref<Trial>(new Trial());
    const trialFormModelRef = ref<Trial>(new Trial());
    const trialErrorModel = ref<Trial>(new Trial());
    const loading = ref<Loading>(new Loading());
    const activeTrialColumns: IColumn[] = [
        {
            field: "trialName",
            header: "Active Trials",
            icon: false,
            show: true,
        },
    ];
    const activeTrialTableData = ref<ITrialData[]>([]);

    const activeGlobalTrialsColumns: IColumn[] = [
        {
            field: "activeGlobalLibraryVolumes",
            header: "Active Global Library Volumes",
            icon: false,
            show: true,
        },
    ];
    const activeGlobalTrialsTableData = ref<
        {
            "Active Global Library Volumes": string;
        }[]
    >([]);

    const tableLoaderDetails = ref<TTableLoaderDetail>({});
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

    const activeTrialsGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Active Trials - ${props.tabData[props.activeTab.label].data.trialGroupName}`
            : "Active Trials",
    );
    const globalTrialsGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Global Trials - ${props.tabData[props.activeTab.label].data.trialGroupName}`
            : "Global Trials",
    );

    function resetFormModel(closeModal?: TVoidAction) {
        trialFormModel.value = new Trial();
        trialFormModelRef.value = new Trial();
        trialErrorModel.value = new Trial();
        if (closeModal) {
            formAction.value = "View";
            closeModal();
        }
    }

    async function createOrUpdateTrial(closeModal: TVoidAction) {
        loading.value.form = true;
        let status = 500;
        let message = "";
        let validationErrorsData = null;
        const requestData = {
            id: (trialFormModel.value.id as number) || 0,
            trialGroupId: Number(props.tabData[props.activeTab.label].data.id),
            trialName: trialFormModel.value.trialName as string,
            // ownerId: Number(
            //     getDropdownValueByLabel(ownerLookups.value, trialFormModel.value.ownerId),
            // ),
            ownerId: Number(trialFormModel.value.ownerId),
            protocolNumber: trialFormModel.value.protocolNumber || "",
            drugOrDevice: trialFormModel.value.drugOrDevice || "",
            compoundOrcode: trialFormModel.value.compoundOrCode || "",
            program: trialFormModel.value.program || "",
            protocol: trialFormModel.value.protocol || "",
            // phase: trialFormModel.value.phaseId
            //     ? getDropdownLabelByValue(phaseLookups.value, trialFormModel.value.phaseId)
            //     : null,
            phaseId: trialFormModel.value.phaseId,
            indication: trialFormModel.value.indication || "",
            enrollmentTarget: trialFormModel.value.enrollmentTarget || 0,
            // primaryInvestigator: getDropdownValueByLabel(
            //     investigatorLookups.value,
            //     trialFormModel.value.primaryInvestigator,
            // ) as TNullableNumber,
            // secondaryInvestigator: getDropdownValueByLabel(
            //     investigatorLookups.value,
            //     trialFormModel.value.secondaryInvestigator,
            // ) as TNullableNumber,
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
        if (formAction.value === "Add") {
            const {
                status: apiStatus,
                message: apiMessage,
                validationErrors: apiValidationErrors,
            } = await createTrialAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            validationErrorsData = apiValidationErrors;
        } else if (formAction.value === "Update") {
            const {
                status: apiStatus,
                message: apiMessage,
                validationErrors: apiValidationErrors,
            } = await updateTrialAPI(requestData);
            status = apiStatus;
            message = apiMessage;
            validationErrorsData = apiValidationErrors;
        }
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            resetFormModel(closeModal);
            await listByTrialGroupId();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            if (status === 400 && validationErrorsData) {
                setAPIValidationErrors(validationErrorsData, trialErrorModel.value);
            }
        }
        loading.value.form = false;
    }

    function validateAll() {
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
        validateAll();
        if (!checkIfModelHasErrors(trialErrorModel.value, ["isProduction"])) {
            await createOrUpdateTrial(closeModal);
        }
        // trialGroupFormModel.value.reset();
    }

    async function listByTrialGroupId() {
        loading.value.table = true;
        const { data, status, message } = await trialPaginationListAPI(
            getAPIFilters({
                search: trialSearch.value,
                filter: {
                    trialGroupId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            activeTrialTableData.value = deepClone(
                items.map((row) => ({
                    ...row,
                })),
            );
            tableLoaderDetails.value = setLoaderForArrayDatas(items);
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            activeTrialTableData.value = [];
        }
        loading.value.table = false;
    }

    async function trialByID(trialGroupID: number) {
        loading.value.form = true;
        const { data, status, message } = await trialByIdAPI(trialGroupID);
        if (status === 200) {
            trialFormModel.value.id = trialGroupID;
            trialFormModel.value.trialName = data.trialName; // FIXME:
            trialFormModel.value.trialGroupId = data.trialGroupId;
            trialFormModel.value.ownerId = data.ownerId;
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

            trialFormModelRef.value.id = trialGroupID;
            trialFormModelRef.value.trialName = data.trialName; // FIXME:
            trialFormModelRef.value.trialGroupId = data.trialGroupId;
            trialFormModelRef.value.ownerId = data.ownerId;
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
            resetFormModel();
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

    async function addOrEditOrDeleteTrialAction(type: TAdminFormAction, trialDetails?: ITrialData) {
        formAction.value = type;
        if (type === "Update") {
            await trialByID(trialDetails ? Number(trialDetails.id) : 0);
        } else if (type === "Delete") {
            trialFormModel.value.id = Number(trialDetails?.id || 0);
            trialFormModelRef.value.id = Number(trialDetails?.id || 0);
        }
        popupModalStore.show("adminTrialModal");
        if (
            getArrayLength(therapeuticAreaOptions.value.options) === 0 ||
            getArrayLength(ownerOptions.value.options) === 0 ||
            getArrayLength(phaseOptions.value.options) === 0
        )
            Promise.all([getTherapeuticAreas(), getOwnerUserTypes(), getTrialPhases()]);
    }

    async function deleteTrial(trialId: string) {
        loading.value.form = true;
        const { status, message } = await deleteTrialAPI(trialId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await listByTrialGroupId();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        trialFormModel.value,
        trialFormModelRef.value,
    );

    watch(
        () => trialFormModel.value,
        (newTrialFormModel) => {
            model.value = newTrialFormModel;
            modelRef.value = trialFormModelRef.value;
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
                trialFormModel.value = deepClone(trialFormModelRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
                formAction.value = "View";
                popupModalStore.hide("adminTrialModal");
            }
        },
    );

    onMounted(async () => {
        await listByTrialGroupId();
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="activeTrialsGroupLabel">
            <template #content>
                <div class="flex flex-col">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="w-fit flex flex-row items-center gap-[1rem]">
                            <edc-search-bar
                                v-model="trialSearch"
                                element-id="trialSearch"
                                :disabled="loading.isDisabled()"
                                input-class="admin-input-font"
                                @on-search="
                                    async () => {
                                        await listByTrialGroupId();
                                        useGlobalStore().triggerSearchBarRefocus('#trialSearch');
                                    }
                                "
                            />
                            <edc-pressable
                                container-class="!justify-start"
                                slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                :on-click="() => addOrEditOrDeleteTrialAction('Add')"
                                :disabled="loading.isDisabled()"
                            >
                                <edc-icon
                                    icon="circle-plus"
                                    :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                />
                                <span class="text-[1.3rem] secondary-text">Add Trial</span>
                            </edc-pressable>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="activeTrialColumns"
                                :table-data="activeTrialTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="trialSearch"
                                table-style="outlined"
                                :enable-row-click="true"
                                @on-row-click="
                                    (selectedRow: ITrialData) => {
                                        emit('on-row-select', {
                                            label: selectedRow.trialName,
                                            module: 'Trial',
                                            page: 'Trial',
                                            data: selectedRow,
                                        });
                                    }
                                "
                            >
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        :disabled="loading.table || loading.form"
                                        loader-type="table"
                                        :on-click="
                                            () => {
                                                addOrEditOrDeleteTrialAction('Update', data);
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                    <!-- :is-show="
                                            checkIfKeyExistsInObject(data.id, trialDelete) &&
                                            trialDelete[data.id]
                                        " -->
                                    <edc-delete-confirmation
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteTrialConfirmation`"
                                        message="Are you sure you want to delete this trial?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteTrial(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                :disabled="loading.isDisabled()"
                                                loader-type="table-save"
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
        <admin-card-wrapper :group-label="globalTrialsGroupLabel">
            <template #content>
                <div class="flex flex-col">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="w-fit flex flex-row items-center gap-[1rem]">
                            <edc-search-bar
                                v-model="globalTrialSearch"
                                element-id="globalTrialSearch"
                                :disabled="loading.isDisabled()"
                                input-class="admin-input-font"
                            />
                            <edc-pressable
                                container-class="!justify-start"
                                slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                :on-click="() => {}"
                                :disabled="loading.isDisabled()"
                            >
                                <edc-icon
                                    icon="circle-plus"
                                    :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                />
                                <span class="text-[1.3rem] secondary-text">Add Global Trial</span>
                            </edc-pressable>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="activeGlobalTrialsColumns"
                                :table-data="activeGlobalTrialsTableData"
                                :loading="loading.secondaryTable"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="globalTrialSearch"
                                table-style="outlined"
                                :enable-row-click="true"
                                @on-row-click="
                                    () => {
                                        // emit('on-row-select', {
                                        //     label: selectedRow['Active Global Library Volumes'],
                                        //     module: 'Trial',
                                        //     page: 'Trial',
                                        //     data: selectedRow,
                                        // });
                                    }
                                "
                            >
                                <template #action>
                                    <edc-pressable
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => {}"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                </template>
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <!-- <admin-card-wrapper>
            <template #content>
                <div>
                    <edc-pressable :on-click="() => parallelExecution()"> parallel </edc-pressable>
                </div>
            </template>
        </admin-card-wrapper> -->
        <!-- <div class="flex flex-row items-center gap-[10rem]">
            <div class="flex flex-col gap-[1rem] w-[20rem]">
                <edc-search-bar v-model="globalProjectSearch" element-id="globalProjectSearch" />
                <div>
                    <edc-data-table
                        :columns="activeGlobalTrialsColumns"
                        :table-data="activeGlobalProjectsTableData"
                        :pagination-model="activeGlobalProjectsPagination"
                        :loading="false"
                        pagination-type="lazy"
                        empty-message="No Messages"
                        search-key="globalProjectSearch"
                    />
                </div>
            </div>
        </div> -->
        <edc-popup-modal
            modal-id="adminTrialModal"
            :submit-label="formAction"
            :on-cancel="(closeModal) => resetFormModel(closeModal)"
            :on-submit="async (closeModal) => await addOrEditTrialApi(closeModal)"
        >
            <!-- <div class="flex flex-col items-start w-[30rem] gap-[0.5rem]"> -->
            <span class="text-[1.2rem] font-semibold self-start"
                >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>)
                are required</span
            >
            <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
                <!-- <div class="columns-2"> -->
                <!-- FIXME: -->
                <edc-text-input
                    v-model="trialFormModel.trialName"
                    container-class="w-[34rem]"
                    type="text"
                    placeholder="Enter name"
                    label="Name"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                    :required="true"
                    :error="trialErrorModel.trialName"
                />
                <edc-dropdown
                    :key="`ownerId-${trialFormModel.ownerId ? trialFormModel.ownerId : ''}`"
                    v-model="trialFormModel.ownerId"
                    container-class="w-[34rem]"
                    placeholder="Enter owner"
                    label="Owner/Sponsor"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="ownerLookups"
                    :loading="ownerOptions.loading"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :required="true"
                    :disabled="loading.isDisabled()"
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
                />
                <!-- <edc-text-input
                    v-model="trialFormModel.protocol"
                    type="text"
                    placeholder="Enter protocol"
                    label="Protocol"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                /> -->
                <edc-dropdown
                    :key="`phaseId-${trialFormModel.phaseId ? trialFormModel.phaseId : ''}`"
                    v-model="trialFormModel.phaseId"
                    placeholder="Enter phase"
                    label="Phase"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    option-placement="bottom"
                    container-class="w-[34rem]"
                    option-class="w-[34rem]"
                    :options="phaseLookups"
                    :loading="phaseOptions.loading"
                    :required="true"
                    :disabled="loading.isDisabled(phaseOptions.loading)"
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
                />
                <!-- <edc-text-input
                    v-model="trialFormModel.responsibleParty"
                    type="text"
                    placeholder="Enter responsible party"
                    label="Responsible Party"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.table || loading.form"
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
                />
                <edc-dropdown
                    :key="`therapeuticAreaId-${trialFormModel.therapeuticAreaId ? trialFormModel.therapeuticAreaId : ''}`"
                    v-model="trialFormModel.therapeuticAreaId"
                    container-class="w-[34rem]"
                    placeholder="Enter therapeutic area"
                    label="Therapeutic Area"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :options="therapeuticAreaLookups"
                    option-placement="bottom"
                    option-class="w-[34rem]"
                    :loading="therapeuticAreaOptions.loading"
                    :disabled="loading.isDisabled(therapeuticAreaOptions.loading)"
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
                />
                <edc-text-area
                    v-model="trialFormModel.summary"
                    container-class="w-[34rem]"
                    placeholder="Enter summary"
                    label="Summary"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                />
                <edc-text-area
                    v-model="trialFormModel.description"
                    container-class="w-[34rem]"
                    placeholder="Enter description"
                    label="Description"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
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
    </div>
</template>

<style scoped></style>
