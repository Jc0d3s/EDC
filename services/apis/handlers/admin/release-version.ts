import ServiceCall from "~/services/apis/service-call";
import { releaseVersions } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ICRFVersionSitePaginationListResponse,
    IOverwrittenReleaseVersionListResponse,
    IPublishedReleaseVersionData,
    IPublishedReleaseVersionDetailsResponse,
    IPublishedVersionDetailsResponse,
    IPushCRFVersion,
    IPushCRFVersionCreateResponse,
    IReleaseVersionCreateResponse,
    IReleaseVersionData,
    IReleaseVersionListResponse,
    IReleaseVersionPaginationListResponse,
    IReleaseVersionSummaryCountByBranchIDResponse,
} from "../types/admin/release-version-types";

export async function releaseVersionPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersions.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionPaginationListResponse;
}

export async function releaseVersionListByBranchIdAPI(branchId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersions.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionListResponse;
}

export async function createReleaseVersionAPI(body: IReleaseVersionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersions.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionCreateResponse;
}

export async function summaryCountByReleaseVersionIDAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...releaseVersions.summaryCount,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionSummaryCountByBranchIDResponse;
}

export async function pushCRFVersionAPI(body: IPushCRFVersion) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersions.pushCRFVersion,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPushCRFVersionCreateResponse;
}

export async function getPushedDetailsByIdsAPI(
    trialId: number,
    environmentId: number,
    releaseVersionId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersions.getPushedDetailsByIds,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
            releaseVersionId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedVersionDetailsResponse;
}

export async function getPublishedReleaseVersionDetailsAPI(releaseVersionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...releaseVersions.detailsByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedReleaseVersionDetailsResponse;
}

export async function updatePublishedReleaseVersionDetailsAPI(body: IPublishedReleaseVersionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...releaseVersions.updateDetailsById,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedReleaseVersionDetailsResponse;
}

export async function overwriteReleaseVersionAPI(body: IReleaseVersionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...releaseVersions.overwriteVersion,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionCreateResponse;
}

export async function overwrittenVersionListByReleaseVersionIdAPI(releaseVersionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersions.overwrittenVersionListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOverwrittenReleaseVersionListResponse;
}

export async function crfVersionSitePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersions.crfVersionSitesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICRFVersionSitePaginationListResponse;
}

export async function releaseVersionListByTrialIdAPI(trialId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersions.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IReleaseVersionListResponse;
}
