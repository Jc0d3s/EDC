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
    import { EDIT_CHECK_ACTION_TYPES, EDIT_CHECK_TYPE_OPTIONS } from "~/constants/options";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        checkActionsListAPI,
        checkStepsListAPI,
        createEditCheckActionAPI,
        createEditCheckStepAPI,
        deleteEditCheckActionAPI,
        deleteEditCheckStepByIdAPI,
        formDetailsByBranchIdAPI,
        masterCheckFunctionsAPI,
        updateEditCheckActionAPI,
        updateEditCheckStepAPI,
    } from "~/services/apis/handlers/admin/edit-check";
    import useToastStore from "~/stores/toast";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import { formFieldListByFormIdAPI } from "~/services/apis/handlers/admin/form-field";
    import type { IFormFieldData } from "~/services/apis/handlers/types/admin/form-field-types";
    import type {
        IEditCheckActionData,
        IEditCheckStepData,
        IMasterCheckFunctionData,
    } from "~/services/apis/handlers/types/admin/edit-check-types";
    import useAdminWinFormStore from "~/stores/admin-winform";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";

    interface ICheckStepTableData {
        id: TNullableNumber;
        editCheckId: number;
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
        checkFunctionId: TNullableNumber;
        checkFunctionName: TNullableString;
        value: TNullableString;
        format: TNullableString;
        tempID: string;
    }

    interface ICheckActionTableData {
        id: TNullableNumber;
        editCheckId: number;
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
        actionMessage: TNullableString;
        actionType: TNullableNumber;
        updatedBy: number;
        tempID: string;
    }

    interface IEditCheckStepValidationError extends IBaseValidationError {
        type: string;
        folderId: string;
        formId: string;
        fieldId: string;
        variableId: string;
        recordPosition: string;
        formRepeatNumber: string;
        folderRepeatNumber: string;
        dataValue: string;
        checkFunctionId: string;
        value: string;
        format: string;
    }

    interface IEditCheckActionValidationError extends IBaseValidationError {
        folderId: string;
        formId: string;
        fieldId: string;
        variableId: string;
        recordPosition: string;
        formRepeatNumber: string;
        folderRepeatNumber: string;
        actionMessage: string;
        actionType: string;
    }

    const defaultEditCheckStepValidationErrors = (
        tempID: string,
    ): IEditCheckStepValidationError => ({
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
        checkFunctionId: "",
        value: "",
        format: "",
    });

    const defaultEditCheckActionValidationErrors = (
        tempID: string,
    ): IEditCheckActionValidationError => ({
        index: tempID,
        folderId: "",
        formId: "",
        fieldId: "",
        variableId: "",
        recordPosition: "",
        formRepeatNumber: "",
        folderRepeatNumber: "",
        actionMessage: "",
        actionType: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const adminWinFormStore = useAdminWinFormStore();
    const unsavedAlertStore = useUnsavedAlertStore();

    const editCheckStepDetails = ref<Record<string, boolean>>({});

    const checkStepFormColumns: IColumn[] = [
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

    const checkStepTableData = ref<ICheckStepTableData[]>([]);
    const checkStepTableDataRef = ref<ICheckStepTableData[]>(deepClone(checkStepTableData.value));
    const editCheckStepTableLoaders = ref<TTableLoaderDetail>({});
    const checkStepValidationErrors = ref<TValidationErrorData<IEditCheckStepValidationError>>({});
    const loading = ref<Loading>(new Loading());

    const checkActionValidationErrors = ref<TValidationErrorData<IEditCheckActionValidationError>>(
        {},
    );
    const editCheckActionDetails = ref<Record<string, boolean>>({});
    const checkActionFormColumns: IColumn[] = [
        {
            field: "type",
            header: "Type",
            icon: false,
            show: true,
        },
        {
            field: "dataPoint",
            header: "Data Point",
            icon: false,
            show: true,
        },
        {
            field: "action",
            header: "Action",
            icon: false,
            show: true,
        },
    ];

    const checkActionTableData = ref<ICheckActionTableData[]>([]);
    const checkActionTableDataRef = ref<ICheckActionTableData[]>(
        deepClone(checkActionTableData.value),
    );
    const editCheckActionTableLoaders = ref<TTableLoaderDetail>({});

    const formDetails = ref<ITrialVisitFormDetail>({
        trialVisits: [],
        forms: [],
    });
    const fieldOptions = ref<DropdownOption>(new DropdownOption());
    const formLookups = ref<IOptions[]>([]);
    const checkFunctionOptions = ref<DropdownOption>(new DropdownOption());

    const disableAction = computed(() => checkIfEditFormActive(editCheckStepDetails.value));

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

    const checkFunctionLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of checkFunctionOptions.value
            .options as unknown as IMasterCheckFunctionData[]) {
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

    async function masterCheckFunctions() {
        checkFunctionOptions.value.loading = true;
        const { status, data, message } = await masterCheckFunctionsAPI();
        if (status === 200) {
            checkFunctionOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            checkFunctionOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        checkFunctionOptions.value.loading = false;
    }

    function editCheckStepForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editCheckStepDetails.value))
            editCheckStepDetails.value[key] = true;
        else editCheckStepDetails.value[key] = !editCheckStepDetails.value[key];
    }

    function resetEditCheckStepDetails(tempID?: string) {
        if (tempID) {
            editCheckStepForm(tempID);
            deleteObjectPropertyByKey(tempID, checkStepValidationErrors.value);
        } else {
            editCheckStepDetails.value = {};
            checkStepValidationErrors.value = {};
        }
    }

    function addOrEditCheckStep() {
        const tempID = uniqueID();
        const newItemIndex = getArrayLength(checkStepTableData.value);
        checkStepTableData.value.splice(newItemIndex, 0, {
            id: null,
            type: null,
            folderId: null,
            formId: null,
            fieldId: null,
            variableId: null,
            dataValue: null,
            isApplyToAllFolders: false,
            isApplyToAllFields: false,
            checkFunctionId: null,
            value: null,
            format: null,
            editCheckId: props.tabData[props.activeTab.label].data.id,
            folderRepeatNumber: 0,
            formRepeatNumber: 0,
            logicalRecordPosition: "",
            recordPosition: 0,
            stepOrder: getArrayLength(checkStepTableData.value) + 1,
            checkFunctionName: null,
            fieldName: null,
            folderName: null,
            formName: null,
            variableName: null,
            tempID,
        });
        editCheckStepForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    async function deleteEditCheckStepById(editCheckStepId: number) {
        loading.value.form = true;
        const { status, message } = await deleteEditCheckStepByIdAPI(editCheckStepId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await checkStepsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function checkStepValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IEditCheckStepValidationError> = {
            ...checkStepValidationErrors.value,
        };
        for (const [index, tableRow] of checkStepTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IEditCheckStepValidationError = {
                    ...defaultEditCheckStepValidationErrors(tableRow.tempID),
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
                    if (!tableRow.checkFunctionId)
                        obj["checkFunctionId"] = "Please select a check function";
                    else obj["checkFunctionId"] = "";
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
        checkStepValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function clearDataValueDetails(data: ICheckStepTableData) {
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
    function clearCheckFunctionDetails(data: ICheckStepTableData) {
        data.checkFunctionId = null;
    }
    function clearConstantDetails(data: ICheckStepTableData) {
        data.value = null;
        data.format = null;
    }

    function resetEnteredDataByType(data: ICheckStepTableData) {
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

    async function saveAddOrEditCheckStepApi(rowIndex: number) {
        checkStepValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(checkStepValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: checkStepTableData.value[rowIndex].id || 0,
                editCheckId: props.tabData[props.activeTab.label].data.id as number,
                stepOrder: checkStepTableData.value[rowIndex].stepOrder,
                type: checkStepTableData.value[rowIndex].type as number,
                folderId: checkStepTableData.value[rowIndex].folderId,
                formId: checkStepTableData.value[rowIndex].formId,
                fieldId: checkStepTableData.value[rowIndex].fieldId,
                variableId: checkStepTableData.value[rowIndex].variableId,
                recordPosition: checkStepTableData.value[rowIndex].recordPosition,
                formRepeatNumber: checkStepTableData.value[rowIndex].formRepeatNumber,
                folderRepeatNumber: checkStepTableData.value[rowIndex].folderRepeatNumber,
                logicalRecordPosition: "",
                dataValue: checkStepTableData.value[rowIndex].dataValue,
                isApplyToAllFields: checkStepTableData.value[rowIndex].isApplyToAllFields,
                isApplyToAllFolders: checkStepTableData.value[rowIndex].isApplyToAllFolders,
                checkFunctionId: checkStepTableData.value[rowIndex].checkFunctionId,
                value: checkStepTableData.value[rowIndex].value,
                format: checkStepTableData.value[rowIndex].format,
                fieldName: null,
                folderName: null,
                formName: null,
                variableName: null,
                checkFunctionName: null,
                updatedBy: 0,
            };
            if (!checkStepTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createEditCheckStepAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateEditCheckStepAPI(requestData);
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
                resetEditCheckStepDetails();
                await checkStepsList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        checkStepTableData.value[rowIndex].tempID,
                        checkStepValidationErrors.value,
                        defaultEditCheckStepValidationErrors(
                            checkStepTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        checkStepValidationErrors.value,
                        checkStepTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    function setTableData(tableData: IEditCheckStepData[]): ICheckStepTableData[] {
        editCheckStepTableLoaders.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            editCheckId: row.editCheckId,
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
            checkFunctionId: row.checkFunctionId,
            value: row.value,
            format: row.format,
            checkFunctionName: row.checkFunctionName,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            tempID: uniqueID(),
        })) as ICheckStepTableData[];
    }

    async function checkStepsList() {
        loading.value.table = true;
        const { status, data, message } = await checkStepsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setTableData(data);
            checkStepTableData.value = deepClone(result);
            checkStepTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            checkStepTableData.value = [];
            checkStepTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetEditCheckActionDetails(tempID?: string) {
        if (tempID) {
            editCheckActionForm(tempID);
            deleteObjectPropertyByKey(tempID, checkActionValidationErrors.value);
        } else {
            editCheckActionDetails.value = {};
            checkActionValidationErrors.value = {};
        }
    }

    function editCheckActionForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editCheckActionDetails.value))
            editCheckActionDetails.value[key] = true;
        else editCheckActionDetails.value[key] = !editCheckActionDetails.value[key];
    }

    function addOrEditCheckAction() {
        const tempID = uniqueID();
        const newItemIndex = getArrayLength(checkActionTableData.value);
        checkActionTableData.value.splice(newItemIndex, 0, {
            id: null,
            folderId: null,
            formId: null,
            fieldId: null,
            variableId: null,
            isApplyToAllFolders: false,
            isApplyToAllFields: false,
            editCheckId: props.tabData[props.activeTab.label].data.id,
            folderRepeatNumber: 0,
            formRepeatNumber: 0,
            recordPosition: 0,
            fieldName: null,
            folderName: null,
            formName: null,
            variableName: null,
            actionMessage: null,
            updatedBy: 0,
            actionType: null,
            tempID,
        });
        editCheckActionForm(tempID);
        setTimeout(() => {
            scrollToNewlyCreatedRow(newItemIndex);
        }, 10);
    }

    function checkActionValidateAll(rowIndex: number) {
        const result: TValidationErrorData<IEditCheckActionValidationError> = {
            ...checkActionValidationErrors.value,
        };
        for (const [index, tableRow] of checkActionTableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IEditCheckActionValidationError = {
                    ...defaultEditCheckActionValidationErrors(tableRow.tempID),
                };
                if (!tableRow.actionType) obj["actionType"] = "Please select a type";
                else obj["actionType"] = "";

                if (!tableRow.isApplyToAllFolders && !tableRow.isApplyToAllFields) {
                    // if (!tableRow.folderId) obj["folderId"] = "Please select a folder";
                    // else obj["folderId"] = "";
                    if (!tableRow.formId) obj["formId"] = "Please select a form";
                    else obj["formId"] = "";
                    if (tableRow.actionType === 1 || tableRow.actionType === 2) {
                        if (!tableRow.fieldId) obj["fieldId"] = "Please select a field";
                        else obj["fieldId"] = "";
                    }
                } else if (!tableRow.isApplyToAllFields) {
                    if (!tableRow.formId) obj["formId"] = "Please select a form";
                    else obj["formId"] = "";
                }
                if (tableRow.actionType === 1) {
                    if (!tableRow.actionMessage) obj["actionMessage"] = "Please enter a message";
                    else obj["actionMessage"] = "";
                }
                result[tableRow.tempID] = obj;
                break;
            }
        }
        checkActionValidationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    async function saveAddOrEditCheckActionApi(rowIndex: number) {
        checkActionValidateAll(rowIndex);
        if (!checkIfObjectHasErrors(checkActionValidationErrors.value)) {
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: checkActionTableData.value[rowIndex].id || 0,
                editCheckId: props.tabData[props.activeTab.label].data.id as number,
                folderId: checkActionTableData.value[rowIndex].folderId,
                formId: checkActionTableData.value[rowIndex].formId,
                fieldId: checkActionTableData.value[rowIndex].fieldId,
                variableId: checkActionTableData.value[rowIndex].variableId,
                recordPosition: checkActionTableData.value[rowIndex].recordPosition,
                formRepeatNumber: checkActionTableData.value[rowIndex].formRepeatNumber,
                folderRepeatNumber: checkActionTableData.value[rowIndex].folderRepeatNumber,
                isApplyToAllFields: checkActionTableData.value[rowIndex].isApplyToAllFields,
                isApplyToAllFolders: checkActionTableData.value[rowIndex].isApplyToAllFolders,
                actionMessage: checkActionTableData.value[rowIndex].actionMessage as string,
                fieldName: null,
                folderName: null,
                formName: null,
                variableName: null,
                actionType: checkActionTableData.value[rowIndex].actionType as number,
                updatedBy: 0,
            };
            if (!checkActionTableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createEditCheckActionAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateEditCheckActionAPI(requestData);
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
                resetEditCheckActionDetails();
                await checkActionsList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    setDefaultValueByKeyIfKeyDoesNotExists(
                        checkActionTableData.value[rowIndex].tempID,
                        checkActionValidationErrors.value,
                        defaultEditCheckActionValidationErrors(
                            checkActionTableData.value[rowIndex].tempID,
                        ),
                    );
                    setAPIValidationErrors(
                        validationErrorsData,
                        checkActionValidationErrors.value,
                        checkActionTableData.value[rowIndex].tempID,
                    );
                }
            }
            loading.value.form = false;
        }
    }

    async function deleteEditCheckActionById(editCheckActionId: number) {
        loading.value.form = true;
        const { status, message } = await deleteEditCheckActionAPI(editCheckActionId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await checkActionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    function setCheckActionTableData(tableData: IEditCheckActionData[]): ICheckActionTableData[] {
        editCheckActionTableLoaders.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            editCheckId: row.editCheckId,
            folderId: row.folderId,
            formId: row.formId,
            fieldId: row.fieldId,
            variableId: row.variableId,
            recordPosition: row.recordPosition,
            formRepeatNumber: row.formRepeatNumber,
            folderRepeatNumber: row.folderRepeatNumber,
            isApplyToAllFields: row.isApplyToAllFields,
            isApplyToAllFolders: row.isApplyToAllFolders,
            actionMessage: row.actionMessage,
            fieldName: row.fieldName,
            folderName: row.folderName,
            formName: row.formName,
            variableName: row.variableName,
            actionType: row.actionType,
            tempID: uniqueID(),
        })) as ICheckActionTableData[];
    }

    async function checkActionsList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await checkActionsListAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
            const result = setCheckActionTableData(data);
            checkActionTableData.value = deepClone(result);
            checkActionTableDataRef.value = deepClone(result);
        } else if (status !== 401) {
            checkActionTableData.value = [];
            checkActionTableDataRef.value = [];
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
    } = useUnsavedAlert(checkStepTableData.value, checkStepTableDataRef.value);

    const {
        isModelChanged: isEditCheckActionModelChanged,
        model: editCheckActionModel,
        modelRef: editCheckActionModelRef,
    } = useUnsavedAlert(checkActionTableData.value, checkActionTableDataRef.value);

    watch(
        () => checkStepTableData.value,
        (newValue) => {
            editCheckStepModel.value = newValue;
            editCheckStepModelRef.value = checkStepTableDataRef.value;
        },
        { deep: true },
    );
    watch(
        () => checkActionTableData.value,
        (newValue) => {
            editCheckActionModel.value = newValue;
            editCheckActionModelRef.value = checkActionTableDataRef.value;
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
                checkStepTableData.value = deepClone(checkStepTableDataRef.value);
                resetEditCheckStepDetails();
                setFormLookups(null);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );
    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isEditCheckActionModelChanged.value) {
                checkActionTableData.value = deepClone(checkActionTableDataRef.value);
                resetEditCheckActionDetails();
                setFormLookups(null);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["formDetailsDetails"]);
        Promise.all([
            checkStepsList(),
            checkActionsList(),
            masterCheckFunctions(),
            formDetailsByBranchId(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Check Step">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Check Step"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditCheckStep();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="checkStepFormColumns"
                                :table-data="checkStepTableData"
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
                                                    editCheckStepDetails,
                                                ) && editCheckStepDetails[data.tempID]
                                            "
                                            :key="`dataValue-${data.tempID}`"
                                            v-model="data.type"
                                            container-class="w-[10rem]"
                                            :options="EDIT_CHECK_TYPE_OPTIONS"
                                            default-value="Data Value"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[10rem]"
                                            :ellipse-count="9"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    checkStepValidationErrors,
                                                )
                                                    ? checkStepValidationErrors[data.tempID].type
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
                                            <span v-else-if="data.type === 2">Check Function</span>
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
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
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
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .value
                                                        : ''
                                                "
                                            />
                                            <span v-else>{{ data.value }}</span>
                                            <edc-text-input
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
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
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .format
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
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
                                                "
                                                :key="`checkFunctionId-${data.tempID}`"
                                                v-model="data.checkFunctionId"
                                                container-class="w-[20rem]"
                                                :options="checkFunctionLookups"
                                                :loading="checkFunctionOptions.loading"
                                                :disabled="
                                                    loading.isDisabled(checkFunctionOptions.loading)
                                                "
                                                default-value="Select function"
                                                label="Check Function"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                option-placement="bottom"
                                                option-class="w-[20rem]"
                                                :ellipse-count="25"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .checkFunctionId
                                                        : ''
                                                "
                                            />
                                            <span v-else>{{ data.checkFunctionName }}</span>
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
                                                            editCheckStepDetails,
                                                        ) && editCheckStepDetails[data.tempID]
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
                                                            checkStepValidationErrors,
                                                        )
                                                            ? checkStepValidationErrors[data.tempID]
                                                                  .folderId
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
                                                            editCheckStepDetails,
                                                        ) && editCheckStepDetails[data.tempID]
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
                                                            editCheckStepDetails,
                                                        ) && editCheckStepDetails[data.tempID]
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
                                                            checkStepValidationErrors,
                                                        )
                                                            ? checkStepValidationErrors[data.tempID]
                                                                  .formId
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
                                                            editCheckStepDetails,
                                                        ) && editCheckStepDetails[data.tempID]
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
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
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
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .fieldId
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
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
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
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .variableId
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
                                                        editCheckStepDetails,
                                                    ) && editCheckStepDetails[data.tempID]
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
                                                        checkStepValidationErrors,
                                                    )
                                                        ? checkStepValidationErrors[data.tempID]
                                                              .recordPosition
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
                                            !isEditable(data.tempID, editCheckStepDetails) &&
                                            !disableAction
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => editCheckStepForm(data.tempID)"
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Update'"
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            :class="`${commonActionIconClasses('Update')}`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editCheckStepDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => await saveAddOrEditCheckStepApi(index)
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editCheckStepDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    checkStepTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: checkStepTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    checkStepTableData[index] = deepClone(
                                                        checkStepTableDataRef[index],
                                                    );
                                                resetEditCheckStepDetails(data.tempID);
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
                                            !isEditable(data.tempID, editCheckStepDetails) &&
                                            data.id &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, editCheckStepTableLoaders) && editCheckStepTableLoaders[index] ? 'show' : 'hide'}DeleteStepConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this step?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                editCheckStepTableLoaders[index] = true;
                                                await deleteEditCheckStepById(Number(data.id));
                                                editCheckStepTableLoaders[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table-save"
                                                :disabled="loading.isDisabled()"
                                                :show-loader="editCheckStepTableLoaders[index]"
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
        <admin-card-wrapper group-label="Check Action">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <!-- v-if="!disableAction && getArrayLength(checkActionTableData) === 0" -->
                            <admin-action-label
                                v-if="!disableAction"
                                icon="circle-plus"
                                text="Add Check Action"
                                :disabled="loading.isDisabled()"
                                :on-click="
                                    () => {
                                        addOrEditCheckAction();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="checkActionFormColumns"
                                :table-data="checkActionTableData"
                                :loading="loading.secondaryTable"
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
                                                    editCheckActionDetails,
                                                ) && editCheckActionDetails[data.tempID]
                                            "
                                            :key="`actionType-${data.tempID}`"
                                            v-model="data.actionType"
                                            container-class="w-[10rem]"
                                            :options="EDIT_CHECK_ACTION_TYPES"
                                            default-value="Action Type"
                                            input-class="admin-input-font"
                                            option-placement="bottom"
                                            option-class="w-[10rem]"
                                            :ellipse-count="9"
                                            :error="
                                                checkIfKeyExistsInObject(
                                                    data.tempID,
                                                    checkActionValidationErrors,
                                                )
                                                    ? checkActionValidationErrors[data.tempID]
                                                          .actionType
                                                    : ''
                                            "
                                            @on-select="
                                                () => {
                                                    resetEnteredDataByType(data);
                                                }
                                            "
                                        />
                                        <div v-else>
                                            <span v-if="data.actionType === 1"
                                                >Raise Discrepancy</span
                                            >
                                            <span v-else-if="data.actionType === 2"
                                                >Show Field</span
                                            >
                                            <span v-else-if="data.actionType === 3">Add Form</span>
                                            <span v-else-if="data.actionType === 4"
                                                >Disable Field</span
                                            >
                                            <span v-else-if="data.actionType === 5"
                                                >Trigger Email</span
                                            >
                                            <span v-else>Invalid Non Log Value</span>
                                        </div>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <div class="flex flex-row gap-[1rem]">
                                            <div class="flex flex-col gap-[0.5rem]">
                                                <edc-dropdown
                                                    v-if="
                                                        checkIfKeyExistsInObject(
                                                            data.tempID,
                                                            editCheckActionDetails,
                                                        ) && editCheckActionDetails[data.tempID]
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
                                                            checkActionValidationErrors,
                                                        )
                                                            ? checkActionValidationErrors[
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
                                                            editCheckActionDetails,
                                                        ) && editCheckActionDetails[data.tempID]
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
                                                            editCheckActionDetails,
                                                        ) && editCheckActionDetails[data.tempID]
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
                                                            checkActionValidationErrors,
                                                        )
                                                            ? checkActionValidationErrors[
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
                                                            editCheckActionDetails,
                                                        ) && editCheckActionDetails[data.tempID]
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
                                                        >{{ data.formName }} &nbsp;
                                                        {{ data.actionType === 3 ? "" : ">" }}
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
                                                        editCheckActionDetails,
                                                    ) && editCheckActionDetails[data.tempID]
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
                                                        checkActionValidationErrors,
                                                    )
                                                        ? checkActionValidationErrors[data.tempID]
                                                              .fieldId
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
                                            <div v-else-if="data.actionType !== 3">
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
                                                        editCheckActionDetails,
                                                    ) && editCheckActionDetails[data.tempID]
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
                                                        checkActionValidationErrors,
                                                    )
                                                        ? checkActionValidationErrors[data.tempID]
                                                              .variableId
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
                                                            editCheckStepDetails,
                                                        ) && editCheckStepDetails[data.tempID]
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
                                                            checkStepValidationErrors,
                                                        )
                                                            ? checkStepValidationErrors[data.tempID]
                                                                  .recordPosition
                                                            : ''
                                                    "
                                                />
                                                <span v-else>({{ data.recordPosition }})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="font-normal text-left font-12 custom-row">
                                        <template v-if="data.actionType === 1">
                                            <edc-text-area
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        editCheckActionDetails,
                                                    ) && editCheckActionDetails[data.tempID]
                                                "
                                                :key="`actionMessage-${data.tempID}`"
                                                v-model="data.actionMessage"
                                                label="Action Message"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                :error="
                                                    checkIfKeyExistsInObject(
                                                        data.tempID,
                                                        checkActionValidationErrors,
                                                    )
                                                        ? checkActionValidationErrors[data.tempID]
                                                              .actionMessage
                                                        : ''
                                                "
                                            />
                                            <span v-else>{{ data.actionMessage }}</span>
                                        </template>
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <edc-pressable
                                        v-if="
                                            !isEditable(data.tempID, editCheckActionDetails) &&
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
                                        v-if="isEditable(data.tempID, editCheckActionDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => await saveAddOrEditCheckActionApi(index)
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Save'"
                                            icon="save"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-pressable
                                        v-if="isEditable(data.tempID, editCheckActionDetails)"
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                if (!data.id)
                                                    checkActionTableData.splice(
                                                        getIndexOfTheItem({
                                                            data: checkActionTableData,
                                                            type: 'object',
                                                            value: data.tempID,
                                                            key: 'tempID',
                                                        }),
                                                        1,
                                                    );
                                                else
                                                    checkActionTableData[index] = deepClone(
                                                        checkActionTableDataRef[index],
                                                    );
                                                resetEditCheckActionDetails(data.tempID);
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
                                            !isEditable(data.tempID, editCheckActionDetails) &&
                                            data.id &&
                                            !disableAction
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, editCheckActionTableLoaders) && editCheckActionTableLoaders[index] ? 'show' : 'hide'}DeleteActionConfirmation${data.tempID}`"
                                        message="Are you sure you want to delete this action?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                editCheckActionTableLoaders[index] = true;
                                                await deleteEditCheckActionById(Number(data.id));
                                                editCheckActionTableLoaders[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table"
                                                :disabled="loading.isDisabled()"
                                                :show-loader="editCheckActionTableLoaders[index]"
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
