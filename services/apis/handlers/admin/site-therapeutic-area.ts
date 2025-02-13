import ServiceCall from "~/services/apis/service-call";
import { sites } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ISiteTheraperuticAreaCreateResponse,
    ISiteTheraperuticAreaPaginationListResponse,
    ISiteTherapeuticArea,
} from "../types/admin/site-therapeutic-area-types";

export async function siteTherapeuticAreaPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...sites.therapeuticAreaPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteTheraperuticAreaPaginationListResponse;
}

export async function updateSiteTherapeuticAreasAPI(body: ISiteTherapeuticArea[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...sites.therapeuticAreasAssign,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteTheraperuticAreaCreateResponse;
}

// export async function deleteStudyUserSitesAPI(studyUserSiteId: string) {
//     const {
//         status = 500,
//         data: { success = false, message = "", validationErrors = null, data = {} },
//     } = await ServiceCall({
//         ...sites.delete,
//         pathParams: studyUserSiteId,
//     });

//     return {
//         status,
//         data,
//         success,
//         message,
//         validationErrors,
//     } as IStudyUserSiteCreateResponse;
// }
