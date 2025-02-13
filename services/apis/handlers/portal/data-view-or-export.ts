import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { dataViewOrExport } from "~/services/apis/portal-routes.json";
import type {
    IPublishedFormFieldExportDataResponse,
    IPublishedFormFieldsViewDataResponse,
} from "../types/data-view-export-types";
import type { TNullableNumber } from "~/types/common";

interface IPublishedFormFieldExportBody {
    id: number;
    formName: string;
    publishedSubjectFormFieldParentId: number;
    trialId: number;
    environmentId: number;
    formIds: number[];
    folderIds: number[];
    siteIds: number[];
    isZippingRequired: boolean;
    columnNameAsFirstName: boolean;
    successMessageEmailIds: string[];
    failureMessageEmailIds: string[];
    extensionType: string;
    exportDataTo: string;
    fieldDetails: [];
    formDetails: [];
    subjectIds: number[];
}
export async function publishedFormFieldExportDataAPI(body: IPublishedFormFieldExportBody) {
    const {
        status = 500,
        // data: { success = false, message = "", validationErrors = null, data = null },
        data,
        headers,
    } = await ServiceCall({
        ...dataViewOrExport.publishedFormFieldExportData,
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
    } as IPublishedFormFieldExportDataResponse;
}

interface IPublishedFormFieldsViewQueryParam {
    trialId: number;
    environmentId: number;
    folderId: number;
    formId: number;
    siteId: TNullableNumber;
    subjects: string;
}
export async function publishedFormFieldsViewDataAPI(
    queryParams: IPublishedFormFieldsViewQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
        headers,
    } = await ServiceCall({
        ...dataViewOrExport.publishedFormFieldsViewData,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
        headers,
    } as IPublishedFormFieldsViewDataResponse;
}

interface IBlackCRFBody {
    trialId: number;
    environmentId: number;
    studyName: null;
    pageName: null;
    siteName: null;
    visitName: null;
    subjectCode: null;
    investigatorName: null;
    exportDataTo: string;
    questionsAndResponses: [];
}
export async function blankCRFAPI(body: IBlackCRFBody) {
    const {
        status = 500,
        data,
        headers,
    } = await ServiceCall({
        ...dataViewOrExport.blankCRF,
        body,
        responseType: body.exportDataTo === "Download" ? "blob" : "json",
    });

    return {
        status,
        data,
        headers,
    } as IPublishedFormFieldExportDataResponse;
}

interface IAnnotatedCRFBody {
    trialId: number;
    environmentId: number;
    studyName: null;
    pageName: null;
    siteName: null;
    visitName: null;
    subjectCode: null;
    investigatorName: null;
    exportDataTo: string;
    questionsAndResponses: [];
}
export async function annotatedCRFAPI(body: IAnnotatedCRFBody) {
    const {
        status = 500,
        data,
        headers,
    } = await ServiceCall({
        ...dataViewOrExport.annotatedCRF,
        body,
        responseType: body.exportDataTo === "Download" ? "blob" : "json",
    });

    return {
        status,
        data,
        headers,
    } as IPublishedFormFieldExportDataResponse;
}
