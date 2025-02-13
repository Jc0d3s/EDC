import ServiceCall from "~/services/apis/service-call";
import { discrepancies } from "~/services/apis/portal-routes.json";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";
import type {
    IDiscrepancyManagementExportDataResponse,
    IDiscrepancyManagementListByIdResponse,
    IDiscrepancyManagementPaginationListResponse,
    IDiscrepancyPaginationListResponse,
    IFormFieldDiscrepancy,
    IFormFieldDiscrepancyBadgeCountDetailsResponse,
    IFormFieldDiscrepancyResponse,
} from "../types/discrepancy-types";

export async function formFieldDiscrepancyAPI(body: IFormFieldDiscrepancy) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...discrepancies.formFieldDiscrepancies,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldDiscrepancyResponse;
}

export async function discrepancyPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...discrepancies.discrepancyPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDiscrepancyPaginationListResponse;
}
// PublishedSubjectFormFieldChildDetailId

export async function badgeCountDetailsAPI(publishedSubjectFormFieldParentId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...discrepancies.badgeCountDetails,
        pathParams: publishedSubjectFormFieldParentId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldDiscrepancyBadgeCountDetailsResponse;
}

export async function discrepancyManagementPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...discrepancies.discrepancyManagementPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDiscrepancyManagementPaginationListResponse;
}

export async function discrepancyManagementDetailsByIdAPI(formFieldDiscrepancyId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...discrepancies.detailsById,
        pathParams: formFieldDiscrepancyId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDiscrepancyManagementListByIdResponse;
}

interface IDiscrepancyManagementExortBody {
    top: TNullableNumber;
    skip: number;
    trialId: number;
    environmentId: number;
    search: TNullableString;
    subjectIds: number[];
    formIds: number[];
    folderIds: number[];
    siteIds: number[];
    type: TNullableNumber;
    status: TNullableNumber;
    extensionType: string;
    exportDataTo: string;
    dataSet: string;
    fromDate: TNullableString;
    toDate: TNullableString;
}
// queryParams?: IPaginationListQueryParam
export async function discrepancyManagementExportDataAPI(body: IDiscrepancyManagementExortBody) {
    const {
        status = 500,
        data,
        headers,
    } = await ServiceCall({
        ...discrepancies.exportData,
        body,
        responseType: body.exportDataTo === "Download" ? "blob" : "json",
        // responseType:
        //     queryParams && "exportDataTo" in queryParams && queryParams.exportDataTo === "Download"
        //         ? "blob"
        //         : "json",
        // queryParams,
    });

    return {
        status,
        data,
        // success,
        // message,
        // validationErrors,
        headers,
    } as IDiscrepancyManagementExportDataResponse;
}
