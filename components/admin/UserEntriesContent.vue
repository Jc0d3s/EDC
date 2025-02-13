<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        listAllStudyTrialEnvironmentsAPI,
        listAllStudyTrialsAPI,
    } from "~/services/apis/handlers/admin/study";
    import {
        createStudyUserAPI,
        deleteStudyUserAPI,
        studyUserPaginationListAPI,
        updateStudyUserAPI,
    } from "~/services/apis/handlers/admin/study-user";
    import { rolesListAPI } from "~/services/apis/handlers/admin/user";
    import type { IStudyUserData } from "~/services/apis/handlers/types/admin/study-user-types";
    import type { IStudyTrialData } from "~/services/apis/handlers/types/study-types";
    import useGlobalStore from "~/stores/global";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IWinFormProps,
        TAdminFormAction,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface IStudyUserModel {
        id: TNullableNumber;
        studyId: number;
        roleId: TNullableNumber;
        roleName: TNullableString;
        roleDescription: string;
        userId: number;
        trialId: TNullableNumber;
        trialName: TNullableString;
        userName: TNullableString;
        environmentId: TNullableNumber;
        environmentName: TNullableString;
    }

    interface IStudySiteErrorModel {
        roleId: string;
        trialId: string;
        environmentId: string;
    }

    interface ITableData extends IStudyUserModel {
        studyName: TNullableString;
        tempID: string;
    }

    const defaultStudyUserModel = (): IStudyUserModel => ({
        id: null,
        studyId: 0,
        roleId: null,
        roleName: null,
        roleDescription: "",
        userId: 0,
        trialId: null,
        trialName: "",
        environmentName: "",
        userName: "",
        environmentId: 0,
    });

    const defaultStudyUserErrorModel = (): IStudySiteErrorModel => ({
        roleId: "",
        environmentId: "",
        trialId: "",
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
    const studyUserFormAction = ref<TAdminFormAction>("View");
    const formModel = ref<IStudyUserModel>({ ...defaultStudyUserModel() });
    const formModelRef = ref<IStudyUserModel>({ ...defaultStudyUserModel() });
    const errorModel = ref<IStudySiteErrorModel>({ ...defaultStudyUserErrorModel() });
    const roleOptions = ref<DropdownOption>(new DropdownOption());
    const trialOptions = ref<DropdownOption>(new DropdownOption());
    const environmentOptions = ref<DropdownOption>(new DropdownOption());
    const studyUserTableData = ref<ITableData[]>([]);
    const studyUserTableDataRef = ref<ITableData[]>(deepClone(studyUserTableData.value));
    const selectedTrialId = ref<TNullableNumber>(null);
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    // FIXME: comment the below after demo
    const roleLookups = computed(() => getOptionsList(roleOptions.value.options, "role", "id"));
    const trialLookups = computed(() =>
        getOptionsList(trialOptions.value.options, "trialName", "id"),
    );
    const environmentLookups = computed(() =>
        getOptionsList(environmentOptions.value.options, "environment", "id"),
    );
    // FIXME: uncomment the below after demo
    // const roleLookups = computed(() => {
    //     const rolesListResult = getOptionsList(roleOptions.value.options, "role", "id");
    //     if (formModel.value.environmentId) {
    //         const result: IOptions[] = [];
    //         for (const environmentRow of environmentLookups.value) {
    //             if (environmentRow.value !== formModel.value.environmentId) continue;
    //             for (const roleRow of rolesListResult) {
    //                 if (
    //                     isRoleAllowedForTheSelectedEnvironment(environmentRow.label, roleRow.label)
    //                 ) {
    //                     result.push({
    //                         label: roleRow.label,
    //                         value: roleRow.value,
    //                     });
    //                     break;
    //                 }
    //             }
    //         }
    //         return result;
    //     }
    //     return rolesListResult;
    // });
    // const trialLookups = computed(() => {
    //     const result: IOptions[] = [];
    //     for (const row of studyUserTableData.value) {
    //         if (
    //             getArrayLength(
    //                 getFilteredItems({
    //                     data: result,
    //                     type: "object",
    //                     value: row.trialId as number,
    //                     key: "value",
    //                 }),
    //             ) === 0
    //         )
    //             result.push({
    //                 label: row.trialName as string,
    //                 value: row.trialId as number,
    //             });
    //     }
    //     return deepClone(result);
    // });
    // const environmentLookups = computed(() => {
    //     const result: IOptions[] = [];
    //     for (const row of getFilteredItems({
    //         data: studyUserTableData.value,
    //         type: "object",
    //         value: selectedTrialId.value || 0,
    //         key: "trialId",
    //     })) {
    //         result.push({
    //             label: row.environmentName as string,
    //             value: row.environmentId as number,
    //         });
    //     }
    //     return deepClone(result);
    // });

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Study Users - ${props.tabData[props.activeTab.label].data.name}`
            : "Study Users",
    );

    const studyUserSearch = ref<TNullableString>(null);
    const studyUserColumns: IColumn[] = [
        {
            field: "studyName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "roleName",
            header: "Role",
            icon: false,
            show: true,
        },
        {
            field: "site",
            header: "Sites",
            icon: false,
            show: true,
        },
    ];

    function setTableData(tableData: IStudyUserData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            studyId: row.studyId,
            roleId: row.roleId,
            roleName: row.roleName,
            roleDescription: row.roleDescription,
            userId: row.userId,
            trialId: row.trialId,
            trialName: row.trialName,
            studyName: `${row.trialName}:${row.environmentName}`,
            environmentName: row.environmentName,
            environmentId: row.environmentId,
            userName: row.userName,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function studyUserPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await studyUserPaginationListAPI(
            getAPIFilters({
                search: studyUserSearch.value,
                filter: {
                    userId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            studyUserTableData.value = deepClone(tableData);
            studyUserTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            studyUserTableData.value = [];
            studyUserTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function validateStudySiteAll() {
        if (!formModel.value.roleId) errorModel.value.roleId = "Please select a role";
        else errorModel.value.roleId = "";
        if (!formModel.value.trialId) errorModel.value.trialId = "Please select a trial";
        else errorModel.value.trialId = "";
        if (!formModel.value.environmentId)
            errorModel.value.environmentId = "Please select an environment";
        else errorModel.value.environmentId = "";
    }

    function resetFormModel(closeModel?: TVoidAction) {
        formModel.value = { ...defaultStudyUserModel() };
        formModelRef.value = { ...defaultStudyUserModel() };
        errorModel.value = { ...defaultStudyUserErrorModel() };
        if (closeModel) closeModel();
    }

    function getStudyIdFromTrialAndEnvironment() {
        // let result = 0;
        // for (const row of studyUserTableData.value) {
        //     if (
        //         row.trialId === formModel.value.trialId &&
        //         row.environmentId === formModel.value.environmentId
        //     ) {
        //         result = row.studyId;
        //         break;
        //     }
        // }
        // return result;
        let result = 0;
        for (const row of trialOptions.value.options as unknown as IStudyTrialData[]) {
            if (isEqual(row.id, formModel.value.trialId, "number")) {
                result = row.studyId;
                break;
            }
        }
        return result;
    }

    async function saveAddOrEditStudyUser(closeModal: TVoidAction) {
        validateStudySiteAll();
        if (!checkIfModelHasErrors(errorModel.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: formModel.value.id || 0,
                studyId: formModel.value.studyId || getStudyIdFromTrialAndEnvironment(),
                roleId: formModel.value.roleId as number,
                roleName: "",
                roleDescription: "",
                environmentName: "",
                userId: formModel.value.userId,
                userName: "",
                environmentId: formModel.value.environmentId as number,
                trialId: formModel.value.trialId as number,
                trialName: "",
                updatedBy: 0,
            };
            if (!formModel.value.id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createStudyUserAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateStudyUserAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetFormModel(closeModal);
                await studyUserPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setAPIValidationErrors(validationErrorsData, formModel.value);
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteStudyUser(studyUserId: string) {
        loading.value.form = true;
        const { status, message } = await deleteStudyUserAPI(studyUserId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await studyUserPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

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

    async function listAllStudyTrials() {
        trialOptions.value.loading = true;
        const { status, data, message } = await listAllStudyTrialsAPI();
        if (status === 200) {
            trialOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            trialOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        trialOptions.value.loading = false;
    }

    async function listAllStudyTrialEnvironments(trialId: string) {
        environmentOptions.value.loading = true;
        const { status, data, message } = await listAllStudyTrialEnvironmentsAPI(trialId);
        if (status === 200) {
            environmentOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            environmentOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        environmentOptions.value.loading = false;
    }

    async function addOrEditStudyUserAction(action: TAdminFormAction, rowData?: ITableData) {
        studyUserFormAction.value = action;
        await Promise.all([rolesList(), listAllStudyTrials()]).then(async () => {
            if (action === "Update") {
                const {
                    id,
                    studyId,
                    userId,
                    trialId,
                    trialName,
                    environmentName,
                    environmentId,
                    roleId,
                    roleName,
                    userName,
                } = rowData as ITableData;
                formModel.value.id = id;
                formModel.value.studyId = studyId;
                formModel.value.roleId = roleId;
                formModel.value.roleName = roleName;
                formModel.value.environmentName = environmentName;
                formModel.value.userId = userId;
                formModel.value.environmentId = environmentId;
                formModel.value.trialId = trialId;
                formModel.value.trialName = trialName;
                formModel.value.userName = userName;

                formModelRef.value.id = id;
                formModelRef.value.studyId = studyId;
                formModelRef.value.roleId = roleId;
                formModelRef.value.roleName = roleName;
                formModelRef.value.environmentName = environmentName;
                formModelRef.value.userId = userId;
                formModelRef.value.environmentId = environmentId;
                formModelRef.value.trialId = trialId;
                formModelRef.value.trialName = trialName;
                formModelRef.value.userName = userName;
                await listAllStudyTrialEnvironments(String(trialId));
                selectedTrialId.value = Number(trialId);
            } else {
                formModel.value.userId = Number(props.tabData[props.activeTab.label].data.id);
                formModelRef.value.userId = Number(props.tabData[props.activeTab.label].data.id);
            }
        });
        popupModalStore.show("adminStudyUserModal");
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        studyUserTableData.value,
        studyUserTableDataRef.value,
    );

    useUnsavedAlert(formModel.value, formModelRef.value);

    watch(
        () => studyUserTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = studyUserTableDataRef.value;
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
                studyUserTableData.value = deepClone(studyUserTableDataRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
                popupModalStore.hide("adminStudyUserModal");
            }
        },
    );

    onMounted(() => {
        Promise.all([studyUserPaginationList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="studyUserSearch"
                            element-id="studyUserSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await studyUserPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#studyUserSearch');
                                }
                            "
                        />
                        <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="async () => await addOrEditStudyUserAction('Add')"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Assign Role</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="studyUserColumns"
                            :table-data="studyUserTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="studyUserSearch"
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
                                        :key="`studyName-${data.tempID}`"
                                        v-model="data.studyName"
                                        type="text"
                                        placeholder="No Study Site"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`roleName-${data.tempID}`"
                                        v-model="data.roleName"
                                        type="text"
                                        placeholder="No Role"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :show-tooltip="true"
                                        :tooltip-text="data.roleDescription"
                                        tooltip-placement="left"
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-pressable
                                        container-class="!justify-start mt-[0.5rem]"
                                        slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.studyName),
                                                    module: 'User Entries',
                                                    page: 'Study User Sites',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Assign Sites'"
                                            icon="circle-play"
                                            :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    container-class="mt-[0.5rem]"
                                    loader-type="table"
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => await addOrEditStudyUserAction('Update', data)
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this study?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteStudyUser(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled()"
                                            :loading="tableLoaderDetails[index]"
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
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        v-if="studyUserFormAction !== 'View'"
        modal-id="adminStudyUserModal"
        :on-cancel="(closeModal) => resetFormModel(closeModal)"
        :on-submit="async (closeModal) => await saveAddOrEditStudyUser(closeModal)"
    >
        <div class="grid grid-cols-1 gap-x-[5rem] gap-y-[1rem]">
            <edc-dropdown
                :key="`trialId-${formModel.trialId ? formModel.trialId : ''}`"
                v-model="formModel.trialId"
                container-class="w-[34rem]"
                placeholder="Select a trial"
                label="Trial"
                :options="trialLookups"
                :loading="trialOptions.loading"
                :disabled="
                    loading.isDisabled(trialOptions.loading, studyUserFormAction === 'Update')
                "
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :error="errorModel.trialId"
                :ellipse-count="50"
                @on-select="
                    async () => {
                        formModel.environmentId = null;
                        if (formModel.trialId) {
                            await listAllStudyTrialEnvironments(String(formModel.trialId));
                            selectedTrialId = Number(formModel.trialId);
                        } else {
                            environmentOptions.options = [];
                            selectedTrialId = null;
                        }
                    }
                "
            />
            <edc-dropdown
                :key="`environmentId-${formModel.environmentId ? formModel.environmentId : ''}`"
                v-model="formModel.environmentId"
                container-class="w-[34rem]"
                placeholder="Select an environment"
                label="Environment"
                :options="environmentLookups"
                :loading="environmentOptions.loading"
                :disabled="
                    loading.isDisabled(environmentOptions.loading, studyUserFormAction === 'Update')
                "
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :error="errorModel.environmentId"
                :ellipse-count="50"
            />
            <edc-dropdown
                :key="`roleId-${formModel.roleId ? formModel.roleId : ''}`"
                v-model="formModel.roleId"
                container-class="w-[34rem]"
                placeholder="Select a role"
                label="Role"
                :options="roleLookups"
                :loading="roleOptions.loading"
                :disabled="loading.isDisabled(roleOptions.loading)"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :error="errorModel.roleId"
                :ellipse-count="50"
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
