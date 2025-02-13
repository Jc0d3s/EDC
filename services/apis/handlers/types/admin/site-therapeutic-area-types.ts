import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISiteTherapeuticArea {
    id: number;
    siteId: number;
    therapeuticAreaId: number;
    isActive: boolean;
    siteName: string;
    trialTherapeuticAreaId: number;
    trialTherapeuticArea: string;
    updatedBy: number;
}

export interface ISiteTheraperuticAreaPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ISiteTherapeuticArea>;
}

export interface ISiteTheraperuticAreaCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
