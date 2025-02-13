import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { sites } from "~/services/apis/admin-routes.json";
import type {
    ICreateSiteResponse,
    ISiteData,
    ISiteListByStudyIdResponse,
    ISiteListResponse,
    ISitePaginationListResponse,
} from "~/services/apis/handlers/types/admin/site-types";
import type { IAdminListQueryParam, IPaginationListQueryParam } from "~/types/common";

export async function siteListBySiteGroupAPI(
    siteGroupId: string,
    queryParams: IAdminListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.listBySiteGroupId,
        pathParams: siteGroupId,
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteListResponse;
}

export async function sitePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...sites.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISitePaginationListResponse;
}

export async function createSiteAPI(body: ISiteData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteResponse;
}

export async function updateSiteAPI(body: ISiteData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteResponse;
}

export async function deleteSiteByIdAPI(siteId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.delete,
        pathParams: siteId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteResponse;
}

export async function siteListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteListResponse;
}

export async function listAllSitesAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.listAll,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteListResponse;
}

export async function siteListByStudyIdAPI(queryParams: { studyId: number; showAll?: boolean }) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...sites.listByStudyId,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteListByStudyIdResponse;
}
