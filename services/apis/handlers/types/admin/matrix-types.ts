import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IMatrixData {
    id: number;
    branchId: number;
    name: string;
    oid: string;
    allowAdd: boolean;
    max: number;
    updatedBy: number;
}

export interface IAssignMatrixData {
    id: number;
    matricesId: number;
    formId: number;
    folderId: number;
    value: boolean;
    formCount: number;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
    updatedBy: number;
}

export type TMatrixRowType = "form" | "folder";
export interface IMatrixReorderData {
    id: number;
    type: TMatrixRowType;
    matricesId: number;
    oldOrderNumber: number;
    newOrderNumber: number;
}

export interface IMatricesPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IMatrixData>;
}

export interface IMatricesListResponse extends IApiResponseStatus, IApiResponseData {
    data: IMatrixData[];
}

export interface IMatricesCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IAssignMatricesListResponse extends IApiResponseStatus, IApiResponseData {
    data: IAssignMatrixData[];
}

export interface IAssignMatricesResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
export interface IChangeMatricesOrderResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
