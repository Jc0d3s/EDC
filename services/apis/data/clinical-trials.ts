import type { IColumn } from "~/types/datatable";
import type {
    ISubjectFormData,
    ISubjectListData,
    ISubjectTrialVisitData,
} from "../handlers/types/data-collection-types";

type TTrialStage = "stage1" | "stage2" | "stage3" | "stage4";

export interface ITableData {
    "Subject ID": string;
    Site: string;
    Group: string;
    "Last Updated": string;
    "Concomitant Medication": TTrialStage;
    "Adverse Event": TTrialStage;
    "Registration Form": TTrialStage;
    "Concent Form": TTrialStage;
    "Fed Visit (001)": TTrialStage;
    "Crossover (002)": TTrialStage;
    "Adverse Events": TTrialStage;
}
export function getTableData(count: number = 20): ITableData[] {
    const result: ITableData[] = [];
    for (let i = 1; i <= count; i++) {
        result.push({
            "Subject ID": `SUB${10000 + i}`,
            Site: "Bengaluru",
            Group: "Treatment 1",
            "Last Updated": "05/07/22 07:30:45",
            "Concomitant Medication": "stage1",
            "Adverse Event": "stage2",
            "Registration Form": "stage3",
            "Concent Form": "stage4",
            "Fed Visit (001)": "stage1",
            "Crossover (002)": "stage2",
            "Adverse Events": "stage3",
        });
    }
    return deepClone(result);
}

export function getTableColumns(): IColumn[] {
    const { width } = useWindowSize();
    return [
        {
            header: "",
            field: "",
            show: true,
            icon: false,
            sort: true,
            children: [
                {
                    header: "Subject ID",
                    field: "fieldValue",
                    show: true,
                    icon: false,
                    childType: "only",
                    sort: true,
                    sortOrder: "descending",
                    style: {
                        left: 0,
                        zIndex: 503,
                        position: "sticky",
                        backgroundColor: "var(--color-white)",
                        width: width.value < 1024 ? "w-[8rem]" : "w-[10rem]",
                    },
                },
            ],
            style: {
                left: 0,
                zIndex: 503,
                position: "sticky",
                backgroundColor: "var(--color-white)",
                width: width.value < 1024 ? "w-[8rem]" : "w-[10rem]",
            },
        },
        {
            header: "",
            field: "",
            show: true,
            icon: false,
            sort: true,
            children: [
                {
                    header: "Site",
                    field: "siteName",
                    show: true,
                    icon: false,
                    childType: "only",
                    sort: true,
                    sortOrder: "descending",
                    style: {
                        left: width.value < 1024 ? "8rem" : "10rem",
                        zIndex: 502,
                        position: "sticky",
                        backgroundColor: "var(--color-white)",
                        width: width.value < 1024 ? "w-[17rem]" : "w-[20rem]",
                    },
                },
            ],
            style: {
                left: width.value < 1024 ? "8rem" : "10rem",
                zIndex: 502,
                position: "sticky",
                backgroundColor: "var(--color-white)",
                width: width.value < 1024 ? "w-[17rem]" : "w-[20rem]",
            },
        },
        // {
        //     header: "",
        //     field: "",
        //     show: true,
        //     icon: false,
        //     children: [
        //         {
        //             header: "Group",
        //             field: "group",
        //             show: true,
        //             icon: false,
        //             childType: "only",
        //         },
        //     ],
        // },
        {
            header: "",
            field: "",
            show: true,
            icon: false,
            sort: true,
            children: [
                {
                    header: "Last Updated",
                    field: "lastUpdated",
                    show: true,
                    icon: false,
                    childType: "only",
                    sort: true,
                    sortOrder: "descending",
                    style: {
                        left: width.value < 1024 ? "25rem" : "30rem",
                        zIndex: 501,
                        position: "sticky",
                        backgroundColor: "var(--color-white)",
                    },
                },
            ],
            style: {
                left: width.value < 1024 ? "25rem" : "30rem",
                zIndex: 501,
                position: "sticky",
                backgroundColor: "var(--color-white)",
            },
        },
        // {
        //     header: "Screening (888)",
        //     field: "Screening (888)",
        //     show: true,
        //     icon: false,
        //     children: [
        //         {
        //             header: "Concomitant Medication",
        //             field: "Concomitant Medication",
        //             show: true,
        //             icon: true,
        //             childType: "first",
        //         },
        //         {
        //             header: "Adverse Event",
        //             field: "Adverse Event",
        //             show: true,
        //             icon: true,
        //             childType: "second",
        //         },
        //     ],
        // },
        // {
        //     header: "Fasting Visit (001)",
        //     field: "Fasting Visit (001)",
        //     show: true,
        //     icon: false,
        //     children: [
        //         {
        //             header: "Registration Form",
        //             field: "Registration Form",
        //             show: true,
        //             icon: true,
        //             childType: "first",
        //         },
        //         {
        //             header: "Concent Form",
        //             field: "Concent Form",
        //             show: true,
        //             icon: true,
        //             childType: "second",
        //         },
        //     ],
        // },
        // {
        //     header: "Fasting Visit (002)",
        //     field: "Fasting Visit (002)",
        //     show: true,
        //     icon: false,
        //     children: [
        //         {
        //             header: "Registration Form",
        //             field: "Registration Form",
        //             show: true,
        //             icon: true,
        //             childType: "first",
        //         },
        //         {
        //             header: "Concent Form",
        //             field: "Concent Form",
        //             show: true,
        //             icon: true,
        //             childType: "second",
        //         },
        //     ],
        // },
        // {
        //     header: "",
        //     field: "",
        //     show: true,
        //     icon: true,
        //     children: [
        //         {
        //             header: "Fed Visit (001)",
        //             field: "Fed Visit (001)",
        //             show: true,
        //             icon: true,
        //             childType: "only",
        //         },
        //     ],
        // },
        // {
        //     header: "",
        //     field: "",
        //     show: true,
        //     icon: true,
        //     children: [
        //         {
        //             header: "Crossover (002)",
        //             field: "Crossover (002)",
        //             show: true,
        //             icon: true,
        //             childType: "only",
        //         },
        //     ],
        // },
        // {
        //     header: "",
        //     field: "",
        //     show: true,
        //     icon: true,
        //     children: [
        //         {
        //             header: "Adverse Events",
        //             field: "Adverse Events",
        //             show: true,
        //             icon: true,
        //             childType: "only",
        //         },
        //     ],
        // },
    ];
}

