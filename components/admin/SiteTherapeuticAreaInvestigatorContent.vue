<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        siteTherapeuticAreaInvestigatorPaginationListAPI,
        updateSiteTherapeuticAreaInvestigatorsAPI,
    } from "~/services/apis/handlers/admin/site-therapeutic-investigator";
    import type { ISiteTherapeuticAreaInvestigator } from "~/services/apis/handlers/types/admin/site-therapeutic-area-investigator-types";
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
        siteTherapeuticAreaId: number;
        userId: number;
        isActive: boolean;
        sitename: string;
        therapeuticArea: string;
        name: string;
        username: string;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteTherapeuticAreaId: string;
        userId: string;
        isActive: string;
        sitename: string;
        therapeuticArea: string;
        name: string;
        username: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});

    const therapeuticAreaInvestigatorSearch = ref<TNullableString>(null);
    const siteTherapeuticAreaColumns: IColumn[] = [
        {
            field: "investigator",
            header: "Investigator",
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
    const siteTherapeuticAreaInvestigatorTableData = ref<ITableData[]>([]);
    const siteTherapeuticAreaInvestigatorTableDataRef = ref<ITableData[]>(
        deepClone(siteTherapeuticAreaInvestigatorTableData.value),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Therapeutic Area Investigators - ${props.tabData[props.activeTab.label].data.trialTherapeuticArea}`
            : "Therapeutic Area Investigators",
    );

    function setTableData(tableData: ISiteTherapeuticAreaInvestigator[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            isActive: row.isActive,
            name: row.name,
            sitename: row.sitename,
            siteTherapeuticAreaId: row.siteTherapeuticAreaId,
            therapeuticArea: row.therapeuticArea,
            userId: row.userId,
            username: row.username,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function siteTherapeuticAreaInvestigatorPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await siteTherapeuticAreaInvestigatorPaginationListAPI(
            getAPIFilters({
                search: therapeuticAreaInvestigatorSearch.value,
                filter: {
                    siteTherapeuticAreaId: props.tabData[props.activeTab.label].data.id as number,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            siteTherapeuticAreaInvestigatorTableData.value = deepClone(tableData);
            siteTherapeuticAreaInvestigatorTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            siteTherapeuticAreaInvestigatorTableData.value = [];
            siteTherapeuticAreaInvestigatorTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetFormModel() {
        siteTherapeuticAreaInvestigatorTableData.value = deepClone(
            siteTherapeuticAreaInvestigatorTableDataRef.value,
        );
    }

    function getRequestData(tableData: ITableData[]): ISiteTherapeuticAreaInvestigator[] {
        const result: ISiteTherapeuticAreaInvestigator[] = [];
        for (const row of tableData) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempID, ...rest } = row;
            const obj = { ...rest };
            result.push({
                ...obj,
                updatedBy: 0,
                siteTherapeuticAreaId: props.tabData[props.activeTab.label].data.id as number,
                id: obj.id || 0,
            });
        }
        return result;
    }

    async function updateTherapeuticAreaInvestigatorAssign() {
        const { message, status } = await updateSiteTherapeuticAreaInvestigatorsAPI(
            getRequestData(siteTherapeuticAreaInvestigatorTableData.value),
        );

        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await siteTherapeuticAreaInvestigatorPaginationList();
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
    //         await siteTherapeuticAreaInvestigatorPaginationList();
    //     } else if (status !== 401) {
    //         toastStore.error({
    //             title: "Error",
    //             message,
    //         });
    //     }
    //     loading.value.form = false;
    // }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        siteTherapeuticAreaInvestigatorTableData.value,
        siteTherapeuticAreaInvestigatorTableDataRef.value,
    );

    watch(
        () => siteTherapeuticAreaInvestigatorTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = siteTherapeuticAreaInvestigatorTableDataRef.value;
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
                siteTherapeuticAreaInvestigatorTableData.value = deepClone(
                    siteTherapeuticAreaInvestigatorTableDataRef.value,
                );
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await siteTherapeuticAreaInvestigatorPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-1/2 gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="therapeuticAreaInvestigatorSearch"
                            element-id="therapeuticAreaInvestigatorSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled(isModelChanged)"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteTherapeuticAreaInvestigatorPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus(
                                        '#therapeuticAreaInvestigatorSearch',
                                    );
                                }
                            "
                        />
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="async () => await updateTherapeuticAreaInvestigatorAssign()"
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
                            :table-data="siteTherapeuticAreaInvestigatorTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="therapeuticAreaInvestigatorSearch"
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
                                        v-model="data.name"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].name
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
                            <!-- <template #action="{ data }">
                                <edc-delete-confirmation
                                    v-if="!isEditable(data.tempID, editFormDetails) && data.id"
                                    message="Are you sure you want to delete this site?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {
                                            deleteSite(String(data.id));
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            v-tooltip.top="'Delete'"
                                            :container-class="
                                                !isEditable(data.tempID, editFormDetails)
                                                    ? 'mt-[1rem]'
                                                    : ''
                                            "
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
