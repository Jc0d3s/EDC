import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ITrialSiteData {
    id: number;
    trialId: number;
    trialSiteId: number;
    siteId: number;
    isAssigned: boolean;
    hospitalId: number;
    siteName: string;
    siteNumber: string;
    siteGroupId: TNullableNumber;
    siteGroupName: TNullableString;
    notes: TNullableString;
    addressLine1: TNullableString;
    addressLine2: TNullableString;
    addressLine3: TNullableString;
    city: TNullableString;
    state: TNullableString;
    country: TNullableString;
    updatedBy: number;
}

export interface ITrialSitePaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ITrialSiteData>;
}

export interface ITrialSiteListResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialSiteData[];
}

export interface IUpdateTrialSiteResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
