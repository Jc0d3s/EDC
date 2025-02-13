import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IRolePermissionTypeData {
    id: number;
    type: string;
    updatedBy: number;
}

export interface IRolePermissionData {
    id: number;
    roleId: number;
    rolePermissionTypeId: number;
    isAccessGranted: boolean;
    updatedBy: number;
}

export interface IRolePermissionTypePaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IRolePermissionTypeData>;
}

export interface IRolePermissionTypeListResponse extends IApiResponseStatus, IApiResponseData {
    data: IRolePermissionTypeData[];
}

export interface IRolePermissionTypeCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IRolePermissionListResponse extends IApiResponseStatus, IApiResponseData {
    data: IRolePermissionData[];
}
export interface IRolePermissionCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
