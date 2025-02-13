import ServiceCall from "~/services/apis/service-call";
import { studies } from "~/services/apis/admin-routes.json";
import type { IStudyListResponse } from "../types/admin/study-types";
import type {
    IStudyEnvironmentsListResponse,
    IStudyTrialsListResponse,
} from "../types/study-types";

export async function listAllStudiesAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.listAll,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyListResponse;
}

export async function listAllStudyTrialsAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.listAllTrialsByStudies,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyTrialsListResponse;
}

export async function listAllStudyTrialEnvironmentsAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.listAllEnvironmentsByStudyTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyEnvironmentsListResponse;
}
