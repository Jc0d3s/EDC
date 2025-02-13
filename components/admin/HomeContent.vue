<script setup lang="ts">
    import type { ISelectedRow } from "~/services/apis/data/admin/win-forms";
    import Loading from "~/services/apis/data/loading";
    import { trialPaginationListAPI } from "~/services/apis/handlers/admin/trial";
    import type { ITrialData } from "~/services/apis/handlers/types/admin/trial-types";
    import useGlobalStore from "~/stores/global";
    import useToastStore from "~/stores/toast";
    import type { TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    const emit = defineEmits<{
        "on-row-select": [selectedRow: ISelectedRow<ITrialData>];
    }>();

    const toastStore = useToastStore();
    const loading = ref<Loading>(new Loading());
    const trialSearchFilter = ref<TNullableString>(null);

    const columns: IColumn[] = [
        {
            field: "trialName",
            header: "Trials",
            icon: false,
            show: true,
        },
    ];

    const tableData = ref<ITrialData[]>([]);

    const messagesTableColumn: IColumn[] = [
        {
            field: "message",
            header: "Messages",
            icon: false,
            show: true,
        },
    ];

    const messageTableData = ref<
        {
            message: string;
        }[]
    >([]);

    async function trialList() {
        loading.value.table = true;
        const { data, status, message } = await trialPaginationListAPI(
            getAPIFilters({
                top: 10,
                search: trialSearchFilter.value,
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            tableData.value = deepClone(
                items.map((row) => ({
                    ...row,
                })),
            );
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            tableData.value = [];
        }
        loading.value.table = false;
    }

    onMounted(async () => {
        await trialList();
    });

    // const textInput = ref<TNullableString>(null);
</script>

<template>
    <div class="grid grid-cols-2 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Active Trials">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="w-fit">
                        <edc-search-bar
                            v-model="trialSearchFilter"
                            element-id="trialSearch"
                            input-class="admin-input-font"
                            :disabled="loading.isDisabled()"
                            @on-search="
                                async () => {
                                    await trialList();
                                    useGlobalStore().triggerSearchBarRefocus('#trialSearch');
                                }
                            "
                        />
                    </div>
                    <div>
                        <edc-data-table
                            :columns="columns"
                            :table-data="tableData"
                            :loading="loading.table"
                            :disabled="loading.isDisabled()"
                            pagination-type="none"
                            search-key="trialSearch"
                            table-style="outlined"
                            :enable-row-click="true"
                            @on-row-click="
                                (selectedRow: ITrialData) => {
                                    emit('on-row-select', {
                                        label: selectedRow.trialName,
                                        module: 'Trial',
                                        page: 'Trial',
                                        data: selectedRow,
                                    });
                                }
                            "
                        />
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <admin-card-wrapper group-label="Messages">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <!-- <edc-search-bar class="invisible" element-id="messageSearch" /> -->
                    <div>
                        <edc-data-table
                            :columns="messagesTableColumn"
                            :table-data="messageTableData"
                            :loading="loading.secondaryTable"
                            :disabled="loading.isDisabled()"
                            pagination-type="none"
                            empty-message="No Messages"
                            table-style="outlined"
                        />
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
        <!-- <admin-card-wrapper group-label="Messages">
            <template #content>
                {{ textInput }}
                <div class="flex flex-col gap-[1rem]">
                    <edc-text-input
                        v-model="textInput"
                        type="number"
                        :max-length="10"
                        :whole-part="{
                            minLength: 0,
                            maxLength: 2,
                        }"
                        :fractional-part="{
                            minLength: 0,
                            maxLength: 2,
                        }"
                    />
                </div>
            </template>
        </admin-card-wrapper> -->
    </div>
</template>

<style scoped></style>
