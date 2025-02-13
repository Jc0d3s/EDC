import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ITrialData {
    id: number;
    trialGroupId: number;
    trialGroupName: TNullableString;
    trialName: string;
    ownerId: number;
    ownerName: string;
    protocolNumber: TNullableString;
    drugOrDevice: TNullableString;
    compoundOrcode: TNullableString;
    program: TNullableString;
    protocol: TNullableString;
    phaseId: TNullableNumber;
    phaseName: TNullableString;
    indication: TNullableString;
    enrollmentTarget: TNullableNumber;
    therapeuticAreaId: TNullableNumber;
    therapeuticAreaName: TNullableString;
    liveDate: TNullableString;
    closeDate: string;
    title: TNullableString;
    summary: TNullableString;
    description: TNullableString;
    isProduction: boolean;
    updatedBy: TNullableNumber;
}

export interface ITrialPhaseData {
    id: number;
    name: string;
    updatedBy: number;
}

export interface ITrialPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ITrialData>;
}

export interface ITrialListResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialData[];
}

export interface ICreateTrialResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ITrialByIDResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialData;
}

export interface ITrialPhaseResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialPhaseData[];
}
