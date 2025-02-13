import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IAuditFormFieldValueDetails {
    id: number;
    publishedSubjectFormFieldChildValueDetailId: number;
    fieldValue: string;
    specifiedValue: TNullableString;
    trial: TNullableNumber;
    environment: TNullableNumber;
    subject: TNullableNumber;
}
export interface IAuditFormDetailData {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: number;
    fieldId: number;
    publishedSubjectFormFieldChildDetailId: TNullableNumber;
    publishedSubjectFormFieldParentId: TNullableNumber;
    publishedSubjectDetailId: TNullableNumber;
    orderNumber: number;
    progressStatus: TNullableString;
    label: string;
    fieldValue: TNullableString;
    fieldValueDetails: IAuditFormFieldValueDetails[];
    controlType: number;
    isLogDataEntry: boolean;
    updatedBy: number;
}

export interface IAuditFormData {
    id: number;
    formName: string;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: number;
    formDetails: IAuditFormDetailData[];
    publishedSubjectFormFieldParentId: number;
}

export interface IAuditEntryDetailData {
    id: number;
    publishedSubjectFormFieldChildDetailId: number;
    label: TNullableString;
    fieldValue: string;
    oldValue: TNullableString;
    newValue: TNullableString;
    status: string;
    siteNumber: string;
    siteName: string;
    visit: TNullableString;
    visitDate: TNullableString;
    investigatorName: TNullableString;
}

export interface IAuditHistoryDetailsData {
    id: number;
    publishedSubjectFormFieldChildDetailId: number;
    label: string;
    fieldValue: TNullableString;
    oldValue: TNullableString;
    newValue: TNullableString;
    status: TNullableString;
    siteNumber: TNullableString;
    siteName: TNullableString;
    visit: TNullableString;
    visitDate: TNullableString;
    investigatorName: TNullableString;
    comments: TNullableString;
    role: string;
    activityType: TNullableNumber;
    modifiedDate: string;
    modifiedBy: string;
}

export interface IAuditFormDetailDataResponse extends IApiResponseStatus, IApiResponseData {
    data: IAuditFormData[];
}

export interface IAuditEntryDetailDataResponse extends IApiResponseStatus, IApiResponseData {
    data: IAuditEntryDetailData;
}

export interface IAuditHistoryDetailsPaginationList extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IAuditHistoryDetailsData>;
}