export type TIDCMenuType = "form" | "folder" | "subject" | "only form";
export interface IDCMenuLink {
    uniqueId: string;
    id: number;
    label: string;
    expand: boolean;
    level: number;
    children: IDCMenuLink[] | null;
    siteId: number;
    type: TIDCMenuType;
    activeSubjects?: number[];
    rowDetails: ISubjectListData | ISubjectTrialVisitData | ISubjectFormData | null;
    subjectIds: number[];
    deactivatedFormSubjectIds: number[];
    order: number;
}

const getSubjectChildren = (parentLevel: number): IDCMenuLink[] => {
    const result: IDCMenuLink[] = [];
    const currentLevel = parentLevel + 1;
    for (let i = 1; i <= 4; i++) {
        result.push({
            children: currentLevel < 2 ? getSubjectChildren(currentLevel) : null,
            uniqueId: "",
            id: i,
            level: currentLevel,
            expand: false,
            label: currentLevel < 2 ? `C${currentLevel}-SUB${1000 + i}` : `Form ${0 + i}`,
            type: currentLevel < 2 ? "folder" : "form",
            siteId: 0,
            rowDetails: null,
            subjectIds: [],
            deactivatedFormSubjectIds: [],
            order: i + 1,
        });
    }
    return deepClone(result);
};

export const getDataCollectionMenuLinks = (count = 8): IDCMenuLink[] => {
    const result: IDCMenuLink[] = [];
    const rootLevel = 0;
    for (let i = 1; i <= count; i++) {
        result.push({
            children: getSubjectChildren(rootLevel),
            uniqueId: "",
            id: i,
            level: 0,
            expand: false,
            label: `SUB${1000 + i}`,
            type: "subject",
            siteId: 0,
            rowDetails: null,
            subjectIds: [],
            deactivatedFormSubjectIds: [],
            order: i + 1,
        });
    }
    return deepClone(result);
};

// export const getFormsList = (count = 8): IFormList[] => {
//     const result: IFormList[] = [];
//     for (let i = 1; i <= count; i++) {
//         result.push({
//             formType: i === 1 ? "EdcRadioGroup" : "EdcTextInput",
//             id: i,
//             order: i,
//             question: `Question ${i}`,
//             required: i === 1,
//             options:
//                 i === 1
//                     ? [
//                           {
//                               label: "Yes",
//                               value: "Yes",
//                           },
//                           {
//                               label: "No",
//                               value: "No",
//                           },
//                       ]
//                     : undefined,
//             model: null,
//             modelKey: "",
//         });
//     }
//     return deepClone(result);
// };

export const formDetails = [
    {
        id: 1,
        question: "Was Dose Administered?",
        answer: "No",
    },
    {
        id: 4,
        question: "Study drug",
        answer: "LY3232112",
    },
    {
        id: 7,
        question: "Route",
        answer: "IV",
    },
    {
        id: 2,
        question: "Date of dose administration",
        answer: "03/05/2024",
    },
    {
        id: 5,
        question: "Amount of dose",
        answer: 120,
    },
    {
        id: 8,
        question: "Treatment group",
        answer: "Fed",
    },
    {
        id: 3,
        question: "Time of dose administration",
        answer: "20:03",
    },
    {
        id: 6,
        question: "Unit of dose",
        answer: "mg",
    },
];

export const auditHistoryColumns: IColumn[] = [
    // {
    //     header: "Item Group",
    //     field: "itemGroup",
    //     show: true,
    //     icon: false,
    // },
    {
        header: "Item",
        field: "label",
        show: true,
        icon: false,
    },
    {
        header: "Old Value",
        field: "oldValue",
        show: true,
        icon: false,
    },
    {
        header: "New Value",
        field: "newValue",
        show: true,
        icon: false,
    },
    // {
    //     header: "Reason",
    //     field: "reason",
    //     show: true,
    //     icon: false,
    // },
    {
        header: "Comments",
        field: "comments",
        show: true,
        icon: false,
    },
    {
        header: "Activity",
        field: "activityType",
        show: true,
        icon: false,
    },
    {
        header: "Date",
        field: "modifiedDate",
        show: true,
        icon: false,
    },
    {
        header: "User",
        field: "modifiedBy",
        show: true,
        icon: false,
    },
];

const getFormDetailsIndex = (index: number) =>
    typeof formDetails[index - 1] === "undefined" ? getRandomArrayIndex(formDetails) : index - 1;

const reasonsData = ["Created", "Updated", "Reviewed", "Approved"];

export const getAuditHistoryData = (count = 8) => {
    const result = [];
    for (let i = 1; i <= count; i++) {
        result.push({
            "Item Group": `Item Group ${i}`,
            Item: formDetails[getFormDetailsIndex(i)].question,
            "Old Value": "-",
            "New Value": formDetails[getFormDetailsIndex(i)].answer,
            Reason: reasonsData[getRandomArrayIndex(reasonsData)],
            Comments: "Created",
            Date: "05/07/22 07:30:45",
            User: "User01",
        });
    }
    return deepClone(result);
};
