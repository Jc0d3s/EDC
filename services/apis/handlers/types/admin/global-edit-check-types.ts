import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";

export interface IGlobalEditCheckData {
    id: number;
    name: string;
    byPassDuringMigration: boolean;
    isActive: boolean;
    updatedBy: number;
}

export interface IGlobalEditCheckStepData {
    id: number;
    editCheckLibraryId: number;
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
    checkFunctionId: TNullableNumber;
    checkFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    updatedBy: number;
}

export interface IGlobalEditCheckActionData {
    id: number;
    editCheckLibraryId: number;
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
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    actionMessage: string;
    updatedBy: number;
}

export interface IGlobalEditCheckPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IGlobalEditCheckData>;
}

export interface IGlobalEditCheckCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IGlobalEditCheckStepListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGlobalEditCheckStepData[];
}

export interface IGlobalEditCheckStepCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface IGlobalEditCheckActionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGlobalEditCheckActionData[];
}

export interface IGlobalEditCheckActionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
