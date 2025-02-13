import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { users } from "~/services/apis/admin-routes.json";
import type {
    ICreateRoleGroupMasterResponse,
    ICreateRoleGroupResponse,
    ICreateRoleResponse,
    ICreateUserResponse,
    IEnterpriseListResponse,
    IOrganizationListResponse,
    IRoleData,
    IRoleGroupData,
    IRoleGroupMasterData,
    IRoleGroupMasterPaginationListResponse,
    IRoleGroupPaginationListResponse,
    IRoleListResponse,
    IRolePaginationListResponse,
    IUserByRoleListResponse,
    IUserPaginationListResponse,
} from "../types/user-types";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";

export async function userPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...users.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUserPaginationListResponse;
}

// export async function getUserByIdAPI(userId: string) {
//     const {
//         status = 500,
//         data: { success = false, message = "", validationErrors = null, data = null },
//     } = await ServiceCall({
//         ...users.getByID,
//         pathParams: userId,
//     });

//     return {
//         status,
//         data,
//         success,
//         message,
//         validationErrors,
//     } as IUserGetByIdResponse;
// }

interface IUserBody {
    id: number;
    name: TNullableString;
    roleId: TNullableNumber;
    role: TNullableString;
    orgType: TNullableString;
    isActive: boolean;
    isInternal: boolean;
    firstName: string;
    lastName: TNullableString;
    username: string;
    password: TNullableString;
    enterpriseName: TNullableString;
    emailAddress: TNullableString;
    lastLoginTime: TNullableString;
    updatedBy: number;
}

export async function createUserAPI(body: IUserBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.createUser,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateUserResponse;
}

export async function updateUserAPI(body: IUserBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.updateUser,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateUserResponse;
}

export async function deleteUserByIdAPI(userId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.deleteUser,
        pathParams: userId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateUserResponse;
}

export async function rolePaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...users.rolesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePaginationListResponse;
}

export async function createRoleAPI(body: IRoleData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.createRole,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateRoleResponse;
}

export async function updateRoleAPI(body: IRoleData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.updateRole,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateRoleResponse;
}

export async function deleteRoleByIdAPI(roleId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.deleteRole,
        pathParams: roleId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateUserResponse;
}

export async function rolesListAPI(queryParams?: IQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.listRoles,
        queryParamsType: "questionMark",
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRoleListResponse;
}

export async function organizationsListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.listOrganizations,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOrganizationListResponse;
}

export async function enterprisesListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.listEnterprises,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IEnterpriseListResponse;
}

export async function listUsersByRoleAPI(role: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.listUsersByRole,
        pathParams: role,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUserByRoleListResponse;
}

export async function roleGroupMasterPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...users.roleGroupMasterPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRoleGroupMasterPaginationListResponse;
}

export async function createRoleGroupMasterAPI(body: IRoleGroupMasterData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.createRoleGroupMaster,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateRoleGroupMasterResponse;
}

export async function updateRoleGroupMasterAPI(body: IRoleGroupMasterData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.updateRoleGroupMaster,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateRoleGroupMasterResponse;
}

export async function deleteRoleGroupMasterByIdAPI(roleId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.deleteRoleGroupMaster,
        pathParams: roleId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateUserResponse;
}

export async function roleGroupPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...users.roleGroupsPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRoleGroupPaginationListResponse;
}

export async function assignRoleGroupsAPI(body: IRoleGroupData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.assignRoleGroups,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateRoleGroupResponse;
}

export async function rolesListByGroupNameAPI(roleGroupName: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.rolesListByGroupName,
        pathParams: roleGroupName,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRoleListResponse;
}
