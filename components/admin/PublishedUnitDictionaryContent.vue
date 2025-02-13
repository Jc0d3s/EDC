<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        publishedUnitDictionaryEntriesPaginationListAPI,
        publishedUnitDictionaryPaginationListAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedUnitDictionaryData,
        IPublishedUnitDictionaryEntryData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface IUnitDictionaryData {
        id: TNullableNumber;
        releaseVersionId: number;
        releaseVersionName: string;
        name: TNullableString;
        numberOfEntries: TNullableString;
        hasStandardEntries: boolean;
        tempID: string;
    }

    interface IEntryData {
        id: TNullableNumber;
        userDataString: TNullableString;
        standard: boolean;
        codedUnit: TNullableString;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
        formula: TNullableString;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const globalStore = useGlobalStore();

    const loading = ref<Loading>(new Loading());

    const dictionarySearch = ref<TNullableString>(null);
    const entrySearch = ref<TNullableString>(null);
    const showEntries = ref<boolean>(false);
    const formColumns: IColumn[] = [
        {
            field: "name",
            header: "Name",
            icon: false,
            show: true,
        },
        {
            field: "numberOfEntries",
            header: "Number of Entries",
            icon: false,
            show: true,
        },
        {
            field: "hasStandardEntries",
            header: "Has Standard Entry",
            icon: false,
            show: true,
        },
    ];
    const selectedUnitDictionary = ref<IUnitDictionaryData | null>(null);
    const unitDictionaryTableData = ref<IUnitDictionaryData[]>([]);
    const unitDictionaryTableDataRef = ref<IUnitDictionaryData[]>(
        deepClone(unitDictionaryTableData.value),
    );

    const entryFormColumns: IColumn[] = [
        {
            field: "userDataString",
            header: "User Data String",
            icon: false,
            show: true,
        },
        {
            field: "standard",
            header: "Standard",
            icon: false,
            show: true,
        },
        {
            field: "codedUnit",
            header: "Coded Unit",
            icon: false,
            show: true,
        },
        {
            field: "formula",
            header: "Formula",
            icon: false,
            show: true,
        },
    ];
    const entryTableData = ref<IEntryData[]>([]);
    const entryTableDataRef = ref<IEntryData[]>(deepClone(entryTableData.value));

    // Unit dictionaries
    const dictionaryGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Unit Dictionaries - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Unit Dictionaries",
    );

    function setUnitDictionaryTableData(tableData: IPublishedUnitDictionaryData[]) {
        return tableData.map((row) => ({
            hasStandardEntries: row.hasStandardEntries,
            releaseVersionId: row.releaseVersionId,
            releaseVersionName: row.releaseVersionName,
            id: row.id,
            name: row.name,
            numberOfEntries: row.numberOfEntries as TNullableNumber,
            tempID: uniqueID(),
        })) as IUnitDictionaryData[];
    }

    async function publishedUnitDictionaryPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await publishedUnitDictionaryPaginationListAPI(
            getAPIFilters({
                search: dictionarySearch.value,
                filter: {
                    releaseVersionId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setUnitDictionaryTableData(items);
            unitDictionaryTableData.value = deepClone(tableData);
            unitDictionaryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            unitDictionaryTableData.value = [];
            unitDictionaryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }
    // Unit dictionaries

    // Entries
    function setTableData(tableData: IPublishedUnitDictionaryEntryData[]): IEntryData[] {
        return tableData.map((row) => ({
            id: row.id,
            userDataString: row.userDataString,
            standard: row.standard,
            codedUnit: row.codedUnit,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            formula: row.formula,
            tempID: uniqueID(),
        }));
    }

    async function publishedUnitDictionaryEntriesPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await publishedUnitDictionaryEntriesPaginationListAPI(
            getAPIFilters({
                search: entrySearch.value,
                filter: {
                    unitDictionaryId: Number(selectedUnitDictionary.value?.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setTableData(items);
            entryTableData.value = deepClone(tableData);
            entryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            entryTableData.value = [];
            entryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.secondaryTable = false;
    }

    async function getEntryDetails() {
        showEntries.value = true;
        await publishedUnitDictionaryEntriesPaginationList();
    }

    function hideEntryDetails() {
        showEntries.value = false;
        entryTableData.value = [];
        entryTableDataRef.value = [];
    }
    // Entries

    onMounted(async () => {
        await publishedUnitDictionaryPaginationList();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="dictionaryGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="grid grid-cols-2 gap-[1rem]">
                        <div class="flex flex-col gap-[1rem]">
                            <div class="flex flex-row items-center gap-[1rem]">
                                <!-- :class="[showEntries ? 'invisible' : '']" -->
                                <div class="w-fit">
                                    <edc-search-bar
                                        v-model="dictionarySearch"
                                        element-id="dictionarySearch"
                                        :disabled="loading.isDisabled(showEntries)"
                                        input-class="admin-input-font"
                                        @on-search="
                                            async () => {
                                                await publishedUnitDictionaryPaginationList();
                                                globalStore.triggerSearchBarRefocus(
                                                    '#dictionarySearch',
                                                );
                                            }
                                        "
                                    />
                                </div>
                            </div>
                            <div>
                                <edc-data-table
                                    table-id="unitDictionaryTable"
                                    :columns="formColumns"
                                    :table-data="unitDictionaryTableData"
                                    :loading="loading.table"
                                    pagination-type="none"
                                    table-style="outlined"
                                    search-key="dictionarySearch"
                                    :disabled="loading.isDisabled(showEntries)"
                                    :custom-content="true"
                                >
                                    <template #custom-content="{ data }">
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`name-${data.tempID}`"
                                                v-model="data.name"
                                                type="text"
                                                placeholder="Enter name"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`numberOfEntries-${data.tempID}`"
                                                v-model="data.numberOfEntries"
                                                type="text"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-checkbox
                                                :key="`hasStandardEntries-${data.tempID}`"
                                                v-model="data.hasStandardEntries"
                                                name="hasStandardEntries"
                                                :disabled="loading.isDisabled(showEntries)"
                                                :read-only="true"
                                            />
                                        </td>
                                    </template>
                                    <template #action="{ data }">
                                        <edc-pressable
                                            container-class="mt-[0.5rem]"
                                            :disabled="loading.isDisabled(showEntries)"
                                            :on-click="
                                                async () => {
                                                    selectedUnitDictionary = deepClone(data);
                                                    await getEntryDetails();
                                                }
                                            "
                                        >
                                            <edc-icon
                                                v-tooltip.top="'Entries'"
                                                icon="circle-play"
                                                :class="`${commonActionIconClasses('Entries')} fill-[var(--color-secondary)]`"
                                            />
                                        </edc-pressable>
                                    </template>
                                </edc-data-table>
                            </div>
                        </div>
                        <div v-if="showEntries" class="flex flex-col gap-[1rem]">
                            <div class="flex flex-row items-center gap-[1rem]">
                                <div class="w-fit">
                                    <edc-search-bar
                                        v-model="entrySearch"
                                        element-id="entrySearch"
                                        :disabled="loading.isDisabled()"
                                        input-class="admin-input-font"
                                        @on-search="
                                            async () => {
                                                await publishedUnitDictionaryEntriesPaginationList();
                                                globalStore.triggerSearchBarRefocus('#entrySearch');
                                            }
                                        "
                                    />
                                </div>
                                <div class="flex flex-row items-center gap-[1rem]">
                                    <admin-action-label
                                        icon="circle-check"
                                        text="Done"
                                        :disabled="loading.isDisabled()"
                                        :on-click="() => hideEntryDetails()"
                                    />
                                </div>
                            </div>
                            <div>
                                <edc-data-table
                                    table-id="unitDictionaryEntryTable"
                                    :columns="entryFormColumns"
                                    :table-data="entryTableData"
                                    :loading="loading.secondaryTable"
                                    pagination-type="none"
                                    table-style="outlined"
                                    search-key="entrySearch"
                                    :enable-reorder="false"
                                    :custom-content="true"
                                    :disabled="loading.isDisabled()"
                                >
                                    <template #custom-content="{ data }">
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`userDataString-${data.tempID}`"
                                                v-model="data.userDataString"
                                                type="text"
                                                placeholder="Enter user data string *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-checkbox
                                                :key="`standard-${data.tempID}`"
                                                v-model="data.standard"
                                                name="standard"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`codedUnit-${data.tempID}`"
                                                v-model="data.codedUnit"
                                                type="text"
                                                placeholder="Enter coded data *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td
                                            class="font-normal text-left font-12 custom-row min-w-[15rem]"
                                        >
                                            <edc-text-input
                                                :key="`formula-${data.tempID}`"
                                                v-model="data.formula"
                                                type="text"
                                                placeholder="Enter formula *"
                                                input-class="admin-input-font"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                            />
                                        </td>
                                    </template>
                                </edc-data-table>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
