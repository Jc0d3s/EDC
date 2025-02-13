import type { TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISubjectFormConfigData {
    id: number;
    trialId: number;
    label: string;
    controlTypeId: number;
    helpText: TNullableString;
    format: TNullableString;
    isSpecify: boolean;
    isMandatory: boolean;
    isActive: boolean;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    subjectDetailsId: number;
    subjectId: number;
    subjectFormConfigId: number;
    fieldValue: TNullableString;
    readOnly: boolean;
    defaultValue: TNullableString;
    updatedBy: number;
}

export interface ISubjectFormConfigPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ISubjectFormConfigData>;
}
export interface ISubjectFormConfigListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectFormConfigData[];
}
export interface ISubjectFormConfigCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
