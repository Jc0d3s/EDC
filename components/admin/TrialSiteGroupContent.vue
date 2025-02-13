<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import {
        createSiteGroupAPI,
        deleteSiteGroupAPI,
        updateSiteGroupAPI,
    } from "~/services/apis/handlers/admin/site-group";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        trialId: TNullableNumber;
        siteGroupName: TNullableString;
        siteDescription: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        siteDescription: string;
        siteGroupName: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const trialSiteGroupSearch = ref<TNullableString>(null);
    const trialSiteGroupColumns: IColumn[] = [
        {
            field: "siteGroupName",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "siteDescription",
            header: "Description",
            icon: false,
            show: true,
        },
    ];
    const trialSiteGroupTableData = ref<ITableData[]>([]);
    const trialSiteGroupTableDataRef = ref<ITableData[]>(deepClone(trialSiteGroupTableData.value));
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const loading = ref<Loading>(new Loading());

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Trial Site Groups - ${props.tabData[props.activeTab.label].trialName}`
            : "Trial Site Groups",
    );

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        siteDescription: "",
        siteGroupName: "",
    });

    function editForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editFormDetails.value))
            editFormDetails.value[rowIndex] = true;
        else editFormDetails.value[rowIndex] = !editFormDetails.value[rowIndex];
    }

    function addOrEditTrialSiteGroupAction() {
        const tempID = uniqueID();
        trialSiteGroupTableData.value.unshift({
            id: null,
            siteDescription: null,
            siteGroupName: null,
            trialId: 1,
            tempID,
        });
        editForm(tempID);
        // setTimeout(() => {
        //     scrollToNewlyCreatedRow();
        // }, 10);
    }

    // function validateAll() {
    //     const result = [];
    //     for (const [index, tableRow] of trialSiteGroupTableData.value.entries()) {
    //         const obj: IValidationError = {
    //             index,
    //             siteDescription: "",
    //             siteGroupName: "",
    //         };
    //         if (!tableRow.siteGroupName || tableRow.siteGroupName.length === 0)
    //             obj["siteGroupName"] = "Please enter a name";
    //         else obj["siteGroupName"] = "";

    //         result.push(obj);
    //     }
    //     validationErrors.value = deepClone(result);
    // }

    // function setTableData(tableData: ITrialSiteGroupData[]): ITableData[] {
    //     return tableData.map((row) => ({
    //         id: row.id,
    //         siteDescription: row.siteDescription,
    //         siteGroupName: row.siteGroupName,
    //         trialId: row.trialId,
    //         tempID: uniqueID(),
    //     })) as ITableData[];
    // }
    function siteGroupList() {
        loading.value.table = true;
        // const { status, data, message } = await siteGroupListByTrialIdAPI(
        //     String(props.tabData[props.activeTab.label].id),
        //     {
        //         searchPhrase: trialSiteGroupSearch.value,
        //     },
        // );
        // if (status === 200) {
        //     const tableData = setTableData(data);
        //     trialSiteGroupTableData.value = deepClone(tableData);
        //     trialSiteGroupTableDataRef.value = deepClone(tableData);
        // } else if (status !== 401) {
        //     trialSiteGroupTableData.value = [];
        //     trialSiteGroupTableDataRef.value = [];
        //     toastStore.error({
        //         title: "Error",
        //         message,
        //     });
        // }
        loading.value.table = false;
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of trialSiteGroupTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };

                if (getStringLength(tableRow.siteGroupName) === 0)
                    obj["siteGroupName"] = "Please enter a name";
                else obj["siteGroupName"] = "";
                // result.push(obj);
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditTrialSiteGroup(rowIndex: number) {
        loading.value.form = true;
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: trialSiteGroupTableData.value[rowIndex].id || 0,
                siteDescription: trialSiteGroupTableData.value[rowIndex].siteDescription,
                siteGroupName: trialSiteGroupTableData.value[rowIndex].siteGroupName,
                trialId: props.tabData[props.activeTab.label].id as number,
                assignedSites: "",
                siteId: 0,
                updatedBy: 0,
            };
            if (!trialSiteGroupTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createSiteGroupAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateSiteGroupAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                await siteGroupList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        trialSiteGroupTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(trialSiteGroupTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        trialSiteGroupTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteTrialSiteGroup(trialSiteGroupId: string) {
        loading.value.form = true;
        const { status, message } = await deleteSiteGroupAPI(trialSiteGroupId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await siteGroupList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        trialSiteGroupTableData.value,
        trialSiteGroupTableDataRef.value,
    );

    watch(
        () => trialSiteGroupTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = trialSiteGroupTableDataRef.value;
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
                trialSiteGroupTableData.value = deepClone(trialSiteGroupTableDataRef.value);
                editFormDetails.value = {};
                validationErrors.value = {};
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await siteGroupList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="trialSiteGroupSearch"
                            element-id="trialSiteGroupSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await siteGroupList();
                                    useGlobalStore().triggerSearchBarRefocus(
                                        '#trialSiteGroupSearch',
                                    );
                                }
                            "
                        />
                        <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditTrialSiteGroupAction()"
                            :disabled="loading.isDisabled()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Site Group</span>
                        </edc-pressable>
                        <!-- <edc-pressable
                            v-if="
                                checkIfModelChanged(
                                    trialSiteGroupTableData,
                                    trialSiteGroupTableDataRef,
                                )
                            "
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => addOrEditTrialSiteGroup()"
                        >
                            <edc-icon
                                icon="save"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Save</span>
                        </edc-pressable>
                        <edc-pressable
                            v-if="
                                checkIfModelChanged(
                                    trialSiteGroupTableData,
                                    trialSiteGroupTableDataRef,
                                )
                            "
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :on-click="() => resetFormModel()"
                        >
                            <edc-icon
                                icon="undo"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Reset</span>
                        </edc-pressable> -->
                    </div>
                    <div>
                        <edc-data-table
                            :columns="trialSiteGroupColumns"
                            :table-data="trialSiteGroupTableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="trialSiteGroupSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="true"
                            :disabled="loading.isDisabled()"
                        >
                            <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[25rem]"
                                >
                                    <edc-text-input
                                        v-model="data.siteGroupName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteGroupName
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-text-area
                                        v-model="data.siteDescription"
                                        placeholder="Enter description"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].siteDescription
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="!isEditable(data.tempID, editFormDetails)"
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
                                        class="h-[1.5rem]"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            saveAddOrEditTrialSiteGroup(index);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Save'"
                                        icon="save"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable>
                                <!-- <edc-pressable
                                    v-if="isEditable(index, editFormDetails)"
                                    v-tooltip.top="'Cancel'"
                                    :container-class="
                                        !isEditable(index, editFormDetails) ? 'mt-[0.5rem]' : ''
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
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            if (!data.id)
                                                trialSiteGroupTableData.splice(
                                                    getIndexOfTheItem({
                                                        data: trialSiteGroupTableData,
                                                        type: 'object',
                                                        value: data.tempID,
                                                        key: 'tempID',
                                                    }),
                                                    1,
                                                );
                                            else
                                                trialSiteGroupTableData[index] = deepClone(
                                                    trialSiteGroupTableDataRef[index],
                                                );
                                            editForm(data.tempID);
                                            deleteObjectPropertyByKey(
                                                data.tempID,
                                                validationErrors,
                                            );
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Reset'"
                                        icon="undo"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="!isEditable(data.tempID, editFormDetails)"
                                    message="Are you sure you want to delete this site group?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {
                                            deleteTrialSiteGroup(String(data.id));
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
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                class="stroke-[var(--color-error)] !w-[1.1rem] !h-[1.1rem]"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                                <edc-pressable
                                    v-if="!isEditable(data.tempID, editFormDetails)"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        () => {
                                            emit('on-row-select', {
                                                label: 'Trial Sites',
                                                module: 'Trial Site Group',
                                                page: 'Trial Sites',
                                                data,
                                            });
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Entries'"
                                        icon="circle-play"
                                        class="h-[1.5rem] fill-[var(--color-secondary)]"
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
    <!-- <edc-popup-modal
        :submit-label="formAction"
        @on-cancel="(closeModal) => resetFormModel(closeModal)"
        @on-submit="(closeModal) => addOrEditTrialSiteApi(closeModal)"
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>) are
            required</span
        >
        <div class="grid grid-cols-2 gap-x-[5rem] gap-y-[1rem]">
            <edc-text-input
                v-model="trialSiteFormModel.siteName"
                
                type="text"
                placeholder="Enter name"
                label="Name"
                label-class="font-bold"
                :error="trialSiteErrorModel.siteName"
            />
            <edc-text-input
                v-model="trialSiteFormModel.siteNumber"
                
                type="text"
                placeholder="Enter number"
                label="Site Number"
                label-class="font-bold"
                :error="trialSiteErrorModel.siteNumber"
            />
            <edc-text-area
                v-model="trialSiteFormModel.address"
                
                placeholder="Enter address"
                label="Address"
                label-class="font-bold"
                :error="trialSiteErrorModel.address"
            />
            <edc-text-area
                v-model="trialSiteFormModel.notes"
                
                placeholder="Enter notes"
                label="Notes"
                label-class="font-bold"
                :error="trialSiteErrorModel.notes"
            />
        </div>
    </edc-popup-modal> -->
</template>

<style scoped></style>
