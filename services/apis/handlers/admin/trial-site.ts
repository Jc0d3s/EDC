import ServiceCall from "~/services/apis/service-call";
import { trialSites } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ITrialSiteData,
    ITrialSiteListResponse,
    ITrialSitePaginationListResponse,
    IUpdateTrialSiteResponse,
} from "../types/admin/trial-site-types";

export async function trialSitePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...trialSites.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialSitePaginationListResponse;
}

export async function trialSitesListByTrialIdAPI(trialId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialSites.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialSiteListResponse;
}

export async function updateTrialSiteAPI(body: ITrialSiteData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialSites.updateTrialAndSiteAssign,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUpdateTrialSiteResponse;
}
