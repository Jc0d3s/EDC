import ServiceCall from "~/services/apis/service-call";
import { sites } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ISiteTheraperuticAreaInvestigatorCreateResponse,
    ISiteTheraperuticAreaInvestigatorPaginationListResponse,
    ISiteTherapeuticAreaInvestigator,
} from "../types/admin/site-therapeutic-area-investigator-types";

export async function siteTherapeuticAreaInvestigatorPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...sites.therapeuticAreaInvestigatorPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteTheraperuticAreaInvestigatorPaginationListResponse;
}

export async function updateSiteTherapeuticAreaInvestigatorsAPI(
    body: ISiteTherapeuticAreaInvestigator[],
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...sites.therapeuticAreaInvestigatorsAssign,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISiteTheraperuticAreaInvestigatorCreateResponse;
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
