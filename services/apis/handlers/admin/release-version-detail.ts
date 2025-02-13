import { IProcessFormFieldDisableEditCheckResponse } from "./../types/data-collection-types";
import ServiceCall from "~/services/apis/service-call";
import { releaseVersionDetails } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IPublishedAssignMatrixListResponse,
    IPublishedDataDictionaryListResponse,
    IPublishedDerivationActionsListResponse,
    IPublishedDerivationPaginationListResponse,
    IPublishedDerivationStepsListResponse,
    IPublishedDictionaryEntriesPaginationListResponse,
    IPublishedDictionaryPaginationListResponse,
    IPublishedEditCheckActionsListResponse,
    IPublishedEditCheckByReleaseVersionIdResponse,
    IPublishedEditCheckPaginationListResponse,
    IPublishedEditCheckStepsListResponse,
    IPublishedFieldRestrictionListResponse,
    IPublishedFormFieldGetByIDResponse,
    IPublishedFormFieldListResponse,
    IPublishedFormFieldPaginationListResponse,
    IPublishedFormListResponse,
    IPublishedFormPaginationListResponse,
    IPublishedFormRestrictionListResponse,
    IPublishedGlobalFieldRestrictionListResponse,
    IPublishedMatricesPaginationListResponse,
    IPublishedMatrixListResponse,
    IPublishedTrialVisitListResponse,
    IPublishedTrialVisitPaginationListResponse,
    IPublishedUnitDictionaryEntriesPaginationListResponse,
    IPublishedUnitDictionaryListResponse,
    IPublishedUnitDictionaryPaginationListResponse,
} from "../types/admin/release-version-detail-types";
import type {
    IProcessFormFieldDerivationResponse,
    IProcessFormFieldVisibiltyEditCheckResponse,
} from "../types/data-collection-types";

// #region Forms
export async function publishedFormPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.formPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormPaginationListResponse;
}

export async function publishedFormsListByReleaseVersionIdAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.formListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormListResponse;
}
// #endregion Forms

// #region Form Fields
export async function publishedFormFieldPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.formFieldPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormFieldPaginationListResponse;
}

export async function publishedFormFieldsGetByIDAPI(publishedFieldId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...releaseVersionDetails.formFieldDetailsById,
        pathParams: publishedFieldId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormFieldGetByIDResponse;
}

export async function previewPublishedFormFieldsAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.previewFormField,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormFieldListResponse;
}

export async function assignedDerivationsByPublishedFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.assignedDerivations,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldDerivationResponse;
}

export async function fieldVisiblityEditChecksByPublishedFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.fieldVisiblityEditChecks,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldVisibiltyEditCheckResponse;
}

export async function disableFieldEditChecksByPublishedFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.disableFieldEditChecks,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessFormFieldDisableEditCheckResponse;
}
// #endregion Form Fields

// #region Trial Visits
export async function publishedTrialVisitPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.trialVisitPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedTrialVisitPaginationListResponse;
}

export async function publishedTrialVisitListByReleaseVersionIdAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.trialVisitListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedTrialVisitListResponse;
}
// #endregion Trial Visits

// #region Matrices
export async function publishedMatricesPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.matrixPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedMatricesPaginationListResponse;
}

export async function publishedMatrixListByReleaseVersionIdAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.matrixListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedMatrixListResponse;
}

export async function publishedAssignMatricesListByMatrixIdAPI(matrixId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.assignMatrixListByMatrixId,
        pathParams: matrixId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedAssignMatrixListResponse;
}
// #endregion Matrices

// #region Data Dictionaries
export async function publishedDictionaryPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.dataDictionaryPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDictionaryPaginationListResponse;
}

export async function publishedDictionaryListByReleaseVersionIdAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.dataDictionaryListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDataDictionaryListResponse;
}

export async function publishedDictionaryEntriesPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.dataDictionaryEntryPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDictionaryEntriesPaginationListResponse;
}
// #endregion Data Dictionaries

// #region Unit Dictionaries
export async function publishedUnitDictionaryPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.unitDictionaryPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedUnitDictionaryPaginationListResponse;
}

export async function publishedUnitDictionaryListByReleaseVersionIdAPI(releaseVersionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.unitDictionaryListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedUnitDictionaryListResponse;
}

export async function publishedUnitDictionaryEntriesPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.unitDictionaryEntryPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedUnitDictionaryEntriesPaginationListResponse;
}
// #endregion Unit Dictionaries

// #region Form Restriction
export async function publishedFormRestrictionsListByFormIdAPI(publishedFormId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.formRestrictionListByPublishedFormId,
        pathParams: publishedFormId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFormRestrictionListResponse;
}
// #endregion Form Restriction

// #region Field Restriction
export async function publishedFieldRestrictionsListByFormIdAPI(publishedFormId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.fieldRestrictionListByPublishedFormId,
        pathParams: publishedFormId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedFieldRestrictionListResponse;
}
// #endregion Field Restriction

// #region Global Field Restriction
export async function publishedGlobalFieldRestrictionsListByFormIdAPI(publishedFormId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.globalFieldRestrictionListByPublishedFormId,
        pathParams: publishedFormId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedGlobalFieldRestrictionListResponse;
}
// #endregion Global Field Restriction

// #region Edit Checks
export async function editChecksListByReleaseVersionIdAPI(releaseVersionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.editChecksListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedEditCheckByReleaseVersionIdResponse;
}

export async function publishedEditCheckPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.editCheckPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedEditCheckPaginationListResponse;
}

export async function publishedEditCheckStepsListAPI(publishedEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.editCheckStepsList,
        pathParams: publishedEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedEditCheckStepsListResponse;
}

export async function publishedEditCheckActionsListAPI(publishedEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.editCheckActionsList,
        pathParams: publishedEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedEditCheckActionsListResponse;
}
// #endregion Edit Checks

// #region Derivations
export async function derivationsListByReleaseVersionIdAPI(releaseVersionId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.derivationsListByReleaseVersionId,
        pathParams: releaseVersionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedEditCheckByReleaseVersionIdResponse;
}

export async function publishedDerivationPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...releaseVersionDetails.derivationPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDerivationPaginationListResponse;
}

export async function publishedDerivationStepsListAPI(publishedEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.derivationStepsList,
        pathParams: publishedEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDerivationStepsListResponse;
}

export async function publishedDerivationActionsListAPI(publishedEditCheckId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...releaseVersionDetails.derivationActionsList,
        pathParams: publishedEditCheckId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IPublishedDerivationActionsListResponse;
}
// #endregion Derivations
