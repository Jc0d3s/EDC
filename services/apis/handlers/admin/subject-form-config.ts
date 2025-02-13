import ServiceCall from "~/services/apis/service-call";
import { subjectFormConfigs } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ISubjectFormConfigCreateResponse,
    ISubjectFormConfigData,
    ISubjectFormConfigListResponse,
    ISubjectFormConfigPaginationListResponse,
} from "../types/subject-form-config-types";

export async function subjectFormConfigPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjectFormConfigs.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigPaginationListResponse;
}

export async function subjectFormConfigListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjectFormConfigs.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigListResponse;
}

export async function subjectFormConfigCreateAPI(body: ISubjectFormConfigData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFormConfigs.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigCreateResponse;
}

export async function subjectFormConfigUpdateAPI(body: ISubjectFormConfigData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFormConfigs.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigCreateResponse;
}

export async function reorderSubjectFormConfigAPI(body: ISubjectFormConfigData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFormConfigs.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigCreateResponse;
}

export async function subjectFormConfigDeleteAPI(subjectFormConfigId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjectFormConfigs.delete,
        pathParams: subjectFormConfigId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormConfigCreateResponse;
}
