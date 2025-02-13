import ServiceCall from "~/services/apis/service-call";
import { rolePermissionTypes } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IRolePermissionTypeData,
    IRolePermissionTypeCreateResponse,
    IRolePermissionTypeListResponse,
    IRolePermissionTypePaginationListResponse,
    IRolePermissionListResponse,
    IRolePermissionCreateResponse,
    IRolePermissionData,
} from "../types/admin/role-permission-type-types";

export async function rolePermissionTypePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...rolePermissionTypes.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionTypePaginationListResponse;
}

export async function rolePermissionTypeListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...rolePermissionTypes.listAll,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionTypeListResponse;
}

export async function createRolePermissionTypeAPI(body: IRolePermissionTypeData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...rolePermissionTypes.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionTypeCreateResponse;
}

export async function updateRolePermissionTypeAPI(body: IRolePermissionTypeData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...rolePermissionTypes.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionTypeCreateResponse;
}

export async function deleteRolePermissionTypeByIdAPI(rolePermissionTypeId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...rolePermissionTypes.delete,
        pathParams: rolePermissionTypeId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionTypeCreateResponse;
}

export async function rolePermissionListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...rolePermissionTypes.listAllRolePermissions,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionListResponse;
}

export async function assignRolePermissionAPI(body: IRolePermissionData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...rolePermissionTypes.assignRolePermissions,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionCreateResponse;
}
