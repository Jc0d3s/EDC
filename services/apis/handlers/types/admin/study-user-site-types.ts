import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IStudyUserSiteData {
    id: number;
    siteId: number;
    hospitalId: number;
    siteName: string;
    siteNumber: string;
    studyUserId: number;
    isActive: boolean;
    updatedBy: number;
}

export interface IStudyUserSitePaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IStudyUserSiteData>;
}

export interface IStudyUserSiteCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
