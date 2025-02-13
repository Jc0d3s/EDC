import ServiceCall from "~/services/apis/service-call";
import { subjectSiteTransfers } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ISubjectSiteTransferCreateResponse,
    ISubjectSiteTransferData,
    ISubjectSiteTransferDetailsByIdResponse,
    ISubjectSiteTransferPaginationListResponse,
} from "../types/subject-site-transfer-types";

export async function subjectSiteTransferPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjectSiteTransfers.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferPaginationListResponse;
}

export async function subjectSiteTransferCreateAPI(body: ISubjectSiteTransferData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectSiteTransfers.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferCreateResponse;
}

export async function subjectSiteTransferUpdateAPI(body: ISubjectSiteTransferData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectSiteTransfers.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferCreateResponse;
}

export async function subjectSiteTransferDeleteAPI(subjectSiteTransferId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectSiteTransfers.delete,
        pathParams: subjectSiteTransferId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferCreateResponse;
}

export async function subjectSiteTransferDetailsByIdAPI(subjectSiteTransferId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectSiteTransfers.detailsById,
        pathParams: subjectSiteTransferId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferDetailsByIdResponse;
}

interface ISubjectSiteTransfer {
    id: string;
    action: string;
}

export async function updateSubjectSiteTransferRequestAPI(body: ISubjectSiteTransfer) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectSiteTransfers.updateTransferRequest,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectSiteTransferCreateResponse;
}
