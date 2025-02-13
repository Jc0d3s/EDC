<script setup lang="ts">
    import { type TLogDirection } from "~/services/apis/data/admin/form";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import { FORM_TYPES, LOG_DIRECTION_OPTIONS } from "~/constants/options";
    import Loading from "~/services/apis/data/loading";
    import useToastStore from "~/stores/toast";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import {
        publishedFormPaginationListAPI,
        publishedTrialVisitListByReleaseVersionIdAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type { IPublishedFormData } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import { getPublishedReleaseVersionDetailsAPI } from "~/services/apis/handlers/admin/release-version";
    import useGlobalStore from "~/stores/global";

    interface ITableData {
        id: TNullableNumber;
        releaseVersionId: number;
        releaseVersionName: TNullableString;
        formName: TNullableString;
        formOId: TNullableString;
        helpText: TNullableString;
        noOfFields: number; // *
        isActive: boolean; // *
        isVisible: boolean;
        isLabForm: boolean;
        isNavigateToSubjectDisposition: boolean;
        otherVisit: boolean;
        isCommon: boolean;
        logDirection: TLogDirection | null;
        saveConfirm: boolean;
        redirectLink: TNullableString;
        redirectFolderId: TNullableNumber;
        redirectFormId: TNullableNumber;
        patientCloudForm: boolean;
        signatureRequired: boolean; // *
        formOrderNumber: number;
        isTemplate: boolean;
        tempID: string;
        formType: TNullableNumber;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const loading = ref<Loading>(new Loading());

    const formSearch = ref<TNullableString>(null);
    const formColumns = () => {
        const columns: IColumn[] = [
            {
                field: "formName",
                header: "Form Name",
                icon: false,
                show: true,
                sort: false,
            },
            {
                field: "formOId",
                header: "OID",
                icon: false,
                show: true,
            },
            {
                field: "helpText",
                header: "Help Text",
                icon: false,
                show: true,
            },
            {
                field: "noOfFields",
                header: "#Fields",
                icon: false,
                show: true,
            },
            {
                field: "isActive",
                header: "Active",
                icon: false,
                show: true,
            },
            {
                field: "isVisible",
                header: "Visible",
                icon: false,
                show: true,
            },
            {
                field: "isTemplate",
                header: "Template",
                icon: false,
                show: true,
            },
            {
                field: "otherVisit",
                header: "Other Visit",
                icon: false,
                show: true,
            },
            {
                field: "isCommon",
                header: "Is Common Form",
                icon: false,
                show: true,
            },
            {
                field: "isLabForm",
                header: "Is Lab Form",
                icon: false,
                show: true,
            },
            {
                field: "isNavigateToSubjectDisposition",
                header: "Navigate to Subject Disposition",
                icon: false,
                show: true,
            },
            {
                field: "formType",
                header: "Form Type",
                icon: false,
                show: true,
            },
            {
                field: "logDirection",
                header: "Log Direction",
                icon: false,
                show: true,
            },
            {
                field: "signatureRequired",
                header: "Signature Required",
                icon: false,
                show: true,
            },
            {
                field: "patientCloudForm",
                header: "Patient Cloud Form",
                icon: false,
                show: true,
            },
        ];
        // if (
        //     props.tabData &&
        //     props.tabLabel &&
        //     checkIfKeyExistsInObject("tabLabel", props.tabData) &&
        //     checkIfKeyExistsInObject("confirmationMessage", props.tabData[props.tabLabel]) &&
        //     props.tabData[props.tabLabel].confirmationMessage
        // ) {
        if (confirmationMessage.value) {
            columns.splice(
                13, // 8
                0,
                {
                    field: "saveConfirm",
                    header: "Save Confirm",
                    icon: false,
                    show: true,
                },
                {
                    field: "redirectLink",
                    header: "Redirect",
                    icon: false,
                    show: true,
                },
            );
        }
        return columns;
    };
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const folderOptions = ref<DropdownOption>(new DropdownOption());

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));
    const folderLookups = computed(() => getOptionsList(folderOptions.value.options, "name", "id"));

    const confirmationMessage = computed(() =>
        props.tabData &&
        props.activeTab.label &&
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData) &&
        checkIfKeyExistsInObject("data", props.tabData[props.activeTab.label]) &&
        props.tabData[props.activeTab.label].data &&
        checkIfKeyExistsInObject("confirmationMessage", props.tabData[props.activeTab.label].data)
            ? props.tabData[props.activeTab.label].data.confirmationMessage
            : "",
    );
    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Forms - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Forms",
    );

    async function getPublishedReleaseVersionDetails() {
        const { status, data } = await getPublishedReleaseVersionDetailsAPI(
            Number(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            props.tabData[props.activeTab.label].data["confirmationMessage"] =
                data.confirmationMessage;
        } else {
            props.tabData[props.activeTab.label].data["confirmationMessage"] = null;
        }
    }

    function setTableData(tableData: IPublishedFormData[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            releaseVersionId: row.releaseVersionId,
            releaseVersionName: row.releaseVersionName,
            formName: row.formName,
            formOId: row.formOID,
            helpText: row.helpText,
            otherVisit: row.otherVisit,
            isLabForm: row.isLabForm,
            isNavigateToSubjectDisposition: row.isNavigateToSubjectDisposition,
            logDirection: row.logDirection,
            saveConfirm: row.saveConfirm,
            redirectLink: row.redirectLink || "No link",
            redirectFolderId: row.redirectFolderId,
            redirectFormId: row.redirectFormId,
            patientCloudForm: row.patientCloudForm,
            formOrderNumber: row.formOrderNumber,
            isTemplate: row.isTemplate,
            noOfFields: Number(row.noOfFields),
            isActive: row.isActive,
            signatureRequired: row.signatureRequired,
            isVisible: row.isVisible,
            isCommon: row.isCommon,
            formType: row.formType,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function publishedFormPaginationList() {
        loading.value.table = true;
        formOptions.value.loading = true;
        const { status, data, message } = await publishedFormPaginationListAPI(
            getAPIFilters({
                search: formSearch.value,
                filter: {
                    releaseVersionId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            formTableData.value = deepClone(tableData);
            formTableDataRef.value = deepClone(tableData);
            formOptions.value.options = deepClone(items);
        } else if (status !== 401) {
            formTableData.value = [];
            formTableDataRef.value = [];
            formOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        formOptions.value.loading = false;
        loading.value.table = false;
    }

    async function foldersList() {
        folderOptions.value.loading = true;
        const { status, data } = await publishedTrialVisitListByReleaseVersionIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            // const tableData = setTableData(data);
            folderOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            folderOptions.value.options = [];
        }
        folderOptions.value.loading = false;
    }

    function getCustomLinkContent(folderId: TNullableNumber, formId: TNullableNumber) {
        let folderName = "Invalid folder";
        let formName = "Invalid form";
        if (folderId) {
            const result = getDropdownLabelByValue(folderLookups.value, folderId);
            if (result) folderName = result;
        }
        if (formId) {
            const result = getDropdownLabelByValue(formLookups.value, formId);
            if (result) formName = result;
        }
        return folderName === "Invalid folder" || formName === "Invalid form"
            ? "Invalid link"
            : `${folderName}/${formName}`;
    }

    onMounted(async () => {
        await Promise.all([
            publishedFormPaginationList(),
            foldersList(),
            getPublishedReleaseVersionDetails(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="formSearch"
                                    element-id="formSearch"
                                    :disabled="loading.isDisabled()"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await publishedFormPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus('#formSearch');
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns()"
                                :table-data="formTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="formSearch"
                                table-style="outlined"
                                :enable-reorder="false"
                                :custom-content="true"
                                action-row-class="min-w-[12rem] max-w-[12rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <edc-text-input
                                            :key="`formName-${data.tempID}`"
                                            v-model="data.formName"
                                            type="text"
                                            placeholder="Enter name *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                        <!-- <span v-else>{{ data.formName }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <!-- <span>{{ data.formOId }}</span> -->
                                        <edc-text-input
                                            :key="`formOID-${data.tempID}`"
                                            v-model="data.formOId"
                                            type="text"
                                            placeholder="Enter OID *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                    >
                                        <edc-text-area
                                            :key="`helpText-${data.tempID}`"
                                            v-model="data.helpText"
                                            placeholder="Enter help text"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :ellipse-count="20"
                                            :read-only="true"
                                        />
                                        <!-- <span v-else>{{ data.helpText }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-text-input
                                            :key="`noOfFields-${data.tempID}`"
                                            v-model="data.noOfFields"
                                            type="text"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isActive-${data.tempID}`"
                                            v-model="data.isActive"
                                            name="isActive"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isVisible-${data.tempID}`"
                                            v-model="data.isVisible"
                                            name="isVisible"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isTemplate-${data.tempID}`"
                                            v-model="data.isTemplate"
                                            name="isTemplate"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`otherVisit-${data.tempID}`"
                                            v-model="data.otherVisit"
                                            name="otherVisit"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isCommon-${data.tempID}`"
                                            v-model="data.isCommon"
                                            name="isCommon"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isLabForm-${data.tempID}`"
                                            v-model="data.isLabForm"
                                            name="isLabForm"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`isNavigateToSubjectDisposition-${data.tempID}`"
                                            v-model="data.isNavigateToSubjectDisposition"
                                            name="isNavigateToSubjectDisposition"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`formType-${data.tempID}`"
                                            v-model="data.formType"
                                            container-class="w-[11rem]"
                                            :options="FORM_TYPES"
                                            default-value="Direction"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[11rem]"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-dropdown
                                            :key="`logDirection-${data.tempID}`"
                                            v-model="data.logDirection"
                                            container-class="w-[11rem]"
                                            :options="LOG_DIRECTION_OPTIONS"
                                            default-value="Direction"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[11rem]"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        v-if="confirmationMessage"
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`saveConfirm-${data.tempID}`"
                                            v-model="data.saveConfirm"
                                            name="saveConfirm"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        v-if="confirmationMessage"
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <div>
                                            <p>
                                                {{
                                                    getCustomLinkContent(
                                                        data.redirectFolderId,
                                                        data.redirectFormId,
                                                    )
                                                }}
                                            </p>
                                        </div>
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`signatureRequired-${data.tempID}`"
                                            v-model="data.signatureRequired"
                                            name="signatureRequired"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`patientCloudForm-${data.tempID}`"
                                            v-model="data.patientCloudForm"
                                            name="patientCloudForm"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                </template>
                                <template #action="{ data }">
                                    <edc-pressable
                                        v-if="data.id"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.formName),
                                                    module: 'Published Form Fields',
                                                    page: 'Published Form Fields',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Fields'"
                                            icon="form-fields"
                                            :class="`${commonActionIconClasses('Fields')} stroke-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
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
