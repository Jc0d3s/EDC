import ServiceCall from "~/services/apis/service-call";
import { trialEnvironments } from "~/services/apis/admin-routes.json";
import type {
    ICreateTrialEnvironmentResponse,
    ITrialEnvironmentData,
    ITrialEnvironmentPaginationListResponse,
    ITrialEnvironmentResponse,
} from "~/services/apis/handlers/types/admin/trial-environment-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function trialEnvironmentListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialEnvironments.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialEnvironmentResponse;
}

export async function trialEnvironmentPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...trialEnvironments.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialEnvironmentPaginationListResponse;
}

export async function createTrialEnvironmentAPI(body: ITrialEnvironmentData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialEnvironments.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialEnvironmentResponse;
}

export async function updateTrialEnvironmentAPI(body: ITrialEnvironmentData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialEnvironments.update,
        body,
        pathParams: Number(body.id),
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialEnvironmentResponse;
}

export async function deleteTrialEnvironmentAPI(trialEnvironmentId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialEnvironments.delete,
        pathParams: trialEnvironmentId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialEnvironmentResponse;
}
