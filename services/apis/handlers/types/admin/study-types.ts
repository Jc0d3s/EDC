import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";

export interface IStudyData {
    id: number;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    updatedBy: number;
}

export interface IStudyListResponse extends IApiResponseStatus, IApiResponseData {
    data: IStudyData[];
}
