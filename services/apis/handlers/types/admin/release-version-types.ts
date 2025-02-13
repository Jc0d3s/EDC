import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";

export interface IReleaseVersionData {
    id: number;
    branchId: number;
    releaseVersionId: number;
    releaseVersionName: string;
    updatedBy: number;
}

export interface IReleaseVersionSummaryCountData {
    releaseVersionId: number;
    publishedForms: number;
    publishedFormsUpdated: string;
    publishedFields: number;
    publishedFieldsUpdated: string;
    publishedVariables: number;
    publishedVariablesUpdated: string;
    publishedFolders: number;
    publishedFoldersUpdated: string;
    publishedMatrices: number;
    publishedMatricesUpdated: string;
    publishedDataDictionaries: number;
    publishedDataDictionariesUpdated: string;
    publishedUnitDictionaries: number;
    publishedUnitDictionariesUpdated: string;
    publishedEditChecks: number;
    publishedEditChecksUpdated: string;
    publishedDerivations: number;
    publishedDerivationsUpdated: string;
    publishedLabVariableMappings: number;
    publishedLabVariableMappingsUpdated: string;
    publishedCustomFunctions: number;
    publishedCustomFunctionsUpdated: string;
}

export interface IPushCRFVersion {
    id: number;
    trialId: number;
    environmentId: number;
    releaseVersionId: number;
    siteIds: number[];
    siteGroupIds: number[];
    updatedBy: number;
}

export interface IPublishedVersionData {
    id: number;
    trialId: number;
    environmentId: number;
    releaseVersionId: number;
    siteIds: number[];
    siteGroupIds: number[];
    updatedBy: number;
}

export interface IPublishedReleaseVersionData {
    id: number;
    trialId: number;
    trialName: string;
    releaseVersionId: number;
    releaseVersionName: string;
    confirmationMessage: string;
    lockCRFVersion: boolean;
    isGlobal: boolean;
    signaturePrompt: TNullableString;
    primaryForm: TNullableNumber;
    primaryFormName: TNullableString;
    defaultMatrix: TNullableNumber;
    defaultMatrixName: TNullableString;
    updatedBy: number;
}

export interface IOverwrittenReleaseVersionData {
    id: number;
    releaseVersionId: number;
    overwrittenBy: number;
    name: string;
    overwrittenDate: string;
}

export interface ICRFVersionSiteData {
    id: number;
    trialId: number;
    environmentId: number;
    environmentName: string;
    releaseVersionId: number;
    releaseVersionName: string;
    siteId: number;
    siteName: string;
    defaultCRFVersion: string;
    siteIds: null;
    siteGroupIds: null;
    updatedBy: number;
}

export interface IReleaseVersionPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IReleaseVersionData>;
}
export interface IReleaseVersionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IReleaseVersionData[];
}
export interface IReleaseVersionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IReleaseVersionSummaryCountByBranchIDResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IReleaseVersionSummaryCountData;
}

export interface IPushCRFVersionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IPublishedVersionDetailsResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedVersionData;
}

export interface IPublishedReleaseVersionDetailsResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedReleaseVersionData;
}
export interface IOverwrittenReleaseVersionListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IOverwrittenReleaseVersionData[];
}
export interface ICRFVersionSitePaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ICRFVersionSiteData>;
}
