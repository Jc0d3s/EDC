import type { TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISiteGroupData {
    id: number;
    siteGroupName: TNullableString;
    siteDescription: TNullableString;
    assignedSites: TNullableString;
    siteId: number;
    trialId: number;
    updatedBy: number;
}

export interface ISiteGroupListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISiteGroupData[];
}

export interface ICreateSiteGroupResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ISiteGroupPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ISiteGroupData>;
}
