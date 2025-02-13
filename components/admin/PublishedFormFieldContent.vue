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
        TVoidAction,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";
    import Loading from "~/services/apis/data/loading";
    import {
        controlTypesListAPI,
        type IAssignedFieldDerivation,
        type IAssignedFieldEditCheck,
    } from "~/services/apis/handlers/admin/form-field";
    import useToastStore from "~/stores/toast";
    import type { IFormFieldData } from "~/services/apis/handlers/types/admin/form-field-types";
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import useAdminWinFormStore from "~/stores/admin-winform";
    import { INDENT_LEVEL_OPTIONS } from "~/constants/options";
    import type { IDictionaryListData } from "~/services/apis/handlers/types/admin/dictionary-types";
    import type { IUnitDictionaryListData } from "~/services/apis/handlers/types/admin/unit-dictionary-types";
    import FieldRestriction from "~/services/apis/data/admin/field-restriction";
    import { rolesListAPI, rolesListByGroupNameAPI } from "~/services/apis/handlers/admin/user";
    import {
        assignedDerivationsByPublishedFormIdAPI,
        derivationsListByReleaseVersionIdAPI,
        disableFieldEditChecksByPublishedFormIdAPI,
        editChecksListByReleaseVersionIdAPI,
        fieldVisiblityEditChecksByPublishedFormIdAPI,
        previewPublishedFormFieldsAPI,
        publishedDictionaryListByReleaseVersionIdAPI,
        publishedFormFieldPaginationListAPI,
        publishedFormFieldsGetByIDAPI,
        publishedUnitDictionaryListByReleaseVersionIdAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedEditCheckListData,
        IPublishedFormFieldData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import usePopupModalStore from "~/stores/popup-modal";
    import type {
        IGenerateFormFieldsData,
        IPublishedDataDictionaryEntryListData,
        IPublishedUnitDictionaryEntryListData,
        TFormFieldDerivationData,
        TFormFieldDisableEditCheckData,
        TFormFieldVisibiltyEditCheckData,
    } from "~/services/apis/handlers/types/data-collection-types";
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
        ITextInputProps,
    } from "~/types/form-generation";
    import {
        previewDataDictionaryEntriesListByIdAPI,
        previewUnitDictionaryEntriesListByIdAPI,
    } from "~/services/apis/handlers/portal/data-collection";
    import useDataCollectionStore from "~/stores/data-collection";
    import useGlobalStore from "~/stores/global";

    interface ITableData {
        id: TNullableNumber;
        num: TNullableString;
        name: TNullableString;
        label: TNullableString;
        format: TNullableString;
        isActive: boolean;
        orderNumber: number;
        tempID: string;
    }

    interface IUniqueId {
        uniqueId: number;
    }

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
            }>,
        ];
    }>();

    const popupModalStore = usePopupModalStore();
    const toastStore = useToastStore();
    const adminWinFormStore = useAdminWinFormStore();
    const dataCollectionStore = useDataCollectionStore();
    const loading = ref<Loading>(new Loading());

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

    const dataDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const unitDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const codingDictionaryOptions = ref<DropdownOption>(new DropdownOption());
    const editCheckOptions = ref<DropdownOption>(new DropdownOption());
    const derivationOptions = ref<DropdownOption>(new DropdownOption());
    const controlTypeOptions = ref<DropdownOption>(new DropdownOption());
    const manualReviewRoles = ref<DropdownOption>(new DropdownOption());
    const roleOptions = ref<DropdownOption>(new DropdownOption());
    const showPreviewFormFields = ref<boolean>(false);
    const dataCollectionFormFieldDetailsList = ref<IGenerateFormFieldsData[]>([]);
    const dataCollectionFormDetails = ref<TDataCollectionFormDetails>({});
    const dataCollectionFormDetailsRef = ref<TDataCollectionFormDetails>({});
    const dataDictionaryEntriesList = ref<IPublishedDataDictionaryEntryListData[]>([]);
    const unitDictionaryEntriesList = ref<IPublishedUnitDictionaryEntryListData[]>([]);
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

    const editCheckLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of editCheckOptions.value
            .options as unknown as IPublishedEditCheckListData[]) {
            result.push({
                label: row.isGlobal ? `${row.name} (Global)` : row.name,
                value: row.id,
            });
        }
        return deepClone(result) as IOptions[];
    });

    const derivationLookups = computed(() =>
        getOptionsList(derivationOptions.value.options, "name", "id"),
    );

    const controlTypeLookups = computed(() =>
        getOptionsList(controlTypeOptions.value.options, "name", "id"),
    );

    const manualReviewRoleLookups = computed(() =>
        getOptionsList(manualReviewRoles.value.options, "role", "id"),
    );

    const roleLookups = computed(() => getOptionsList(roleOptions.value.options, "role", "id"));

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Fields - ${props.tabData[props.activeTab.label].data.formName}`
            : "Published Fields",
    );

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

    function closeDetails() {
        if (isFormEdit.value) isFormEdit.value = false;
        resetFormModel();
    }

    function setTableData(tableData: IPublishedFormFieldData[]): ITableData[] {
        return tableData.map((row) => ({
            id: row.id,
            num: row.fieldNum,
            name: row.name,
            label: row.label,
            format: row.format,
            isActive: row.isActive,
            orderNumber: row.orderNumber,
            tempID: uniqueID(),
        }));
    }

    async function publishedFormFieldPaginationList() {
        loading.value.table = true;
        const { status, message, data } = await publishedFormFieldPaginationListAPI(
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

    async function publishedFormFieldsGetByID(
        publishedFieldId: string,
    ): Promise<IFormFieldData | null> {
        let responseData = null;
        loading.value.secondaryTable = true;
        const { status, message, data } = await publishedFormFieldsGetByIDAPI(publishedFieldId);
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

    async function handleFieldEdit(index: number) {
        const rowData = originalTableResponse.value[index];
        const responseData = await publishedFormFieldsGetByID(String(rowData.id));
        if (responseData) {
            if (
                getArrayLength(dataDictionaryOptions.value.options) === 0 ||
                getArrayLength(unitDictionaryOptions.value.options) === 0 ||
                getArrayLength(editCheckOptions.value.options) === 0 ||
                getArrayLength(derivationOptions.value.options) === 0 ||
                getArrayLength(manualReviewRoles.value.options) === 0 ||
                getArrayLength(roleOptions.value.options) === 0
            ) {
                await Promise.all([
                    dataDictionaryList(),
                    unitDictionaryList(),
                    editCheckListByReleaseVersionId(),
                    derivationsList(),
                    manualReviewRolesList(),
                    rolesList(),
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

    async function dataDictionaryList() {
        dataDictionaryOptions.value.loading = true;
        const { status, data, message } = await publishedDictionaryListByReleaseVersionIdAPI(
            String(props.tabData[props.activeTab.label].data.releaseVersionId),
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
        const { status, data, message } = await publishedUnitDictionaryListByReleaseVersionIdAPI(
            String(props.tabData[props.activeTab.label].data.releaseVersionId),
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

    async function editCheckListByReleaseVersionId() {
        editCheckOptions.value.loading = true;
        const { status, data, message } = await editChecksListByReleaseVersionIdAPI(
            Number(props.tabData[props.activeTab.label].data.releaseVersionId),
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

    async function derivationsList() {
        derivationOptions.value.loading = true;
        const { status, data, message } = await derivationsListByReleaseVersionIdAPI(
            Number(props.tabData[props.activeTab.label].data.releaseVersionId),
        );
        if (status === 200) {
            derivationOptions.value.options = deepClone(data);
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

    async function rolesList() {
        roleOptions.value.loading = true;
        const { status, data, message } = await rolesListAPI();
        if (status === 200) {
            roleOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            roleOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        roleOptions.value.loading = false;
    }

    async function publishedDataDictionaryEntriesListById(params: IDictionaryDetails) {
        if (
            getArrayLength(params.globalDictionaryIds) > 0 ||
            getArrayLength(params.publishedDictionaryIds) > 0
        ) {
            loading.value.dynamicLoading["dataCollectionDataDictionaryEntriesList"] = true;
            const { status, data } = await previewDataDictionaryEntriesListByIdAPI({
                isPublished: true,
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
                isPublished: true,
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
                    } as ITextInputProps;
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
                    // Checkbox FIXME: add the content
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
                    // 8 -> Horizontal radio, 9 -> Vertical radio FIXME: add the content
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
                    // 10 -> File upload FIXME: add the content
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

    function processFormFieldDerivationOnChange() {
        processFormFieldDerivation({
            assignedFieldDerivations: assignedFormFieldDerivations.value,
            formsList: dataCollectionFormDetails.value,
            runOnceFieldIds: triggerDerivationOnlyOnceIds.value,
            checkForVisitId: false,
        });
    }

    async function assignedDerivationsByPublishedFormId() {
        const { status, data } = await assignedDerivationsByPublishedFormIdAPI(
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

    async function fieldVisiblityEditChecksByPublishedFormId() {
        const { status, data } = await fieldVisiblityEditChecksByPublishedFormIdAPI(
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

    async function disableFieldEditChecksByPublishedFormId() {
        const { status, data } = await disableFieldEditChecksByPublishedFormIdAPI(
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

    async function previewPublishedFormFields() {
        loading.value.dynamicLoading["preview"] = true;
        triggerDerivationOnlyOnceIds.value = [];
        const { status, data, message } = await previewPublishedFormFieldsAPI(
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

    async function handlePublishedFormFieldPreview() {
        loading.value.dynamicLoading["dataCollectionGrid"] = true;
        showPreviewFormFields.value = true;
        popupModalStore.show("adminPreviewFormFields");
        // await previewPublishedFormFields();
        await Promise.all([previewPublishedFormFields()]).then(async () => {
            await Promise.all([
                assignedDerivationsByPublishedFormId(),
                fieldVisiblityEditChecksByPublishedFormId(),
                disableFieldEditChecksByPublishedFormId(),
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

    onMounted(async () => {
        loading.value.setDynamicLoading(["preview", "dataCollectionGrid"]);
        await publishedFormFieldPaginationList();
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
                                                await publishedFormFieldPaginationList();
                                                useGlobalStore().triggerSearchBarRefocus(
                                                    '#fieldSearch',
                                                );
                                            }
                                        "
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[1rem]">
                                    <admin-action-label
                                        icon="magnifying-glass"
                                        text="Preview"
                                        container-class="-ml-[0.4rem]"
                                        :disabled="loading.isDisabled(isFormEdit)"
                                        :on-click="
                                            async () => {
                                                await handlePublishedFormFieldPreview();
                                            }
                                        "
                                    />
                                    <admin-action-label
                                        v-if="isFormEdit"
                                        icon="circle-check"
                                        text="Done"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                closeDetails();
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
                                    :enable-reorder="false"
                                    :custom-content="true"
                                    :disabled="loading.isDisabled(isFormEdit)"
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
                                    <template #action="{ index }">
                                        <edc-pressable
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled(isFormEdit)"
                                            :on-click="
                                                async () => {
                                                    await handleFieldEdit(index);
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Details'"
                                                icon="eye"
                                                :class="`${commonActionIconClasses('Details')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
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
                                            :disabled="true"
                                            input-container-class="w-[80%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :required="
                                                !!formFieldVariableModel.format ||
                                                !!formFieldVariableModel.dictionaryId ||
                                                !!formFieldVariableModel.unitDictionaryId ||
                                                !!formFieldVariableModel.codeDictionaryId
                                            "
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit invisible ${formFieldVariableErrorModel.OID ? 'mb-[1.8rem]' : 'mb-0'}`"
                                            :disabled="true"
                                            :on-click="() => {}"
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
                                            :disabled="true"
                                            :required="
                                                !!formFieldVariableModel.OID ||
                                                !!formFieldVariableModel.dictionaryId ||
                                                !!formFieldVariableModel.unitDictionaryId ||
                                                !!formFieldVariableModel.codeDictionaryId
                                            "
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
                                            :disabled="true"
                                            label="Dictionary"
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :enable-clear="true"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit invisible`"
                                            :disabled="true"
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
                                            :disabled="true"
                                            label="Unit Dictionary"
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                            :enable-clear="true"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit invisible`"
                                            :disabled="true"
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
                                            :disabled="true"
                                            label-class="mb-0 admin-input-font"
                                            input-class="admin-input-font"
                                            input-container-class="w-[79%]"
                                            label-container-class="min-w-[17%] max-w-[17%]"
                                        />
                                        <edc-pressable
                                            :container-class="`w-fit invisible`"
                                            :disabled="true"
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
                                        :disabled="true"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.OID"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field OID"
                                        :disabled="true"
                                        :label-class="`${formFieldErrorModel.OID ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                        input-class="admin-input-font"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
                                    />
                                    <edc-text-input
                                        v-model="formFieldModel.fieldNum"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        type="text"
                                        label="Field Num"
                                        :disabled="true"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        input-container-class="w-[80%]"
                                    />
                                    <edc-dropdown
                                        :key="`indent-${formFieldModel.indentLevel}`"
                                        v-model="formFieldModel.indentLevel"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="INDENT_LEVEL_OPTIONS"
                                        :disabled="true"
                                        label="Indent Level"
                                        label-class="mb-0 admin-input-font"
                                        input-class="admin-input-font"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        input-container-class="w-[80%]"
                                    />
                                </div>
                                <div class="grid grid-cols-3 gap-[1rem]">
                                    <edc-checkbox
                                        v-model="formFieldModel.isActive"
                                        label="Active"
                                        :disabled="true"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="isActive"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.isLogDataEntry"
                                        label="Log Data Entry"
                                        :disabled="true"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="isLogDataEntry"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.requiresTranslation"
                                        label="Requires Translation"
                                        :disabled="true"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="requiresTranslation"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.isVisible"
                                        label="Visible Field"
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="canSetSubjectDate"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.showPreviousVisitValues"
                                        label="Show Previous Visit Values"
                                        :disabled="true"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="showPreviousVisitValues"
                                    />
                                    <edc-checkbox
                                        v-model="formFieldModel.doesNotParticipateInSignature"
                                        container-class="col-span-2"
                                        label="Does Not Participate In Signature"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        :disabled="true"
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
                                        :disabled="true"
                                        input-class="admin-input-font"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        input-container-class="w-[80%]"
                                    />
                                    <edc-text-area
                                        v-model="formFieldModel.label"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        label="Field Label"
                                        label-class="mb-0 admin-input-font"
                                        :disabled="true"
                                        input-class="admin-input-font"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        input-container-class="w-[80%]"
                                    />
                                    <edc-dropdown
                                        v-model="formFieldModel.controlType"
                                        container-class="flex !flex-row !items-center !gap-[1rem]"
                                        :options="controlTypeLookups"
                                        label="Control Type"
                                        :label-class="`${formFieldErrorModel.controlType ? 'mb-[1.6rem]' : 'mb-0'} admin-input-font`"
                                        input-class="w-full admin-input-font"
                                        :disabled="true"
                                        input-container-class="w-[80%]"
                                        label-container-class="min-w-[16%] max-w-[16%]"
                                        :required="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
                                    />
                                    <edc-checkbox
                                        container-class="ml-[18.3%]"
                                        label="Use Current Date Time"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="currentDateTime"
                                        :disabled="true"
                                        :checked="formFieldModel.defaultValue === '=NOW()'"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForRequiredDataEntry"
                                        :disabled="true"
                                    />
                                    <edc-checkbox
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForNonConformantData
                                        "
                                        label="Auto-Query For Non-Conformant Data"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForNonConformantData"
                                        :disabled="true"
                                    />
                                    <!-- TODO Show the below only if ControlType = DateTime -->
                                    <edc-checkbox
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForFutureDateOrTime
                                        "
                                        label="Auto-Query For Future Date/Time"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="autoQueryForFutureDateOrTime"
                                        :disabled="true"
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[2rem]">
                                    <edc-form-label
                                        input-id="dataOutOfRangeMinMax"
                                        label="Auto-Query for data out of range"
                                        label-class="input-label text-label admin-input-font !mt-[3rem] !w-[23rem]"
                                        :disabled="true"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForDataOutOfRange.low
                                        "
                                        container-class="w-[5rem]"
                                        type="text"
                                        label="Low"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="true"
                                    />
                                    <edc-text-input
                                        v-model="
                                            formFieldEditCheckModel.autoQueryForDataOutOfRange.high
                                        "
                                        container-class="w-[5rem]"
                                        type="text"
                                        label="High"
                                        label-class="mb-0 ml-[1.3rem] admin-input-font !w-[30%]"
                                        input-class="admin-input-font"
                                        :disabled="true"
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[2rem]">
                                    <edc-form-label
                                        input-id="nonConformantDataOutOfRangeMinMax"
                                        label="Mark non-conformant data out of range"
                                        label-class="input-label text-label admin-input-font !mt-[3rem] !w-[23rem]"
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
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
                                        :disabled="true"
                                    />
                                    <edc-checkbox
                                        v-model="fieldRestrictionModel.requiresManualReview"
                                        label="Requires Manual Reviews"
                                        label-class="!mb-[0.2rem] admin-input-font"
                                        input-class="admin-input-font"
                                        name="requiresManualReview"
                                        :disabled="true"
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
                                        :disabled="true"
                                        name="manualReviews"
                                    />
                                </div>
                            </template>
                            <template #ViewRestrictions>
                                <div class="flex flex-col gap-[1rem]">
                                    <admin-field-grant-permission-list
                                        v-model="fieldRestrictionModel.viewRestrictions"
                                        :list="roleLookups"
                                        container-class="!ml-0 w-full"
                                        :disabled="true"
                                        name="viewRestriction"
                                    />
                                </div>
                            </template>
                            <template #EntryRestrictions>
                                <div class="flex flex-col gap-[1rem]">
                                    <admin-field-grant-permission-list
                                        v-model="fieldRestrictionModel.entryRestrictions"
                                        :list="roleLookups"
                                        container-class="!ml-0 w-full"
                                        :disabled="true"
                                        name="entryRestriction"
                                    />
                                </div>
                            </template>
                            <template #EditChecks>
                                <div class="flex flex-col justify-start items-start gap-[0.5rem]">
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
                                            :disabled="true"
                                        />
                                        <edc-pressable
                                            :disabled="loading.isDisabled(editCheckOptions.loading)"
                                            container-class="opacity-100 hover:opacity-100"
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: checkRow.label,
                                                        module: 'Published Edit Checks',
                                                        page: 'Published Edit Checks Entries',
                                                        data: {
                                                            id: checkRow.value as number,
                                                            releaseVersionName: String(
                                                                tabData[activeTab.label].data
                                                                    .releaseVersionName,
                                                            ),
                                                            releaseVersionId: Number(
                                                                tabData[activeTab.label].data
                                                                    .releaseVersionId,
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
                                            :disabled="true"
                                        />
                                        <edc-pressable
                                            :disabled="
                                                loading.isDisabled(derivationOptions.loading)
                                            "
                                            container-class="opacity-100 hover:opacity-100"
                                            :on-click="
                                                () => {
                                                    adminWinFormStore.triggerGoBack = true;
                                                    emit('on-row-select', {
                                                        label: checkRow.label,
                                                        module: 'Published Derivations',
                                                        page: 'Published Derivation Entries',
                                                        data: {
                                                            id: checkRow.value as number,
                                                            releaseVersionName: String(
                                                                tabData[activeTab.label].data
                                                                    .releaseVersionName,
                                                            ),
                                                            releaseVersionId: Number(
                                                                tabData[activeTab.label].data
                                                                    .releaseVersionId,
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
