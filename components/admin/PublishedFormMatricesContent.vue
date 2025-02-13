<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import { publishedMatricesPaginationListAPI } from "~/services/apis/handlers/admin/release-version-detail";
    import type { IPublishedMatrixData } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        releaseVersionId: number;
        releaseVersionName: string;
        name: TNullableString;
        oid: TNullableString;
        allowAdd: boolean;
        max: number;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const loading = ref<Loading>(new Loading());

    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
            sort: false,
        },
        {
            field: "oid",
            header: "OID",
            icon: false,
            show: true,
        },
        {
            field: "allowAdd",
            header: "Allow Add",
            icon: false,
            show: true,
        },
        {
            field: "max",
            header: "Max",
            icon: false,
            show: true,
        },
    ];

    const toastStore = useToastStore();
    const matrixSearch = ref<TNullableString>(null);
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));

    const matricesGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Matrices - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Matrices",
    );

    function setTableData(tableData: IPublishedMatrixData[]): ITableData[] {
        return tableData.map((row) => ({
            ...row,
            tempID: uniqueID(),
        }));
    }
    async function publishedMatricesPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await publishedMatricesPaginationListAPI(
            getAPIFilters({
                search: matrixSearch.value,
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
        } else if (status !== 401) {
            formTableData.value = [];
            formTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    onMounted(async () => {
        await publishedMatricesPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="matricesGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="matrixSearch"
                                    element-id="matrixSearch"
                                    :disabled="loading.isDisabled()"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await publishedMatricesPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#matrixSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                table-id="matrixTable"
                                :columns="formColumns"
                                :table-data="formTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                search-key="matrixSearch"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row">
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
                                        <edc-text-input
                                            :key="`oid-${data.tempID}`"
                                            v-model="data.oid"
                                            type="text"
                                            placeholder="Enter OID"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`allowAdd-${data.tempID}`"
                                            v-model="data.allowAdd"
                                            name="allowAdd"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`max-${data.tempID}`"
                                            v-model="data.max"
                                            type="number"
                                            placeholder="Enter max"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                </template>
                                <template #action="{ data }">
                                    <edc-pressable
                                        container-class="mt-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.name),
                                                    module: 'Published Matrices',
                                                    page: 'Published Assign Matrices',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Assign'"
                                            icon="form-fields"
                                            class="stroke-[var(--color-secondary)] !w-[1.7rem] !h-[1.7rem]"
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
