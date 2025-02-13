<script setup lang="ts">
    // // @ts-ignore
    // // @ts-nocheck
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading from "~/services/apis/data/loading";
    import {
        crfVersionSitePaginationListAPI,
        releaseVersionListByTrialIdAPI,
    } from "~/services/apis/handlers/admin/release-version";
    import type {
        ICRFVersionSiteData,
        IReleaseVersionData,
    } from "~/services/apis/handlers/types/admin/release-version-types";
    import useToastStore from "~/stores/toast";
    import type { IOptions, IWinFormProps, TNullableString } from "~/types/common";
    import type { IColumn } from "~/types/datatable";

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const loading = ref<Loading>(new Loading());
    const releaseVersionFilter = ref<TNullableString>(null);
    const releaseVersionOptions = ref<DropdownOption>(new DropdownOption());
    const tableData = ref<ICRFVersionSiteData[]>([]);
    const formColumns: IColumn[] = [
        {
            field: "environmentName",
            header: "Environment",
            icon: false,
            show: true,
        },
        {
            field: "siteName",
            header: "Sites",
            icon: false,
            show: true,
        },
        {
            field: "defaultCRFVersion",
            header: "Default CRF Version For Site",
            icon: false,
            show: true,
        },
    ];

    const crfVersionSitesGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Current CRF Versions for Environment and Sites - ${props.tabData[props.activeTab.label].data.trialName}`
            : "Current CRF Versions for Environment and Sites",
    );

    const releaseVersionLookups = computed(() => {
        const result: IOptions[] = [];
        for (const row of releaseVersionOptions.value.options as unknown as IReleaseVersionData[]) {
            result.push({
                label: `${row.releaseVersionName} (${padCharactersToString(row.releaseVersionId, "start")})`,
                value: row.id,
            });
        }
        return deepClone(result) as IOptions[];
    });

    function getReleaseVersionNameById() {
        if (!releaseVersionFilter.value) return null;
        const dropdownLabel = getDropdownLabelByValue(
            releaseVersionLookups.value,
            releaseVersionFilter.value,
        );
        return dropdownLabel ? dropdownLabel.slice(0, dropdownLabel.indexOf("(")).trim() : null;
    }

    async function releaseVersionListByTrialId() {
        releaseVersionOptions.value.loading = true;
        const { status, message, data } = await releaseVersionListByTrialIdAPI(
            Number(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            releaseVersionOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            releaseVersionOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        releaseVersionOptions.value.loading = false;
    }

    function setTableData(tableDataRow: ICRFVersionSiteData[]) {
        return tableDataRow.map((row) => ({
            ...row,
            defaultCRFVersion: `${row.releaseVersionName} (${padCharactersToString(row.releaseVersionId, "start")})`,
        }));
    }

    async function crfVersionSitePaginationList() {
        loading.value.table = true;
        const { message, status, data } = await crfVersionSitePaginationListAPI(
            getAPIFilters({
                // search: releaseVersionFilter.value,
                search: getReleaseVersionNameById(),
                filter: {
                    trialId: Number(props.tabData[props.activeTab.label].data.id),
                },
            }),
        );
        if (status === 200) {
            const { items } = data || {};
            tableData.value = deepClone(setTableData(items));
        } else if (status !== 401) {
            tableData.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.table = false;
    }

    onMounted(() => {
        Promise.all([crfVersionSitePaginationList(), releaseVersionListByTrialId()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="crfVersionSitesGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[5rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <div class="flex flex-row items-center gap-[1rem] mb-[1rem]">
                            <!-- :key="`${releaseVersionFilter ? `releaseVersionFilter-${releaseVersionFilter}` : 'releaseVersionFilter'}`" -->
                            <!-- container-class="w-[50rem] !flex-row !items-center !gap-[1rem]" -->
                            <edc-dropdown
                                v-model="releaseVersionFilter"
                                :options="releaseVersionLookups"
                                input-class="admin-input-font"
                                container-class="w-[20rem]"
                                label-class="font-bold admin-input-font"
                                option-placement="bottom-start"
                                option-class="w-[20rem]"
                                :enable-clear="true"
                                :ellipse-count="13"
                                :loading="releaseVersionOptions.loading"
                                label="CRFVersion For Subjects"
                                @on-select="
                                    async (selectedValue) => {
                                        await crfVersionSitePaginationList();
                                    }
                                "
                                @on-clear="
                                    async () => {
                                        await crfVersionSitePaginationList();
                                    }
                                "
                            />
                        </div>
                        <div>
                            <edc-data-table
                                :columns="formColumns"
                                :table-data="tableData"
                                :loading="loading.table"
                                pagination-type="lazy"
                                table-style="outlined"
                                :custom-content="false"
                            >
                            </edc-data-table>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
