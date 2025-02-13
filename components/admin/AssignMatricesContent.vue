<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import { formsListByBranchIdAPI } from "~/services/apis/handlers/admin/form";
    import {
        assignMatricesCreateAPI,
        assignMatricesUpdateAPI,
        assignedMatricesListAPI,
    } from "~/services/apis/handlers/admin/matrix";
    import { trialVisitsListByBranchIDAPI } from "~/services/apis/handlers/admin/trial-visit";
    import type { IFormData } from "~/services/apis/handlers/types/admin/form-types";
    import type { IAssignMatrixData } from "~/services/apis/handlers/types/admin/matrix-types";
    import type { ITrialVisit } from "~/services/apis/handlers/types/admin/trial-visit-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
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
    const assignedMatricesList = ref<IAssignMatrixData[]>([]);
    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    // const formFolderMapping = ref<Record<string, boolean>>({});
    // const formFolderMappingRef = ref<Record<string, boolean>>({});
    const formFolderMapping = ref<Record<string, IFormFolderMap>[]>([]);
    const formFolderMappingRef = ref<Record<string, IFormFolderMap>[]>([]);
    const isEditForm = ref<boolean>(false);
    const loading = ref<Loading>(new Loading());
    const disabled = ref<boolean>(false);
    const splitSpecialCharacter = "#$%";
    const defaultOrderNumberRef = ref<
        {
            id: number;
            type: "2_form" | "1_folder";
            orderNumber: number;
            tempOrderNumber: number;
        }[]
    >([]);

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
                    orderNumber: maxOrderNumber() * 3,
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

    // const isForm = computed(() => [0, getArrayLength(foldersList.value) + 2 - 1]);
    const isForm = computed(() => [
        0,
        getArrayLength(foldersList.value) + getArrayLength(formsList.value) + 1,
    ]);

    function resetFormModel() {
        isEditForm.value = false;
        formFolderMapping.value = deepClone(formFolderMappingRef.value);
    }

    function setFormData(formData: IFormData[]) {
        const result: IFormList[] = [];
        for (const row of formData) {
            result.push({
                id: row.id,
                label: row.formName as string,
                type: "form",
                orderNumber: row.formOrderNumber as number,
            });
            defaultOrderNumberRef.value.push({
                id: row.id,
                orderNumber: row.formOrderNumber as number,
                tempOrderNumber: 0,
                type: "2_form",
            });
        }
        return result;
    }

    async function formList() {
        const { status, data, message } = await formsListByBranchIdAPI(
            props.tabData[props.activeTab.label].data.branchId,
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

    function setFolderData(formData: ITrialVisit[]) {
        const result: IFolderList[] = [];
        for (const row of formData) {
            result.push({
                id: row.id,
                label: row.name as string,
                type: "folder",
                orderNumber: row.orderNumber,
            });
            defaultOrderNumberRef.value.push({
                id: row.id,
                orderNumber: row.orderNumber as number,
                tempOrderNumber: 0,
                type: "1_folder",
            });
        }
        return result;
    }

    async function folderList() {
        const { status, data, message } = await trialVisitsListByBranchIDAPI(
            props.tabData[props.activeTab.label].data.branchId,
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
        const { status, data, message } = await assignedMatricesListAPI(
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

    function isAssigned(
        formId: number | string,
        folderId: number | string,
        comparisonType: TComparisonType,
    ) {
        let value = false;
        let formCount = 1;
        let orderNumber = 0;
        for (const row of assignedMatricesList.value) {
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
        for (const row of formsList.value) {
            if (
                formDetails.type === "form" &&
                folderDetails.type === "form" &&
                isEqual(formDetails.id, row.id, "string") &&
                isEqual(folderDetails.id, row.id, "string")
            ) {
                result = "form";
                break;
            } else if (
                // !["Hh", "Th"].includes(String(folderId)) &&
                folderDetails.type === "form" &&
                (isEqual(formDetails.label, row.label, "string") ||
                    isEqual(folderDetails.label, row.label, "string"))
            ) {
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

    function defaultOrderNumber(
        formId: number | string,
        folderId: number | string,
        comparisonType: TComparisonType,
    ) {
        let result = 0;
        if (comparisonType === "form") {
            for (const row of defaultOrderNumberRef.value) {
                if (isEqual(row.id, formId, "number") && row.type === "2_form") {
                    result = row.tempOrderNumber;
                    break;
                }
            }
        } else if (comparisonType === "form folder") {
            for (const row of defaultOrderNumberRef.value) {
                if (isEqual(row.id, folderId, "number") && row.type === "1_folder") {
                    result = row.tempOrderNumber;
                    break;
                }
            }
        }

        return result;
    }

    function processMatrix() {
        defaultOrderNumberRef.value = defaultOrderNumberRef.value
            .sort((a, b) => {
                if (a.type > b.type) return 1;
                if (a.type < b.type) return -1;
                return 0;
            })
            .map((row, index) => ({
                ...row,
                tempOrderNumber: index + 1,
            }));
        console.log("defaultOrderNumberRef in processMatrix", defaultOrderNumberRef.value);
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
                const updatedOrderNumber = defaultOrderNumber(
                    formsList.value[i].id,
                    gridFolderRow.value[j].id,
                    isFolder,
                );
                resultRow[gridFolderRow.value[j].label] = {
                    label: isForm.value.includes(j)
                        ? formsList.value[i].label
                        : `${formsList.value[i].label}${splitSpecialCharacter}${gridFolderRow.value[j].label}`,
                    type: isForm.value.includes(j) ? "text" : "input",
                    value,
                    formCount,
                    comparisonType: isFolder,
                    orderNumber: orderNumber === 0 ? updatedOrderNumber : orderNumber,
                };
            }
            result.push(deepClone(resultRow));
        }
        console.log("result in processMatrix", result);
        formFolderMapping.value = deepClone(result);
        formFolderMappingRef.value = deepClone(result);
    }

    async function getMatrixDetails() {
        loading.value.table = true;
        await Promise.all([formList(), folderList(), assignedMatrices()]);
        processMatrix();
        loading.value.table = false;
    }

    const getFormDetailsByFormName = (label: string) =>
        formsList.value.filter((row) => row.label === label);

    const getFolderDetailsByFormName = (label: string) =>
        foldersList.value.filter((row) => row.label === label);

    function getAssignData(rowData: IFormFolderMap) {
        const { comparisonType, label, value, formCount, orderNumber } = rowData;
        let result: IAssignMatrixData = {
            folderId: 0,
            formId: 0,
            id: 0,
            matricesId: 0,
            updatedBy: 0,
            value: false,
            formCount: 0,
            newOrderNumber: 0,
            oldOrderNumber: 0,
            orderNumber,
        };
        const [formName, folderName] = label.split(splitSpecialCharacter);
        const formDetails = getFormDetailsByFormName(formName);
        const folderDetails =
            comparisonType !== "form folder"
                ? getFormDetailsByFormName(folderName)
                : getFolderDetailsByFormName(folderName);
        if (getArrayLength(assignedMatricesList.value) > 0) {
            let checkFlag = false;
            for (const row of assignedMatricesList.value) {
                const formId = row.formId;
                const folderId = comparisonType !== "form folder" ? row.formId : row.folderId;
                if (
                    (comparisonType === "form folder" &&
                        isEqual(formDetails[0].id, formId, "string") &&
                        isEqual(folderDetails[0].id, folderId, "string")) ||
                    (comparisonType === "form" &&
                        isEqual(formDetails[0].id, formId, "string") &&
                        !row.folderId)
                ) {
                    result = {
                        ...row,
                        value,
                        formCount,
                        formId,
                        folderId: comparisonType !== "form folder" ? 0 : folderId,
                    };
                    checkFlag = true;
                    break;
                }
            }
            if (!checkFlag) {
                let folderId = 0;
                if (comparisonType !== "form folder") folderId = 0;
                else if (getArrayLength(folderDetails) > 0) folderId = folderDetails[0].id;
                result = {
                    id: 0,
                    folderId,
                    formId: getArrayLength(formDetails) > 0 ? formDetails[0].id : 0,
                    matricesId: Number(props.tabData[props.activeTab.label].data.id),
                    value,
                    formCount,
                    updatedBy: 0,
                    newOrderNumber: 0,
                    oldOrderNumber: 0,
                    orderNumber: defaultOrderNumber(
                        getArrayLength(formDetails) > 0 ? formDetails[0].id : 0,
                        folderId,
                        comparisonType,
                    ),
                };
            }
        } else {
            result = {
                folderId: comparisonType !== "form folder" ? 0 : Number(folderDetails[0].id),
                formId: Number(formDetails[0].id),
                id: 0,
                matricesId: Number(props.tabData[props.activeTab.label].data.id),
                updatedBy: 0,
                value,
                formCount,
                newOrderNumber: 0,
                oldOrderNumber: 0,
                orderNumber: defaultOrderNumber(
                    formDetails[0].id,
                    folderDetails[0].id,
                    comparisonType,
                ),
            };
        }
        return deepClone(result);
    }

    function getMatrixDetailsForAPI(): IAssignMatrixData[] {
        const result: IFormFolderMap[] = [];
        for (const row of formFolderMapping.value) {
            for (const [key, value] of Object.entries(row)) {
                if (["Head hidden", "Tail hidden"].includes(key)) continue;
                result.push({ ...(value as unknown as IFormFolderMap) });
            }
        }
        const finalResult: IAssignMatrixData[] = [];
        for (const row of result) {
            if (row.comparisonType !== "different form") finalResult.push(getAssignData(row));
        }
        return deepClone(finalResult);
    }

    async function assignMatrices() {
        // return;
        loading.value.form = true;
        let status = 500;
        let message = "";
        // matrixId: props.tabData[props.tabLabel].id,
        // assignedMatrices: getMatrixDetailsForAPI(),
        if (getArrayLength(assignedMatricesList.value) === 0) {
            const { message: apiMessage, status: apiStatus } =
                await assignMatricesCreateAPI(getMatrixDetailsForAPI());
            message = apiMessage;
            status = apiStatus;
        } else {
            const { message: apiMessage, status: apiStatus } =
                await assignMatricesUpdateAPI(getMatrixDetailsForAPI());
            message = apiMessage;
            status = apiStatus;
        }
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await assignedMatrices();
            processMatrix();
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.form = false;
        if (status === 200) isEditForm.value = false;
    }

    const { isModelChanged, model, modelRef } = useUnsavedAlert(
        formFolderMapping.value,
        formFolderMappingRef.value,
    );

    watch(
        () => formFolderMapping.value,
        (newValue) => {
            model.value = newValue;
            modelRef.value = formFolderMappingRef.value;
        },
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
            if (newTriggerFormActionAlert === "reset" && isModelChanged.value) {
                formFolderMapping.value = deepClone(formFolderMappingRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        await getMatrixDetails();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-full gap-[1rem]">
        <admin-card-wrapper group-label="Assign Matrices">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="flex flex-row items-center gap-[0.5rem]">
                        <admin-action-label
                            v-if="!isEditForm"
                            icon="edit"
                            text="Edit"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    isEditForm = true;
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isModelChanged"
                            icon="save"
                            text="Save"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                async () => {
                                    await assignMatrices();
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isEditForm && !isModelChanged"
                            icon="circle-close"
                            text="Cancel"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    resetFormModel();
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isModelChanged"
                            icon="undo"
                            text="Reset"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    resetFormModel();
                                }
                            "
                        />
                    </div>
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
                                <!-- <tr :id="`loading-row-${index}`">
                                        <td
                                            v-for="(folderRow, columnIndex) of gridFolderRow"
                                            :key="columnIndex"
                                            class="font-normal text-left pointer-events-none font-12"
                                        >
                                            <edc-skeleton-loader
                                                container-class="w-[40%] h-[1.5rem] my-[1rem] mx-auto"
                                                loader-type="rectangle"
                                            />
                                        </td>
                                    </tr> -->
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
                                            <div class="flex flex-row gap-[0.5rem]">
                                                <edc-checkbox
                                                    v-if="
                                                        row[columnRow.label].type == 'input' &&
                                                        row[columnRow.label].comparisonType !==
                                                            'different form' &&
                                                        isEditForm
                                                    "
                                                    :key="`${row[columnRow.label].label}-${columnIndex}`"
                                                    v-model="row[columnRow.label].value"
                                                    v-tooltip.top="
                                                        row[columnRow.label].label
                                                            .split(splitSpecialCharacter)
                                                            .join('-')
                                                    "
                                                    :disabled="loading.isDisabled()"
                                                    :name="`${row[columnRow.label].label}_${row[columnRow.label].value}`"
                                                />
                                                <edc-icon
                                                    v-else-if="
                                                        row[columnRow.label].type == 'input' &&
                                                        !isEditForm &&
                                                        row[columnRow.label].value
                                                    "
                                                    icon="check"
                                                    class="fill-[var(--color-secondary)] h-[0.8rem]"
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
                                                <edc-text-input
                                                    v-if="
                                                        row[columnRow.label].type == 'input' &&
                                                        row[columnRow.label].comparisonType !==
                                                            'different form' &&
                                                        isEditForm
                                                    "
                                                    :key="`${row[columnRow.label].label}-${columnIndex}`"
                                                    v-model="row[columnRow.label].formCount"
                                                    v-tooltip="'Form count'"
                                                    type="number"
                                                    :disabled="
                                                        loading.isDisabled(
                                                            !row[columnRow.label].value,
                                                        )
                                                    "
                                                    input-class="admin-input-font"
                                                    container-class="w-[5rem]"
                                                />
                                                <!-- <span
                                                    v-else-if="
                                                        row[columnRow.label].type == 'input' &&
                                                        !isEditForm &&
                                                        row[columnRow.label].formCount
                                                    "
                                                    v-tooltip="'Form count'"
                                                    class="admin-input-font"
                                                    >({{ row[columnRow.label].formCount }})</span
                                                > -->
                                            </div>
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
