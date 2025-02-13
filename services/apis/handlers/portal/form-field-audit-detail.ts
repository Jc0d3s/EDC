import { formFieldAuditDetails } from "~/services/apis/portal-routes.json";
import ServiceCall from "../../service-call";
import type { IPaginationListQueryParam } from "~/types/common";
import type { ISubjectDetailPaginationListResponse } from "../types/subject-types";
import type {
    IAuditEntryDetailDataResponse,
    IAuditFormDetailDataResponse,
    IAuditHistoryDetailsPaginationList,
} from "../types/form-field-audit-detail-types";

export async function subjectDetailsPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...formFieldAuditDetails.subjectDetailsPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectDetailPaginationListResponse;
}

export async function auditFormDetailsAPI(
    trialId: number,
    environmentId: number,
    subjectId: number,
    siteId: number,
    formId: number,
    folderId: number | null,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFieldAuditDetails.auditFormDetails,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
            subjectId,
            siteId,
            formId,
            folderId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAuditFormDetailDataResponse;
}

export async function auditEntryDetailsAPI(
    trialId: number,
    environmentId: number,
    subjectId: number,
    siteId: number,
    formId: number,
    folderId: number | null,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFieldAuditDetails.auditEntryDetails,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
            subjectId,
            siteId,
            formId,
            folderId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAuditEntryDetailDataResponse;
}

export async function auditHistoryDetailsPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFieldAuditDetails.auditHistoryDetailsPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAuditHistoryDetailsPaginationList;
}
