import ServiceCall from "~/services/apis/service-call";
import { branchEmailAlerts } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IEmailAlertCreateResponse,
    IEmailAlertData,
    IEmailAlertPaginationListResponse,
    IEmailAlertTemplateData,
    IEmailTemplateCreateResponse,
    IEmailTemplateDetaisByEmailConfigIdResponse,
} from "../types/admin/branch-email-alert-types";

export async function branchEmailAlertPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...branchEmailAlerts.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailAlertPaginationListResponse;
}

export async function createBranchEmailAlertAPI(body: IEmailAlertData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailAlertCreateResponse;
}

export async function updateBranchEmailAlertAPI(body: IEmailAlertData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailAlertCreateResponse;
}

export async function deleteBranchEmailAlertByIdAPI(emailAlertId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.delete,
        pathParams: emailAlertId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailAlertCreateResponse;
}

export async function branchEmailTemplateDetailsByEmailConfigIdAPI(emailConfigId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.templateDetails,
        pathParams: emailConfigId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailTemplateDetaisByEmailConfigIdResponse;
}

export async function createBranchEmailTemplateAPI(body: IEmailAlertTemplateData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.templateCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailTemplateCreateResponse;
}

export async function updateBranchEmailTemplateAPI(body: IEmailAlertTemplateData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branchEmailAlerts.templateUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEmailTemplateCreateResponse;
}
