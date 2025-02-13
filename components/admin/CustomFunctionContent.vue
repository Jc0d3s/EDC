<script setup lang="ts">
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        customFunctionCreateAPI,
        customFunctionDeleteByIdAPI,
        customFunctionPaginationListAPI,
        customFunctionUpdateAPI,
    } from "~/services/apis/handlers/admin/custom-function";
    import type { ICustomFunctionData } from "~/services/apis/handlers/types/custom-function-types";
    import useToastStore from "~/stores/toast";
    import type {
        IBaseValidationError,
        IWinFormProps,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import { CUSTOM_FUNCTION_LANGUAGE_OPTIONS } from "~/constants/options";
    import type { IColumn } from "~/types/datatable";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import useGlobalStore from "~/stores/global";

    interface ITableData {
        id: TNullableNumber;
        name: TNullableString;
        language: TNullableString;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        name: string;
        language: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        name: "",
        language: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const editFormDetails = ref<Record<string, boolean>>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const loading = ref<Loading>(new Loading());
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const customFunctionSearch = ref<TNullableString>(null);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "language",
            header: "Language",
            icon: false,
            show: true,
        },
    ];
    const tableData = ref<ITableData[]>([]);
    const tableDataRef = ref<ITableData[]>(deepClone(tableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Custom Functions - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Custom Functions",
    );

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    function validateAll(rowIndex: number) {
        const result: TValidationErrorData<IValidationError> = { ...validationErrors.value };
        for (const [index, tableRow] of tableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 256)
                    obj["name"] = "Name cannot be more than 256 characters";
                else obj["name"] = "";
                if (getStringLength(tableRow.language) === 0)
                    obj["language"] = "Please select a language";
                else obj["language"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableDataItems: ICustomFunctionData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableDataItems);
        return tableDataItems.map((row) => ({
            id: row.id,
            name: row.name,
            language: row.language,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function customFunctionPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await customFunctionPaginationListAPI(
            getAPIFilters({
                search: customFunctionSearch.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableDataItems = setTableData(items);
            tableData.value = deepClone(tableDataItems);
            tableDataRef.value = deepClone(tableDataItems);
        } else {
            tableData.value = [];
            tableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    function addOrEditFormAction() {
        // const editFormDetailsRef = deepClone(editFormDetails.value) as boolean[];
        const tempID = uniqueID();
        tableData.value.unshift({
            id: null,
            name: null,
            language: "CSharp",
            tempID,
        });
        editForm(tempID);
    }

    async function addOrEditCustomFunction(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: tableData.value[rowIndex].id || 0,
                name: tableData.value[rowIndex].name as string,
                language: tableData.value[rowIndex].language as string,
                updatedBy: 0,
            };
            if (!tableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await customFunctionCreateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await customFunctionUpdateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                await customFunctionPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        tableData.value[rowIndex].tempID,
                        validationErrors.value,
                        defaultValidationErrors(tableData.value[rowIndex].tempID),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        validationErrors.value,
                        tableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteCustomFunctionById(customFunctionId: string) {
        loading.value.form = true;
        const { status, message } = await customFunctionDeleteByIdAPI(customFunctionId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await customFunctionPaginationList();
        } else {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        tableData.value,
        tableDataRef.value,
    );

    watch(
        () => tableData.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = tableDataRef.value;
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
                tableData.value = deepClone(tableDataRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await customFunctionPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit flex flex-row items-center gap-[1rem]">
                                <edc-search-bar
                                    v-model="customFunctionSearch"
                                    element-id="customFunctionSearch"
                                    input-class="admin-input-font"
                                    :disabled="loading.isDisabled(disableAction)"
                                    @on-search="
                                        async () => {
                                            await customFunctionPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#customFunctionSearch',
                                            );
                                        }
                                    "
                                />
                                <edc-checkbox
                                    label="Show All"
                                    label-class="mb-0 admin-input-font"
                                    name="showAll"
                                    :disabled="loading.isDisabled(disableAction)"
                                />
                            </div>
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Custom Function"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditFormAction();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns"
                                :table-data="tableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                search-key="customFunctionSearch"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-text-input
                                            :key="`name-${data.tempID}`"
                                            v-model="data.name"
                                            type="text"
                                            placeholder="Enter name"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].name
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-dropdown
                                            :key="`language-${data.tempID}`"
                                            v-model="data.language"
                                            container-class="w-[10rem]"
                                            :options="CUSTOM_FUNCTION_LANGUAGE_OPTIONS"
                                            default-value="Language"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[10rem]"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID].language
                                                    : ''
                                            "
                                        />
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
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
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                addOrEditCustomFunction(index);
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
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    tableData.splice(
                                                        getIndexOfTheItem({
                                                            data: tableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    tableData[index] = deepClone(
                                                        tableDataRef[index],
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
                                        message="Are you sure you want to delete this custom function?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await deleteCustomFunctionById(String(data.id));
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
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
