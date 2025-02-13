import type { AxiosResponseHeaders } from "axios";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString } from "~/types/common";

export interface IFormFieldDiscrepancy {
    id: number;
    formFieldDiscrepancyId: number;
    publishedSubjectFormFieldChildDetailId: number;
    comments: string;
    status: number;
    type: number;
    updatedBy: number;
    count: number;
    modifiedBy: string;
    modifiedDate: TNullableString;
}

export interface IFormFieldDiscrepancyResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IFormFieldDiscrepancyData {
    id: number;
    publishedSubjectFormFieldChildDetailId: number;
    formFieldDiscrepancyId: number;
    comments: string;
    status: number;
    type: number;
    count: TNullableNumber;
    updatedBy: number;
    modifiedBy: TNullableString;
    modifiedDate: TNullableString;
    user: TNullableString;
}
export interface IDiscrepancyPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IFormFieldDiscrepancyData>;
}

export interface IFormFieldDiscrepancyBadgeCount {
    id: number;
    publishedSubjectFormFieldChildDetailId: number;
    formFieldDiscrepancyId: TNullableNumber;
    comments: TNullableString;
    status: number;
    type: number;
    count: number;
    updatedBy: number;
    modifiedBy: TNullableString;
    modifiedDate: TNullableString;
}

export interface IFormFieldDiscrepancyBadgeCountDetailsResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IFormFieldDiscrepancyBadgeCount;
}

export interface IDiscrepancyManagementData {
    id: number;
    siteId: number;
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldParentId: number;
    formFieldDiscrepancyId: null;
    comments: TNullableString;
    status: number;
    subjectId: number;
    folderId: number;
    formId: number;
    createdByRole: null;
    assignedToRoles: TNullableString;
    statusName: string;
    subjectName: string;
    dateUpdated: TNullableString;
    type: number;
    count: null;
    modifiedBy: TNullableString;
    modifiedDate: TNullableString;
    user: TNullableString;
    updatedBy: number;
}
export interface IDiscrepancyManagementPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IDiscrepancyManagementData>;
}

export interface IDiscrepancyManagementListByIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IDiscrepancyManagementData[];
}

export interface IDiscrepancyManagementExportDataResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: Blob | JSON;
    headers: AxiosResponseHeaders;
}
