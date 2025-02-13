<script setup lang="ts">
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import Loading from "~/services/apis/data/loading";
    import useToastStore from "~/stores/toast";
    import {
        publishedEditCheckActionsListAPI,
        publishedEditCheckStepsListAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedEditCheckActionData,
        IPublishedEditCheckStepData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";

    interface ICheckStepTableData {
        id: TNullableNumber;
        editCheckId: number;
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
        checkFunctionId: TNullableNumber;
        checkFunctionName: TNullableString;
        value: TNullableString;
        format: TNullableString;
        tempID: string;
    }

    interface ICheckActionTableData {
        id: TNullableNumber;
        editCheckId: number;
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
        actionMessage: TNullableString;
        actionType: TNullableNumber;
        updatedBy: number;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();

    const checkStepFormColumns: IColumn[] = [
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

    const checkStepTableData = ref<ICheckStepTableData[]>([]);
    const checkStepTableDataRef = ref<ICheckStepTableData[]>(deepClone(checkStepTableData.value));
    const loading = ref<Loading>(new Loading());

    const checkActionFormColumns: IColumn[] = [
        {
            field: "type",
            header: "Type",
            icon: false,
            show: true,
        },
        {
            field: "dataPoint",
            header: "Data Point",
            icon: false,
            show: true,
        },
        {
            field: "action",
            header: "Action",
            icon: false,
            show: true,
        },
    ];

    const checkActionTableData = ref<ICheckActionTableData[]>([]);
    const checkActionTableDataRef = ref<ICheckActionTableData[]>(
        deepClone(checkActionTableData.value),
    );

    function setTableData(tableData: IPublishedEditCheckStepData[]): ICheckStepTableData[] {
        return tableData.map((row) => ({
            id: row.id,
            editCheckId: row.editCheckId,
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
            checkFunctionId: row.checkFunctionId,
            value: row.value,
            format: row.format,
            checkFunctionName: row.checkFunctionName,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            tempID: uniqueID(),
        })) as any[];
    }

    async function checkStepsList() {
        loading.value.table = true;
        const { status, data, message } = await publishedEditCheckStepsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setTableData(data);
            checkStepTableData.value = deepClone(result);
            checkStepTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            checkStepTableData.value = [];
            checkStepTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function setCheckActionTableData(
        tableData: IPublishedEditCheckActionData[],
    ): ICheckActionTableData[] {
        return tableData.map((row) => ({
            id: row.id,
            editCheckId: row.editCheckId,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: row.formRepeatNumber,
            folderRepeatNumber: row.folderRepeatNumber,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            actionMessage: row.actionMessage,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            actionType: row.actionType,
            tempID: uniqueID(),
        })) as ICheckActionTableData[];
    }

    async function checkActionsList() {
        loading.value.table = true;
        const { status, data, message } = await publishedEditCheckActionsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setCheckActionTableData(data);
            checkActionTableData.value = deepClone(result);
            checkActionTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            checkActionTableData.value = [];
            checkActionTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    onMounted(() => {
        loading.value.setDynamicLoading(["formDetailsDetails"]);
        Promise.all([checkStepsList(), checkActionsList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Check Step">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div>
                            <edc-data-table
                                :columns="checkStepFormColumns"
                                :table-data="checkStepTableData"
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
                                            <span>{{ data.checkFunctionName }}</span>
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
        <admin-card-wrapper group-label="Check Action">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div>
                            <edc-data-table
                                :columns="checkActionFormColumns"
                                :table-data="checkActionTableData"
                                :loading="loading.secondaryTable"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row !w-[20rem]">
                                        <div>
                                            <span v-if="data.actionType === 1"
                                                >Raise Discrepancy</span
                                            >
                                            <span v-else-if="data.actionType === 2"
                                                >Show Field</span
                                            >
                                            <span v-else-if="data.actionType === 3">Add Form</span>
                                            <span v-else-if="data.actionType === 4"
                                                >Disable Field</span
                                            >
                                            <span v-else-if="data.actionType === 5"
                                                >Trigger Email</span
                                            >
                                            <span v-else>Invalid Non Log Value</span>
                                        </div>
                                    </td>
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
                                                        >{{ data.formName }} &nbsp;
                                                        {{ data.actionType === 3 ? "" : ">" }}
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.formId && data.isApplyToAllFolders
                                                        "
                                                        >Applied to all forms</span
                                                    >
                                                </div>
                                            </div>
                                            <div v-if="data.actionType !== 3">
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
                                        <span>{{ data.actionMessage }}</span>
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
