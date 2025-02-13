import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IFieldRestrictionEntryData } from "./field-restriction-types";
import type { IAssignedFieldDerivation, IAssignedFieldEditCheck } from "../../admin/form-field";

export interface IFormFieldData {
    id: number;
    fieldVariableId: TNullableNumber;
    variableId: TNullableNumber;
    formFieldsId: number;
    fieldEditChecksId: TNullableNumber;
    varOID: TNullableString;
    format: TNullableString;
    dictionaryId: TNullableNumber;
    unitDictionaryId: TNullableNumber;
    codingDictionaryId: TNullableNumber;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    trialId: number;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    oid: string;
    name: string;
    fieldNum: string;
    controlType: TNullableNumber;
    isLogDataEntry: boolean;
    isVisible: boolean;
    formId: number;
    helpText: TNullableString;
    requiresTranslation: boolean;
    doesNotParticipateSignature: boolean;
    promptClinicalSignificance: boolean;
    labAnalytics: TNullableNumber;
    indentLevel: number;
    defaultValue: TNullableString;
    sasLabel: TNullableString;
    sasFormat: TNullableString;
    label: string;
    header: string;
    fixedUnit: TNullableString;
    validExtensions: TNullableString;
    isActive: boolean;
    location: string;
    fieldHelpText: TNullableString;
    canSetRecordDate: boolean;
    canSetDatapage: boolean;
    canSetInstanceDate: boolean;
    canSetSubjectDate: boolean;
    showPreviousVisitValues: boolean;
    autoQueryForRequiredDataEntry: boolean;
    autoQueryForNonConformantData: boolean;
    autoQueryForFutureDateTime: boolean;
    autoQueryForDataOutOfRangeLowValue: TNullableNumber;
    autoQueryForDataOutOfRangeHighValue: TNullableNumber;
    markNonConformantDataOutOfRangeLowValue: TNullableNumber;
    markNonConformantDataOutOfRangeHighValue: TNullableNumber;
    fieldRestrictionId: number;
    requiresVerification: boolean;
    manualReviews: IFieldRestrictionEntryData[];
    viewRestrictions: IFieldRestrictionEntryData[];
    entryRestrictions: IFieldRestrictionEntryData[];
    assignedFieldEditChecks: IAssignedFieldEditCheck[];
    assignedFieldDerivations: IAssignedFieldDerivation[];
    updatedBy: number;
}

export interface IControlTypeData {
    id: number;
    name: string;
    updatedBy: number;
}

export interface IFieldVariableData {
    id: number;
    varOID: string;
    fieldId: number;
    format: string;
    dictionaryId: TNullableNumber;
    masterDictionaryName: TNullableString;
    unitDictionaryId: TNullableNumber;
    unitDictionaryName: TNullableString;
    codingDictionaryId: TNullableNumber;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    updatedBy: number;
}

export interface IFormFieldPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IFormFieldData>;
}
export interface IFormFieldListResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormFieldData[];
}

export interface IFormFieldGetByIDResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormFieldData;
}

export interface IFormFieldCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface IControlTypeListResponse extends IApiResponseStatus, IApiResponseData {
    data: IControlTypeData[];
}
export interface IVariableListResponse extends IApiResponseStatus, IApiResponseData {
    data: IFieldVariableData[];
}
