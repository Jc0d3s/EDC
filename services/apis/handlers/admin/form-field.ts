import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { formFields } from "~/services/apis/admin-routes.json";
import type {
    IControlTypeListResponse,
    IFormFieldCreateResponse,
    IFormFieldData,
    IFormFieldGetByIDResponse,
    IFormFieldListResponse,
    IFormFieldPaginationListResponse,
    IVariableListResponse,
} from "../types/admin/form-field-types";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";
import type { IFieldRestrictionEntryData } from "../types/admin/field-restriction-types";
import type {
    IProcessFormFieldDerivationResponse,
    IProcessFormFieldVisibiltyEditCheckResponse,
    IProcessFormFieldDisableEditCheckResponse,
} from "../types/data-collection-types";

export async function formFieldPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...formFields.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldPaginationListResponse;
}

export async function formFieldListByTrialIdAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.listByTrialId,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldListResponse;
}

export async function formFieldListByFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.listByFormId,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldListResponse;
}

export interface IAssignedFieldEditCheck {
    id: number;
    fieldId: number;
    editCheckId: number;
    isGlobal: boolean;
    updatedBy: number;
}

export interface IAssignedFieldDerivation {
    id: number;
    fieldId: number;
    derivationId: number;
    isGlobal: boolean;
    updatedBy: number;
}

interface IFormFieldBody {
    id: number;
    fieldVariableId: TNullableNumber;
    branchId: number;
    variableId: TNullableNumber;
    formFieldsId: number;
    fieldEditChecksId: TNullableNumber;
    varOID: TNullableString;
    dictionaryId: TNullableNumber;
    unitDictionaryId: TNullableNumber;
    codingDictionaryId: TNullableNumber;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    oid: string;
    name: string;
    fieldNum: TNullableString;
    controlType: number;
    isLogDataEntry: boolean;
    isVisible: boolean;
    formId: number;
    helpText: TNullableString;
    requiresTranslation: boolean;
    doesNotParticipateSignature: boolean;
    promptClinicalSignificance: boolean;
    labAnalytics: TNullableNumber;
    defaultValue: TNullableString;
    sasLabel: TNullableString;
    sasFormat: TNullableString;
    label: TNullableString;
    header: TNullableString;
    fixedUnit: TNullableString;
    validExtensions: TNullableString;
    format: TNullableString;
    isActive: boolean;
    location: TNullableString;
    fieldHelpText: TNullableString;
    canSetRecordDate: boolean;
    canSetDatapage: boolean;
    canSetInstanceDate: boolean;
    canSetSubjectDate: boolean;
    showPreviousVisitValues: boolean;
    trialId: number;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    indentLevel: number;
    autoQueryForRequiredDataEntry: boolean;
    autoQueryForNonConformantData: boolean;
    autoQueryForFutureDateTime: boolean;
    autoQueryForDataOutOfRangeLowValue: TNullableNumber;
    autoQueryForDataOutOfRangeHighValue: TNullableNumber;
    markNonConformantDataOutOfRangeLowValue: TNullableNumber;
    markNonConformantDataOutOfRangeHighValue: TNullableNumber;
    // fieldRestrictionId: number;
    requiresVerification: boolean;
    manualReviews: IFieldRestrictionEntryData[];
    viewRestrictions: IFieldRestrictionEntryData[];
    entryRestrictions: IFieldRestrictionEntryData[];
    assignedFieldEditChecks: IAssignedFieldEditCheck[];
    assignedFieldDerivations: IAssignedFieldDerivation[];
    updatedBy: number;
}

export async function formFieldsCreateAPI(body: IFormFieldBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCreateResponse;
}

export async function formFieldsUpdateAPI(body: IFormFieldBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCreateResponse;
}

export async function controlTypesListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.listControlTypes,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IControlTypeListResponse;
}

export async function variablesListByVarOIDAndFieldIdAPI(
    queryParams: IQueryParam,
    disableGlobalLoader: boolean,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.listByVarOIDAndFieldId,
        queryParamsType: "questionMark",
        queryParams,
        disableGlobalLoader,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IVariableListResponse;
}

export async function reorderFormFieldsAPI(body: IFormFieldData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...formFields.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCreateResponse;
}

export async function formFieldsGetByIDAPI(fieldId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...formFields.getByID,
        pathParams: fieldId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldGetByIDResponse;
}

export async function deleteFieldByIdAPI(fieldId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...formFields.delete,
        pathParams: fieldId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldCreateResponse;
}

export async function previewFormFieldsAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.preview,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldListResponse;
}

export async function assignedDerivationsByFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.assignedDerivations,
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

export async function fieldVisiblityEditChecksByFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.fieldVisiblityEditChecks,
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

export async function disableFieldEditChecksByFormIdAPI(formId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formFields.disableFieldEditChecks,
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
