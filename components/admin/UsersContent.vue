<script setup lang="ts">
    import User from "~/services/apis/data/admin/user";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        userPaginationListAPI,
        rolesListAPI,
        createUserAPI,
        updateUserAPI,
        organizationsListAPI,
        enterprisesListAPI,
        deleteUserByIdAPI,
    } from "~/services/apis/handlers/admin/user";
    import type { IUserCreateResponse, IUserData } from "~/services/apis/handlers/types/user-types";
    import useGlobalStore from "~/stores/global";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TAdminFormAction,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        name: TNullableString;
        roleId: TNullableNumber;
        role: TNullableString;
        orgType: TNullableString;
        isActive: boolean;
        isInternal: boolean;
        firstName: TNullableString;
        lastName: TNullableString;
        username: TNullableString;
        password: TNullableString;
        enterpriseName: TNullableString;
        emailAddress: TNullableString;
        lastLoginTime: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        id: string;
        name: string;
        roleId: string;
        role: string;
        orgType: string;
        isActive: string;
        isInternal: string;
        firstName: string;
        lastName: string;
        username: string;
        password: string;
        enterpriseName: string;
        emailAddress: string;
        lastLoginTime: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        id: "",
        name: "",
        roleId: "",
        role: "",
        orgType: "",
        isActive: "",
        isInternal: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        enterpriseName: "",
        emailAddress: "",
        lastLoginTime: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const formAction = ref<TAdminFormAction>("View");
    const formModel = ref<User>(new User());
    const formModelRef = ref<User>(new User());
    const errorModel = ref<IValidationError>({ ...defaultValidationErrors("formModel") });
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const filterModel = ref<{
        search: TNullableString;
        roleId: TNullableNumber;
        organizationId: TNullableNumber;
        enterpriseId: TNullableNumber;
    }>({
        search: null,
        roleId: null,
        organizationId: null,
        enterpriseId: null,
    });
    const userColumns: IColumn[] = [
        {
            field: "firstName",
            header: "First Name",
            icon: false,
            show: true,
        },
        {
            field: "lastName",
            header: "Last Name",
            icon: false,
            show: true,
        },
        {
            field: "username",
            header: "Username",
            icon: false,
            show: true,
        },
        {
            field: "emailAddress",
            header: "Email",
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
    const userTableData = ref<ITableData[]>([]);
    const userTableDataRef = ref<ITableData[]>(deepClone(userTableData.value));
    const roleOptions = ref<DropdownOption>(new DropdownOption());
    const organizationOptions = ref<DropdownOption>(new DropdownOption());
    const enterpriseOptions = ref<DropdownOption>(new DropdownOption());

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const roleLookups = computed(() => getOptionsList(roleOptions.value.options, "role", "id"));

    const organizationLookups = computed(() =>
        getOptionsList(organizationOptions.value.options, "orgType", "orgType"),
    );

    const enterpriseLookups = computed(() =>
        getOptionsList(enterpriseOptions.value.options, "enterpriseName", "enterpriseName"),
    );

    async function rolesList() {
        roleOptions.value.loading = true;
        const { status, data, message } = await rolesListAPI();
        if (status === 200) {
            roleOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            roleOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        roleOptions.value.loading = false;
    }

    async function organizationList() {
        organizationOptions.value.loading = true;
        const { status, data, message } = await organizationsListAPI();
        if (status === 200) {
            organizationOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            organizationOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        organizationOptions.value.loading = false;
    }

    async function enterprisesList() {
        enterpriseOptions.value.loading = true;
        const { status, data, message } = await enterprisesListAPI();
        if (status === 200) {
            enterpriseOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            enterpriseOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        enterpriseOptions.value.loading = false;
    }

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
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

    function addOrEditUserAction() {
        const tempID = uniqueID();
        userTableData.value.unshift({
            id: null,
            name: null,
            roleId: null,
            role: null,
            orgType: null,
            isActive: false,
            isInternal: false,
            firstName: null,
            lastName: null,
            username: null,
            password: null,
            enterpriseName: null,
            emailAddress: null,
            lastLoginTime: null,
            tempID,
        });
        editForm(tempID);
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of userTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.firstName) === 0)
                    obj["firstName"] = "Please enter a first name";
                else if (getStringLength(tableRow.firstName) > 50)
                    obj["firstName"] = "First name cannot be more than 50 characters";
                else obj["firstName"] = "";
                if (tableRow.lastName && getStringLength(tableRow.lastName) > 50)
                    obj["lastName"] = "Last name cannot be more than 50 characters";
                else obj["lastName"] = "";
                if (getStringLength(tableRow.username) === 0)
                    obj["username"] = "Please enter a username";
                else if (getStringLength(tableRow.username) > 50)
                    obj["username"] = "Username cannot be more than 50 characters";
                else obj["username"] = "";
                if (getStringLength(tableRow.emailAddress) === 0)
                    obj["emailAddress"] = "Please enter an email";
                else if (getStringLength(tableRow.emailAddress) > 255)
                    obj["emailAddress"] = "Email cannot be more than 255 characters";
                else if (!checkEmail(tableRow.emailAddress || ""))
                    obj["emailAddress"] = "Please enter a valid email";
                else obj["emailAddress"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableData: IUserData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            name: row.name,
            roleId: row.roleId,
            role: row.role,
            orgType: row.orgType,
            isActive: row.isActive,
            isInternal: row.isInternal,
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            password: row.password,
            enterpriseName: row.enterpriseName,
            emailAddress: row.emailAddress,
            lastLoginTime: row.lastLoginTime,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function userPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await userPaginationListAPI(
            getAPIFilters({
                search: filterModel.value.search,
                filter: {
                    roleId: filterModel.value.roleId as number,
                },
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

    async function saveAddOrEditUser(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            let data: IUserCreateResponse | null = null;
            const requestData = {
                id: userTableData.value[rowIndex].id || 0,
                name: userTableData.value[rowIndex].name,
                roleId: userTableData.value[rowIndex].roleId,
                role: userTableData.value[rowIndex].role,
                orgType: userTableData.value[rowIndex].orgType,
                isActive: userTableData.value[rowIndex].isActive,
                isInternal: userTableData.value[rowIndex].isInternal,
                firstName: userTableData.value[rowIndex].firstName as string,
                lastName: userTableData.value[rowIndex].lastName,
                username: userTableData.value[rowIndex].username as string,
                password: userTableData.value[rowIndex].password,
                enterpriseName: userTableData.value[rowIndex].enterpriseName,
                emailAddress: userTableData.value[rowIndex].emailAddress,
                lastLoginTime: userTableData.value[rowIndex].lastLoginTime,
                updatedBy: 0,
            };
            if (!userTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                    data: apiData,
                } = await createUserAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
                data = apiData;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                    data: apiData,
                } = await updateUserAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
                data = apiData;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (!userTableData.value[rowIndex].id && data?.subject) {
                    const uniqueKey = setEmailTemplate({
                        to: data?.to || "",
                        cc: data?.cc || "",
                        bcc: data?.bcc || "",
                        subject: data?.subject || "",
                        body: data?.body || "",
                        emailDetails: {
                            id: data?.tempId || "",
                            name: data?.name || "",
                        },
                    });
                    renderEmailTemplate(uniqueKey);
                }
                resetEditFormDetails();
                await userPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        userTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(userTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        userTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteUserById(userId: string) {
        loading.value.form = true;
        const { status, message } = await deleteUserByIdAPI(userId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await userPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function showDetails(data: ITableData) {
        formModel.value.id = data.id;
        formModel.value.name = data.name;
        formModel.value.roleId = data.roleId;
        formModel.value.role = data.role;
        formModel.value.orgType = data.orgType;
        formModel.value.isActive = data.isActive;
        formModel.value.isInternal = data.isInternal;
        formModel.value.firstName = data.firstName;
        formModel.value.lastName = data.lastName;
        formModel.value.username = data.username;
        formModel.value.password = data.password;
        formModel.value.enterpriseName = data.enterpriseName;
        formModel.value.emailAddress = data.emailAddress;
        formModel.value.lastLoginTime = data.lastLoginTime;

        formModelRef.value.id = data.id;
        formModelRef.value.name = data.name;
        formModelRef.value.roleId = data.roleId;
        formModelRef.value.role = data.role;
        formModelRef.value.orgType = data.orgType;
        formModelRef.value.isActive = data.isActive;
        formModelRef.value.isInternal = data.isInternal;
        formModelRef.value.firstName = data.firstName;
        formModelRef.value.lastName = data.lastName;
        formModelRef.value.username = data.username;
        formModelRef.value.password = data.password;
        formModelRef.value.enterpriseName = data.enterpriseName;
        formModelRef.value.emailAddress = data.emailAddress;
        formModelRef.value.lastLoginTime = data.lastLoginTime;

        formAction.value = "Update";
        popupModalStore.show("adminUserModal");
    }

    function resetFormModel(closeModal?: TVoidAction) {
        formModel.value = new User();
        formModelRef.value = new User();
        if (closeModal) closeModal();
    }

    function validateDetails() {
        if (getStringLength(formModel.value.firstName) === 0)
            errorModel.value.firstName = "Please enter a first name";
        else if (getStringLength(formModel.value.firstName) > 50)
            errorModel.value.firstName = "First name cannot be more than 50 characters";
        else errorModel.value.firstName = "";
        if (formModel.value.lastName && getStringLength(formModel.value.lastName) > 50)
            errorModel.value.lastName = "Last name cannot be more than 50 characters";
        else errorModel.value.lastName = "";
        if (getStringLength(formModel.value.username) === 0)
            errorModel.value.username = "Please enter a username";
        else if (getStringLength(formModel.value.username) > 50)
            errorModel.value.username = "Username cannot be more than 50 characters";
        else errorModel.value.username = "";
        if (getStringLength(formModel.value.emailAddress) === 0)
            errorModel.value.emailAddress = "Please enter an email";
        else if (getStringLength(formModel.value.emailAddress) > 255)
            errorModel.value.emailAddress = "Email cannot be more than 255 characters";
        else if (!checkEmail(formModel.value.emailAddress || ""))
            errorModel.value.emailAddress = "Please enter a valid email";
        else errorModel.value.emailAddress = "";
        if (formModel.value.orgType && getStringLength(formModel.value.orgType) > 50)
            errorModel.value.orgType = "Organization cannot be more than 50 characters";
        else errorModel.value.orgType = "";
        if (formModel.value.enterpriseName && getStringLength(formModel.value.enterpriseName) > 128)
            errorModel.value.enterpriseName = "Enterprise cannot be more than 128 characters";
        else errorModel.value.enterpriseName = "";
    }

    async function saveDetails(closeModal: TVoidAction) {
        validateDetails();
        if (!checkIfModelHasErrors(errorModel.value, ["index", "isActive", "isInternal"])) {
            loading.value.form = true;
            const {
                message,
                status,
                validationErrors: apiValidationErrors,
            } = await updateUserAPI({
                id: formModel.value.id || 0,
                name: formModel.value.name,
                roleId: formModel.value.roleId,
                role: formModel.value.role,
                orgType: formModel.value.orgType,
                isActive: formModel.value.isActive,
                isInternal: formModel.value.isInternal,
                firstName: formModel.value.firstName as string,
                lastName: formModel.value.lastName,
                username: formModel.value.username as string,
                password: formModel.value.password,
                enterpriseName: formModel.value.enterpriseName,
                emailAddress: formModel.value.emailAddress,
                lastLoginTime: formModel.value.lastLoginTime,
                updatedBy: 0,
            });
            if (status === 200) {
                resetFormModel(closeModal);
                formAction.value = "View";
                await userPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && apiValidationErrors) {
                    setAPIValidationErrors(apiValidationErrors, errorModel.value);
                }
            }
            loading.value.form = false;
        }
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        userTableData.value,
        userTableDataRef.value,
    );

    useUnsavedAlert(formModel.value, formModelRef.value);

    watch(
        () => userTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = userTableDataRef.value;
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
                userTableData.value = deepClone(userTableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
                popupModalStore.hide("adminUserModal");
            }
        },
    );

    onMounted(() => {
        const { queryData } = props.tabData[props.activeTab.label];
        if (queryData) {
            const { filter, search } = queryData;
            if (search) filterModel.value.search = search;
            if (filter && filter.roleId) filterModel.value.roleId = filter.roleId;
        }
        // await siteList();
        Promise.all([userPaginationList(), rolesList(), organizationList(), enterprisesList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Users">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="filterModel.search"
                            element-id="userSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled(disableAction)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await userPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#userSearch');
                                }
                            "
                        />
                        <edc-dropdown
                            :key="filterModel.roleId ? `role-${filterModel.roleId}` : 'role'"
                            v-model="filterModel.roleId"
                            default-value="Role"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(disableAction)"
                            :options="roleLookups"
                            :loading="roleOptions.loading"
                            @on-select="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                        />
                        <edc-dropdown
                            :key="
                                filterModel.organizationId
                                    ? `Organization-${filterModel.organizationId}`
                                    : 'Organization'
                            "
                            v-model="filterModel.organizationId"
                            default-value="Organization"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(disableAction)"
                            :options="organizationLookups"
                            :loading="organizationOptions.loading"
                            @on-select="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                        />
                        <edc-dropdown
                            :key="
                                filterModel.enterpriseId
                                    ? `enterprise-${filterModel.enterpriseId}`
                                    : 'enterprise'
                            "
                            v-model="filterModel.enterpriseId"
                            default-value="Enterprise"
                            container-class="w-[16rem]"
                            option-class="w-[16rem]"
                            input-class="admin-input-font"
                            :enable-clear="true"
                            :disabled="loading.isDisabled(disableAction)"
                            :options="enterpriseLookups"
                            :loading="enterpriseOptions.loading"
                            @on-select="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                            @on-clear="
                                async () => {
                                    await userPaginationList();
                                }
                            "
                        />
                        <edc-pressable
                            v-if="!disableAction"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditUserAction()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Add User</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="userColumns"
                            :table-data="userTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="userSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            action-row-class="min-w-[12rem] max-w-[12rem]"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`firstName-${data.tempID}`"
                                        v-model="data.firstName"
                                        type="text"
                                        placeholder="Enter first name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].firstName
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`lastName-${data.tempID}`"
                                        v-model="data.lastName"
                                        type="text"
                                        placeholder="Enter last name"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].lastName
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`username-${data.tempID}`"
                                        v-model="data.username"
                                        type="text"
                                        placeholder="Enter username *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].username
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`emailAddress-${data.tempID}`"
                                        v-model="data.emailAddress"
                                        type="text"
                                        placeholder="Enter email address *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].emailAddress
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-dropdown
                                        :key="`roleId-${data.tempID}`"
                                        v-model="data.roleId"
                                        container-class="w-[20rem]"
                                        :options="roleLookups"
                                        :default-value="
                                            isEditable(data.tempID, editFormDetails)
                                                ? 'Role'
                                                : 'No Role'
                                        "
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[20rem]"
                                        :disabled="loading.isDisabled()"
                                        :loading="roleOptions.loading"
                                        :enable-clear="true"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].role
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
                                    :on-click="async () => await saveAddOrEditUser(index)"
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
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
                                        () => {
                                            if (!data.id)
                                                userTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: userTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                userTableData[index] = deepClone(
                                                    userTableDataRef[index],
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
                                    :on-click="
                                        () => {
                                            showDetails(data);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Details'"
                                        icon="eye"
                                        :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
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
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: String(data.name),
                                                module: 'Users',
                                                page: 'User Entries',
                                                data,
                                            });
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'User Entries'"
                                        icon="circle-play"
                                        :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) &&
                                        data.id &&
                                        !disableAction
                                    "
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this user?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteUserById(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            :disabled="loading.isDisabled()"
                                            :show-loader="tableLoaderDetails[index]"
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
    </div>
    <edc-popup-modal
        v-if="formAction !== 'View'"
        modal-id="adminUserModal"
        :on-cancel="(closeModal) => resetFormModel(closeModal)"
        :on-submit="async (closeModal) => await saveDetails(closeModal)"
    >
        <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
            <edc-text-input
                v-model="formModel.orgType"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter organization"
                label="Organization"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.orgType"
            />
            <edc-text-input
                v-model="formModel.enterpriseName"
                container-class="w-[34rem]"
                type="text"
                placeholder="Enter enterprise"
                label="Enterprise"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                :disabled="loading.isDisabled()"
                :error="errorModel.enterpriseName"
            />
            <edc-checkbox
                v-model="formModel.isActive"
                name="isActive"
                label-class="font-bold admin-input-font"
                label="Is active"
                :disabled="loading.isDisabled()"
                :error="errorModel.isActive"
            />
            <edc-checkbox
                v-model="formModel.isInternal"
                name="isInternal"
                label-class="font-bold admin-input-font"
                label="Is internal"
                :disabled="loading.isDisabled()"
                :error="errorModel.isInternal"
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
