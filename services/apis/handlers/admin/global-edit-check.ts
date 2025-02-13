import ServiceCall from "~/services/apis/service-call";
import { globalLibraries } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IGlobalEditCheckActionCreateResponse,
    IGlobalEditCheckActionData,
    IGlobalEditCheckActionListResponse,
    IGlobalEditCheckCreateResponse,
    IGlobalEditCheckData,
    IGlobalEditCheckPaginationListResponse,
    IGlobalEditCheckStepCreateResponse,
    IGlobalEditCheckStepData,
    IGlobalEditCheckStepListResponse,
} from "../types/admin/global-edit-check-types";

export async function globalEditCheckListPaginationAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckPaginationListResponse;
}

export async function createGlobalEditCheckAPI(body: IGlobalEditCheckData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckCreateResponse;
}

export async function updateGlobalEditCheckAPI(body: IGlobalEditCheckData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckCreateResponse;
}

export async function deleteGlobalEditCheckByIdAPI(globalEditCheckId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.delete,
        pathParams: globalEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckCreateResponse;
}

export async function globalCheckStepsListAPI(globalEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.checkStepsList,
        pathParams: globalEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckStepListResponse;
}

export async function createGlobalEditCheckStepAPI(body: IGlobalEditCheckStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.createEditCheckStep,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckStepCreateResponse;
}

export async function updateGlobalEditCheckStepAPI(body: IGlobalEditCheckStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.updateEditCheckStep,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckStepCreateResponse;
}

export async function deleteGlobalEditCheckStepByIdAPI(globalEditCheckStepId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.deleteEditCheckStep,
        pathParams: globalEditCheckStepId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckStepCreateResponse;
}

export async function globalCheckActionsListAPI(globalEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.checkActionsList,
        pathParams: globalEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckActionListResponse;
}

export async function createGlobalEditCheckActionAPI(body: IGlobalEditCheckActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.createEditCheckAction,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckActionCreateResponse;
}

export async function updateGlobalEditCheckActionAPI(body: IGlobalEditCheckActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.updateEditCheckAction,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckActionCreateResponse;
}

export async function deleteGlobalEditCheckActionAPI(globalEditCheckActionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.editChecks.deleteEditCheckAction,
        pathParams: globalEditCheckActionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalEditCheckActionCreateResponse;
}
