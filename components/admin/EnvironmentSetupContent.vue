<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        createTrialEnvironmentAPI,
        deleteTrialEnvironmentAPI,
        trialEnvironmentPaginationListAPI,
        updateTrialEnvironmentAPI,
    } from "~/services/apis/handlers/admin/trial-environment";
    import type { ITrialEnvironmentData } from "~/services/apis/handlers/types/admin/trial-environment-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import { TRIAL_ENVIRONMENT_OPTIONS } from "~/constants/options";
    import useGlobalStore from "~/stores/global";

    interface IValidationError extends IBaseValidationError {
        environment: string;
        enrollmentTarget: string;
        startDate: string;
        isActive: string;
    }

    interface ITableData {
        id: TNullableNumber;
        trialId: number;
        environment: TNullableString;
        isActive: boolean;
        enrollmentTarget: TNullableNumber;
        startDate: TNullableString;
        updatedBy: number;
        tempID: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        enrollmentTarget: "",
        environment: "",
        isActive: "",
        startDate: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const editFormDetails = ref<TEditFormDetail>({});
    const loading = ref<Loading>(new Loading());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const environmentSetupSearch = ref<TNullableString>(null);
    const environmentSetupColumns: IColumn[] = [
        {
            field: "environment",
            header: "Environment",
            icon: false,
            show: true,
        },
        {
            field: "isActive",
            header: "Active",
            icon: false,
            show: true,
        },
        {
            field: "enrollmentTarget",
            header: "Enrollment Target",
            icon: false,
            show: true,
        },
        {
            field: "startDate",
            header: "Start Date",
            icon: false,
            show: true,
        },
    ];
    const environmentSetupTableData = ref<ITableData[]>([]);
    const environmentSetupTableDataRef = ref<ITableData[]>(
        deepClone(environmentSetupTableData.value),
    );
    // const validationErrors = ref<IValidationError[]>([]);
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Environments - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Environments",
    );

    function editForm(rowIndex: number | string) {
        if (!checkIfKeyExistsInObject(rowIndex, editFormDetails.value))
            editFormDetails.value[rowIndex] = true;
        else editFormDetails.value[rowIndex] = !editFormDetails.value[rowIndex];
    }

    function addOrEditEnvironmentSetupAction() {
        const tempID = uniqueID();
        environmentSetupTableData.value.unshift({
            enrollmentTarget: null,
            environment: null,
            isActive: true,
            startDate: props.tabData[props.activeTab.label].data.liveDate
                ? props.tabData[props.activeTab.label].data.liveDate
                : null,
            id: null,
            trialId: 0,
            updatedBy: 0,
            tempID,
        });
        editForm(tempID);
        // setTimeout(() => {
        //     scrollToNewlyCreatedRow();
        // }, 10);
    }

    // function resetFormModel(closeModal: TVoidAction) {
    //     environmentSetupFormModel.value.reset(environmentSetupFormModelRef.value);
    //     closeModal();
    // }

    function resetEditFormDetails(tempID?: string) {
        if (tempID) {
            editForm(tempID);
            deleteObjectPropertyByKey(tempID, validationErrors.value);
        } else {
            editFormDetails.value = {};
            validationErrors.value = {};
        }
    }

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of environmentSetupTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.environment) === 0)
                    obj["environment"] = "Please enter a name";
                else if (getStringLength(tableRow.environment) > 50)
                    obj["environment"] = "Name cannot be more than 50 characters";
                else obj["environment"] = "";

                if (tableRow.environment === "PROD" && !tableRow.startDate)
                    obj["startDate"] = "Please choose a date";
                else obj["startDate"] = "";
                // result.push(obj);
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableData: ITrialEnvironmentData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            enrollmentTarget: row.enrollmentTarget,
            environment: row.environment,
            id: row.id,
            isActive: row.isActive,
            startDate: returnNullIfFalsy(row.startDate),
            trialId: row.trialId,
            updatedBy: row.updatedBy,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function trialEnvironmentList() {
        loading.value.table = true;
        const { status, data, message } = await trialEnvironmentPaginationListAPI(
            getAPIFilters({
                search: environmentSetupSearch.value,
                filter: {
                    trialId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            environmentSetupTableData.value = deepClone(tableData);
            environmentSetupTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            environmentSetupTableData.value = [];
            environmentSetupTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrEditEnvironmentApi(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: environmentSetupTableData.value[rowIndex].id || 0,
                trialId: props.tabData[props.activeTab.label].data.id as number,
                environment: environmentSetupTableData.value[rowIndex].environment as string,
                isActive: environmentSetupTableData.value[rowIndex].isActive,
                enrollmentTarget: environmentSetupTableData.value[rowIndex].enrollmentTarget,
                startDate: environmentSetupTableData.value[rowIndex].startDate
                    ? getAsISOString(environmentSetupTableData.value[rowIndex].startDate)
                    : null,
                updatedBy: 0,
            };
            if (!environmentSetupTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createTrialEnvironmentAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateTrialEnvironmentAPI(requestData);
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
                await trialEnvironmentList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        environmentSetupTableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(environmentSetupTableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        environmentSetupTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteTrialEnvironment(trialEnvironmentId: string) {
        loading.value.form = true;
        const { status, message } = await deleteTrialEnvironmentAPI(trialEnvironmentId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await trialEnvironmentList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        environmentSetupTableData.value,
        environmentSetupTableDataRef.value,
    );

    watch(
        () => environmentSetupTableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = environmentSetupTableDataRef.value;
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
                environmentSetupTableData.value = deepClone(environmentSetupTableDataRef.value);
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await trialEnvironmentList();
    });

    // onUnmounted(() => {
    //     alert("unmounted");
    // });

    // onDeactivated(() => {
    //     alert("onDeactivated");
    // });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="environmentSetupSearch"
                                    element-id="environmentSetupSearch"
                                    input-class="admin-input-font"
                                    :disabled="loading.isDisabled(disableAction)"
                                    @on-search="
                                        async () => {
                                            await trialEnvironmentList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#environmentSetupSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Environment"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditEnvironmentSetupAction();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="environmentSetupColumns"
                                :table-data="environmentSetupTableData"
                                :loading="loading.table"
                                pagination-type="none"
                                search-key="environmentSetupSearch"
                                table-style="outlined"
                                :enable-row-click="false"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <!-- <edc-text-input
                                            :key="data.tempID"
                                            v-model="data.environment"
                                            
                                            type="text"
                                            placeholder="Enter environment *"
                                            input-class="admin-input-font"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].environment
                                                    : ''
                                            "
                                        /> -->
                                        <!-- :error="
                                                returnNullIfIndexDoesNotExist(
                                                    getIndexOfTheTableDataByTempID(data.tempID),
                                                    validationErrors,
                                                )
                                                    ? validationErrors[index].environment
                                                    : ''
                                            " -->
                                        <edc-dropdown
                                            :key="`environment-${data.tempID}`"
                                            v-model="data.environment"
                                            :options="TRIAL_ENVIRONMENT_OPTIONS"
                                            default-value="Select an Environment *"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[28.6rem]"
                                            :disabled="loading.isDisabled()"
                                            :enable-clear="true"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].environment
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="middle"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <!-- v-if="
                                                checkIfKeyExistsInObject(index, editFormDetails) &&
                                                editFormDetails[index]
                                            " -->
                                        <edc-checkbox
                                            :key="`isActive-${data.tempID}`"
                                            v-model="data.isActive"
                                            name="isActive"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].isActive
                                                    : ''
                                            "
                                        />
                                        <!-- <edc-icon
                                            v-else-if="data.isActive"
                                            icon="check"
                                            class="fill-[var(--color-secondary)] h-[0.8rem]"
                                        /> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <!-- v-if="
                                                checkIfKeyExistsInObject(index, editFormDetails) &&
                                                editFormDetails[index]
                                            " -->
                                        <edc-text-input
                                            :key="`enrollmentTarget-${data.tempID}`"
                                            v-model="data.enrollmentTarget"
                                            type="number"
                                            placeholder="Enter enrollment target"
                                            input-class="admin-input-font"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].enrollmentTarget
                                                    : ''
                                            "
                                        />
                                        <!-- <span v-else>{{ data.enrollmentTarget }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <!-- v-if="
                                                checkIfKeyExistsInObject(index, editFormDetails) &&
                                                editFormDetails[index]
                                            " -->
                                        <edc-calendar
                                            :key="`startDate-${data.tempID}`"
                                            v-model="data.startDate"
                                            picker-placement="bottom"
                                            :picker-offset="0"
                                            picker-class="w-[29rem]"
                                            label-class="admin-input-font"
                                            :placeholder="
                                                data.environment === 'PROD'
                                                    ? 'Choose a date *'
                                                    : 'Choose a date'
                                            "
                                            input-class="admin-input-font"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].startDate
                                                    : ''
                                            "
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                        />
                                        <!-- <span v-else>{{ data.startDate }}</span> -->
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
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
                                        container-class="mt-[0.5rem]"
                                        loader-type="table"
                                        :on-click="
                                            async () => {
                                                await saveAddOrEditEnvironmentApi(index);
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
                                        v-if="isEditable(data.tempID, editFormDetails)"
                                        container-class="mt-[0.5rem]"
                                        loader-type="table"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    environmentSetupTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: environmentSetupTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    environmentSetupTableData[index] = deepClone(
                                                        environmentSetupTableDataRef[index],
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
                                        :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this environment?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteTrialEnvironment(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                container-class="mt-[0.5rem]"
                                                :disabled="loading.isDisabled()"
                                                loader-type="table"
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
                                            checkIfKeyExistsInObject(
                                                data.tempID,
                                                validationErrors,
                                            ) &&
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
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
