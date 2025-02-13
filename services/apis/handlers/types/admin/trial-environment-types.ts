import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ITrialEnvironmentData {
    id: TNullableNumber;
    trialId: number;
    environment: TNullableString;
    isActive: boolean;
    enrollmentTarget: TNullableNumber;
    startDate: TNullableString;
    updatedBy: TNullableNumber;
}

export interface ITrialEnvironmentResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialEnvironmentData[];
}

export interface ITrialEnvironmentPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ITrialEnvironmentData>;
}

export interface ICreateTrialEnvironmentResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
