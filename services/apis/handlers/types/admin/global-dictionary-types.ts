import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IGlobalDictionaryData {
    id: number;
    name: string;
    numberOfEntries: number;
    updatedBy: number;
}

export interface IGlobalDictionaryEntryData {
    id: number;
    dataDictionaryId: number;
    userDataString: string;
    specify: boolean;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    codedData: string;
    updatedBy: number;
}

export interface IGlobalDictionaryPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IGlobalDictionaryData>;
}

export interface IGlobalDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGlobalDictionaryData[];
}

export interface IGlobalDictionaryCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IGlobalDictionaryEntriesCreateResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}

export interface IGlobalDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IGlobalDictionaryEntryData>;
}
