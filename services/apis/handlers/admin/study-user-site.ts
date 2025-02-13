import ServiceCall from "~/services/apis/service-call";
import { studyUserSites } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IStudyUserSiteCreateResponse,
    IStudyUserSiteData,
    IStudyUserSitePaginationListResponse,
} from "../types/admin/study-user-site-types";

export async function studyUserSitePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studyUserSites.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserSitePaginationListResponse;
}

export async function updateStudyUserSitesAPI(body: IStudyUserSiteData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studyUserSites.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserSiteCreateResponse;
}

export async function deleteStudyUserSitesAPI(studyUserSiteId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studyUserSites.delete,
        pathParams: studyUserSiteId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserSiteCreateResponse;
}
