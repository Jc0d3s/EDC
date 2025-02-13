import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IGlobalUnitDictionaryData {
    id: number;
    name: string;
    numberOfEntries: number;
    hasStandardEntries: boolean;
    updatedBy: number;
}

export interface IGlobalUnitDictionaryEntryData {
    id: number;
    unitDictionaryId: number;
    userDataString: string;
    standard: boolean;
    formula: string;
    dividend: number;
    divisor: number;
    formulaValueOne: number;
    formulaValueTwo: number;
    codedUnit: string;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    updatedBy: number;
}

export interface IGlobalUnitDictionaryPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IGlobalUnitDictionaryData>;
}

export interface IGlobalUnitDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGlobalUnitDictionaryData[];
}

export interface IGlobalUnitDictionaryCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IGlobalUnitDictionaryEntriesCreateResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}

export interface IGlobalUnitDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IGlobalUnitDictionaryEntryData>;
}
