<script setup lang="ts">
    import {
        sideMenuBarDetails,
        type ITabMenu,
        type TSideBar,
        type ISelectedRow,
        type TTabPageMap,
        type IActiveTab,
        type ITabData,
    } from "~/services/apis/data/admin/win-forms";
    import type { IItemCheck } from "~/utils/array";
    import HomeContent from "~/components/admin/HomeContent.vue";
    import BuilderContent from "~/components/admin/BuilderContent.vue";
    import TrialContent from "~/components/admin/TrialContent.vue";
    import TrialGroupContent from "~/components/admin/TrialGroupContent.vue";
    import TrialSiteContent from "~/components/admin/TrialSiteContent.vue";
    import EnvironmentSetupContent from "~/components/admin/EnvironmentSetupContent.vue";
    import BranchContent from "~/components/admin/BranchContent.vue";
    import FormContent from "~/components/admin/FormContent.vue";
    import FormFieldContent from "~/components/admin/FormFieldContent.vue";
    import FormFolderContent from "~/components/admin/FormFolderContent.vue";
    import FormMatricesContent from "~/components/admin/FormMatricesContent.vue";
    import AssignMatricesContent from "~/components/admin/AssignMatricesContent.vue";
    import DataDictionaryContent from "~/components/admin/DataDictionaryContent.vue";
    import UnitDictionaryContent from "~/components/admin/UnitDictionaryContent.vue";
    import EditCheckContent from "~/components/admin/EditCheckContent.vue";
    import EditCheckEntryContent from "~/components/admin/EditCheckEntryContent.vue";
    import DerivationContent from "~/components/admin/DerivationContent.vue";
    import DerivationEntryContent from "~/components/admin/DerivationEntryContent.vue";
    import RestrictionContent from "~/components/admin/RestrictionContent.vue";
    import CustomFunctionContent from "~/components/admin/CustomFunctionContent.vue";
    import PushCRFVersionContent from "~/components/admin/PushCRFVersionContent.vue";
    import CRFVersionSiteListContent from "~/components/admin/CRFVersionSiteListContent.vue";
    import CRFVersionSettingsContent from "~/components/admin/CRFVersionSettingsContent.vue";
    import WorkInProgress from "~/components/admin/WorkInProgress.vue";
    import SiteAdministrationContent from "~/components/admin/SiteAdministrationContent.vue";
    import SitesContent from "~/components/admin/SitesContent.vue";
    import SitesGroupContent from "~/components/admin/SitesGroupContent.vue";
    import SubjectFieldConfigContent from "~/components/admin/SubjectFieldConfigContent.vue";
    import UserAdministrationContent from "~/components/admin/UserAdministrationContent.vue";
    import EmailAlertContent from "~/components/admin/EmailAlertContent.vue";
    import RolesContent from "~/components/admin/RolesContent.vue";
    import UsersContent from "~/components/admin/UsersContent.vue";
    import SiteEntriesContent from "~/components/admin/SiteEntriesContent.vue";
    import UserEntriesContent from "~/components/admin/UserEntriesContent.vue";
    import GlobalUnitDictionaryContent from "~/components/admin/GlobalUnitDictionaryContent.vue";
    import GlobalDataDictionaryContent from "~/components/admin/GlobalDataDictionaryContent.vue";
    import SubjectFormConfigContent from "~/components/admin/SubjectFormConfigContent.vue";
    import StudyUserSiteContent from "~/components/admin/StudyUserSiteContent.vue";
    import SiteTherapeuticAreaContent from "~/components/admin/SiteTherapeuticAreaContent.vue";
    import RoleGroupEntriesContent from "~/components/admin/RoleGroupEntriesContent.vue";
    import SubjectContent from "~/components/admin/SubjectContent.vue";
    import StudySiteInvestigatorContent from "~/components/admin/StudySiteInvestigatorContent.vue";
    import SiteTherapeuticAreaInvestigatorContent from "~/components/admin/SiteTherapeuticAreaInvestigatorContent.vue";
    import PublishedFormContent from "~/components/admin/PublishedFormContent.vue";
    import PublishedFormFieldContent from "~/components/admin/PublishedFormFieldContent.vue";
    import PublishedFormFolderContent from "~/components/admin/PublishedFormFolderContent.vue";
    import PublishedFormMatricesContent from "~/components/admin/PublishedFormMatricesContent.vue";
    import PublishedAssignMatricesContent from "~/components/admin/PublishedAssignMatricesContent.vue";
    import PublishedDataDictionaryContent from "~/components/admin/PublishedDataDictionaryContent.vue";
    import PublishedUnitDictionaryContent from "~/components/admin/PublishedUnitDictionaryContent.vue";
    import PublishedEditCheckContent from "~/components/admin/PublishedEditCheckContent.vue";
    import PublishedEditCheckEntryContent from "~/components/admin/PublishedEditCheckEntryContent.vue";
    import PublishedDerivationContent from "~/components/admin/PublishedDerivationContent.vue";
    import PublishedDerivationEntryContent from "~/components/admin/PublishedDerivationEntryContent.vue";
    import PublishedRestrictionContent from "~/components/admin/PublishedRestrictionContent.vue";
    import PublishedCustomFunctionContent from "~/components/admin/PublishedCustomFunctionContent.vue";
    import AssignRolePermissionTypeContent from "~/components/admin/AssignRolePermissionTypeContent.vue";
    import SubjectSiteTransferContent from "~/components/admin/SubjectSiteTransferContent.vue";
    import ReorderMatrices from "~/components/admin/ReorderMatrices.vue";
    import GlobalEditCheckContent from "~/components/admin/GlobalEditCheckContent.vue";
    import GlobalEditCheckEntryContent from "~/components/admin/GlobalEditCheckEntryContent.vue";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import useAdminWinFormStore from "~/stores/admin-winform";

    function scrollIntoContentView() {
        const mainMenuContentContainer = getDOMElement(
            "div.main-menu-content-container > div > button.close-button",
        );
        if (mainMenuContentContainer) {
            mainMenuContentContainer.scrollIntoView({
                behavior: "smooth",
                block: "start",
                // inline: "start",
            });
        }
    }

    function scrollToActiveTabView() {
        const activeTabContainer = getDOMElement(
            "section.main-menu-container > ul > li.active-tab",
        );
        if (activeTabContainer) {
            activeTabContainer.scrollIntoView({
                behavior: "smooth",
                block: "start",
                // inline: "start",
            });
        }
    }

    interface IActiveTabHistory extends ITabMenu {
        isActive: boolean;
        uniqueId: string;
    }
    const unsavedAlertStore = useUnsavedAlertStore();
    const adminWinFormStore = useAdminWinFormStore();
    const disabled = ref<boolean>(false);
    // const activeTab = ref<string>("Home");

    const activeTab = ref<IActiveTab>({
        // action: () => {},
        icon: "home",
        module: "Home",
        label: "Home",
        page: "Home",
        uniqueId: String(new Date().getTime()),
    });
    const activeTabHistory = ref<IActiveTabHistory[]>([
        {
            // action: () => {},
            icon: "home",
            module: "Home",
            label: "Home",
            page: "Home",
            isActive: true,
            uniqueId: String(new Date().getTime()),
        },
    ]);
    const sideMenusList = ref<TSideBar>(deepClone(sideMenuBarDetails));
    const mapTabMenuSlot: Record<TTabPageMap, any> = {
        Home: HomeContent,
        Builder: BuilderContent,
        Trial: TrialContent,
        "Trial Group": TrialGroupContent,
        "Trial Sites": TrialSiteContent,
        "Studies Environment Setup": EnvironmentSetupContent,
        Branch: BranchContent,
        Forms: FormContent,
        "Form Fields": FormFieldContent,
        Folders: FormFolderContent,
        Matrices: FormMatricesContent,
        "Assign Matrices": AssignMatricesContent,
        Dictionaries: DataDictionaryContent,
        "Unit Dictionaries": UnitDictionaryContent,
        "Edit Checks": EditCheckContent,
        "Edit Checks Entries": EditCheckEntryContent,
        Derivations: DerivationContent,
        "Derivation Entries": DerivationEntryContent,
        Restrictions: RestrictionContent,
        "Custom Functions": CustomFunctionContent,
        "Push CRF Version": PushCRFVersionContent,
        "CRFVersion-Site List": CRFVersionSiteListContent,
        "CRF Version Settings": CRFVersionSettingsContent,
        "Amendment Manager Scheduler": WorkInProgress,
        "Amendment Manager": WorkInProgress,
        "Get Draft Template": WorkInProgress,
        "PDF Generator": WorkInProgress,
        "Query Management": WorkInProgress,
        "Subject Fields Config": SubjectFieldConfigContent,
        "Upload Draft": WorkInProgress,
        "User Administration": UserAdministrationContent,
        Reporter: WorkInProgress,
        "Site Administration": SiteAdministrationContent,
        "Sites Group": SitesGroupContent,
        Sites: SitesContent,
        Roles: RolesContent,
        Users: UsersContent,
        "Site Entries": SiteEntriesContent,
        "User Entries": UserEntriesContent,
        "Email Alert": EmailAlertContent,
        "Global Libraries": WorkInProgress,
        "Global Dictionaries": GlobalDataDictionaryContent,
        "Global Unit Dictionaries": GlobalUnitDictionaryContent,
        "Subject Form Configs": SubjectFormConfigContent,
        "Study User Sites": StudyUserSiteContent,
        "Site Therapeutic Areas Investigators": SiteTherapeuticAreaInvestigatorContent,
        "Site Therapeutic Areas": SiteTherapeuticAreaContent,
        "Role Group Entries": RoleGroupEntriesContent,
        Subjects: SubjectContent,
        "Study Site Investigators": StudySiteInvestigatorContent,
        "Published Forms": PublishedFormContent,
        "Published Form Fields": PublishedFormFieldContent,
        "Published Folders": PublishedFormFolderContent,
        "Published Dictionaries": PublishedDataDictionaryContent,
        "Published Unit Dictionaries": PublishedUnitDictionaryContent,
        "Published Matrices": PublishedFormMatricesContent,
        "Published Assign Matrices": PublishedAssignMatricesContent,
        "Published Edit Checks": PublishedEditCheckContent,
        "Published Edit Checks Entries": PublishedEditCheckEntryContent,
        "Published Custom Functions": PublishedCustomFunctionContent,
        "Published Derivations": PublishedDerivationContent,
        "Published Derivation Entries": PublishedDerivationEntryContent,
        "Published Restrictions": PublishedRestrictionContent,
        "Assign Permissions": AssignRolePermissionTypeContent,
        "Subject Site Transfers": SubjectSiteTransferContent,
        "Matrices Reorder": ReorderMatrices,
        "Global Edit Checks": GlobalEditCheckContent,
        "Global Edit Checks Entries": GlobalEditCheckEntryContent,
    };

    const tabsList = ref<IActiveTab[]>([
        {
            // action: () => {},
            icon: "home",
            module: "Home",
            label: "Home",
            page: "Home",
            uniqueId: String(new Date().getTime()),
        },
    ]);
    const tabData = ref<Record<string, ITabData>>({});

    function handleTabHistoryPush(label: string) {
        activeTabHistory.value = activeTabHistory.value.map((tabHistoryRow) => ({
            ...tabHistoryRow,
            isActive: tabHistoryRow.label === label,
        }));
    }

    function changeTab(menuRow: IActiveTab) {
        activeTab.value = deepClone(menuRow);
        handleTabHistoryPush(menuRow.label);
        scrollToActiveTabView();
        scrollIntoContentView();
    }

    function switchToExistingTab(menuRow: ITabMenu) {
        const menuDetails = activeTabHistory.value.filter((row) => row.label === menuRow.label);
        if (getArrayLength(menuDetails) > 0) changeTab(menuDetails[0]);
    }

    function addToTabsList(menuRow: ITabMenu) {
        const itemToCheck = {
            data: tabsList.value,
            type: "object",
            value: menuRow.label,
            key: "label",
        } as IItemCheck;
        if (!checkIfItemExists(itemToCheck)) {
            // tabsList.value.push({
            //     action: () => {},
            //     icon: "architect",
            //     label: menuLabel,
            // });
            const uniqueId = String(new Date().getTime());
            tabsList.value.push({ ...menuRow, uniqueId });
            activeTabHistory.value.push({
                ...menuRow,
                isActive: false,
                uniqueId,
            });
            // handleTabHistoryPush(menuRow.label);
            changeTab({ ...menuRow, uniqueId });
        } else {
            switchToExistingTab(menuRow);
        }
        // else {
        //     tabsList.value.splice(getIndexOfTheItem(itemToCheck), 1);
        //     activeTabHistory.value.splice(
        //         getIndexOfTheItem({
        //             data: activeTabHistory.value,
        //             type: "primitive",
        //             value: menuRow.label,
        //             key: "label",
        //         }),
        //         1,
        //     );
        // }
    }

    function handleTabClose() {
        tabsList.value.splice(
            getIndexOfTheItem({
                data: tabsList.value,
                type: "object",
                value: activeTab.value.label,
                key: "label",
            }),
            1,
        );
        // FIXME: check if removing tabData impacts its children
        removeTabData(activeTab.value.label);
        // const currentTabIndex = getIndexOfTheItem({
        //     data: activeTabHistory.value,
        //     type: "primitive",
        //     value: activeTab.value,
        //     key: "label",
        // });
        const currentTabIndex = getIndexOfTheItem({
            data: activeTabHistory.value,
            type: "object",
            value: activeTab.value.label,
            key: "label",
        });
        activeTabHistory.value.splice(currentTabIndex, 1);
        const previousTabHistory =
            activeTabHistory.value[getArrayLength(activeTabHistory.value) - 1];
        deleteObjectPropertyByKey(activeTab.value.label, adminWinFormStore.goBackWinFormDetails);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isActive, ...restParams } = previousTabHistory;
        activeTab.value = {
            ...restParams,
            // uniqueId: String(new Date().getTime()),
        };
        handleTabHistoryPush(activeTab.value.label);
        scrollToActiveTabView();
    }

    function handleGoBack() {
        tabsList.value.splice(
            getIndexOfTheItem({
                data: tabsList.value,
                type: "object",
                value: activeTab.value.label,
                key: "label",
            }),
            1,
        );
        // FIXME: check if removing tabData impacts its children
        removeTabData(activeTab.value.label);
        // const currentTabIndex = getIndexOfTheItem({
        //     data: activeTabHistory.value,
        //     type: "primitive",
        //     value: activeTab.value,
        //     key: "label",
        // });
        const currentTabIndex = getIndexOfTheItem({
            data: activeTabHistory.value,
            type: "object",
            value: activeTab.value.label,
            key: "label",
        });
        activeTabHistory.value.splice(currentTabIndex, 1);

        const previousTabHistory = activeTabHistory.value.filter(
            (row) =>
                row.uniqueId ===
                adminWinFormStore.goBackWinFormDetails[activeTab.value.label].parentTab.uniqueId,
        );
        if (getArrayLength(previousTabHistory) > 0) {
            deleteObjectPropertyByKey(
                activeTab.value.label,
                adminWinFormStore.goBackWinFormDetails,
            );
            adminWinFormStore.triggerGoBackPostHook.type = activeTab.value.page;
            adminWinFormStore.triggerGoBackPostHook.trigger = true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isActive, ...restParams } = previousTabHistory[0];
            activeTab.value = {
                ...restParams,
                // uniqueId: String(new Date().getTime()),
            };
            handleTabHistoryPush(activeTab.value.label);
        }
        scrollToActiveTabView();
    }

    function addTabData(tabLabel: string, data: any, queryData?: any) {
        if (!checkIfKeyExistsInObject(tabLabel, tabData.value)) {
            const tabObject: ITabData = {
                data,
            };
            if (queryData) tabObject["queryData"] = queryData;
            tabData.value[tabLabel] = deepClone(tabObject);
        }
    }

    function removeTabData(tabLabel: string) {
        if (checkIfKeyExistsInObject(tabLabel, tabData.value)) {
            delete tabData.value[tabLabel];
        }
    }

    function handleDynamicRowSelect(selectedRow: ISelectedRow<any>) {
        // addToTabsList(selectedProject["Active Projects"]);
        const previousActiveTab: IActiveTab = deepClone(activeTab.value);
        addToTabsList({
            // action: () => {},
            icon: "fallback-image",
            label: selectedRow.label,
            module: selectedRow.module,
            page: selectedRow.page,
        });
        addTabData(selectedRow.label, selectedRow.data, selectedRow.queryData);
        if (adminWinFormStore.triggerGoBack) {
            adminWinFormStore.goBackWinFormDetails[activeTab.value.label] = {
                parentTab: previousActiveTab,
            };
            adminWinFormStore.triggerGoBack = false;
        }
        // activeTab.value = module;
        // activeTabHistory.value.push(selectedProject["Active Projects"]);
    }

    function isActiveTab(tabRow: ITabMenu) {
        const findMenuIndex = getIndexOfTheItem({
            data: activeTabHistory.value,
            type: "object",
            value: tabRow.label,
            key: "label",
        });
        return (
            activeTab.value.page === tabRow.page &&
            activeTabHistory.value[findMenuIndex].isActive &&
            activeTabHistory.value[findMenuIndex].label === tabRow.label
        );
    }

    function handleSideMenuChange(menuRow: ITabMenu) {
        const tabDataByModule = tabData.value[activeTab.value.label];
        addToTabsList(menuRow);
        const tabObject: ITabData = {
            data: tabDataByModule ? tabDataByModule.data : {},
            queryData: tabDataByModule ? tabDataByModule.queryData : undefined,
        };
        addTabData(activeTab.value.label, tabObject.data, tabObject.queryData);
    }

    watch(
        () => unsavedAlertStore.triggerWinformAlert,
        (newTriggerWinformAlert) => {
            if (newTriggerWinformAlert) {
                if (!window.confirm("Reload page confirmation message")) {
                    // return false;
                    unsavedAlertStore.triggerWinformAlert = false;
                } else {
                    if (unsavedAlertStore.tabAction === "new menu") {
                        addToTabsList(unsavedAlertStore.tabMenuRef!);
                        addTabData(
                            activeTab.value.label,
                            unsavedAlertStore.tabDataRef,
                            unsavedAlertStore.tabQueryDataRef,
                        );
                    } else if (unsavedAlertStore.tabAction === "close menu") {
                        handleTabClose();
                    } else if (unsavedAlertStore.tabAction === "change menu") {
                        changeTab(unsavedAlertStore.tabRowRef!);
                    } else if (unsavedAlertStore.tabAction === "go back") {
                        handleGoBack();
                    }
                    const resetForm = ["change menu", "new menu"].includes(
                        unsavedAlertStore.tabAction,
                    );
                    unsavedAlertStore.clearStore();
                    if (resetForm) unsavedAlertStore.triggerFormActionAlert = "reset";
                }
            }
        },
    );
