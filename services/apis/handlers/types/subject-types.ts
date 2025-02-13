import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TModelValue } from "~/types/form-generation";
import type { ITrialVisitAndFormDetails } from "./data-collection-types";
import type { AxiosResponseHeaders } from "axios";

export interface ISubjectDetail {
    id: number;
    subjectId: number;
    subjectFormConfigId: number;
    fieldValue: TModelValue;
    updatedBy: number;
    label: string;
    orderNumber: number;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: TNullableString;
}
export interface ISubjectData {
    id: number;
    studyId: number;
    trialId: number;
    trialName: string;
    // environmentId: number;
    // environmentName: string;
    lastUpdated: TNullableString;
    statusId: TNullableNumber;
    statusName: string;
    siteId: number;
    siteName: string;
    subjectFormConfigId: number;
    subjectId: number;
    label: string;
    value: string;
    fieldValue: string;
    orderNumber: number;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: string;
    subjectDetails: ISubjectDetail[];
    dynamicProperties: Record<string, TNullableString>;
    updatedBy: number;
}

export interface IDeactivatedFormData {
    id: number;
    formId: number;
    folderId: TNullableNumber;
}

export interface IConditionalFormData {
    conditionalForms: ITrialVisitAndFormDetails;
}

export interface IConditionalForms {
    conditionalForms: ITrialVisitAndFormDetails[];
}

export interface IDeactivatedForms {
    deactivatedForms: IDeactivatedFormData[];
}

export interface ISubjectDetailPaginationList
    extends ISubjectData,
        ITrialVisitAndFormDetails,
        IConditionalForms,
        IDeactivatedForms {}

export interface ISubjectPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ISubjectData>;
}
export interface ISubjectCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface ISubjectDetailResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectData;
}

export interface ISubjectListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectData[];
}

export interface ISubjectDetailPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ISubjectDetailPaginationList>;
}

export interface IChangeSubjectStatus {
    id: number;
    studyId: number;
    statusId: number;
    statusName: string;
    trialId: number;
    environmentId: number;
    trialName: TNullableString;
    environmentName: TNullableString;
    siteId: number;
    siteName: TNullableString;
    subjectFormConfigId: number;
    subjectId: number;
    label: TNullableString;
    value: TNullableString;
    fieldValue: TNullableString;
    lastUpdated: TNullableString;
    orderNumber: number;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: TNullableString;
    subjectDetails: any[];
    forms: any[];
    updatedBy: number;
}

export interface IChangeSubjectStatusResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IAddVisit {
    id: number;
    branchId: number;
    trialId: number;
    environmentId: number;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    name: string;
    oid: string;
    parentFolder: TNullableNumber;
    access: number;
    start: number;
    target: number;
    end: number;
    overDue: number;
    close: number;
    reusable: boolean;
    updatedBy: number;
}

export interface IAddVisitResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IAddEvent {
    id: number;
    trialId: number;
    environmentId: number;
    folderId: number;
    formId: number;
    formCount: number;
    updatedBy: number;
}

export interface IAddEventResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ISubjectStatus {
    id: number;
    statusName: string;
    orderNumber: number;
    updatedBy: number;
}
export interface ISubjectStatusResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectStatus[];
}

export interface ICopySubjectResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IOnboardSubjectExportDataResponse extends IApiResponseStatus, IApiResponseData {
    data: Blob | JSON; // IPublishedExportData;
    headers: AxiosResponseHeaders;
}

export interface IUpdateFormActivationResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ISubjectFormActivationListData {
    id: number;
    trialId: 0;
    environmentId: 0;
    subjectId: number;
    formId: number;
    folderId: number;
}
export interface ISubjectFormActivationListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectFormActivationListData[];
}
