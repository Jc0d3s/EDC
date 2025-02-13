<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        studyUserSitePaginationListAPI,
        updateStudyUserSitesAPI,
    } from "~/services/apis/handlers/admin/study-user-site";
    import type { IStudyUserSiteData } from "~/services/apis/handlers/types/admin/study-user-site-types";
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
        hospitalId: number;
        siteName: string;
        siteNumber: string;
        studyUserId: number;
        isActive: boolean;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteId: string;
        hospitalId: string;
        siteName: string;
        siteNumber: string;
        studyUserId: string;
        isActive: string;
        country: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});

    const siteSearch = ref<TNullableString>(null);
    const siteColumns: IColumn[] = [
        {
            field: "siteName",
            header: "Site Name",
            icon: false,
            show: true,
        },
        {
            field: "siteNumber",
            header: "Site Number",
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
    const siteTableData = ref<ITableData[]>([]);
    const siteTableDataRef = ref<ITableData[]>(deepClone(siteTableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Study Sites - ${props.tabData[props.activeTab.label].data.studyName}`
            : "Study Sites",
    );

    function setTableData(tableData: IStudyUserSiteData[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            hospitalId: row.hospitalId,
            isActive: row.isActive,
            siteId: row.siteId,
            siteName: row.siteName,
            siteNumber: row.siteNumber,
            studyUserId: Number(props.tabData[props.activeTab.label].data.id), // row.studyUserId,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function sitesPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await studyUserSitePaginationListAPI(
            getAPIFilters({
                search: siteSearch.value,
                filter: {
                    studyUserId: Number(props.tabData[props.activeTab.label].data.id),
                },
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

    function resetFormModel() {
        siteTableData.value = deepClone(siteTableDataRef.value);
    }

    function getRequestData(tableData: ITableData[]): IStudyUserSiteData[] {
        const result: IStudyUserSiteData[] = [];
        for (const row of tableData) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempID, hospitalId, ...rest } = row;
            const obj = { ...rest };
            result.push({
                ...obj,
                updatedBy: 0,
                hospitalId,
                siteId: hospitalId,
                id: obj.id || 0,
            });
        }
        return result;
    }

    async function updateSiteAssign() {
        const { message, status } = await updateStudyUserSitesAPI(
            getRequestData(siteTableData.value),
        );

        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await sitesPaginationList();
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
    //         await sitesPaginationList();
    //     } else if (status !== 401) {
    //         toastStore.error({
    //             title: "Error",
    //             message,
    //         });
    //     }
    //     loading.value.form = false;
    // }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        siteTableData.value,
        siteTableDataRef.value,
    );

    watch(
        () => siteTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = siteTableDataRef.value;
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
                siteTableData.value = deepClone(siteTableDataRef.value);
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await sitesPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
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
                                    await sitesPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#siteSearch');
                                }
                            "
                        />
                        <edc-pressable
                            v-if="isModelChanged"
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => updateSiteAssign()"
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
                            :columns="siteColumns"
                            :table-data="siteTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="siteSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            action-row-class="min-w-[12rem] max-w-[12rem]"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[50rem]"
                                >
                                    <edc-text-input
                                        v-model="data.siteName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteName
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[30rem]"
                                >
                                    <edc-text-input
                                        v-model="data.siteNumber"
                                        type="text"
                                        placeholder="Enter number *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteNumber
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
