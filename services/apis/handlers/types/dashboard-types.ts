import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IApiResponseData, IApiResponseStatus } from "../../service-call";

export interface ISubjectTrialSitesCountData {
    trialId: number;
    environmentId: number;
    siteId: number;
    subjectId: number;
    type: number;
    folderId: number;
    count: number;
    statusName: string;
    name: TNullableString;
}

export interface ISubjectTrialSitesCountDataResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectTrialSitesCountData[];
}

export interface IAdverseOrConcomitantCountData {
    trialId: number;
    environmentId: number;
    siteId: number;
    subjectId: number;
    type: number;
    folderId: number;
    count: number;
    statusName: TNullableString;
    name: string;
}

export interface IAdverseOrConcomitantCountDataResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IAdverseOrConcomitantCountData[];
}

export interface IFormFieldDiscrepanciesProgressStatusCountData {
    trialId: number;
    environmentId: number;
    siteId: number;
    subjectId: number;
    type: number;
    folderId: number;
    count: number;
    statusName: string;
    name: TNullableString;
}

export interface IFormFieldDiscrepanciesProgressStatusCountDataResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IFormFieldDiscrepanciesProgressStatusCountData[];
}

export interface ISubjectOverDueVisitCountData {
    trialId: number;
    environmentId: number;
    siteId: number;
    subjectId: number;
    type: number;
    folderId: number;
    count: number;
    statusName: TNullableString;
    name: string;
}

export interface ISubjectOverDueVisitCountDataResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: ISubjectOverDueVisitCountData[];
}

export interface ISubjectByTrialAndEnvironment {
    id: number;
    studyId: TNullableNumber;
    statusId: TNullableNumber;
    statusName: TNullableString;
    trialId: TNullableNumber;
    environmentId: TNullableNumber;
    trialName: TNullableString;
    environmentName: TNullableString;
    siteId: TNullableNumber;
    siteIds: number[];
    siteName: TNullableString;
    subjectFormConfigId: TNullableNumber;
    subjectId: TNullableNumber;
    label: TNullableString;
    value: TNullableString;
    fieldValue: string;
    lastUpdated: TNullableString;
    orderNumber: number;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: TNullableString;
    subjectDetails: any[];
    trialVisits: TNullableNumber;
    forms: TNullableNumber;
    updatedBy: number;
}

export interface ISubjectByTrialAndEnvironmentResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: ISubjectByTrialAndEnvironment[];
}

export interface ISiteByTrialAndEnvironment {
    id: number;
    trialId: number;
    environmentId: number;
    siteGroupId: TNullableNumber;
    siteName: string;
    siteNumber: string;
    notes: TNullableString;
    isActive: boolean;
    addressLine1: TNullableString;
    addressLine2: TNullableString;
    addressLine3: TNullableString;
    city: TNullableString;
    state: TNullableString;
    postalCode: TNullableString;
    country: TNullableString;
    telephone: TNullableString;
    investigators: TNullableString;
    therapeuticArea: TNullableString;
    updatedBy: number;
}

export interface ISiteByTrialAndEnvironmentResponse extends IApiResponseStatus, IApiResponseData {
    data: ISiteByTrialAndEnvironment[];
}

export interface IQuickLinkData {
    id: number;
    trialId: number;
    environmentId: number;
    studyId: number;
    page: string;
    pageDetails: TNullableString;
    accessedBy: number;
    accessedOn: string;
}

export interface IQuickLinkListResponse extends IApiResponseStatus, IApiResponseData {
    data: IQuickLinkData[];
}

export interface IQuickLinkCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IDeleteDataEntryQuickLinkResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
