<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import { publishedTrialVisitPaginationListAPI } from "~/services/apis/handlers/admin/release-version-detail";
    import type { IPublishedTrialVisit } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        releaseVersionId: number;
        releaseVersionName: TNullableString;
        name: TNullableString;
        oid: TNullableString;
        // parentFolderId: TNullableNumber;
        access: TNullableNumber;
        start: TNullableNumber;
        target: TNullableNumber;
        end: TNullableNumber;
        overDue: TNullableNumber;
        close: TNullableNumber;
        reusable: boolean;
        orderNumber: number;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const folderSearch = ref<TNullableString>(null);
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
        // {
        //     field: "parentFolderId",
        //     header: "Parent Folder",
        //     icon: false,
        //     show: true,
        // },
        {
            field: "access",
            header: "Access",
            icon: false,
            show: true,
        },
        {
            field: "start",
            header: "Start",
            icon: false,
            show: true,
        },
        {
            field: "target",
            header: "Target",
            icon: false,
            show: true,
        },
        {
            field: "end",
            header: "End",
            icon: false,
            show: true,
        },
        {
            field: "overdue",
            header: "Overdue",
            icon: false,
            show: true,
        },
        {
            field: "close",
            header: "Close",
            icon: false,
            show: true,
        },
        {
            field: "reusable",
            header: "Reusable",
            icon: false,
            show: true,
        },
    ];
    const formTableData = ref<ITableData[]>([]);
    const formTableDataRef = ref<ITableData[]>(deepClone(formTableData.value));
    const loading = ref<Loading>(new Loading());

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Folders - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Folders",
    );

    function setTableData(tableData: IPublishedTrialVisit[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            name: row.name,
            oid: row.oid,
            // parentFolderId: row.parentFolder,
            access: row.access,
            start: row.start,
            target: row.target,
            end: row.end,
            overDue: row.overDue,
            close: row.close,
            reusable: row.reusable,
            orderNumber: row.orderNumber,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function publishedTrialVisitPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await publishedTrialVisitPaginationListAPI(
            getAPIFilters({
                search: folderSearch.value,
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
        await publishedTrialVisitPaginationList();
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
                                    v-model="folderSearch"
                                    element-id="folderSearch"
                                    :disabled="loading.isDisabled()"
                                    input-class="admin-input-font"
                                    @on-search="
                                        async () => {
                                            await publishedTrialVisitPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#folderSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns"
                                :table-data="formTableData"
                                :loading="loading.table"
                                pagination-type="none"
                                search-key="folderSearch"
                                table-style="outlined"
                                :enable-reorder="false"
                                :custom-content="true"
                                :disabled="loading.isDisabled()"
                                action-row-class="min-w-[12rem] max-w-[12rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        class="font-normal text-left font-12 custom-row min-w-[12rem]"
                                    >
                                        <edc-text-input
                                            :key="`name-${data.tempID}`"
                                            v-model="data.name"
                                            type="text"
                                            placeholder="Enter name *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td
                                        class="font-normal text-left font-12 custom-row min-w-[12rem]"
                                    >
                                        <edc-text-input
                                            :key="`oid-${data.tempID}`"
                                            v-model="data.oid"
                                            type="text"
                                            placeholder="Enter OID *"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`access-${data.tempID}`"
                                            v-model="data.access"
                                            :disabled="loading.isDisabled()"
                                            type="number"
                                            placeholder="Enter access"
                                            input-class="admin-input-font"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`start-${data.tempID}`"
                                            v-model="data.start"
                                            type="number"
                                            placeholder="Enter start"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`target-${data.tempID}`"
                                            v-model="data.target"
                                            type="number"
                                            placeholder="Enter target"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`end-${data.tempID}`"
                                            v-model="data.end"
                                            type="number"
                                            placeholder="Enter end"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`overDue-${data.tempID}`"
                                            v-model="data.overDue"
                                            type="number"
                                            placeholder="Enter overdue"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`close-${data.tempID}`"
                                            v-model="data.close"
                                            type="number"
                                            placeholder="Enter close"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="true"
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`reusable-${data.tempID}`"
                                            v-model="data.reusable"
                                            name="reusable"
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
