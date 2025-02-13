import ServiceCall from "~/services/apis/service-call";
import { studyUsers } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IStudyUserCreateResponse,
    IStudyUserData,
    IStudyUserPaginationListResponse,
} from "../types/admin/study-user-types";

export async function studyUserPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...studyUsers.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserPaginationListResponse;
}

export async function createStudyUserAPI(body: IStudyUserData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studyUsers.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserCreateResponse;
}

export async function updateStudyUserAPI(body: IStudyUserData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studyUsers.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserCreateResponse;
}

export async function deleteStudyUserAPI(studyUserId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...studyUsers.delete,
        pathParams: studyUserId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IStudyUserCreateResponse;
}
