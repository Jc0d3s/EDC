<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        derivationCreateAPI,
        derivationDeleteByIdAPI,
        derivationPaginationListAPI,
        derivationUpdateAPI,
    } from "~/services/apis/handlers/admin/derivation";
    import type {
        IDerivationData,
        IDerivationDataAppliedVariable,
    } from "~/services/apis/handlers/types/derivation-types";
    import useAdminWinFormStore from "~/stores/admin-winform";
    import useGlobalStore from "~/stores/global";
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

    interface ITableData {
        id: TNullableNumber;
        branchId: number;
        name: TNullableString;
        bypassDuringMigration: boolean;
        appliedVariable: IDerivationDataAppliedVariable[];
        isActive: boolean;
        tempID: string;
    }

    interface IValidationError extends IBaseValidationError {
        name: string;
        bypassDuringMigration: string;
        isActive: string;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        name: "",
        bypassDuringMigration: "",
        isActive: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITableData>];
    }>();

    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const adminWinFormStore = useAdminWinFormStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const derivationSearch = ref<TNullableString>(null);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "bypassDuringMigration",
            header: "Bypass During Migration",
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
            field: "appliedVariable",
            header: "Applied Variables",
            icon: false,
            show: true,
        },
    ];
    const tableData = ref<ITableData[]>([]);
    const tableDataRef = ref<ITableData[]>(deepClone(tableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Derivations - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Derivations",
    );

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

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
        for (const [index, tableRow] of tableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.name) === 0) obj["name"] = "Please enter a name";
                else if (getStringLength(tableRow.name) > 256)
                    obj["name"] = "Name cannot be more than 256 characters";
                else obj["name"] = "";
                // result.push(obj);
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    function addOrEditFormAction() {
        const tempID = uniqueID();
        tableData.value.unshift({
            id: null,
            name: null,
            branchId: Number(props.tabData[props.activeTab.label].data.id),
            bypassDuringMigration: false,
            appliedVariable: [],
            isActive: true,
            tempID,
        });
        editForm(tempID);
    }

    function getAppliedVariables(appliedVariable: IDerivationDataAppliedVariable[]) {
        let result = "";
        if (getArrayLength(appliedVariable) > 0) {
            if (appliedVariable[0].folderName) result = appliedVariable[0].folderName;
            if (appliedVariable[0].formName && getStringLength(result) > 0)
                result += ` > ${appliedVariable[0].formName}`;
            else if (appliedVariable[0].formName && getStringLength(result) === 0)
                result += appliedVariable[0].formName;
            // const fieldNames =
            //     getArrayLength(appliedVariable) === 1
            //         ? appliedVariable[0].fieldName
            //         : appliedVariable.map((row) => row.fieldName).join(",");
            // if (fieldNames && getStringLength(result) > 0) result += ` > ${fieldNames}`;
            // else if (fieldNames && getStringLength(result) === 0) result += fieldNames;
            if (appliedVariable[0].fieldName && getStringLength(result) > 0)
                result += ` > ${appliedVariable[0].fieldName}`;
            else if (appliedVariable[0].fieldName && getStringLength(result) === 0)
                result += appliedVariable[0].fieldName;
        }
        return result;
    }

    async function derivationDeleteById(editCheckId: string) {
        loading.value.form = true;
        const { status, message } = await derivationDeleteByIdAPI(editCheckId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
            await derivationPaginationList();
        } else {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function setTableData(data: IDerivationData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(data);
        return data.map((row) => ({
            bypassDuringMigration: row.byPassDuringMigration,
            id: row.id,
            branchId: row.branchId,
            isActive: row.isActive,
            name: row.name,
            appliedVariable: row.appliedVariable,
            tempID: uniqueID(),
        }));
    }

    async function derivationPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await derivationPaginationListAPI(
            getAPIFilters({
                search: derivationSearch.value,
                filter: {
                    branchId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const result = setTableData(items);
            tableData.value = deepClone(result);
            tableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            tableData.value = [];
            tableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    async function saveAddOrDerivation(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            loading.value.form = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: tableData.value[rowIndex].id || 0,
                name: tableData.value[rowIndex].name as string,
                byPassDuringMigration: tableData.value[rowIndex].bypassDuringMigration,
                branchId: props.tabData[props.activeTab.label].data.id,
                isActive: tableData.value[rowIndex].isActive,
                appliedVariable: [],
                isGlobal: false,
                updatedBy: 0,
            };
            if (!tableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await derivationCreateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await derivationUpdateAPI(requestData);
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
                await derivationPaginationList();
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
                resetEditFormDetails();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await derivationPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <div class="w-fit">
                                <edc-search-bar
                                    v-model="derivationSearch"
                                    element-id="derivationSearch"
                                    input-class="admin-input-font"
                                    :disabled="loading.isDisabled(disableAction)"
                                    @on-search="
                                        async () => {
                                            await derivationPaginationList();
                                            useGlobalStore().triggerSearchBarRefocus(
                                                '#derivationSearch',
                                            );
                                        }
                                    "
                                />
                            </div>
                            <!-- <edc-dropdown
                                container-class="w-[10rem]"
                                :options="[]"
                                input-class="admin-input-font"
                                option-placement="bottom"
                                option-class="min-w-[8rem] max-w-[20rem]"
                                :reset-option="true"
                                default-value="Forms"
                                :disabled="loading.isDisabled(disableAction)"
                                @on-select="() => {}"
                            /> -->
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Check"
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
                                search-key="derivationSearch"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                :disabled="loading.isDisabled()"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
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
                                        <edc-checkbox
                                            :key="`bypassDuringMigration-${data.tempID}`"
                                            v-model="data.bypassDuringMigration"
                                            name="bypassDuringMigration"
                                            :disabled="loading.isDisabled()"
                                            :read-only="!isEditable(data.tempID, editFormDetails)"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    validationErrors,
                                                )
                                                    ? validationErrors[data.tempID]
                                                          .bypassDuringMigration
                                                    : ''
                                            "
                                        />
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`isActive-${data.tempID}`"
                                            v-model="data.isActive"
                                            name="isActive"
                                            :disabled="loading.isDisabled()"
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
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        {{ getAppliedVariables(data.appliedVariable) }}
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
                                        container-class="mt-[0.5rem]"
                                        :on-click="() => editForm(data.tempID)"
                                        :disabled="loading.isDisabled()"
                                        loader-type="table"
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
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await saveAddOrDerivation(index);
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
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editFormDetails) &&
                                            !disableAction
                                        "
                                        loader-type="table"
                                        container-class="mt-[0.5rem]"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                emit('on-row-select', {
                                                    label: String(data.name),
                                                    module: 'Derivations',
                                                    page: 'Derivation Entries',
                                                    data,
                                                });
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Entries'"
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
                                        message="Are you sure you want to delete this edit check?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                tableLoaderDetails[index] = true;
                                                await derivationDeleteById(String(data.id));
                                                tableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table"
                                                container-class="mt-[0.5rem]"
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
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
