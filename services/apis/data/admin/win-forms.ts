import type { IPaginationListQueryParam } from "~/types/common";

export type TTabPageMap =
    | "Home"
    | "Builder"
    | "Trial"
    | "Trial Group"
    | "Trial Sites"
    | "Studies Environment Setup"
    | "Branch"
    | "CRF Version Settings"
    | "Forms"
    | "Form Fields"
    | "Folders"
    | "Matrices"
    | "Assign Matrices"
    | "Dictionaries"
    | "Unit Dictionaries"
    | "Edit Checks"
    | "Edit Checks Entries"
    | "Derivations"
    | "Derivation Entries"
    | "Restrictions"
    | "Custom Functions"
    | "Push CRF Version"
    | "CRFVersion-Site List"
    | "Reporter"
    | "PDF Generator"
    | "Query Management"
    | "User Administration"
    | "Get Draft Template"
    | "Upload Draft"
    | "Amendment Manager Scheduler"
    | "Subject Fields Config"
    | "Amendment Manager"
    | "Site Administration"
    | "Sites"
    | "Sites Group"
    | "Users"
    | "Roles"
    | "Site Entries"
    | "User Entries"
    | "Email Alert"
    | "Global Libraries"
    | "Global Dictionaries"
    | "Global Unit Dictionaries"
    | "Global Edit Checks"
    | "Global Edit Checks Entries"
    | "Subject Form Configs"
    | "Study User Sites"
    | "Site Therapeutic Areas"
    | "Site Therapeutic Areas Investigators"
    | "Role Group Entries"
    | "Subjects"
    | "Study Site Investigators"
    | "Published Forms"
    | "Published Form Fields"
    | "Published Folders"
    | "Published Matrices"
    | "Published Assign Matrices"
    | "Published Dictionaries"
    | "Published Unit Dictionaries"
    | "Published Edit Checks"
    | "Published Edit Checks Entries"
    | "Published Derivations"
    | "Published Derivation Entries"
    | "Published Restrictions"
    | "Published Custom Functions"
    | "Assign Permissions"
    | "Subject Site Transfers"
    | "Matrices Reorder";

export interface ITabMenu {
    label: string;
    module: string;
    icon: TIcon;
    page: TTabPageMap;
    // action: TVoidAction;
}

interface ISideMenu {
    heading: string;
    menus: ITabMenu[];
}

export interface IActiveTab extends ITabMenu {
    uniqueId: string;
}

export interface ITabData {
    data: Record<string, any>;
    queryData?: Record<string, any>;
}

export type TSideBar = Record<TTabPageMap, ISideMenu>;

const homeSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Builder",
        module: "Builder",
        icon: "architect",
        page: "Builder",
        // action: () => {},
    },
    {
        label: "Reporter",
        module: "Reporter",
        icon: "reporter",
        page: "Reporter",
        // action: () => {},
    },
    {
        label: "PDF Generator",
        module: "PDF Generator",
        icon: "pdf",
        page: "PDF Generator",
        // action: () => {},
    },
    {
        label: "Query Management",
        module: "Query Management",
        icon: "query-management",
        page: "Query Management",
        // action: () => {},
    },
    {
        label: "User Administration",
        module: "User Administration",
        icon: "users",
        page: "User Administration",
        // action: () => {},
    },
    {
        label: "Site Administration",
        module: "Site Administration",
        icon: "site-administration",
        page: "Site Administration",
        // action: () => {},
    },
    {
        label: "Global Libraries",
        module: "Global Libraries",
        icon: "library",
        page: "Global Libraries",
        // action: () => {},
    },
];
const builderSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Get Draft Template",
        module: "Builder",
        icon: "fallback-image",
        page: "Get Draft Template",
        // action: () => {},
    },
    {
        label: "Upload Draft",
        module: "Builder",
        icon: "fallback-image",
        page: "Upload Draft",
        // action: () => {},
    },
    {
        label: "Amendment Manager Scheduler",
        module: "Builder",
        icon: "fallback-image",
        page: "Amendment Manager Scheduler",
        // action: () => {},
    },
];
const roleAdministrationSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Users",
        module: "User Administration",
        icon: "users",
        page: "Users",
        // action: () => {},
    },
    {
        label: "Roles",
        module: "User Administration",
        icon: "users",
        page: "Roles",
        // action: () => {},
    },
];
const siteAdministrationSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Sites",
        module: "Site Administration",
        icon: "hospital",
        page: "Sites",
        // action: () => {},
    },
    {
        label: "Sites Group",
        module: "Site Administration",
        icon: "site-group",
        page: "Sites Group",
        // action: () => {},
    },
];
const sitesSideBarMenuDetails: ITabMenu[] = [
    {
        label: "Subject Site Transfers",
        module: "Sites",
        icon: "fallback-image",
        page: "Subject Site Transfers",
        // action: () => {},
    },
];
const sitesGroupSideBarMenuDetails: ITabMenu[] = [];
const usersSideBarMenuDetails: ITabMenu[] = [];
const rolesSideBarMenuDetails: ITabMenu[] = [
    {
        label: "Assign Permissions",
        module: "Roles",
        icon: "fallback-image",
        page: "Assign Permissions",
        // action: () => {},
    },
];
const trialGroupSideMenuBarDetails: ITabMenu[] = [];
const trialSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Define Copy Sources",
        module: "Trial",
        icon: "fallback-image",
        page: "Trial",
        // action: () => {},
    },
    {
        label: "Studies Environment Setup",
        module: "Trial",
        icon: "environment-setup",
        page: "Studies Environment Setup",
        // action: () => {},
    },
    {
        label: "Subject Fields Config",
        module: "Trial",
        icon: "subject-field-config",
        page: "Subject Fields Config",
        // action: () => {},
    },
    {
        label: "Amendment Manager",
        module: "Trial",
        icon: "fallback-image",
        page: "Amendment Manager",
        // action: () => {},
    },
    {
        label: "CRFVersion-Site List",
        module: "Trial",
        icon: "fallback-image",
        page: "CRFVersion-Site List",
        // action: () => {},
    },
    {
        label: "Subject Form Configs",
        module: "Trial",
        icon: "subject",
        page: "Subject Form Configs",
        // action: () => {},
    },
    // {
    //     label: "Subjects",
    //     module: "Trial",
    //     icon: "subject",
    //     page: "Subjects",
    //     // action: () => {},
    // },
    // {
    //     label: "Trial Sites",
    //     module: "Trial",
    //     icon: "hospital",
    //     page: "Trial Sites",
    //     // action: () => {},
    // },
    // {
    //     label: "Trial Site Group",
    //     module: "Trial",
    //     icon: "hospital",
    //     page: "Trial Site Group",
    //     // action: () => {},
    // },
];
const trialSiteMenuBarDetails: ITabMenu[] = [];
const studiesEnvironmentSetupSideMenuBarDetails: ITabMenu[] = [];
const branchSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Forms",
        module: "Branch",
        icon: "forms",
        page: "Forms",
        // action: () => {},
    },
    {
        label: "Folders",
        module: "Branch",
        icon: "folders",
        page: "Folders",
        // action: () => {},
    },
    {
        label: "Dictionaries",
        module: "Branch",
        icon: "dictionaries",
        page: "Dictionaries",
        // action: () => {},
    },
    {
        label: "Unit Dictionaries",
        module: "Branch",
        icon: "unit-dictionaries",
        page: "Unit Dictionaries",
        // action: () => {},
    },
    {
        label: "Matrices",
        module: "Branch",
        icon: "matrices",
        page: "Matrices",
        // action: () => {},
    },
    {
        label: "Edit Checks",
        module: "Branch",
        icon: "edit-checks",
        page: "Edit Checks",
        // action: () => {},
    },
    {
        label: "Custom Functions",
        module: "Branch",
        icon: "custom-functions",
        page: "Custom Functions",
        // action: () => {},
    },
    {
        label: "Derivations",
        module: "Branch",
        icon: "derivations",
        page: "Derivations",
        // action: () => {},
    },
    {
        label: "Restrictions",
        module: "Branch",
        icon: "restrictions",
        page: "Restrictions",
        // action: () => {},
    },
    // {
    //     label: "Lab Settings",
    //     module: "Branch",
    //     icon: "form",
    //     page: "Branch",
    //     // action: () => {},
    // },
    {
        label: "Email Alert",
        module: "Branch",
        icon: "wrench",
        page: "Email Alert",
        // action: () => {},
    },
];
const crfVersionSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Forms",
        module: "CRF Version Settings",
        icon: "forms",
        page: "Published Forms",
        // action: () => {},
    },
    {
        label: "Folders",
        module: "CRF Version Settings",
        icon: "folders",
        page: "Published Folders",
        // action: () => {},
    },
    {
        label: "Dictionaries",
        module: "CRF Version Settings",
        icon: "dictionaries",
        page: "Published Dictionaries",
        // action: () => {},
    },
    {
        label: "Unit Dictionaries",
        module: "CRF Version Settings",
        icon: "unit-dictionaries",
        page: "Published Unit Dictionaries",
        // action: () => {},
    },
    {
        label: "Matrices",
        module: "CRF Version Settings",
        icon: "matrices",
        page: "Published Matrices",
        // action: () => {},
    },
    {
        label: "Edit Checks",
        module: "CRF Version Settings",
        icon: "edit-checks",
        page: "Published Edit Checks",
        // action: () => {},
    },
    {
        label: "Custom Functions",
        module: "CRF Version Settings",
        icon: "custom-functions",
        page: "Published Custom Functions",
        // action: () => {},
    },
    {
        label: "Derivations",
        module: "CRF Version Settings",
        icon: "derivations",
        page: "Published Derivations",
        // action: () => {},
    },
    {
        label: "Restrictions",
        module: "CRF Version Settings",
        icon: "restrictions",
        page: "Published Restrictions",
        // action: () => {},
    },
    // {
    //     label: "Lab Settings",
    //     module: "CRF Version Settings",
    //     icon: "form",
    //     page: "Branch",
    //     // action: () => {},
    // },
];

