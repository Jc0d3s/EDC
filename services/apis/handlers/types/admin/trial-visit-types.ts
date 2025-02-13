import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface ITrialVisit {
    id: number;
    branchId: number;
    name: string;
    oid: string;
    // parentFolder: TNullableNumber;
    access: number;
    start: number;
    target: number;
    end: number;
    overDue: number;
    close: number;
    reusable: boolean;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    updatedBy: number;
}

export interface ITrialVisitPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<ITrialVisit>;
}
export interface ITrialVisitListResponse extends IApiResponseStatus, IApiResponseData {
    data: ITrialVisit[];
}

export interface ITrialCreateVisitResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
