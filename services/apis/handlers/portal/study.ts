import ServiceCall from "~/services/apis/service-call";
import { studies } from "~/services/apis/portal-routes.json";
import type {
    IStudyDetailByTrialAndEnvironmentIdResponse,
    IStudyLatestReleaseVersionDetailsResponse,
    ITrialEnvironmentDetailsListResponse,
} from "../types/study-types";
import type {
    IPublishedAssignMatrixListResponse,
    IPublishedFormListResponse,
    IPublishedTrialVisitListResponse,
    IUpdatePublishedFormFolder,
    IUpdatePublishedFormFolderResponse,
} from "../types/admin/release-version-detail-types";

export async function trialEnvironmentDetailsAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studies.trialEnvironmentDetailsList,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialEnvironmentDetailsListResponse;
}

export async function detailsByTrialIdAndEnvironmentId(trialId: number, environmentId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studies.detailsByTrialIdAndEnvironmentId,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyDetailByTrialAndEnvironmentIdResponse;
}

export async function publishedFormsListByTrialIdAndEnvironmentIdAPI(
    trialId: number,
    environmentId: number,
    folderId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.publishedFormsListByTrialIdAndEnvironmentId,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
            folderId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormListResponse;
}

export async function publishedTrialVisitsListByTrialIdAndEnvironmentIdAPI(
    trialId: number,
    environmentId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.publishedTrialVisitsListByTrialIdAndEnvironmentId,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedTrialVisitListResponse;
}

export async function publishedFormFoldersListByTrialIdAndEnvironmentIdAPI(
    trialId: number,
    environmentId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.publishedFormFoldersListByTrialIdAndEnvironmentId,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedAssignMatrixListResponse;
}

export async function updatePublishedFormFoldersAPI(body: IUpdatePublishedFormFolder[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...studies.updatePublishedFormFolders,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUpdatePublishedFormFolderResponse;
}

export async function studyLatestReleaseVersionDetailsyTrialAndEnvironmentIdAPI(queryParams: {
    trialId: number;
    environmentId: number;
}) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studies.latestReleaseVersionByTrialAndEnvironmentId,
        queryParamsType: "questionMark",
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyLatestReleaseVersionDetailsResponse;
}
