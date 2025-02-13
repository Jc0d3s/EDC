<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading from "~/services/apis/data/loading";
    import {
        publishedFieldRestrictionsListByFormIdAPI,
        publishedFormRestrictionsListByFormIdAPI,
        publishedFormsListByReleaseVersionIdAPI,
        publishedGlobalFieldRestrictionsListByFormIdAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import { rolesListByGroupNameAPI } from "~/services/apis/handlers/admin/user";
    import type {
        IPublishedFieldRestrictionData,
        IPublishedFieldRestrictionEntryData,
        IPublishedFormRestrictionData,
        IPublishedFormRestrictionEntryData,
        IPublishedGlobalFieldRestrictionData,
        IPublishedGlobalFieldRestrictionEntryData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useToastStore from "~/stores/toast";
    import type {
        IWinFormProps,
        TNullableNumber,
        TNullableString,
        TOptionValue,
    } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface IFormRestrictionData {
        id: TNullableNumber;
        formId: number;
        formName: string;
        viewRestrictions: TOptionValue[];
        entryRestrictions: TOptionValue[];
        viewRestrictionsOriginal: IPublishedFormRestrictionEntryData[];
        entryRestrictionsOriginal: IPublishedFormRestrictionEntryData[];
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
        manualReviewsOriginal: IPublishedFieldRestrictionEntryData[];
        viewRestrictionsOriginal: IPublishedFieldRestrictionEntryData[];
        entryRestrictionsOriginal: IPublishedFieldRestrictionEntryData[];
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
        manualReviewsOriginal: IPublishedGlobalFieldRestrictionEntryData[];
        viewRestrictionsOriginal: IPublishedGlobalFieldRestrictionEntryData[];
        entryRestrictionsOriginal: IPublishedGlobalFieldRestrictionEntryData[];
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const formId = ref<TNullableNumber>(null);
    const loading = ref<Loading>(new Loading());
    const formOptions = ref<DropdownOption>(new DropdownOption());
    const manualReviewRoles = ref<DropdownOption>(new DropdownOption());
    const viewRestrictionRoles = ref<DropdownOption>(new DropdownOption());
    const entryRestrictionRoles = ref<DropdownOption>(new DropdownOption());

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
            ? `Published Restrictions - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Restrictions",
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
        const { status, data, message } = await publishedFormsListByReleaseVersionIdAPI(
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
    const setFormRestrictionEntryTableData = (tableData: IPublishedFormRestrictionEntryData[]) =>
        tableData.map((row) => ({
            id: row.id,
            formRestrictionId: row.formRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IPublishedFormRestrictionEntryData[];

    function setRestrictionEntries(tableData: IPublishedFormRestrictionEntryData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setFormRestrictionTableData(
        tableData: IPublishedFormRestrictionData[],
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
        const { status, data, message } = await publishedFormRestrictionsListByFormIdAPI(
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
    // Form Restrictions

    // Field Restrictions
    const setFieldRestrictionEntryTableData = (tableData: IPublishedFieldRestrictionEntryData[]) =>
        tableData.map((row) => ({
            id: row.id,
            fieldRestrictionId: row.fieldRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IPublishedFieldRestrictionEntryData[];

    function setFieldRestrictionEntries(tableData: IPublishedFieldRestrictionEntryData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setFieldRestrictionTableData(
        tableData: IPublishedFieldRestrictionData[],
    ): IFieldRestrictionData[] {
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
        const { status, data, message } = await publishedFieldRestrictionsListByFormIdAPI(
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
    // Field Restrictions

    // Global Field Restrictions
    const setGlobalFieldRestrictionEntryTableData = (
        tableData: IPublishedGlobalFieldRestrictionEntryData[],
    ) =>
        tableData.map((row) => ({
            id: row.id,
            globalFieldRestrictionId: row.globalFieldRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IPublishedGlobalFieldRestrictionEntryData[];

    function setGlobalFieldRestrictionEntries(
        tableData: IPublishedGlobalFieldRestrictionEntryData[],
    ) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    function setGlobalFieldRestrictionTableData(
        tableData: IPublishedGlobalFieldRestrictionData[],
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
        const { status, data, message } = await publishedGlobalFieldRestrictionsListByFormIdAPI(
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
    // Global Field Restrictions

    async function onFormChange() {
        await Promise.all([
            formRestrictionsList(),
            fieldRestrictionsList(),
            globalFieldRestrictionsList(),
        ]);
    }

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
                                :disabled="loading.isDisabled(formOptions.loading)"
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
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`formViewRestrictions-${data.tempID}`"
                                            v-model="data.viewRestrictions"
                                            :list="viewRestrictionRoleLookups"
                                            :disabled="true"
                                            container-class="!ml-0 w-full"
                                            name="formViewRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`formEntryRestrictions-${data.tempID}`"
                                            v-model="data.entryRestrictions"
                                            :list="entryRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="true"
                                            name="formEntryRestrictions"
                                        />
                                    </td>
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
                                            :disabled="true"
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
                                            :disabled="true"
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
                                            :disabled="true"
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
                                            :disabled="true"
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
                                            :disabled="true"
                                        />
                                    </td>
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
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <edc-checkbox
                                            :key="`requiresVerification-${data.tempID}`"
                                            v-model="data.requiresVerification"
                                            name="requiresVerification"
                                            :disabled="true"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldManualReviews-${data.tempID}`"
                                            v-model="data.manualReviews"
                                            :list="manualReviewRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="true"
                                            name="globalFieldManualRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldViewRestrictions-${data.tempID}`"
                                            v-model="data.viewRestrictions"
                                            :list="viewRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="true"
                                            name="globalFieldViewRestrictions"
                                        />
                                    </td>
                                    <td
                                        valign="top"
                                        class="font-normal text-left font-12 custom-row"
                                    >
                                        <admin-field-grant-permission-list
                                            :key="`globalFieldEntryRestrictions-${data.tempID}`"
                                            v-model="data.entryRestrictions"
                                            :list="entryRestrictionRoleLookups"
                                            container-class="!ml-0 w-full"
                                            :disabled="true"
                                            name="globalFieldEntryRestrictions"
                                        />
                                    </td>
                                </template>
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>
