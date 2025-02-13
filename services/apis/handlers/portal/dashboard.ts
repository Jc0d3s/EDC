import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { dashboard } from "~/services/apis/portal-routes.json";
import type {
    IAdverseOrConcomitantCountDataResponse,
    IDeleteDataEntryQuickLinkResponse,
    IFormFieldDiscrepanciesProgressStatusCountDataResponse,
    IQuickLinkCreateResponse,
    IQuickLinkListResponse,
    ISiteByTrialAndEnvironmentResponse,
    ISubjectByTrialAndEnvironmentResponse,
    ISubjectOverDueVisitCountDataResponse,
    ISubjectTrialSitesCountDataResponse,
} from "../types/dashboard-types";
import type { TNullableString } from "~/types/common";

// interface ICommonDashboardReportType {
//     trialId: number;
//     environmentId: number;
// }
interface ICommonDashboardReportType {
    trialId: number;
    environmentId: number;
    siteId: number;
    siteIds: number[];
    subjectId: number;
    subjectIds: number[];
    folderIds: number[];
    type: number;
    folderId: number;
    count: number;
    statusName: string;
    name: string;
}

// interface ISiteIdsQuery {
//     siteIds: number[];
// }
// interface ISubjectIdsQuery {
//     subjectIds: number[];
// }
// interface ITrialVisitIdsQuery {
//     subjectIds: number[];
// }
// interface ISubjectIdsQuery {
//     subjectIds: number[];
// }
export async function subjectTrialSitesCountAPI(body: ICommonDashboardReportType) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.subjectTrialSitesCount,
        body,
        // queryParamsType: "questionMark",
        // queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectTrialSitesCountDataResponse;
}

export async function adverseOrConcomitantCountAPI(body: ICommonDashboardReportType) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.adverseOrConcomitantCount,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAdverseOrConcomitantCountDataResponse;
}

export async function formFieldDiscrepanciesProgressStatusCountAPI(
    body: ICommonDashboardReportType,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.formFieldDiscrepanciesProgressStatusCount,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldDiscrepanciesProgressStatusCountDataResponse;
}

export async function subjectOverDueVisitCountAPI(body: ICommonDashboardReportType) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.subjectOverDueVisitCount,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectOverDueVisitCountDataResponse;
}

interface ISubjectByTrialAndEnvironmentId {
    trialId: number;
    environmentId: number;
}

interface ISubjectBySiteIds extends ISubjectByTrialAndEnvironmentId {
    siteIds: number[];
}

export async function subjectByTrialAndEnvironmentAPI(body: ISubjectBySiteIds) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.subjectByTrialAndEnvironment,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectByTrialAndEnvironmentResponse;
}

export async function sitesByTrialAndEnvironmentAPI(queryParams: ISubjectByTrialAndEnvironmentId) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.sitesByTrialAndEnvironment,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteByTrialAndEnvironmentResponse;
}

interface IQuickLinkQuery {
    trialId: number;
    environmentId: number;
}
export async function quickLinksListAPI(queryParams: IQuickLinkQuery) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.quickLinksList,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IQuickLinkListResponse;
}

export interface IQuickLinkSaveBody {
    id: number;
    trialId: number;
    environmentId: number;
    studyId: number;
    page: string;
    pageDetails: TNullableString;
}
export async function saveAsQuickLinkAPI(body: IQuickLinkSaveBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.saveAsQuickLink,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IQuickLinkCreateResponse;
}

export async function deleteQuickLinksAPI(body: { trialId: number; environmentId: number }) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dashboard.deleteQuickLinks,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDeleteDataEntryQuickLinkResponse;
}
