import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IStudySiteInvestigatorData {
    id: number;
    studySiteId: number;
    studySiteInvestigatorId: number;
    userId: number;
    isActive: boolean;
    trialName: string;
    environment: string;
    investigator: string;
    investigatorId: number;
    updatedBy: number;
}

export interface IStudySiteInvestigatorPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IStudySiteInvestigatorData>;
}

export interface IStudySiteInvestigatorCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
