<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading, { setLoaderForArrayDatas } from "~/services/apis/data/loading";
    import {
        fieldRestrictionsListByFormIdAPI,
        updateFieldRestrictionAPI,
    } from "~/services/apis/handlers/admin/field-restriction";
    import { formsListByBranchIdAPI } from "~/services/apis/handlers/admin/form";
    import {
        formRestrictionsListByFormIdAPI,
        updateFormRestrictionAPI,
    } from "~/services/apis/handlers/admin/form-restriction";
    import {
        assignToAllFieldsGlobalFieldRestrictionAPI,
        globalFieldRestrictionsListByFormIdAPI,
        removeFromAllFieldsGlobalFieldRestrictionAPI,
        updateGlobalFieldRestrictionAPI,
    } from "~/services/apis/handlers/admin/global-field-restriction";
    import { rolesListByGroupNameAPI } from "~/services/apis/handlers/admin/user";
    import type {
        IFieldRestrictionEntryData as IFieldRestrictionEntryAPIData,
        IFieldRestrictionData as IFieldRestrictionAPIData,
    } from "~/services/apis/handlers/types/admin/field-restriction-types";
    import type {
        IFormRestrictionEntryData as IFormRestrictionEntryAPIData,
        IFormRestrictionData as IFormRestrictionAPIData,
    } from "~/services/apis/handlers/types/admin/form-restriction-types";
    import type {
        IGlobalFieldRestrictionData as IGlobalFieldRestrictionAPIData,
        IGlobalFieldRestrictionEntryData as IGlobalFieldRestrictionEntryAPIData,
    } from "~/services/apis/handlers/types/admin/global-field-restriction-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type {
        IOptions,
        IWinFormProps,
        TNullableNumber,
        TNullableString,
        TOptionValue,
        TRestrictionEntry,
        TTableLoaderDetail,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    // interface IFormRestrictionEntryData {
    //     id: number;
    //     formRestrictionId: number;
    //     roleId: number;
    //     type: TRestrictionEntry;
    //     isActive: boolean;
    //     tempID: string;
    // }

    interface IFormRestrictionData {
        id: TNullableNumber;
        formId: number;
        formName: string;
        viewRestrictions: TOptionValue[];
        entryRestrictions: TOptionValue[];
        viewRestrictionsOriginal: IFormRestrictionEntryAPIData[];
        entryRestrictionsOriginal: IFormRestrictionEntryAPIData[];
        tempID: string;
    }

    interface IFieldRestrictionData {
        id: TNullableNumber;
        formId: number;
        formName: string;
        fieldId: number;
        fieldName: string;
        requiresVerification: boolean;
        defaultValue: TNullableString;
        manualReviews: TOptionValue[];
        viewRestrictions: TOptionValue[];
        entryRestrictions: TOptionValue[];
        manualReviewsOriginal: IFieldRestrictionEntryAPIData[];
        viewRestrictionsOriginal: IFieldRestrictionEntryAPIData[];
        entryRestrictionsOriginal: IFieldRestrictionEntryAPIData[];
        tempID: string;
    }

    interface IGlobalFieldRestrictionData {
        id: TNullableNumber;
        formId: number;
        formName: string;
        requiresVerification: boolean;
        manualReviews: TOptionValue[];
        viewRestrictions: TOptionValue[];
        entryRestrictions: TOptionValue[];
        manualReviewsOriginal: IGlobalFieldRestrictionEntryAPIData[];
        viewRestrictionsOriginal: IGlobalFieldRestrictionEntryAPIData[];
        entryRestrictionsOriginal: IGlobalFieldRestrictionEntryAPIData[];
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const formId = ref<TNullableNumber>(null);
    const loading = ref<Loading>(new Loading());
    const editFormRestrictionDetails = ref<Record<string, boolean>>({});
    const editFieldRestrictionDetails = ref<Record<string, boolean>>({});
    const editGlobalFieldRestrictionDetails = ref<Record<string, boolean>>({});
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const manualReviewRoles = ref<DropdownOption>(new DropdownOption());
    const viewRestrictionRoles = ref<DropdownOption>(new DropdownOption());
    const entryRestrictionRoles = ref<DropdownOption>(new DropdownOption());
    const fieldRestrictionTableLoaderDetails = ref<TTableLoaderDetail>({});

    const formRestrictionColumns: IColumn[] = [
        {
            field: "restrictView",
            header: "Restrict View",
            icon: false,
            show: true,
        },
        {
            field: "restrictEntry",
            header: "Restrict Entry",
            icon: false,
            show: true,
        },
    ];
    const formRestrictionTableData = ref<IFormRestrictionData[]>([]);
    const formRestrictionTableDataRef = ref<IFormRestrictionData[]>(
        deepClone(formRestrictionTableData.value),
    );

    const fieldRestrictionColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "requiresVerification",
            header: "Requires Verification",
            icon: false,
            show: true,
        },
        {
            field: "manualReview",
            header: "Manual Review",
            icon: false,
            show: true,
        },
        {
            field: "restrictView",
            header: "Restrict View",
            icon: false,
            show: true,
        },
        {
            field: "restrictEntry",
            header: "Restrict Entry",
            icon: false,
            show: true,
        },
        {
            field: "defaultValue",
            header: "Default Value",
            icon: false,
            show: true,
        },
    ];
    const fieldRestrictionTableData = ref<IFieldRestrictionData[]>([]);
    const fieldRestrictionTableDataRef = ref<IFieldRestrictionData[]>(
        deepClone(fieldRestrictionTableData.value),
    );

    const globalFieldRestrictionColumns: IColumn[] = [
        {
            field: "requiresVerification",
            header: "Requires Verification",
            icon: false,
            show: true,
        },
        {
            field: "manualReview",
            header: "Manual Review",
            icon: false,
            show: true,
        },
        {
            field: "restrictView",
            header: "Restrict View",
            icon: false,
            show: true,
        },
        {
            field: "restrictEntry",
            header: "Restrict Entry",
            icon: false,
            show: true,
        },
    ];
    const globalFieldRestrictionTableData = ref<IGlobalFieldRestrictionData[]>([]);
    const globalFieldRestrictionTableDataRef = ref<IGlobalFieldRestrictionData[]>(
        deepClone(globalFieldRestrictionTableData.value),
    );

    const restrictionGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Restrictions - ${props.tabData[props.activeTab.label].data.branchName}`
            : "Restrictions",
    );

    const formLookups = computed(() => getOptionsList(formOptions.value.options, "formName", "id"));

    const manualReviewRoleLookups = computed(() =>
        getOptionsList(manualReviewRoles.value.options, "role", "id"),
    );

    const viewRestrictionRoleLookups = computed(() =>
        getOptionsList(viewRestrictionRoles.value.options, "role", "id"),
    );

    const entryRestrictionRoleLookups = computed(() =>
        getOptionsList(entryRestrictionRoles.value.options, "role", "id"),
    );

    async function formList() {
        formOptions.value.loading = true;
        const { status, data, message } = await formsListByBranchIdAPI(
            props.tabData[props.activeTab.label].data.id,
        );
        if (status === 200) {
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

    // Form Restrictions
    const setFormRestrictionEntryTableData = (tableData: IFormRestrictionEntryAPIData[]) =>
        tableData.map((row) => ({
            id: row.id,
            formRestrictionId: row.formRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IFormRestrictionEntryAPIData[];

    function setRestrictionEntries(tableData: IFormRestrictionEntryAPIData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setFormRestrictionTableData(
        tableData: IFormRestrictionAPIData[],
    ): IFormRestrictionData[] {
        if (getArrayLength(tableData) > 0)
            return tableData.map((row) => ({
                id: row.id,
                formId: row.formId,
                formName: row.formName,
                viewRestrictions: setRestrictionEntries(row.viewRestrictions),
                entryRestrictions: setRestrictionEntries(row.entryRestrictions),
                viewRestrictionsOriginal: setFormRestrictionEntryTableData(row.viewRestrictions),
                entryRestrictionsOriginal: setFormRestrictionEntryTableData(row.entryRestrictions),
                tempID: uniqueID(),
            }));
        return [
            {
                id: 0,
                formId: Number(formId.value),
                formName: "",
                viewRestrictions: [],
                entryRestrictions: [],
                viewRestrictionsOriginal: [],
                entryRestrictionsOriginal: [],
                tempID: uniqueID(),
            },
        ];
    }

    async function formRestrictionsList() {
        loading.value.dynamicLoading["formRestriction"] = true;
        const { status, data, message } = await formRestrictionsListByFormIdAPI(
            Number(formId.value),
        );
        if (status === 200) {
            const tableData = setFormRestrictionTableData(data);
            formRestrictionTableData.value = deepClone(tableData);
            formRestrictionTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            const tableData = setFormRestrictionTableData([]);
            formRestrictionTableData.value = deepClone(tableData);
            formRestrictionTableDataRef.value = deepClone(tableData);
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["formRestriction"] = false;
    }

    function setFormEntryDetails(
        restrictionsOriginal: IFormRestrictionEntryAPIData[],
        restrictions: TOptionValue[],
        type: TRestrictionEntry,
    ) {
        const restrictionsData: IFormRestrictionEntryAPIData[] = [];
        if (getArrayLength(restrictionsOriginal) > 0) {
            for (const row of restrictionsOriginal) {
                const filteredItems = getFilteredItems({
                    data: restrictions,
                    type: "primitive",
                    value: row.roleId,
                }) as TOptionValue[];
                restrictionsData.push({
                    id: row.id,
                    formRestrictionId: row.formRestrictionId,
                    isActive: getArrayLength(filteredItems) > 0,
                    roleId: row.roleId,
                    type: row.type,
                    updatedBy: 0,
                });
            }
        } else {
            let rolesListData: IOptions[] = [];
            if (type === "View") rolesListData = [...viewRestrictionRoleLookups.value];
            else if (type === "Entry") rolesListData = [...entryRestrictionRoleLookups.value];
            for (const row of rolesListData) {
                const filteredItems = getFilteredItems({
                    data: restrictions,
                    type: "primitive",
                    value: row.value,
                }) as TOptionValue[];
                restrictionsData.push({
                    formRestrictionId: 0,
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

    async function createOrUpdateFormRestriction() {
        loading.value.form = true;
        const {
            id,
            formId: formIdAPI,
            formName,
            viewRestrictions,
            viewRestrictionsOriginal,
            entryRestrictions,
            entryRestrictionsOriginal,
        } = formRestrictionTableData.value[0];
        let message = "";
        let status = 500;
        // let validationErrorsData = null;
        const requestBody = {
            id: id || 0,
            formId: formIdAPI,
            formName,
            viewRestrictions: setFormEntryDetails(
                viewRestrictionsOriginal,
                viewRestrictions,
                "View",
            ),
            entryRestrictions: setFormEntryDetails(
                entryRestrictionsOriginal,
                entryRestrictions,
                "Entry",
            ),
            updatedBy: 0,
        };
        const {
            message: apiMessage,
            status: apiStatus,
            // validationErrors: apiValidationErrors,
        } = await updateFormRestrictionAPI([requestBody]);
        message = apiMessage;
        status = apiStatus;
        // validationErrorsData = apiValidationErrors;
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await formRestrictionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            // if (status === 400 && validationErrorsData) {
            //     setDefaultValueByKeyIfKeyDoesNotExists(
            //         environmentSetupTableData.value[rowIndex].tempID,
            //         validationErrors.value,
            //         defaultValidationErrors(environmentSetupTableData.value[rowIndex].tempID),
            //     );
            //     setAPIValidationErrors(
            //         validationErrorsData,
            //         validationErrors.value,
            //         environmentSetupTableData.value[rowIndex].tempID,
            //     );
            // }
        }
        loading.value.form = false;
    }
    // Form Restrictions

    // Field Restrictions
    const setFieldRestrictionEntryTableData = (tableData: IFieldRestrictionEntryAPIData[]) =>
        tableData.map((row) => ({
            id: row.id,
            fieldRestrictionId: row.fieldRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IFieldRestrictionEntryAPIData[];

    function setFieldRestrictionEntries(tableData: IFieldRestrictionEntryAPIData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setFieldRestrictionTableData(
        tableData: IFieldRestrictionAPIData[],
    ): IFieldRestrictionData[] {
        fieldRestrictionTableLoaderDetails.value = setLoaderForArrayDatas(tableData);
        return tableData.map((row) => ({
            id: row.id,
            formId: row.formId,
            formName: row.formName,
            fieldId: row.fieldId,
            fieldName: row.fieldName,
            defaultValue: row.defaultValue,
            requiresVerification: row.requiresVerification,
            manualReviews: setFieldRestrictionEntries(row.manualReviews),
            viewRestrictions: setFieldRestrictionEntries(row.viewRestrictions),
            entryRestrictions: setFieldRestrictionEntries(row.entryRestrictions),
            viewRestrictionsOriginal: setFieldRestrictionEntryTableData(row.viewRestrictions),
            entryRestrictionsOriginal: setFieldRestrictionEntryTableData(row.entryRestrictions),
            manualReviewsOriginal: setFieldRestrictionEntryTableData(row.manualReviews),
            tempID: uniqueID(),
        }));
        // return [
        //     {
        //         id: 0,
        //         formId: Number(formId.value),
        //         formName: "",
        //         fieldId: ,
        //         fieldName: "",
        //         defaultValue: null,
        //         requiresVerification: false,
        //         manualReviews: [],
        //         viewRestrictions: [],
        //         entryRestrictions: [],
        //         viewRestrictionsOriginal: [],
        //         entryRestrictionsOriginal: [],
        //         manualReviewsOriginal: [],
        //         tempID: uniqueID(),
        //     },
        // ];
    }

    async function fieldRestrictionsList() {
        loading.value.dynamicLoading["fieldRestriction"] = true;
        const { status, data, message } = await fieldRestrictionsListByFormIdAPI(
            Number(formId.value),
        );
        if (status === 200) {
            const tableData = setFieldRestrictionTableData(data);
            fieldRestrictionTableData.value = deepClone(tableData);
            fieldRestrictionTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            fieldRestrictionTableData.value = [];
            fieldRestrictionTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["fieldRestriction"] = false;
    }

    function setFieldEntryDetails(
        restrictionsOriginal: IFieldRestrictionEntryAPIData[],
        restrictions: TOptionValue[],
        type: TRestrictionEntry,
    ) {
        const restrictionsData: IFieldRestrictionEntryAPIData[] = [];
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

    async function createOrUpdateFieldRestriction(rowIndex: number) {
        loading.value.form = true;
        const {
            id,
            formId: formIdAPI,
            formName,
            fieldId,
            fieldName,
            defaultValue,
            requiresVerification,
            viewRestrictions,
            viewRestrictionsOriginal,
            entryRestrictions,
            entryRestrictionsOriginal,
            manualReviews,
            manualReviewsOriginal,
        } = fieldRestrictionTableData.value[rowIndex];
        let message = "";
        let status = 500;
        // let validationErrorsData = null;
        const requestBody = {
            id: id || 0,
            formId: formIdAPI,
            formName,
            fieldId,
            fieldName,
            defaultValue,
            requiresVerification,
            manualReviews: setFieldEntryDetails(
                manualReviewsOriginal,
                manualReviews,
                "Manual Review",
            ),
            viewRestrictions: setFieldEntryDetails(
                viewRestrictionsOriginal,
                viewRestrictions,
                "View",
            ),
            entryRestrictions: setFieldEntryDetails(
                entryRestrictionsOriginal,
                entryRestrictions,
                "Entry",
            ),
            updatedBy: 0,
        };
        const {
            message: apiMessage,
            status: apiStatus,
            // validationErrors: apiValidationErrors,
        } = await updateFieldRestrictionAPI([requestBody]);
        message = apiMessage;
        status = apiStatus;
        // validationErrorsData = apiValidationErrors;
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await fieldRestrictionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            // if (status === 400 && validationErrorsData) {
            //     setDefaultValueByKeyIfKeyDoesNotExists(
            //         environmentSetupTableData.value[rowIndex].tempID,
            //         validationErrors.value,
            //         defaultValidationErrors(environmentSetupTableData.value[rowIndex].tempID),
            //     );
            //     setAPIValidationErrors(
            //         validationErrorsData,
            //         validationErrors.value,
            //         environmentSetupTableData.value[rowIndex].tempID,
            //     );
            // }
        }
        loading.value.form = false;
    }
    // Field Restrictions

    // Global Field Restrictions
    const setGlobalFieldRestrictionEntryTableData = (
        tableData: IGlobalFieldRestrictionEntryAPIData[],
    ) =>
        tableData.map((row) => ({
            id: row.id,
            globalFieldRestrictionId: row.globalFieldRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IGlobalFieldRestrictionEntryAPIData[];

    function setGlobalFieldRestrictionEntries(tableData: IGlobalFieldRestrictionEntryAPIData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setGlobalFieldRestrictionTableData(
        tableData: IGlobalFieldRestrictionAPIData[],
    ): IGlobalFieldRestrictionData[] {
        if (getArrayLength(tableData) > 0)
            return tableData.map((row) => ({
                id: row.id,
                formId: row.formId,
                formName: row.formName,
                requiresVerification: row.requiresVerification,
                manualReviews: setGlobalFieldRestrictionEntries(row.manualReviews),
                viewRestrictions: setGlobalFieldRestrictionEntries(row.viewRestrictions),
                entryRestrictions: setGlobalFieldRestrictionEntries(row.entryRestrictions),
                manualReviewsOriginal: setGlobalFieldRestrictionEntryTableData(row.manualReviews),
                viewRestrictionsOriginal: setGlobalFieldRestrictionEntryTableData(
                    row.viewRestrictions,
                ),
                entryRestrictionsOriginal: setGlobalFieldRestrictionEntryTableData(
                    row.entryRestrictions,
                ),
                tempID: uniqueID(),
            }));
        return [
            {
                id: 0,
                formId: Number(formId.value),
                formName: "",
                manualReviews: [],
                requiresVerification: false,
                viewRestrictions: [],
                entryRestrictions: [],
                viewRestrictionsOriginal: [],
                entryRestrictionsOriginal: [],
                manualReviewsOriginal: [],
                tempID: uniqueID(),
            },
        ];
    }

    async function globalFieldRestrictionsList() {
        loading.value.dynamicLoading["globalFieldRestriction"] = true;
        const { status, data, message } = await globalFieldRestrictionsListByFormIdAPI(
            Number(formId.value),
        );
        if (status === 200) {
            const tableData = setGlobalFieldRestrictionTableData(data);
            globalFieldRestrictionTableData.value = deepClone(tableData);
            globalFieldRestrictionTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            const tableData = setGlobalFieldRestrictionTableData([]);
            globalFieldRestrictionTableData.value = deepClone(tableData);
            globalFieldRestrictionTableDataRef.value = deepClone(tableData);
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading["globalFieldRestriction"] = false;
    }

    function setGlobalFieldEntryDetails(
        restrictionsOriginal: IGlobalFieldRestrictionEntryAPIData[],
        restrictions: TOptionValue[],
        type: TRestrictionEntry,
    ) {
        const restrictionsData: IGlobalFieldRestrictionEntryAPIData[] = [];
        if (getArrayLength(restrictionsOriginal) > 0) {
            for (const row of restrictionsOriginal) {
                const filteredItems = getFilteredItems({
                    data: restrictions,
                    type: "primitive",
                    value: row.roleId,
                }) as TOptionValue[];
                restrictionsData.push({
                    id: row.id,
                    globalFieldRestrictionId: row.globalFieldRestrictionId,
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
                    globalFieldRestrictionId: 0,
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

    async function createOrUpdateGlobalFieldRestriction() {
        loading.value.form = true;
        const {
            id,
            formId: formIdAPI,
            formName,
            requiresVerification,
            manualReviews,
            manualReviewsOriginal,
            viewRestrictions,
            viewRestrictionsOriginal,
            entryRestrictions,
            entryRestrictionsOriginal,
        } = globalFieldRestrictionTableData.value[0];
        let message = "";
        let status = 500;
        // let validationErrorsData = null;
        const requestBody = {
            id: id || 0,
            formId: formIdAPI,
            formName,
            requiresVerification,
            manualReviews: setGlobalFieldEntryDetails(
                manualReviewsOriginal,
                manualReviews,
                "Manual Review",
            ),
            viewRestrictions: setGlobalFieldEntryDetails(
                viewRestrictionsOriginal,
                viewRestrictions,
                "View",
            ),
            entryRestrictions: setGlobalFieldEntryDetails(
                entryRestrictionsOriginal,
                entryRestrictions,
                "Entry",
            ),
            updatedBy: 0,
        };
        const {
            message: apiMessage,
            status: apiStatus,
            // validationErrors: apiValidationErrors,
        } = await updateGlobalFieldRestrictionAPI([requestBody]);
        message = apiMessage;
        status = apiStatus;
        // validationErrorsData = apiValidationErrors;
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await globalFieldRestrictionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            // if (status === 400 && validationErrorsData) {
            //     setDefaultValueByKeyIfKeyDoesNotExists(
            //         environmentSetupTableData.value[rowIndex].tempID,
            //         validationErrors.value,
            //         defaultValidationErrors(environmentSetupTableData.value[rowIndex].tempID),
            //     );
            //     setAPIValidationErrors(
            //         validationErrorsData,
            //         validationErrors.value,
            //         environmentSetupTableData.value[rowIndex].tempID,
            //     );
            // }
        }
        loading.value.form = false;
    }

    async function assignToAllFieldsGlobalFieldRestriction() {
        loading.value.form = true;
        const { status, message } = await assignToAllFieldsGlobalFieldRestrictionAPI({
            id: globalFieldRestrictionTableData.value[0].id as number,
            formId: globalFieldRestrictionTableData.value[0].formId,
            formName: globalFieldRestrictionTableData.value[0].formName,
            requiresVerification: globalFieldRestrictionTableData.value[0].requiresVerification,
            manualReviews: [],
            viewRestrictions: [],
            entryRestrictions: [],
            updatedBy: 0,
        });
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await fieldRestrictionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }

    async function removeFromAllFieldsGlobalFieldRestriction() {
        loading.value.form = true;
        const { status, message } = await removeFromAllFieldsGlobalFieldRestrictionAPI({
            id: globalFieldRestrictionTableData.value[0].id as number,
            formId: globalFieldRestrictionTableData.value[0].formId,
            formName: globalFieldRestrictionTableData.value[0].formName,
            requiresVerification: globalFieldRestrictionTableData.value[0].requiresVerification,
            manualReviews: [],
            viewRestrictions: [],
            entryRestrictions: [],
            updatedBy: 0,
        });
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await fieldRestrictionsList();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
    }
    // Global Field Restrictions

    // function getLabelByValue(tableData: string[], refData: IOptions[]) {
    //     let result = "";
    //     const filteredData = refData.filter((row) => tableData.includes(String(row.value)));
    //     if (getArrayLength(filteredData) > 0)
    //         result = filteredData.map((row) => row.label).join(", ");
    //     return result;
    // }

    async function onFormChange() {
        await Promise.all([
            formRestrictionsList(),
            fieldRestrictionsList(),
            globalFieldRestrictionsList(),
        ]);
    }

    const {
        isModelChanged: isFormRestrictionModelChanged,
        model: formRestrictionModel,
        modelRef: formRestrictionModelRef,
    } = useUnsavedAlert(formRestrictionTableData.value, formRestrictionTableDataRef.value);
    const {
        isModelChanged: isFieldRestrictionModelChanged,
        model: fieldRestrictionModel,
        modelRef: fieldRestrictionModelRef,
    } = useUnsavedAlert(fieldRestrictionTableData.value, fieldRestrictionTableDataRef.value);
    const {
        isModelChanged: isGlobalRestrictionModelChanged,
        model: globalRestrictionModel,
        modelRef: globalRestrictionModelRef,
    } = useUnsavedAlert(
        globalFieldRestrictionTableData.value,
        globalFieldRestrictionTableDataRef.value,
    );

    function resetFormModel() {
        if (isFormRestrictionModelChanged.value) {
            formRestrictionTableData.value = deepClone(formRestrictionTableDataRef.value);
            editFormRestrictionDetails.value = {};
        } else if (isFieldRestrictionModelChanged.value) {
            fieldRestrictionTableData.value = deepClone(fieldRestrictionTableDataRef.value);
            editFieldRestrictionDetails.value = {};
        } else if (isGlobalRestrictionModelChanged.value) {
            globalFieldRestrictionTableData.value = deepClone(
                globalFieldRestrictionTableDataRef.value,
            );
            editGlobalFieldRestrictionDetails.value = {};
        }
    }

    watch(
        () => formRestrictionTableData.value,
        (newValue) => {
            formRestrictionModel.value = newValue;
            formRestrictionModelRef.value = formRestrictionTableDataRef.value;
        },
        { deep: true },
    );
    watch(
        () => fieldRestrictionTableData.value,
        (newValue) => {
            fieldRestrictionModel.value = newValue;
            fieldRestrictionModelRef.value = fieldRestrictionTableDataRef.value;
        },
        { deep: true },
    );
    watch(
        () => globalFieldRestrictionTableData.value,
        (newValue) => {
            globalRestrictionModel.value = newValue;
            globalRestrictionModelRef.value = globalFieldRestrictionTableDataRef.value;
        },
        { deep: true },
    );
    watch(
        () => isFormRestrictionModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isFieldRestrictionModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => isGlobalRestrictionModelChanged.value,
        (newValue) => {
            if (newValue) unsavedAlertStore.triggerFormActionAlert = "unsaved";
            else unsavedAlertStore.triggerFormActionAlert = "none";
        },
    );
    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset") {
                if (isFormRestrictionModelChanged.value) {
                    formRestrictionTableData.value = deepClone(formRestrictionTableDataRef.value);
                } else if (isFieldRestrictionModelChanged.value) {
                    fieldRestrictionTableData.value = deepClone(fieldRestrictionTableDataRef.value);
                } else if (isGlobalRestrictionModelChanged.value) {
                    globalFieldRestrictionTableData.value = deepClone(
                        globalFieldRestrictionTableDataRef.value,
                    );
                }
                unsavedAlertStore.triggerFormActionAlert = "none";
                resetFormModel();
            }
        },
    );

    onMounted(() => {
        loading.value.setDynamicLoading([
            "formRestriction",
            "fieldRestriction",
            "globalFieldRestriction",
        ]);

        Promise.all([
            formList(),
            manualReviewRolesList(),
            viewRestrictionRolesList(),
            entryRestrictionRolesList(),
        ]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="restrictionGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem]">
                            <edc-dropdown
                                key="formFilter"
                                v-model="formId"
                                container-class="w-[15rem]"
                                :options="formLookups"
                                input-class="admin-input-font"
                                option-placement="bottom"
                                option-class="min-w-[15rem] max-w-[20rem]"
                                default-value="Forms"
                                :loading="formOptions.loading"
                                :disabled="
                                    loading.isDisabled(
                                        formOptions.loading,
                                        isFormRestrictionModelChanged,
                                        isFieldRestrictionModelChanged,
                                        isGlobalRestrictionModelChanged,
                                    )
                                "
                                @on-select="
                                    async () => {
                                        await onFormChange();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formRestrictionColumns"
                                :table-data="formRestrictionTableData"
                                :loading="loading.dynamicLoading.formRestriction"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                table-badge="Form Restrictions"
                                :disabled="loading.isDisabled()"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`formViewRestrictions-${data.tempID}`"
                                            v-model="data.viewRestrictions"
                                            :list="viewRestrictionRoleLookups"
                                            :disabled="
                                                loading.isDisabled(
                                                    viewRestrictionRoles.loading,
                                                    isFieldRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                            container-class="!ml-0 w-full"
                                            name="formViewRestrictions"
                                        />
                                        <!-- <span v-else>{{
                                            getLabelByValue(data.restrictView, [
                                                { label: "Batch Upload", value: "1" },
                                                { label: "CTM-1R", value: "2" },
                                                { label: "RC-1", value: "3" },
                                                { label: "CASA-1", value: "4" },
                                                { label: "DM-1", value: "5" },
                                                { label: "RC-1A", value: "6" },
                                            ])
                                        }}</span> -->
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`formEntryRestrictions-${data.tempID}`"
                                            v-model="data.entryRestrictions"
                                            :list="entryRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    entryRestrictionRoles.loading,
                                                    isFieldRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                            name="formEntryRestrictions"
                                        />
                                        <!-- <span v-else>{{ data.restrictEntry.join(", ") }}</span> -->
                                    </td>
                                </template>
                                <template #action>
                                    <!-- <edc-pressable 
                                        v-tooltip.top="'Update'"
                                        :on-click="() => editFormRestriction(data.tempID)"
                                    >
                                        <edc-icon
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            class="h-[1.5rem]"
                                        />
                                    </edc-pressable> -->
                                    <edc-pressable
                                        v-if="
                                            !isFieldRestrictionModelChanged &&
                                            !isGlobalRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await createOrUpdateFormRestriction();
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
                                        v-if="
                                            isFormRestrictionModelChanged &&
                                            !isFieldRestrictionModelChanged &&
                                            !isGlobalRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                resetFormModel();
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Reset'"
                                            icon="undo"
                                            :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </template>
                            </edc-data-table>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="fieldRestrictionColumns"
                                :table-data="fieldRestrictionTableData"
                                :loading="loading.dynamicLoading.fieldRestriction"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                table-badge="Field Restrictions"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                    >
                                        <span>{{ data.fieldName }}</span>
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-checkbox
                                            :key="`requiresVerification-${data.tempID}`"
                                            v-model="data.requiresVerification"
                                            name="requiresVerification"
                                            :disabled="
                                                loading.isDisabled(
                                                    isFormRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`fieldManualReviews-${data.tempID}`"
                                            v-model="data.manualReviews"
                                            :list="manualReviewRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    manualReviewRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                            name="fieldManualRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`fieldViewRestrictions-${data.tempID}`"
                                            v-model="data.viewRestrictions"
                                            :list="viewRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    viewRestrictionRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                            name="fieldViewRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[30rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`fieldEntryRestrictions-${data.tempID}`"
                                            v-model="data.entryRestrictions"
                                            :list="entryRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    entryRestrictionRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                            name="fieldEntryRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[20rem]"
                                    >
                                        <edc-text-input
                                            :key="`defaultValue-${data.tempID}`"
                                            v-model="data.defaultValue"
                                            type="text"
                                            placeholder="Enter default value"
                                            input-class="admin-input-font"
                                            :disabled="
                                                loading.isDisabled(
                                                    isFormRestrictionModelChanged,
                                                    isGlobalRestrictionModelChanged,
                                                )
                                            "
                                        />
                                    </td>
                                </template>
                                <template #action="{ index }">
                                    <!-- <edc-pressable
                                        v-tooltip.top="'Update'"
                                        :on-click="() => editFieldRestriction(data.tempID)"
                                    >
                                        <edc-icon
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            class="h-[1.5rem]"
                                        />
                                    </edc-pressable> -->
                                    <edc-pressable
                                        v-if="
                                            !isFormRestrictionModelChanged &&
                                            !isGlobalRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await createOrUpdateFieldRestriction(index);
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
                                        v-if="
                                            isFieldRestrictionModelChanged &&
                                            !isFormRestrictionModelChanged &&
                                            !isGlobalRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                resetFormModel();
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Reset'"
                                            icon="undo"
                                            :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </template>
                            </edc-data-table>
                        </div>
                        <div>
                            <edc-data-table
                                :columns="globalFieldRestrictionColumns"
                                :table-data="globalFieldRestrictionTableData"
                                :loading="loading.dynamicLoading.globalFieldRestriction"
                                :disabled="loading.isDisabled()"
                                pagination-type="none"
                                table-style="outlined"
                                :custom-content="true"
                                table-badge="Global Field Restrictions"
                                action-row-class="min-w-[10rem] max-w-[10rem]"
                            >
                                <template #custom-content="{ data }">
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[10rem]"
                                    >
                                        <edc-checkbox
                                            :key="`requiresVerification-${data.tempID}`"
                                            v-model="data.requiresVerification"
                                            name="requiresVerification"
                                            :disabled="
                                                loading.isDisabled(
                                                    isFormRestrictionModelChanged,
                                                    isFieldRestrictionModelChanged,
                                                )
                                            "
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[25rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldManualReviews-${data.tempID}`"
                                            v-model="data.manualReviews"
                                            :list="manualReviewRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    manualReviewRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isFieldRestrictionModelChanged,
                                                )
                                            "
                                            name="globalFieldManualRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[25rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldViewRestrictions-${data.tempID}`"
                                            v-model="data.viewRestrictions"
                                            :list="viewRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    viewRestrictionRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isFieldRestrictionModelChanged,
                                                )
                                            "
                                            name="globalFieldViewRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row min-w-[25rem]"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldEntryRestrictions-${data.tempID}`"
                                            v-model="data.entryRestrictions"
                                            :list="entryRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="
                                                loading.isDisabled(
                                                    entryRestrictionRoles.loading,
                                                    isFormRestrictionModelChanged,
                                                    isFieldRestrictionModelChanged,
                                                )
                                            "
                                            name="globalFieldEntryRestrictions"
                                        />
                                    </td>
                                </template>
                                <template #action="{ data, index }">
                                    <!-- <edc-pressable
                                        v-tooltip.top="'Update'"
                                        :on-click="() => editGlobalFieldRestriction(data.tempID)"
                                    >
                                        <edc-icon
                                            icon="edit"
                                            fill="var(--color-secondary)"
                                            class="h-[1.5rem]"
                                        />
                                    </edc-pressable> -->
                                    <edc-pressable
                                        v-if="
                                            data.id &&
                                            !isGlobalRestrictionModelChanged &&
                                            !isFormRestrictionModelChanged &&
                                            !isFieldRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await assignToAllFieldsGlobalFieldRestriction();
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Add To All Fields'"
                                            icon="circle-plus"
                                            :class="`${commonActionIconClasses('Save')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                    <edc-delete-confirmation
                                        v-if="
                                            data.id &&
                                            !isGlobalRestrictionModelChanged &&
                                            !isFormRestrictionModelChanged &&
                                            !isFieldRestrictionModelChanged
                                        "
                                        :key="`${checkIfKeyExistsInObject(index, fieldRestrictionTableLoaderDetails) && fieldRestrictionTableLoaderDetails[index] ? 'show' : 'hide'}DeleteConfirmation${data.tempID}`"
                                        message="Are you sure you want to remove from all fields?"
                                        :disabled="loading.isDisabled()"
                                        :on-delete="
                                            async () => {
                                                fieldRestrictionTableLoaderDetails[index] = true;
                                                await removeFromAllFieldsGlobalFieldRestriction();
                                                fieldRestrictionTableLoaderDetails[index] = false;
                                            }
                                        "
                                    >
                                        <template #icon>
                                            <edc-pressable
                                                loader-type="table-save"
                                                :disabled="loading.isDisabled()"
                                                :show-loader="
                                                    fieldRestrictionTableLoaderDetails[index]
                                                "
                                            >
                                                <edc-icon
                                                    v-tooltip.top="'Remove From All Fields'"
                                                    icon="close-icon"
                                                    :class="`${commonActionIconClasses('Delete')} stroke-[var(--color-error)]`"
                                                />
                                            </edc-pressable>
                                        </template>
                                    </edc-delete-confirmation>
                                    <edc-pressable
                                        v-if="
                                            isGlobalRestrictionModelChanged &&
                                            !isFormRestrictionModelChanged &&
                                            !isFieldRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            async () => {
                                                await createOrUpdateGlobalFieldRestriction();
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
                                        v-if="
                                            isGlobalRestrictionModelChanged &&
                                            !isFormRestrictionModelChanged &&
                                            !isFieldRestrictionModelChanged
                                        "
                                        loader-type="table-save"
                                        :disabled="loading.isDisabled()"
                                        :on-click="
                                            () => {
                                                resetFormModel();
                                            }
                                        "
                                    >
                                        <edc-icon
                                            v-tooltip.top="'Reset'"
                                            icon="undo"
                                            :class="`${commonActionIconClasses('Reset')} fill-[var(--color-secondary)]`"
                                        />
                                    </edc-pressable>
                                </template>
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>
