import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";
import type { ITrialVisitAndFormDetails } from "../data-collection-types";

export interface IEditCheckData {
    id: number;
    name: string;
    byPassDuringMigration: boolean;
    branchId: number;
    isActive: boolean;
    updatedBy: number;
}

export interface IEditCheckListData extends IEditCheckData {
    isGlobal: boolean;
}

export interface IEditCheckStepData {
    id: number;
    editCheckId: number;
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

export interface IEditCheckActionData {
    id: number;
    editCheckId: number;
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
    actionType: number;
    updatedBy: number;
}

export interface IMasterCheckFunctionData {
    id: number;
    name: string;
    type: number;
    isActive: boolean;
    updatedBy: number;
}

export interface IEditCheckPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IEditCheckData>;
}

export interface IEditCheckListResponse extends IApiResponseStatus, IApiResponseData {
    data: IEditCheckListData[];
}

export interface IEditCheckCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IEditCheckStepListResponse extends IApiResponseStatus, IApiResponseData {
    data: IEditCheckStepData[];
}

export interface IEditCheckStepCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface IEditCheckActionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IEditCheckActionData[];
}

export interface IEditCheckActionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IFormDetailByBranchIdResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialVisitAndFormDetails;
}
export interface IMasterCheckFunctionResponse extends IApiResponseStatus, IApiResponseData {
    data: IMasterCheckFunctionData[];
}
