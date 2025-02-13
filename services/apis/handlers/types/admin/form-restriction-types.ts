import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";
import type { TRestrictionEntry } from "~/types/common";

export interface IFormRestrictionEntryData {
    id: number;
    formRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IFormRestrictionData {
    id: number;
    formId: number;
    formName: string;
    viewRestrictions: IFormRestrictionEntryData[];
    entryRestrictions: IFormRestrictionEntryData[];
    updatedBy: number;
}

export interface IFormRestrictionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormRestrictionData[];
}

export interface ICreateFormRestrictionResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
