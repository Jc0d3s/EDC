<script setup lang="ts">
    import Loading from "~/services/apis/data/loading";
    import { formsListByBranchIdAPI } from "~/services/apis/handlers/admin/form";
    import {
        assignedMatricesListAPI,
        reorderFormFolderAPI,
    } from "~/services/apis/handlers/admin/matrix";
    import { trialVisitsListByBranchIDAPI } from "~/services/apis/handlers/admin/trial-visit";
    import type { IFormData } from "~/services/apis/handlers/types/admin/form-types";
    import type {
        IAssignMatrixData,
        IMatrixReorderData,
    } from "~/services/apis/handlers/types/admin/matrix-types";
    import type { ITrialVisit } from "~/services/apis/handlers/types/admin/trial-visit-types";
    import useToastStore from "~/stores/toast";
    import useUnsavedAlertStore from "~/stores/unsaved-alert";
    import type { IWinFormProps, TVoidAction } from "~/types/common";
    import type { IColumn, IDraggableItem } from "~/types/datatable";

    interface IMatrixReorderDataWithLabel extends IMatrixReorderData {
        label: string;
        orderNumber: number;
        tempID: string;
    }

    const props = withDefaults(defineProps<IWinFormProps>(), {
        tabData: null,
    });

    const toastStore = useToastStore();
    const unsavedAlertStore = useUnsavedAlertStore();
    const assignedMatricesList = ref<IAssignMatrixData[]>([]);
    const formsList = ref<IFormData[]>([]);
    const foldersList = ref<ITrialVisit[]>([]);
    const matricesOrderData = ref<IMatrixReorderDataWithLabel[]>([]);
    const matricesOrderDataRef = ref<IMatrixReorderDataWithLabel[]>([]);

    const columns: IColumn[] = [
        {
            field: "label",
            header: "Label",
            icon: false,
            show: true,
        },
    ];

    const loading = ref<Loading>(new Loading());

    function getFormName(formId: number) {
        const filteredItem = getFilteredItems({
            data: formsList.value,
            type: "object",
            value: formId,
            key: "id",
        });
        if (getArrayLength(filteredItem) > 0) return filteredItem[0].formName;
        return "";
    }

    function getTrialVisitName(folderId: number) {
        const filteredItem = getFilteredItems({
            data: foldersList.value,
            type: "object",
            value: folderId,
            key: "id",
        });
        if (getArrayLength(filteredItem) > 0) return filteredItem[0].name;
        return "";
    }

    function setOrderData() {
        const result: IMatrixReorderDataWithLabel[] = [];
        let folderIdRef = -1;
        for (const row of assignedMatricesList.value) {
            if (row.folderId && folderIdRef === row.folderId) continue;
            else folderIdRef = row.folderId;
            result.push({
                id: Number(row.folderId) === 0 ? row.formId : row.folderId,
                matricesId: row.matricesId,
                newOrderNumber: row.orderNumber,
                oldOrderNumber: row.orderNumber,
                type: Number(row.folderId) === 0 ? "form" : "folder",
                label:
                    Number(row.folderId) === 0
                        ? getFormName(row.formId)
                        : getTrialVisitName(row.folderId),
                orderNumber: row.orderNumber,
                tempID: uniqueID(),
            });
        }
        result.sort((a, b) => {
            if (a.orderNumber > b.orderNumber) return 1;
            if (a.orderNumber < b.orderNumber) return -1;
            return 0;
        });
        console.log("result in setOrderData", result);
        matricesOrderData.value = deepClone(result);
        matricesOrderDataRef.value = deepClone(result);
    }

    async function formList() {
        const { status, data, message } = await formsListByBranchIdAPI(
            props.tabData[props.activeTab.label].data.branchId,
        );
        if (status === 200) {
            formsList.value = deepClone(data);
        } else if (status !== 401) {
            formsList.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
    }

    async function folderList() {
        const { status, data, message } = await trialVisitsListByBranchIDAPI(
            props.tabData[props.activeTab.label].data.branchId,
        );
        if (status === 200) {
            foldersList.value = deepClone(data);
        } else if (status !== 401) {
            foldersList.value = [];
            toastStore.error({
                title: "Error",
                message,
            });
        }
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

    const getReorderRequestBody = (): IMatrixReorderData[] =>
        matricesOrderData.value.map((row) => ({
            ...row,
            // newOrderNumber: row.orderNumber,
        })) as IMatrixReorderData[];

    async function reorderFormFolder() {
        loading.value.dynamicLoading.reOrder = true;
        // console.log("getReorderRequestBody", getReorderRequestBody());
        // loading.value.dynamicLoading.reOrder = false;
        // return;
        const { status, message } = await reorderFormFolderAPI(getReorderRequestBody());
        if (status === 200) {
            toastStore.success({
                title: "Success",
                message,
            });
            await onPageLoad();
            // matricesOrderDataRef.value = deepClone(matricesOrderData.value);
        } else if (status !== 401) {
            toastStore.error({
                title: "Error",
                message,
            });
        }
        loading.value.dynamicLoading.reOrder = false;
    }

    function onDragDrop(
        event: DragEvent,
        slotProps: IDraggableItem<IMatrixReorderDataWithLabel>,
        clearTransferData: TVoidAction,
    ) {
        const draggedItem = parseJSON(
            event.dataTransfer!.getData("item"),
        ) as IDraggableItem<IMatrixReorderDataWithLabel>;
        console.log("draggedItem", draggedItem);
        console.log("slotProps", slotProps);
        console.log("matricesOrderData.value before", deepClone(matricesOrderData.value));
        if (
            draggedItem.index !== slotProps.index &&
            ((draggedItem.data.type === "folder" && slotProps.data.type === "folder") ||
                (draggedItem.data.type === "form" && slotProps.data.type === "form"))
        ) {
            matricesOrderData.value = sortArray({
                data: matricesOrderData.value.map((row) => {
                    console.log("params for getItemOrder", {
                        folderOrForm: `${row.label} ${row.type}`,
                        currentOrder: row.newOrderNumber,
                        draggedElementOrder: draggedItem.data.newOrderNumber,
                        droppedElementOrder: slotProps.data.newOrderNumber,
                    });
                    const newOrderNumber = getItemOrder(
                        row.newOrderNumber,
                        draggedItem.data.newOrderNumber,
                        slotProps.data.newOrderNumber,
                    );
                    return {
                        ...row,
                        oldOrderNumber: row.orderNumber,
                        newOrderNumber,
                    };
                }),
                key: "newOrderNumber",
            });
        }
        if (
            (draggedItem.data.type === "folder" && slotProps.data.type === "form") ||
            (draggedItem.data.type === "form" && slotProps.data.type === "folder")
        ) {
            toastStore.error({
                title: "Error",
                message: "Cannot mix form and folder orders",
            });
        }
        clearTransferData();
        console.log("matricesOrderData.value after", deepClone(matricesOrderData.value));
    }

    async function onPageLoad(isFormSave: boolean = false) {
        loading.value.table = true;
        if (isFormSave) await Promise.all([assignedMatrices()]);
        else await Promise.all([formList(), folderList(), assignedMatrices()]);
        setOrderData();
        loading.value.table = false;
    }

    const {
        isOrderChanged,
        model: orderModel,
        modelRef: orderModelRef,
    } = useOrderChanged(
        matricesOrderData.value,
        matricesOrderDataRef.value,
        "tempID",
        "newOrderNumber",
    );

    watch(
        () => matricesOrderData.value,
        (newValue) => {
            orderModel.value = newValue;
            orderModelRef.value = matricesOrderDataRef.value;
        },
        { deep: true },
    );

    watch(
        () => unsavedAlertStore.triggerFormActionAlert,
        (newTriggerFormActionAlert) => {
            if (newTriggerFormActionAlert === "reset" && isOrderChanged.value) {
                matricesOrderData.value = deepClone(matricesOrderDataRef.value);
                unsavedAlertStore.triggerFormActionAlert = "none";
            }
        },
    );

    onMounted(async () => {
        loading.value.setDynamicLoading(["reOrder"]);
        await onPageLoad();
    });
</script>

<template>
    <div class="grid grid-cols-1 w-1/2 gap-[1rem]">
        <admin-card-wrapper group-label="Assign Matrices">
            <template #content>
                <div class="flex flex-col gap-[1rem]">
                    <div class="flex flex-row items-center gap-[0.5rem]">
                        <admin-action-label
                            v-if="isOrderChanged"
                            icon="save"
                            text="Save"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                async () => {
                                    await reorderFormFolder();
                                }
                            "
                        />
                        <admin-action-label
                            v-if="isOrderChanged"
                            icon="undo"
                            text="Reset"
                            :disabled="loading.isDisabled()"
                            :on-click="
                                () => {
                                    matricesOrderData = deepClone(matricesOrderDataRef);
                                }
                            "
                        />
                    </div>
                    <div class="flex flex-col gap-[1rem]">
                        <!-- <div
                            v-for="matricesOrderDataRow of matricesOrderData"
                            :key="`${matricesOrderDataRow.id}-${matricesOrderDataRow.type}`"
                        >
                            <span class="admin-input-font">{{ matricesOrderDataRow.label }}</span>
                        </div> -->
                        <edc-data-table
                            :columns="columns"
                            :table-data="matricesOrderData"
                            table-style="outlined"
                            :enable-reorder="true"
                            pagination-type="none"
                            :loading="loading.table"
                            :disabled="loading.isDisabled()"
                            :custom-content="true"
                            @on-drop="
                                (
                                    event: DragEvent,
                                    slotProps: IDraggableItem<IMatrixReorderDataWithLabel>,
                                    clearData: TVoidAction,
                                ) => onDragDrop(event, slotProps, clearData)
                            "
                        >
                            <template #custom-content="{ data }">
                                <td valign="top" class="font-normal text-left font-12 custom-row">
                                    <span class="admin-input-font"
                                        >{{ data.label }} ({{ data.type }})</span
                                    >
                                </td>
                            </template>
                        </edc-data-table>
                    </div>
                </div>
            </template>
        </admin-card-wrapper>
    </div>
</template>

<style scoped></style>
