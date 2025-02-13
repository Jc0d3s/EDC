import ServiceCall from "~/services/apis/service-call";
import { studySites } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IStudySiteCreateResponse,
    IStudySiteData,
    IStudySitePaginationListResponse,
} from "../types/admin/study-site-types";

export async function studySitePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studySites.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySitePaginationListResponse;
}

export async function createStudySiteAPI(body: IStudySiteData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studySites.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteCreateResponse;
}

export async function updateStudySiteAPI(body: IStudySiteData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studySites.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteCreateResponse;
}

export async function deleteStudySiteAPI(studySiteId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studySites.delete,
        pathParams: studySiteId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudySiteCreateResponse;
}
