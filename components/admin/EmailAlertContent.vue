<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        branchEmailAlertPaginationListAPI,
        branchEmailTemplateDetailsByEmailConfigIdAPI,
        createBranchEmailAlertAPI,
        createBranchEmailTemplateAPI,
        updateBranchEmailAlertAPI,
        updateBranchEmailTemplateAPI,
    } from "~/services/apis/handlers/admin/branch-email-alert";
    import type { IEmailAlertData } from "~/services/apis/handlers/types/admin/branch-email-alert-types";
    import usePopupModalStore from "~/stores/popup-modal";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IBaseValidationError,
        ITokenVariableDragItem,
        IWinFormProps,
        TAdminFormAction,
        TEditFormDetail,
        TNullableNumber,
        TNullableString,
        TTokenType,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface ITableData {
        id: TNullableNumber;
        branchId: number;
        alertName: TNullableString;
        effectiveDate: TNullableString;
        days: TNullableNumber;
        defaultLocale: TNullableString;
        tempID: string;
    }

    interface IEmailAlertDetail {
        id: number;
        emailAlertConfigId: number;
        to: TNullableString;
        cc: TNullableString;
        bcc: TNullableString;
        subject: TNullableString;
        body: TNullableString;
    }

    interface IValidationError extends IBaseValidationError {
        alertName: string;
        effectiveDate: string;
        days: string;
        defaultLocale: string;
    }

    interface IToken {
        emailAddress: string[];
        variables: string[];
    }

    type TEmailAlert = "incompleteVisit" | "unactivatedUsers";
    // type TTokenVariable = {
    //     [key: TEmailAlert]: IToken;
    // };
    interface ITokenVariable {
        unactivatedUsers: IToken;
        // overdueVisit: IToken;
        incompleteVisit: IToken;
        // unansweredQueries: IToken;
        // unacknowledgedStickyNotes: IToken;
    }

    type TFocusedField = "toAddress" | "ccAddress" | "bccAddress" | "subject" | "body" | "";

    interface IFocusedFieldDetail {
        type: TFocusedField;
        selectionStart: TNullableNumber;
        selectionEnd: TNullableNumber;
    }

    const defaultValidationErrors = (tempID: string): IValidationError => ({
        index: tempID,
        alertName: "",
        days: "",
        defaultLocale: "",
        effectiveDate: "",
    });

    const defaultEmailAlertDetails = (): IEmailAlertDetail => ({
        id: 0,
        emailAlertConfigId: 0,
        bcc: null,
        body: null,
        cc: null,
        subject: null,
        to: null,
    });

    const defaultFocusedDetails = (): IFocusedFieldDetail => ({
        selectionEnd: 0,
        selectionStart: 0,
        type: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const popupModalStore = usePopupModalStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const validationErrors = ref<TValidationErrorData<IValidationError>>({});
    const formAction = ref<TAdminFormAction>("View");
    const emailAlertSearch = ref<TNullableString>(null);
    const emailAlertDetailsModel = ref<IEmailAlertDetail>({ ...defaultEmailAlertDetails() });
    const emailAlertDetailsModelRef = ref<IEmailAlertDetail>({ ...defaultEmailAlertDetails() });
    const emailAlertDetailsErrorModel = ref<IEmailAlertDetail>({ ...defaultEmailAlertDetails() });
    const focusedFieldDetails = ref<IFocusedFieldDetail>({ ...defaultFocusedDetails() });
    // const tokenVariables = ref<TTokenVariable>({
    const tokenVariables = ref<ITokenVariable>({
        incompleteVisit: {
            emailAddress: ["Investigator", "Primary Escalation", "Secondary Escalation"],
            variables: [
                "Study Name",
                "Site Name",
                "Site Number",
                "Subject Name",
                "Folder Name",
                "Form Name",
                "Field Text",
                "Subject URL",
                "Form URL",
            ],
        },
        unactivatedUsers: {
            emailAddress: ["User"],
            variables: ["User Login"],
        },
    });
    const emailAlertType = ref<TEmailAlert>("unactivatedUsers");

    const emailAlertColumns: IColumn[] = [
        {
            field: "alertName",
            header: "Alert Name",
            icon: false,
            show: true,
        },
        {
            field: "effectiveDate",
            header: "Effective Date",
            icon: false,
            show: true,
        },
        {
            field: "days",
            header: "Days",
            icon: false,
            show: true,
        },
        {
            field: "defaultLocale",
            header: "Default Locale",
            icon: false,
            show: true,
        },
    ];
    const tableData = ref<ITableData[]>([]);
    const tableDataRef = ref<ITableData[]>(deepClone(tableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Email Alerts - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Email Alerts",
    );

    const disableAction = computed(() => checkIfEditFormActive(editFormDetails.value));

    function editForm(key: string) {
        if (!checkIfKeyExistsInObject(key, editFormDetails.value))
            editFormDetails.value[key] = true;
        else editFormDetails.value[key] = !editFormDetails.value[key];
    }

    // function addOrEditEmailAlertAction() {
    //     const tempID = uniqueID();
    //     tableData.value.unshift({
    //         id: null,
    //         alertName: null,
    //         days: null,
    //         defaultLocale: null,
    //         effectiveDate: null,
    //         tempID,
    //     });
    //     editForm(tempID);
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
        for (const [index, tableRow] of tableData.value.entries()) {
            if (rowIndex === index) {
                const obj: IValidationError = {
                    ...defaultValidationErrors(tableRow.tempID),
                };
                if (getStringLength(tableRow.alertName) === 0)
                    obj["alertName"] = "Please enter a name";
                else if (getStringLength(tableRow.alertName) > 128)
                    obj["alertName"] = "Name cannot be more than 128 characters";
                else obj["alertName"] = "";
                if (getStringLength(tableRow.effectiveDate) === 0)
                    obj["effectiveDate"] = "Please select a date";
                else obj["effectiveDate"] = "";
                if (getStringLength(tableRow.days) === 0) obj["days"] = "Please enter a day";
                else obj["days"] = "";
                if (getStringLength(tableRow.defaultLocale) === 0)
                    obj["days"] = "Please select a default locale";
                else obj["days"] = "";
                result[tableRow.tempID] = obj;
                break;
            }
        }
        validationErrors.value = setNoErrorTextIfObjectHasErrors(result);
    }

    function setTableData(tableDataItems: IEmailAlertData[]): ITableData[] {
        return tableDataItems.map((row) => ({
            id: row.id,
            branchId: row.branchId,
            alertName: row.alertName,
            days: row.days,
            defaultLocale: row.defaultLocale,
            effectiveDate: row.effectiveDate,
            tempID: uniqueID(),
        })) as ITableData[];
    }

    async function emailAlertPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await branchEmailAlertPaginationListAPI(
            getAPIFilters({
                search: emailAlertSearch.value,
                filter: {
                    branchId: props.tabData[props.activeTab.label].data.id as number,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableDataItems = setTableData(items);
            tableData.value = deepClone(tableDataItems);
            tableDataRef.value = deepClone(tableDataItems);
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

    async function saveAddOrEditEmailAlert(rowIndex: number) {
        validateAll(rowIndex);
        if (!checkIfObjectHasErrors(validationErrors.value)) {
            loading.value.form = true;
            let message = "";
            let status = 500;
            let validationErrorsData = null;
            const requestData = {
                id: tableData.value[rowIndex].id || 0,
                branchId: tableData.value[rowIndex].branchId,
                alertName: tableData.value[rowIndex].alertName as string,
                effectiveDate: getAsISOString(tableData.value[rowIndex].effectiveDate),
                days: tableData.value[rowIndex].days as number,
                defaultLocale: tableData.value[rowIndex].defaultLocale as string,
                updatedBy: 0,
            };
            if (!tableData.value[rowIndex].id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await createBranchEmailAlertAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await updateBranchEmailAlertAPI(requestData);
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
                await emailAlertPaginationList();
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

    function validateTemplateAll() {
        if (!emailAlertDetailsModel.value.to)
            emailAlertDetailsErrorModel.value.to = "Please enter a to address";
        else if (getStringLength(emailAlertDetailsModel.value.to) > 256)
            emailAlertDetailsErrorModel.value.to = "To address cannot be more than 256 characters";
        else emailAlertDetailsErrorModel.value.to = "";
        if (getStringLength(emailAlertDetailsModel.value.cc) > 256)
            emailAlertDetailsErrorModel.value.cc = "CC address cannot be more than 256 characters";
        else emailAlertDetailsErrorModel.value.cc = "";
        if (getStringLength(emailAlertDetailsModel.value.bcc) > 256)
            emailAlertDetailsErrorModel.value.bcc =
                "BCC address cannot be more than 256 characters";
        else emailAlertDetailsErrorModel.value.bcc = "";
        if (!emailAlertDetailsModel.value.subject)
            emailAlertDetailsErrorModel.value.subject = "Please enter a subject";
        else if (getStringLength(emailAlertDetailsModel.value.subject) > 256)
            emailAlertDetailsErrorModel.value.subject =
                "Subject cannot be more than 256 characters";
        else emailAlertDetailsErrorModel.value.subject = "";
        if (!emailAlertDetailsModel.value.body)
            emailAlertDetailsErrorModel.value.body = "Please enter a body";
        else emailAlertDetailsErrorModel.value.body = "";
    }

    function resetTemplateModel(closeModal?: TVoidAction) {
        formAction.value = "View";
        if (closeModal) closeModal();
        emailAlertDetailsModel.value = { ...defaultEmailAlertDetails() };
        emailAlertDetailsModelRef.value = { ...defaultEmailAlertDetails() };
        emailAlertDetailsErrorModel.value = { ...defaultEmailAlertDetails() };
    }

    async function saveTemplate(closeModal: TVoidAction) {
        validateTemplateAll();
        if (
            !checkIfModelHasErrors(emailAlertDetailsErrorModel.value, ["id", "emailAlertConfigId"])
        ) {
            loading.value.dynamicLoading["templateForm"] = true;
            let message = "";
            let status = 500;
            // let validationErrorsData = null;
            const requestData = {
                id: emailAlertDetailsModel.value.id,
                emailAlertConfigId: emailAlertDetailsModel.value.emailAlertConfigId,
                to: emailAlertDetailsModel.value.to as string,
                cc: emailAlertDetailsModel.value.cc,
                bcc: emailAlertDetailsModel.value.bcc,
                subject: emailAlertDetailsModel.value.subject as string,
                body: emailAlertDetailsModel.value.body as string,
                updatedBy: 0,
            };
            if (!emailAlertDetailsModel.value.id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    // validationErrors: apiValidationErrors,
                } = await createBranchEmailTemplateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                // validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    // validationErrors: apiValidationErrors,
                } = await updateBranchEmailTemplateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                // validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                resetTemplateModel(closeModal);
                await emailAlertPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                // if (status === 400 && validationErrorsData) {
                //     setDefaultValueByKeyIfKeyDoesNotExists(
                //         tableData.value[rowIndex].tempID,
                //         validationErrors.value,
                //         defaultValidationErrors(tableData.value[rowIndex].tempID),
                //     );
                //     setAPIValidationErrors(
                //         validationErrorsData,
                //         validationErrors.value,
                //         tableData.value[rowIndex].tempID,
                //     );
                // }
            }
            loading.value.dynamicLoading["templateForm"] = false;
        }
    }

    // async function deleteEmailAlert(emailAlertId: string) {
    //     loading.value.form = true;
    //     const { status, message } = await deleteBranchEmailAlertByIdAPI(emailAlertId);
    //     if (status === 200) {
    //         toastStore.success({
    //             title: "Success",
    //             message,
    //         });
    //         await emailAlertPaginationList();
    //     } else if (status !== 401) {
    //         toastStore.error({
    //             title: "Error",
    //             message,
    //         });
    //     }
    //     loading.value.form = false;
    // }

    function checkIfTextExists(baseText: TNullableString, text: string) {
        if (!baseText) return false;
        return baseText.includes(text);
    }

    const getTokenVariableWithSpecialCharacter = (tokenVariable: string) => `{{${tokenVariable}}}`;

    // function checkIfTokenIsUsed(tokenVariable: string, ...modelTexts: TNullableString[]) {
    //     let result = false;
    //     for (const textRow of modelTexts) {
    //         if (checkIfTextExists(textRow, getTokenVariableWithSpecialCharacter(tokenVariable))) {
    //             result = true;
    //             break;
    //         }
    //     }
    //     return result;
    // }
    function checkIfTokenIsUsedInTheModel(tokenVariable: string, model: TNullableString) {
        return checkIfTextExists(model, getTokenVariableWithSpecialCharacter(tokenVariable));
    }

    function insertTokenVariable(
        baseText: TNullableString,
        tokenVariable: string,
        selectionStart: number,
        selectionEnd: number,
        isEmailAddress: boolean = false,
    ) {
        const tokenVariableText = getTokenVariableWithSpecialCharacter(tokenVariable);
        if (!baseText && isEmailAddress) return `${tokenVariableText},`;
        if (!baseText) return tokenVariableText;
        const trimmedBaseText = baseText.trim();
        let result: string = "";
        if (
            selectionStart === 0 &&
            !checkIfTextExists(trimmedBaseText, tokenVariable) &&
            isEmailAddress
        )
            result = `${tokenVariableText}, ${trimmedBaseText}`;
        else if (selectionStart === 0 && !checkIfTextExists(trimmedBaseText, tokenVariable))
            result = `${tokenVariableText} ${trimmedBaseText}`;
        else if (
            selectionStart > 0 &&
            !checkIfTextExists(emailAlertDetailsModel.value.to, tokenVariable) &&
            isEmailAddress
        ) {
            const substring = trimmedBaseText.trim().substring(0, trimmedBaseText.length);
            result = `${substring}${substring.substring(substring.length - 1).includes(",") ? "" : ","} ${tokenVariableText}`;
        } else if (
            selectionStart > 0 &&
            !checkIfTextExists(emailAlertDetailsModel.value.to, tokenVariable)
        )
            result = `${trimmedBaseText.substring(0, selectionStart)} ${tokenVariableText} ${trimmedBaseText.substring(selectionEnd, trimmedBaseText.length)}`;

        return result;
    }

    function processSetTokenVariable(
        elementId: string,
        type: TTokenType,
        label: string,
        selectionStart: TNullableNumber,
        selectionEnd: TNullableNumber,
    ) {
        switch (elementId) {
            case "toAddress": {
                if (
                    type === "emailAddress" &&
                    !checkIfTokenIsUsedInTheModel(label, emailAlertDetailsModel.value.to)
                )
                    emailAlertDetailsModel.value.to = insertTokenVariable(
                        emailAlertDetailsModel.value.to,
                        label,
                        Number(selectionStart),
                        Number(selectionEnd),
                        true,
                    );
                break;
            }
            case "ccAddress": {
                if (
                    type === "emailAddress" &&
                    !checkIfTokenIsUsedInTheModel(label, emailAlertDetailsModel.value.cc)
                )
                    emailAlertDetailsModel.value.cc = insertTokenVariable(
                        emailAlertDetailsModel.value.cc,
                        label,
                        Number(selectionStart),
                        Number(selectionEnd),
                        true,
                    );
                break;
            }
            case "bccAddress": {
                if (
                    type === "emailAddress" &&
                    !checkIfTokenIsUsedInTheModel(label, emailAlertDetailsModel.value.bcc)
                )
                    emailAlertDetailsModel.value.bcc = insertTokenVariable(
                        emailAlertDetailsModel.value.bcc,
                        label,
                        Number(selectionStart),
                        Number(selectionEnd),
                        true,
                    );
                break;
            }
            case "subject": {
                if (
                    type === "variable" &&
                    !checkIfTokenIsUsedInTheModel(label, emailAlertDetailsModel.value.subject)
                )
                    emailAlertDetailsModel.value.subject = insertTokenVariable(
                        emailAlertDetailsModel.value.subject,
                        label,
                        Number(selectionStart),
                        Number(selectionEnd),
                        false,
                    );
                break;
            }
            case "body": {
                if (
                    type === "variable" &&
                    !checkIfTokenIsUsedInTheModel(label, emailAlertDetailsModel.value.body)
                )
                    emailAlertDetailsModel.value.body = insertTokenVariable(
                        emailAlertDetailsModel.value.body,
                        label,
                        Number(selectionStart),
                        Number(selectionEnd),
                        false,
                    );
                break;
            }
        }
    }

    function onTokenVariableDrop(event: DragEvent) {
        focusedFieldDetails.value = { ...defaultFocusedDetails() };
        const { target } = event;
        const draggedItem = parseJSON(
            event.dataTransfer!.getData("item"),
        ) as ITokenVariableDragItem;
        const targetElement = target as HTMLInputElement | HTMLTextAreaElement;
        const { label, type } = draggedItem;
        const { id, selectionStart, selectionEnd } = targetElement;

        processSetTokenVariable(id, type, label, selectionStart, selectionEnd);
        // switch (id) {
        //     case "toAddress": {
        //         if (type === "emailAddress")
        //             emailAlertDetailsModel.value.to = insertTokenVariable(
        //                 emailAlertDetailsModel.value.to,
        //                 label,
        //                 Number(selectionStart),
        //                 Number(selectionEnd),
        //                 true,
        //             );
        //         break;
        //     }
        //     case "ccAddress": {
        //         if (type === "emailAddress")
        //             emailAlertDetailsModel.value.cc = insertTokenVariable(
        //                 emailAlertDetailsModel.value.cc,
        //                 label,
        //                 Number(selectionStart),
        //                 Number(selectionEnd),
        //                 true,
        //             );
        //         break;
        //     }
        //     case "bccAddress": {
        //         if (type === "emailAddress")
        //             emailAlertDetailsModel.value.bcc = insertTokenVariable(
        //                 emailAlertDetailsModel.value.bcc,
        //                 label,
        //                 Number(selectionStart),
        //                 Number(selectionEnd),
        //                 true,
        //             );
        //         break;
        //     }
        //     case "subject": {
        //         if (type === "variable")
        //             emailAlertDetailsModel.value.subject = insertTokenVariable(
        //                 emailAlertDetailsModel.value.subject,
        //                 label,
        //                 Number(selectionStart),
        //                 Number(selectionEnd),
        //                 false,
        //             );
        //         break;
        //     }
        //     case "body": {
        //         if (type === "variable")
        //             emailAlertDetailsModel.value.body = insertTokenVariable(
        //                 emailAlertDetailsModel.value.body,
        //                 label,
        //                 Number(selectionStart),
        //                 Number(selectionEnd),
        //                 false,
        //             );
        //         break;
        //     }
        // }

        event.dataTransfer!.clearData("item");
    }

    function handleOnFocus(event: FocusEvent, type: TFocusedField) {
        const targetElement = event.target as HTMLInputElement | HTMLTextAreaElement;
        const { selectionStart, selectionEnd } = targetElement;
        focusedFieldDetails.value.type = type;
        focusedFieldDetails.value.selectionStart = selectionStart;
        focusedFieldDetails.value.selectionEnd = selectionEnd;
    }

    function handleOnTokenClick(_event: MouseEvent, slotProps: ITokenVariableDragItem) {
        const { label, type } = slotProps;
        if (focusedFieldDetails.value) {
            processSetTokenVariable(
                focusedFieldDetails.value.type,
                type,
                label,
                focusedFieldDetails.value.selectionStart,
                focusedFieldDetails.value.selectionEnd,
            );
        }
    }

    async function branchEmailTemplateDetailsByEmailConfigId(
        emailConfigId: string,
        emailAlertConfigId: number,
    ) {
        loading.value.form = true;
        const { data, message, status } =
            await branchEmailTemplateDetailsByEmailConfigIdAPI(emailConfigId);
        if (status === 200) {
            emailAlertDetailsModel.value.id = data.id;
            emailAlertDetailsModel.value.emailAlertConfigId = data.emailAlertConfigId;
            emailAlertDetailsModel.value.to = data.to;
            emailAlertDetailsModel.value.cc = data.cc;
            emailAlertDetailsModel.value.bcc = data.bcc;
            emailAlertDetailsModel.value.subject = data.subject;
            emailAlertDetailsModel.value.body = data.body;

            emailAlertDetailsModelRef.value.id = data.id;
            emailAlertDetailsModelRef.value.emailAlertConfigId = data.emailAlertConfigId;
            emailAlertDetailsModelRef.value.to = data.to;
            emailAlertDetailsModelRef.value.cc = data.cc;
            emailAlertDetailsModelRef.value.bcc = data.bcc;
            emailAlertDetailsModelRef.value.subject = data.subject;
            emailAlertDetailsModelRef.value.body = data.body;
        } else {
            toastStore.error({
                title: "error",
                message,
            });
            emailAlertDetailsModel.value.id = 0;
            emailAlertDetailsModel.value.emailAlertConfigId = emailAlertConfigId;
            emailAlertDetailsModel.value.to = null;
            emailAlertDetailsModel.value.cc = null;
            emailAlertDetailsModel.value.bcc = null;
            emailAlertDetailsModel.value.subject = null;
            emailAlertDetailsModel.value.body = null;

            emailAlertDetailsModelRef.value.id = 0;
            emailAlertDetailsModelRef.value.emailAlertConfigId = emailAlertConfigId;
            emailAlertDetailsModelRef.value.to = null;
            emailAlertDetailsModelRef.value.cc = null;
            emailAlertDetailsModelRef.value.bcc = null;
            emailAlertDetailsModelRef.value.subject = null;
            emailAlertDetailsModelRef.value.body = null;
        }
        loading.value.form = false;
    }

    async function handleConfiguration(data: ITableData) {
        await branchEmailTemplateDetailsByEmailConfigId(String(data.id), Number(data.id));
        if (data.alertName === "Unactivated Users Alert") emailAlertType.value = "unactivatedUsers";
        else if (
            [
                "Upcoming Visit Alert",
                "Overdue Visit Alert",
                "Incomplete Visit Alert",
                "Unanswered Queries Alert",
                "Unacknowleged Sticky Notes Alert",
            ].includes(data.alertName as string)
        )
            emailAlertType.value = "incompleteVisit";
        formAction.value = "Update";
        popupModalStore.show("adminEmailAlertConfigModal");
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        tableData.value,
        tableDataRef.value,
    );

    const { isModelChanged: isTemplateModelChanged } = useUnsavedAlert(
        emailAlertDetailsModel.value,
        emailAlertDetailsModelRef.value,
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
        () => isTemplateModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset") {
                if (isModelChanged.value) {
                    tableData.value = deepClone(tableDataRef.value);
                    resetEditFormDetails();
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isTemplateModelChanged.value) {
                    resetTemplateModel();
                    unsavedAlertStore.triggerFormActionAlert = "none";
                }
                popupModalStore.hide("adminEmailAlertConfigModal");
            }
        },
    );

    onMounted(async () => {
        loading.value.setDynamicLoading(["templateForm"]);
        await emailAlertPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <!-- <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-pressable
                            container-class="!justify-start"
                            slot-wrapper-class="flex flex-row items-center gap-[0.5rem]"
                            :disabled="loading.isDisabled()"
                            :on-click="() => addOrEditEmailAlertAction()"
                        >
                            <edc-icon
                                icon="circle-plus"
                                class="h-[1.5rem] fill-[var(--color-secondary)]"
                            />
                            <span class="text-[1.3rem] secondary-text">Add Email Alert</span>
                        </edc-pressable>
                    </div> -->
                    <div>
                        <edc-data-table
                            :columns="emailAlertColumns"
                            :table-data="tableData"
                            :loading="loading.table"
                            pagination-type="none"
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
                                        :key="`alertName-${data.tempID}`"
                                        v-model="data.alertName"
                                        type="text"
                                        placeholder="Enter name *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="true"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].alertName
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[19rem]"
                                >
                                    <edc-calendar
                                        :key="`effectiveDate-${data.tempID}`"
                                        v-model="data.effectiveDate"
                                        picker-placement="bottom"
                                        :picker-offset="0"
                                        picker-class="min-w-[15rem]"
                                        label-class="admin-input-font"
                                        placeholder="Choose a date *"
                                        input-class="admin-input-font"
                                        format="DD MMM YYYY"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].effectiveDate
                                                : ''
                                        "
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-text-input
                                        :key="`days-${data.tempID}`"
                                        v-model="data.days"
                                        type="number"
                                        placeholder="Enter number *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].days
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-dropdown
                                        :key="`defaultLocale-${data.tempID}`"
                                        v-model="data.defaultLocale"
                                        container-class="w-[20rem]"
                                        :options="[{ label: 'English', value: 'English' }]"
                                        :default-value="
                                            isEditable(data.tempID, editFormDetails)
                                                ? 'Locale'
                                                : 'No Site group'
                                        "
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[20rem]"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].defaultLocale
                                                : ''
                                        "
                                    />
                                </td>
                            </template>
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table"
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
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-pressable
                                    v-if="isEditable(data.tempID, editFormDetails)"
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await saveAddOrEditEmailAlert(index);
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
                                    loader-type="table-save"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
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
                                            else tableData[index] = deepClone(tableDataRef[index]);
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
                                <edc-pressable
                                    v-if="
                                        !isEditable(data.tempID, editFormDetails) && !disableAction
                                    "
                                    loader-type="table"
                                    :container-class="
                                        !isEditable(data.tempID, editFormDetails)
                                            ? 'mt-[0.5rem]'
                                            : ''
                                    "
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => {
                                            await handleConfiguration(data);
                                        }
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Configuration'"
                                        icon="email-configuration"
                                        fill="var(--color-secondary)"
                                        class="!h-[1.7rem]"
                                    />
                                </edc-pressable>
                                <!-- <edc-delete-confirmation
                                    v-if="!isEditable(data.tempID, editFormDetails) && data.id"
                                    message="Are you sure you want to delete this site?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        () => {}
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
                                            :on-click="async () => {
                                                await deleteEmailAlert(String(data.id));
                                            }"
                                        >
                                            <edc-icon
                                                icon="close-icon"
                                                class="stroke-[var(--color-error)] !w-[1.1rem] !h-[1.1rem]"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation> -->
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
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        v-if="formAction !== 'View'"
        modal-id="adminEmailAlertConfigModal"
        :on-cancel="(closeModal) => resetTemplateModel(closeModal)"
        :on-submit="async (closeModal) => await saveTemplate(closeModal)"
    >
        <div class="min-w-[50vw] flex flex-col">
            <span class="text-[1.2rem] font-semibold self-start"
                >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>)
                are required.</span
            >
            <span class="text-[1.2rem] font-semibold self-start"
                >For using token, please click on a field & click on a token or drag and drop the
                token onto a input field</span
            >
            <div class="flex flex-row items-center gap-[2rem] mt-[1rem]">
                <div class="flex flex-col gap-[0.1rem] w-[10%]">
                    <h4 class="font-semibold admin-input-font">Email Tokens</h4>
                    <!-- <span class="admin-input-font">(Drag)</span> -->
                </div>
                <div
                    class="flex flex-row flex-wrap w-full items-center gap-[0.5rem] px-[1rem] py-[0.5rem] border-[0.1rem] border-[var(--color-border)] rounded-[var(--border-radius-4)]"
                >
                    <!-- :is-token-used="
                            checkIfTokenIsUsed(
                                label,
                                emailAlertDetailsModel.to,
                                emailAlertDetailsModel.cc,
                                emailAlertDetailsModel.bcc,
                            )
                        " -->
                    <admin-email-token-variable
                        v-for="label of tokenVariables[emailAlertType].emailAddress"
                        :key="label"
                        :label="label"
                        type="emailAddress"
                        @on-click="
                            (event: MouseEvent, slotProps: ITokenVariableDragItem) => {
                                handleOnTokenClick(event, slotProps);
                            }
                        "
                    />
                </div>
            </div>
            <div
                class="grid grid-cols-1 gap-x-[5rem] gap-y-[1rem]"
                @drop="onTokenVariableDrop($event)"
                @dragover.prevent
                @dragenter.prevent
            >
                <edc-text-input
                    v-model="emailAlertDetailsModel.to"
                    element-id="toAddress"
                    container-class="w-full"
                    type="text"
                    label="To"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :required="true"
                    :disabled="loading.isDisabled()"
                    :error="emailAlertDetailsErrorModel.to"
                    @on-focus="
                        (event: FocusEvent) => {
                            handleOnFocus(event, 'toAddress');
                        }
                    "
                />
                <edc-text-input
                    v-model="emailAlertDetailsModel.cc"
                    element-id="ccAddress"
                    container-class="w-full"
                    type="text"
                    label="CC"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                    :error="emailAlertDetailsErrorModel.cc"
                    @on-focus="
                        (event: FocusEvent) => {
                            handleOnFocus(event, 'ccAddress');
                        }
                    "
                />
                <edc-text-input
                    v-model="emailAlertDetailsModel.bcc"
                    element-id="bccAddress"
                    container-class="w-full"
                    type="text"
                    label="BCC"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :disabled="loading.isDisabled()"
                    :error="emailAlertDetailsErrorModel.bcc"
                    @on-focus="
                        (event: FocusEvent) => {
                            handleOnFocus(event, 'bccAddress');
                        }
                    "
                />
                <edc-text-input
                    v-model="emailAlertDetailsModel.subject"
                    element-id="subject"
                    container-class="w-full"
                    type="text"
                    label="Subject"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :required="true"
                    :disabled="loading.isDisabled()"
                    :error="emailAlertDetailsErrorModel.subject"
                    @on-focus="
                        (event: FocusEvent) => {
                            handleOnFocus(event, 'subject');
                        }
                    "
                />
                <div class="flex flex-row gap-[2rem]">
                    <div class="flex flex-col gap-[0.1rem] w-[10%]">
                        <h4 class="font-semibold admin-input-font">Variable Tokens</h4>
                        <!-- <span class="admin-input-font">(Drag)</span> -->
                    </div>
                    <!-- :is-token-used="
                                checkIfTokenIsUsed(
                                    label,
                                    emailAlertDetailsModel.subject,
                                    emailAlertDetailsModel.body,
                                )
                            " -->
                    <div
                        class="flex flex-row items-center flex-wrap gap-[0.5rem] w-full px-[1rem] py-[0.5rem] border-[0.1rem] border-[var(--color-border)] rounded-[var(--border-radius-4)]"
                    >
                        <admin-email-token-variable
                            v-for="label of tokenVariables[emailAlertType].variables"
                            :key="label"
                            :label="label"
                            type="variable"
                            @on-click="
                                (event: MouseEvent, slotProps: ITokenVariableDragItem) => {
                                    handleOnTokenClick(event, slotProps);
                                }
                            "
                        />
                    </div>
                </div>
                <edc-text-area
                    v-model="emailAlertDetailsModel.body"
                    element-id="body"
                    container-class="w-full"
                    label="Body"
                    label-class="font-bold admin-input-font"
                    input-class="admin-input-font"
                    :required="true"
                    :disabled="loading.isDisabled()"
                    :error="emailAlertDetailsErrorModel.body"
                    @on-focus="
                        (event: FocusEvent) => {
                            handleOnFocus(event, 'body');
                        }
                    "
                />
            </div>
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
