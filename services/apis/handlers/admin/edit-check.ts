import ServiceCall from "~/services/apis/service-call";
import { editChecks } from "~/services/apis/admin-routes.json";
import type {
    IEditCheckActionCreateResponse,
    IEditCheckActionData,
    IEditCheckActionListResponse,
    IEditCheckCreateResponse,
    IEditCheckData,
    IEditCheckListResponse,
    IEditCheckPaginationListResponse,
    IEditCheckStepCreateResponse,
    IEditCheckStepData,
    IEditCheckStepListResponse,
    IFormDetailByBranchIdResponse,
    IMasterCheckFunctionResponse,
} from "../types/admin/edit-check-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function editCheckListPaginationAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckPaginationListResponse;
}

// export async function editCheckListAPI() {
//     const {
//         status = 500,
//         data: { success = false, message = "", validationErrors = null, data = [] },
//     } = await ServiceCall({
//         ...editChecks.list,
//     });

//     return {
//         status,
//         data,
//         success,
//         message,
//         validationErrors,
//     } as IEditCheckListResponse;
// }

export async function editCheckListByBranchIdAPI(branchId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckListResponse;
}

export async function createEditCheckAPI(body: IEditCheckData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckCreateResponse;
}

export async function updateEditCheckAPI(body: IEditCheckData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckCreateResponse;
}

export async function deleteEditCheckByIdAPI(editCheckId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.delete,
        pathParams: editCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckCreateResponse;
}

export async function checkStepsListAPI(editCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.checkStepsList,
        pathParams: editCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckStepListResponse;
}

export async function createEditCheckStepAPI(body: IEditCheckStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.createEditCheckStep,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckStepCreateResponse;
}

export async function updateEditCheckStepAPI(body: IEditCheckStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.updateEditCheckStep,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckStepCreateResponse;
}

export async function deleteEditCheckStepByIdAPI(editCheckStepId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.deleteEditCheckStep,
        pathParams: editCheckStepId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckStepCreateResponse;
}

export async function checkActionsListAPI(editCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.checkActionsList,
        pathParams: editCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckActionListResponse;
}

export async function createEditCheckActionAPI(body: IEditCheckActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.createEditCheckAction,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckActionCreateResponse;
}

export async function updateEditCheckActionAPI(body: IEditCheckActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.updateEditCheckAction,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckActionCreateResponse;
}

export async function deleteEditCheckActionAPI(editCheckActionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.deleteEditCheckAction,
        pathParams: editCheckActionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEditCheckActionCreateResponse;
}

export async function formDetailsByBranchIdAPI(branchId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.formDetailsByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormDetailByBranchIdResponse;
}

export async function masterCheckFunctionsAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...editChecks.masterCheckFunctions,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMasterCheckFunctionResponse;
}
