import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IBranchData {
    id: number;
    trialId: number;
    branchName: TNullableString;
    confirmationMessage: TNullableString;
    isGlobal: boolean;
    defaultMatrix: TNullableNumber;
    defaultMatrixName: TNullableString;
    primaryForm: TNullableNumber;
    primaryFormName: TNullableString;
    signaturePrompt: TNullableString;
    updatedBy: number;
}

export interface IBranchSummaryCountData {
    branchId: number;
    forms: number;
    formsUpdated: string;
    fields: number;
    fieldsUpdated: string;
    variables: number;
    variablesUpdated: string;
    folders: number;
    foldersUpdated: string;
    matrices: number;
    matricesUpdated: string;
    dataDictionaries: number;
    dataDictionariesUpdated: string;
    unitDictionaries: number;
    unitDictionariesUpdated: string;
    editChecks: number;
    editChecksUpdated: string;
    derivations: number;
    derivationsUpdated: string;
    labVariableMappings: number;
    labVariableMappingsUpdated: string;
    customFunctions: number;
    customFunctionsUpdated: string;
}

export interface IBranchPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IBranchData>;
}
export interface IBranchListResponse extends IApiResponseStatus, IApiResponseData {
    data: IBranchData[];
}

export interface IBranchCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IBranchByIDResponse extends IApiResponseStatus, IApiResponseData {
    data: IBranchData;
}

export interface IBranchSummaryCountByBranchIDResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IBranchSummaryCountData;
}
