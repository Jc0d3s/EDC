import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type {
    IEmailResponse,
    TNullableDate,
    TNullableNumber,
    TNullableString,
} from "~/types/common";

export interface ISubjectSiteTransferData {
    id: number;
    subjectId: number;
    subjectName: string;
    fromSiteId: number;
    fromSiteName: string;
    fromSiteNumber: string;
    toSiteId: number;
    toSiteName: string;
    toSiteNumber: string;
    approvalStatus: string;
    transferRequestedOn: TNullableDate;
    transferredOn: TNullableDate;
    transferredBy: TNullableNumber;
    transferredByName: TNullableString;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    updatedBy: number;
}

export interface ISubjectTransferCreateResponse extends IEmailResponse {
    id: number;
    emailAlertConfigId: number;
    toName: TNullableString;
    tempId: string;
    fromSiteName: string;
    toSiteName: string;
    subjectName: string;
    action: string;
    actionDateTime: string;
    updatedBy: number;
}

export interface ISubjectSiteTransferPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ISubjectSiteTransferData>;
}
export interface ISubjectSiteTransferCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectTransferCreateResponse | null;
}
export interface ISubjectSiteTransferDetailsByIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: ISubjectSiteTransferData;
}