</script>

<template>
    <div class="flex flex-row w-full h-full">
        <!-- <section class="w-full tab-container secondary-bg h-[4rem]"></section> -->
        <section class="side-menu-container flex flex-col w-[17%] h-full secondary-bg">
            <!-- <div class="w-full tab-container secondary-bg h-[4rem]" /> -->
            <!-- <Transition name="slide-left"> -->
            <!-- :key="sideMenusList[activeTab].heading" -->
            <div
                class="w-[95%] flex flex-col self-center border-[0.1rem] border-gray-200 rounded-[var(--border-radius-10)] mt-[1rem] box-shadow-mild"
            >
                <h3
                    class="bg-[var(--color-secondary)] white-text px-[1rem] py-[0.5rem] text-[1.5rem] border-b-[0.05rem] border-b-[var(--color-white)] font-bold rounded-t-[var(--border-radius-10)]"
                >
                    {{ sideMenusList[activeTab.page].heading }}
                </h3>
                <ul
                    v-if="getArrayLength(sideMenusList[activeTab.page].menus) > 0"
                    class="flex flex-col white-bg rounded-b-[var(--border-radius-10)]"
                >
                    <li
                        v-for="[index, menuRow] of sideMenusList[activeTab.page].menus.entries()"
                        :key="menuRow.label"
                        class="transition-all group/sideMenu cursor-pointer px-[1rem] py-[0.5rem] text-[1.3rem] hover:bg-[var(--color-secondary)] flex flex-row items-center gap-[1rem]"
                        :class="[
                            index === getArrayLength(sideMenusList[activeTab.page].menus) - 1
                                ? 'rounded-b-[var(--border-radius-10)]'
                                : 'rounded-0',
                            isElementDisabled(disabled)
                                ? 'bg-[var(--color-gray-background)]'
                                : 'white-bg',
                        ]"
                        :disabled="isElementDisabled(disabled)"
                        @click="
                            () => {
                                if (unsavedAlertStore.isUnsavedChanges) {
                                    unsavedAlertStore.tabMenuRef = menuRow;
                                    unsavedAlertStore.tabDataRef = tabData[activeTab.label].data;
                                    unsavedAlertStore.tabQueryDataRef =
                                        tabData[activeTab.label].queryData;
                                    unsavedAlertStore.activeTabRef = activeTab;
                                    unsavedAlertStore.tabAction = 'new menu';
                                    unsavedAlertStore.triggerWinformAlert = true;
                                } else {
                                    handleSideMenuChange(menuRow);
                                }
                            }
                        "
                    >
                        <edc-icon
                            :icon="menuRow.icon"
                            :class="`h-[1.5rem] fill-[var(--color-black)] group-hover/sideMenu:fill-[var(--color-white)] ${
                                ['environment-setup', 'derivations'].includes(menuRow.icon)
                                    ? 'stroke-[var(--color-black)]'
                                    : ''
                            } ${
                                !['edit-checks', 'subject-field-config'].includes(menuRow.icon)
                                    ? 'group-hover/sideMenu:stroke-[var(--color-white)]'
                                    : ''
                            }`"
                        />
                        <span
                            v-if="
                                (menuRow.label === 'Home' && activeTab.label === 'Home') ||
                                menuRow.label !== 'Home'
                            "
                            class="transition-all mt-[0.5rem] text-[1.3rem] font-bold text-black group-hover/sideMenu:text-[var(--color-white)]"
                            >{{ menuRow.label }}</span
                        >
                    </li>
                </ul>
                <ul v-else class="flex flex-col white-bg rounded-b-[var(--border-radius-10)]">
                    <li
                        class="transition-all white-bg group/sideMenu cursor-pointer px-[1rem] py-[0.5rem] text-[1.3rem] hover:bg-[var(--color-secondary)] flex flex-row items-center gap-[1rem] rounded-b-[var(--border-radius-10)]"
                        :disabled="true"
                    >
                        <span
                            class="transition-all mt-[0.5rem] text-[1.3rem] font-bold text-black group-hover/sideMenu:text-[var(--color-white)]"
                            >No menus</span
                        >
                    </li>
                </ul>
            </div>
            <!-- {{ JSON.stringify(activeTab) }} <br />
            {{ JSON.stringify(activeTabHistory) }} <br />
            {{ JSON.stringify(tabsList) }} <br /> -->
            <!-- </Transition> -->
        </section>
        <!-- class="main-menu-container flex flex-col w-[83%] h-full border-l-[0.1rem] border-gray-400" -->
        <section class="main-menu-container flex flex-col w-[83%] h-full">
            <!-- <div class=""> -->
            <transition-group
                tag="ul"
                name="company"
                class="w-full tab-container secondary-bg h-[4.4rem] overflow-x-auto flex flex-row gap-x-[0.2rem] items-center"
            >
                <!-- rounded-t-[var(--border-radius-4)] -->
                <li
                    v-for="tabRow of tabsList"
                    :key="tabRow.label"
                    class="tab-menu relative cursor-pointer whitespace-nowrap px-[0.5rem] flex flex-row items-center gap-[0.2rem] h-[90%] self-end"
                    :class="[
                        isActiveTab(tabRow)
                            ? 'bg-white border-t-[0.1rem] text-black active-tab'
                            : 'border-white border-r-[0.1rem] border-b-[var(--color-secondary)] text-white',
                        isElementDisabled(disabled)
                            ? '!bg-[var(--color-gray-background)] !text-black'
                            : '',
                    ]"
                    :disabled="isElementDisabled(disabled)"
                    @click="
                        () => {
                            if (unsavedAlertStore.isUnsavedChanges) {
                                unsavedAlertStore.tabRowRef = tabRow;
                                unsavedAlertStore.tabAction = 'change menu';
                                unsavedAlertStore.triggerWinformAlert = true;
                            } else {
                                changeTab(tabRow);
                            }
                        }
                    "
                >
                    <!-- v-if="tabRow.label === 'Home'" -->
                    <edc-icon
                        :icon="tabRow.icon"
                        :class="`h-[1rem] ${isActiveTab(tabRow) ? 'fill-[var(--color-secondary)]' : 'fill-[var(--color-white)]'} ${isElementDisabled(disabled) ? '!fill-[var(--color-black)]' : ''}`"
                    /><span
                        v-if="
                            (tabRow.label === 'Home' && activeTab.label === 'Home') ||
                            tabRow.label !== 'Home'
                        "
                        class="mt-[0.5rem] text-[1.3rem] font-bold"
                        >{{ tabRow.label }}</span
                    >
                </li>
            </transition-group>
            <!-- </div> -->
            <div
                class="main-menu-content-container overflow-y-auto flex flex-col border-l-[0rem] border-gray-400 h-full w-full p-[1rem]"
            >
                <div
                    class="flex flex-row items-center justify-between"
                    :class="[
                        checkIfKeyExistsInObject(
                            activeTab.label,
                            adminWinFormStore.goBackWinFormDetails,
                        ) && adminWinFormStore.goBackWinFormDetails[activeTab.label]
                            ? 'mb-[1rem]'
                            : '',
                    ]"
                >
                    <admin-action-label
                        v-if="
                            checkIfKeyExistsInObject(
                                activeTab.label,
                                adminWinFormStore.goBackWinFormDetails,
                            ) && adminWinFormStore.goBackWinFormDetails[activeTab.label]
                        "
                        icon="circle-left"
                        text="Go back"
                        :container-class="`${activeTab.label === 'Home' ? 'invisible' : ''}`"
                        :disabled="isElementDisabled()"
                        :on-click="
                            () => {
                                if (unsavedAlertStore.isUnsavedChanges) {
                                    unsavedAlertStore.tabAction = 'go back';
                                    unsavedAlertStore.triggerWinformAlert = true;
                                } else {
                                    handleGoBack();
                                }
                            }
                        "
                    />
                    <admin-action-label
                        v-else
                        icon="circle-left"
                        text="Go back"
                        container-class="invisible"
                        :disabled="true"
                        :on-click="() => {}"
                    />
                    <edc-pressable
                        :container-class="`self-end mr-[1rem] parent-group close-button ${activeTab.label === 'Home' ? 'invisible' : ''}`"
                        :disabled="activeTab.label === 'Home'"
                        :on-click="
                            () => {
                                if (unsavedAlertStore.isUnsavedChanges) {
                                    unsavedAlertStore.tabAction = 'close menu';
                                    unsavedAlertStore.triggerWinformAlert = true;
                                } else {
                                    handleTabClose();
                                }
                            }
                        "
                    >
                        <img
                            :src="getImageSource(IconKeys.Close, 'icon')"
                            :alt="getAltTagTitle('close')"
                            class="h-[1.2rem]"
                        />
                    </edc-pressable>
                </div>
                <!-- :key="activeTab.label" -->
                <!-- <transition name="fade" mode="out-in" appear :duration="500"> -->
                <!-- <transition name="fade" :duration="500"> -->
                <!-- <div :key="activeTab.label" class="w-full"> -->
                <keep-alive :ref_key="activeTab.label">
                    <component
                        :is="mapTabMenuSlot[activeTab.page]"
                        :key="activeTab.uniqueId"
                        :active-tab="activeTab"
                        :tab-data="tabData"
                        @on-row-select="
                            (selectedProject: ISelectedRow<any>) =>
                                handleDynamicRowSelect(selectedProject)
                        "
                    />
                </keep-alive>
                <!-- :tab-label="activeTab.label" -->
                <!-- </div> -->
                <!-- </transition> -->
            </div>
        </section>
    </div>
</template>

<style scoped>
    .company-move {
        transition: all 200ms ease-in-out 50ms;
    }

    /* appearing */
    .company-enter-active {
        transition: all 400ms ease-out;
    }

    /* disappearing */
    .company-leave-active {
        transition: all 200ms ease-in;
        position: absolute;
        z-index: 0;
    }

    /* appear at / disappear to */
    .company-enter,
    .company-leave-to {
        opacity: 0;
    }

    .tab-container::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }

    .tab-menu {
        transition: 0.5s all ease-in-out;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 200ms;
        transition-property: opacity, transform;
        transition-timing-function: cubic-bezier(0.6, 0.15, 0.35, 0.8);
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0;
        transform: translateY(40px);
    }
    /* .fade-enter-active {
      & > * {
        &:nth-child(2) {
          transition-delay: $delay;
        }
        &:nth-child(3) {
          transition-delay: $delay + $delayStep;
        }
      }
    }
    .fade-leave-active {
      & > * {
        &:nth-child(1) {
          transition-delay: $delay + $delayStep;
        }
        &:nth-child(2) {
          transition-delay: $delay;
        }
      } */

    /* .side-menu {
        position: absolute;
    }

    .side-menu-enter-active,
    .side-menu-leave-active {
        transition: all 500ms ease-in-out;
    }

    .side-menu-enter-to,
    .side-menu-leave {
        opacity: 1;
        transform: translateX(0);
    }

    .side-menu-enter,
    .side-menu-leave-to {
        opacity: 0;
        transform: translateX(-100%);
    } */

    /* .slide-right-enter-active,
    .slide-right-leave-active,
    .slide-left-enter-active,
    .slide-left-leave-active {
        transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
        opacity: 0;
    }

    .slide-left-enter {
        transform: translateX(100%);
    }

    .slide-left-leave-to {
        transform: translateX(-100%);
    } */

    .close-button {
        scroll-margin: 20px;
    }
</style>
