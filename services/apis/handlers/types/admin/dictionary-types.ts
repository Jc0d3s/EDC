import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IDictionaryData {
    id: number;
    branchId: number;
    name: string;
    numberOfEntries: number;
    updatedBy: number;
}

export interface IDictionaryListData extends IDictionaryData {
    isGlobal: boolean;
}

export interface IDictionaryEntryData {
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

export interface IDictionaryPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IDictionaryData>;
}

export interface IDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IDictionaryListData[];
}

export interface IDictionaryCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IDictionaryEntriesCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IDictionaryEntryData>;
}
