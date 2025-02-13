import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IUnitDictionaryData {
    id: number;
    branchId: number;
    name: string;
    numberOfEntries: number;
    hasStandardEntries: boolean;
    updatedBy: number;
}

export interface IUnitDictionaryListData extends IUnitDictionaryData {
    isGlobal: boolean;
}

export interface IUnitDictionaryEntryData {
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

export interface IUnitDictionaryPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IUnitDictionaryData>;
}

export interface IUnitDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IUnitDictionaryListData[];
}

export interface IUnitDictionaryCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IUnitDictionaryEntriesCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IUnitDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IUnitDictionaryEntryData>;
}
