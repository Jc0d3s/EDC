<script setup lang="ts">
    import Branch from "~/services/apis/data/admin/branch";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading from "~/services/apis/data/loading";
    import {
        getPublishedReleaseVersionDetailsAPI,
        overwrittenVersionListByReleaseVersionIdAPI,
        summaryCountByReleaseVersionIDAPI,
        updatePublishedReleaseVersionDetailsAPI,
    } from "~/services/apis/handlers/admin/release-version";
    import {
        publishedFormsListByReleaseVersionIdAPI,
        publishedMatrixListByReleaseVersionIdAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IOverwrittenReleaseVersionData,
        IReleaseVersionSummaryCountData,
    } from "~/services/apis/handlers/types/admin/release-version-types";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type { IWinFormProps, TAdminFormAction, TVoidAction } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ISummaryTableData {
        item: string;
        count: number;
        updated: string;
        includeInDownload?: boolean;
    }

    const getDefaultSummaryCount = (): IReleaseVersionSummaryCountData => ({
        releaseVersionId: 0,
        publishedForms: 0,
        publishedFormsUpdated: "",
        publishedFields: 0,
        publishedFieldsUpdated: "",
        publishedVariables: 0,
        publishedVariablesUpdated: "",
        publishedFolders: 0,
        publishedFoldersUpdated: "",
        publishedMatrices: 0,
        publishedMatricesUpdated: "",
        publishedDataDictionaries: 0,
        publishedDataDictionariesUpdated: "",
        publishedUnitDictionaries: 0,
        publishedUnitDictionariesUpdated: "",
        publishedEditChecks: 0,
        publishedEditChecksUpdated: "",
        publishedDerivations: 0,
        publishedDerivationsUpdated: "",
        publishedLabVariableMappings: 0,
        publishedLabVariableMappingsUpdated: "",
        publishedCustomFunctions: 0,
        publishedCustomFunctionsUpdated: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const branchFormAction = ref<TAdminFormAction>("View");
    const branchFormModel = ref<Branch>(new Branch());
    const branchFormModelRef = ref<Branch>(new Branch());
    const branchErrorModel = ref<Branch>(new Branch());
    const loading = ref<Loading>(new Loading());
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const matrixOptions = ref<DropdownOption>(new DropdownOption());
    const releaseSummaryCountDetails = ref<IReleaseVersionSummaryCountData>({
        ...getDefaultSummaryCount(),
    });
    const crfReleaseVersionSummaryTableData = ref<ISummaryTableData[]>([]);

    const crfReleaseVersionSummaryColumns: IColumn[] = [
        {
            field: "item",
            header: "Item",
            icon: false,
            show: true,
        },
        {
            field: "count",
            header: "Count",
            icon: false,
            show: true,
        },
        {
            field: "updated",
            header: "Updated",
            icon: false,
            show: true,
        },
        {
            field: "includeInDownload",
            header: "Include in Download",
            icon: false,
            show: true,
        },
    ];

    const crfVersionOverwriteTableData = ref<IOverwrittenReleaseVersionData[]>([]);

    const crfReleaseVersionOverwrittenColumns: IColumn[] = [
        {
            field: "overwrittenOn",
            header: "Overwritten Date",
            icon: false,
            show: true,
        },
        {
            field: "overwrittenBy",
            header: "Overwritten By",
            icon: false,
            show: true,
        },
    ];

    const branchSettingsGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `CRF Version Settings - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "CRF Version Settings",
    );

    const branchSummaryGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `CRF Version Summary / Download - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "CRF Version Summary / Download",
    );

    const overwrittenHistoryGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Overwritten Version History - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Overwritten Version History",
    );

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));

    const matrixLookups = computed(() => getOptionsList(matrixOptions.value.options, "name", "id"));

    function addOrEditBranchAction(type: TAdminFormAction) {
        branchFormAction.value = type;
        popupModalStore.show("adminBranchModal");
    }

    function resetBranchFormModel(closeModal?: TVoidAction) {
        branchFormModel.value.reset(branchFormModelRef.value);
        if (closeModal) closeModal();
        branchFormAction.value = "View";
    }

    async function getPublishedReleaseVersionDetails(releaseVersionId: number) {
        loading.value.form = true;
        const { status, data, message } =
            await getPublishedReleaseVersionDetailsAPI(releaseVersionId);
        if (status === 200) {
            branchFormModel.value.id = data.id;
            branchFormModel.value.trialId = data.trialId;
            branchFormModel.value.branchName = data.releaseVersionName;
            branchFormModel.value.confirmationMessage = data.confirmationMessage;
            branchFormModel.value.isGlobal = data.isGlobal;
            branchFormModel.value.signaturePrompt = data.signaturePrompt;
            branchFormModel.value.primaryForm = data.primaryForm;
            branchFormModel.value.primaryFormName = data.primaryFormName;
            branchFormModel.value.defaultMatrix = data.defaultMatrix;
            branchFormModel.value.defaultMatrixName = data.defaultMatrixName;
            branchFormModel.value.lockCRFVersion = data.lockCRFVersion;

            branchFormModelRef.value.id = data.id;
            branchFormModelRef.value.trialId = data.trialId;
            branchFormModelRef.value.branchName = data.releaseVersionName;
            branchFormModelRef.value.confirmationMessage = data.confirmationMessage;
            branchFormModelRef.value.isGlobal = data.isGlobal;
            branchFormModelRef.value.signaturePrompt = data.signaturePrompt;
            branchFormModelRef.value.primaryForm = data.primaryForm;
            branchFormModelRef.value.primaryFormName = data.primaryFormName;
            branchFormModelRef.value.defaultMatrix = data.defaultMatrix;
            branchFormModelRef.value.defaultMatrixName = data.defaultMatrixName;
            branchFormModelRef.value.lockCRFVersion = data.lockCRFVersion;
        } else {
            branchFormModel.value = new Branch();
            branchFormModelRef.value = new Branch();
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function validateAll() {
        if (!branchFormModel.value.branchName)
            branchErrorModel.value.branchName = "Please enter a name";
        else if (getStringLength(branchFormModel.value.branchName) > 50)
            branchErrorModel.value.branchName = "Name cannot be more than 256 characters";
        else branchErrorModel.value.branchName = "";
        if (getStringLength(branchFormModel.value.confirmationMessage) > 256)
            branchErrorModel.value.confirmationMessage =
                "Message cannot be more than 256 characters";
        else branchErrorModel.value.confirmationMessage = "";
        if (!branchFormModel.value.signaturePrompt)
            branchErrorModel.value.signaturePrompt = "Please enter a signature prompt";
        else if (getStringLength(branchFormModel.value.signaturePrompt) > 256)
            branchErrorModel.value.signaturePrompt =
                "Signature prompt cannot be more than 256 characters";
        else branchErrorModel.value.signaturePrompt = "";
        // if (!branchFormModel.value.defaultMatrix)
        //     branchErrorModel.value.defaultMatrixName = "Please select a default matrix";
        // else branchErrorModel.value.defaultMatrixName = "";
        if (!branchFormModel.value.primaryForm)
            branchErrorModel.value.primaryFormName = "Please select a primary form";
        else branchErrorModel.value.primaryFormName = "";
    }

    async function editBranchApi(closeModal: TVoidAction) {
        validateAll();
        if (!checkIfModelHasErrors(branchErrorModel.value, ["branchType"])) {
            loading.value.form = true;
            const { status, message, validationErrors } =
                await updatePublishedReleaseVersionDetailsAPI({
                    confirmationMessage: branchFormModel.value.confirmationMessage as string,
                    id: Number(branchFormModel.value.id),
                    isGlobal: branchFormModel.value.isGlobal,
                    trialId: Number(props.tabData[props.activeTab.label].data.trialId),
                    trialName: "",
                    primaryForm: branchFormModel.value.primaryForm,
                    defaultMatrix: branchFormModel.value.defaultMatrix,
                    defaultMatrixName: branchFormModel.value.defaultMatrixName,
                    primaryFormName: branchFormModel.value.primaryFormName,
                    signaturePrompt: branchFormModel.value.signaturePrompt,
                    lockCRFVersion: branchFormModel.value.lockCRFVersion,
                    releaseVersionId: props.tabData[props.activeTab.label].data.id,
                    releaseVersionName:
                        props.tabData[props.activeTab.label].data.releaseVersionName,
                    updatedBy: 0,
                });
            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                closeModal();
                resetBranchFormModel(closeModal);
                await getPublishedReleaseVersionDetails(
                    Number(props.tabData[props.activeTab.label].data.id),
                );
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
        // trialGroupFormModel.value.reset();
    }

    async function formList() {
        formOptions.value.loading = true;
        const { status, data } = await publishedFormsListByReleaseVersionIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            formOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            formOptions.value.options = [];
        }
        formOptions.value.loading = false;
    }

    async function matricesList() {
        matrixOptions.value.loading = true;
        const { status, data } = await publishedMatrixListByReleaseVersionIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            matrixOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            matrixOptions.value.options = [];
        }
        matrixOptions.value.loading = false;
    }

    function setSummaryCountTableData(
        details: IReleaseVersionSummaryCountData,
    ): ISummaryTableData[] {
        const result: ISummaryTableData[] = [];
        const items = [
            "Forms",
            "Fields",
            "Variables",
            "Folders",
            "Edit Checks",
            // "Valid Checks",
            // "Invalid Checks",
            "Derivations",
            "Data Dictionaries",
            "Unit Dictionaries",
            "Matrices",
            "Lab Variable Mappings",
            "Custom Functions",
        ];
        for (const row of items) {
            const obj: ISummaryTableData = {
                count: 0,
                item: row,
                updated: "",
                includeInDownload: true,
            };
            switch (row) {
                case "Forms": {
                    obj.count = details.publishedForms;
                    obj.updated = details.publishedFormsUpdated;
                    break;
                }
                case "Fields": {
                    obj.count = details.publishedFields;
                    obj.updated = details.publishedFieldsUpdated;
                    break;
                }
                case "Variables": {
                    obj.count = details.publishedVariables;
                    obj.updated = details.publishedVariablesUpdated;
                    break;
                }
                case "Folders": {
                    obj.count = details.publishedFolders;
                    obj.updated = details.publishedFoldersUpdated;
                    break;
                }
                case "Edit Checks": {
                    obj.count = details.publishedEditChecks;
                    obj.updated = details.publishedEditChecksUpdated;
                    break;
                }
                case "Valid Checks": {
                    // TODO: need to work on this
                    obj.count = 0;
                    obj.updated = "";
                    obj.includeInDownload = undefined;
                    break;
                }
                case "Invalid Checks": {
                    // TODO: need to work on this
                    obj.count = 0;
                    obj.updated = "";
                    obj.includeInDownload = undefined;
                    break;
                }
                case "Derivations": {
                    obj.count = details.publishedDerivations;
                    obj.updated = details.publishedDerivationsUpdated;
                    break;
                }
                case "Data Dictionaries": {
                    obj.count = details.publishedDataDictionaries;
                    obj.updated = details.publishedDataDictionariesUpdated;
                    break;
                }
                case "Unit Dictionaries": {
                    obj.count = details.publishedUnitDictionaries;
                    obj.updated = details.publishedUnitDictionariesUpdated;
                    break;
                }
                case "Matrices": {
                    obj.count = details.publishedMatrices;
                    obj.updated = details.publishedMatricesUpdated;
                    break;
                }
                case "Lab Variable Mappings": {
                    obj.count = details.publishedLabVariableMappings;
                    obj.updated = details.publishedLabVariableMappingsUpdated;
                    break;
                }
                case "Custom Functions": {
                    obj.count = details.publishedCustomFunctions;
                    obj.updated = details.publishedCustomFunctionsUpdated;
                    break;
                }
                default: {
                    obj.count = 0;
                    obj.updated = "";
                    break;
                }
            }
            result.push({ ...obj });
        }
        return result;
    }

    async function summaryCountByReleaseVersionID() {
        loading.value.secondaryTable = true;
        const { status, message, data } = await summaryCountByReleaseVersionIDAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            releaseSummaryCountDetails.value = deepClone(data);
            crfReleaseVersionSummaryTableData.value = deepClone(setSummaryCountTableData(data));
        } else if (status !== 401) {
            releaseSummaryCountDetails.value = { ...getDefaultSummaryCount() };
            crfReleaseVersionSummaryTableData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }

    const { isModelChanged: isBranchModelChanged } = useUnsavedAlert(
        branchFormModel.value,
        branchFormModelRef.value,
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
            if (newTriggerFormActionAlert === "reset" && isBranchModelChanged.value) {
                branchFormModel.value = deepClone(branchFormModelRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
                branchFormAction.value = "View";
                popupModalStore.hide("adminBranchModal");
            }
        },
    );

    async function overwrittenVersionListByReleaseVersionId() {
        loading.value.dynamicLoading["overwrittenHistory"] = true;
        const { status, data } = await overwrittenVersionListByReleaseVersionIdAPI(
            Number(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            crfVersionOverwriteTableData.value = deepClone(data);
        } else if (status !== 401) {
            crfVersionOverwriteTableData.value = [];
        }
        loading.value.dynamicLoading["overwrittenHistory"] = false;
    }

    onMounted(async () => {
        loading.value.setDynamicLoading([
            "releaseVersionTableData",
            "releaseVersionPublish",
            "overwrittenHistory",
        ]);
        await getPublishedReleaseVersionDetails(
            Number(props.tabData[props.activeTab.label].data.id),
        );
        Promise.all([
            formList(),
            matricesList(),
            summaryCountByReleaseVersionID(),
            overwrittenVersionListByReleaseVersionId(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="branchSettingsGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="flex flex-row items-center self-start gap-[1rem]">
                        <edc-pressable
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditBranchAction('Update')"
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
                    <div :class="['grid grid-cols-2 gap-[1rem]']">
                        <!-- <div :class="['grid grid-cols-3 gap-[1rem]']"> -->
                        <admin-form-details
                            label="Branch Name"
                            type="text"
                            :text="branchFormModel.branchName"
                        />
                        <admin-form-details
                            label="Confirmation Message"
                            type="text"
                            :text="branchFormModel.confirmationMessage"
                        />
                        <admin-form-details
                            label="Signature Prompt"
                            type="text"
                            :text="branchFormModel.signaturePrompt"
                        />
                        <admin-form-details
                            label="Primary Form"
                            type="text"
                            :text="branchFormModel.primaryFormName"
                        />
                        <admin-form-details
                            label="Default Matrix"
                            type="text"
                            :text="branchFormModel.defaultMatrixName"
                        />
                        <admin-form-details
                            label="Lock CRF Version"
                            type="checkbox"
                            :text="''"
                            :check-value="branchFormModel.lockCRFVersion"
                        />
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper
            v-if="getArrayLength(crfVersionOverwriteTableData) > 0"
            :group-label="overwrittenHistoryGroupLabel"
            container-class="col-span-1"
        >
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div>
                        <edc-data-table
                            :columns="crfReleaseVersionOverwrittenColumns"
                            :table-data="crfVersionOverwriteTableData"
                            :loading="loading.dynamicLoading['overwrittenHistory']"
                            :disabled="loading.isDisabled()"
                            pagination-type="none"
                            table-style="outlined"
                            :custom-content="true"
                        >
                            <template #custom-content="{ data }">
                                <td class="font-normal text-left font-12 custom-row">
                                    <span>{{
                                        formatDate(data.overwrittenDate, "DD MMM YYYY HH:mm:ss A")
                                    }}</span>
                                </td>
                                <td class="font-normal text-left font-12 custom-row">
                                    <span>{{ data.name }}</span>
                                </td>
                            </template>
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper :group-label="branchSummaryGroupLabel" container-class="col-span-1">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div>
                        <edc-data-table
                            :columns="crfReleaseVersionSummaryColumns"
                            :table-data="crfReleaseVersionSummaryTableData"
                            :loading="loading.secondaryTable"
                            :disabled="loading.isDisabled()"
                            pagination-type="none"
                            table-style="outlined"
                            :custom-content="true"
                        >
                            <template #custom-content="{ data }">
                                <td class="font-normal text-left font-12 custom-row">
                                    <span
                                        :class="[
                                            typeof data.includeInDownload === 'undefined'
                                                ? 'ml-[2rem]'
                                                : '',
                                        ]"
                                        >{{ data.item }}</span
                                    >
                                </td>
                                <td class="font-normal text-left font-12 custom-row">
                                    <span>{{ data.count }}</span>
                                </td>
                                <td class="font-normal text-left font-12 custom-row">
                                    <span v-if="data.updated">{{
                                        formatDate(data.updated, "DD MMM YYYY")
                                    }}</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        v-if="typeof data.includeInDownload !== 'undefined'"
                                        v-model="data.includeInDownload"
                                        name="includeInDownload"
                                    />
                                </td>
                            </template>
                        </edc-data-table>
                    </div>
                    <div class="flex flex-col gap-[0.2rem] self-end">
                        <edc-checkbox
                            label="Protect Worksheets"
                            label-class="admin-input-font"
                            name="protectWorksheets"
                        />
                        <edc-checkbox
                            label="Exclude Validations"
                            label-class="admin-input-font"
                            name="excludeValidations"
                        />
                        <a
                            class="transition-all cursor-pointer flex flex-row items-center font-12 text-[var(--color-secondary)] underline hover:text-[var(--color-secondary-hover)]"
                        >
                            <edc-icon
                                icon="download"
                                :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                fill="var(--color-secondary)"
                            />
                            <span>Download</span>
                        </a>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        modal-id="adminBranchModal"
        :submit-label="branchFormAction"
        :on-cancel="(closeModal) => closeModal()"
        :on-submit="async (closeModal) => await editBranchApi(closeModal)"
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>) are
            required</span
        >
        <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
            <edc-text-input
                v-model="branchFormModel.branchName"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter name"
                label="Name"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :required="true"
                :error="branchErrorModel.branchName"
                :disabled="loading.isDisabled(true)"
            />
            <edc-text-area
                v-model="branchFormModel.confirmationMessage"
                container-class="w-[34rem]"
                placeholder="Enter message"
                label="Confirmation message"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :error="branchErrorModel.confirmationMessage"
                :disabled="loading.isDisabled(true)"
            />
            <edc-text-area
                v-model="branchFormModel.signaturePrompt"
                container-class="w-[34rem]"
                placeholder="Enter prompt"
                label="Signature prompt"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :required="true"
                :error="branchErrorModel.signaturePrompt"
                :disabled="loading.isDisabled(true)"
            />
            <edc-dropdown
                v-model="branchFormModel.primaryForm"
                container-class="w-[34rem]"
                placeholder="Select a form"
                label="Primary Form"
                :options="formLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :loading="formOptions.loading"
                :disabled="loading.isDisabled(true)"
                :error="branchErrorModel.primaryFormName"
                :ellipse-count="50"
            />
            <edc-dropdown
                v-model="branchFormModel.defaultMatrix"
                container-class="w-[34rem]"
                placeholder="Select a matrix"
                label="Default Matrix"
                :options="matrixLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="false"
                :loading="matrixOptions.loading"
                :disabled="loading.isDisabled(matrixOptions.loading, true)"
                :error="branchErrorModel.defaultMatrixName"
                :ellipse-count="50"
            />
            <edc-checkbox
                v-model="branchFormModel.lockCRFVersion"
                label="Lock CRF Version"
                label-class="font-bold admin-input-font"
                container-class="!flex-row"
                name="lockCRFVersion"
                :disabled="loading.isDisabled()"
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
