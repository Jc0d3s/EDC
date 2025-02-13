<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import {
        rolePaginationListAPI,
        userPaginationListAPI,
    } from "~/services/apis/handlers/admin/user";
    import type { IRoleData, IUserData } from "~/services/apis/handlers/types/user-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<IUserData | IRoleData>];
    }>();

    const toastStore = useToastStore();
    const globalStore = useGlobalStore();
    const loading = ref<Loading>(new Loading());

    const userSearch = ref<TNullableString>(null);
    const userColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "orgType",
            header: "Organization",
            icon: false,
            show: true,
        },
        {
            field: "enterpriseName",
            header: "Enterprise",
            icon: false,
            show: true,
        },
        {
            field: "role",
            header: "Role",
            icon: false,
            show: true,
        },
    ];
    const userTableData = ref<IUserData[]>([]);
    const userTableDataRef = ref<IUserData[]>(deepClone(userTableData.value));

    const roleSearch = ref<TNullableString>(null);
    const roleColumns: IColumn[] = [
        {
            field: "role",
            header: "Role",
            icon: false,
            show: true,
        },
        {
            field: "description",
            header: "Description",
            icon: false,
            show: true,
        },
    ];
    const roleTableData = ref<IRoleData[]>([]);
    const roleTableDataRef = ref<IRoleData[]>(deepClone(roleTableData.value));

    function setTableData(tableData: IUserData[]): IUserData[] {
        return tableData.map((row) => ({
            ...row,
        })) as IUserData[];
    }

    async function userPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await userPaginationListAPI(
            getAPIFilters({
                search: userSearch.value,
                top: 10,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            userTableData.value = deepClone(tableData);
            userTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            userTableData.value = [];
            userTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    // Roles
    function setRoleTableData(tableData: IRoleData[]): IRoleData[] {
        return tableData.map((row) => ({
            ...row,
        })) as IRoleData[];
    }

    async function siteGroupPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await rolePaginationListAPI(
            getAPIFilters({
                search: roleSearch.value,
                top: 10,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setRoleTableData(items);
            roleTableData.value = deepClone(tableData);
            roleTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            roleTableData.value = [];
            roleTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }
    // Roles

    onMounted(async () => {
        await Promise.all([userPaginationList(), siteGroupPaginationList()]);
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Users">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="userSearch"
                            element-id="userSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await userPaginationList();
                                    globalStore.triggerSearchBarRefocus('#userSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="userColumns"
                            :table-data="userTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="userSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            :disabled="loading.isDisabled()"
                            @on-row-click="
                                (selectedRow: IUserData) => {
                                    emit('on-row-select', {
                                        label: 'Users',
                                        module: 'User Administration',
                                        page: 'Users',
                                        data: selectedRow,
                                        queryData: {
                                            search: selectedRow.name as string,
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
        <admin-card-wrapper group-label="Roles">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="roleSearch"
                            element-id="roleSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteGroupPaginationList();
                                    globalStore.triggerSearchBarRefocus('#roleSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="roleColumns"
                            :table-data="roleTableData"
                            :loading="loading.secondaryTable"
                            pagination-type="none"
                            search-key="roleSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            :disabled="loading.isDisabled()"
                            @on-row-click="
                                (selectedRow: IRoleData) => {
                                    emit('on-row-select', {
                                        label: 'Users',
                                        module: 'User Administration',
                                        page: 'Users',
                                        data: selectedRow,
                                        queryData: {
                                            filter: {
                                                roleId: Number(selectedRow.id),
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
