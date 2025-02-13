import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IStudyUserData {
    id: number;
    studyId: number;
    roleId: number;
    roleName: string;
    userId: number;
    userName: string;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    roleDescription: string;
    updatedBy: number;
}

export interface IStudyUserPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IStudyUserData>;
}

export interface IStudyUserCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
