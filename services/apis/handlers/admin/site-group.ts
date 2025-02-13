import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { siteGroups } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ICreateSiteGroupResponse,
    ISiteGroupData,
    ISiteGroupListResponse,
    ISiteGroupPaginationListResponse,
} from "../types/admin/site-group-types";

export async function siteGroupPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...siteGroups.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteGroupPaginationListResponse;
}

export async function createSiteGroupAPI(body: ISiteGroupData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...siteGroups.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteGroupResponse;
}

export async function updateSiteGroupAPI(body: ISiteGroupData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...siteGroups.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteGroupResponse;
}

export async function deleteSiteGroupAPI(siteGroupId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...siteGroups.delete,
        pathParams: siteGroupId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateSiteGroupResponse;
}

export async function siteGroupListAPI(queryParams?: IQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...siteGroups.list,
        queryParamsType: "questionMark",
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteGroupListResponse;
}

export async function siteGroupListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...siteGroups.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteGroupListResponse;
}
