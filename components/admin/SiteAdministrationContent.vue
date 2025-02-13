<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import { sitePaginationListAPI } from "~/services/apis/handlers/admin/site";
    import { siteGroupPaginationListAPI } from "~/services/apis/handlers/admin/site-group";
    import type { ISiteGroupData } from "~/services/apis/handlers/types/admin/site-group-types";
    import type { ISiteData } from "~/services/apis/handlers/types/admin/site-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ISiteData | ISiteGroupData>];
    }>();

    const toastStore = useToastStore();
    const globalStore = useGlobalStore();
    const loading = ref<Loading>(new Loading());

    const siteSearch = ref<TNullableString>(null);
    const siteColumns: IColumn[] = [
        {
            field: "siteName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "siteNumber",
            header: "Site Number",
            icon: false,
            show: true,
        },
    ];
    const siteTableData = ref<ISiteData[]>([]);
    const siteTableDataRef = ref<ISiteData[]>(deepClone(siteTableData.value));

    const siteGroupSearch = ref<TNullableString>(null);
    const siteGroupColumns: IColumn[] = [
        {
            field: "siteGroupName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "assignedSites",
            header: "Assigned Sites",
            icon: false,
            show: true,
        },
    ];
    const siteGroupTableData = ref<ISiteGroupData[]>([]);
    const siteGroupTableDataRef = ref<ISiteGroupData[]>(deepClone(siteGroupTableData.value));

    function setTableData(tableData: ISiteData[]): ISiteData[] {
        return tableData.map((row) => ({
            ...row,
        })) as ISiteData[];
    }

    async function sitePaginationList() {
        loading.value.table = true;
        const { status, data, message } = await sitePaginationListAPI(
            getAPIFilters({
                search: siteSearch.value,
                top: 10,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            siteTableData.value = deepClone(tableData);
            siteTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            siteTableData.value = [];
            siteTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    // Sites Group
    function siteGroupData(tableData: ISiteGroupData[]): ISiteGroupData[] {
        return tableData.map((row) => ({
            ...row,
        })) as ISiteGroupData[];
    }

    async function siteGroupPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await siteGroupPaginationListAPI(
            getAPIFilters({
                search: siteGroupSearch.value,
                top: 10,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = siteGroupData(items);
            siteGroupTableData.value = deepClone(tableData);
            siteGroupTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            siteGroupTableData.value = [];
            siteGroupTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }
    // Sites Group

    onMounted(async () => {
        await Promise.all([sitePaginationList(), siteGroupPaginationList()]);
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Sites">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="siteSearch"
                            element-id="siteSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await sitePaginationList();
                                    globalStore.triggerSearchBarRefocus('#siteSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="siteColumns"
                            :table-data="siteTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="siteSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            :disabled="loading.isDisabled()"
                            @on-row-click="
                                (selectedRow: ISiteData) => {
                                    emit('on-row-select', {
                                        label: 'Sites',
                                        module: 'Site Administration',
                                        page: 'Sites',
                                        data: selectedRow,
                                        queryData: {
                                            search: selectedRow.siteName as string,
                                        },
                                    });
                                }
                            "
                        >
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper group-label="Sites Group">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="siteGroupSearch"
                            element-id="siteGroupSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteGroupPaginationList();
                                    globalStore.triggerSearchBarRefocus('#siteGroupSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="siteGroupColumns"
                            :table-data="siteGroupTableData"
                            :loading="loading.secondaryTable"
                            pagination-type="none"
                            search-key="siteGroupSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            :disabled="loading.isDisabled()"
                            @on-row-click="
                                (selectedRow: ISiteGroupData) => {
                                    emit('on-row-select', {
                                        label: 'Sites',
                                        module: 'Site Administration',
                                        page: 'Sites',
                                        data: selectedRow,
                                        queryData: {
                                            filter: {
                                                siteGroupId: Number(selectedRow.id),
                                            },
                                        },
                                    });
                                }
                            "
                        >
                        </edc-data-table>
                    </div>
                </div>
                <!-- </div> -->
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
