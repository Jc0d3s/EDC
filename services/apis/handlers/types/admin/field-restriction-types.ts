import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";
import type { TNullableString, TRestrictionEntry } from "~/types/common";

export interface IFieldRestrictionEntryData {
    id: number;
    fieldRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IFieldRestrictionData {
    id: number;
    formId: number;
    formName: string;
    fieldId: number;
    fieldName: string;
    requiresVerification: boolean;
    defaultValue: TNullableString;
    manualReviews: IFieldRestrictionEntryData[];
    viewRestrictions: IFieldRestrictionEntryData[];
    entryRestrictions: IFieldRestrictionEntryData[];
    updatedBy: number;
}

export interface IFieldRestrictionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IFieldRestrictionData[];
}

export interface ICreateFieldRestrictionResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
