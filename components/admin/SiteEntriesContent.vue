<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading from "~/services/apis/data/loading";
    import {
        createStudySiteAPI,
        studySitePaginationListAPI,
        updateStudySiteAPI,
    } from "~/services/apis/handlers/admin/study-site";
    import { trialEnvironmentListByTrialIdAPI } from "~/services/apis/handlers/admin/trial-environment";
    import type { IStudySiteData } from "~/services/apis/handlers/types/admin/study-site-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IWinFormProps,
        TAdminFormAction,
        TNullableNumber,
        TNullableString,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface IStudySiteModel {
        id: TNullableNumber;
        studyId: number;
        siteId: number;
        siteName: string;
        trialId: TNullableNumber;
        trialEnvironmentId: TNullableNumber;
        trialName: TNullableString;
        environment: TNullableString;
    }

    interface IStudySiteErrorModel {
        trialId: string;
        trialEnvironmentId: string;
    }

    interface ITableData extends IStudySiteModel {
        studyName: TNullableString;
        tempID: string;
    }

    const defaultStudySiteModel = (): IStudySiteModel => ({
        environment: "",
        id: null,
        studyId: 0,
        siteId: 0,
        siteName: "",
        trialEnvironmentId: null,
        trialId: null,
        trialName: "",
    });

    const defaultStudySiteErrorModel = (): IStudySiteErrorModel => ({
        trialEnvironmentId: "",
        trialId: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    // const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const studySiteFormAction = ref<TAdminFormAction>("View");
    const formModel = ref<IStudySiteModel>({ ...defaultStudySiteModel() });
    const formModelRef = ref<IStudySiteModel>({ ...defaultStudySiteModel() });
    const errorModel = ref<IStudySiteErrorModel>({ ...defaultStudySiteErrorModel() });
    const trialOptions = ref<DropdownOption>(new DropdownOption());
    const environmentOptions = ref<DropdownOption>(new DropdownOption());

    const trialLookups = computed(() =>
        getOptionsList(trialOptions.value.options, "trialName", "id"),
    );
    const environmentLookups = computed(() =>
        getOptionsList(environmentOptions.value.options, "environment", "id"),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Study Sites - ${props.tabData[props.activeTab.label].data.siteName}`
            : "Study Sites",
    );

    const studySiteSearch = ref<TNullableString>(null);
    const studySiteColumns: IColumn[] = [
        {
            field: "studyName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "investigator",
            header: "Investigator",
            icon: false,
            show: true,
        },
        {
            field: "subject",
            header: "Subjects",
            icon: false,
            show: true,
        },
    ];
    const studySiteTableData = ref<ITableData[]>([]);
    const studySiteTableDataRef = ref<ITableData[]>(deepClone(studySiteTableData.value));

    function setTableData(tableData: IStudySiteData[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            studyId: row.studyId,
            environment: row.environment,
            siteId: row.siteId,
            siteName: props.tabData[props.activeTab.label].data.siteName || "",
            trialEnvironmentId: row.trialEnvironmentId,
            trialId: row.trialId,
            trialName: row.trialName,
            studyName: `${row.trialName}:${row.environment}`,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function studySitePaginationList() {
        loading.value.table = true;
        const { status, data, message } = await studySitePaginationListAPI(
            getAPIFilters({
                search: studySiteSearch.value,
                filter: {
                    siteId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            studySiteTableData.value = deepClone(tableData);
            studySiteTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            studySiteTableData.value = [];
            studySiteTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function validateStudySiteAll() {
        if (!formModel.value.trialId) errorModel.value.trialId = "Please select a trial";
        else errorModel.value.trialId = "";
        if (!formModel.value.trialEnvironmentId)
            errorModel.value.trialEnvironmentId = "Please select an environment";
        else errorModel.value.trialEnvironmentId = "";
    }

    function resetFormModel(closeModel?: TVoidAction) {
        formModel.value = { ...defaultStudySiteModel() };
        formModelRef.value = { ...defaultStudySiteModel() };
        errorModel.value = { ...defaultStudySiteErrorModel() };
        if (closeModel) closeModel();
    }

    async function saveAddOrEditStudySite(closeModal: TVoidAction) {
        validateStudySiteAll();
        if (!checkIfModelHasErrors(errorModel.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: formModel.value.id || 0,
                environment: "",
                studyId: formModel.value.studyId,
                siteId: formModel.value.siteId,
                trialEnvironmentId: formModel.value.trialEnvironmentId as number,
                trialId: formModel.value.trialId as number,
                trialName: "",
                updatedBy: 0,
            };
            if (!formModel.value.id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createStudySiteAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateStudySiteAPI(requestData);
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
                await studySitePaginationList();
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

    async function trialEnvironmentList(trialId: string) {
        environmentOptions.value.loading = true;
        const { status, data, message } = await trialEnvironmentListByTrialIdAPI(trialId);
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

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        studySiteTableData.value,
        studySiteTableDataRef.value,
    );

    useUnsavedAlert(formModel.value, formModelRef.value);

    watch(
        () => studySiteTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = studySiteTableDataRef.value;
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
                studySiteTableData.value = deepClone(studySiteTableDataRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        Promise.all([studySitePaginationList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="studySiteSearch"
                            element-id="studySiteSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await studySitePaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#studySiteSearch');
                                }
                            "
                        />
                        <!-- <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditStudySiteAction('Add')"
                        >
                            <edc-icon
                                icon="circle-plus"
                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                            />
                            <span class="text-[1.3rem] secondary-text">Assign Study</span>
                        </edc-pressable> -->
                    </div>
                    <div>
                        <edc-data-table
                            :columns="studySiteColumns"
                            :table-data="studySiteTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="studySiteSearch"
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
                                                    module: 'Site Entries',
                                                    page: 'Study Site Investigators',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            icon="user"
                                            :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-pressable
                                        container-class="!justify-start mt-[0.5rem]"
                                        slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.studyName),
                                                    module: 'Site Entries',
                                                    page: 'Subjects',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            icon="user"
                                            :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </td>
                            </template>
                            <!-- <template #action="{ data }">
                                <edc-pressable
                                    v-tooltip.top="'Update'"
                                    container-class="mt-[0.5rem]"
                                    :disabled="loading.isDisabled()"
                                    :on-click="() => addOrEditStudySiteAction('Update', data)"
                                >
                                    <edc-icon
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    message="Are you sure you want to delete this site?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {
                                            deleteStudySite(String(data.id));
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            v-tooltip.top="'Delete'"
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled()"
                                            :on-click="() => {}"
                                        >
                                            <edc-icon
                                                icon="close-icon"
                                                :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template> -->
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        v-if="studySiteFormAction !== 'View'"
        modal-id="adminFindVariableModal"
        :on-cancel="(closeModal) => resetFormModel(closeModal)"
        :on-submit="async (closeModal) => await saveAddOrEditStudySite(closeModal)"
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
                :disabled="loading.isDisabled(trialOptions.loading)"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :error="errorModel.trialId"
                :ellipse-count="50"
                @on-select="
                    async () => {
                        if (formModel.trialId) {
                            await trialEnvironmentList(String(formModel.trialId));
                        } else {
                            environmentOptions.options = [];
                        }
                    }
                "
            />
            <edc-dropdown
                :key="`trialEnvironmentId-${formModel.trialEnvironmentId ? formModel.trialEnvironmentId : ''}`"
                v-model="formModel.trialEnvironmentId"
                container-class="w-[34rem]"
                placeholder="Select an environment"
                label="Environment"
                :options="environmentLookups"
                :loading="environmentOptions.loading"
                :disabled="loading.isDisabled(environmentOptions.loading)"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :required="true"
                :error="errorModel.trialEnvironmentId"
                :ellipse-count="50"
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
