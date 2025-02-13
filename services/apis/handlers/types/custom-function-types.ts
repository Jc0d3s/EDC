import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ICustomFunctionData {
    id: number;
    name: string;
    language: string;
    updatedBy: number;
}

export interface ICustomFunctionPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<ICustomFunctionData>;
}
export interface ICustomFunctionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
