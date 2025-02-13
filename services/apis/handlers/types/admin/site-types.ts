import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISiteData {
    id: number;
    trialId: number;
    siteGroupId: TNullableNumber;
    siteName: TNullableString;
    siteNumber: TNullableString;
    notes: TNullableString;
    addressLine1: TNullableString;
    addressLine2: TNullableString;
    addressLine3: TNullableString;
    city: TNullableString;
    country: TNullableString;
    postalCode: TNullableString;
    state: TNullableString;
    telephone: TNullableString;
    isActive: boolean;
    investigators: TNullableString;
    therapeuticArea: TNullableString;
    updatedBy: number;
}

export interface IPublishedSiteData {
    id: number;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    siteId: number;
    siteName: string;
    siteNumber: string;
    updatedBy: number;
}

export interface ISiteListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISiteData[];
}

export interface ICreateSiteResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ISitePaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ISiteData>;
}

export interface ISiteListByStudyIdResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedSiteData[];
}
