import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IStudySiteData {
    id: number;
    siteId: number;
    studyId: number;
    trialId: number;
    trialEnvironmentId: number;
    trialName: string;
    environment: string;
    updatedBy: number;
}

export interface IStudySitePaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IStudySiteData>;
}

export interface IStudySiteCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