const formSideMenuBarDetails: ITabMenu[] = [];
const formFieldSideMenuBarDetails: ITabMenu[] = [];
const formFolderSideMenuBarDetails: ITabMenu[] = [];
const formMatricesSideMenuBarDetails: ITabMenu[] = [];
const assignMatricesSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Reorder",
        module: "Matrices",
        icon: "fallback-image",
        page: "Matrices Reorder",
    },
];
const dictionariesSideMenuBarDetails: ITabMenu[] = [];
const unitDictionariesSideMenuBarDetails: ITabMenu[] = [];
const editChecksSideMenuBarDetails: ITabMenu[] = [];
const editCheckEntriesSideMenuBarDetails: ITabMenu[] = [];
const derivationsSideMenuBarDetails: ITabMenu[] = [];
const derivationsEntriesSideMenuBarDetails: ITabMenu[] = [];
const restrictionsSideMenuBarDetails: ITabMenu[] = [];
const customFunctionsSideMenuBarDetails: ITabMenu[] = [];
const pushCRFVersionsSideMenuBarDetails: ITabMenu[] = [];
const crfVersionSiteListSideMenuBarDetails: ITabMenu[] = [];
const siteEntriesListSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Site Therapeutic Areas",
        module: "Sites",
        icon: "fallback-image",
        page: "Site Therapeutic Areas",
        // action: () => {},
    },
];
const userEntriesListSideMenuBarDetails: ITabMenu[] = [];
const emailAlertListSideMenuBarDetails: ITabMenu[] = [];
const globalLibrariesSideMenuBarDetails: ITabMenu[] = [
    {
        label: "Dictionaries",
        module: "Global Library",
        icon: "dictionaries",
        page: "Global Dictionaries",
        // action: () => {},
    },
    {
        label: "Unit Dictionaries",
        module: "Global Library",
        icon: "unit-dictionaries",
        page: "Global Unit Dictionaries",
        // action: () => {},
    },
    {
        label: "Global Edit Checks",
        module: "Global Library",
        icon: "edit-checks",
        page: "Global Edit Checks",
        // action: () => {},
    },
];

