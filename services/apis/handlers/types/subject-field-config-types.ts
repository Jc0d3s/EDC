import type { TNullableNumber } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ISubjectFieldConfigData {
    id: number;
    trialId: number;
    orderNumber: number;
    folderId: TNullableNumber;
    formId: number;
    fieldId: number;
    isSummary: boolean;
    isHeader: boolean;
    isSearch: boolean;
    searchValue: string;
    oldOrderNumber: number;
    newOrderNumber: number;
    updatedBy: number;
}

export interface ISubjectFieldConfigPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ISubjectFieldConfigData>;
}
export interface ISubjectFieldConfigCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
