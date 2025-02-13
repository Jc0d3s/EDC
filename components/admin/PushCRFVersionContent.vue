<script setup lang="ts">
    import DropdownOption from "~/services/apis/data/dropdown-option";
    import Loading from "~/services/apis/data/loading";
    import {
        getPushedDetailsByIdsAPI,
        pushCRFVersionAPI,
    } from "~/services/apis/handlers/admin/release-version";
    import { listAllSitesAPI } from "~/services/apis/handlers/admin/site";
    import { siteGroupListAPI } from "~/services/apis/handlers/admin/site-group";
    import { copySubjectsAPI } from "~/services/apis/handlers/admin/subject";
    import { trialEnvironmentListByTrialIdAPI } from "~/services/apis/handlers/admin/trial-environment";
    import { deleteQuickLinksAPI } from "~/services/apis/handlers/portal/dashboard";
    import type { IPublishedVersionData } from "~/services/apis/handlers/types/admin/release-version-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type { IWinFormProps, TNullableNumber, TNullableString } from "~/types/common";

    interface IFormModel {
        toStudy: TNullableNumber;
        toSites: TNullableString;
        selectedSites: number[];
    }
    // pushCRFVersionAPI

    const getDefaultModel = (): IFormModel => ({
        toStudy: null,
        toSites: "allSites",
        selectedSites: [],
    });

    const getDefaultPublishedVersionModel = (): IPublishedVersionData => ({
        id: 0,
        environmentId: 0,
        releaseVersionId: 0,
        siteGroupIds: [],
        siteIds: [],
        trialId: 0,
        updatedBy: 0,
    });

    const formModel = ref<IFormModel>({
        ...getDefaultModel(),
    });

    const formModelRef = ref<IFormModel>({
        ...getDefaultModel(),
    });

    const errorModel = ref<{
        toStudy: string;
        toSites: string;
        selectedSites: string;
    }>({
        selectedSites: "",
        toSites: "",
        toStudy: "",
    });

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const unsavedAlertStore = useUnsavedAlertStore();
    const toastStore = useToastStore();
    const loading = ref<Loading>(new Loading());
    const environmentOptions = ref<DropdownOption>(new DropdownOption());
    const siteOptions = ref<DropdownOption>(new DropdownOption());
    const siteGroupOptions = ref<DropdownOption>(new DropdownOption());
    const showPushSuccessMessage = ref<string>("");
    const publishedVersionDetails = ref<IPublishedVersionData>({
        ...getDefaultPublishedVersionModel(),
    });

    const environmentLookups = computed(() =>
        getOptionsList(environmentOptions.value.options, "environment", "id"),
    );

    const siteLookups = computed(() => getOptionsList(siteOptions.value.options, "siteName", "id"));

    const siteGroupLookups = computed(() =>
        getOptionsList(siteGroupOptions.value.options, "siteGroupName", "id"),
    );

    const groupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Push CRF Version - ${props.tabData[props.activeTab.label].data.releaseVersionName} (${props.tabData[props.activeTab.label].data.trialName})`
            : "Push CRF Version",
    );

    const pickListOptions = computed(() => {
        if (formModel.value.toSites === "selectSiteGroups") {
            return siteGroupLookups.value;
        }
        return siteLookups.value;
    });

    async function trialEnvironmentList() {
        environmentOptions.value.loading = true;
        const { status, data, message } = await trialEnvironmentListByTrialIdAPI(
            String(props.tabData[props.activeTab.label].data.trialId),
        );
        if (status === 200) {
            environmentOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            environmentOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        environmentOptions.value.loading = false;
    }

    async function sitesList() {
        siteOptions.value.loading = true;
        const { status, data, message } = await listAllSitesAPI();
        if (status === 200) {
            siteOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            siteOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        siteOptions.value.loading = false;
    }

    async function siteGroupList() {
        siteGroupOptions.value.loading = true;
        const { status, data, message } = await siteGroupListAPI({
            onlySites: "true",
        });
        if (status === 200) {
            siteGroupOptions.value.options = deepClone(data);
        } else if (status !== 401) {
            siteGroupOptions.value.options = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
        siteGroupOptions.value.loading = false;
    }

    function validateAll() {
        if (!formModel.value.toStudy) errorModel.value.toStudy = "Please select an environment";
        else errorModel.value.toStudy = "";
        if (!formModel.value.toSites) errorModel.value.toSites = "Please choose an option";
        else errorModel.value.toSites = "";
        if (
            formModel.value.toSites !== "allSites" &&
            getArrayLength(formModel.value.selectedSites) === 0
        )
            errorModel.value.selectedSites = `Please select atleast one ${formModel.value.toSites === "selectSiteGroups" ? "Site Group" : "Site"}`;
        else errorModel.value.selectedSites = "";
    }

    function getSitesList() {
        const sites = [];
        const siteGroups = [];
        if (formModel.value.toSites === "allSites") {
            for (const row of siteLookups.value) {
                sites.push(Number(row.value));
            }
        } else {
            for (const row of formModel.value.selectedSites) {
                if (formModel.value.toSites === "selectSiteGroups") {
                    siteGroups.push(row);
                } else if (formModel.value.toSites === "selectSites") {
                    sites.push(row);
                }
            }
        }
        return {
            sites,
            siteGroups,
        };
    }

    async function copySubjects(trialId: number, environmentId: number) {
        await copySubjectsAPI({
            trialId,
            environmentId,
        });
    }

    async function deleteQuickLinks(trialId: number, environmentId: number) {
        await deleteQuickLinksAPI({
            trialId,
            environmentId,
        });
    }

    async function pushCRFVersion() {
        validateAll();
        if (!checkIfModelHasErrors(errorModel.value)) {
            loading.value.form = true;
            const { siteGroups, sites } = getSitesList();
            const { status, message } = await pushCRFVersionAPI({
                id: publishedVersionDetails.value.id || 0,
                trialId: Number(props.tabData[props.activeTab.label].data.trialId),
                environmentId: formModel.value.toStudy as number,
                releaseVersionId: Number(props.tabData[props.activeTab.label].data.id),
                siteGroupIds: siteGroups,
                siteIds: sites,
                updatedBy: 0,
            });
            if (status === 200) {
                toastStore.success({
                    title: "Success",
                    message,
                });
                if (publishedVersionDetails.value.id)
                    showPushSuccessMessage.value = `CRF Version: ${props.tabData[props.activeTab.label].data.releaseVersionName} with ID = ${props.tabData[props.activeTab.label].data.releaseVersionId} was successfully updated`;
                else
                    showPushSuccessMessage.value = `CRF Version: ${props.tabData[props.activeTab.label].data.releaseVersionName} with ID = ${props.tabData[props.activeTab.label].data.releaseVersionId} was successfully pushed`;
                Promise.all([
                    copySubjects(
                        Number(props.tabData[props.activeTab.label].data.trialId),
                        formModel.value.toStudy as number,
                    ),
                    deleteQuickLinks(
                        Number(props.tabData[props.activeTab.label].data.trialId),
                        formModel.value.toStudy as number,
                    ),
                ]);
                formModel.value = { ...getDefaultModel() };
                formModelRef.value = { ...getDefaultModel() };
                publishedVersionDetails.value = { ...getDefaultPublishedVersionModel() };
                errorModel.value = {
                    selectedSites: "",
                    toSites: "",
                    toStudy: "",
                };
            } else if (status !== 401) {
                toastStore.error({
                    title: "Error",
                    message,
                });
                showPushSuccessMessage.value = "";
            }
            loading.value.form = false;
        }
    }

    function setFormModelDetails(newToSite: TNullableString) {
        if (newToSite === "selectSites") {
            formModel.value.selectedSites = [...publishedVersionDetails.value.siteIds];
            formModelRef.value.selectedSites = [...publishedVersionDetails.value.siteIds];
        } else if (newToSite === "selectSiteGroups") {
            formModel.value.selectedSites = [...publishedVersionDetails.value.siteGroupIds];
            formModelRef.value.selectedSites = [...publishedVersionDetails.value.siteGroupIds];
        } else {
            formModel.value.selectedSites = [];
            formModelRef.value.selectedSites = [];
        }
    }

    async function pushedDetailsByIds() {
        loading.value.form = true;
        const { status, message, data } = await getPushedDetailsByIdsAPI(
            Number(props.tabData[props.activeTab.label].data.trialId),
            Number(formModel.value.toStudy),
            Number(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            publishedVersionDetails.value = deepClone(data);
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
            publishedVersionDetails.value = { ...getDefaultPublishedVersionModel() };
        }
        loading.value.form = false;
    }

    watch(
        () => formModel.value.toSites,
        (newToSites) => {
            formModel.value.selectedSites = [];
            if (formModel.value.toStudy && publishedVersionDetails.value.id) {
                setFormModelDetails(newToSites);
            }
        },
    );

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        formModel.value,
        formModelRef.value,
    );

    watch(
        () => formModel.value,
        (newFormModel) => {
            model.value = newFormModel;
            modelRef.value = formModelRef.value;
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
            if (newTriggerFormActionAlert === "reset") {
                if (isModelChanged.value) {
                    formModel.value = deepClone(formModelRef.value);
                    unsavedAlertStore.triggerFormActionAlert = "none";
                }
            }
        },
    );

    onMounted(() => {
        Promise.all([trialEnvironmentList(), sitesList(), siteGroupList()]);
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="groupLabel">
            <template #content>
                <div class="grid grid-cols-2 gap-[1rem]">
                    <div class="flex flex-col gap-[1rem]">
                        <edc-dropdown
                            :key="`${formModel.toStudy ? formModel.toStudy : 'toStudy'}`"
                            v-model="formModel.toStudy"
                            container-class="w-fit"
                            label="To Study"
                            label-class="font-bold admin-input-font"
                            input-class="admin-input-font"
                            :required="true"
                            :options="environmentLookups"
                            :loading="environmentOptions.loading"
                            :disabled="loading.isDisabled(environmentOptions.loading)"
                            :error="errorModel.toStudy"
                            @on-select="
                                async () => {
                                    if (showPushSuccessMessage) showPushSuccessMessage = '';
                                    formModel.selectedSites = [];
                                    formModel.toSites = 'allSites';
                                    formModelRef.selectedSites = [];
                                    formModelRef.toSites = 'allSites';
                                    if (formModel.toStudy) await pushedDetailsByIds();
                                }
                            "
                        />
                        <div class="flex flex-col gap-[0.5rem]">
                            <edc-form-label
                                input-id="toSites"
                                label="To Sites"
                                label-class="font-bold admin-input-font"
                                :required="true"
                                :disabled="
                                    loading.isDisabled(
                                        environmentOptions.loading,
                                        siteOptions.loading,
                                        siteGroupOptions.loading,
                                    )
                                "
                            />
                            <edc-radio
                                v-model="formModel.toSites"
                                value="allSites"
                                container-class="w-fit ml-[2rem]"
                                label="All Sites"
                                label-class="mb-0 admin-input-font"
                                input-class="admin-input-font"
                                name="toSiteValues"
                                :disabled="
                                    loading.isDisabled(
                                        environmentOptions.loading,
                                        siteOptions.loading,
                                        siteGroupOptions.loading,
                                    )
                                "
                            />
                            <edc-radio
                                v-model="formModel.toSites"
                                value="selectSites"
                                container-class="w-fit ml-[2rem]"
                                label="Select Site(s)"
                                name="toSiteValues"
                                label-class="mb-0 admin-input-font"
                                input-class="admin-input-font"
                                :disabled="
                                    loading.isDisabled(
                                        environmentOptions.loading,
                                        siteOptions.loading,
                                        siteGroupOptions.loading,
                                    )
                                "
                            />
                            <edc-radio
                                v-model="formModel.toSites"
                                value="selectSiteGroups"
                                container-class="w-fit ml-[2rem]"
                                label="Select Site Group(s)"
                                name="toSiteValues"
                                label-class="mb-0 admin-input-font"
                                input-class="admin-input-font"
                                :disabled="
                                    loading.isDisabled(
                                        environmentOptions.loading,
                                        siteOptions.loading,
                                        siteGroupOptions.loading,
                                    )
                                "
                            />
                        </div>
                    </div>
                    <div class="flex flex-col gap-[1rem]">
                        <edc-pick-list
                            v-model="formModel.selectedSites"
                            input-class="admin-input-font"
                            :list="pickListOptions"
                            :disabled="loading.isDisabled(formModel.toSites === 'allSites')"
                        />
                        <edc-error-text
                            :error="errorModel.selectedSites"
                            container-class="-mt-[0.7rem]"
                        />
                        <div class="flex flex-row items-center self-end gap-[2rem]">
                            <EdcActionButton
                                label="Push"
                                :on-click="
                                    async () => {
                                        await pushCRFVersion();
                                    }
                                "
                                container-class="rounded-[--border-radius-4] px-[2rem] py-[0.5rem]"
                                label-class="font-12"
                                :disabled="loading.isDisabled()"
                            />
                        </div>
                        <div class="flex flex-col gap-[1rem]">
                            <p
                                v-if="showPushSuccessMessage"
                                class="font-bold font-12 text-[var(--color-success)]"
                            >
                                {{ showPushSuccessMessage }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
