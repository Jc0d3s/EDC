<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import { controlTypesListAPI } from "~/services/apis/handlers/admin/form-field";
    import {
        subjectDeleteAPI,
        subjectDetailsBySubjectIdAPI,
        subjectPaginationListAPI,
        subjectUpdateAPI,
    } from "~/services/apis/handlers/admin/subject";
    import type { ISubjectFormConfigData } from "~/services/apis/handlers/types/subject-form-config-types";
    import type {
        ISubjectData,
        ISubjectDetail,
    } from "~/services/apis/handlers/types/subject-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    // import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IWinFormProps,
        TAdminFormAction,
        TEditFormDetail,
        TNullableDate,
        TNullableString,
        TTableData,
        TTableLoaderDetail,
        TValidationErrorData,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    // import EdcTextInput from "../EdcTextInput.vue";
    // import EdcTextArea from "../EdcTextArea.vue";
    // import EdcCalendar from "../EdcCalendar.vue";
    // import EdcCheckbox from "../EdcCheckbox.vue";
    // import EdcDropdown from "../EdcDropdown.vue";
    // import EdcRadio from "../EdcRadio.vue";
    // import EdcFileUpload from "../EdcFileUpload.vue";
    import usePopupModalStore from "~/stores/popup-modal";
    import { subjectFormConfigListByTrialIdAPI } from "~/services/apis/handlers/admin/subject-form-config";
    import type {
        ICalendarProps,
        IDropdownProps,
        IFormGeneration,
        ITextAreaProps,
        ITextInputProps,
        TModelValue,
    } from "~/types/form-generation";
    import { SUBJECT_GENDER_OPTIONS } from "~/constants/options";
    import { formFieldsSlot } from "~/utils/form-generation";
    import useGlobalStore from "~/stores/global";

    // const formFieldsSlot: Record<number, Component> = {
    //     1: EdcTextInput,
    //     2: EdcTextArea,
    //     3: EdcCalendar,
    //     4: EdcCalendar,
    //     5: EdcCalendar,
    //     6: EdcCheckbox,
    //     7: EdcDropdown,
    //     8: EdcRadio,
    //     9: EdcRadio,
    //     10: EdcFileUpload,
    //     // 11: , // Signature
    // };

    // interface ITableData {
    //     id: number;
    //     studyId: number;
    //     trialId: number;
    //     trialName: string;
    //     subjectFormConfigId: number;
    //     subjectId: number;
    //     label: string;
    //     value: TNullableString;
    //     fieldValue: TNullableString;
    // }

    interface ISubjectFormDetails extends IFormGeneration {
        subjectFormConfigId: number;
        controlTypeId: number;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const popupModalStore = usePopupModalStore();
    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const formAction = ref<TAdminFormAction>("View");
    const loading = ref<Loading>(new Loading());
    const editFormDetails = ref<TEditFormDetail>({});
    const subjectColumns = ref<IColumn[]>([]);
    const validationErrors = ref<TValidationErrorData<string>>({});
    const subjectSearch = ref<TNullableString>(null);
    const controlTypeOptions = ref<DropdownOption>(new DropdownOption());
    const subjectFormConfigList = ref<ISubjectFormConfigData[]>([]);
    const subjectDetails = ref<ISubjectData | null>(null);
    const subjectFormDetails = ref<ISubjectFormDetails[]>([]);
    const subjectFormDetailsRef = ref<ISubjectFormDetails[]>([]);
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const tableData = ref<TTableData[]>([]);
    const tableDataRef = ref<TTableData[]>(deepClone(tableData.value));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Subjects - ${props.tabData[props.activeTab.label].data.studyName} (${props.tabData[props.activeTab.label].data.siteName})`
            : "Subjects",
    );

    const controlTypeLookups = computed(() =>
        getOptionsList(controlTypeOptions.value.options, "name", "id"),
    );

    // function setTableData(processedTableData: ISubjectData[]): ITableData[] {
    //     return processedTableData.map((row) => ({
    //         ...row
    //     })) as ITableData[];
    // }

    // function setTableColumns(columnsData: ISubjectData[]) {
    //     const result: IColumn[] = [];
    //     for (const row of columnsData) {
    //         result.push({
    //             field: "value",
    //             header: row.label,
    //             icon: false,
    //             show: true,
    //         });
    //     }
    //     subjectColumns.value = deepClone(result);
    // }

    function resetFormModel(closeModal?: TVoidAction) {
        formAction.value = "View";
        if (closeModal) closeModal();
        subjectFormDetails.value = [];
        subjectFormDetailsRef.value = [];
        subjectDetails.value = null;
    }

    function setTableColumns() {
        const result: IColumn[] = [];
        if (getArrayLength(subjectFormConfigList.value) > 0) {
            for (const row of subjectFormConfigList.value) {
                result.push({
                    field: "fieldValue",
                    header: row.label,
                    icon: false,
                    show: true,
                });
            }
        } else {
            result.push({
                field: "fieldValue",
                header: "Subject ID",
                icon: false,
                show: true,
            });
        }
        result.splice(1, 0, {
            field: "statusName",
            header: "Subject Status",
            icon: false,
            show: true,
        });
        subjectColumns.value = deepClone(result);
    }

    function getSubjectFormConfigIdByLabel(
        subjectDetailsList: ISubjectDetail[],
        formConfigLabel: string,
    ) {
        let formConfigId = -1;
        for (const row of subjectDetailsList) {
            if (row.label === formConfigLabel) {
                formConfigId = Number(row.subjectFormConfigId);
                break;
            }
        }
        return formConfigId;
    }

    function setTableData(data: ISubjectData[]) {
        const result: TTableData = [];
        for (const row of data) {
            const obj: Record<string, any> = {
                id: row.subjectId,
                statusName: row.statusName,
            };

            // if (row.subjectDetails) {
            //     for (const subRow of row.subjectDetails) {
            //         const subjectFormConfigDetails = getFilteredItems({
            //             data: subjectFormConfigList.value,
            //             type: "object",
            //             key: "id",
            //             value: subRow.subjectFormConfigId,
            //         }) as ISubjectFormConfigData[];
            //         if (getArrayLength(subjectFormConfigDetails) > 0)
            //             obj[subRow.label] = [3, 4, 5].includes(
            //                 subjectFormConfigDetails[0].controlTypeId,
            //             )
            //                 ? formatDate(subRow.fieldValue as TNullableDate, "DD MMM YYYY")
            //                 : subRow.fieldValue;
            //         else obj[subRow.label] = subRow.fieldValue;
            //     }
            // }
            if (row.dynamicProperties && getArrayLength(Object.keys(row.dynamicProperties)) > 0) {
                for (const [fieldLabel, fieldValue] of Object.entries(row.dynamicProperties)) {
                    const subjectFormConfigDetails = getFilteredItems({
                        data: subjectFormConfigList.value,
                        type: "object",
                        key: "id",
                        value: getSubjectFormConfigIdByLabel(row.subjectDetails, fieldLabel),
                    }) as ISubjectFormConfigData[];
                    if (getArrayLength(subjectFormConfigDetails) > 0)
                        // obj[`${subjectFormConfigDetails[0].orderNumber}_${fieldLabel}`] = [3, 4, 5].includes(
                        obj[fieldLabel] = [3, 4, 5].includes(
                            subjectFormConfigDetails[0].controlTypeId,
                        )
                            ? formatDate(fieldValue as TNullableDate, "DD MMM YYYY")
                            : fieldValue;
                    else obj[fieldLabel] = fieldValue;
                }
            }
            result.push({ ...obj });
        }
        return result;
    }

    async function subjectPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await subjectPaginationListAPI(
            getAPIFilters({
                search: subjectSearch.value,
                filter: {
                    studySiteId: props.tabData[props.activeTab.label].data.id as number,
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            // const processedTableData = setTableData(items);
            // setTableColumns(items);
            const tableDataItems = setTableData(items);
            tableLoaderDetails.value = setLoaderForArrayDatas(Object.keys(tableDataItems));
            tableData.value = deepClone(tableDataItems);
            tableDataRef.value = deepClone(tableDataItems);
        } else if (status !== 401) {
            subjectColumns.value = [];
            tableData.value = [];
            tableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function resetEditFormDetails(formLabelId?: string) {
        if (formLabelId) {
            deleteObjectPropertyByKey(formLabelId, validationErrors.value);
        } else {
            validationErrors.value = {};
        }
    }

    function validateAll() {
        let isError = false;
        for (const [index, subjectFormDetailRow] of subjectFormDetails.value.entries()) {
            let errorText: TNullableString = null;
            const subjectFormConfigDetails = getFilteredItems({
                data: subjectFormConfigList.value,
                type: "object",
                key: "id",
                value: subjectFormDetailRow.subjectFormConfigId,
            }) as ISubjectFormConfigData[];
            if (subjectFormConfigDetails[0].isMandatory && !subjectFormDetailRow.modelValue) {
                errorText = `Please ${subjectFormConfigDetails[0].controlTypeId === 7 ? "select" : "enter"} a ${convertToLowerCase(subjectFormConfigDetails[0].label)}`;
            }
            if (
                subjectFormDetailRow.modelValue &&
                getStringLength(String(subjectFormDetailRow.modelValue)) > 1000
            )
                errorText = `${capitalizeWord(subjectFormConfigDetails[0].label, true)} cannot be more than 1000 characters`;
            if (getStringLength(errorText) > 0 && !isError) isError = true;
            subjectFormDetailRow.error = errorText;
            subjectFormDetailsRef.value[index].error = errorText;
        }
        return isError;
    }

    function getFieldValueByControlType(controlTypeId: number, fieldValue: TModelValue) {
        if ([3, 4, 5].includes(controlTypeId) && fieldValue)
            return getAsISOString(fieldValue as TNullableDate);
        return fieldValue ? String(fieldValue) : null;
    }

    function getSubjectDetailsAPIData() {
        const result: ISubjectDetail[] = [];
        for (const formRow of subjectFormDetails.value) {
            const subjectDetailsBySubjectFormId = getFilteredItems({
                data: subjectDetails.value ? subjectDetails.value.subjectDetails : [],
                type: "object",
                key: "subjectFormConfigId",
                value: formRow.subjectFormConfigId,
            });
            result.push({
                id:
                    getArrayLength(subjectDetailsBySubjectFormId) > 0
                        ? subjectDetailsBySubjectFormId[0].id
                        : 0,
                fieldValue: getFieldValueByControlType(formRow.controlTypeId, formRow.modelValue),
                subjectFormConfigId: formRow.subjectFormConfigId,
                subjectId:
                    getArrayLength(subjectDetailsBySubjectFormId) > 0
                        ? subjectDetailsBySubjectFormId[0].subjectId
                        : 0,
                format: null,
                isActive: false,
                isMandatory: false,
                isSpecify: false,
                label: "",
                orderNumber: 0,
                updatedBy: 0,
            });
        }
        return deepClone(result) as ISubjectDetail[];
    }

    async function saveAddOrEditSubject(closeModal: TVoidAction) {
        const isValidationError = validateAll();
        if (!isValidationError) {
            let message = "";
            let status = 500;
            // let validationErrorsData = null;
            const requestData = {
                id: subjectDetails.value ? subjectDetails.value.id : 0,
                fieldValue: subjectDetails.value ? subjectDetails.value.fieldValue : "",
                format: subjectDetails.value ? subjectDetails.value.format : "",
                isActive: subjectDetails.value ? subjectDetails.value.isActive : false,
                isMandatory: subjectDetails.value ? subjectDetails.value.isMandatory : false,
                isSpecify: subjectDetails.value ? subjectDetails.value.isSpecify : false,
                label: subjectDetails.value ? subjectDetails.value.label : "",
                orderNumber: subjectDetails.value ? subjectDetails.value.orderNumber : 0,
                studyId: subjectDetails.value
                    ? subjectDetails.value.studyId
                    : props.tabData[props.activeTab.label].data.studyId,
                subjectDetails: getSubjectDetailsAPIData(),
                subjectFormConfigId: subjectDetails.value ? subjectDetails.value.studyId : 0,
                subjectId: subjectDetails.value ? subjectDetails.value.studyId : 0,
                trialId: subjectDetails.value
                    ? subjectDetails.value.trialId
                    : props.tabData[props.activeTab.label].data.id,
                trialName: subjectDetails.value
                    ? subjectDetails.value.trialName
                    : props.tabData[props.activeTab.label].data.trialName,
                siteId: subjectDetails.value
                    ? subjectDetails.value.siteId
                    : props.tabData[props.activeTab.label].data.siteId,
                siteName: subjectDetails.value ? subjectDetails.value.siteName : "",
                statusId: null,
                statusName: "",
                value: subjectDetails.value ? subjectDetails.value.value : "",
                updatedBy: 0,
                lastUpdated: null,
                dynamicProperties: {},
            };
            const {
                message: apiMessage,
                status: apiStatus,
                // validationErrors: apiValidationErrors,
            } = await subjectUpdateAPI([requestData]);
            message = apiMessage;
            status = apiStatus;
            // validationErrorsData = apiValidationErrors;
            // if (!requestData.id) {
            //     const {
            //         message: apiMessage,
            //         status: apiStatus,
            //         validationErrors: apiValidationErrors,
            //     } = await subjectCreateAPI(requestData);
            //     message = apiMessage;
            //     status = apiStatus;
            //     validationErrorsData = apiValidationErrors;
            // } else {
            //     const {
            //         message: apiMessage,
            //         status: apiStatus,
            //         validationErrors: apiValidationErrors,
            //     } = await subjectUpdateAPI(requestData);
            //     message = apiMessage;
            //     status = apiStatus;
            //     validationErrorsData = apiValidationErrors;
            // }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                closeModal();
                resetFormModel();
                resetEditFormDetails();
                await subjectPaginationList();
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
            loading.value.form = false;
        }
    }

    async function onFormSubmit(closeModal: TVoidAction) {
        await saveAddOrEditSubject(closeModal);
    }

    async function subjectFormConfigListByTrialId() {
        loading.value.dynamicLoading["subjectFormConfigList"] = true;
        const { status, message, data } = await subjectFormConfigListByTrialIdAPI(
            String(props.tabData[props.activeTab.label].data.studyId),
        );
        if (status === 200) {
            subjectFormConfigList.value = deepClone(data);
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            subjectFormConfigList.value = [];
        }
        loading.value.dynamicLoading["subjectFormConfigList"] = false;
    }

    function processFormGeneration() {
        const result: ISubjectFormDetails[] = [];
        for (const formConfigRow of subjectFormConfigList.value) {
            const controlTypeDetails = getFilteredItems({
                data: controlTypeLookups.value,
                type: "object",
                key: "value",
                value: formConfigRow.controlTypeId,
            });
            const subjectDetailsBySubjectFormId = getFilteredItems({
                data: subjectDetails.value ? subjectDetails.value.subjectDetails : [],
                type: "object",
                key: "subjectFormConfigId",
                value: formConfigRow.id,
            });
            let formObj: Record<string, any> = {
                subjectFormConfigId: formConfigRow.id,
                modelValue: formConfigRow.defaultValue
                    ? formConfigRow.defaultValue
                    : getArrayLength(subjectDetailsBySubjectFormId) > 0
                      ? subjectDetailsBySubjectFormId[0].fieldValue
                      : null,
                controlTypeId: formConfigRow.controlTypeId,
                labelClass: "font-bold admin-input-font",
                label: formConfigRow.label,
                containerClass: "w-[34rem]",
                showHelpText: !!formConfigRow.helpText,
                helpText: formConfigRow.helpText,
                disabled: formConfigRow.readOnly,
            };
            const { type, fractionalPart, maxLength, minLength, wholePart, dateFormat } =
                getValidationPropsDetails(formConfigRow.format, controlTypeDetails[0].value);
            if (getArrayLength(controlTypeDetails) > 0) {
                if (controlTypeDetails[0].value === 1) {
                    formObj = {
                        ...formObj,
                        type,
                        // elementId,
                        error: null,
                        inputClass: "admin-input-font",
                        // inputContainerClass,
                        minLength,
                        maxLength,
                        wholePart,
                        fractionalPart,
                        placeholder: `Please enter a ${convertToLowerCase(formConfigRow.label)}`,
                        // readOnly: false,
                        required: formConfigRow.isMandatory,
                    } as ITextInputProps;
                } else if (controlTypeDetails[0].value === 7) {
                    formObj = {
                        ...formObj,
                        options: formConfigRow.label === "Gender" ? SUBJECT_GENDER_OPTIONS : [],
                        defaultValue: `Please select a ${convertToLowerCase(formConfigRow.label)}`,
                        // elementId,
                        enableClear: !formConfigRow.isMandatory,
                        error: null,
                        inputClass: "admin-input-font",
                        // inputContainerClass,
                        // labelAction,
                        loading: false,
                        optionClass: "w-[34rem]",
                        // optionOffset,
                        optionPlacement: "bottom",
                        // optionPosition,
                        // readOnly,
                        required: formConfigRow.isMandatory,
                        // resetOption,
                    } as IDropdownProps;
                } else if (controlTypeDetails[0].value === 2) {
                    formObj = {
                        ...formObj,
                        // cols,
                        // elementId,
                        // ellipseCount,
                        error: null,
                        inputClass: "admin-input-font",
                        // inputContainerClass,
                        // max,
                        placeholder: `Please enter a ${convertToLowerCase(formConfigRow.label)}`,
                        // readOnly,
                        required: formConfigRow.isMandatory,
                        // rows,
                        // showCharacterCount,
                    } as ITextAreaProps;
                } else if ([3, 4, 5].includes(controlTypeDetails[0].value)) {
                    formObj = {
                        ...formObj,
                        disabledDates: [],
                        // elementId,
                        error: null,
                        format: dateFormat,
                        inputClass: "admin-input-font",
                        // maxDate,
                        // minDate,
                        pickerClass: "w-[34rem]",
                        pickerOffset: 0,
                        pickerPlacement: "bottom",
                        // pickerPosition,
                        placeholder: `Please select a ${convertToLowerCase(formConfigRow.label)}`,
                        // readOnly,
                        required: formConfigRow.isMandatory,
                        type:
                            controlTypeDetails[0].value === 3
                                ? "date"
                                : controlTypeDetails[0].value === 4
                                  ? "time"
                                  : "datetime",
                    } as ICalendarProps;
                }
            }
            result.push({ ...(formObj as ISubjectFormDetails) });
        }
        subjectFormDetails.value = deepClone(result);
        subjectFormDetailsRef.value = deepClone(result);
    }

    async function subjectDetailsBySubjectId(subjectId: number) {
        loading.value.form = true;
        const { message, data, status } = await subjectDetailsBySubjectIdAPI(subjectId);
        if (status === 200) {
            subjectDetails.value = deepClone(data);
        } else {
            toastStore.error({
                title: "Error",
                message,
            });
            subjectDetails.value = null;
        }
        loading.value.form = false;
    }

    async function addOrEditSubjectAction(type: TAdminFormAction, trialDetails?: TTableData) {
        loading.value.dynamicLoading["formGeneration"] = true;
        formAction.value = type;
        popupModalStore.show("adminSubjectModal");
        if (type === "Update") {
            await subjectDetailsBySubjectId(trialDetails ? Number(trialDetails.id) : 0);
        }
        // if (getArrayLength(subjectFormConfigList.value) === 0)
        //     await Promise.all([subjectFormConfigListByTrialId()]);

        processFormGeneration();
        loading.value.dynamicLoading["formGeneration"] = false;
    }

    async function deleteSubject(subjectId: string) {
        loading.value.form = true;
        const { status, message } = await subjectDeleteAPI(subjectId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await subjectPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function controlTypesList() {
        controlTypeOptions.value.loading = true;
        const { status, data, message } = await controlTypesListAPI();
        if (status === 200) {
            controlTypeOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            controlTypeOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        controlTypeOptions.value.loading = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        subjectFormDetails.value,
        subjectFormDetailsRef.value,
    );

    watch(
        () => subjectFormDetails.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = subjectFormDetailsRef.value;
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
                subjectFormDetails.value = deepClone(subjectFormDetailsRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
                popupModalStore.hide("adminSubjectModal");
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading(["subjectFormConfigList", "formGeneration"]);
        Promise.all([subjectFormConfigListByTrialId(), controlTypesList()]).then(async () => {
            setTableColumns();
            await subjectPaginationList();
        });
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit flex flex-row items-center gap-[1rem]">
                        <edc-search-bar
                            v-model="subjectSearch"
                            element-id="subjectSearch"
                            class="w-fit"
                            :disabled="loading.isDisabled()"
                            input-class="admin-input-font"
                            @on-search="
                                async () => {
                                    await subjectPaginationList();
                                    useGlobalStore().triggerSearchBarRefocus('#subjectSearch');
                                }
                            "
                        />
                        <admin-action-label
                            icon="circle-plus"
                            text="Add Subject"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                async () => {
                                    await addOrEditSubjectAction('Add');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="subjectColumns"
                            :table-data="tableData"
                            :loading="loading.table"
                            pagination-type="none"
                            search-key="subjectSearch"
                            table-style="outlined"
                            :enable-row-click="false"
                            :custom-content="false"
                            action-row-class="min-w-[12rem] max-w-[12rem]"
                            :disabled="loading.isDisabled()"
                        >
                            <!-- <template #custom-content="{ data }">
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                >
                                    <edc-text-input
                                        :key="`label-${data.tempID}`"
                                        v-model="data.label"
                                        
                                        type="text"
                                        placeholder="Enter label *"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].label
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                >
                                    <edc-dropdown
                                        :key="`controlType-${data.tempID}`"
                                        v-model="data.controlTypeId"
                                        
                                        :options="controlTypeLookups"
                                        default-value="Select an control type *"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="w-[18rem]"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].controlTypeId
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[25rem]"
                                >
                                    <edc-text-area
                                        :key="`helpText-${data.tempID}`"
                                        v-model="data.helpText"
                                        
                                        placeholder="Enter help text"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].helpText
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                >
                                    <edc-text-input
                                        :key="`format-${data.tempID}`"
                                        v-model="data.format"
                                        
                                        type="text"
                                        placeholder="Enter format"
                                        label-class="admin-input-font"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].format
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-checkbox
                                        :key="`isSpecify-${data.tempID}`"
                                        v-model="data.isSpecify"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isSpecify"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isSpecify
                                                : ''
                                        "
                                    />
                                </td>
                                <td
                                    valign="top"
                                    class="font-normal text-left font-12 custom-row w-[15rem]"
                                >
                                    <edc-checkbox
                                        :key="`isMandatory-${data.tempID}`"
                                        v-model="data.isMandatory"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isMandatory"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isMandatory
                                                : ''
                                        "
                                    />
                                </td>
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <edc-checkbox
                                        :key="`isActive-${data.tempID}`"
                                        v-model="data.isActive"
                                        :container-class="
                                            !isEditable(data.tempID, editFormDetails)
                                                ? 'mt-[0.7rem]'
                                                : ''
                                        "
                                        name="isActive"
                                        :read-only="!isEditable(data.tempID, editFormDetails)"
                                        :error="
                                            checkIfKeyExistsInObject(data.tempID, validationErrors)
                                                ? validationErrors[data.tempID].isActive
                                                : ''
                                        "
                                    />
                                </td>
                            </template> -->
                            <template #action="{ data, index }">
                                <edc-pressable
                                    v-if="!isEditable(data.tempID, editFormDetails)"
                                    loader-type="table"
                                    :disabled="loading.isDisabled()"
                                    :on-click="
                                        async () => await addOrEditSubjectAction('Update', data)
                                    "
                                >
                                    <edc-icon
                                        v-tooltip.top="'Update'"
                                        icon="edit"
                                        fill="var(--color-secondary)"
                                        :class="`${commonActionIconClasses('Update')}`"
                                    />
                                </edc-pressable>
                                <edc-delete-confirmation
                                    v-if="!isEditable(data.tempID, editFormDetails) && data.id"
                                    :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                    message="Are you sure you want to delete this label?"
                                    :disabled="loading.isDisabled()"
                                    :on-delete="
                                        async () => {
                                            tableLoaderDetails[index] = true;
                                            await deleteSubject(String(data.id));
                                            tableLoaderDetails[index] = false;
                                        }
                                    "
                                >
                                    <template #icon>
                                        <edc-pressable
                                            loader-type="table"
                                            :disabled="loading.isDisabled()"
                                            :show-loader="tableLoaderDetails[index]"
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Delete'"
                                                icon="close-icon"
                                                class="stroke-[var(--color-error)] !w-[1.1rem] !h-[1.1rem]"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-delete-confirmation>
                            </template>
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <edc-popup-modal
            modal-id="adminSubjectModal"
            :submit-label="formAction"
            :on-cancel="
                (closeModal) => {
                    resetFormModel(closeModal);
                }
            "
            :on-submit="async (closeModal) => await onFormSubmit(closeModal)"
        >
            <!-- <div class="flex flex-col items-start w-[30rem] gap-[0.5rem]"> -->
            <span class="text-[1.2rem] font-semibold self-start"
                >Fields marked with an asterisk (<span class="text-[var(--color-error)]">*</span>)
                are required</span
            >
            <div class="grid grid-cols-3 gap-x-[5rem] gap-y-[1rem]">
                <template v-if="loading.dynamicLoading['formGeneration']">
                    <admin-form-skeleton-loader
                        v-for="count of [1, 2, 3, 4, 5, 6]"
                        :key="count"
                        container-class="w-[34rem] h-[3.2rem] my-[1rem]"
                    />
                </template>
                <template v-else-if="getArrayLength(subjectFormDetails) > 0">
                    <template v-for="(formDetails, index) of subjectFormDetails" :key="index">
                        <component
                            :is="formFieldsSlot[formDetails.controlTypeId]"
                            v-bind="formDetails"
                            v-model="formDetails.modelValue"
                        />
                    </template>
                </template>
                <template v-else>
                    <span class="text-[1.2rem] font-normal self-start"
                        >No form config is available. Please do contact the admin</span
                    >
                </template>
            </div>
        </edc-popup-modal>
    </div>
</template>

<style scoped></style>
