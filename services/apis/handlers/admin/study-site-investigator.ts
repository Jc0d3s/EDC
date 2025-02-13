import ServiceCall from "~/services/apis/service-call";
import { studySiteInvestigators } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IStudySiteInvestigatorCreateResponse,
    IStudySiteInvestigatorData,
    IStudySiteInvestigatorPaginationListResponse,
} from "../types/admin/study-site-investigator-types";

export async function studySiteInvestigatorPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studySiteInvestigators.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteInvestigatorPaginationListResponse;
}

export async function updateStudySiteInvestigatorsAPI(body: IStudySiteInvestigatorData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studySiteInvestigators.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteInvestigatorCreateResponse;
}

export async function deleteStudySiteInvestigatorsAPI(studyUserSiteId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studySiteInvestigators.delete,
        pathParams: studyUserSiteId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteInvestigatorCreateResponse;
}
