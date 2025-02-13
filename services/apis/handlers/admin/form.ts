import ServiceCall from "~/services/apis/service-call";
import { forms } from "~/services/apis/admin-routes.json";
import type {
    IFormData,
    IFormListResponse,
    IFormPaginationListResponse,
    IFormResponse,
} from "../types/admin/form-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function formPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...forms.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormPaginationListResponse;
}

export async function formsListByBranchIdAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...forms.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormListResponse;
}

export async function formsListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...forms.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormListResponse;
}

export async function createFormAPI(body: IFormData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...forms.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormResponse;
}

export async function updateFormAPI(body: IFormData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...forms.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormResponse;
}

export async function reorderFormsAPI(body: IFormData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...forms.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormResponse;
}

export async function deleteFormByIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...forms.delete,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormResponse;
}
