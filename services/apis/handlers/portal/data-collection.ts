import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { dataCollection } from "~/services/apis/portal-routes.json";
import type {
    ICaptureSignature,
    ICaptureSignatureResponse,
    IChangeFormFieldStatusResponse,
    IDeleteFormFieldsByParentDetailIdResponse,
    IFormFieldCheckActionAuditData,
    IFormFieldCheckActionAuditResponse,
    IFormFieldCheckProgressStatusWorkflowResponse,
    IFormFieldStatusResponse,
    IGenerateFormFieldListResponse,
    IGenerateFormFieldsData,
    IProcessFormFieldAddFormEditCheckResponse,
    IProcessFormFieldDerivationResponse,
    IProcessFormFieldEditCheckResponse,
    IProcessFormFieldVisibiltyEditCheckResponse,
    IPublishedDataDictionaryEntriesListResponse,
    IPublishedSubjectFormFieldDetail,
    IPublishedSubjectFormFieldDetailResponse,
    IPublishedUnitDictionaryEntriesListResponse,
    ISubjectCompletionFormSigning,
    ISubjectCompletionFormSigningResponse,
    ISubjectNestedListResponse,
    IProcessFormFieldDisableEditCheckResponse,
    IProcessFormFieldNonLogDataEditCheckResponse,
} from "../types/data-collection-types";
import type { TNullableNumber } from "~/types/common";

interface INestedListQueryParams {
    trialId: number;
    environmentId: number;
    // siteId: number;
}
export async function nestedSubjectsListAPI(queryParams: INestedListQueryParams) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.subjectNestedList,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectNestedListResponse;
}

interface IGenerateFormFieldStructureQueryParams {
    trialId: number;
    environmentId: number;
    siteId: number;
    subjectId: number;
    formId: number;
    folderId?: TNullableNumber;
}

export async function generateFormFieldsStructureListAPI(
    queryParams: IGenerateFormFieldStructureQueryParams,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.generateFormFieldStructure,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGenerateFormFieldListResponse;
}

interface IQueryParams extends IGenerateFormFieldStructureQueryParams {
    publishedSubjectFormFieldParentId: number;
}
export async function generateFormFieldsListAPI(queryParams: IQueryParams) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.generateFormFields,
        queryParamsType: "questionMark",
        queryParams: queryParams as unknown as IQueryParam,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGenerateFormFieldListResponse;
}

export type TGenerateFormFieldsData = Record<string, IGenerateFormFieldsData[]>;
export async function saveFormFieldsAPI(body: { groupedFormFields: TGenerateFormFieldsData }) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.saveFormFields,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGenerateFormFieldListResponse;
}

interface ICommonDataDictionaryEntryBody {
    publishedDataDictionaryIds: number[];
    globalDataDictionaryIds: number[];
}
interface IDataDictionaryEntryBody extends ICommonDataDictionaryEntryBody {
    trialId: number;
    environmentId: number;
    siteId: number;
}
export async function publishedDataDictionaryEntriesListByIdAPI(body: IDataDictionaryEntryBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.publishedDataDictionaryEntriesById,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDataDictionaryEntriesListResponse;
}

interface ICommonUnitDictionaryEntryBody {
    publishedUnitDictionaryIds: number[];
    globalUnitDictionaryIds: number[];
}
interface IUnitDictionaryEntryBody extends ICommonUnitDictionaryEntryBody {
    trialId: number;
    environmentId: number;
    siteId: number;
}
export async function publishedUnitDictionaryEntriesListByIdAPI(body: IUnitDictionaryEntryBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.publishedUnitDictionaryEntriesById,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedUnitDictionaryEntriesListResponse;
}

export async function formFieldStatusesListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldStatusesList,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldStatusResponse;
}

interface IPreviewDataDictionaryEntryBody extends ICommonDataDictionaryEntryBody {
    isPublished: boolean;
}

export async function previewDataDictionaryEntriesListByIdAPI(
    body: IPreviewDataDictionaryEntryBody,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.previewDataDictionaryEntriesById,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDataDictionaryEntriesListResponse;
}

interface IPreviewUnitDictionaryEntryBody extends ICommonUnitDictionaryEntryBody {
    isPublished: boolean;
}

