import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISiteTherapeuticAreaInvestigator {
    id: number;
    siteTherapeuticAreaId: number;
    userId: number;
    isActive: boolean;
    sitename: string;
    therapeuticArea: string;
    name: string;
    username: string;
    updatedBy: number;
}

export interface ISiteTheraperuticAreaInvestigatorPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ISiteTherapeuticAreaInvestigator>;
}

export interface ISiteTheraperuticAreaInvestigatorCreateResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}
