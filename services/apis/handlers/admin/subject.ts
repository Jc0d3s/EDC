import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { subjects } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";
import type {
    ISubjectData,
    ISubjectCreateResponse,
    ISubjectDetailResponse,
    ISubjectPaginationListResponse,
    ISubjectListResponse,
    IChangeSubjectStatus,
    IChangeSubjectStatusResponse,
    IAddVisit,
    IAddVisitResponse,
    IAddEvent,
    IAddEventResponse,
    ISubjectStatusResponse,
    ICopySubjectResponse,
    IOnboardSubjectExportDataResponse,
    IUpdateFormActivationResponse,
    ISubjectFormActivationListResponse,
} from "../types/subject-types";

export async function subjectPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjects.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectPaginationListResponse;
}

export async function subjectCreateAPI(body: ISubjectData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectCreateResponse;
}

export async function subjectUpdateAPI(body: ISubjectData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.update,
        body,
        // pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectCreateResponse;
}

export async function subjectDeleteAPI(subjectId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.delete,
        pathParams: subjectId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectCreateResponse;
}

export async function subjectDetailsBySubjectIdAPI(subjectId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.subjectDetails,
        pathParams: subjectId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectDetailResponse;
}

export async function subjectListByStudyIdAPI(studyId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...subjects.listAllByStudyId,
        pathParams: studyId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectListResponse;
}

export async function onboardSubjectPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...subjects.onboardSubjectsPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectPaginationListResponse;
}

export async function changeSubjectStatusAPI(body: IChangeSubjectStatus) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.changeSubjectStatus,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IChangeSubjectStatusResponse;
}

export async function addVisitAPI(body: IAddVisit) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.addVisit,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAddVisitResponse;
}

export async function addEventAPI(body: IAddEvent) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.addEvent,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAddEventResponse;
}

export async function subjectStatusesListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.subjectStatusesList,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectStatusResponse;
}

export async function copySubjectsAPI(body: { trialId: number; environmentId: number }) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.copySubjects,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICopySubjectResponse;
}

interface IOnboardSubjectData {
    top: TNullableNumber;
    skip: number;
    trialId: number;
    environmentId: number;
    extensionType: string;
    exportDataTo: string;
    searchPhrase: TNullableString;
    siteId: TNullableNumber;
    statusId: TNullableNumber;
    dataSet: string;
}
export async function onboardSubjectExportDataAPI(body: IOnboardSubjectData) {
    const {
        status = 500,
        // data: { success = false, message = "", validationErrors = null, data = null },
        data,
        headers,
    } = await ServiceCall({
        ...subjects.exportData,
        body,
        responseType: body.exportDataTo === "Download" ? "blob" : "json",
    });

    return {
        status,
        data,
        // success,
        // message,
        // validationErrors,
        headers,
    } as IOnboardSubjectExportDataResponse;
}

export interface IUpdateFormData {
    id: number;
    folderId: TNullableNumber;
    type: "activate" | "inactivate";
}
export interface IUpdateFormActivationBody {
    forms: IUpdateFormData[];
    reason: string;
    subjectId: number;
    trialId: number;
    environmentId: number;
}
export async function updateFormActivationStatusAPI(body: IUpdateFormActivationBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.updateFormActivationStatus,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUpdateFormActivationResponse;
}

interface IPublishedSubjectInactivateFormQueryParam {
    trialId: number;
    environmentId: number;
    subjectId: number;
}
export async function publishedSubjectInactivateFormsAPI(
    queryParams: IPublishedSubjectInactivateFormQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...subjects.publishedSubjectInactivateForms,
        queryParams: queryParams as unknown as IQueryParam,
        queryParamsType: "questionMark",
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectFormActivationListResponse;
}