export async function previewUnitDictionaryEntriesListByIdAPI(
    body: IPreviewUnitDictionaryEntryBody,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.previewUnitDictionaryEntriesById,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedUnitDictionaryEntriesListResponse;
}

interface IFormFieldProgressStatusBody {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: TNullableNumber;
    fieldId: TNullableNumber;
    publishedSubjectFormFieldParentId: TNullableNumber;
    fieldIds: number[];
    publishedSubjectFormFieldChildDetailIds: number[];
    formProgressStatus: string;
    fieldProgressStatus: string;
    label: string;
    fieldValue: string;
    updatedBy: number;
}
export async function changeFormFieldProgressStatusApi(body: IFormFieldProgressStatusBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.changeFormFieldProgressStatus,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IChangeFormFieldStatusResponse;
}

export async function formFieldCaptureSignatureAPI(body: ICaptureSignature) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldCaptureSignature,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICaptureSignatureResponse;
}

export async function subjectCompletionFormSigningAPI(body: ISubjectCompletionFormSigning) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.subjectCompletionFormSigning,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISubjectCompletionFormSigningResponse;
}

export async function publishedSubjectFormFieldDetailAPI(
    body: IPublishedSubjectFormFieldDetail,
    disableGlobalLoader: boolean = false,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.publishedSubjectFormFieldDetails,
        body,
        disableGlobalLoader,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedSubjectFormFieldDetailResponse;
}

export async function formFieldCheckActionAuditAPI(body: IFormFieldCheckActionAuditData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldCheckActionAudit,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCheckActionAuditResponse;
}

export async function formFieldCheckProgressStatusWorkflowAPI(
    publishedSubjectFormFieldParentId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.publishedSubjectFormFieldStatusAuditByParentDetailId,
        pathParams: publishedSubjectFormFieldParentId,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCheckProgressStatusWorkflowResponse;
}

interface IDeletePublishedFormFieldBody {
    publishedSubjectFormFieldParentId: TNullableNumber;
    publishedSubjectFormFieldChildDetailIds: number[];
}
export async function deletePublishedFormFieldsAPI(body: IDeletePublishedFormFieldBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.deleteFormFieldsByParentDetailId,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDeleteFormFieldsByParentDetailIdResponse;
}

interface IFormFieldDetailByIdsBody {
    id: number;
    siteId: number;
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldParentId: number;
    subjectId: number;
    folderId: TNullableNumber;
    formId: number;
}
export async function formFieldDetailsByIdsAPI(body: IFormFieldDetailByIdsBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldDetailsByIds,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDeleteFormFieldsByParentDetailIdResponse;
}

interface IProcessFormFieldEditCheck {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: TNullableNumber;
    publishedSubjectFormFieldParentId: number;
    publishedSubjectFormFieldChildDetailIds: number[];
    isLogForm: boolean;
}
export async function processFormFieldEditCheckAPI(body: IProcessFormFieldEditCheck) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.processFormFieldEditCheck,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldEditCheckResponse;
}

interface IAssignedDerivationBody {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: TNullableNumber;
    publishedSubjectFormFieldParentId: number;
}
export async function assignedDerivationsAPI(body: IAssignedDerivationBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.assignedDerivations,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldDerivationResponse;
}

export async function assignedVisibilityEditChecksAPI(body: IAssignedDerivationBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldVisiblityEditChecks,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldVisibiltyEditCheckResponse;
}

export async function addFormEditChecksAPI(body: IProcessFormFieldEditCheck) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.addFormEditChecks,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldAddFormEditCheckResponse;
}

export async function assignedDisableFieldEditChecksAPI(body: IAssignedDerivationBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.disableFieldEditChecks,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldDisableEditCheckResponse;
}

export async function formFieldCheckActionStatusAPI(body: IFormFieldCheckActionAuditData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.formFieldCheckActionStatus,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCheckActionAuditResponse;
}

export async function assignedNonLogDataValueEditChecksAPI(body: IAssignedDerivationBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataCollection.nonLogDataValueFieldEditChecks,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldNonLogDataEditCheckResponse;
}
