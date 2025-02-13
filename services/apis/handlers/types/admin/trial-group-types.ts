import type { TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ITrialGroupData {
    id: number;
    trialGroupName: TNullableString;
    trialType: TNullableString;
    trialSummary: TNullableString;
    trialDescription: TNullableString;
    updatedBy: number;
}

export interface ITrialGroupPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ITrialGroupData>;
}

export interface ICreateTrialGroupResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ITrialGroupByIDResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialGroupData;
}
