import ServiceCall from "~/services/apis/service-call";
import { subjectFieldConfigs } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ISubjectFieldConfigCreateResponse,
    ISubjectFieldConfigData,
    ISubjectFieldConfigPaginationListResponse,
} from "../types/subject-field-config-types";

export async function subjectFieldConfigPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjectFieldConfigs.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFieldConfigPaginationListResponse;
}

export async function subjectFieldConfigCreateAPI(body: ISubjectFieldConfigData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFieldConfigs.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFieldConfigCreateResponse;
}

export async function subjectFieldConfigUpdateAPI(body: ISubjectFieldConfigData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFieldConfigs.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFieldConfigCreateResponse;
}

export async function reorderSubjectFieldConfigAPI(body: ISubjectFieldConfigData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFieldConfigs.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFieldConfigCreateResponse;
}

export async function subjectFieldConfigDeleteAPI(subjectFieldConfigId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFieldConfigs.delete,
        pathParams: subjectFieldConfigId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFieldConfigCreateResponse;
}
