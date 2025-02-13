<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import { publishedDerivationPaginationListAPI } from "~/services/apis/handlers/admin/release-version-detail";
    import type { IPublishedDerivationListData } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import type { IDerivationDataAppliedVariable } from "~/services/apis/handlers/types/derivation-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        releaseVersionId: number;
        name: TNullableString;
        bypassDuringMigration: boolean;
        appliedVariable: IDerivationDataAppliedVariable[];
        isActive: boolean;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const loading = ref<Loading>(new Loading());

    const derivationSearch = ref<TNullableString>(null);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "bypassDuringMigration",
            header: "Bypass During Migration",
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
            field: "appliedVariable",
            header: "Applied Variables",
            icon: false,
            show: true,
        },
    ];
    const tableData = ref<ITableData[]>([]);
    const tableDataRef = ref<ITableData[]>(deepClone(tableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Derivations - ${props.tabData[props.activeTab.label].data.releaseVersionName}`
            : "Published Derivations",
    );

    function setTableData(data: IPublishedDerivationListData[]): ITableData[] {
        return data.map((row) => ({
            bypassDuringMigration: row.byPassDuringMigration,
            id: row.id,
            releaseVersionId: row.releaseVersionId,
            isActive: row.isActive,
            name: row.name,
            appliedVariable: row.appliedVariable,
            tempID: uniqueID(),
        }));
    }

    function getAppliedVariables(appliedVariable: IDerivationDataAppliedVariable[]) {
        let result = "";
        if (getArrayLength(appliedVariable) > 0) {
            if (appliedVariable[0].folderName) result = appliedVariable[0].folderName;
            if (appliedVariable[0].formName && getStringLength(result) > 0)
                result += ` > ${appliedVariable[0].formName}`;
            else if (appliedVariable[0].formName && getStringLength(result) === 0)
                result += appliedVariable[0].formName;
            // const fieldNames =
            //     getArrayLength(appliedVariable) === 1
            //         ? appliedVariable[0].fieldName
            //         : appliedVariable.map((row) => row.fieldName).join(",");
            // if (fieldNames && getStringLength(result) > 0) result += ` > ${fieldNames}`;
            // else if (fieldNames && getStringLength(result) === 0) result += fieldNames;
            if (appliedVariable[0].fieldName && getStringLength(result) > 0)
                result += ` > ${appliedVariable[0].fieldName}`;
            else if (appliedVariable[0].fieldName && getStringLength(result) === 0)
                result += appliedVariable[0].fieldName;
        }
        return result;
    }

    async function publishedDerivationPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await publishedDerivationPaginationListAPI(
            getAPIFilters({
                search: derivationSearch.value,
                filter: {
                    releaseVersionId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const result = setTableData(items);
            tableData.value = deepClone(result);
            tableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            tableData.value = [];
            tableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    onMounted(async () => {
        await publishedDerivationPaginationList();
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
                                    v-model="derivationSearch"
                                    element-id="derivationSearch"
                                    input-class="admin-input-font"
                                    :disabled="loading.isDisabled()"
                                    @on-search="
                                        async () => {
                                            await publishedDerivationPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#derivationSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns"
                                :table-data="tableData"
                                :loading="loading.table"
                                search-key="derivationSearch"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                :disabled="loading.isDisabled()"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <edc-text-input
                                            :key="`name-${data.tempID}`"
                                            v-model="data.name"
                                            type="text"
                                            placeholder="Enter name"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`bypassDuringMigration-${data.tempID}`"
                                            v-model="data.bypassDuringMigration"
                                            name="bypassDuringMigration"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`isActive-${data.tempID}`"
                                            v-model="data.isActive"
                                            name="isActive"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        {{ getAppliedVariables(data.appliedVariable) }}
                                    </td>
                                </template>
                                <template #action="{ data }">
                                    <edc-pressable
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.name),
                                                    module: 'Published Derivations',
                                                    page: 'Published Derivation Entries',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Entries'"
                                            icon="circle-play"
                                            :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
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
