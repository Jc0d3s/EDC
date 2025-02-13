import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";

export interface IDerivationDataAppliedVariable {
    folderName: TNullableString;
    formName: TNullableString;
    fieldName: TNullableString;
    variableName: TNullableString;
}
export interface IDerivationData {
    id: number;
    branchId: number;
    isGlobal: boolean;
    name: string;
    byPassDuringMigration: boolean;
    isActive: boolean;
    appliedVariable: IDerivationDataAppliedVariable[];
    updatedBy: number;
}

export interface IDerivationStepData {
    id: number;
    derivationId: number;
    stepOrder: number;
    type: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    formRepeatNumber: number;
    folderRepeatNumber: number;
    logicalRecordPosition: string;
    dataValue: TNullableString;
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    derivationFunctionId: TNullableNumber;
    derivationFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    updatedBy: number;
}
export interface IDerivationActionData {
    id: number;
    derivationId: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    isApplyToAllFolders: boolean;
    isApplyToAllFields: boolean;
    isEnableField: boolean;
    updatedBy: number;
}

export interface IMasterDerivationFunctionData {
    id: number;
    name: string;
    expression: string;
    isActive: boolean;
    updatedBy: number;
}

export interface IDerivationPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IDerivationData>;
}
export interface IDerivationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IDerivationData[];
}
export interface IDerivationCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface IDerivationStepPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IDerivationStepData>;
}
export interface IDerivationActionPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IDerivationActionData>;
}

export interface IMasterDerivationFunctionResponse extends IApiResponseStatus, IApiResponseData {
    data: IMasterDerivationFunctionData[];
}
