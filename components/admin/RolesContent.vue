<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createRolePermissionTypeAPI,
        deleteRolePermissionTypeByIdAPI,
        rolePermissionTypePaginationListAPI,
        updateRolePermissionTypeAPI,
    } from "~/services/apis/handlers/admin/role-permission-type";
    import {
        createRoleAPI,
        createRoleGroupMasterAPI,
        deleteRoleByIdAPI,
        deleteRoleGroupMasterByIdAPI,
        roleGroupMasterPaginationListAPI,
        rolePaginationListAPI,
        updateRoleAPI,
        updateRoleGroupMasterAPI,
    } from "~/services/apis/handlers/admin/user";
    import type { IRolePermissionTypeData } from "~/services/apis/handlers/types/admin/role-permission-type-types";
    import type {
        IRoleData,
        IRoleGroupMasterData,
    } from "~/services/apis/handlers/types/user-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        roleGroupNames: TNullableString;
        role: TNullableString;
        description: TNullableString;
        showInEDCPortal: boolean;
        tempID: string;
    }

    interface IRoleGroupTableData {
        id: TNullableNumber;
        groupName: TNullableString;
        assignedRoles: TNullableString;
        tempID: string;
    }

    interface IPermissionTypeTableData {
        id: TNullableNumber;
        type: TNullableString;
        tempID: string;
    }

    interface IRoleGroupValidationError extends IBaseValidationError {
        groupName: string;
        assignedRoles: string;
    }

    interface IValidationError extends IBaseValidationError {
        role: string;
        roleGroupNames: string;
        description: string;
        showInEDCPortal: string;
    }

    interface IPermissionTypeValidationError extends IBaseValidationError {
        type: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        role: "",
        roleGroupNames: "",
        description: "",
        showInEDCPortal: "",
    });

    const defaultRoleGroupValidationErrors = (tempID: string): IRoleGroupValidationError => ({
        index: tempID,
        groupName: "",
        assignedRoles: "",
    });

    const defaultRolerolePermissionTypeValidationErrors = (
        tempID: string,
    ): IPermissionTypeValidationError => ({
        index: tempID,
        type: "",
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData | IRoleGroupTableData>];
    }>();

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const globalStore = useGlobalStore();

    // Role Group
    const roleGroupSearch = ref<TNullableString>(null);
    const roleGroupEditFormDetails = ref<TEditFormDetail>({});
    const roleGroupTableData = ref<IRoleGroupTableData[]>([]);
    const roleGroupTableDataRef = ref<IRoleGroupTableData[]>(deepClone(roleGroupTableData.value));
    const roleGroupValidationErrors = ref<TValidationErrorData<IRoleGroupValidationError>>({});
    const roleGroupMasterColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "assignedRoles",
            header: "Assigned Roles",
            icon: false,
            show: true,
        },
    ];
    const roleGroupTableLoaderDetails = ref<TTableLoaderDetail>({});

    const disableRoleGroupAction = computed(() =>
        checkIfEditFormActive(roleGroupEditFormDetails.value),
    );

    function editRoleGroupForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, roleGroupEditFormDetails.value))
            roleGroupEditFormDetails.value[rowIndex] = true;
        else roleGroupEditFormDetails.value[rowIndex] = !roleGroupEditFormDetails.value[rowIndex];
    }

    function resetRoleGroupEditFormDetails(tempID?: string) {
        if (tempID) {
            editRoleGroupForm(tempID);
            deleteObjectPropertyByKey(tempID, roleGroupValidationErrors.value);
        } else {
            roleGroupEditFormDetails.value = {};
            roleGroupValidationErrors.value = {};
        }
    }

    function addOrEditRoleGroupAction() {
        const tempID = uniqueID();
        roleGroupTableData.value.unshift({
            id: null,
            assignedRoles: null,
            groupName: null,
            tempID,
        });
        editRoleGroupForm(tempID);
    }

    function setRoleGroupMasterTableData(tableData: IRoleGroupMasterData[]): IRoleGroupTableData[] {
        roleGroupTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            assignedRoles: row.assignedRoles,
            groupName: row.groupName,
            tempID: uniqueID(),
        })) as IRoleGroupTableData[];
    }

    async function roleGroupMasterPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await roleGroupMasterPaginationListAPI(
            getAPIFilters({
                search: roleGroupSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setRoleGroupMasterTableData(items);
            roleGroupTableData.value = deepClone(tableData);
            roleGroupTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            roleGroupTableData.value = [];
            roleGroupTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function roleGroupValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IRoleGroupValidationError> = {
            ...roleGroupValidationErrors.value,
        };
        for (const [index, tableRow] of roleGroupTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IRoleGroupValidationError = {
                    ...defaultRoleGroupValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.groupName) === 0)
                    obj["groupName"] = "Please enter a name";
                else if (getStringLength(tableRow.groupName) > 256)
                    obj["groupName"] = "Name cannot be more than 256 characters";
                else obj["groupName"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        roleGroupValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditRoleGroupMaster(rowIndex: number) {
        roleGroupValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(roleGroupValidationErrors.value)) {
            loading.value.form = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: roleGroupTableData.value[rowIndex].id || 0,
                groupName: roleGroupTableData.value[rowIndex].groupName as string,
                assignedRoles: roleGroupTableData.value[rowIndex].assignedRoles,
                updatedBy: 0,
            };
            if (!roleGroupTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createRoleGroupMasterAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateRoleGroupMasterAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetRoleGroupEditFormDetails();
                await roleGroupMasterPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        roleGroupTableData.value[rowIndex].tempID,
                        roleGroupValidationErrors.value,
                        defaultValidationErrors(roleGroupTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        roleGroupValidationErrors.value,
                        roleGroupTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteRoleGroupMasterById(roleGroupId: string) {
        loading.value.form = true;
        const { status, message } = await deleteRoleGroupMasterByIdAPI(roleGroupId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await roleGroupMasterPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Role Group

    // Role
    const editFormDetails = ref<TEditFormDetail>({});
    const roleSearch = ref<TNullableString>(null);
    const roleTableLoaderDetails = ref<TTableLoaderDetail>({});
    const roleColumns: IColumn[] = [
        {
            field: "role",
            header: "Role",
            icon: false,
            show: true,
        },
        {
            field: "roleGroupNames",
            header: "Group Name",
            icon: false,
            show: true,
        },
        {
            field: "description",
            header: "Description",
            icon: false,
            show: true,
        },
        {
            field: "showInEDCPortal",
            header: "Show in EDC Portal",
            icon: false,
            show: true,
        },
    ];
    const roleTableData = ref<ITableData[]>([]);
    const roleTableDataRef = ref<ITableData[]>(deepClone(roleTableData.value));
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const loading = ref<Loading>(new Loading());

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    function editForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editFormDetails.value))
            editFormDetails.value[rowIndex] = true;
        else editFormDetails.value[rowIndex] = !editFormDetails.value[rowIndex];
    }

    function resetEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, validationErrors.value);
        } else {
            editFormDetails.value = {};
            validationErrors.value = {};
        }
    }

    function addOrEditRoleAction() {
        const tempID = uniqueID();
        roleTableData.value.unshift({
            id: null,
            role: null,
            roleGroupNames: null,
            description: null,
            showInEDCPortal: true,
            tempID,
        });
        editForm(tempID);
    }

    function setTableData(tableData: IRoleData[]): ITableData[] {
        roleTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            roleGroupNames: row.roleGroupNames,
            role: row.role,
            description: row.description,
            showInEDCPortal: row.showInEDCPortal,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function rolePaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await rolePaginationListAPI(
            getAPIFilters({
                search: roleSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
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

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of roleTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.role) === 0) obj["role"] = "Please enter a role";
                else if (getStringLength(tableRow.role) > 256)
                    obj["role"] = "Role cannot be more than 256 characters";
                else obj["role"] = "";
                if (getStringLength(tableRow.description) > 256)
                    obj["description"] = "Description cannot be more than 256 characters";
                else obj["description"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditRole(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            loading.value.form = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: roleTableData.value[rowIndex].id || 0,
                role: roleTableData.value[rowIndex].role as string,
                roleGroupNames: roleTableData.value[rowIndex].roleGroupNames,
                description: roleTableData.value[rowIndex].description,
                showInEDCPortal: roleTableData.value[rowIndex].showInEDCPortal,
                updatedBy: 0,
            };
            if (!roleTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createRoleAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateRoleAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetEditFormDetails();
                await rolePaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        roleTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(roleTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        roleTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteRoleById(roleId: string) {
        loading.value.form = true;
        const { status, message } = await deleteRoleByIdAPI(roleId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await rolePaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Role

    // Role Permission Type
    const editRolePermissionTypeFormDetails = ref<TEditFormDetail>({});
    const rolePermissionTypeSearch = ref<TNullableString>(null);
    const rolePermissionTypeTableLoaderDetails = ref<TTableLoaderDetail>({});
    const rolePermissionTypeColumns: IColumn[] = [
        {
            field: "type",
            header: "Type",
            icon: false,
            show: true,
        },
    ];
    const rolePermissionTypeTableData = ref<IPermissionTypeTableData[]>([]);
    const rolePermissionTypeTableDataRef = ref<IPermissionTypeTableData[]>(
        deepClone(rolePermissionTypeTableData.value),
    );
    const rolePermissionTypeValidationErrors = ref<
        TValidationErrorData<IPermissionTypeValidationError>
    >({});

    const disableRolePermissionTypeAction = computed(() =>
        checkIfEditFormActive(editRolePermissionTypeFormDetails.value),
    );

    function editRolePermissionTypeForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editRolePermissionTypeFormDetails.value))
            editRolePermissionTypeFormDetails.value[rowIndex] = true;
        else
            editRolePermissionTypeFormDetails.value[rowIndex] =
                !editRolePermissionTypeFormDetails.value[rowIndex];
    }

    function resetRolePermissionTypeEditFormDetails(tempID?: string) {
        if (tempID) {
            editRolePermissionTypeForm(tempID);
            deleteObjectPropertyByKey(tempID, rolePermissionTypeValidationErrors.value);
        } else {
            editRolePermissionTypeFormDetails.value = {};
            rolePermissionTypeValidationErrors.value = {};
        }
    }

    function addOrEditRolePermissionTypeAction() {
        const tempID = uniqueID();
        rolePermissionTypeTableData.value.unshift({
            id: null,
            type: null,
            tempID,
        });
        editRolePermissionTypeForm(tempID);
    }

    function setRolePermissionTypeTableData(
        tableData: IRolePermissionTypeData[],
    ): IPermissionTypeTableData[] {
        rolePermissionTypeTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            type: row.type,
            tempID: uniqueID(),
        })) as IPermissionTypeTableData[];
    }

    async function rolePermissionTypePaginationList() {
        loading.value.dynamicLoading["rolePermissionTypeTable"] = true;
        const { status, data, message } = await rolePermissionTypePaginationListAPI(
            getAPIFilters({
                search: rolePermissionTypeSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setRolePermissionTypeTableData(items);
            rolePermissionTypeTableData.value = deepClone(tableData);
            rolePermissionTypeTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            rolePermissionTypeTableData.value = [];
            rolePermissionTypeTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["rolePermissionTypeTable"] = false;
    }

    function validateRolePermissionTypeAll(rowIndex: number) {
        const result: TValidationErrorData<IPermissionTypeValidationError> = {
            ...rolePermissionTypeValidationErrors.value,
        };
        for (const [index, tableRow] of rolePermissionTypeTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IPermissionTypeValidationError = {
                    ...defaultRolerolePermissionTypeValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.type) === 0) obj["type"] = "Please enter a type";
                else if (getStringLength(tableRow.type) > 256)
                    obj["type"] = "Type cannot be more than 256 characters";
                else obj["type"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        rolePermissionTypeValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditRolePermissionType(rowIndex: number) {
        validateRolePermissionTypeAll(rowIndex);
        if (!checkIfObjectHasErrors(rolePermissionTypeValidationErrors.value)) {
            loading.value.dynamicLoading["rolePermissionTypeForm"] = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: rolePermissionTypeTableData.value[rowIndex].id || 0,
                type: rolePermissionTypeTableData.value[rowIndex].type as string,
                updatedBy: 0,
            };
            if (!rolePermissionTypeTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createRolePermissionTypeAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateRolePermissionTypeAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetRolePermissionTypeEditFormDetails();
                await rolePermissionTypePaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        rolePermissionTypeTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(rolePermissionTypeTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        rolePermissionTypeTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.dynamicLoading["rolePermissionTypeForm"] = false;
        }
    }

    async function deleteRolePermissionTypeById(rolePermissionTypeId: string) {
        loading.value.dynamicLoading["rolePermissionTypeForm"] = true;
        const { status, message } = await deleteRolePermissionTypeByIdAPI(rolePermissionTypeId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await rolePermissionTypePaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["rolePermissionTypeForm"] = false;
    }
    // Role Permission Type

    const {
        isModelChanged: isRoleGroupModelChanged,
        model: roleGroupModel,
        modelRef: roleGroupModelRef,
    } = useUnsavedAlert(roleGroupTableData.value, roleGroupTableDataRef.value);

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        roleTableData.value,
        roleTableDataRef.value,
    );

    const {
        isModelChanged: isRolePermissionTypeModelChanged,
        model: rolePermissionTypeModel,
        modelRef: rolePermissionTypeModelRef,
    } = useUnsavedAlert(rolePermissionTypeTableData.value, rolePermissionTypeTableDataRef.value);

    watch(
        () => roleGroupTableData.value,
        (newValue) => {
            roleGroupModel.value = newValue;
            roleGroupModelRef.value = roleGroupTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => isRoleGroupModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => roleTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = roleTableDataRef.value;
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
        () => rolePermissionTypeTableData.value,
        (newValue) => {
            rolePermissionTypeModel.value = newValue;
            rolePermissionTypeModelRef.value = rolePermissionTypeTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => isRolePermissionTypeModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset") {
                if (isModelChanged.value) {
                    roleTableData.value = deepClone(roleTableDataRef.value);
                    resetEditFormDetails();
                } else if (isRoleGroupModelChanged.value) {
                    roleGroupTableData.value = deepClone(roleGroupTableDataRef.value);
                    resetRoleGroupEditFormDetails();
                } else if (isRolePermissionTypeModelChanged.value) {
                    rolePermissionTypeModel.value = deepClone(rolePermissionTypeModelRef.value);
                    resetRolePermissionTypeEditFormDetails();
                }
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["rolePermissionTypeTable", "rolePermissionTypeForm"]);
        Promise.all([
            roleGroupMasterPaginationList(),
            rolePaginationList(),
            rolePermissionTypePaginationList(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Role Groups">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="roleGroupSearch"
                            element-id="roleGroupSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled(disableRoleGroupAction)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await roleGroupMasterPaginationList();
                                    globalStore.triggerSearchBarRefocus('#roleGroupSearch');
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableRoleGroupAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditRoleGroupAction()"
                            :disabled="loading.isDisabled()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Role Group</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="roleGroupMasterColumns"
                            :table-data="roleGroupTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="roleGroupSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-input
                                        :key="`name-${data.tempID}`"
                                        v-model="data.groupName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="
                                            !isEditable(data.tempID, roleGroupEditFormDetails)
                                        "
                                        :error="
                                            checkIfKeyExistsInObject(
                                                data.tempID,
                                                roleGroupValidationErrors,
                                            )
                                                ? roleGroupValidationErrors[data.tempID].groupName
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        :key="`assignedRoles-${data.tempID}`"
                                        v-model="data.assignedRoles"
                                        type="text"
                                        placeholder="Enter group name"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :ellipse-count="35"
                                        :error="
                                            checkIfKeyExistsInObject(
                                                data.tempID,
                                                roleGroupValidationErrors,
                                            )
                                                ? roleGroupValidationErrors[data.tempID]
                                                      .assignedRoles
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, roleGroupEditFormDetails) &&
                                        !disableRoleGroupAction
                                    "
                                    :container-class="
                                        !isEditable(data.tempID, roleGroupEditFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    loader-type="table"
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => editRoleGroupForm(data.tempID)"
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, roleGroupEditFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, roleGroupEditFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditRoleGroupMaster(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <!-- <edc-pressable
                                    v-if="isEditable(index, editFormDetails)"
                                    v-tooltip.top="'Cancel'"
                                    :container-class="
                                        !isEditable(index, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
                                    :on-click="() => resetFormModel()"
                                >
                                    <edc-icon
                                        icon="circle-close"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable> -->
                                <edc-pressable
                                    v-if="isEditable(data.tempID, roleGroupEditFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, roleGroupEditFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                roleGroupTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: roleGroupTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                roleGroupTableData[index] = deepClone(
                                                    roleGroupTableDataRef[index],
                                                );
                                            resetRoleGroupEditFormDetails(data.tempID);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Reset'"
                                        icon="undo"
                                        :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, roleGroupEditFormDetails) &&
                                        !disableRoleGroupAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, roleGroupEditFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: String(data.groupName),
                                                module: 'Role Groups',
                                                page: 'Role Group Entries',
                                                data,
                                            });
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Assign roles'"
                                        icon="circle-play"
                                        :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(data.tempID, roleGroupEditFormDetails) &&
                                        data.id &&
                                        !disableRoleGroupAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, roleGroupTableLoaderDetails) && roleGroupTableLoaderDetails[index] ? 'show' : 'hide'}DeleteRoleGroupConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this role group?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            roleGroupTableLoaderDetails[index] = true;
                                            await deleteRoleGroupMasterById(String(data.id));
                                            roleGroupTableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :disabled="loading.isDisabled()"
                                            :container-class="
                                                !isEditable(data.tempID, roleGroupEditFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :show-loader="roleGroupTableLoaderDetails[index]"
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template>
                            <template #errorMessage="{ data }">
                                <edc-error-text
                                    v-if="isEditable(data.tempID, roleGroupEditFormDetails)"
                                    :error="
                                        checkIfKeyExistsInObject(
                                            data.tempID,
                                            roleGroupValidationErrors,
                                        ) &&
                                        checkIfObjectHasErrors(
                                            roleGroupValidationErrors[data.tempID],
                                        )
                                            ? 'No error'
                                            : ''
                                    "
                                    container-class="mt-[0.3rem]"
                                />
                            </template>
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
                            :disabled="loading.isDisabled(disableAction)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await rolePaginationList();
                                    globalStore.triggerSearchBarRefocus('#roleSearch');
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditRoleAction()"
                            :disabled="loading.isDisabled()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Role</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="roleColumns"
                            :table-data="roleTableData"
                            :loading="loading.secondaryTable"
                            pagination-type="none"
                            search-key="roleSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            :disabled="loading.isDisabled()"
                            skeleton-loader-class="w-[60%]"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                >
                                    <edc-text-input
                                        :key="`role-${data.tempID}`"
                                        v-model="data.role"
                                        type="text"
                                        placeholder="Enter role *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].role
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                >
                                    <edc-text-area
                                        :key="`roleGroupNames-${data.tempID}`"
                                        v-model="data.roleGroupNames"
                                        type="text"
                                        placeholder="Enter group name"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :ellipse-count="15"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].roleGroupNames
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[12rem]"
                                >
                                    <edc-text-input
                                        :key="`description-${data.tempID}`"
                                        v-model="data.description"
                                        type="text"
                                        placeholder="Enter description *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].description
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        v-model="data.showInEDCPortal"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :checked="data.showInEDCPortal"
                                        name="showInEDCPortal"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].showInEDCPortal
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => editForm(data.tempID)"
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditRole(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <!-- <edc-pressable
                                    v-if="isEditable(index, editFormDetails)"
                                    v-tooltip.top="'Cancel'"
                                    :container-class="
                                        !isEditable(index, editFormDetails) ? 'mt-[1rem]' : ''
                                    "
                                    :on-click="() => resetFormModel()"
                                >
                                    <edc-icon
                                        icon="circle-close"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable> -->
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                roleTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: roleTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                roleTableData[index] = deepClone(
                                                    roleTableDataRef[index],
                                                );
                                            resetEditFormDetails(data.tempID);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Reset'"
                                        icon="undo"
                                        :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) &&
                                        data.id &&
                                        !disableAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, roleTableLoaderDetails) && roleTableLoaderDetails[index] ? 'show' : 'hide'}DeleteRoleConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this role?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            roleTableLoaderDetails[index] = true;
                                            await deleteRoleById(String(data.id));
                                            roleTableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :disabled="loading.isDisabled()"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :show-loader="roleTableLoaderDetails[index]"
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template>
                            <template #errorMessage="{ data }">
                                <edc-error-text
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    :error="
                                        checkIfKeyExistsInObject(data.tempID, validationErrors) &&
                                        checkIfObjectHasErrors(validationErrors[data.tempID])
                                            ? 'No error'
                                            : ''
                                    "
                                    container-class="mt-[0.3rem]"
                                />
                            </template>
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper group-label="Role Permission Types">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="rolePermissionTypeSearch"
                            element-id="rolePermissionTypeSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled(disableRoleGroupAction)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await rolePermissionTypePaginationList();
                                    globalStore.triggerSearchBarRefocus(
                                        '#rolePermissionTypeSearch',
                                    );
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableRolePermissionTypeAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="async () => await addOrEditRolePermissionTypeAction()"
                            :disabled="loading.isDisabled()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Permission Type</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="rolePermissionTypeColumns"
                            :table-data="rolePermissionTypeTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="rolePermissionTypeSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-input
                                        :key="`type-${data.tempID}`"
                                        v-model="data.type"
                                        type="text"
                                        placeholder="Enter type *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="
                                            !isEditable(
                                                data.tempID,
                                                editRolePermissionTypeFormDetails,
                                            )
                                        "
                                        :error="
                                            checkIfKeyExistsInObject(
                                                data.tempID,
                                                rolePermissionTypeValidationErrors,
                                            )
                                                ? rolePermissionTypeValidationErrors[data.tempID]
                                                      .type
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(
                                            data.tempID,
                                            editRolePermissionTypeFormDetails,
                                        ) && !disableRolePermissionTypeAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => editRolePermissionTypeForm(data.tempID)"
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="
                                        isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                    "
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditRolePermissionType(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="
                                        isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                    "
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                rolePermissionTypeTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: rolePermissionTypeTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                rolePermissionTypeTableData[index] = deepClone(
                                                    rolePermissionTypeTableDataRef[index],
                                                );
                                            resetRolePermissionTypeEditFormDetails(data.tempID);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Reset'"
                                        icon="undo"
                                        :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(
                                            data.tempID,
                                            editRolePermissionTypeFormDetails,
                                        ) &&
                                        data.id &&
                                        !disableRolePermissionTypeAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, rolePermissionTypeTableLoaderDetails) && rolePermissionTypeTableLoaderDetails[index] ? 'show' : 'hide'}DeletePermissionTypeConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this permission type?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            rolePermissionTypeTableLoaderDetails[index] = true;
                                            await deleteRolePermissionTypeById(String(data.id));
                                            rolePermissionTypeTableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :disabled="loading.isDisabled()"
                                            :container-class="
                                                !isEditable(
                                                    data.tempID,
                                                    editRolePermissionTypeFormDetails,
                                                )
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :show-loader="
                                                rolePermissionTypeTableLoaderDetails[index]
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template>
                            <template #errorMessage="{ data }">
                                <edc-error-text
                                    v-if="
                                        isEditable(data.tempID, editRolePermissionTypeFormDetails)
                                    "
                                    :error="
                                        checkIfKeyExistsInObject(
                                            data.tempID,
                                            rolePermissionTypeValidationErrors,
                                        ) &&
                                        checkIfObjectHasErrors(
                                            rolePermissionTypeValidationErrors[data.tempID],
                                        )
                                            ? 'No error'
                                            : ''
                                    "
                                    container-class="mt-[0.3rem]"
                                />
                            </template>
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