export const sideMenuBarDetails = {
    Home: {
        heading: "Installed Modules",
        menus: deepClone(homeSideMenuBarDetails) as ITabMenu[],
    },
    Builder: {
        heading: "Builder",
        menus: deepClone(builderSideMenuBarDetails) as ITabMenu[],
    },
    "Trial Group": {
        heading: "Trial Group",
        menus: deepClone(trialGroupSideMenuBarDetails) as ITabMenu[],
    },
    Trial: {
        heading: "Trial Items",
        menus: deepClone(trialSideMenuBarDetails) as ITabMenu[],
    },
    "Trial Sites": {
        heading: "Trial Sites",
        menus: deepClone(trialSiteMenuBarDetails) as ITabMenu[],
    },
    "Studies Environment Setup": {
        heading: "Studies Environment Setup",
        menus: deepClone(studiesEnvironmentSetupSideMenuBarDetails) as ITabMenu[],
    },
    Branch: {
        heading: "Branch Items",
        menus: deepClone(branchSideMenuBarDetails) as ITabMenu[],
    },
    Forms: {
        heading: "Form Items",
        menus: deepClone(formSideMenuBarDetails) as ITabMenu[],
    },
    "Form Fields": {
        heading: "Field Items",
        menus: deepClone(formFieldSideMenuBarDetails) as ITabMenu[],
    },
    Folders: {
        heading: "Folder Items",
        menus: deepClone(formFolderSideMenuBarDetails) as ITabMenu[],
    },
    Matrices: {
        heading: "Matrix Items",
        menus: deepClone(formMatricesSideMenuBarDetails) as ITabMenu[],
    },
    "Assign Matrices": {
        heading: "Assign Matrix Items",
        menus: deepClone(assignMatricesSideMenuBarDetails) as ITabMenu[],
    },
    Dictionaries: {
        heading: "Dictionaries",
        menus: deepClone(dictionariesSideMenuBarDetails) as ITabMenu[],
    },
    "Unit Dictionaries": {
        heading: "Unit Dictionaries",
        menus: deepClone(unitDictionariesSideMenuBarDetails) as ITabMenu[],
    },
    "Edit Checks": {
        heading: "Edit Checks",
        menus: deepClone(editChecksSideMenuBarDetails) as ITabMenu[],
    },
    "Edit Checks Entries": {
        heading: "Edit Checks Entries",
        menus: deepClone(editCheckEntriesSideMenuBarDetails) as ITabMenu[],
    },
    Derivations: {
        heading: "Derivations",
        menus: deepClone(derivationsSideMenuBarDetails) as ITabMenu[],
    },
    "Derivation Entries": {
        heading: "Derivation Entries",
        menus: deepClone(derivationsEntriesSideMenuBarDetails) as ITabMenu[],
    },
    Restrictions: {
        heading: "Restrictions",
        menus: deepClone(restrictionsSideMenuBarDetails) as ITabMenu[],
    },
    "Custom Functions": {
        heading: "Custom Functions",
        menus: deepClone(customFunctionsSideMenuBarDetails) as ITabMenu[],
    },
    "Push CRF Version": {
        heading: "Push CRF Version",
        menus: deepClone(pushCRFVersionsSideMenuBarDetails) as ITabMenu[],
    },
    "CRFVersion-Site List": {
        heading: "CRFVersion-Site List",
        menus: deepClone(crfVersionSiteListSideMenuBarDetails) as ITabMenu[],
    },
    "CRF Version Settings": {
        heading: "CRF Version Items",
        menus: deepClone(crfVersionSideMenuBarDetails) as ITabMenu[],
    },
    Reporter: {
        heading: "Reporter Items",
        menus: [],
    },
    "PDF Generator": {
        heading: "PDF Generator Items",
        menus: [],
    },
    "Query Management": {
        heading: "Query Management Items",
        menus: [],
    },
    "User Administration": {
        heading: "User Admin Items",
        menus: deepClone(roleAdministrationSideMenuBarDetails) as ITabMenu[],
    },
    "Site Administration": {
        heading: "Site Admin Items",
        menus: deepClone(siteAdministrationSideMenuBarDetails) as ITabMenu[],
    },
    "Get Draft Template": {
        heading: "Get Draft Template Items",
        menus: [],
    },
    "Upload Draft": {
        heading: "Upload Draft Items",
        menus: [],
    },
    "Amendment Manager Scheduler": {
        heading: "Amendment Manager Scheduler Items",
        menus: [],
    },
    "Subject Fields Config": {
        heading: "Subject Fields Config Items",
        menus: [],
    },
    "Amendment Manager": {
        heading: "Amendment Manager Items",
        menus: [],
    },
    Sites: {
        heading: "Site Items",
        menus: deepClone(sitesSideBarMenuDetails) as ITabMenu[],
    },
    "Sites Group": {
        heading: "Site Group Items",
        menus: deepClone(sitesGroupSideBarMenuDetails) as ITabMenu[],
    },
    Users: {
        heading: "User Items",
        menus: deepClone(usersSideBarMenuDetails) as ITabMenu[],
    },
    Roles: {
        heading: "Role Items",
        menus: deepClone(rolesSideBarMenuDetails) as ITabMenu[],
    },
    "Site Entries": {
        heading: "Site Entries",
        menus: deepClone(siteEntriesListSideMenuBarDetails) as ITabMenu[],
    },
    "User Entries": {
        heading: "User Entries",
        menus: deepClone(userEntriesListSideMenuBarDetails) as ITabMenu[],
    },
    "Email Alert": {
        heading: "Email Alert",
        menus: deepClone(emailAlertListSideMenuBarDetails) as ITabMenu[],
    },
    "Global Libraries": {
        heading: "Global Library Items",
        menus: deepClone(globalLibrariesSideMenuBarDetails) as ITabMenu[],
    },
    "Global Dictionaries": {
        heading: "Dictionary Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Global Unit Dictionaries": {
        heading: "Unit Dictionary Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Global Edit Checks": {
        heading: "Global Edit Check Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Global Edit Checks Entries": {
        heading: "Global Edit Checks Entry Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Subject Form Configs": {
        heading: "Subject Form Config Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Study User Sites": {
        heading: "Study User Site Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Site Therapeutic Areas": {
        heading: "Site Therapeutic Area Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Site Therapeutic Areas Investigators": {
        heading: "Therapeutic Area Investigator Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Role Group Entries": {
        heading: "Role Group Entry Items",
        menus: deepClone([]) as ITabMenu[],
    },
    Subjects: {
        heading: "Subject Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Study Site Investigators": {
        heading: "Study Site Investigator Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Forms": {
        heading: "Published Forms Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Form Fields": {
        heading: "Published Form Fields Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Folders": {
        heading: "Published Folders Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Matrices": {
        heading: "Published Matrices Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Assign Matrices": {
        heading: "Published Assign Matrices Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Dictionaries": {
        heading: "Published Dictionaries Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Unit Dictionaries": {
        heading: "Published Unit Dictionaries Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Edit Checks": {
        heading: "Published Edit Checks Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Edit Checks Entries": {
        heading: "Published Edit Checks Entries Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Derivations": {
        heading: "Published Derivations Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Derivation Entries": {
        heading: "Published Derivation Entries Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Restrictions": {
        heading: "Published Restrictions Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Published Custom Functions": {
        heading: "Published Custom Functions Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Assign Permissions": {
        heading: "Assign Permission Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Subject Site Transfers": {
        heading: "Subject Site Transfer Items",
        menus: deepClone([]) as ITabMenu[],
    },
    "Matrices Reorder": {
        heading: "Reorder",
        menus: deepClone([]) as ITabMenu[],
    },
} as TSideBar;

export interface ISelectedRow<T, FT = IPaginationListQueryParam> {
    label: string;
    module: string;
    page: TTabPageMap;
    data: T;
    queryData?: FT;
}
