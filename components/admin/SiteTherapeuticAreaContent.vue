<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import {
        siteTherapeuticAreaPaginationListAPI,
        updateSiteTherapeuticAreasAPI,
    } from "~/services/apis/handlers/admin/site-therapeutic-area";
    import type { ISiteTherapeuticArea } from "~/services/apis/handlers/types/admin/site-therapeutic-area-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TEditFormDetail,
        TNullableString,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: number;
        siteId: number;
        therapeuticAreaId: number;
        isActive: boolean;
        siteName: string;
        trialTherapeuticAreaId: number;
        trialTherapeuticArea: string;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteId: string;
        therapeuticAreaId: string;
        isActive: string;
        siteName: string;
        trialTherapeuticArea: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});

    const therapeuticAreaSearch = ref<TNullableString>(null);
    const siteTherapeuticAreaColumns: IColumn[] = [
        {
            field: "therapeuricArea",
            header: "Therapeutic Area",
            icon: false,
            show: true,
        },
        {
            field: "isActive",
            header: "Assign",
            icon: false,
            show: true,
        },
    ];
    const siteTherapeuticAreaTableData = ref<ITableData[]>([]);
    const siteTherapeuticAreaTableDataRef = ref<ITableData[]>(
        deepClone(siteTherapeuticAreaTableData.value),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Therapeutic Areas - ${props.tabData[props.activeTab.label].data.siteName}`
            : "Therapeutic Areas",
    );

    function setTableData(tableData: ISiteTherapeuticArea[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            isActive: row.isActive,
            siteId: row.siteId,
            siteName: row.siteName,
            trialTherapeuticArea: row.trialTherapeuticArea,
            therapeuticAreaId: row.therapeuticAreaId,
            trialTherapeuticAreaId: row.trialTherapeuticAreaId,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function siteTherapeuticPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await siteTherapeuticAreaPaginationListAPI(
            getAPIFilters({
                search: therapeuticAreaSearch.value,
                filter: {
                    siteId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            siteTherapeuticAreaTableData.value = deepClone(tableData);
            siteTherapeuticAreaTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            siteTherapeuticAreaTableData.value = [];
            siteTherapeuticAreaTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetFormModel() {
        siteTherapeuticAreaTableData.value = deepClone(siteTherapeuticAreaTableDataRef.value);
    }

    function getRequestData(tableData: ITableData[]): ISiteTherapeuticArea[] {
        const result: ISiteTherapeuticArea[] = [];
        for (const row of tableData) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempID, ...rest } = row;
            const obj = { ...rest };
            result.push({
                ...obj,
                updatedBy: 0,
                siteId: props.tabData[props.activeTab.label].data.id,
                therapeuticAreaId: obj.trialTherapeuticAreaId,
                id: obj.id || 0,
            });
        }
        return result;
    }

    async function updateTherapeuticAreaAssign() {
        const { message, status } = await updateSiteTherapeuticAreasAPI(
            getRequestData(siteTherapeuticAreaTableData.value),
        );

        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await siteTherapeuticPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    // async function deleteSite(studyUserSiteId: string) {
    //     loading.value.form = true;
    //     const { status, message } = await deleteStudyUserSitesAPI(studyUserSiteId);
    //     if (status === 200) {
    //         toastStore.success({
    //             title: "Success",
    //             message,
    //         });
    //         await siteTherapeuticPaginationList();
    //     } else if (status !== 401) {
    //         toastStore.error({
    //             title: "Error",
    //             message,
    //         });
    //     }
    //     loading.value.form = false;
    // }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        siteTherapeuticAreaTableData.value,
        siteTherapeuticAreaTableDataRef.value,
    );

    watch(
        () => siteTherapeuticAreaTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = siteTherapeuticAreaTableDataRef.value;
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
                siteTherapeuticAreaTableData.value = deepClone(
                    siteTherapeuticAreaTableDataRef.value,
                );
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await siteTherapeuticPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-1/2 gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="therapeuticAreaSearch"
                            element-id="therapeuticAreaSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteTherapeuticPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus(
                                        '#therapeuticAreaSearch',
                                    );
                                }
                            "
                        />
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => updateTherapeuticAreaAssign()"
                        >
                            <edc-icon
                                icon="save"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Save</span>
                        </edc-pressable>
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => resetFormModel()"
                        >
                            <edc-icon
                                icon="undo"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Reset</span>
                        </edc-pressable>
                    </div>
                    <div>
                        <edc-data-table
                            :columns="siteTherapeuticAreaColumns"
                            :table-data="siteTherapeuticAreaTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="therapeuticAreaSearch"
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
                                        v-model="data.trialTherapeuticArea"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].trialTherapeuticArea
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        v-model="data.isActive"
                                        v-tooltip.top="'Assign'"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.5rem]'
                                                : ''
                                        "
                                        :checked="data.isActive"
                                        name="isActive"
                                        :disabled="loading.isDisabled()"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isActive
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !isModelChanged
                                    "
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: String(data.trialTherapeuticArea),
                                                module: 'Site Therapeutic Areas',
                                                page: 'Site Therapeutic Areas Investigators',
                                                data,
                                            });
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Assign Investigators'"
                                        icon="user"
                                        :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                    />
                                </edc-pressable>
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
                <!-- </div> -->
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
