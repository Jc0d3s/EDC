<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        assignRolePermissionAPI,
        rolePermissionListAPI,
        rolePermissionTypeListAPI,
    } from "~/services/apis/handlers/admin/role-permission-type";
    import { rolesListAPI } from "~/services/apis/handlers/admin/user";
    import { rolePermissionsListAPI } from "~/services/apis/handlers/portal/user";
    import type {
        IRolePermissionData,
        IRolePermissionTypeData,
    } from "~/services/apis/handlers/types/admin/role-permission-type-types";
    import type { IRoleData } from "~/services/apis/handlers/types/user-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import useUserStore from "~/stores/user";
    import type { IOptions } from "~/types/common";

    type TTableRow = Record<string, boolean | string | number>;

    const stringSeperator = "#$%";

    const dummyColumns: IOptions[] = [
        {
            label: "Role 1",
            value: 1,
        },
        {
            label: "Permission 2",
            value: 2,
        },
        {
            label: "Permission 3",
            value: 3,
        },
        {
            label: "Permission 4",
            value: 4,
        },
        {
            label: "Permission 5",
            value: 5,
        },
        {
            label: "Permission 5",
            value: 6,
        },
    ];

    const dummyRows: TTableRow[] = [
        {
            "1_Role": "Role",
            "1_Permission type": false,
            "2_Permission type": false,
            "3_Permission type": false,
            "4_Permission type": false,
            "5_Permission type": false,
        },
        {
            "2_Role": "Role",
            "1_Permission type": false,
            "2_Permission type": false,
            "3_Permission type": false,
            "4_Permission type": false,
            "5_Permission type": false,
        },
        {
            "3_Role": "Role",
            "1_Permission type": false,
            "2_Permission type": false,
            "3_Permission type": false,
            "4_Permission type": false,
            "5_Permission type": false,
        },
        {
            "4_Role": "Role",
            "1_Permission type": false,
            "2_Permission type": false,
            "3_Permission type": false,
            "4_Permission type": false,
            "5_Permission type": false,
        },
        {
            "5_Role": "Role",
            "1_Permission type": false,
            "2_Permission type": false,
            "3_Permission type": false,
            "4_Permission type": false,
            "5_Permission type": false,
        },
    ];

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const userStore = useUserStore();
    const loading = ref<Loading>(new Loading());
    const isEditForm = ref<boolean>(false);

    const rolesData = ref<IRoleData[]>([]);
    const rolesPermissionTypesData = ref<IRolePermissionTypeData[]>([]);
    const rolesPermissionsData = ref<IRolePermissionData[]>([]);
    const tableRows = ref<TTableRow[]>([]);
    const tableRowsRef = ref<TTableRow[]>([]);

    const tableColumns = computed(() => {
        const result: IOptions[] = [
            {
                label: "Roles",
                value: 0,
            },
        ];
        for (const row of rolesPermissionTypesData.value) {
            result.push({
                label: row.type,
                value: row.id,
            });
        }

        return result;
    });

    function resetFormModel() {
        isEditForm.value = false;
        tableRows.value = deepClone(tableRowsRef.value);
    }

    function findRolePermissionDetailsByRoleAndPermissionTypeId(
        roleId: number,
        permissionTypeId: number,
    ) {
        let result: IRolePermissionData | null = null;
        for (const row of rolesPermissionsData.value) {
            if (row.roleId === roleId && row.rolePermissionTypeId === permissionTypeId) {
                result = {
                    id: row.id,
                    roleId: row.roleId,
                    rolePermissionTypeId: row.rolePermissionTypeId,
                    isAccessGranted: row.isAccessGranted,
                    updatedBy: row.updatedBy,
                };
                break;
            }
        }
        return result;
    }

    function setTableRows() {
        const result: TTableRow[] = [];
        for (const roleDetail of rolesData.value) {
            const roleKey = `0${stringSeperator}${roleDetail.role}${stringSeperator}${roleDetail.id}`;
            const obj: TTableRow = {};
            obj[roleKey] =
                `${roleDetail.role}${roleDetail.description ? ` (${roleDetail.description})` : ""}`;
            for (const [
                index,
                rolePermissionTypeDetail,
            ] of rolesPermissionTypesData.value.entries()) {
                const rolePermissionDetails = findRolePermissionDetailsByRoleAndPermissionTypeId(
                    roleDetail.id,
                    rolePermissionTypeDetail.id,
                );
                let permissionTypeKey = "";
                if (rolePermissionDetails) {
                    permissionTypeKey = `${index + 1}${stringSeperator}${rolePermissionTypeDetail.type}${stringSeperator}${rolePermissionTypeDetail.id}${stringSeperator}${rolePermissionDetails.id}`;
                    obj[permissionTypeKey] = rolePermissionDetails.isAccessGranted;
                } else {
                    permissionTypeKey = `${index + 1}${stringSeperator}${rolePermissionTypeDetail.type}${stringSeperator}${rolePermissionTypeDetail.id}`;
                    obj[permissionTypeKey] = false;
                }
            }
            result.push({ ...obj });
        }
        tableRows.value = deepClone(result);
        tableRowsRef.value = deepClone(result);
    }

    async function rolesList() {
        loading.value.dynamicLoading["roles"] = true;
        const { status, data, message } = await rolesListAPI();
        if (status === 200) {
            rolesData.value = deepClone(data);
        } else if (status !== 401) {
            rolesData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["roles"] = false;
    }

    async function rolesPermissionTypesList() {
        loading.value.dynamicLoading["rolePermissionTypes"] = true;
        const { status, data, message } = await rolePermissionTypeListAPI();
        if (status === 200) {
            rolesPermissionTypesData.value = deepClone(data);
        } else if (status !== 401) {
            rolesPermissionTypesData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["rolePermissionTypes"] = false;
    }

    async function rolePermissionList() {
        loading.value.dynamicLoading["rolePermissions"] = true;
        const { status, data, message } = await rolePermissionListAPI();
        if (status === 200) {
            rolesPermissionsData.value = deepClone(data);
        } else if (status !== 401) {
            rolesPermissionsData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["rolePermissions"] = false;
    }

    function getRolePermissionDetailsForAPI(): IRolePermissionData[] {
        const result: IRolePermissionData[] = [];
        for (const row of tableRows.value) {
            let roleId = 0;
            for (const [rowKey, rowValue] of Object.entries(row)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [index, label, id, rolePermissionDetail] = rowKey.split(stringSeperator);
                if (Number(index) === 0) {
                    roleId = Number(id);
                } else {
                    result.push({
                        id: rolePermissionDetail ? Number(rolePermissionDetail) : 0,
                        roleId,
                        rolePermissionTypeId: Number(id),
                        isAccessGranted: rowValue as boolean,
                        updatedBy: 0,
                    });
                }
            }
        }
        return result;
    }

    async function rolePermissionsList() {
        userStore.getRolePermissionDetails();
        if (getArrayLength(userStore.rolePermissionsDetails) === 0) {
            const { status, data } = await rolePermissionsListAPI();
            if (status === 200) {
                userStore.setRolePermissionDetails(data);
            } else {
                userStore.setRolePermissionDetails([]);
            }
        }
    }

    async function assignRolePermissions() {
        loading.value.form = true;
        const { message, status } = await assignRolePermissionAPI(getRolePermissionDetailsForAPI());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            isEditForm.value = false;
            await Promise.all([rolePermissionList(), rolePermissionsList()]);
            setTableRows();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        tableRows.value,
        tableRowsRef.value,
    );

    watch(
        () => tableRows.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = tableRowsRef.value;
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
                tableRows.value = deepClone(tableRowsRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["roles", "rolePermissionTypes", "rolePermissions"]);
        Promise.all([rolesList(), rolesPermissionTypesList(), rolePermissionList()]).then(() =>
            setTableRows(),
        );
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Assign Role Permissions">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="flex flex-row items-center gap-[0.5rem]">
                        <admin-action-label
                            v-if="!isEditForm"
                            icon="edit"
                            text="Edit"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    isEditForm = true;
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isModelChanged"
                            icon="save"
                            text="Save"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                async () => {
                                    await assignRolePermissions();
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isEditForm && !isModelChanged"
                            icon="circle-close"
                            text="Cancel"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    resetFormModel();
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isModelChanged"
                            icon="undo"
                            text="Reset"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    resetFormModel();
                                }
                            "
                        />
                    </div>
                    <div
                        class="table-wrapper w-full flex flex-col gap-[1rem] overflow-x-auto"
                        :skeleton="loading.table || null"
                    >
                        <table class="w-full matrix-container">
                            <thead v-if="loading.table" class="table-header">
                                <tr>
                                    <th
                                        v-for="(tableColumn, index) of dummyColumns"
                                        :key="index"
                                        class="font-bold font-12 table-header-divider"
                                    >
                                        <edc-skeleton-loader
                                            container-class="w-[40%] h-[1.5rem] my-[1rem]"
                                            loader-type="rectangle"
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <thead v-else class="table-header">
                                <tr>
                                    <th
                                        v-for="(tableColumn, index) of tableColumns"
                                        :key="index"
                                        class="font-bold font-12 table-header-divider"
                                    >
                                        <div
                                            class="flex flex-row items-center gap-[1rem] font-bold"
                                        >
                                            {{ tableColumn.label }}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody v-if="loading.table" class="table-body mb-[20rem]">
                                <template v-for="(row, index) of dummyRows" :key="index">
                                    <tr :id="`row-${index}`">
                                        <td
                                            v-for="rowKey of Object.keys(row)"
                                            :key="rowKey"
                                            class="font-normal text-left font-12"
                                        >
                                            <edc-skeleton-loader
                                                container-class="w-[40%] h-[1.5rem] my-[1rem]"
                                                loader-type="rectangle"
                                            />
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                            <tbody
                                v-else-if="!loading.table && getArrayLength(tableRows) > 0"
                                class="table-body mb-[0rem] relative"
                            >
                                <template v-for="(row, index) of tableRows" :key="index">
                                    <tr :id="`row-${index}`" :disabled="loading.isDisabled()">
                                        <td
                                            v-for="(
                                                [rowKey, rowValue], columnIndex
                                            ) of Object.entries(row)"
                                            :key="columnIndex"
                                            class="font-normal text-left font-12"
                                        >
                                            <edc-checkbox
                                                v-if="typeof rowValue === 'boolean' && isEditForm"
                                                :key="`${rowValue}-${columnIndex}`"
                                                v-model="row[rowKey]"
                                                :disabled="loading.isDisabled()"
                                                :name="`${rowValue}`"
                                            />
                                            <edc-icon
                                                v-else-if="
                                                    typeof rowValue === 'boolean' &&
                                                    !isEditForm &&
                                                    row[rowKey]
                                                "
                                                icon="check"
                                                class="fill-[var(--color-secondary)] h-[0.8rem]"
                                            />
                                            <span
                                                v-else-if="typeof rowValue !== 'boolean'"
                                                class="font-bold"
                                                >{{ rowValue }}</span
                                            >
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                            <tbody v-else class="table-body">
                                <tr>
                                    <td :colspan="getArrayLength(tableColumns) + 1" class="font-12">
                                        No role permissions to display
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
