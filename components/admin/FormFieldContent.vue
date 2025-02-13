<script setup lang="ts">
    import FormField, { type IMenuList } from "~/services/apis/data/admin/form-field";
    import FormFieldVariable from "~/services/apis/data/admin/form-field-variable";
    import FormFieldEditCheck from "~/services/apis/data/admin/form-field-edit-check";
    import FormEditCheck from "~/services/apis/data/admin/form-edit-check";
    import FormDerivation from "~/services/apis/data/admin/form-derivation";
    import FormFieldPatientCloudOption from "~/services/apis/data/admin/form-field-patient-cloud-option";
    import type {
        IDictionaryDetails,
        IOptions,
        IWinFormProps,
        TDataCollectionFormDetails,
        TNullableNumber,
        TNullableString,
        TOptionValue,
        TRestrictionEntry,
        TTableLoaderDetail,
        TVoidAction,
    } from "~/types/common";
    import type { IColumn, IDraggableItem } from "~/types/datatable";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        formFieldsCreateAPI,
        formFieldPaginationListAPI,
        controlTypesListAPI,
        variablesListByVarOIDAndFieldIdAPI,
        formFieldListByFormIdAPI,
        formFieldsUpdateAPI,
        reorderFormFieldsAPI,
        formFieldsGetByIDAPI,
        deleteFieldByIdAPI,
        previewFormFieldsAPI,
        type IAssignedFieldEditCheck,
        type IAssignedFieldDerivation,
        assignedDerivationsByFormIdAPI,
        fieldVisiblityEditChecksByFormIdAPI,
        disableFieldEditChecksByFormIdAPI,
    } from "~/services/apis/handlers/admin/form-field";
    import useToastStore from "~/stores/toast";
    import type {
        IFieldVariableData,
        IFormFieldData,
    } from "~/services/apis/handlers/types/admin/form-field-types";
    import usePopupModalStore from "~/stores/popup-modal";
    import { formsListByBranchIdAPI } from "~/services/apis/handlers/admin/form";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import { dictionaryListByBranchIdAPI } from "~/services/apis/handlers/admin/dictionary";
    import { unitDictionaryListByBranchIdAPI } from "~/services/apis/handlers/admin/unit-dictionary";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import useAdminWinFormStore from "~/stores/admin-winform";
    import { editCheckListByBranchIdAPI } from "~/services/apis/handlers/admin/edit-check";
    import { derivationListByBranchIdAPI } from "~/services/apis/handlers/admin/derivation";
    import { INDENT_LEVEL_OPTIONS } from "~/constants/options";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type { IDictionaryListData } from "~/services/apis/handlers/types/admin/dictionary-types";
    import type { IUnitDictionaryListData } from "~/services/apis/handlers/types/admin/unit-dictionary-types";
    import FieldRestriction from "~/services/apis/data/admin/field-restriction";
    import type { IFieldRestrictionEntryData } from "~/services/apis/handlers/types/admin/field-restriction-types";
    import { rolesListByGroupNameAPI } from "~/services/apis/handlers/admin/user";
    import type {
        ICalendarProps,
        ICheckboxGroupOptions,
        ICheckboxGroupProps,
        IDataCollectionFormDetails,
        IDropdownOptions,
        IDropdownProps,
        IFileUploadProps,
        IFormFieldDerivationDetails,
        IFormFieldDisableEditCheckDetails,
        IFormFieldVisibiltyEditCheckDetails,
        IRadioGroupOptions,
        IRadioGroupProps,
        ITextAreaProps,
        ITextInputGroupProps,
    } from "~/types/form-generation";
    import type {
        IGenerateFormFieldsData,
        IPublishedDataDictionaryEntryListData,
        IPublishedUnitDictionaryEntryListData,
        TFormFieldDerivationData,
        TFormFieldDisableEditCheckData,
        TFormFieldVisibiltyEditCheckData,
    } from "~/services/apis/handlers/types/data-collection-types";
    import {
        previewDataDictionaryEntriesListByIdAPI,
        previewUnitDictionaryEntriesListByIdAPI,
    } from "~/services/apis/handlers/portal/data-collection";
    import useDataCollectionStore from "~/stores/data-collection";
    import type { IEditCheckListData } from "~/services/apis/handlers/types/admin/edit-check-types";
    import type { IDerivationData } from "~/services/apis/handlers/types/derivation-types";
    import useGlobalStore from "~/stores/global";
    import { isDerivedField } from "~/utils/derivation";
    import { setAssignedFormFieldVisibiltyEditCheckDetails } from "~/utils/edit-check";

    interface ITableData {
        id: TNullableNumber;
        num: TNullableString;
        name: TNullableString;
        label: TNullableString;
        format: TNullableString;
        isActive: boolean;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        tempID: string;
    }

    interface IFindVariable {
        formId: TNullableNumber;
        fieldId: TNullableNumber;
        variableSearch: TNullableString;
        variableId: TNullableNumber;
        variable: TNullableString;
        format: TNullableString;
        dictionaryId: TNullableNumber;
        unitDictionaryId: TNullableNumber;
        codingDictionaryId: TNullableNumber;
        variableError: string;
        isDataDictionaryGlobal: boolean;
        isUnitDictionaryGlobal: boolean;
    }

    interface IUniqueId {
        uniqueId: number;
    }

    const getDefaultFindVariable = (): IFindVariable => ({
        formId: null,
        fieldId: null,
        variableSearch: null,
        variableId: null,
        variable: null,
        format: null,
        dictionaryId: null,
        unitDictionaryId: null,
        codingDictionaryId: null,
        variableError: "",
        isDataDictionaryGlobal: false,
        isUnitDictionaryGlobal: false,
    });

    const getDefaultFieldSettingsMenu = () => [
        { expand: false, id: 1, label: "Variable" },
        { expand: true, id: 2, label: "Field" },
        { expand: false, id: 3, label: "Field Help Text" },
        { expand: false, id: 4, label: "Field Edit Checks" },
        { expand: false, id: 5, label: "Verification and Reviews" },
        { expand: false, id: 6, label: "View Restrictions" },
        { expand: false, id: 7, label: "Entry Restrictions" },
        { expand: false, id: 8, label: "Edit Checks" },
        { expand: false, id: 9, label: "Derivations" },
        { expand: false, id: 10, label: "Patient Cloud Options" },
    ];

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const emit = defineEmits<{
        "on-row-select": [
            selectedRow: ISelectedRow<{
                id: number;
                branchName: string;
                branchId?: number;
            }>,
        ];
    }>();

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const popupModalStore = usePopupModalStore();
    const adminWinFormStore = useAdminWinFormStore();
    const dataCollectionStore = useDataCollectionStore();
    const globalStore = useGlobalStore();
    const loading = ref<Loading>(new Loading());
    const showFindVariableModel = ref<boolean>(false);
    const showPreviewFormFields = ref<boolean>(false);
    const tableLoaderDetails = ref<TTableLoaderDetail>({});

    const formFieldModel = ref<FormField>(new FormField());
    const formFieldModelRef = ref<FormField>(new FormField());
    const formFieldErrorModel = ref<FormField>(new FormField());

    const formFieldVariableModel = ref<FormFieldVariable>(new FormFieldVariable());
    const formFieldVariableModelRef = ref<FormFieldVariable>(new FormFieldVariable());
    const formFieldVariableErrorModel = ref<FormFieldVariable>(new FormFieldVariable());

    const formFieldEditCheckModel = ref<FormFieldEditCheck>(new FormFieldEditCheck());
    const formFieldEditCheckModelRef = ref<FormFieldEditCheck>(new FormFieldEditCheck());
    const formFieldEditCheckErrorModel = ref<FormFieldEditCheck>(new FormFieldEditCheck());

    const fieldRestrictionModel = ref<FieldRestriction>(new FieldRestriction());
    const fieldRestrictionModelRef = ref<FieldRestriction>(new FieldRestriction());

    // TODO: need to modify
    const formEditCheckModel = ref<FormEditCheck>(new FormEditCheck());
    const formEditCheckModelRef = ref<FormEditCheck>(new FormEditCheck());

    const formDerivationModel = ref<FormDerivation>(new FormDerivation());
    const formDerivationModelRef = ref<FormDerivation>(new FormDerivation());

    const formFieldPatientCloudOptionModel = ref<FormFieldPatientCloudOption>(
        new FormFieldPatientCloudOption(),
    );
    const formFieldPatientCloudOptionModelRef = ref<FormFieldPatientCloudOption>(
        new FormFieldPatientCloudOption(),
    );

    // formEditCheckModel.value.appliedChecks = [
    //     { label: "GEC_SET_CALENDAR_DAY0", value: "1" },
    //     { label: "GEC_SET_CALENDAR_DAY1", value: "2" },
    //     { label: "EA_FORMS_1", value: "3" },
    //     { label: "EA_FORMS_2", value: "4" },
    //     { label: "EA_FORMS_3", value: "5" },
    // ];
    // formEditCheckModelRef.value.appliedChecks = [...formEditCheckModel.value.appliedChecks];
    formDerivationModel.value.appliedDerivations = [{ label: "GDX_BRTHD_VISD", value: "1" }];
    formDerivationModelRef.value.appliedDerivations = formDerivationModel.value.appliedDerivations;

    const findVariableModel = ref<IFindVariable>({
        ...getDefaultFindVariable(),
    });

    const isFormEdit = ref<boolean>(false);
    const fieldSearch = ref<TNullableString>(null);
    const formColumns: IColumn[] = [
        {
            field: "fieldNum",
            header: "Num",
            icon: false,
            show: true,
        },
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "label",
            header: "Label",
            icon: false,
            show: true,
        },
        {
            field: "format",
            header: "Format",
            icon: false,
            show: true,
        },
        {
            field: "isActive",
            header: "Active",
            icon: false,
            show: true,
        },
    ];
    const fieldTableData = ref<ITableData[]>([]);
    const fieldTableDataRef = ref<ITableData[]>(deepClone(fieldTableData.value));
    const originalTableResponse = ref<IFormFieldData[]>([]);
    const fieldSettingsMenu = ref<IMenuList[]>([...getDefaultFieldSettingsMenu()]);
    const dataCollectionFormFieldDetailsList = ref<IGenerateFormFieldsData[]>([]);
    const dataCollectionFormDetails = ref<TDataCollectionFormDetails>({});
    const dataCollectionFormDetailsRef = ref<TDataCollectionFormDetails>({});
    const dataDictionaryEntriesList = ref<IPublishedDataDictionaryEntryListData[]>([]);
    const unitDictionaryEntriesList = ref<IPublishedUnitDictionaryEntryListData[]>([]);
    const isVariableDuplicate = ref<boolean>(false);
    const assignedFieldEditChecks = ref<IAssignedFieldEditCheck[]>([]);
    const assignedFieldEditChecksRef = ref<IAssignedFieldEditCheck[]>([]);
    const assignedFieldDerivations = ref<IAssignedFieldDerivation[]>([]);
    const assignedFieldDerivationsRef = ref<IAssignedFieldDerivation[]>([]);
    const assignedFormFieldDerivations = ref<TFormFieldDerivationData<IFormFieldDerivationDetails>>(
        {},
    );
    const assignedFormFieldVisibiltyEditChecks = ref<
        TFormFieldVisibiltyEditCheckData<IFormFieldVisibiltyEditCheckDetails>
    >({});
    const assignedFormFieldDisableEditChecks = ref<
        TFormFieldDisableEditCheckData<IFormFieldDisableEditCheckDetails>
    >({});
    const triggerDerivationOnlyOnceIds = ref<number[]>([]);

    const formOptions = ref<DropdownOption>(new DropdownOption());
    const fieldOptions = ref<DropdownOption>(new DropdownOption());
    const variableOptions = ref<DropdownOption>(new DropdownOption());
    const dataDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const unitDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const codingDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const editCheckOptions = ref<DropdownOption>(new DropdownOption());
    const derivationOptions = ref<DropdownOption>(new DropdownOption());
    const controlTypeOptions = ref<DropdownOption>(new DropdownOption());
    const manualReviewRoles = ref<DropdownOption>(new DropdownOption());
    const viewRestrictionRoles = ref<DropdownOption>(new DropdownOption());
    const entryRestrictionRoles = ref<DropdownOption>(new DropdownOption());

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));

    const fieldLookups = computed(() => getOptionsList(fieldOptions.value.options, "name", "id"));

    const variableLookups = computed(() =>
        getOptionsList(variableOptions.value.options, "varOID", "id"),
    );

    const dataDictionaryLookups = computed(() => {
        // getOptionsList(dataDictionaryOptions.value.options, "name", "id")
        const result: IOptions[] = [];
        for (const row of dataDictionaryOptions.value.options as unknown as Array<
            IDictionaryListData & IUniqueId
        >) {
            result.push({
                label: row.isGlobal ? `${row.name} (Global)` : row.name,
                value: row.uniqueId,
            });
        }
        return deepClone(result) as IOptions[];
    });

    const unitDictionaryLookups = computed(() => {
        // getOptionsList(unitDictionaryOptions.value.options, "name", "id")
        const result: IOptions[] = [];
        for (const row of unitDictionaryOptions.value.options as unknown as Array<
            IUnitDictionaryListData & IUniqueId
        >) {
            result.push({
                label: row.isGlobal ? `${row.name} (Global)` : row.name,
                value: row.uniqueId,
            });
        }
        return deepClone(result) as IOptions[];
    });

    // TODO: after adding global library for derivation and edit check need to see if uniqueId needs to be added
    const codingDictionaryLookups = computed(() =>
        getOptionsList(codingDictionaryOptions.value.options, "name", "id"),
    );

    // const editCheckLookups = computed(() => {
    //     const result: IOptions[] = [];
    //     for (const row of editCheckOptions.value.options as unknown as Array<IEditCheckListData & IUniqueList>) {
    //         result.push({
    //             label: row.isGlobal ? `${row.name} (Global)` : row.name,
    //             value: row.uniqueId,
    //         });
    //     }
    //     return deepClone(result) as IOptions[];
    // });
    const editCheckLookups = computed(() =>
        getOptionsList(editCheckOptions.value.options, "name", "id"),
    );

    const derivationLookups = computed(() =>
        getOptionsList(derivationOptions.value.options, "name", "id"),
    );

    const controlTypeLookups = computed(() =>
        getOptionsList(controlTypeOptions.value.options, "name", "id"),
    );

    const addFieldOrderOptions = computed(() =>
        deepClone(getFormOrderOptions(fieldTableData.value, "name")),
    );

    const manualReviewRoleLookups = computed(() =>
        getOptionsList(manualReviewRoles.value.options, "role", "id"),
    );

    const viewRestrictionRoleLookups = computed(() =>
        getOptionsList(viewRestrictionRoles.value.options, "role", "id"),
    );

    const entryRestrictionRoleLookups = computed(() =>
        getOptionsList(entryRestrictionRoles.value.options, "role", "id"),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Fields - ${props.tabData[props.activeTab.label].data.formName}`
            : "Fields",
    );

    function validateFields() {
        if (!formFieldModel.value.name || getStringLength(formFieldModel.value.name) === 0)
            formFieldErrorModel.value.name = "Please enter a name";
        else formFieldErrorModel.value.name = "";
        if (!formFieldModel.value.OID || getStringLength(formFieldModel.value.OID) === 0)
            formFieldErrorModel.value.OID = "Please enter an OID";
        else if (!checkOID(formFieldModel.value.OID, "form field"))
            formFieldErrorModel.value.OID = "Please enter a valid OID";
        else formFieldErrorModel.value.OID = "";
        if (getStringLength(formFieldModel.value.controlType) === 0)
            formFieldErrorModel.value.controlTypeName = "Please select a control type";
        else formFieldErrorModel.value.controlTypeName = "";
    }

    function validateVariables(isApplyVariables = false) {
        if (
            formFieldVariableModel.value.OID &&
            !checkOID(formFieldVariableModel.value.OID, "form field")
        )
            formFieldVariableErrorModel.value.OID = "Please enter a valid OID";
        else if (
            isApplyVariables &&
            (!formFieldVariableModel.value.OID ||
                !checkOID(formFieldVariableModel.value.OID, "form field"))
        )
            formFieldVariableErrorModel.value.OID = "Please enter a valid OID 1";
        else formFieldVariableErrorModel.value.OID = "";
        if (formFieldVariableModel.value.OID && !formFieldVariableModel.value.format)
            formFieldVariableErrorModel.value.format = "Please enter a format";
        // else if (
        //     formFieldVariableModel.value.OID &&
        //     !checkVariableFormat(formFieldVariableModel.value.format || "")
        // )
        //     formFieldVariableErrorModel.value.format = "Please enter a valid format";
        else formFieldVariableErrorModel.value.format = "";
    }

    function validateAll() {
        validateFields();
        validateVariables();
    }

    // function addOrEditFormAction(selectedOrder: string) {
    //     const newItemIndex = getNewItemPosition(selectedOrder);
    //     let formTableRef = deepClone(fieldTableData.value) as ITableData[];
    //     formTableRef.splice(newItemIndex, 0, {
    //         formOrderNumber: 0,
    //         num: null,
    //         name: null,
    //         label: null,
    //         format: null,
    //         isActive: false,
    //     });
    //     formTableRef = formTableRef.map((row, index) => ({
    //         ...row,
    //         formOrderNumber: index + 1,
    //     }));
    //     fieldTableData.value = deepClone(formTableRef) as ITableData[];
    //     isFormEdit.value = true;
    // }

    // function resetFormModel() {
    //     if (checkIfModelChanged(fieldTableData, fieldTableDataRef)) {
    //         fieldTableData.value = deepClone(fieldTableDataRef.value);
    //     } else {
    //         formFieldModel.value = deepClone(formFieldModelRef.value);
    //         isFormEdit.value = false;
    //     }
    // }

    function resetFormModel() {
        fieldTableData.value = deepClone(fieldTableDataRef.value);

        formFieldModel.value = new FormField();
        formFieldModelRef.value = new FormField();
        formFieldErrorModel.value = new FormField();

        formFieldVariableModel.value = new FormFieldVariable();
        formFieldVariableModelRef.value = new FormFieldVariable();
        formFieldVariableErrorModel.value = new FormFieldVariable();

        formFieldEditCheckModel.value = new FormFieldEditCheck();
        formFieldEditCheckModelRef.value = new FormFieldEditCheck();
        formFieldEditCheckErrorModel.value = new FormFieldEditCheck();

        fieldRestrictionModel.value = new FieldRestriction();
        fieldRestrictionModelRef.value = new FieldRestriction();

        formEditCheckModel.value = new FormEditCheck();
        formEditCheckModelRef.value = new FormEditCheck();

        formDerivationModel.value = new FormDerivation();
        formDerivationModelRef.value = new FormDerivation();

        formFieldPatientCloudOptionModel.value = new FormFieldPatientCloudOption();
        formFieldPatientCloudOptionModelRef.value = new FormFieldPatientCloudOption();

        fieldSettingsMenu.value = [...getDefaultFieldSettingsMenu()];

        assignedFieldEditChecks.value = [];
        assignedFieldEditChecksRef.value = [];

        assignedFieldDerivations.value = [];
        assignedFieldDerivationsRef.value = [];

        // formEditCheckModel.value.appliedChecks = [
        //     { label: "GEC_SET_CALENDAR_DAY0", value: "1" },
        //     { label: "GEC_SET_CALENDAR_DAY1", value: "2" },
        //     { label: "EA_FORMS_1", value: "3" },
        //     { label: "EA_FORMS_2", value: "4" },
        //     { label: "EA_FORMS_3", value: "5" },
        // ];
        // formEditCheckModelRef.value.appliedChecks = [...formEditCheckModel.value.appliedChecks];
        // formDerivationModel.value.appliedDerivations = [{ label: "GDX_BRTHD_VISD", value: "1" }];
        // formDerivationModelRef.value.appliedDerivations =
        //     formDerivationModel.value.appliedDerivations;
    }

    function saveDataEntry() {
        if (isFormEdit.value) isFormEdit.value = false;
        resetFormModel();
    }

    function getErrorFieldTypes(validationErrorsData: Record<string, string> | null) {
        if (!validationErrorsData) return [];
        const result: Array<"field" | "variable"> = [];
        const errorKeys = Object.keys(validationErrorsData);
        const formFieldProperties = Object.keys(getModelProperties(formFieldModel.value));
        const fieldVariableProperties = Object.keys(
            getModelProperties(formFieldVariableModel.value),
        );
        for (const errorKey of errorKeys) {
            if (formFieldProperties.includes(errorKey)) result.push("field");
            if (fieldVariableProperties.includes(errorKey)) result.push("variable");

            if (getArrayLength(result) > 0) break;
        }
        return [...result];
    }

    function setFieldEntryDetails(
        restrictionsOriginal: IFieldRestrictionEntryData[],
        restrictions: TOptionValue[],
        type: TRestrictionEntry,
    ) {
        const restrictionsData: IFieldRestrictionEntryData[] = [];
        if (getArrayLength(restrictionsOriginal) > 0) {
            for (const row of restrictionsOriginal) {
                const filteredItems = getFilteredItems({
                    data: restrictions,
                    type: "primitive",
                    value: row.roleId,
                }) as TOptionValue[];
                restrictionsData.push({
                    id: row.id,
                    fieldRestrictionId: row.fieldRestrictionId,
                    isActive: getArrayLength(filteredItems) > 0,
                    roleId: row.roleId,
                    type: row.type,
                    updatedBy: 0,
                });
            }
        } else {
            let rolesListData: IOptions[] = [];
            if (type === "Manual Review") rolesListData = [...manualReviewRoleLookups.value];
            else if (type === "View") rolesListData = [...viewRestrictionRoleLookups.value];
            else if (type === "Entry") rolesListData = [...entryRestrictionRoleLookups.value];
            for (const row of rolesListData) {
                const filteredItems = getFilteredItems({
                    data: restrictions,
                    type: "primitive",
                    value: row.value,
                }) as TOptionValue[];
                restrictionsData.push({
                    fieldRestrictionId: 0,
                    id: 0,
                    isActive: getArrayLength(filteredItems) > 0,
                    roleId: Number(row.value),
                    type,
                    updatedBy: 0,
                });
            }
        }
        return [...restrictionsData];
    }

    // function actualIdByUniqueId(dataList: any[], uniqueId: number) {
    //     let result = -1;
    //     for (const row of dataList) {
    //         if (row.uniqueId === uniqueId) {
    //             result = row.id;
    //             break;
    //         }
    //     }
    //     return result;
    // }

    // function uniqueIdByActualId(dataList: any[], actualId: number) {
    //     let result = -1;
    //     for (const row of dataList) {
    //         if (row.id === actualId) {
    //             result = row.uniqueId;
    //             break;
    //         }
    //     }
    //     return result;
    // }
    function actualIdByUniqueId(dataList: any[], uniqueId: string) {
        let result = -1;
        const [id, isGlobal] = uniqueId.split("_");
        for (const row of dataList) {
            if (
                isEqual(id, row.id, "number") &&
                isEqual(Number(isGlobal), row.isGlobal, "boolean")
            ) {
                result = row.id;
                break;
            }
        }
        return result;
    }

    function uniqueIdByActualId(dataList: any[], actualId: number, isGlobal: boolean) {
        let result = "";
        for (const row of dataList) {
            if (isEqual(actualId, row.id, "number") && isEqual(isGlobal, row.isGlobal, "boolean")) {
                result = row.uniqueId;
                break;
            }
        }
        return result;
    }

    function checkIfGlobalDictionary(type: "data dictionary" | "unit dictionary") {
        let result = false;
        if (type === "data dictionary" && formFieldVariableModel.value.dictionaryId) {
            const filteredItem = getFilteredItems({
                data: dataDictionaryOptions.value.options,
                type: "object",
                key: "uniqueId",
                value: formFieldVariableModel.value.dictionaryId,
            });
            if (getArrayLength(filteredItem) > 0) result = filteredItem[0].isGlobal;
        } else if (type === "unit dictionary" && formFieldVariableModel.value.unitDictionaryId) {
            const filteredItem = getFilteredItems({
                data: unitDictionaryOptions.value.options,
                type: "object",
                key: "uniqueId",
                value: formFieldVariableModel.value.unitDictionaryId,
            });
            if (getArrayLength(filteredItem) > 0) result = filteredItem[0].isGlobal;
        }
        return result;
    }

    function setAssignedEditCheckAPIData() {
        const result = deepClone(assignedFieldEditChecks.value);
        for (const row of result) {
            for (const subRow of assignedFieldEditChecksRef.value) {
                if (row.editCheckId === subRow.editCheckId && row.isGlobal === subRow.isGlobal) {
                    row.id = subRow.id;
                    break;
                }
            }
        }
        return result;
    }

    function setAssignedDerivationAPIData() {
        const result = deepClone(assignedFieldDerivations.value);
        for (const row of result) {
            for (const subRow of assignedFieldDerivationsRef.value) {
                if (row.derivationId === subRow.derivationId && row.isGlobal === subRow.isGlobal) {
                    row.id = subRow.id;
                    break;
                }
            }
        }
        return result;
    }

    async function addOrEditField() {
        validateAll();
        if (
            !checkIfModelHasErrors(formFieldErrorModel.value, [
                "isActive",
                "isVisible",
                "doesNotParticipateInSignature",
                "isLogDataEntry",
                "showPreviousVisitValues",
                "requiresTranslation",
                "canSetRecordDate",
                "canSetDataPageDate",
                "canSetInstanceDate",
                "canSetSubjectDate",
            ]) &&
            !checkIfModelHasErrors(formFieldVariableErrorModel.value)
        ) {
            loading.value.form = true;
            let status = 500;
            let message = "";
            let validationErrorsData = null;
            const actualDataDictionaryId = actualIdByUniqueId(
                dataDictionaryOptions.value.options,
                (formFieldVariableModel.value.dictionaryId || "") as string,
            );
            const actualUnitDictionaryId = actualIdByUniqueId(
                unitDictionaryOptions.value.options,
                (formFieldVariableModel.value.unitDictionaryId || "") as string,
            );
            const requestData = {
                // Variable
                fieldVariableId: formFieldVariableModel.value.id || 0,
                branchId: Number(props.tabData[props.activeTab.label].data.branchId),
                variableId: formFieldVariableModel.value.id || 0,
                fieldEditChecksId: 0,
                format: formFieldVariableModel.value.format || null,
                varOID: formFieldVariableModel.value.OID || null,
                dictionaryId: actualDataDictionaryId > -1 ? actualDataDictionaryId : 0,
                unitDictionaryId: actualUnitDictionaryId > -1 ? actualUnitDictionaryId : 0,
                codingDictionaryId: formFieldVariableModel.value.codeDictionaryId || 0,
                isDataDictionaryGlobal: checkIfGlobalDictionary("data dictionary"),
                isUnitDictionaryGlobal: checkIfGlobalDictionary("unit dictionary"),
                isAllowVariableDuplicate: isVariableDuplicate.value,
                // Variable
                // Field
                id: 0,
                formFieldsId: formFieldModel.value.id || 0,
                oid: formFieldModel.value.OID as string,
                name: formFieldModel.value.name as string,
                fieldNum: formFieldModel.value.fieldNum,
                controlType: formFieldModel.value.controlType as number,
                isLogDataEntry: formFieldModel.value.isLogDataEntry,
                isVisible: formFieldModel.value.isVisible,
                formId: formFieldModel.value.formId as number,
                helpText: formFieldModel.value.helpText,
                requiresTranslation: formFieldModel.value.requiresTranslation,
                doesNotParticipateSignature: formFieldModel.value.doesNotParticipateInSignature,
                promptClinicalSignificance: false, // FIXME: need to check where this is present
                labAnalytics: formFieldModel.value.labAnalyte,
                defaultValue: formFieldModel.value.defaultValue,
                sasLabel: formFieldModel.value.sasLabel,
                sasFormat: formFieldModel.value.sasFormat,
                label: formFieldModel.value.label,
                header: formFieldModel.value.header,
                fixedUnit: formFieldModel.value.fixedUnit,
                validExtensions: formFieldModel.value.validExtensions,
                isActive: formFieldModel.value.isActive,
                location: formFieldModel.value.location,
                fieldHelpText: formFieldModel.value.fieldHelpText,
                canSetRecordDate: formFieldModel.value.canSetRecordDate,
                canSetDatapage: formFieldModel.value.canSetDataPageDate,
                canSetInstanceDate: formFieldModel.value.canSetInstanceDate,
                canSetSubjectDate: formFieldModel.value.canSetSubjectDate,
                showPreviousVisitValues: formFieldModel.value.showPreviousVisitValues,
                trialId: 0,
                orderNumber: formFieldModel.value.orderNumber,
                oldOrderNumber: formFieldModel.value.oldOrderNumber,
                newOrderNumber: formFieldModel.value.newOrderNumber,
                indentLevel: formFieldModel.value.indentLevel as number,
                // Field
                autoQueryForRequiredDataEntry:
                    formFieldEditCheckModel.value.autoQueryForRequiredDataEntry,
                autoQueryForNonConformantData:
                    formFieldEditCheckModel.value.autoQueryForNonConformantData,
                autoQueryForFutureDateTime:
                    formFieldEditCheckModel.value.autoQueryForFutureDateOrTime,
                autoQueryForDataOutOfRangeLowValue: formFieldEditCheckModel.value
                    .autoQueryForDataOutOfRange.low
                    ? Number(formFieldEditCheckModel.value.autoQueryForDataOutOfRange.low)
                    : 0,
                autoQueryForDataOutOfRangeHighValue: formFieldEditCheckModel.value
                    .autoQueryForDataOutOfRange.high
                    ? Number(formFieldEditCheckModel.value.autoQueryForDataOutOfRange.high)
                    : 0,
                markNonConformantDataOutOfRangeLowValue: formFieldEditCheckModel.value
                    .makeNonConformantDataOutOfRange.low
                    ? Number(formFieldEditCheckModel.value.makeNonConformantDataOutOfRange.low)
                    : 0,
                markNonConformantDataOutOfRangeHighValue: formFieldEditCheckModel.value
                    .makeNonConformantDataOutOfRange.high
                    ? Number(formFieldEditCheckModel.value.makeNonConformantDataOutOfRange.high)
                    : 0,
                // Field Restrictions
                // fieldRestrictionId: fieldRestrictionModel.value.id || 0,
                requiresVerification: fieldRestrictionModel.value.requiresVerification,
                manualReviews: fieldRestrictionModel.value.requiresManualReview
                    ? setFieldEntryDetails(
                          fieldRestrictionModel.value.manualReviewsOriginal,
                          fieldRestrictionModel.value.manualReviews,
                          "Manual Review",
                      )
                    : [],
                viewRestrictions: setFieldEntryDetails(
                    fieldRestrictionModel.value.viewRestrictionsOriginal,
                    fieldRestrictionModel.value.viewRestrictions,
                    "View",
                ),
                entryRestrictions: setFieldEntryDetails(
                    fieldRestrictionModel.value.entryRestrictionsOriginal,
                    fieldRestrictionModel.value.entryRestrictions,
                    "Entry",
                ),
                assignedFieldEditChecks: setAssignedEditCheckAPIData(),
                assignedFieldDerivations: setAssignedDerivationAPIData(),
                updatedBy: 0,
            };
            if (!formFieldModel.value.id) {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await formFieldsCreateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            } else {
                const {
                    message: apiMessage,
                    status: apiStatus,
                    validationErrors: apiValidationErrors,
                } = await formFieldsUpdateAPI(requestData);
                message = apiMessage;
                status = apiStatus;
                validationErrorsData = apiValidationErrors;
            }

            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                saveDataEntry();
                await formFieldPaginationList();
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                if (status === 400 && validationErrorsData) {
                    const availableFieldTypes = getErrorFieldTypes(validationErrorsData);
                    if (availableFieldTypes.includes("field"))
                        setAPIValidationErrors(validationErrorsData, formFieldErrorModel.value);
                    if (availableFieldTypes.includes("variable"))
                        setAPIValidationErrors(validationErrorsData, formFieldVariableModel.value);
                }
            }
            loading.value.form = false;
        }
    }

    function setTableData(tableData: IFormFieldData[]): ITableData[] {
        tableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            num: row.fieldNum,
            name: row.name,
            label: row.label,
            format: row.format,
            isActive: row.isActive,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            tempID: uniqueID(),
        }));
    }

    async function formFieldPaginationList() {
        loading.value.table = true;
        const { status, message, data } = await formFieldPaginationListAPI(
            getAPIFilters({
                search: fieldSearch.value,
                filter: {
                    formId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            fieldTableData.value = deepClone(tableData);
            fieldTableDataRef.value = deepClone(tableData);
            originalTableResponse.value = deepClone(items);
        } else if (status !== 401) {
            fieldTableData.value = [];
            fieldTableDataRef.value = [];
            originalTableResponse.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    function onDragDrop(
        event: DragEvent,
        slotProps: IDraggableItem<ITableData>,
        clearTransferData: TVoidAction,
    ) {
        const draggedItem = parseJSON(
            event.dataTransfer!.getData("item"),
        ) as IDraggableItem<ITableData>;
        if (draggedItem.index !== slotProps.index) {
            fieldTableData.value = sortArray({
                data: fieldTableData.value.map((row) => ({
                    ...row,
                    oldOrderNumber: row.orderNumber,
                    newOrderNumber: getItemOrder(
                        row.newOrderNumber,
                        draggedItem.data.newOrderNumber,
                        slotProps.data.newOrderNumber,
                    ),
                })),
                key: "newOrderNumber",
            });
        }
        clearTransferData();
    }

    const getReorderRequestBody = (): IFormFieldData[] =>
        fieldTableData.value.map((row) => ({
            ...row,
            updatedBy: 0,
        })) as unknown as IFormFieldData[];

    async function reorderFields() {
        loading.value.dynamicLoading.reOrder = true;
        const { status, message } = await reorderFormFieldsAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await formFieldPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    async function deleteFieldById(fieldId: string) {
        loading.value.form = true;
        const { status, message } = await deleteFieldByIdAPI(fieldId);
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await formFieldPaginationList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    // function getFieldLabel(label: TNullableString) {
    //     let result = null;
    //     if (label && label.length > 25) result = `${label.substring(0, 26)}...`;
    //     else if (label) result = label;
    //     return result;
    // }

    function handleFieldAdd(selectedOrder: TOptionValue) {
        const newItemIndex = addItemByPosition(String(selectedOrder), fieldTableData.value, "name");
        formFieldModel.value.formId = Number(props.tabData[props.activeTab.label].data.id);
        formFieldModelRef.value.formId = Number(props.tabData[props.activeTab.label].data.id);
        formFieldModel.value.indentLevel = 0;
        formFieldModelRef.value.indentLevel = 0;
        const newOrderNumber = newItemIndex === 0 ? newItemIndex : newItemIndex + 1;
        formFieldModel.value.orderNumber = newOrderNumber;
        formFieldModel.value.oldOrderNumber = newOrderNumber;
        formFieldModel.value.newOrderNumber = newOrderNumber;
        formFieldModelRef.value.orderNumber = newOrderNumber;
        formFieldModelRef.value.oldOrderNumber = newOrderNumber;
        formFieldModelRef.value.newOrderNumber = newOrderNumber;
        isFormEdit.value = true;
        if (
            getArrayLength(dataDictionaryOptions.value.options) === 0 ||
            getArrayLength(unitDictionaryOptions.value.options) === 0 ||
            getArrayLength(editCheckOptions.value.options) === 0 ||
            getArrayLength(derivationOptions.value.options) === 0 ||
            getArrayLength(manualReviewRoles.value.options) === 0 ||
            getArrayLength(viewRestrictionRoles.value.options) === 0 ||
            getArrayLength(entryRestrictionRoles.value.options) === 0
        ) {
            Promise.all([
                dataDictionaryList(),
                unitDictionaryList(),
                editCheckListByBranchId(),
                derivationListByBranchId(),
                manualReviewRolesList(),
                viewRestrictionRolesList(),
                entryRestrictionRolesList(),
            ]);
        }
    }

    async function formFieldsGetByID(fieldId: string): Promise<IFormFieldData | null> {
        let responseData = null;
        loading.value.secondaryTable = true;
        const { status, message, data } = await formFieldsGetByIDAPI(fieldId);
        if (status === 200) {
            responseData = deepClone(data);
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
        return responseData;
    }

    async function handleFieldEdit(index: number) {
        const rowData = originalTableResponse.value[index];
        const responseData = await formFieldsGetByID(String(rowData.id));
        if (responseData) {
            if (
                getArrayLength(dataDictionaryOptions.value.options) === 0 ||
                getArrayLength(unitDictionaryOptions.value.options) === 0 ||
                getArrayLength(editCheckOptions.value.options) === 0 ||
                getArrayLength(derivationOptions.value.options) === 0 ||
                getArrayLength(manualReviewRoles.value.options) === 0 ||
                getArrayLength(viewRestrictionRoles.value.options) === 0 ||
                getArrayLength(entryRestrictionRoles.value.options) === 0
            ) {
                await Promise.all([
                    dataDictionaryList(),
                    unitDictionaryList(),
                    editCheckListByBranchId(),
                    derivationListByBranchId(),
                    manualReviewRolesList(),
                    viewRestrictionRolesList(),
                    entryRestrictionRolesList(),
                ]);
            }

            formFieldModel.value.set(responseData);
            formFieldModelRef.value.set(responseData);
            formFieldErrorModel.value = new FormField();

            // await formFieldVariableByFieldId(String(rowData.id));
            formFieldVariableModel.value.set(responseData);
            formFieldVariableModelRef.value.set(responseData);
            formFieldVariableErrorModel.value = new FormFieldVariable();
            const dataDictionaryIdResult = uniqueIdByActualId(
                dataDictionaryOptions.value.options,
                responseData.dictionaryId || -1,
                responseData.isDataDictionaryGlobal,
            );
            const unitDictionaryIdResult = uniqueIdByActualId(
                dataDictionaryOptions.value.options,
                responseData.unitDictionaryId || -1,
                responseData.isUnitDictionaryGlobal,
            );
            if (dataDictionaryIdResult) {
                formFieldVariableModel.value.dictionaryId =
                    dataDictionaryIdResult as unknown as number;
                formFieldVariableModelRef.value.dictionaryId =
                    dataDictionaryIdResult as unknown as number;
            }
            if (unitDictionaryIdResult) {
                formFieldVariableModel.value.unitDictionaryId =
                    unitDictionaryIdResult as unknown as number;
                formFieldVariableModelRef.value.unitDictionaryId =
                    unitDictionaryIdResult as unknown as number;
            }

            formFieldEditCheckModel.value.set(responseData);
            formFieldEditCheckModelRef.value.set(responseData);
            formFieldEditCheckErrorModel.value = new FormFieldEditCheck();

            fieldRestrictionModel.value.set(responseData);
            fieldRestrictionModelRef.value.set(responseData);

            formEditCheckModel.value = new FormEditCheck();
            formEditCheckModelRef.value = new FormEditCheck();

            formDerivationModel.value = new FormDerivation();
            formDerivationModelRef.value = new FormDerivation();

            formFieldPatientCloudOptionModel.value = new FormFieldPatientCloudOption();
            formFieldPatientCloudOptionModelRef.value = new FormFieldPatientCloudOption();

            assignedFieldEditChecks.value = responseData.assignedFieldEditChecks
                ? responseData.assignedFieldEditChecks
                : [];
            assignedFieldEditChecksRef.value = responseData.assignedFieldEditChecks
                ? responseData.assignedFieldEditChecks
                : [];

            assignedFieldDerivations.value = responseData.assignedFieldDerivations
                ? responseData.assignedFieldDerivations
                : [];
            assignedFieldDerivationsRef.value = responseData.assignedFieldDerivations
                ? responseData.assignedFieldDerivations
                : [];

            // formEditCheckModel.value.appliedChecks = [
            //     { label: "GEC_SET_CALENDAR_DAY0", value: "1" },
            //     { label: "GEC_SET_CALENDAR_DAY1", value: "2" },
            //     { label: "EA_FORMS_1", value: "3" },
            //     { label: "EA_FORMS_2", value: "4" },
            //     { label: "EA_FORMS_3", value: "5" },
            // ];
            // formEditCheckModelRef.value.appliedChecks = [...formEditCheckModel.value.appliedChecks];
            formDerivationModel.value.appliedDerivations = [
                { label: "GDX_BRTHD_VISD", value: "1" },
            ];
            formDerivationModelRef.value.appliedDerivations =
                formDerivationModel.value.appliedDerivations;

            formFieldModel.value.orderNumber = responseData.orderNumber; // rowData.orderNumber;
            formFieldModel.value.oldOrderNumber = responseData.orderNumber;
            formFieldModel.value.newOrderNumber = responseData.newOrderNumber;
            formFieldModelRef.value.orderNumber = responseData.orderNumber;
            formFieldModelRef.value.oldOrderNumber = responseData.oldOrderNumber;
            formFieldModelRef.value.newOrderNumber = responseData.newOrderNumber;
            isFormEdit.value = true;
        }
    }

    function applyVariable() {
        validateVariables(true);
        if (!checkIfModelHasErrors(formFieldVariableErrorModel.value)) {
            formFieldModel.value.name = formFieldVariableModel.value.OID;
            formFieldModel.value.OID = formFieldVariableModel.value.OID;
        }
    }

    async function formList() {
        formOptions.value.loading = true;
        const { status, data, message } = await formsListByBranchIdAPI(
            String(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            // const tableData = setTableData(data);
            formOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            formOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        formOptions.value.loading = false;
    }

    async function fieldsList() {
        if (findVariableModel.value.formId) {
            fieldOptions.value.loading = true;
            const { status, data, message } = await formFieldListByFormIdAPI(
                String(findVariableModel.value.formId),
            );
            if (status === 200) {
                // const tableData = setTableData(data);
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
    }

    async function variablesList(disableGlobalLoader: boolean, varOID?: TNullableString) {
        variableOptions.value.loading = true;
        const { status, data, message } = await variablesListByVarOIDAndFieldIdAPI(
            {
                varOID: varOID || findVariableModel.value.variableSearch,
                fieldId: findVariableModel.value.fieldId,
                branchId: props.tabData[props.activeTab.label].data.branchId,
            },
            disableGlobalLoader,
        );
        if (status === 200) {
            variableOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            variableOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        variableOptions.value.loading = false;
    }

    function handleFindVariable() {
        showFindVariableModel.value = true;
        popupModalStore.show("adminFindVariableModal");
        if (
            getArrayLength(formOptions.value.options) === 0 ||
            getArrayLength(fieldOptions.value.options) === 0
        )
            Promise.all([formList()]);
    }

    async function triggerVariablesList() {
        await variablesList(false);
    }

    function resetFindVariableModel(closeModal?: TVoidAction) {
        showFindVariableModel.value = false;
        variableOptions.value.options = [];
        if (closeModal) closeModal();
        findVariableModel.value = { ...getDefaultFindVariable() };
    }

    function onVariableFieldChange() {
        if (
            formFieldVariableModel.value.id &&
            formFieldVariableModel.value.OID !== formFieldVariableModelRef.value.OID
        ) {
            formFieldVariableModel.value.id = null;
            formFieldVariableModel.value.format = null;
            formFieldVariableModel.value.dictionaryId = null;
            formFieldVariableModel.value.unitDictionaryId = null;
            formFieldVariableModel.value.codeDictionaryId = null;

            formFieldVariableModelRef.value.id = null;
            formFieldVariableModelRef.value.format = null;
            formFieldVariableModelRef.value.dictionaryId = null;
            formFieldVariableModelRef.value.unitDictionaryId = null;
            formFieldVariableModelRef.value.codeDictionaryId = null;
        }
    }

    function onVariableSelect() {
        if (findVariableModel.value.variableId) {
            const selectedVariableDetails = getFilteredItems({
                data: variableOptions.value.options,
                type: "object",
                value: findVariableModel.value.variableId,
                key: "id",
            }) as IFieldVariableData[];
            if (getArrayLength(selectedVariableDetails) > 0) {
                // findVariableModel.variable = getDropdownLabelByValue(
                // variableLookups,
                // findVariableModel.variableId,
                // );
                findVariableModel.value.variable = selectedVariableDetails[0].varOID;
                findVariableModel.value.format = selectedVariableDetails[0].format || "";
                findVariableModel.value.dictionaryId =
                    selectedVariableDetails[0].dictionaryId || null;
                findVariableModel.value.unitDictionaryId =
                    selectedVariableDetails[0].unitDictionaryId || null;
                findVariableModel.value.codingDictionaryId =
                    selectedVariableDetails[0].codingDictionaryId || null;
                findVariableModel.value.isDataDictionaryGlobal =
                    selectedVariableDetails[0].isDataDictionaryGlobal;
                findVariableModel.value.isUnitDictionaryGlobal =
                    selectedVariableDetails[0].isUnitDictionaryGlobal;
            } else {
                findVariableModel.value.variable = null;
                findVariableModel.value.format = null;
                findVariableModel.value.dictionaryId = null;
                findVariableModel.value.unitDictionaryId = null;
                findVariableModel.value.codingDictionaryId = null;
                findVariableModel.value.isDataDictionaryGlobal = false;
                findVariableModel.value.isUnitDictionaryGlobal = false;
                toastStore.error({
                    title: "Error",
                    message: "Something went wrong",
                });
            }
        } else {
            findVariableModel.value.variable = null;
            findVariableModel.value.format = null;
            findVariableModel.value.dictionaryId = null;
            findVariableModel.value.unitDictionaryId = null;
            findVariableModel.value.codingDictionaryId = null;
            findVariableModel.value.isDataDictionaryGlobal = false;
            findVariableModel.value.isUnitDictionaryGlobal = false;
        }
    }

    function handleVariableSelect(closeModal?: TVoidAction) {
        if (!findVariableModel.value.variableId)
            findVariableModel.value.variableError = "Please select a variable";
        else findVariableModel.value.variableError = "";
        if (!findVariableModel.value.variableError) {
            formFieldVariableModel.value.id = findVariableModel.value.variableId;
            formFieldVariableModel.value.OID = findVariableModel.value.variable;
            formFieldVariableModel.value.format = findVariableModel.value.format;
            // formFieldVariableModel.value.dictionaryId = findVariableModel.value.dictionaryId;
            // formFieldVariableModel.value.unitDictionaryId =
            //     findVariableModel.value.unitDictionaryId;
            formFieldVariableModel.value.codeDictionaryId =
                findVariableModel.value.codingDictionaryId;

            formFieldVariableModelRef.value.id = findVariableModel.value.variableId;
            formFieldVariableModelRef.value.OID = findVariableModel.value.variable;
            formFieldVariableModelRef.value.format = findVariableModel.value.format;
            // formFieldVariableModelRef.value.dictionaryId = findVariableModel.value.dictionaryId;
            // formFieldVariableModelRef.value.unitDictionaryId =
            //     findVariableModel.value.unitDictionaryId;
            formFieldVariableModelRef.value.codeDictionaryId =
                findVariableModel.value.codingDictionaryId;

            const dataDictionaryIdResult = uniqueIdByActualId(
                dataDictionaryOptions.value.options,
                findVariableModel.value.dictionaryId || -1,
                findVariableModel.value.isDataDictionaryGlobal,
            );
            const unitDictionaryIdResult = uniqueIdByActualId(
                dataDictionaryOptions.value.options,
                findVariableModel.value.unitDictionaryId || -1,
                findVariableModel.value.isUnitDictionaryGlobal,
            );
            if (dataDictionaryIdResult) {
                formFieldVariableModel.value.dictionaryId =
                    dataDictionaryIdResult as unknown as number;
                formFieldVariableModelRef.value.dictionaryId =
                    dataDictionaryIdResult as unknown as number;
            }
            if (unitDictionaryIdResult) {
                formFieldVariableModel.value.unitDictionaryId =
                    unitDictionaryIdResult as unknown as number;
                formFieldVariableModelRef.value.unitDictionaryId =
                    unitDictionaryIdResult as unknown as number;
            }

            showFindVariableModel.value = false;
            variableOptions.value.options = [];
            if (closeModal) closeModal();
            findVariableModel.value = { ...getDefaultFindVariable() };
        }
    }

    async function dataDictionaryList() {
        dataDictionaryOptions.value.loading = true;
        const { status, data, message } = await dictionaryListByBranchIdAPI(
            String(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            dataDictionaryOptions.value.options = deepClone(
                data.map((row) => ({
                    ...row,
                    uniqueId: `${row.id}_${Number(row.isGlobal)}`,
                })),
            );
        } else if (status !== 401) {
            dataDictionaryOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        dataDictionaryOptions.value.loading = false;
    }

    async function unitDictionaryList() {
        unitDictionaryOptions.value.loading = true;
        const { status, data, message } = await unitDictionaryListByBranchIdAPI(
            String(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            unitDictionaryOptions.value.options = deepClone(
                data.map((row) => ({
                    ...row,
                    uniqueId: `${row.id}_${Number(row.isGlobal)}`,
                })),
            );
        } else if (status !== 401) {
            unitDictionaryOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        unitDictionaryOptions.value.loading = false;
    }

    async function editCheckListByBranchId() {
        editCheckOptions.value.loading = true;
        const { status, data, message } = await editCheckListByBranchIdAPI(
            Number(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            editCheckOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            editCheckOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        editCheckOptions.value.loading = false;
    }

    async function derivationListByBranchId() {
        derivationOptions.value.loading = true;
        const { status, data, message } = await derivationListByBranchIdAPI(
            Number(props.tabData[props.activeTab.label].data.branchId),
        );
        if (status === 200) {
            derivationOptions.value.options = deepClone(
                data.map((row, index) => ({
                    ...row,
                    uniqueId: index + 1,
                })),
            );
        } else if (status !== 401) {
            derivationOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        derivationOptions.value.loading = false;
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

    async function manualReviewRolesList() {
        manualReviewRoles.value.loading = true;
        const { status, data, message } = await rolesListByGroupNameAPI("Manual Review");
        if (status === 200) {
            manualReviewRoles.value.options = deepClone(data);
        } else if (status !== 401) {
            manualReviewRoles.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        manualReviewRoles.value.loading = false;
    }

    async function viewRestrictionRolesList() {
        viewRestrictionRoles.value.loading = true;
        const { status, data, message } = await rolesListByGroupNameAPI("View Restrict");
        if (status === 200) {
            viewRestrictionRoles.value.options = deepClone(data);
        } else if (status !== 401) {
            viewRestrictionRoles.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        viewRestrictionRoles.value.loading = false;
    }

    async function entryRestrictionRolesList() {
        entryRestrictionRoles.value.loading = true;
        const { status, data, message } = await rolesListByGroupNameAPI("Entry Restrict");
        if (status === 200) {
            entryRestrictionRoles.value.options = deepClone(data);
        } else if (status !== 401) {
            entryRestrictionRoles.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        entryRestrictionRoles.value.loading = false;
    }

    async function publishedDataDictionaryEntriesListById(params: IDictionaryDetails) {
        if (
            getArrayLength(params.globalDictionaryIds) > 0 ||
            getArrayLength(params.publishedDictionaryIds) > 0
        ) {
            loading.value.dynamicLoading["dataCollectionDataDictionaryEntriesList"] = true;
            const { status, data } = await previewDataDictionaryEntriesListByIdAPI({
                isPublished: false,
                globalDataDictionaryIds: params.globalDictionaryIds,
                publishedDataDictionaryIds: params.publishedDictionaryIds,
            });
            if (status === 200) {
                dataDictionaryEntriesList.value = deepClone(data);
            } else if (status !== 401) {
                dataDictionaryEntriesList.value = [];
            }
            loading.value.dynamicLoading["dataCollectionDataDictionaryEntriesList"] = false;
        }
    }

    async function publishedUnitDictionaryEntriesListById(params: IDictionaryDetails) {
        if (
            getArrayLength(params.globalDictionaryIds) > 0 ||
            getArrayLength(params.publishedDictionaryIds) > 0
        ) {
            loading.value.dynamicLoading["dataCollectionUnitDictionaryEntriesList"] = true;
            const { status, data } = await previewUnitDictionaryEntriesListByIdAPI({
                isPublished: false,
                globalUnitDictionaryIds: params.globalDictionaryIds,
                publishedUnitDictionaryIds: params.publishedDictionaryIds,
            });
            if (status === 200) {
                unitDictionaryEntriesList.value = deepClone(data);
            } else if (status !== 401) {
                unitDictionaryEntriesList.value = [];
            }
            loading.value.dynamicLoading["dataCollectionUnitDictionaryEntriesList"] = false;
        }
    }

    async function getDictionaryEntries(
        dataDictionaryDetails: IDictionaryDetails,
        unitDictionaryDetails: IDictionaryDetails,
    ) {
        await Promise.all([
            publishedDataDictionaryEntriesListById(dataDictionaryDetails),
            publishedUnitDictionaryEntriesListById(unitDictionaryDetails),
        ]);
    }

    function getDictionaryEntryDetails(
        dataDictionaryDetails: IDictionaryDetails,
        unitDictionaryDetails: IDictionaryDetails,
    ) {
        for (const formConfigRow of dataCollectionFormFieldDetailsList.value) {
            if (formConfigRow.dictionaryId) {
                if (formConfigRow.isDataDictionaryGlobal)
                    dataDictionaryDetails.globalDictionaryIds.push(
                        formConfigRow.dictionaryId as number,
                    );
                else
                    dataDictionaryDetails.publishedDictionaryIds.push(
                        formConfigRow.dictionaryId as number,
                    );
            }

            if (formConfigRow.unitDictionaryId) {
                if (formConfigRow.isUnitDictionaryGlobal)
                    unitDictionaryDetails.globalDictionaryIds.push(
                        formConfigRow.unitDictionaryId as number,
                    );
                else
                    unitDictionaryDetails.publishedDictionaryIds.push(
                        formConfigRow.unitDictionaryId as number,
                    );
            }
        }
    }

    async function processDictionaries() {
        let dataDictionaryDetails: IDictionaryDetails = {
            globalDictionaryIds: [],
            publishedDictionaryIds: [],
        };
        let unitDictionaryDetails: IDictionaryDetails = {
            globalDictionaryIds: [],
            publishedDictionaryIds: [],
        };
        getDictionaryEntryDetails(dataDictionaryDetails, unitDictionaryDetails);
        await getDictionaryEntries(dataDictionaryDetails, unitDictionaryDetails);

        dataDictionaryDetails = {
            globalDictionaryIds: [],
            publishedDictionaryIds: [],
        };
        unitDictionaryDetails = {
            globalDictionaryIds: [],
            publishedDictionaryIds: [],
        };
    }

    function processFormGeneration() {
        const formType = props.tabData[props.activeTab.label].data.formType;
        console.log("formType in processFormGeneration", formType);
        let groupId = formType === 3 ? 1 : 0;
        const result: IDataCollectionFormDetails[] = [];
        const finalResult: TDataCollectionFormDetails = {};
        let childrenResult: IDataCollectionFormDetails[] = [];
        for (const [
            formConfigRowIndex,
            formConfigRow,
        ] of dataCollectionFormFieldDetailsList.value.entries()) {
            const controlTypeDetails = getFilteredItems({
                data: controlTypeLookups.value,
                type: "object",
                key: "value",
                value: formConfigRow.controlType,
            });
            const { modelValue, specifiedValue } = getModelAndSpecifiedValueByControlType(
                controlTypeDetails[0].value,
                formConfigRow.fieldValueDetails,
                formConfigRow.defaultValue,
            );
            let formObj: Record<string, any> = {
                id: formConfigRow.id,
                elementId: convertWordsIntoCasedWords(formConfigRow.label || "", "camel case"),
                modelValue,
                specifiedValue,
                controlType: formConfigRow.controlType,
                defaultModelValue: formConfigRow.defaultValue,
                labelClass: "",
                inputClass: "",
                label: formConfigRow.label,
                containerClass: "w-[34rem]",
                // disabled: !["vh.crc"].includes(
                //     String(userStore.getDetails().username).toLocaleLowerCase(),
                // ),
                disabled: false,
                showHelpText: !!formConfigRow.helpText,
                helpText: formConfigRow.helpText,
                dictionaryId: formConfigRow.dictionaryId,
                unitDictionaryId: formConfigRow.unitDictionaryId,
                isDataDictionaryGlobal: formConfigRow.isDataDictionaryGlobal,
                isUnitDictionaryGlobal: formConfigRow.isUnitDictionaryGlobal,
                progressStatus: "Planned",
                isVerified: false,
                isFrozen: false,
                isLocked: false,
                publishedSubjectFormFieldChildDetailId: null,
                isLogDataEntry: formConfigRow.isLogDataEntry,
                fieldValueDetails: [],
                componentKey: `${formConfigRow.id}_${uniqueID()}`,
                isVisible: formConfigRow.isVisible,
                format: formConfigRow.format,
                isHeading: !formConfigRow.varOID,
                indentLevel: formConfigRow.indentLevel,
            };
            const {
                type,
                fractionalPart,
                maxLength,
                minLength,
                wholePart,
                dateFormat,
                multipleUpload,
            } = getValidationPropsDetails(formConfigRow.format, controlTypeDetails[0].value);
            if (getArrayLength(controlTypeDetails) > 0) {
                if (controlTypeDetails[0].value === 1) {
                    // Text
                    formObj = {
                        ...formObj,
                        type,
                        // elementId,
                        error: null,
                        // inputContainerClass,
                        containerClass: formConfigRow.unitDictionaryId
                            ? "w-[23.45rem]"
                            : "w-[34rem]",
                        minLength,
                        maxLength,
                        wholePart,
                        fractionalPart,
                        // placeholder: `Please enter a ${formConfigRow.label ? convertToLowerCase(formConfigRow.label) : "value"}`,
                        placeholder: "Please enter a value",
                        // readOnly: false,
                        required: false,
                        specifiedOptions: unitDictionaryEntriesList.value
                            .filter(
                                (row) => row.unitDictionaryId === formConfigRow.unitDictionaryId,
                            )
                            .map((row) => ({
                                label: row.userDataString,
                                value: row.codedUnit,
                            })) as IOptions[],
                    } as ITextInputGroupProps;
                } else if (controlTypeDetails[0].value === 2) {
                    // Long text
                    formObj = {
                        ...formObj,
                        // elementId,
                        placeholder: "Please enter a value",
                        required: false,
                        error: null,
                        // rows,
                        // cols,
                        // showCharacterCount,
                        max: maxLength,
                        // ellipseCount,
                    } as ITextAreaProps;
                } else if (controlTypeDetails[0].value === 6) {
                    // Checkbox
                    formObj = {
                        ...formObj,
                        // elementId,
                        name: convertWordsIntoCasedWords(
                            formConfigRow.label ||
                                `${convertToLowerCase(formConfigRow.name)} Group`,
                            "camel case",
                        ),
                        options: formConfigRow.dictionaryId
                            ? (dataDictionaryEntriesList.value
                                  .filter(
                                      (row) => row.dataDictionaryId === formConfigRow.dictionaryId,
                                  )
                                  .map((row) => ({
                                      label: row.userDataString,
                                      value: row.codedData,
                                      specify: row.specify,
                                      isChecked: false,
                                      specifiedValue: null,
                                  })) as ICheckboxGroupOptions[])
                            : [],
                        required: false,
                        type: "vertical",
                        error: null,
                    } as ICheckboxGroupProps;
                } else if (controlTypeDetails[0].value === 7) {
                    // Dropdown
                    formObj = {
                        ...formObj,
                        options: formConfigRow.dictionaryId
                            ? (dataDictionaryEntriesList.value
                                  .filter(
                                      (row) => row.dataDictionaryId === formConfigRow.dictionaryId,
                                  )
                                  .map((row) => ({
                                      label: row.userDataString,
                                      value: row.codedData,
                                      specify: row.specify,
                                  })) as IDropdownOptions[])
                            : formConfigRow.unitDictionaryId
                              ? (unitDictionaryEntriesList.value
                                    .filter(
                                        (row) =>
                                            row.unitDictionaryId === formConfigRow.unitDictionaryId,
                                    )
                                    .map((row) => ({
                                        label: row.userDataString,
                                        value: row.codedUnit,
                                    })) as IOptions[])
                              : [],
                        // defaultValue: `Please select a ${formConfigRow.label ? convertToLowerCase(formConfigRow.label) : "value"}`,
                        defaultValue: `Please select an option`,
                        // elementId,
                        enableClear: true,
                        error: null,
                        // inputContainerClass,
                        // labelAction,
                        loading: false,
                        optionClass: "w-[34rem]",
                        // optionOffset,
                        optionPlacement: "bottom",
                        // optionPosition,
                        // readOnly,
                        required: false,
                        // resetOption: true,
                    } as unknown as IDropdownProps;
                } else if ([8, 9].includes(controlTypeDetails[0].value)) {
                    // 8 -> Horizontal radio, 9 -> Vertical radio
                    formObj = {
                        ...formObj,
                        // elementId,
                        name: convertWordsIntoCasedWords(
                            formConfigRow.label ||
                                `${convertToLowerCase(formConfigRow.name)} Group`,
                            "camel case",
                        ),
                        options: dataDictionaryEntriesList.value
                            .filter((row) => row.dataDictionaryId === formConfigRow.dictionaryId)
                            .map((row) => ({
                                label: row.userDataString,
                                value: row.codedData,
                                specify: row.specify,
                            })) as IRadioGroupOptions[],
                        required: false,
                        type: controlTypeDetails[0].value === 8 ? "horizontal" : "vertical",
                        allowDeselect: true,
                        // isSpecifyEntry: false,
                        error: null,
                    } as IRadioGroupProps;
                } else if ([3, 4, 5].includes(controlTypeDetails[0].value)) {
                    // 3 -> Date, 4 -> Time, 5 -> DateTime
                    formObj = {
                        ...formObj,
                        disabledDates: [],
                        // elementId,
                        error: null,
                        format: dateFormat,
                        // maxDate,
                        // minDate,
                        pickerClass: "w-[34rem]",
                        pickerOffset: 0,
                        pickerPlacement: "bottom",
                        // pickerPosition,
                        // placeholder: `Please select a ${formConfigRow.label ? convertToLowerCase(formConfigRow.label) : "value"}`,
                        placeholder: "Please enter an option",
                        // readOnly,
                        required: false,
                        type:
                            controlTypeDetails[0].value === 3
                                ? "date"
                                : controlTypeDetails[0].value === 4
                                  ? "time"
                                  : "datetime",
                    } as ICalendarProps;
                } else if (controlTypeDetails[0].value === 10) {
                    // 10 -> File upload
                    formObj = {
                        ...formObj,
                        // elementId,
                        placeholder: "Please upload one or more file(s)",
                        required: false,
                        multiple: multipleUpload,
                        extensions: formConfigRow.validExtensions
                            ? formConfigRow.validExtensions.split("|")
                            : ["image/*"],
                    } as IFileUploadProps;
                }
            }
            const { currentPointer, nextPointer } = checkWhereToPushByIndentLevel(
                formConfigRow,
                formConfigRowIndex,
                dataCollectionFormFieldDetailsList.value,
            );
            console.log(
                "currentPointer, nextPointer",
                formConfigRow.oid,
                currentPointer,
                nextPointer,
            );
            if (currentPointer === "children" && nextPointer === "children") {
                childrenResult.push({ ...(formObj as IDataCollectionFormDetails) });
            } else if (currentPointer === "children" && nextPointer === "parent") {
                childrenResult.push({ ...(formObj as IDataCollectionFormDetails) });
                result[getArrayLength(result) - 1].children = deepClone(childrenResult);
                childrenResult = [];
            } else {
                result.push({ ...(formObj as IDataCollectionFormDetails), children: [] });
            }
        }
        console.log("formtype is result", result);
        // dataCollectionFormDetails.value = deepClone(result);
        if (formType === 3) {
            for (const resultRow of result) {
                finalResult[groupId] = [{ ...resultRow }];
                groupId++;
            }
            console.log("formtype is 3", finalResult);
        } else {
            finalResult[groupId] = result;
            console.log("formtype is 1 or 2", finalResult);
        }
        dataCollectionFormDetails.value = deepClone(finalResult);
        dataCollectionFormDetailsRef.value = deepClone(finalResult);
    }

    async function previewFormFields() {
        loading.value.dynamicLoading["preview"] = true;
        triggerDerivationOnlyOnceIds.value = [];
        const { status, data, message } = await previewFormFieldsAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            dataCollectionFormFieldDetailsList.value = deepClone(data);
            await processDictionaries();
            processFormGeneration();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            dataCollectionFormFieldDetailsList.value = [];
        }
        dataCollectionStore.selectedFormName = props.tabData[props.activeTab.label].data.formName;
        loading.value.dynamicLoading["preview"] = false;
    }

    function processFormFieldDerivationOnChange() {
        processFormFieldDerivation({
            assignedFieldDerivations: assignedFormFieldDerivations.value,
            formsList: dataCollectionFormDetails.value,
            runOnceFieldIds: triggerDerivationOnlyOnceIds.value,
            checkForVisitId: false,
        });
    }

    async function assignedDerivationsByFormId() {
        const { status, data } = await assignedDerivationsByFormIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            assignedFormFieldDerivations.value = deepClone(setAssignedDerivationDetails(data));
            console.log(
                "assignedFormFieldDerivations in assignedDerivationsByFormId for preview derivation",
                assignedFormFieldDerivations.value,
            );
            const derivedResult = isDerivedField(
                assignedFormFieldDerivations.value,
                dataCollectionFormDetails.value,
                dataCollectionFormDetailsRef.value,
                false,
            );
            console.log(
                "derivedResult in assignedDerivationsByFormId for preview derivation",
                derivedResult,
            );
            if (derivedResult) {
                dataCollectionFormDetails.value = deepClone(derivedResult.formsList);
                dataCollectionFormDetailsRef.value = deepClone(derivedResult.formsListRef);
            }
            processFormFieldDerivationOnChange();
        } else if (status !== 401) {
            assignedFormFieldDerivations.value = {};
        }
    }

    async function checkForInitialFormFieldVisibility() {
        const result = await processFormFieldVisibiltyEditChecks({
            assignedFieldEditChecks: assignedFormFieldVisibiltyEditChecks.value,
            formsList: dataCollectionFormDetails.value,
            checkForVisitId: false,
        });
        console.log(
            "result in checkForInitialFormFieldVisibility for visibility edit check",
            result,
        );
        for (const dataCollectionGroupId of Object.keys(dataCollectionFormDetails.value)) {
            const { formsList, formsListRef, isValueChanged } =
                setFormFieldVisibiltyBasedOnVisbilityEditChecks(
                    dataCollectionFormDetails.value[dataCollectionGroupId],
                    dataCollectionFormDetailsRef.value[dataCollectionGroupId],
                    result,
                );
            if (isValueChanged) {
                dataCollectionFormDetails.value[dataCollectionGroupId] = deepClone(formsList);
                dataCollectionFormDetailsRef.value[dataCollectionGroupId] = deepClone(formsListRef);
            }
        }
    }

    async function fieldVisiblityEditChecksByFormId() {
        const { status, data } = await fieldVisiblityEditChecksByFormIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            assignedFormFieldVisibiltyEditChecks.value = deepClone(
                setAssignedFormFieldVisibiltyEditCheckDetails(data),
            );
            await checkForInitialFormFieldVisibility();
        } else if (status !== 401) {
            assignedFormFieldVisibiltyEditChecks.value = {};
        }
    }

    async function checkForInitialFormFieldDisable() {
        const result = await processFormFieldDisableEditChecks({
            assignedFieldEditChecks: assignedFormFieldDisableEditChecks.value,
            formsList: dataCollectionFormDetails.value,
            checkForVisitId: false,
        });
        for (const dataCollectionGroupId of Object.keys(dataCollectionFormDetails.value)) {
            const { formsList, formsListRef, isValueChanged } =
                setFormFieldDisableBasedOnDisableEditChecks(
                    dataCollectionFormDetails.value[dataCollectionGroupId],
                    dataCollectionFormDetailsRef.value[dataCollectionGroupId],
                    result,
                );
            if (isValueChanged) {
                dataCollectionFormDetails.value[dataCollectionGroupId] = deepClone(formsList);
                dataCollectionFormDetailsRef.value[dataCollectionGroupId] = deepClone(formsListRef);
            }
        }
    }

    async function disableFieldEditChecksByFormId() {
        const { status, data } = await disableFieldEditChecksByFormIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            assignedFormFieldDisableEditChecks.value = deepClone(
                setAssignedFormFieldDisableEditCheckDetails(data),
            );
            checkForInitialFormFieldDisable();
        } else if (status !== 401) {
            assignedFormFieldDisableEditChecks.value = {};
        }
    }

    async function handleFormFieldPreview() {
        loading.value.dynamicLoading["dataCollectionGrid"] = true;
        showPreviewFormFields.value = true;
        popupModalStore.show("adminPreviewFormFields");
        // await previewFormFields();
        await Promise.all([previewFormFields()]).then(async () => {
            await Promise.all([
                assignedDerivationsByFormId(),
                fieldVisiblityEditChecksByFormId(),
                disableFieldEditChecksByFormId(),
            ]);
        });
        loading.value.dynamicLoading["dataCollectionGrid"] = false;
    }

    function resetPreviewModel(closeModal?: TVoidAction) {
        showPreviewFormFields.value = false;
        popupModalStore.hide("adminPreviewFormFields");
        dataCollectionFormFieldDetailsList.value = [];
        dataCollectionFormDetails.value = {};
        dataCollectionFormDetailsRef.value = {};
        dataCollectionStore.selectedFormName = "";
        if (closeModal) closeModal();
    }

    async function checkIfDuplicateVariable() {
        await variablesList(true, formFieldVariableModel.value.OID);
        let result = false;
        for (const row of variableLookups.value) {
            if (
                convertToLowerCase(String(row.label)) ===
                convertToLowerCase(String(formFieldVariableModel.value.OID))
            ) {
                result = true;
                break;
            }
        }
        return result;
    }

    function editCheckDetailsById(checkRow: IOptions) {
        let result: IAssignedFieldEditCheck | null = null;
        for (const row of editCheckOptions.value.options as unknown as IEditCheckListData[]) {
            if (
                isEqual(checkRow.value, row.id, "number") &&
                ((checkRow.label.includes("(Global)") && row.isGlobal) ||
                    (!checkRow.label.includes("(Global)") && !row.isGlobal))
            ) {
                result = {
                    id: 0,
                    fieldId: 0,
                    editCheckId: row.id,
                    isGlobal: row.isGlobal,
                    updatedBy: 0,
                };
                break;
            }
        }
        return result;
    }

    function getRowIndexOfAssignedEditCheck(checkRow: IOptions) {
        let result = -1;
        for (const [index, row] of assignedFieldEditChecks.value.entries()) {
            if (
                isEqual(row.editCheckId, checkRow.value, "number") &&
                ((checkRow.label.includes("(Global)") && row.isGlobal) ||
                    (!checkRow.label.includes("(Global)") && !row.isGlobal))
            ) {
                result = index;
                break;
            }
        }
        return result;
    }

    function handleAssignedFieldEditChecks(checkRow: IOptions, checkedValue: boolean) {
        console.log(
            "assignedFieldEditChecks.value before checking for assigned editcheck",
            deepClone(assignedFieldEditChecks.value),
        );
        const itemDetails = {
            data: assignedFieldEditChecks.value,
            type: "object",
            value: checkRow.value,
            key: "editCheckId",
        } as IItemCheck;
        const itemExists = checkIfItemExists(itemDetails);
        console.log("checkRow checking for assigned editcheck", checkRow);
        console.log("checkedValue checking for assigned editcheck", checkedValue);
        console.log("itemExists checking for assigned editcheck", itemExists);
        const editCheckDetails = editCheckDetailsById(checkRow);
        console.log("editCheckDetails checking for assigned editcheck", editCheckDetails);
        if (checkedValue && !itemExists) {
            if (editCheckDetails) assignedFieldEditChecks.value.push({ ...editCheckDetails });
        } else if (!checkedValue && itemExists) {
            const itemIndex = getRowIndexOfAssignedEditCheck(checkRow);
            console.log("itemIndex checking for assigned editcheck", itemIndex);
            if (itemIndex !== -1) assignedFieldEditChecks.value.splice(itemIndex, 1);
        }
        console.log(
            "assignedFieldEditChecks.value after checking for assigned editcheck",
            deepClone(assignedFieldEditChecks.value),
        );
    }

    function isEditCheckAssigned(checkRow: IOptions) {
        let result = false;
        for (const row of assignedFieldEditChecks.value) {
            if (
                isEqual(row.editCheckId, checkRow.value, "number") &&
                ((row.isGlobal && checkRow.label.includes("(Global)")) ||
                    (!row.isGlobal && !checkRow.label.includes("(Global)")))
            ) {
                result = true;
                break;
            }
        }
        return result;
    }

    function derivationDetailsById(checkRow: IOptions) {
        let result: IAssignedFieldDerivation | null = null;
        for (const row of derivationOptions.value.options as unknown as IDerivationData[]) {
            if (
                isEqual(checkRow.value, row.id, "number") &&
                ((checkRow.label.includes("(Global)") && row.isGlobal) ||
                    (!checkRow.label.includes("(Global)") && !row.isGlobal))
            ) {
                result = {
                    id: 0,
                    fieldId: 0,
                    derivationId: row.id,
                    isGlobal: row.isGlobal,
                    updatedBy: 0,
                };
                break;
            }
        }
        return result;
    }

    function getRowIndexOfAssignedDerivation(checkRow: IOptions) {
        let result = -1;
        for (const [index, row] of assignedFieldDerivations.value.entries()) {
            if (
                isEqual(row.derivationId, checkRow.value, "number") &&
                ((checkRow.label.includes("(Global)") && row.isGlobal) ||
                    (!checkRow.label.includes("(Global)") && !row.isGlobal))
            ) {
                result = index;
                break;
            }
        }
        return result;
    }

    function handleAssignedFieldDerivations(checkRow: IOptions, checkedValue: boolean) {
        console.log(
            "assignedFieldDerivations.value before checking for assigned derivation",
            deepClone(assignedFieldDerivations.value),
        );
        const itemDetails = {
            data: assignedFieldDerivations.value,
            type: "object",
            value: checkRow.value,
            key: "derivationId",
        } as IItemCheck;
        const itemExists = checkIfItemExists(itemDetails);
        const derivationDetails = derivationDetailsById(checkRow);
        console.log("itemExists checking for assigned derivation", itemExists);
        console.log("derivationDetails checking for assigned derivation", derivationDetails);
        console.log("checkRow checking for assigned derivation", checkRow);
        console.log("checkedValue checking for assigned derivation", checkedValue);
        if (checkedValue && !itemExists) {
            if (derivationDetails) assignedFieldDerivations.value.push({ ...derivationDetails });
        } else if (!checkedValue && itemExists) {
            const itemIndex = getRowIndexOfAssignedDerivation(checkRow);
            console.log("itemIndex checking for assigned derivation", itemIndex);
            if (itemIndex !== -1) assignedFieldDerivations.value.splice(itemIndex, 1);
        }
        console.log(
            "assignedFieldDerivations.value after checking for assigned derivation",
            deepClone(assignedFieldDerivations.value),
        );
    }

    function isDerivationAssigned(checkRow: IOptions) {
        let result = false;
        for (const row of assignedFieldDerivations.value) {
            if (
                isEqual(row.derivationId, checkRow.value, "number") &&
                ((row.isGlobal && checkRow.label.includes("(Global)")) ||
                    (!row.isGlobal && !checkRow.label.includes("(Global)")))
            ) {
                result = true;
                break;
            }
        }
        return result;
    }

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(fieldTableData.value, fieldTableDataRef.value, "tempID", "newOrderNumber");

    const {
        isModelChanged,
        model: tableModel,
        modelRef: tableModelRef,
    } = useUnsavedAlert(fieldTableData.value, fieldTableDataRef.value);

    const { isModelChanged: isFieldModelChanged } = useUnsavedAlert(
        formFieldModel.value,
        formFieldModelRef.value,
    );
    const { isModelChanged: isFieldVariableModelChanged } = useUnsavedAlert(
        formFieldVariableModel.value,
        formFieldVariableModelRef.value,
    );
    const { isModelChanged: isFieldEditCheckModelChanged } = useUnsavedAlert(
        formFieldEditCheckModel.value,
        formFieldEditCheckModelRef.value,
    );
    const { isModelChanged: fieldRestrictionModelChanged } = useUnsavedAlert(
        fieldRestrictionModel.value,
        fieldRestrictionModelRef.value,
    );
    const { isModelChanged: isFieldFormEditCheckModelChanged } = useUnsavedAlert(
        formEditCheckModel.value,
        formEditCheckModelRef.value,
    );
    const { isModelChanged: isFieldDerivationModelChanged } = useUnsavedAlert(
        formDerivationModel.value,
        formDerivationModelRef.value,
    );
    const { isModelChanged: isFieldPatientCloudModelChanged } = useUnsavedAlert(
        formFieldPatientCloudOptionModel.value,
        formFieldPatientCloudOptionModelRef.value,
    );

    watch(
        () => fieldTableData.value,
        (newValue) => {
            tableModel.value = newValue;
            tableModelRef.value = fieldTableDataRef.value;
            orderModel.value = newValue;
            orderModelRef.value = fieldTableDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => formFieldVariableModel.value.OID,
        async (newVariableOID) => {
            if (
                props.tabData[props.activeTab.label].data.isLabForm &&
                !formFieldVariableModel.value.id &&
                newVariableOID
            ) {
                isVariableDuplicate.value = await checkIfDuplicateVariable();
            } else {
                isVariableDuplicate.value = false;
            }
        },
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
                tableModel.value = deepClone(tableModelRef.value);
                saveDataEntry();
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    watch(
        () => adminWinFormStore.triggerGoBackPostHook.trigger,
        async (newValue) => {
            if (newValue) {
                if (adminWinFormStore.triggerGoBackPostHook.isActionPerformed) {
                    if (adminWinFormStore.triggerGoBackPostHook.type === "Dictionaries") {
                        await dataDictionaryList();
                    } else if (
                        adminWinFormStore.triggerGoBackPostHook.type === "Unit Dictionaries"
                    ) {
                        await unitDictionaryList();
                    } else if (
                        adminWinFormStore.triggerGoBackPostHook.type === "Edit Checks Entries" ||
                        adminWinFormStore.triggerGoBackPostHook.type === "Edit Checks"
                    ) {
                        await editCheckListByBranchId();
                    } else if (
                        adminWinFormStore.triggerGoBackPostHook.type === "Derivation Entries" ||
                        adminWinFormStore.triggerGoBackPostHook.type === "Derivations"
                    ) {
                        await derivationListByBranchId();
                    }
                }
                adminWinFormStore.clearGoBackPostHook();
            }
        },
    );

    watch(
        () => isFieldModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldVariableModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldEditCheckModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => fieldRestrictionModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldFormEditCheckModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldDerivationModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldPatientCloudModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset") {
                if (isFieldModelChanged.value) {
                    formFieldModel.value = deepClone(formFieldModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isFieldVariableModelChanged.value) {
                    formFieldVariableModel.value = deepClone(formFieldVariableModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isFieldEditCheckModelChanged.value) {
                    formFieldEditCheckModel.value = deepClone(formFieldEditCheckModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (fieldRestrictionModelChanged.value) {
                    fieldRestrictionModel.value = deepClone(fieldRestrictionModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isFieldFormEditCheckModelChanged.value) {
                    formEditCheckModel.value = deepClone(formEditCheckModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isFieldDerivationModelChanged.value) {
                    formDerivationModel.value = deepClone(formDerivationModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                } else if (isFieldPatientCloudModelChanged.value) {
                    formFieldPatientCloudOptionModel.value = deepClone(
                        formFieldPatientCloudOptionModelRef.value,
                    );
                    unsavedAlertStore.triggerFormActionAlert = "none";
                }
                saveDataEntry();
            }
        },
    );

    onMounted(async () => {
        loading.value.setDynamicLoading(["reOrder", "preview", "dataCollectionGrid"]);
        // loading.value.setDynamicLoading([
        //     "findVariab",
        // ]);
        await formFieldPaginationList();
        if (getArrayLength(controlTypeOptions.value.options) === 0)
            Promise.all([controlTypesList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="grid grid-cols-2 w-full gap-[1rem]">
                    <div class="flex flex-col gap-[5rem]">
                        <div class="flex flex-col gap-[1rem]">
                            <div class="flex flex-row items-center gap-[1rem]">
                                <div class="w-fit">
                                    <edc-search-bar
                                        v-model="fieldSearch"
                                        element-id="fieldSearch"
                                        :disabled="loading.isDisabled(isFormEdit)"
                                        input-class="admin-input-font"
                                        @on-search="
                                            async () => {
                                                await formFieldPaginationList();
                                                globalStore.triggerSearchBarRefocus('#fieldSearch');
                                            }
                                        "
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[1rem]">
                                    <edc-dropdown
                                        container-class="w-[8rem]"
                                        :options="addFieldOrderOptions"
                                        input-class="admin-input-font"
                                        option-placement="bottom"
                                        option-class="min-w-[8rem]"
                                        type="label"
                                        label="Add Field"
                                        :disabled="loading.isDisabled(isFormEdit, isOrderChanged)"
                                        :reset-option="true"
                                        @on-select="
                                            (selectedOptions: Array<TOptionValue>) => {
                                                // addOrEditFormAction(selectedOptions[0]);
                                                handleFieldAdd(selectedOptions[0]);
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        icon="magnifying-glass"
                                        text="Preview"
                                        container-class="-ml-[0.4rem]"
                                        :disabled="loading.isDisabled(isFormEdit, isOrderChanged)"
                                        :on-click="
                                            async () => {
                                                await handleFormFieldPreview();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isFormEdit"
                                        icon="circle-close"
                                        text="Cancel"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                saveDataEntry();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isFormEdit && !isOrderChanged && isVariableDuplicate"
                                        icon="save"
                                        text="Save"
                                        :disabled="loading.isDisabled()"
                                        type="confirmation"
                                        confirmation-message="Variable will be duplicated. Are you sure you want to save?"
                                        :on-click="
                                            async () => {
                                                await addOrEditField();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isFormEdit && !isOrderChanged && !isVariableDuplicate"
                                        icon="save"
                                        text="Save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await addOrEditField();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="!isFormEdit && isOrderChanged"
                                        icon="save"
                                        text="Save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await reorderFields();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="!isFormEdit && isOrderChanged"
                                        icon="undo"
                                        text="Reset"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                fieldTableData = deepClone(fieldTableDataRef);
                                            }
                                        "
                                    />
                                </div>
                            </div>
                            <div>
                                <edc-data-table
                                    :columns="formColumns"
                                    :table-data="fieldTableData"
                                    :loading="loading.table"
                                    pagination-type="none"
                                    search-key="fieldSearch"
                                    table-style="outlined"
                                    :enable-reorder="true"
                                    :custom-content="true"
                                    :disabled="loading.isDisabled(isFormEdit)"
                                    reorder-class="[&>svg]:mt-[0.5rem]"
                                    @on-drop="
                                        (
                                            event: DragEvent,
                                            slotProps: IDraggableItem<ITableData>,
                                            clearData: TVoidAction,
                                        ) => onDragDrop(event, slotProps, clearData)
                                    "
                                >
                                    <template #custom-content="{ data }">
                                        <td
                                            valign="top"
                                            class="font-normal text-left font-12 custom-row min-w-[5rem]"
                                        >
                                            <edc-text-input
                                                :key="`num-${data.tempID}`"
                                                v-model="data.num"
                                                type="text"
                                                placeholder="No num"
                                                input-class="admin-input-font"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td
                                            valign="top"
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`name-${data.tempID}`"
                                                v-model="data.name"
                                                type="text"
                                                placeholder="No name"
                                                input-class="admin-input-font"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td
                                            valign="top"
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-area
                                                :key="`label-${data.tempID}`"
                                                v-model="data.label"
                                                placeholder="No label"
                                                label-class="admin-input-font"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                                :ellipse-count="13"
                                            />
                                        </td>
                                        <td
                                            valign="top"
                                            class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                        >
                                            <edc-text-input
                                                :key="`format-${data.tempID}`"
                                                v-model="data.format"
                                                type="text"
                                                placeholder="No format"
                                                input-class="admin-input-font"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td
                                            valign="top"
                                            class="font-normal text-left font-12 custom-row"
                                        >
                                            <edc-checkbox
                                                :key="`isActive-${data.tempID}`"
                                                v-model="data.isActive"
                                                container-class="mt-[0.5rem]"
                                                name="isActive"
                                                :read-only="true"
                                            />
                                            <!-- <edc-icon
                                                v-if="data.isActive"
                                                icon="check"
                                                class="fill-[var(--color-secondary)] h-[0.8rem] mt-[0.5rem]"
                                            /> -->
                                        </td>
                                    </template>
                                    <template #action="{ data, index }">
                                        <edc-pressable
                                            container-class="mt-[0.5rem]"
                                            loader-type="table"
                                            :disabled="
                                                loading.isDisabled(isFormEdit, isOrderChanged)
                                            "
                                            :on-click="
                                                async () => {
                                                    await handleFieldEdit(index);
                                                }
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
                                            v-if="!isFormEdit"
                                            :key="`${checkIfKeyExistsInObject(index, tableLoaderDetails) && tableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                            message="Are you sure you want to delete this field?"
                                            :disabled="
                                                loading.isDisabled(isFormEdit, isOrderChanged)
                                            "
                                            :on-delete="
                                                async () => {
                                                    tableLoaderDetails[index] = true;
                                                    await deleteFieldById(String(data.id));
                                                    tableLoaderDetails[index] = false;
                                                }
                                            "
                                        >
                                            <template #icon>
                                                <edc-pressable
                                                    container-class="mt-[0.5rem]"
                                                    loader-type="table"
                                                    :disabled="
                                                        loading.isDisabled(
                                                            isFormEdit,
                                                            isOrderChanged,
                                                        )
                                                    "
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
                    <div v-if="isFormEdit">
                        <admin-form-field-settings :menus-list="fieldSettingsMenu">
                            <template #Variable>
                                <div class="grid grid-cols-1 gap-[1rem]">
                                    <div class="flex flex-row items-center">
                                        <edc-text-input
                                            v-model="formFieldVariableModel.OID"
                                            container-class="flex !flex-row !items-center !gap-[1rem]"
                                            type="text"
                                            label="VarOID"
                                            :label-class="`${formFieldVariableErrorModel.OID ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                            input-class="admin-input-font"
                                            :disabled="loading.isDisabled()"
                                            input-container-class="w-[80%]"
                                            label-container-class=" min-w-[17%] max-w-[17%]"
                                            :required="
                                                !!formFieldVariableModel.format ||
                                                !!formFieldVariableModel.dictionaryId ||
                                                !!formFieldVariableModel.unitDictionaryId ||
                                                !!formFieldVariableModel.codeDictionaryId
                                            "
                                            :error="formFieldVariableErrorModel.OID"
                                            @on-input="
                                                () => {
                                                    onVariableFieldChange();
                                                }
                                            "
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit ${formFieldVariableErrorModel.OID ? 'mb-[1.8rem]' : 'mb-0'}`"
                                            :disabled="loading.isDisabled()"
                                            :on-click="
                                                () => {
                                                    handleFindVariable();
                                                }
                                            "
                                        >
                                            <span
                                                class="font-12 font-semibold text-[var(--color-secondary)]"
                                                >Find</span
                                            >
                                        </edc-pressable>
                                    </div>
                                    <div class="flex flex-row items-center">
                                        <edc-text-input
                                            v-model="formFieldVariableModel.format"
                                            container-class="flex !flex-row !items-center !gap-[1rem]"
                                            type="text"
                                            label="Format"
                                            :label-class="`${formFieldVariableErrorModel.format ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                            input-class="admin-input-font"
                                            input-container-class="w-[80%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :disabled="loading.isDisabled()"
                                            :required="
                                                !!formFieldVariableModel.OID ||
                                                !!formFieldVariableModel.dictionaryId ||
                                                !!formFieldVariableModel.unitDictionaryId ||
                                                !!formFieldVariableModel.codeDictionaryId
                                            "
                                            :error="formFieldVariableErrorModel.format"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit invisible ${formFieldVariableErrorModel.format ? 'mb-[1.8rem]' : 'mb-0'}`"
                                            :disabled="true"
                                            :on-click="
                                                () => {
                                                    //
                                                }
                                            "
                                        >
                                            <span
                                                class="font-12 font-semibold text-[var(--color-secondary)]"
                                                >Find</span
                                            >
                                        </edc-pressable>
                                    </div>
                                    <div class="flex flex-row items-center">
                                        <edc-dropdown
                                            :key="
                                                formFieldVariableModel.dictionaryId
                                                    ? `dictionaryId-${formFieldVariableModel.dictionaryId}`
                                                    : 'dictionaryId'
                                            "
                                            v-model="formFieldVariableModel.dictionaryId"
                                            container-class="flex !flex-row !items-center !gap-[1rem]"
                                            :options="dataDictionaryLookups"
                                            :loading="dataDictionaryOptions.loading"
                                            :disabled="
                                                loading.isDisabled(
                                                    dataDictionaryOptions.loading,
                                                    !!formFieldVariableModel.unitDictionaryId,
                                                    !!formFieldVariableModel.codeDictionaryId,
                                                )
                                            "
                                            label="Dictionary"
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :enable-clear="true"
                                            :ellipse-count="49"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit`"
                                            :disabled="
                                                loading.isDisabled(
                                                    dataDictionaryOptions.loading,
                                                    !!formFieldVariableModel.unitDictionaryId,
                                                    !!formFieldVariableModel.codeDictionaryId,
                                                )
                                            "
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: 'Dictionaries',
                                                        module: 'Branch',
                                                        page: 'Dictionaries',
                                                        data: {
                                                            id: Number(
                                                                tabData[activeTab.label].data
                                                                    .branchId,
                                                            ),
                                                            branchName: String(
                                                                tabData[activeTab.label].data
                                                                    .branchName,
                                                            ),
                                                        },
                                                    });
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Add'"
                                                icon="circle-plus"
                                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                    </div>
                                    <div class="flex flex-row items-center">
                                        <edc-dropdown
                                            :key="
                                                formFieldVariableModel.unitDictionaryId
                                                    ? `unitDictionaryId-${formFieldVariableModel.unitDictionaryId}`
                                                    : 'unitDictionaryId'
                                            "
                                            v-model="formFieldVariableModel.unitDictionaryId"
                                            container-class="flex !flex-row !items-center !gap-[1rem]"
                                            :options="unitDictionaryLookups"
                                            :loading="unitDictionaryOptions.loading"
                                            :disabled="
                                                loading.isDisabled(
                                                    unitDictionaryOptions.loading,
                                                    !!formFieldVariableModel.dictionaryId,
                                                    !!formFieldVariableModel.codeDictionaryId,
                                                )
                                            "
                                            label="Unit Dictionary"
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :enable-clear="true"
                                            :ellipse-count="49"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit`"
                                            :disabled="
                                                loading.isDisabled(
                                                    unitDictionaryOptions.loading,
                                                    !!formFieldVariableModel.dictionaryId,
                                                    !!formFieldVariableModel.codeDictionaryId,
                                                )
                                            "
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: 'Unit Dictionaries',
                                                        module: 'Branch',
                                                        page: 'Unit Dictionaries',
                                                        data: {
                                                            id: Number(
                                                                tabData[activeTab.label].data
                                                                    .branchId,
                                                            ),
                                                            branchName: String(
                                                                tabData[activeTab.label].data
                                                                    .branchName,
                                                            ),
                                                        },
                                                    });
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Add'"
                                                icon="circle-plus"
                                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                    </div>
                                    <div class="flex flex-row items-center">
                                        <edc-dropdown
                                            :key="
                                                formFieldVariableModel.codeDictionaryId
                                                    ? `codeDictionaryId-${formFieldVariableModel.codeDictionaryId}`
                                                    : 'codeDictionaryId'
                                            "
                                            v-model="formFieldVariableModel.codeDictionaryId"
                                            container-class="flex !flex-row !items-center !gap-[1rem]"
                                            :options="codingDictionaryLookups"
                                            label="Coding Dictionary"
                                            :loading="codingDictionaryOptions.loading"
                                            :disabled="
                                                loading.isDisabled(
                                                    codingDictionaryOptions.loading,
                                                    !!formFieldVariableModel.dictionaryId,
                                                    !!formFieldVariableModel.unitDictionaryId,
                                                )
                                            "
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :ellipse-count="49"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit`"
                                            :disabled="
                                                loading.isDisabled(
                                                    codingDictionaryOptions.loading,
                                                    !!formFieldVariableModel.dictionaryId,
                                                    !!formFieldVariableModel.unitDictionaryId,
                                                )
                                            "
                                            :on-click="
                                                () => {
                                                    //
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Add'"
                                                icon="circle-plus"
                                                :class="`${commonActionIconClasses('Add')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                    </div>
                                    <edc-pressable
                                        container-class="w-fit"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                applyVariable();
                                            }
                                        "
                                    >
                                        <span
                                            class="font-12 text-[var(--color-secondary)] font-semibold"
                                            >Apply Variable</span
                                        >
                                    </edc-pressable>
                                </div>
                            </template>
                            <template #Field>
                                <div class="grid grid-cols-1 gap-[1rem]">
                                    <edc-text-input
                                        v-model="formFieldModel.name"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field Name"
                                        :label-class="`${formFieldErrorModel.name ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                        :disabled="loading.isDisabled()"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
                                        :error="formFieldErrorModel.name"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.OID"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field OID"
                                        :disabled="loading.isDisabled()"
                                        :label-class="`${formFieldErrorModel.OID ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
                                        :error="formFieldErrorModel.OID"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.fieldNum"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field Num"
                                        :disabled="loading.isDisabled()"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                    />
                                    <edc-dropdown
                                        v-model="formFieldModel.indentLevel"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="INDENT_LEVEL_OPTIONS"
                                        :disabled="loading.isDisabled()"
                                        label="Indent Level"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :ellipse-count="62"
                                    />
                                </div>
                                <div class="grid grid-cols-3 gap-[1rem]">
                                    <edc-checkbox
                                        v-model="formFieldModel.isActive"
                                        label="Active"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="isActive"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.isLogDataEntry"
                                        label="Log Data Entry"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="isLogDataEntry"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.requiresTranslation"
                                        label="Requires Translation"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="requiresTranslation"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.isVisible"
                                        label="Visible Field"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="isVisible"
                                    />
                                    <edc-checkbox
                                        v-if="
                                            ['Date', 'Time', 'DateTime'].includes(
                                                String(formFieldModel.controlType),
                                            )
                                        "
                                        v-model="formFieldModel.canSetRecordDate"
                                        label="Can Set Record Date"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="canSetRecordDate"
                                    />
                                    <edc-checkbox
                                        v-if="
                                            ['Date', 'Time', 'DateTime'].includes(
                                                String(formFieldModel.controlType),
                                            )
                                        "
                                        v-model="formFieldModel.canSetDataPageDate"
                                        label="Can Set DatePage date"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="canSetDataPageDate"
                                    />
                                    <edc-checkbox
                                        v-if="
                                            ['Date', 'Time', 'DateTime'].includes(
                                                String(formFieldModel.controlType),
                                            )
                                        "
                                        v-model="formFieldModel.canSetInstanceDate"
                                        label="Can Instance Date"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="canSetInstanceDate"
                                    />
                                    <edc-checkbox
                                        v-if="
                                            ['Date', 'Time', 'DateTime'].includes(
                                                String(formFieldModel.controlType),
                                            )
                                        "
                                        v-model="formFieldModel.canSetSubjectDate"
                                        label="Can Set Subject Date"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="canSetSubjectDate"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.showPreviousVisitValues"
                                        label="Show Previous Visit Values"
                                        :disabled="loading.isDisabled()"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="showPreviousVisitValues"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.doesNotParticipateInSignature"
                                        container-class="col-span-2"
                                        label="Does Not Participate In Signature"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        input-class="admin-input-font"
                                        name="doesNotParticipateInSignature"
                                    />
                                </div>
                                <div class="grid grid-cols-1 gap-[1rem]">
                                    <edc-text-input
                                        v-model="formFieldModel.header"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Header Text"
                                        label-class="mb-0 admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                    />
                                    <edc-text-area
                                        v-model="formFieldModel.label"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        label="Field Label"
                                        label-class="mb-0 admin-input-font"
                                        :disabled="loading.isDisabled()"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                    />
                                    <edc-dropdown
                                        v-model="formFieldModel.controlType"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="controlTypeLookups"
                                        label="Control Type"
                                        :label-class="`${formFieldErrorModel.controlType ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                        input-class="w-full admin-input-font"
                                        :disabled="loading.isDisabled(controlTypeOptions.loading)"
                                        :loading="controlTypeOptions.loading"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
                                        :error="formFieldErrorModel.controlTypeName"
                                        :ellipse-count="62"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.fixedUnit"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field Unit"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.validExtensions"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Accept Files With Extensions"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-dropdown
                                        v-model="formFieldModel.labAnalyte"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="[]"
                                        label="Lab Analyte"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                        :ellipse-count="62"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.defaultValue"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Default Value"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-checkbox
                                        container-class="ml-[18.3%]"
                                        label="Use Current Date Time"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="currentDateTime"
                                        :disabled="loading.isDisabled()"
                                        :checked="formFieldModel.defaultValue === '=NOW()'"
                                        @on-change="
                                            (currentValue) => {
                                                if (currentValue)
                                                    formFieldModel.defaultValue = '=NOW()';
                                                else formFieldModel.defaultValue = null;
                                            }
                                        "
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.sasLabel"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="SAS Label"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.sasFormat"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="SAS Format"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                </div>
                            </template>
                            <template #FieldHelpText>
                                <div class="grid grid-cols-1 gap-[1rem]">
                                    <edc-text-area
                                        v-model="formFieldModel.helpText"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        label="Help Text"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :disabled="loading.isDisabled()"
                                    />
                                </div>
                            </template>
                            <template #FieldEditChecks>
                                <div class="grid grid-cols-1 gap-[1rem]">
                                    <edc-checkbox
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForRequiredDataEntry
                                        "
                                        label="Auto-Query For Required Data Entry"
                                        label-class="!mb-[0rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForRequiredDataEntry"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-checkbox
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForNonConformantData
                                        "
                                        label="Auto-Query For Non-Conformant Data"
                                        label-class="!mb-[0rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForNonConformantData"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <!-- TODO Show the below only if ControlType = DateTime -->
                                    <edc-checkbox
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForFutureDateOrTime
                                        "
                                        label="Auto-Query For Future Date/Time"
                                        label-class="!mb-[0rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForFutureDateOrTime"
                                        :disabled="loading.isDisabled()"
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[2rem]">
                                    <edc-form-label
                                        input-id="dataOutOfRangeMinMax"
                                        label="Auto-Query for data out of range"
                                        label-class="input-label text-label admin-input-font !mt-[3rem] !w-[23rem]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForDataOutOfRange.low
                                        "
                                        container-class="w-[5rem]"
                                        type="number"
                                        label="Low"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForDataOutOfRange.high
                                        "
                                        container-class="w-[5rem]"
                                        type="number"
                                        label="High"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[2rem]">
                                    <edc-form-label
                                        input-id="nonConformantDataOutOfRangeMinMax"
                                        label="Mark non-conformant data out of range"
                                        label-class="input-label text-label admin-input-font !mt-[3rem] !w-[23rem]"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.makeNonConformantDataOutOfRange
                                                .low
                                        "
                                        container-class="w-[5rem]"
                                        type="text"
                                        label="Low"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.makeNonConformantDataOutOfRange
                                                .high
                                        "
                                        container-class="w-[5rem]"
                                        type="text"
                                        label="High"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="loading.isDisabled()"
                                    />
                                </div>
                            </template>
                            <template #VerificationAndReviews>
                                <div class="flex flex-col gap-[1rem]">
                                    <edc-checkbox
                                        v-model="fieldRestrictionModel.requiresVerification"
                                        label="Requires verification"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="requiresVerification"
                                        :disabled="loading.isDisabled()"
                                    />
                                    <edc-checkbox
                                        v-model="fieldRestrictionModel.requiresManualReview"
                                        label="Requires Manual Reviews"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="requiresManualReview"
                                        :disabled="loading.isDisabled()"
                                        @on-change="
                                            () => {
                                                if (!fieldRestrictionModel.requiresManualReview) {
                                                    fieldRestrictionModel.manualReviews = deepClone(
                                                        fieldRestrictionModelRef.manualReviews,
                                                    );
                                                }
                                            }
                                        "
                                    />
                                    <admin-field-grant-permission-list
                                        v-if="fieldRestrictionModel.requiresManualReview"
                                        v-model="fieldRestrictionModel.manualReviews"
                                        :list="manualReviewRoleLookups"
                                        container-class="!ml-0 w-full"
                                        :disabled="loading.isDisabled(manualReviewRoles.loading)"
                                        name="manualReviews"
                                    />
                                </div>
                            </template>
                            <template #ViewRestrictions>
                                <div class="flex flex-col gap-[1rem]">
                                    <admin-field-grant-permission-list
                                        v-model="fieldRestrictionModel.viewRestrictions"
                                        :list="viewRestrictionRoleLookups"
                                        container-class="!ml-0 w-full"
                                        :disabled="loading.isDisabled(viewRestrictionRoles.loading)"
                                        name="viewRestriction"
                                    />
                                </div>
                            </template>
                            <template #EntryRestrictions>
                                <div class="flex flex-col gap-[1rem]">
                                    <admin-field-grant-permission-list
                                        v-model="fieldRestrictionModel.entryRestrictions"
                                        :list="entryRestrictionRoleLookups"
                                        container-class="!ml-0 w-full"
                                        :disabled="
                                            loading.isDisabled(entryRestrictionRoles.loading)
                                        "
                                        name="entryRestriction"
                                    />
                                </div>
                            </template>
                            <template #EditChecks>
                                <div class="flex flex-col justify-start items-start gap-[0.5rem]">
                                    <admin-action-label
                                        icon="circle-plus"
                                        text="Add New"
                                        :disabled="loading.isDisabled(editCheckOptions.loading)"
                                        :on-click="
                                            () => {
                                                adminWinFormStore.triggerGoBack = true;
                                                emit('on-row-select', {
                                                    label: 'Edit Checks',
                                                    module: 'Branch',
                                                    page: 'Edit Checks',
                                                    data: {
                                                        id: Number(
                                                            tabData[activeTab.label].data.branchId,
                                                        ),
                                                        branchName: String(
                                                            tabData[activeTab.label].data
                                                                .branchName,
                                                        ),
                                                    },
                                                });
                                            }
                                        "
                                    />
                                    <div
                                        v-for="checkRow of editCheckLookups"
                                        :key="checkRow.label"
                                        class="flex flex-row items-center gap-[0.5rem]"
                                    >
                                        <edc-checkbox
                                            :key="checkRow.label"
                                            :name="checkRow.label"
                                            :checked="isEditCheckAssigned(checkRow)"
                                            :set-checked-to-model="true"
                                            @on-change="
                                                (checkedValue) => {
                                                    handleAssignedFieldEditChecks(
                                                        checkRow,
                                                        checkedValue,
                                                    );
                                                }
                                            "
                                        />
                                        <edc-pressable
                                            :disabled="loading.isDisabled(editCheckOptions.loading)"
                                            container-class="opacity-100 hover:opacity-100"
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: checkRow.label,
                                                        module: 'Edit Checks',
                                                        page: 'Edit Checks Entries',
                                                        data: {
                                                            id: checkRow.value as number,
                                                            branchName: String(
                                                                tabData[activeTab.label].data
                                                                    .branchName,
                                                            ),
                                                            branchId: Number(
                                                                tabData[activeTab.label].data
                                                                    .branchId,
                                                            ),
                                                        },
                                                    });
                                                }
                                            "
                                        >
                                            <span
                                                class="transition-all underline underline-offset-[0.3rem] text-[var(--color-black)] hover:text-[var(--color-secondary)] font-12"
                                                >{{ checkRow.label }}</span
                                            >
                                        </edc-pressable>
                                    </div>
                                </div>
                            </template>
                            <template #Derivations>
                                <div class="flex flex-col justify-start items-start gap-[0.5rem]">
                                    <admin-action-label
                                        icon="circle-plus"
                                        text="Add New"
                                        :disabled="loading.isDisabled(derivationOptions.loading)"
                                        :on-click="
                                            () => {
                                                adminWinFormStore.triggerGoBack = true;
                                                emit('on-row-select', {
                                                    label: 'Derivations',
                                                    module: 'Branch',
                                                    page: 'Derivations',
                                                    data: {
                                                        id: Number(
                                                            tabData[activeTab.label].data.branchId,
                                                        ),
                                                        branchName: String(
                                                            tabData[activeTab.label].data
                                                                .branchName,
                                                        ),
                                                    },
                                                });
                                            }
                                        "
                                    />
                                    <div
                                        v-for="checkRow of derivationLookups"
                                        :key="checkRow.label"
                                        class="flex flex-row items-center gap-[0.5rem]"
                                    >
                                        <edc-checkbox
                                            :key="checkRow.label"
                                            :name="checkRow.label"
                                            :checked="isDerivationAssigned(checkRow)"
                                            :set-checked-to-model="true"
                                            @on-change="
                                                (checkedValue) => {
                                                    handleAssignedFieldDerivations(
                                                        checkRow,
                                                        checkedValue,
                                                    );
                                                }
                                            "
                                        />
                                        <edc-pressable
                                            :disabled="loading.isDisabled(editCheckOptions.loading)"
                                            container-class="opacity-100 hover:opacity-100"
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: checkRow.label,
                                                        module: 'Derivations',
                                                        page: 'Derivation Entries',
                                                        data: {
                                                            id: checkRow.value as number,
                                                            branchName: String(
                                                                tabData[activeTab.label].data
                                                                    .branchName,
                                                            ),
                                                            branchId: Number(
                                                                tabData[activeTab.label].data
                                                                    .branchId,
                                                            ),
                                                        },
                                                    });
                                                }
                                            "
                                        >
                                            <span
                                                class="transition-all underline underline-offset-[0.3rem] text-[var(--color-black)] hover:text-[var(--color-secondary)] font-12"
                                                >{{ checkRow.label }}</span
                                            >
                                        </edc-pressable>
                                    </div>
                                    <!-- <edc-pressable
                                        v-for="derivation of derivationLookups"
                                        :key="derivation.label"
                                        :disabled="loading.isDisabled(derivationOptions.loading)"
                                        container-class="opacity-100 hover:opacity-100"
                                        :on-click="
                                            () => {
                                                adminWinFormStore.triggerGoBack = true;
                                                emit('on-row-select', {
                                                    label: derivation.label,
                                                    module: 'Derivations',
                                                    page: 'Derivation Entries',
                                                    data: {
                                                        id: derivation.value as number,
                                                        branchName: String(
                                                            tabData[activeTab.label].data
                                                                .branchName,
                                                        ),
                                                    },
                                                });
                                            }
                                        "
                                    >
                                        <span
                                            class="transition-all underline underline-offset-[0.3rem] text-[var(--color-black)] hover:text-[var(--color-secondary)] font-12"
                                            >{{ derivation.label }}</span
                                        >
                                    </edc-pressable> -->
                                </div>
                            </template>
                            <template #PatientCloudOptions>
                                <div class="flex flex-col justify-start items-start gap-[0.5rem]">
                                    <edc-dropdown
                                        v-model="formFieldPatientCloudOptionModel.controlType"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="[]"
                                        label="Control Type"
                                        label-class="mb-0 admin-input-font !w-[30%]"
                                        input-class="admin-input-font w-[15rem]"
                                        :disabled="true"
                                    />
                                </div>
                            </template>
                        </admin-form-field-settings>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
    <edc-popup-modal
        v-if="showFindVariableModel"
        modal-id="adminFindVariableModal"
        submit-label="Select"
        :on-cancel="
            (closeModal) => {
                resetFindVariableModel(closeModal);
            }
        "
        :on-submit="
            async (closeModal) => {
                handleVariableSelect(closeModal);
            }
        "
    >
        <h4 class="self-start font-bold font-13">Find Variable</h4>
        <div class="grid grid-cols-1 gap-x-[5rem] gap-y-[1rem]">
            <edc-dropdown
                v-model="findVariableModel.formId"
                container-class="w-[34rem]"
                placeholder="Select a form"
                label="Form"
                :options="formLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :loading="formOptions.loading"
                :disabled="loading.isDisabled(formOptions.loading)"
                :ellipse-count="50"
                @on-select="
                    async () => {
                        await fieldsList();
                    }
                "
            />
            <edc-dropdown
                v-model="findVariableModel.fieldId"
                container-class="w-[34rem]"
                placeholder="Select a Field"
                label="Field"
                :options="fieldLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :loading="fieldOptions.loading"
                :disabled="loading.isDisabled(fieldOptions.loading)"
                :ellipse-count="50"
                @on-select="
                    async () => {
                        await triggerVariablesList();
                    }
                "
            />
            <edc-search-bar
                v-model="findVariableModel.variableSearch"
                container-class="w-[34rem]"
                element-id="variableSearch"
                label="Variable"
                label-class="font-bold admin-input-font"
                :disabled="loading.isDisabled()"
                input-class="admin-input-font"
                @on-search="
                    async () => {
                        await triggerVariablesList();
                        globalStore.triggerSearchBarRefocus('#variableSearch');
                    }
                "
            />
            <edc-dropdown
                v-model="findVariableModel.variableId"
                container-class="w-[34rem]"
                placeholder="Select a variable"
                label="Available Variables"
                :options="variableLookups"
                label-class="font-bold admin-input-font"
                input-class="admin-input-font"
                option-placement="bottom"
                option-class="w-[34rem]"
                :loading="variableOptions.loading"
                :disabled="loading.isDisabled(variableOptions.loading)"
                :error="findVariableModel.variableError"
                :ellipse-count="50"
                @on-select="
                    () => {
                        onVariableSelect();
                    }
                "
            />
        </div>
    </edc-popup-modal>
    <edc-popup-modal
        v-if="showPreviewFormFields"
        modal-id="adminPreviewFormFields"
        submit-label="Close"
        :hide-cancel="true"
        :on-submit="
            (closeModal) => {
                resetPreviewModel(closeModal);
            }
        "
        :on-cancel="
            (closeModal) => {
                resetPreviewModel(closeModal);
            }
        "
    >
        <span class="text-[1.2rem] font-semibold self-start"
            >This is how the form will look when an end user tries to fill the form in EDC</span
        >
        <div class="grid grid-cols-1 gap-x-[5rem] gap-y-[1rem] min-w-[70vw]">
            <edc-data-collection-form-generation
                :forms-list="dataCollectionFormDetails"
                :forms-list-ref="dataCollectionFormDetailsRef"
                :published-subject-form-field-details="{}"
                :published-subject-form-details="[]"
                :loading="loading"
                :is-model-changed="false"
                :is-preview="true"
                :log-form-details="{}"
                :data-collection-details="{}"
                :current-log-form-edit-index="-1"
                :handle-cancel="() => {}"
                :handle-delete="async () => {}"
                :handle-submit="async () => {}"
                :handle-log-form-submit="async () => {}"
                :handle-go-next="() => {}"
                @on-model-change-process-derivation="
                    () => {
                        processFormFieldDerivationOnChange();
                    }
                "
                @on-model-change-check-visibility="
                    async () => {
                        await checkForInitialFormFieldVisibility();
                    }
                "
                @on-model-change-check-disable="
                    async () => {
                        await checkForInitialFormFieldDisable();
                    }
                "
            />
        </div>
    </edc-popup-modal>
</template>

<style scoped></style>
