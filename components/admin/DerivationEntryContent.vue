<script setup lang="ts">
    import type {
        IBaseValidationError,
        IOptions,
        ITrialVisitFormDetail,
        IWinFormProps,
        TNullableNumber,
        TNullableString,
        TTableLoaderDetail,
        TValidationErrorData,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import { DERIVATION_TYPE_OPTIONS } from "~/constants/options";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import useToastStore from "~/stores/toast";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import { formFieldListByFormIdAPI } from "~/services/apis/handlers/admin/form-field";
    import type { IFormFieldData } from "~/services/apis/handlers/types/admin/form-field-types";
    import useAdminWinFormStore from "~/stores/admin-winform";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import { formDetailsByBranchIdAPI } from "~/services/apis/handlers/admin/edit-check";
    import {
        createDerivationActionAPI,
        createDerivationStepAPI,
        deleteDerivationActionAPI,
        deleteDerivationStepAPI,
        derivationActionPaginationListAPI,
        derivationStepPaginationListAPI,
        masterDerivationFunctionsAPI,
        updateDerivationActionAPI,
        updateDerivationStepAPI,
    } from "~/services/apis/handlers/admin/derivation";
    import type {
        IDerivationActionData,
        IDerivationStepData,
        IMasterDerivationFunctionData,
    } from "~/services/apis/handlers/types/derivation-types";

    interface IDerivationStepTableData {
        id: TNullableNumber;
        derivationId: number;
        stepOrder: number;
        type: TNullableNumber;
        folderId: TNullableNumber;
        folderName: TNullableString;
        formId: TNullableNumber;
        formName: TNullableString;
        fieldId: TNullableNumber;
        fieldName: TNullableString;
        variableId: TNullableNumber;
        variableName: TNullableString;
        recordPosition: number;
        formRepeatNumber: number;
        folderRepeatNumber: number;
        logicalRecordPosition: string;
        dataValue: TNullableString;
        isApplyToAllFields: boolean;
        isApplyToAllFolders: boolean;
        derivationFunctionId: TNullableNumber;
        derivationFunctionName: TNullableString;
        value: TNullableString;
        format: TNullableString;
        tempID: string;
    }

    interface IDerivationActionTableData {
        id: TNullableNumber;
        derivationId: number;
        folderId: TNullableNumber;
        folderName: TNullableString;
        formId: TNullableNumber;
        formName: TNullableString;
        fieldId: TNullableNumber;
        fieldName: TNullableString;
        variableId: TNullableNumber;
        variableName: TNullableString;
        recordPosition: number;
        formRepeatNumber: number;
        folderRepeatNumber: number;
        isApplyToAllFields: boolean;
        isApplyToAllFolders: boolean;
        isEnableField: boolean;
        // actionMessage: TNullableString;
        updatedBy: number;
        tempID: string;
    }

    interface IDerivationStepValidationError extends IBaseValidationError {
        type: string;
        folderId: string;
        formId: string;
        fieldId: string;
        variableId: string;
        recordPosition: string;
        formRepeatNumber: string;
        folderRepeatNumber: string;
        dataValue: string;
        derivationFunctionId: string;
        value: string;
        format: string;
    }

    interface IDerivationActionValidationError extends IBaseValidationError {
        folderId: string;
        formId: string;
        fieldId: string;
        variableId: string;
        recordPosition: string;
        formRepeatNumber: string;
        folderRepeatNumber: string;
        isEnableField: string;
        // actionMessage: string;
    }

    const defaultDerivationStepValidationErrors = (
        tempID: string,
    ): IDerivationStepValidationError => ({
        index: tempID,
        type: "",
        folderId: "",
        formId: "",
        fieldId: "",
        variableId: "",
        recordPosition: "",
        formRepeatNumber: "",
        folderRepeatNumber: "",
        dataValue: "",
        derivationFunctionId: "",
        value: "",
        format: "",
    });

    const defaultDerivationActionValidationErrors = (
        tempID: string,
    ): IDerivationActionValidationError => ({
        index: tempID,
        folderId: "",
        formId: "",
        fieldId: "",
        variableId: "",
        recordPosition: "",
        formRepeatNumber: "",
        folderRepeatNumber: "",
        isEnableField: "",
        // actionMessage: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const adminWinFormStore = useAdminWinFormStore();
    const unsavedAlertStore = useUnsavedAlertStore();

    const derivationStepDetails = ref<Record<string, boolean>>({});

    const derivationStepFormColumns: IColumn[] = [
        {
            field: "type",
            header: "Type",
            icon: false,
            show: true,
        },
        {
            field: "step",
            header: "Step",
            icon: false,
            show: true,
        },
    ];

    const derivationStepTableData = ref<IDerivationStepTableData[]>([]);
    const derivationStepTableDataRef = ref<IDerivationStepTableData[]>(
        deepClone(derivationStepTableData.value),
    );
    const derivationStepTableLoaders = ref<TTableLoaderDetail>({});
    const derivationStepValidationErrors = ref<
        TValidationErrorData<IDerivationStepValidationError>
    >({});
    const loading = ref<Loading>(new Loading());

    const derivationActionValidationErrors = ref<
        TValidationErrorData<IDerivationActionValidationError>
    >({});
    const derivationActionDetails = ref<Record<string, boolean>>({});
    const derivationActionFormColumns: IColumn[] = [
        {
            field: "dataPoint",
            header: "Data Point",
            icon: false,
            show: true,
        },
        {
            field: "isEnableField",
            header: "Enable Field",
            icon: false,
            show: true,
        },
        // {
        //     field: "action",
        //     header: "Action",
        //     icon: false,
        //     show: true,
        // },
    ];

    const derivationActionTableData = ref<IDerivationActionTableData[]>([]);
    const derivationActionTableDataRef = ref<IDerivationActionTableData[]>(
        deepClone(derivationActionTableData.value),
    );
    const derivationActionTableLoaders = ref<TTableLoaderDetail>({});

    const formDetails = ref<ITrialVisitFormDetail>({
        trialVisits: [],
        forms: [],
    });
    const fieldOptions = ref<DropdownOption>(new DropdownOption());
    const formLookups = ref<IOptions[]>([]);
    const masterFunctionOptions = ref<DropdownOption>(new DropdownOption());

    const disableAction = computed(() => checkIfEditFormActive(derivationStepDetails.value));

    const folderLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of formDetails.value.trialVisits) {
            result.push({
                label: row.name,
                value: row.id,
            });
        }
        return result;
    });

    const fieldLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of fieldOptions.value.options as unknown as IFormFieldData[]) {
            result.push({
                label: row.name,
                value: row.id,
            });
        }
        return result;
    });

    const variableLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of fieldOptions.value.options as unknown as IFormFieldData[]) {
            if (row.fieldVariableId)
                result.push({
                    label: row.varOID as string,
                    value: row.fieldVariableId,
                });
        }
        return result;
    });

    const masterFunctionLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of masterFunctionOptions.value
            .options as unknown as IMasterDerivationFunctionData[]) {
            result.push({
                label: row.name,
                value: row.id,
            });
        }
        return result;
    });

    function setVariableDetails(fieldId: TNullableNumber) {
        let result = null;
        for (const row of fieldOptions.value.options as unknown as IFormFieldData[]) {
            if (row.id === fieldId) {
                result = row.fieldVariableId;
                break;
            }
        }
        return result;
    }

    function setFormLookups(folderId: TNullableNumber) {
        const result: IOptions[] = [];
        const uniqueForms: number[] = [];
        if (folderId) {
            for (const row of formDetails.value.trialVisits) {
                if (folderId !== row.id) continue;
                for (const subRow of row.forms) {
                    if (!uniqueForms.includes(subRow.id)) {
                        result.push({
                            label: subRow.formName,
                            value: subRow.id,
                        });
                        uniqueForms.push(subRow.id);
                    }
                }
            }
        } else {
            for (const row of formDetails.value.trialVisits) {
                for (const subRow of row.forms) {
                    if (!uniqueForms.includes(subRow.id)) {
                        result.push({
                            label: subRow.formName,
                            value: subRow.id,
                        });
                        uniqueForms.push(subRow.id);
                    }
                }
            }
            for (const row of formDetails.value.forms) {
                if (!uniqueForms.includes(row.id)) {
                    result.push({
                        label: row.formName,
                        value: row.id,
                    });
                    uniqueForms.push(row.id);
                }
            }
        }
        formLookups.value = deepClone(result);
    }

    async function formDetailsByBranchId() {
        loading.value.dynamicLoading["formDetailsDetails"] = true;
        const { status, data, message } = await formDetailsByBranchIdAPI(
            Number(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            formDetails.value = deepClone(data);
            setFormLookups(null);
        } else if (status !== 401) {
            formDetails.value.forms = [];
            formDetails.value.trialVisits = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["formDetailsDetails"] = false;
    }

    async function fieldsList(formId: string) {
        fieldOptions.value.loading = true;
        const { status, data, message } = await formFieldListByFormIdAPI(formId);
        if (status === 200) {
            fieldOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            fieldOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        fieldOptions.value.loading = false;
    }

    async function masterDerivationFunctions() {
        masterFunctionOptions.value.loading = true;
        const { status, data, message } = await masterDerivationFunctionsAPI();
        if (status === 200) {
            masterFunctionOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            masterFunctionOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        masterFunctionOptions.value.loading = false;
    }

    function derivationStepForm(key: string) {
        if (!checkIfKeyExistsInObject(key, derivationStepDetails.value))
            derivationStepDetails.value[key] = true;
        else derivationStepDetails.value[key] = !derivationStepDetails.value[key];
    }

    function resetDerivationStepDetails(tempID?: string) {
        if (tempID) {
            derivationStepForm(tempID);
            deleteObjectPropertyByKey(tempID, derivationStepValidationErrors.value);
        } else {
            derivationStepDetails.value = {};
            derivationStepValidationErrors.value = {};
        }
    }

    function addOrEditDerivationStep() {
        const tempID = uniqueID();
        const newItemIndex = getArrayLength(derivationStepTableData.value);
        derivationStepTableData.value.splice(newItemIndex, 0, {
            id: null,
            type: null,
            folderId: null,
            formId: null,
            fieldId: null,
            variableId: null,
            dataValue: null,
            isApplyToAllFolders: false,
            isApplyToAllFields: false,
            derivationFunctionId: null,
            value: null,
            format: null,
            derivationId: props.tabData[props.activeTab.label].data.id,
            folderRepeatNumber: 0,
            formRepeatNumber: 0,
            logicalRecordPosition: "",
            recordPosition: 0,
            stepOrder: getArrayLength(derivationStepTableData.value) + 1,
            derivationFunctionName: null,
            fieldName: null,
            folderName: null,
            formName: null,
            variableName: null,
            tempID,
        });
        derivationStepForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    async function deleteDerivationStepById(derivationStepId: number) {
        loading.value.form = true;
        const { status, message } = await deleteDerivationStepAPI(derivationStepId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await derivationStepPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function derivationStepValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IDerivationStepValidationError> = {
            ...derivationStepValidationErrors.value,
        };
        for (const [index, tableRow] of derivationStepTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IDerivationStepValidationError = {
                    ...defaultDerivationStepValidationErrors(tableRow.tempID),
                };
                if (!tableRow.type) obj["type"] = "Please select a type";
                else obj["type"] = "";

                if (tableRow.type === 1) {
                    if (!tableRow.isApplyToAllFolders && !tableRow.isApplyToAllFields) {
                        // if (!tableRow.folderId) obj["folderId"] = "Please select a folder";
                        // else obj["folderId"] = "";
                        if (!tableRow.formId) obj["formId"] = "Please select a form";
                        else obj["formId"] = "";
                        if (!tableRow.fieldId) obj["fieldId"] = "Please select a field";
                        else obj["fieldId"] = "";
                    } else if (!tableRow.isApplyToAllFields) {
                        if (!tableRow.formId) obj["formId"] = "Please select a form";
                        else obj["formId"] = "";
                    }
                } else if (tableRow.type === 2) {
                    if (!tableRow.derivationFunctionId)
                        obj["derivationFunctionId"] = "Please select a derivation function";
                    else obj["derivationFunctionId"] = "";
                } else if (tableRow.type === 3) {
                    if (!tableRow["value"] && !tableRow["format"])
                        obj["value"] = "Please enter a value";
                    else if (!tableRow.value) obj["value"] = "Please enter a value";
                    // else if (!tableRow.format) obj["format"] = "Please enter a format";
                    else obj["value"] = "";
                    // if (!tableRow.format) obj["format"] = "Please enter a format";
                    // else obj["format"] = "";
                }
                result[tableRow.tempID] = obj;
                break;
            }
        }
        derivationStepValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function clearDataValueDetails(data: IDerivationStepTableData) {
        data.folderId = null;
        data.formId = null;
        data.fieldId = null;
        data.variableId = null;
        data.isApplyToAllFolders = false;
        data.isApplyToAllFields = false;
        data.recordPosition = 0;
        data.formRepeatNumber = 0;
        data.folderRepeatNumber = 0;
    }
    function clearCheckFunctionDetails(data: IDerivationStepTableData) {
        data.derivationFunctionId = null;
    }
    function clearConstantDetails(data: IDerivationStepTableData) {
        data.value = null;
        data.format = null;
    }

    function resetEnteredDataByType(data: IDerivationStepTableData) {
        if (data.type === 1) {
            clearCheckFunctionDetails(data);
            clearConstantDetails(data);
        } else if (data.type === 2) {
            clearDataValueDetails(data);
            clearConstantDetails(data);
        } else if (data.type === 3) {
            clearDataValueDetails(data);
            clearCheckFunctionDetails(data);
        }
    }

    async function saveAddOrEditDerivationStep(rowIndex: number) {
        derivationStepValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(derivationStepValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: derivationStepTableData.value[rowIndex].id || 0,
                derivationId: props.tabData[props.activeTab.label].data.id as number,
                stepOrder: derivationStepTableData.value[rowIndex].stepOrder,
                type: derivationStepTableData.value[rowIndex].type as number,
                folderId: derivationStepTableData.value[rowIndex].folderId,
                formId: derivationStepTableData.value[rowIndex].formId,
                fieldId: derivationStepTableData.value[rowIndex].fieldId,
                variableId: derivationStepTableData.value[rowIndex].variableId,
                recordPosition: derivationStepTableData.value[rowIndex].recordPosition,
                formRepeatNumber: derivationStepTableData.value[rowIndex].formRepeatNumber,
                folderRepeatNumber: derivationStepTableData.value[rowIndex].folderRepeatNumber,
                logicalRecordPosition: "",
                dataValue: derivationStepTableData.value[rowIndex].dataValue,
                isApplyToAllFields: derivationStepTableData.value[rowIndex].isApplyToAllFields,
                isApplyToAllFolders: derivationStepTableData.value[rowIndex].isApplyToAllFolders,
                value: derivationStepTableData.value[rowIndex].value,
                format: derivationStepTableData.value[rowIndex].format,
                fieldName: null,
                folderName: null,
                formName: null,
                variableName: null,
                derivationFunctionName: null,
                updatedBy: 0,
                derivationFunctionId: derivationStepTableData.value[rowIndex].derivationFunctionId,
            };
            if (!derivationStepTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createDerivationStepAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateDerivationStepAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                    adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
                setFormLookups(null);
                resetDerivationStepDetails();
                await derivationStepPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        derivationStepTableData.value[rowIndex].tempID,
                        derivationStepValidationErrors.value,
                        defaultDerivationStepValidationErrors(
                            derivationStepTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        derivationStepValidationErrors.value,
                        derivationStepTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    function setTableData(tableData: IDerivationStepData[]): IDerivationStepTableData[] {
        derivationStepTableLoaders.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            derivationId: row.derivationId,
            stepOrder: row.stepOrder,
            type: row.type,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: row.formRepeatNumber,
            folderRepeatNumber: row.folderRepeatNumber,
            logicalRecordPosition: row.logicalRecordPosition,
            dataValue: row.dataValue,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            derivationFunctionId: row.derivationFunctionId,
            value: row.value,
            format: row.format,
            derivationFunctionName: row.derivationFunctionName,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            tempID: uniqueID(),
        })) as IDerivationStepTableData[];
    }

    async function derivationStepPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await derivationStepPaginationListAPI(
            getAPIFilters({
                filter: {
                    derivationId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const result = setTableData(items);
            derivationStepTableData.value = deepClone(result);
            derivationStepTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            derivationStepTableData.value = [];
            derivationStepTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetDerivationActionDetails(tempID?: string) {
        if (tempID) {
            editCheckActionForm(tempID);
            deleteObjectPropertyByKey(tempID, derivationActionValidationErrors.value);
        } else {
            derivationActionDetails.value = {};
            derivationActionValidationErrors.value = {};
        }
    }

    function editCheckActionForm(key: string) {
        if (!checkIfKeyExistsInObject(key, derivationActionDetails.value))
            derivationActionDetails.value[key] = true;
        else derivationActionDetails.value[key] = !derivationActionDetails.value[key];
    }

    function addOrEditDerivationAction() {
        const tempID = uniqueID();
        const newItemIndex = getArrayLength(derivationActionTableData.value);
        derivationActionTableData.value.splice(newItemIndex, 0, {
            id: null,
            folderId: null,
            formId: null,
            fieldId: null,
            variableId: null,
            isApplyToAllFolders: false,
            isApplyToAllFields: false,
            derivationId: props.tabData[props.activeTab.label].data.id,
            folderRepeatNumber: 0,
            formRepeatNumber: 0,
            recordPosition: 0,
            fieldName: null,
            folderName: null,
            formName: null,
            variableName: null,
            isEnableField: false,
            // actionMessage: null,
            updatedBy: 0,
            tempID,
        });
        editCheckActionForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function checkActionValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IDerivationActionValidationError> = {
            ...derivationActionValidationErrors.value,
        };
        for (const [index, tableRow] of derivationActionTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IDerivationActionValidationError = {
                    ...defaultDerivationActionValidationErrors(tableRow.tempID),
                };
                if (!tableRow.isApplyToAllFolders && !tableRow.isApplyToAllFields) {
                    // if (!tableRow.folderId) obj["folderId"] = "Please select a folder";
                    // else obj["folderId"] = "";
                    if (!tableRow.formId) obj["formId"] = "Please select a form";
                    else obj["formId"] = "";
                    if (!tableRow.fieldId) obj["fieldId"] = "Please select a field";
                    else obj["fieldId"] = "";
                } else if (!tableRow.isApplyToAllFields) {
                    if (!tableRow.formId) obj["formId"] = "Please select a form";
                    else obj["formId"] = "";
                }
                // if (!tableRow.actionMessage) obj["actionMessage"] = "Please enter a message";
                // else obj["actionMessage"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        derivationActionValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrDerivationActionApi(rowIndex: number) {
        checkActionValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(derivationActionValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: derivationActionTableData.value[rowIndex].id || 0,
                derivationId: props.tabData[props.activeTab.label].data.id as number,
                folderId: derivationActionTableData.value[rowIndex].folderId,
                formId: derivationActionTableData.value[rowIndex].formId,
                fieldId: derivationActionTableData.value[rowIndex].fieldId,
                variableId: derivationActionTableData.value[rowIndex].variableId,
                recordPosition: derivationActionTableData.value[rowIndex].recordPosition,
                formRepeatNumber: derivationActionTableData.value[rowIndex].formRepeatNumber,
                folderRepeatNumber: derivationActionTableData.value[rowIndex].folderRepeatNumber,
                isApplyToAllFields: derivationActionTableData.value[rowIndex].isApplyToAllFields,
                isApplyToAllFolders: derivationActionTableData.value[rowIndex].isApplyToAllFolders,
                isEnableField: derivationActionTableData.value[rowIndex].isEnableField,
                fieldName: null,
                folderName: null,
                formName: null,
                variableName: null,
                updatedBy: 0,
            };
            if (!derivationActionTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createDerivationActionAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateDerivationActionAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (!adminWinFormStore.triggerGoBackPostHook.isActionPerformed)
                    adminWinFormStore.triggerGoBackPostHook.isActionPerformed = true;
                setFormLookups(null);
                resetDerivationActionDetails();
                await derivationActionPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        derivationActionTableData.value[rowIndex].tempID,
                        derivationActionValidationErrors.value,
                        defaultDerivationActionValidationErrors(
                            derivationActionTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        derivationActionValidationErrors.value,
                        derivationActionTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteDerivationActionById(derivationActionId: number) {
        loading.value.form = true;
        const { status, message } = await deleteDerivationActionAPI(derivationActionId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await derivationActionPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function setderivationActionTableData(
        tableData: IDerivationActionData[],
    ): IDerivationActionTableData[] {
        derivationActionTableLoaders.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            derivationId: row.derivationId,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: 0,
            folderRepeatNumber: 0,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            isEnableField: row.isEnableField,
            tempID: uniqueID(),
        })) as IDerivationActionTableData[];
    }

    async function derivationActionPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await derivationActionPaginationListAPI(
            getAPIFilters({
                filter: {
                    derivationId: props.tabData[props.activeTab.label].data.id,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const result = setderivationActionTableData(items);
            derivationActionTableData.value = deepClone(result);
            derivationActionTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            derivationActionTableData.value = [];
            derivationActionTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }

    const {
        isModelChanged: isEditCheckStepModelChanged,
        model: editCheckStepModel,
        modelRef: editCheckStepModelRef,
    } = useUnsavedAlert(derivationStepTableData.value, derivationStepTableDataRef.value);

    const {
        isModelChanged: isEditCheckActionModelChanged,
        model: editCheckActionModel,
        modelRef: editCheckActionModelRef,
    } = useUnsavedAlert(derivationActionTableData.value, derivationActionTableDataRef.value);

    watch(
        () => derivationStepTableData.value,
        (newValue) => {
            editCheckStepModel.value = newValue;
            editCheckStepModelRef.value = derivationStepTableDataRef.value;
        },
        { deep: true },
    );
    watch(
        () => derivationActionTableData.value,
        (newValue) => {
            editCheckActionModel.value = newValue;
            editCheckActionModelRef.value = derivationActionTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => isEditCheckStepModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isEditCheckActionModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isEditCheckStepModelChanged.value) {
                derivationStepTableData.value = deepClone(derivationStepTableDataRef.value);
                resetDerivationStepDetails();
                setFormLookups(null);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );
    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isEditCheckActionModelChanged.value) {
                derivationActionTableData.value = deepClone(derivationActionTableDataRef.value);
                resetDerivationActionDetails();
                setFormLookups(null);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["formDetailsDetails"]);
        Promise.all([
            derivationStepPaginationList(),
            derivationActionPaginationList(),
            masterDerivationFunctions(),
            formDetailsByBranchId(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Derivation Step">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Derivation Step"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditDerivationStep();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="derivationStepFormColumns"
                                :table-data="derivationStepTableData"
                                :loading="loading.table"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row !w-[20rem]">
                                        <edc-dropdown
                                            v-if="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    derivationStepDetails,
                                                ) && derivationStepDetails[data.tempID]
                                            "
                                            :key="`dataValue-${data.tempID}`"
                                            v-model="data.type"
                                            container-class="w-[10rem]"
                                            :options="DERIVATION_TYPE_OPTIONS"
                                            default-value="Data Value"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[10rem]"
                                            :ellipse-count="9"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    derivationStepValidationErrors,
                                                )
                                                    ? derivationStepValidationErrors[data.tempID]
                                                          .type
                                                    : ''
                                            "
                                            @on-select="
                                                () => {
                                                    resetEnteredDataByType(data);
                                                }
                                            "
                                        />
                                        <div v-else>
                                            <span v-if="data.type === 1">Data Value</span>
                                            <span v-else-if="data.type === 2"
                                                >Derivation Function</span
                                            >
                                            <span v-else>Constant</span>
                                        </div>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <div
                                            v-if="data.type === 3"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <edc-text-input
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`stepValue-${data.tempID}`"
                                                v-model="data.value"
                                                type="text"
                                                label="Value"
                                                label-class="admin-input-font"
                                                placeholder="Enter value"
                                                input-class="admin-input-font"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].value
                                                        : ''
                                                "
                                            />
                                            <span v-else>{{ data.value }}</span>
                                            <edc-text-input
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`stepFormat-${data.tempID}`"
                                                v-model="data.format"
                                                type="text"
                                                label="Format"
                                                label-class="admin-input-font"
                                                placeholder="Enter format"
                                                input-class="admin-input-font"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].format
                                                        : ''
                                                "
                                            />
                                            <span v-else-if="data.format">({{ data.format }})</span>
                                        </div>
                                        <div
                                            v-else-if="data.type === 2"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <edc-dropdown
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`derivationFunctionId-${data.tempID}`"
                                                v-model="data.derivationFunctionId"
                                                container-class="w-[20rem]"
                                                :options="masterFunctionLookups"
                                                :loading="masterFunctionOptions.loading"
                                                :disabled="
                                                    loading.isDisabled(
                                                        masterFunctionOptions.loading,
                                                    )
                                                "
                                                default-value="Select function"
                                                label="Derivation Function"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[20rem]"
                                                :ellipse-count="25"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].derivationFunctionId
                                                        : ''
                                                "
                                            />
                                            <span v-else>{{ data.derivationFunctionName }}</span>
                                        </div>
                                        <div
                                            v-else-if="data.type === 1"
                                            class="flex flex-row gap-[1rem]"
                                        >
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <edc-dropdown
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepDetails,
                                                        ) && derivationStepDetails[data.tempID]
                                                    "
                                                    :key="`folderId-${data.tempID}`"
                                                    v-model="data.folderId"
                                                    container-class="w-[10rem]"
                                                    :options="folderLookups"
                                                    :disabled="
                                                        loading.isDisabled(data.isApplyToAllFolders)
                                                    "
                                                    :loading="
                                                        checkIfKeyExistsInObject(
                                                            'formDetailsDetails',
                                                            loading.dynamicLoading,
                                                        )
                                                            ? loading.dynamicLoading[
                                                                  'formDetailsDetails'
                                                              ]
                                                            : false
                                                    "
                                                    default-value="Select Folder"
                                                    label="Folder"
                                                    label-class="admin-input-font"
                                                    input-class="admin-input-font"
                                                    option-placement="bottom"
                                                    option-class="w-[10rem]"
                                                    :ellipse-count="10"
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepValidationErrors,
                                                        )
                                                            ? derivationStepValidationErrors[
                                                                  data.tempID
                                                              ].folderId
                                                            : ''
                                                    "
                                                    @on-select="
                                                        (selectedFolderId) => {
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                            setFormLookups(
                                                                Number(selectedFolderId[0]),
                                                            );
                                                        }
                                                    "
                                                    @on-clear="
                                                        () => {
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                            setFormLookups(null);
                                                        }
                                                    "
                                                />
                                                <edc-checkbox
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepDetails,
                                                        ) && derivationStepDetails[data.tempID]
                                                    "
                                                    :key="`isApplyToAllFolders-${data.tempID}`"
                                                    v-model="data.isApplyToAllFolders"
                                                    name="isApplyToAllFolders"
                                                    label="Apply to all folders"
                                                    label-class="admin-input-font mt-[0.5rem]"
                                                    @on-change="
                                                        () => {
                                                            data.folderId = null;
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                        }
                                                    "
                                                />
                                                <div v-else>
                                                    <span
                                                        v-if="
                                                            data.folderId &&
                                                            !data.isApplyToAllFolders
                                                        "
                                                        >{{ data.folderName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.folderId &&
                                                            data.isApplyToAllFolders
                                                        "
                                                        >Applied to all folders</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <edc-dropdown
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepDetails,
                                                        ) && derivationStepDetails[data.tempID]
                                                    "
                                                    :key="`formId-${data.tempID}`"
                                                    v-model="data.formId"
                                                    container-class="w-[10rem]"
                                                    :options="formLookups"
                                                    :disabled="
                                                        loading.isDisabled(data.isApplyToAllFolders)
                                                    "
                                                    :loading="
                                                        checkIfKeyExistsInObject(
                                                            'formDetailsDetails',
                                                            loading.dynamicLoading,
                                                        )
                                                            ? loading.dynamicLoading[
                                                                  'formDetailsDetails'
                                                              ]
                                                            : false
                                                    "
                                                    default-value="Select form"
                                                    label="Form"
                                                    label-class="admin-input-font"
                                                    input-class="admin-input-font"
                                                    option-placement="bottom"
                                                    option-class="w-[10rem]"
                                                    :ellipse-count="10"
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepValidationErrors,
                                                        )
                                                            ? derivationStepValidationErrors[
                                                                  data.tempID
                                                              ].formId
                                                            : ''
                                                    "
                                                    @on-select="
                                                        async (selectedFormId) => {
                                                            await fieldsList(
                                                                String(selectedFormId[0]),
                                                            );
                                                        }
                                                    "
                                                    @on-clear="
                                                        async () => {
                                                            fieldOptions.options = [];
                                                        }
                                                    "
                                                />
                                                <edc-checkbox
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepDetails,
                                                        ) && derivationStepDetails[data.tempID]
                                                    "
                                                    :key="`isApplyToAllFilds-${data.tempID}`"
                                                    v-model="data.isApplyToAllFields"
                                                    name="isApplyToAllFields"
                                                    label="Apply to all fields"
                                                    label-class="admin-input-font mt-[0.5rem]"
                                                    @on-change="
                                                        () => {
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                        }
                                                    "
                                                />
                                                <div v-else>
                                                    <span
                                                        v-if="
                                                            data.formId && !data.isApplyToAllFolders
                                                        "
                                                        :class="[
                                                            !(
                                                                (data.folderId &&
                                                                    !data.isApplyToAllFolders) ||
                                                                (!data.folderId &&
                                                                    data.isApplyToAllFolders)
                                                            )
                                                                ? '-ml-[1rem]'
                                                                : '',
                                                        ]"
                                                        >{{ data.formName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.formId && data.isApplyToAllFolders
                                                        "
                                                        >Applied to all forms</span
                                                    >
                                                </div>
                                            </div>
                                            <edc-dropdown
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`fieldId-${data.tempID}`"
                                                v-model="data.fieldId"
                                                container-class="w-[10rem]"
                                                :options="fieldLookups"
                                                :disabled="
                                                    loading.isDisabled(
                                                        fieldOptions.loading,
                                                        data.isApplyToAllFields,
                                                        data.isApplyToAllFolders,
                                                    )
                                                "
                                                :loading="fieldOptions.loading"
                                                default-value="Select field"
                                                label="Field"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[10rem]"
                                                :ellipse-count="10"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].fieldId
                                                        : ''
                                                "
                                                @on-select="
                                                    (selectedFieldId) => {
                                                        data.variableId = setVariableDetails(
                                                            Number(selectedFieldId[0]),
                                                        );
                                                    }
                                                "
                                                @on-clear="
                                                    () => {
                                                        data.variableId = setVariableDetails(
                                                            Number(null),
                                                        );
                                                    }
                                                "
                                            />
                                            <div v-else>
                                                <span
                                                    v-if="
                                                        data.fieldId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.fieldName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.fieldId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all fields</span
                                                >
                                            </div>
                                            <edc-dropdown
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`variableId-${data.variableId ? data.variableId : ''}${data.tempID}`"
                                                v-model="data.variableId"
                                                container-class="w-[10rem]"
                                                :options="variableLookups"
                                                :disabled="
                                                    loading.isDisabled(
                                                        fieldOptions.loading,
                                                        data.isApplyToAllFields,
                                                        data.isApplyToAllFolders,
                                                    )
                                                "
                                                :loading="fieldOptions.loading"
                                                default-value="Select variable"
                                                label="Variable"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[10rem]"
                                                :ellipse-count="10"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].variableId
                                                        : ''
                                                "
                                            />
                                            <div v-else>
                                                <span
                                                    v-if="
                                                        data.variableId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >({{ data.variableName }})
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.variableId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all variables</span
                                                >
                                            </div>
                                            <edc-text-input
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepDetails,
                                                    ) && derivationStepDetails[data.tempID]
                                                "
                                                :key="`recordPosition-${data.tempID}`"
                                                v-model="data.recordPosition"
                                                type="number"
                                                container-class="w-[10rem]"
                                                :disabled="loading.isDisabled()"
                                                label="Rec. Position."
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                :whole-part="{
                                                    minLength: 0,
                                                    maxLength: 100,
                                                }"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationStepValidationErrors,
                                                    )
                                                        ? derivationStepValidationErrors[
                                                              data.tempID
                                                          ].recordPosition
                                                        : ''
                                                "
                                            />
                                            <span v-else>({{ data.recordPosition }})</span>
                                        </div>
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, derivationStepDetails) &&
                                            !disableAction
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => derivationStepForm(data.tempID)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, derivationStepDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => await saveAddOrEditDerivationStep(index)
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, derivationStepDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    derivationStepTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: derivationStepTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    derivationStepTableData[index] = deepClone(
                                                        derivationStepTableDataRef[index],
                                                    );
                                                resetDerivationStepDetails(data.tempID);
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
                                            !isEditable(data.tempID, derivationStepDetails) &&
                                            data.id &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, derivationStepTableLoaders) && derivationStepTableLoaders[index] ? 'show' : 'hide'}DeleteStepConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this step?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                derivationStepTableLoaders[index] = true;
                                                await deleteDerivationStepById(Number(data.id));
                                                derivationStepTableLoaders[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table-save"
                                                :disabled="loading.isDisabled()"
                                                :show-loader="derivationStepTableLoaders[index]"
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
        <admin-card-wrapper group-label="Derivation Action">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Derivation Action"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditDerivationAction();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="derivationActionFormColumns"
                                :table-data="derivationActionTableData"
                                :loading="loading.secondaryTable"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                            >
                                <template #custom-content="{ data }">
                                    <td class="font-normal text-left font-12 custom-row">
                                        <div class="flex flex-row gap-[1rem]">
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <edc-dropdown
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionDetails,
                                                        ) && derivationActionDetails[data.tempID]
                                                    "
                                                    :key="`folderId-${data.tempID}`"
                                                    v-model="data.folderId"
                                                    container-class="w-[10rem]"
                                                    :options="folderLookups"
                                                    :disabled="
                                                        loading.isDisabled(data.isApplyToAllFolders)
                                                    "
                                                    :loading="
                                                        checkIfKeyExistsInObject(
                                                            'formDetailsDetails',
                                                            loading.dynamicLoading,
                                                        )
                                                            ? loading.dynamicLoading[
                                                                  'formDetailsDetails'
                                                              ]
                                                            : false
                                                    "
                                                    default-value="Select folder"
                                                    label="Folder"
                                                    label-class="admin-input-font"
                                                    input-class="admin-input-font"
                                                    option-placement="bottom"
                                                    option-class="w-[10rem]"
                                                    :ellipse-count="10"
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionValidationErrors,
                                                        )
                                                            ? derivationActionValidationErrors[
                                                                  data.tempID
                                                              ].folderId
                                                            : ''
                                                    "
                                                    @on-select="
                                                        (selectedFolderId) => {
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                            setFormLookups(
                                                                Number(selectedFolderId[0]),
                                                            );
                                                        }
                                                    "
                                                    @on-clear="
                                                        () => {
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                            setFormLookups(null);
                                                        }
                                                    "
                                                />
                                                <edc-checkbox
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionDetails,
                                                        ) && derivationActionDetails[data.tempID]
                                                    "
                                                    :key="`isApplyToAllFolders-${data.tempID}`"
                                                    v-model="data.isApplyToAllFolders"
                                                    name="isApplyToAllFolders"
                                                    label="Apply to all folders"
                                                    label-class="admin-input-font mt-[0.5rem]"
                                                    @on-change="
                                                        () => {
                                                            data.folderId = null;
                                                            data.formId = null;
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                        }
                                                    "
                                                />
                                                <div v-else>
                                                    <span
                                                        v-if="
                                                            data.folderId &&
                                                            !data.isApplyToAllFolders
                                                        "
                                                        >{{ data.folderName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.folderId &&
                                                            data.isApplyToAllFolders
                                                        "
                                                        >Applied to all folders</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <edc-dropdown
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionDetails,
                                                        ) && derivationActionDetails[data.tempID]
                                                    "
                                                    :key="`formId-${data.tempID}`"
                                                    v-model="data.formId"
                                                    container-class="w-[10rem]"
                                                    :options="formLookups"
                                                    :disabled="
                                                        loading.isDisabled(data.isApplyToAllFolders)
                                                    "
                                                    :loading="
                                                        checkIfKeyExistsInObject(
                                                            'formDetailsDetails',
                                                            loading.dynamicLoading,
                                                        )
                                                            ? loading.dynamicLoading[
                                                                  'formDetailsDetails'
                                                              ]
                                                            : false
                                                    "
                                                    default-value="Select form"
                                                    label="Form"
                                                    label-class="admin-input-font"
                                                    input-class="admin-input-font"
                                                    option-placement="bottom"
                                                    option-class="w-[10rem]"
                                                    :ellipse-count="10"
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionValidationErrors,
                                                        )
                                                            ? derivationActionValidationErrors[
                                                                  data.tempID
                                                              ].formId
                                                            : ''
                                                    "
                                                    @on-select="
                                                        async (selectedFormId) => {
                                                            await fieldsList(
                                                                String(selectedFormId[0]),
                                                            );
                                                        }
                                                    "
                                                    @on-clear="
                                                        async () => {
                                                            fieldOptions.options = [];
                                                        }
                                                    "
                                                />
                                                <edc-checkbox
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationActionDetails,
                                                        ) && derivationActionDetails[data.tempID]
                                                    "
                                                    :key="`isApplyToAllFilds-${data.tempID}`"
                                                    v-model="data.isApplyToAllFields"
                                                    name="isApplyToAllFields"
                                                    label="Apply to all fields"
                                                    label-class="admin-input-font mt-[0.5rem]"
                                                    @on-change="
                                                        () => {
                                                            data.fieldId = null;
                                                            data.variableId = null;
                                                        }
                                                    "
                                                />
                                                <div v-else>
                                                    <span
                                                        v-if="
                                                            data.formId && !data.isApplyToAllFolders
                                                        "
                                                        :class="[
                                                            !(
                                                                (data.folderId &&
                                                                    !data.isApplyToAllFolders) ||
                                                                (!data.folderId &&
                                                                    data.isApplyToAllFolders)
                                                            )
                                                                ? '-ml-[1rem]'
                                                                : '',
                                                        ]"
                                                        >{{ data.formName }} &nbsp; >
                                                    </span>
                                                    <span
                                                        v-else-if="
                                                            !data.formId && data.isApplyToAllFolders
                                                        "
                                                        :class="[
                                                            !(
                                                                (data.folderId &&
                                                                    !data.isApplyToAllFolders) ||
                                                                (!data.folderId &&
                                                                    data.isApplyToAllFolders)
                                                            )
                                                                ? '-ml-[1rem]'
                                                                : '',
                                                        ]"
                                                        >Applied to all forms</span
                                                    >
                                                </div>
                                            </div>
                                            <edc-dropdown
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationActionDetails,
                                                    ) && derivationActionDetails[data.tempID]
                                                "
                                                :key="`fieldId-${data.tempID}`"
                                                v-model="data.fieldId"
                                                container-class="w-[10rem]"
                                                :options="fieldLookups"
                                                :disabled="
                                                    loading.isDisabled(
                                                        fieldOptions.loading,
                                                        data.isApplyToAllFields,
                                                        data.isApplyToAllFolders,
                                                    )
                                                "
                                                :loading="fieldOptions.loading"
                                                default-value="Select field"
                                                label="Field"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[10rem]"
                                                :ellipse-count="10"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationActionValidationErrors,
                                                    )
                                                        ? derivationActionValidationErrors[
                                                              data.tempID
                                                          ].fieldId
                                                        : ''
                                                "
                                                @on-select="
                                                    (selectedFieldId) => {
                                                        data.variableId = setVariableDetails(
                                                            Number(selectedFieldId[0]),
                                                        );
                                                    }
                                                "
                                                @on-clear="
                                                    () => {
                                                        data.variableId = setVariableDetails(
                                                            Number(null),
                                                        );
                                                    }
                                                "
                                            />
                                            <div v-else>
                                                <span
                                                    v-if="
                                                        data.fieldId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >{{ data.fieldName }}
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.fieldId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all fields</span
                                                >
                                            </div>
                                            <edc-dropdown
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationActionDetails,
                                                    ) && derivationActionDetails[data.tempID]
                                                "
                                                :key="`variableId-${data.variableId ? data.variableId : ''}${data.tempID}`"
                                                v-model="data.variableId"
                                                container-class="w-[10rem]"
                                                :options="variableLookups"
                                                :disabled="
                                                    loading.isDisabled(
                                                        fieldOptions.loading,
                                                        data.isApplyToAllFields,
                                                        data.isApplyToAllFolders,
                                                    )
                                                "
                                                :loading="fieldOptions.loading"
                                                default-value="Select variable"
                                                label="Variable"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[10rem]"
                                                :ellipse-count="10"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        derivationActionValidationErrors,
                                                    )
                                                        ? derivationActionValidationErrors[
                                                              data.tempID
                                                          ].variableId
                                                        : ''
                                                "
                                            />
                                            <div v-else>
                                                <span
                                                    v-if="
                                                        data.variableId &&
                                                        !data.isApplyToAllFolders &&
                                                        !data.isApplyToAllFields
                                                    "
                                                    >({{ data.variableName }})
                                                </span>
                                                <span
                                                    v-else-if="
                                                        !data.variableId &&
                                                        (data.isApplyToAllFolders ||
                                                            data.isApplyToAllFields)
                                                    "
                                                    >Applied to all variables</span
                                                >
                                                <edc-text-input
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepDetails,
                                                        ) && derivationStepDetails[data.tempID]
                                                    "
                                                    :key="`recordPosition-${data.tempID}`"
                                                    v-model="data.recordPosition"
                                                    type="number"
                                                    container-class="w-[10rem]"
                                                    :disabled="loading.isDisabled()"
                                                    label="Rec. Position."
                                                    label-class="admin-input-font"
                                                    input-class="admin-input-font"
                                                    :whole-part="{
                                                        minLength: 0,
                                                        maxLength: 100,
                                                    }"
                                                    :error="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            derivationStepValidationErrors,
                                                        )
                                                            ? derivationStepValidationErrors[
                                                                  data.tempID
                                                              ].recordPosition
                                                            : ''
                                                    "
                                                />
                                                <span v-else>({{ data.recordPosition }})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <edc-checkbox
                                            :key="`isEnableField-${data.tempID}`"
                                            v-model="data.isEnableField"
                                            :container-class="
                                                !isEditable(data.tempID, derivationActionDetails)
                                                    ? 'mt-[0.5rem]'
                                                    : ''
                                            "
                                            name="isEnableField"
                                            :disabled="loading.isDisabled()"
                                            :read-only="
                                                !isEditable(data.tempID, derivationActionDetails)
                                            "
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    derivationActionValidationErrors,
                                                )
                                                    ? derivationActionValidationErrors[data.tempID]
                                                          .isEnableField
                                                    : ''
                                            "
                                        />
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, derivationActionDetails) &&
                                            !disableAction
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => editCheckActionForm(data.tempID)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, derivationActionDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => await saveAddOrDerivationActionApi(index)
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, derivationActionDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    derivationActionTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: derivationActionTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    derivationActionTableData[index] = deepClone(
                                                        derivationActionTableDataRef[index],
                                                    );
                                                resetDerivationActionDetails(data.tempID);
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
                                            !isEditable(data.tempID, derivationActionDetails) &&
                                            data.id &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, derivationActionTableLoaders) && derivationActionTableLoaders[index] ? 'show' : 'hide'}DeleteActionConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this action?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                derivationActionTableLoaders[index] = true;
                                                await deleteDerivationActionById(Number(data.id));
                                                derivationActionTableLoaders[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table-save"
                                                :disabled="loading.isDisabled()"
                                                :show-loader="derivationActionTableLoaders[index]"
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
