import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableString } from "~/types/common";

export interface IEmailAlertData {
    id: number;
    branchId: number;
    alertName: string;
    effectiveDate: string;
    days: number;
    defaultLocale: string;
    updatedBy: number;
}

export interface IEmailAlertTemplateData {
    id: number;
    emailAlertConfigId: number;
    to: string;
    cc: TNullableString;
    bcc: TNullableString;
    subject: string;
    body: string;
    updatedBy: number;
}

export interface IEmailAlertPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IEmailAlertData>;
}

export interface IEmailAlertCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IEmailTemplateDetaisByEmailConfigIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IEmailAlertTemplateData;
}

export interface IEmailTemplateCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
