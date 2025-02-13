<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        publishedDictionaryEntriesPaginationListAPI,
        publishedDictionaryPaginationListAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedDictionaryData,
        IPublishedDictionaryEntryData,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    interface IDictionaryData {
        id: TNullableNumber;
        releaseVersionId: number;
        releaseVersionName: string;
        name: TNullableString;
        numberOfEntries: TNullableString;
        tempID: string;
    }

    interface IEntryData {
        id: TNullableNumber;
        userDataString: TNullableString;
        specify: boolean;
        codedData: TNullableString;
        orderNumber: number;
        oldOrderNumber: number;
        newOrderNumber: number;
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
    ];
    const selectedDictionary = ref<IDictionaryData | null>(null);
    const dictionaryTableData = ref<IDictionaryData[]>([]);
    const dictionaryTableDataRef = ref<IDictionaryData[]>(deepClone(dictionaryTableData.value));

    const entryFormColumns: IColumn[] = [
        {
            field: "userDataString",
            header: "User Data String",
            icon: false,
            show: true,
        },
        {
            field: "specify",
            header: "Specify",
            icon: false,
            show: true,
        },
        {
            field: "codedData",
            header: "Coded Data",
            icon: false,
            show: true,
        },
    ];
    const entryTableData = ref<IEntryData[]>([]);
    const entryTableDataRef = ref<IEntryData[]>(deepClone(entryTableData.value));

    // Dictionaries
    const dictionaryGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Dictionaries - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${padCharactersToString(props.tabData[props.activeTab.label].data.releaseVersionId, "start")})`
            : "Published Dictionaries",
    );

    function setDictionaryTableData(tableData: IPublishedDictionaryData[]) {
        return tableData.map((row) => ({
            id: row.id,
            releaseVersionId: row.releaseVersionId,
            releaseVersionName: row.releaseVersionName,
            name: row.name,
            numberOfEntries: row.numberOfEntries as TNullableNumber,
            tempID: uniqueID(),
        })) as IDictionaryData[];
    }

    async function publishedDictionaryPaginationList() {
        loading.value.table = true;
        const { status, data, message } = await publishedDictionaryPaginationListAPI(
            getAPIFilters({
                search: dictionarySearch.value,
                filter: {
                    releaseVersionId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            const tableData = setDictionaryTableData(items);
            dictionaryTableData.value = deepClone(tableData);
            dictionaryTableDataRef.value = deepClone(tableData);
        } else if (status !== 401) {
            dictionaryTableData.value = [];
            dictionaryTableDataRef.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }
    // Dictionaries

    // Entries
    function setTableData(tableData: IPublishedDictionaryEntryData[]): IEntryData[] {
        return tableData.map((row) => ({
            id: row.id,
            codedData: row.codedData,
            orderNumber: row.orderNumber,
            oldOrderNumber: row.orderNumber,
            newOrderNumber: row.orderNumber,
            specify: row.specify,
            userDataString: row.userDataString,
            tempID: uniqueID(),
        }));
    }

    async function publishedDictionaryEntriesPaginationList() {
        loading.value.secondaryTable = true;
        const { status, data, message } = await publishedDictionaryEntriesPaginationListAPI(
            getAPIFilters({
                search: entrySearch.value,
                filter: {
                    dataDictionaryId: Number(selectedDictionary.value?.id),
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
        await publishedDictionaryEntriesPaginationList();
    }

    function hideEntryDetails() {
        showEntries.value = false;
        entryTableData.value = [];
        entryTableDataRef.value = [];
    }
    // Entries

    onMounted(async () => {
        await publishedDictionaryPaginationList();
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
                                                await publishedDictionaryPaginationList();
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
                                    table-id="dictionaryTable"
                                    :columns="formColumns"
                                    :table-data="dictionaryTableData"
                                    :loading="loading.table"
                                    :disabled="loading.isDisabled(showEntries)"
                                    pagination-type="none"
                                    search-key="dictionarySearch"
                                    table-style="outlined"
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
                                    </template>
                                    <template #action="{ data }">
                                        <edc-pressable
                                            :disabled="loading.isDisabled(showEntries)"
                                            container-class="mt-[0.5rem]"
                                            :on-click="
                                                async () => {
                                                    selectedDictionary = deepClone(data);
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
                                                await publishedDictionaryEntriesPaginationList();
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
                                    table-id="dictionaryEntryTable"
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
                                        <td class="font-normal text-left font-12 custom-row">
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
                                                :key="`specify-${data.tempID}`"
                                                v-model="data.specify"
                                                name="specify"
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                            />
                                        </td>
                                        <td class="font-normal text-left font-12 custom-row">
                                            <edc-text-input
                                                :key="`codedData-${data.tempID}`"
                                                v-model="data.codedData"
                                                type="text"
                                                placeholder="Enter coded data *"
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
