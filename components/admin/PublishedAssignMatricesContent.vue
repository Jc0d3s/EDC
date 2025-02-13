<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import {
        publishedAssignMatricesListByMatrixIdAPI,
        publishedFormsListByReleaseVersionIdAPI,
        publishedTrialVisitListByReleaseVersionIdAPI,
    } from "~/services/apis/handlers/admin/release-version-detail";
    import type {
        IPublishedAssignMatrixData,
        IPublishedFormData,
        IPublishedTrialVisit,
    } from "~/services/apis/handlers/types/admin/release-version-detail-types";
    import useToastStore from "~/stores/toast";
    import type { IWinFormProps } from "~/types/common";

    type TComparisonType = "form folder" | "form" | "different form";

    type TFormFolderType = "form" | "folder";

    interface IFormList {
        id: number;
        label: string;
        type: TFormFolderType;
        orderNumber: number;
    }

    interface IFolderList {
        id: number;
        label: string;
        type: TFormFolderType;
        orderNumber: number;
    }

    interface IFormFolderMap {
        label: string;
        type: "text" | "input";
        value: boolean;
        formCount: number;
        comparisonType: TComparisonType;
        orderNumber: number;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const dummyColumns: Array<Record<string, IFormFolderMap>> = [
        {
            "Head hidden": {
                label: "VyFormA",
                type: "text",
                value: false,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Vy Folder A": {
                label: "VyFormA-Vy Folder A",
                type: "input",
                value: true,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Vy Folder B": {
                label: "VyFormA-Vy Folder B",
                type: "input",
                value: true,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Tail hidden": {
                label: "VyFormA",
                type: "text",
                value: false,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
        },
        {
            "Head hidden": {
                label: "VyFormB",
                type: "text",
                value: false,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Vy Folder A": {
                label: "VyFormB-Vy Folder A",
                type: "input",
                value: true,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Vy Folder B": {
                label: "VyFormB-Vy Folder B",
                type: "input",
                value: true,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
            "Tail hidden": {
                label: "VyFormB",
                type: "text",
                value: false,
                formCount: 0,
                comparisonType: "form folder",
                orderNumber: 0,
            },
        },
    ];

    const formsList = ref<IFormList[]>([]);
    const foldersList = ref<IFolderList[]>([]);
    const assignedMatricesList = ref<IPublishedAssignMatrixData[]>([]);
    const toastStore = useToastStore();
    const formFolderMapping = ref<Record<string, IFormFolderMap>[]>([]);
    const formFolderMappingRef = ref<Record<string, IFormFolderMap>[]>([]);
    const loading = ref<Loading>(new Loading());
    const disabled = ref<boolean>(false);
    const splitSpecialCharacter = "#$%";

    const gridFolderRow = computed(() => {
        if (getArrayLength(assignedMatricesList.value) > 0) {
            return [
                {
                    label: "Head hidden",
                    id: "Hh",
                    type: "folder",
                    orderNumber: 0,
                },
                ...foldersList.value.map((row) => {
                    return {
                        ...row,
                        orderNumber: getOrderNumberFromAssignedMatrices(row.id, "folder"),
                    };
                }),
                ...formsList.value.map((row) => {
                    return {
                        ...row,
                        orderNumber: getOrderNumberFromAssignedMatrices(row.id, "form"),
                    };
                }), // Newly added for assigning form alone
                {
                    label: "Tail hidden",
                    id: "Th",
                    type: "folder",
                    orderNumber: maxOrderNumber() + 1,
                },
            ].sort((a, b) => {
                if (a.orderNumber > b.orderNumber) return 1;
                if (a.orderNumber < b.orderNumber) return -1;
                return 0;
            });
        }
        return [
            {
                label: "Head hidden",
                id: "Hh",
                type: "folder",
                orderNumber: 0,
            },
            ...foldersList.value,
            ...formsList.value, // Newly added for assigning form alone
            {
                label: "Tail hidden",
                id: "Th",
                type: "folder",
                orderNumber: 0,
            },
        ];
    });

    const assignMatricesGroupLabel = computed(() =>
        checkIfKeyExistsInObject(props.activeTab.label, props.tabData)
            ? `Published Assign Matrices - ${props.tabData[props.activeTab.label].data.name}`
            : "Published Assign Matrices",
    );

    // const isForm = computed(() => [0, getArrayLength(foldersList.value) + 2 - 1]);
    const isForm = computed(() => [
        0,
        getArrayLength(foldersList.value) + getArrayLength(formsList.value) + 1,
    ]);

    function setFormData(formData: IPublishedFormData[]) {
        const result: IFormList[] = [];
        for (const row of formData) {
            result.push({
                id: row.id,
                label: row.formName as string,
                type: "form",
                orderNumber: row.formOrderNumber as number,
            });
        }
        return result;
    }

    async function formList() {
        const { status, data, message } = await publishedFormsListByReleaseVersionIdAPI(
            props.tabData[props.activeTab.label].data.releaseVersionId,
        );
        if (status === 200) {
            // formsList.value = getOptionsList(data, "formName", "id");
            formsList.value = deepClone(setFormData(data));
        } else if (status !== 401) {
            formsList.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
    }

    function setFolderData(formData: IPublishedTrialVisit[]) {
        const result: IFolderList[] = [];
        for (const row of formData) {
            result.push({
                id: row.id,
                label: row.name as string,
                type: "folder",
                orderNumber: row.orderNumber,
            });
        }
        return result;
    }

    async function folderList() {
        const { status, data, message } = await publishedTrialVisitListByReleaseVersionIdAPI(
            props.tabData[props.activeTab.label].data.releaseVersionId,
        );
        if (status === 200) {
            // foldersList.value = getOptionsList(data, "name", "id");
            foldersList.value = setFolderData(data);
        } else if (status !== 401) {
            foldersList.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
    }

    function maxOrderNumber() {
        let result = 0;
        for (const row of assignedMatricesList.value) {
            if (row.orderNumber > result) result = row.orderNumber;
        }
        return result;
    }

    function getOrderNumberFromAssignedMatrices(id: number, type: "form" | "folder") {
        let result = 0;
        for (const row of assignedMatricesList.value) {
            if (
                (type === "form" && row.formId === id && !row.folderId) ||
                (type === "folder" && row.folderId === id)
            ) {
                result = row.orderNumber;
                break;
            }
        }
        if (result === 0) result = maxOrderNumber() + 1;
        return result;
    }

    async function assignedMatrices() {
        const { status, data, message } = await publishedAssignMatricesListByMatrixIdAPI(
            String(props.tabData[props.activeTab.label].data.id),
        );
        if (status === 200) {
            assignedMatricesList.value = deepClone(data);
        } else if (status !== 401) {
            assignedMatricesList.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
    }

    // function isAssigned(formId: number | string, folderId: number | string) {
    //     let result = false;
    //     for (const row of assignedMatricesList.value) {
    //         if (
    //             isEqual(formId, row.formId, "string") &&
    //             isEqual(folderId, row.folderId, "string")
    //         ) {
    //             result = row.value;
    //             break;
    //         }
    //     }
    //     return result;
    // }
    function isAssigned(
        formId: number | string,
        folderId: number | string,
        comparisonType: TComparisonType,
    ) {
        console.log("params in isAssigned", {
            formId,
            folderId,
            comparisonType,
        });
        let value = false;
        let formCount = 1;
        let orderNumber = 0;
        for (const row of assignedMatricesList.value) {
            console.log("row in isAssigned", row);
            if (
                (comparisonType === "form folder" &&
                    isEqual(formId, row.formId, "string") &&
                    isEqual(folderId, row.folderId, "string")) ||
                (comparisonType === "form" &&
                    isEqual(formId, row.formId, "string") &&
                    !row.folderId)
                // isEqual(folderId, row.formId, "string")
            ) {
                value = row.value;
                formCount = row.formCount;
                orderNumber = row.orderNumber;
                break;
            }
        }
        return { value, formCount, orderNumber };
    }

    function checkIfFolder(formDetails: IFormList, folderDetails: IFolderList) {
        let result: TComparisonType = "form folder";
        console.log("formDetails", formDetails);
        console.log("folderDetails", folderDetails);
        for (const row of formsList.value) {
            console.log("row in checkIfFolder", row);
            if (
                isEqual(formDetails.id, row.id, "string") &&
                isEqual(folderDetails.id, row.id, "string")
            ) {
                console.log("if condition matched in checkIfFolder");
                result = "form";
                break;
            } else if (
                // !["Hh", "Th"].includes(String(folderId)) &&
                folderDetails.type === "form" &&
                (isEqual(formDetails.label, row.label, "string") ||
                    isEqual(folderDetails.label, row.label, "string"))
            ) {
                console.log("else if condition matched in checkIfFolder");
                result = "different form";
                break;
            }
        }
        return result;
    }

    // function processMatrix() {
    //     const result: IFormFolderMap[] = [];
    //     for (let i = 0; i < getArrayLength(formsList.value); i++) {
    //         const resultRow: Record<string, IFormFolderMap> = {};
    //         for (let j = 0; j < getArrayLength(gridFolderRow.value); j++) {
    //             resultRow[gridFolderRow.value[j].label] = {
    //                 label: isForm.value.includes(j)
    //                     ? formsList.value[i].label
    //                     : `${formsList.value[i].label}${splitSpecialCharacter}${gridFolderRow.value[j].label}`,
    //                 type: isForm.value.includes(j) ? "text" : "input",
    //                 value: isAssigned(formsList.value[i].value, gridFolderRow.value[j].value),
    //             };
    //         }
    //         result.push(deepClone(resultRow));
    //     }
    //     formFolderMapping.value = deepClone(result);
    //     formFolderMappingRef.value = deepClone(result);
    // }
    function processMatrix() {
        const result: IFormFolderMap[] = [];
        for (let i = 0; i < getArrayLength(formsList.value); i++) {
            const resultRow: Record<string, IFormFolderMap> = {};
            for (let j = 0; j < getArrayLength(gridFolderRow.value); j++) {
                const isFolder = checkIfFolder(
                    formsList.value[i],
                    gridFolderRow.value[j] as IFolderList | IFormList,
                );
                const {
                    formCount = 0,
                    value = false,
                    orderNumber = 0,
                } = isAssigned(formsList.value[i].id, gridFolderRow.value[j].id, isFolder);
                // console.log("formsList.value[i].value", formsList.value[i].value);
                // console.log("gridFolderRow.value[j].value", gridFolderRow.value[j].value);
                console.log("isFolder", isFolder);
                resultRow[gridFolderRow.value[j].label] = {
                    label: isForm.value.includes(j)
                        ? formsList.value[i].label
                        : `${formsList.value[i].label}${splitSpecialCharacter}${gridFolderRow.value[j].label}`,
                    type: isForm.value.includes(j) ? "text" : "input",
                    value,
                    formCount,
                    comparisonType: isFolder,
                    orderNumber,
                };
            }
            result.push(deepClone(resultRow));
        }
        formFolderMapping.value = deepClone(result);
        formFolderMappingRef.value = deepClone(result);
    }

    async function getMatrixDetails() {
        loading.value.table = true;
        await Promise.all([formList(), folderList(), assignedMatrices()]);
        processMatrix();
        loading.value.table = false;
    }

    onMounted(async () => {
        await getMatrixDetails();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper :group-label="assignMatricesGroupLabel">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div
                        class="table-wrapper w-full flex flex-col gap-[1rem] overflow-x-auto"
                        :skeleton="loading.table || null"
                    >
                        <table class="w-full matrix-container">
                            <thead class="table-header">
                                <tr>
                                    <th
                                        v-for="(folderRow, index) of gridFolderRow"
                                        :key="index"
                                        class="font-bold font-12 table-header-divider"
                                        :class="[
                                            folderRow.label.includes('hidden') ? 'invisible' : '',
                                        ]"
                                    >
                                        <edc-skeleton-loader
                                            v-if="loading.table"
                                            container-class="w-[40%] h-[1.5rem] my-[1rem]"
                                            loader-type="rectangle"
                                        />
                                        <div
                                            v-else
                                            class="flex flex-row items-center gap-[1rem] font-bold"
                                        >
                                            {{ folderRow.label }}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody v-if="loading.table" class="table-body mb-[20rem]">
                                <template v-for="(row, index) of dummyColumns" :key="index">
                                    <tr :id="`row-${index}`" :disabled="disabled ? disabled : null">
                                        <td
                                            v-for="(columnRow, columnIndex) of gridFolderRow"
                                            :key="columnIndex"
                                            class="font-normal text-left pointer-events-none font-12"
                                        >
                                            <edc-skeleton-loader
                                                v-if="
                                                    checkIfKeyExistsInObject(
                                                        columnRow.label,
                                                        row,
                                                    ) &&
                                                    checkIfKeyExistsInObject(
                                                        'type',
                                                        row[columnRow.label],
                                                    ) &&
                                                    row[columnRow.label].type == 'input'
                                                "
                                                container-class="w-[10%] h-[1.5rem] my-[1rem]"
                                                loader-type="rectangle"
                                            />
                                            <edc-skeleton-loader
                                                v-else-if="
                                                    checkIfKeyExistsInObject(
                                                        columnRow.label,
                                                        row,
                                                    ) &&
                                                    checkIfKeyExistsInObject(
                                                        'type',
                                                        row[columnRow.label],
                                                    ) &&
                                                    row[columnRow.label].type == 'text'
                                                "
                                                container-class="w-[40%] h-[1.5rem] my-[1rem]"
                                                loader-type="rectangle"
                                            />
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                            <tbody
                                v-else-if="!loading.table && getArrayLength(formFolderMapping) > 0"
                                class="table-body mb-[0rem] relative"
                            >
                                <template v-for="(row, index) of formFolderMapping" :key="index">
                                    <tr :id="`row-${index}`" :disabled="disabled ? disabled : null">
                                        <td
                                            v-for="(columnRow, columnIndex) of gridFolderRow"
                                            :key="columnIndex"
                                            class="font-normal text-left font-12"
                                        >
                                            <edc-checkbox
                                                v-if="row[columnRow.label].type == 'input'"
                                                :key="`${row[columnRow.label].label}-${columnIndex}`"
                                                v-model="row[columnRow.label].value"
                                                v-tooltip.top="
                                                    `${row[columnRow.label].label
                                                        .split(splitSpecialCharacter)
                                                        .join('-')}`
                                                "
                                                :disabled="loading.isDisabled()"
                                                :read-only="true"
                                                :name="`${row[columnRow.label].label}_${row[columnRow.label].value}`"
                                            />
                                            <span
                                                v-else-if="row[columnRow.label].type == 'text'"
                                                :class="[
                                                    row[columnRow.label].type === 'text'
                                                        ? 'font-bold'
                                                        : '',
                                                ]"
                                                >{{ row[columnRow.label].label }}</span
                                            >
                                            <!-- <span
                                                    v-if="
                                                        row[columnRow.label].type == 'input' &&
                                                        row[columnRow.label].formCount
                                                    "
                                                    v-tooltip="'Form count'"
                                                    class="admin-input-font"
                                                    >({{ row[columnRow.label].formCount }})</span
                                                > -->
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                            <tbody v-else class="table-body">
                                <tr>
                                    <td
                                        :colspan="getArrayLength(gridFolderRow) + 1"
                                        class="font-12"
                                    >
                                        No matrices to display
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot class="table-footer">
                                <tr>
                                    <th
                                        v-for="(folderRow, index) of gridFolderRow"
                                        :key="index"
                                        class="font-bold font-12 table-footer-divider"
                                        :class="[
                                            folderRow.label.includes('hidden') ? 'invisible' : '',
                                        ]"
                                    >
                                        <edc-skeleton-loader
                                            v-if="loading.table"
                                            container-class="w-[40%] h-[1.5rem] my-[1rem]"
                                            loader-type="rectangle"
                                        />
                                        <div
                                            v-else
                                            class="flex flex-row items-center gap-[1rem] font-bold"
                                        >
                                            {{ folderRow.label }}
                                        </div>
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
