import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";
import type { IReleaseVersionData } from "./admin/release-version-types";

export interface IEnvironmentDetail {
    id: number;
    trialId: number;
    environment: string;
    isActive: boolean;
    enrollmentTarget: TNullableNumber;
    startDate: TNullableString;
    updatedBy: number;
}

export interface ITrialEnvironmentDetailData {
    id: number;
    trialId: number;
    trialGroupId: number;
    trialGroupName: TNullableString;
    trialName: string;
    ownerId: TNullableNumber;
    ownerName: TNullableString;
    enterPriseName: TNullableString;
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
    closeDate: TNullableString;
    title: string;
    summary: string;
    description: string;
    isProduction: boolean;
    environmentDetails: IEnvironmentDetail[];
    updatedBy: number;
}

export interface ITrialEnvironmentDetailsListResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialEnvironmentDetailData[];
}

export interface IStudyDetailData {
    id: number;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    siteId: TNullableNumber;
    siteName: TNullableString;
    siteNumber: TNullableNumber;
    updatedBy: number;
}

export interface IStudyTrialData {
    id: number;
    trialId: TNullableNumber;
    studyId: number;
    trialGroupId: number;
    trialGroupName: TNullableString;
    trialName: string;
    ownerId: TNullableNumber;
    ownerName: TNullableString;
    enterPriseName: TNullableString;
    protocolNumber: string;
    drugOrDevice: string;
    compoundOrcode: string;
    program: string;
    protocol: TNullableString;
    phaseId: number;
    phaseName: TNullableString;
    indication: string;
    enrollmentTarget: number;
    therapeuticAreaId: TNullableString;
    therapeuticAreaName: TNullableString;
    liveDate: TNullableString;
    closeDate: TNullableString;
    title: string;
    summary: string;
    description: string;
    isProduction: boolean;
    environmentDetails: TNullableString;
    updatedBy: number;
}

export interface IStudyEnvironmentData {
    id: number;
    trialId: number;
    studyId: number;
    environment: string;
    isActive: boolean;
    enrollmentTarget: TNullableNumber;
    startDate: TNullableString;
    updatedBy: number;
}

export interface IStudyDetailByTrialAndEnvironmentIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IStudyDetailData;
}

export interface IStudyTrialsListResponse extends IApiResponseStatus, IApiResponseData {
    data: IStudyTrialData[];
}

export interface IStudyEnvironmentsListResponse extends IApiResponseStatus, IApiResponseData {
    data: IStudyEnvironmentData[];
}

export interface IStudyLatestReleaseVersionDetailsResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IReleaseVersionData;
}
