import ServiceCall from "~/services/apis/service-call";
import { trialVisits } from "~/services/apis/admin-routes.json";
import type {
    ITrialVisit,
    ITrialVisitListResponse,
    ITrialVisitPaginationListResponse,
    ITrialCreateVisitResponse,
} from "../types/admin/trial-visit-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function trialVisitPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...trialVisits.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialVisitPaginationListResponse;
}

export async function trialVisitsListByBranchIDAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialVisits.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialVisitListResponse;
}

export async function trialVisitsListByTrialIDAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialVisits.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialVisitListResponse;
}

export async function createTrialVisitAPI(body: ITrialVisit) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialVisits.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialCreateVisitResponse;
}

export async function updateTrialVisitAPI(body: ITrialVisit) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialVisits.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialCreateVisitResponse;
}

export async function reorderTrialVisitsAPI(body: ITrialVisit[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trialVisits.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialCreateVisitResponse;
}

export async function deleteTrialVisitByIdAPI(trialVisitId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trialVisits.update,
        pathParams: trialVisitId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialCreateVisitResponse;
}
