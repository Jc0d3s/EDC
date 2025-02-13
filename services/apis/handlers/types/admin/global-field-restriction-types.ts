import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";
import type { TRestrictionEntry } from "~/types/common";

export interface IGlobalFieldRestrictionEntryData {
    id: number;
    globalFieldRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IGlobalFieldRestrictionData {
    id: number;
    formId: number;
    formName: string;
    requiresVerification: boolean;
    manualReviews: IGlobalFieldRestrictionEntryData[];
    viewRestrictions: IGlobalFieldRestrictionEntryData[];
    entryRestrictions: IGlobalFieldRestrictionEntryData[];
    updatedBy: number;
}

export interface IGlobalFieldRestrictionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGlobalFieldRestrictionData[];
}

export interface ICreateGlobalFieldRestrictionResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}
