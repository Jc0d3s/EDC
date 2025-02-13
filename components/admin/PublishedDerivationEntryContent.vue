<script setup lang="ts">
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import Loading from "~/services/apis/data/loading";
    import useToastStore from "~/stores/toast";
    import {
        publishedDerivationActionsListAPI,
        publishedDerivationStepsListAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedDerivationActionData,
        IPublishedDerivationStepData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";

    interface IDerivationStepTableData {
        id: TNullableNumber;
        derivationId: number;
        stepOrder: number;
        type: TNullableNumber;
        folderId: TNullableNumber;
        folderName: TNullableString;
        formId: TNullableNumber;
        formName: TNullableString;
        fieldId: TNullableNumber;
        fieldName: TNullableString;
        variableId: TNullableNumber;
        variableName: TNullableString;
        recordPosition: number;
        formRepeatNumber: number;
        folderRepeatNumber: number;
        logicalRecordPosition: string;
        dataValue: TNullableString;
        isApplyToAllFields: boolean;
        isApplyToAllFolders: boolean;
        derivationFunctionId: TNullableNumber;
        derivationFunctionName: TNullableString;
        value: TNullableString;
        format: TNullableString;
        tempID: string;
    }

    interface IDerivationActionTableData {
        id: TNullableNumber;
        derivationId: number;
        folderId: TNullableNumber;
        folderName: TNullableString;
        formId: TNullableNumber;
        formName: TNullableString;
        fieldId: TNullableNumber;
        fieldName: TNullableString;
        variableId: TNullableNumber;
        variableName: TNullableString;
        recordPosition: number;
        formRepeatNumber: number;
        folderRepeatNumber: number;
        isApplyToAllFields: boolean;
        isApplyToAllFolders: boolean;
        isEnableField: boolean;
        updatedBy: number;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();

    const derivationStepFormColumns: IColumn[] = [
        {
            field: "type",
            header: "Type",
            icon: false,
            show: true,
        },
        {
            field: "step",
            header: "Step",
            icon: false,
            show: true,
        },
    ];

    const derivationStepTableData = ref<IDerivationStepTableData[]>([]);
    const derivationStepTableDataRef = ref<IDerivationStepTableData[]>(
        deepClone(derivationStepTableData.value),
    );
    const loading = ref<Loading>(new Loading());

    const derivationActionFormColumns: IColumn[] = [
        {
            field: "dataPoint",
            header: "Data Point",
            icon: false,
            show: true,
        },
        {
            field: "isEnableField",
            header: "Enable Field",
            icon: false,
            show: true,
        },
        // {
        //     field: "action",
        //     header: "Action",
        //     icon: false,
        //     show: true,
        // },
    ];

    const derivationActionTableData = ref<IDerivationActionTableData[]>([]);
    const derivationActionTableDataRef = ref<IDerivationActionTableData[]>(
        deepClone(derivationActionTableData.value),
    );

    function setTableData(tableData: IPublishedDerivationStepData[]): IDerivationStepTableData[] {
        return tableData.map((row) => ({
            id: row.id,
            derivationId: row.derivationId,
            stepOrder: row.stepOrder,
            type: row.type,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: row.formRepeatNumber,
            folderRepeatNumber: row.folderRepeatNumber,
            logicalRecordPosition: row.logicalRecordPosition,
            dataValue: row.dataValue,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            derivationFunctionId: row.derivationFunctionId,
            value: row.value,
            format: row.format,
            derivationFunctionName: row.derivationFunctionName,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            tempID: uniqueID(),
        })) as any[];
    }

    async function derivationStepsList() {
        loading.value.table = true;
        const { status, data, message } = await publishedDerivationStepsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setTableData(data);
            derivationStepTableData.value = deepClone(result);
            derivationStepTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            derivationStepTableData.value = [];
            derivationStepTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function setCheckActionTableData(
        tableData: IPublishedDerivationActionData[],
    ): IDerivationActionTableData[] {
        return tableData.map((row) => ({
            id: row.id,
            derivationId: row.derivationId,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: row.formRepeatNumber,
            folderRepeatNumber: row.folderRepeatNumber,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            isEnableField: row.isisEnableField,
            tempID: uniqueID(),
        })) as IDerivationActionTableData[];
    }

    async function derivationActionsList() {
        loading.value.table = true;
        const { status, data, message } = await publishedDerivationActionsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setCheckActionTableData(data);
            derivationActionTableData.value = deepClone(result);
            derivationActionTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            derivationActionTableData.value = [];
            derivationActionTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    onMounted(() => {
        loading.value.setDynamicLoading(["formDetailsDetails"]);
        Promise.all([derivationStepsList(), derivationActionsList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Derivation Step">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div>
                            <edc-data-table
                                :columns="derivationStepFormColumns"
                                :table-data="derivationStepTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row">
                                        <span>{{ data.type }}</span>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <div
                                            v-if="data.type === 3"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <span>{{ data.value }}</span>
                                            <span v-if="data.format">({{ data.format }})</span>
                                        </div>
                                        <div
                                            v-else-if="data.type === 2"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <span>{{ data.derivationFunctionName }}</span>
                                        </div>
                                        <div
                                            v-else-if="data.type === 1"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <div>
                                                    <span
                                                        v-if="
                                                            data.folderId &&
                                                            !data.isApplyToAllFolders
                                                        "
                                                        >{{ data.folderName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.folderId &&
                                                            data.isApplyToAllFolders
                                                        "
                                                        >Applied to all folders</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <div>
                                                    <span
                                                        v-if="
                                                            data.formId && !data.isApplyToAllFolders
                                                        "
                                                        :class="[
                                                            !(
                                                                (data.folderId &&
                                                                    !data.isApplyToAllFolders) ||
                                                                (!data.folderId &&
                                                                    data.isApplyToAllFolders)
                                                            )
                                                                ? '-ml-[1rem]'
                                                                : '',
                                                        ]"
                                                        >{{ data.formName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.formId && data.isApplyToAllFolders
                                                        "
                                                        >Applied to all forms</span
                                                    >
                                                </div>
                                            </div>
                                            <div>
                                                <span
                                                    v-if="
                                                        data.fieldId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.fieldName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.fieldId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all fields</span
                                                >
                                            </div>
                                            <div>
                                                <span
                                                    v-if="
                                                        data.variableId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.variableName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.variableId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all variables</span
                                                >
                                            </div>
                                            <span>({{ data.recordPosition }})</span>
                                        </div>
                                    </td>
                                </template>
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper group-label="Derivation Action">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div>
                            <edc-data-table
                                :columns="derivationActionFormColumns"
                                :table-data="derivationActionTableData"
                                :loading="loading.secondaryTable"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row">
                                        <div class="flex flex-row gap-[1rem]">
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <div>
                                                    <span
                                                        v-if="
                                                            data.folderId &&
                                                            !data.isApplyToAllFolders
                                                        "
                                                        >{{ data.folderName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.folderId &&
                                                            data.isApplyToAllFolders
                                                        "
                                                        >Applied to all folders</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <div>
                                                    <span
                                                        v-if="
                                                            data.formId && !data.isApplyToAllFolders
                                                        "
                                                        :class="[
                                                            !(
                                                                (data.folderId &&
                                                                    !data.isApplyToAllFolders) ||
                                                                (!data.folderId &&
                                                                    data.isApplyToAllFolders)
                                                            )
                                                                ? '-ml-[1rem]'
                                                                : '',
                                                        ]"
                                                        >{{ data.formName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.formId && data.isApplyToAllFolders
                                                        "
                                                        >Applied to all forms</span
                                                    >
                                                </div>
                                            </div>
                                            <div>
                                                <span
                                                    v-if="
                                                        data.fieldId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.fieldName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.fieldId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all fields</span
                                                >
                                            </div>
                                            <div>
                                                <span
                                                    v-if="
                                                        data.variableId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.variableName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.variableId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all variables</span
                                                >
                                                <span>({{ data.recordPosition }})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`isEnableField-${data.tempID}`"
                                            v-model="data.isEnableField"
                                            container-class="mt-[0.5rem]"
                                            name="isEnableField"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
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
