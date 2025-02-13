import type { IEmailResponse, TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { IStudyDetailData } from "./study-types";
import type { IStudyUserData } from "./admin/study-user-types";
import type { IStudyUserSiteData } from "./admin/study-user-site-types";

export interface ILoginResponse extends IApiResponseStatus, IApiResponseData {
    data: {
        tokenType: string;
        token: string;
        expiry: string;
    } | null;
}

export interface IUserDetailResponse extends IApiResponseStatus, IApiResponseData {
    data: {
        id: number;
        name: TNullableString;
        orgType: TNullableString;
        firstName: string;
        lastName: TNullableString;
        username: string;
        orgName: TNullableString;
        emailAddress: string;
        lastLoginTime: string;
        roleId: TNullableNumber;
        role: TNullableString;
    } | null;
}

export interface IUserData {
    id: number;
    name: string;
    roleId: number;
    role: string;
    orgType: string;
    isActive: boolean;
    isInternal: boolean;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    enterpriseName: string;
    emailAddress: string;
    lastLoginTime: string;
    updatedBy: number;
}

export interface IUserRoleData extends IUserData {
    displayName: string;
}

export interface IRoleData {
    id: number;
    role: string;
    roleGroupNames: TNullableString;
    description: TNullableString;
    showInEDCPortal: boolean;
    updatedBy: number;
}

export interface IRoleGroupMasterData {
    id: number;
    groupName: string;
    assignedRoles: TNullableString;
    updatedBy: number;
}

export interface IRoleGroupData {
    id: number;
    roleName: string;
    roleDescription: string;
    roleId: number;
    groupId: number;
    groupName: string;
    isActive: boolean;
    updatedBy: number;
}

export interface IUserCreateResponse extends IEmailResponse {
    id: number;
    name: string;
    tempId: string;
    updatedBy: number;
}

export interface ISetPasswordData {
    id: number;
    encodedId: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IChangePasswordData extends ISetPasswordData {
    oldPassword: string;
}

export interface ISetPasswordCreateResponse extends IEmailResponse {
    id: number;
    name: string;
}

export interface IRolePermissionData {
    id: number;
    roleId: number;
    role: string;
    rolePermissionTypeId: number;
    rolePermissionType: string;
    isAccessGranted: boolean;
    updatedBy: number;
}

export interface IOnboardUserData {
    id: number;
    trialId: TNullableNumber;
    environmentId: TNullableNumber;
    siteIds: number[];
    name: string;
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
    emailAddress: string;
    lastLoginTime: TNullableString;
    updatedBy: number;
}

export interface IOnboardStudyUserData extends IStudyUserData {
    siteId: number;
}

export interface IOnboardUserDetailData {
    id: number;
    name: string;
    roleId: number;
    orgType: TNullableString;
    isActive: boolean;
    isInternal: boolean;
    firstName: string;
    lastName: TNullableString;
    username: string;
    password: TNullableString;
    enterpriseName: TNullableString;
    emailAddress: string;
    lastLoginTime: TNullableString;
    updatedBy: number;
    studies: IStudyDetailData;
    studyUsers: IOnboardStudyUserData[];
    studyUserSites: IStudyUserSiteData[];
}

export interface IUserRolePermissionData {
    id: number;
    userId: number;
    userName: TNullableString;
    studyId: number;
    siteId: number;
    roleId: number;
    roleName: string;
    roleDescription: TNullableString;
    trialId: number;
    trialName: TNullableString;
    environmentId: number;
    environmentName: TNullableString;
    updatedBy: number;
}

export interface IUserPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IUserData>;
}

export interface IRolePaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IRoleData>;
}

export interface IRoleGroupMasterPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IRoleGroupMasterData>;
}

export interface IRoleGroupPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IRoleGroupData>;
}

export interface IOnboardUserPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IOnboardUserData>;
}

// export interface IUserGetByIdResponse extends IApiResponseStatus, IApiResponseData {
//     data: IUserData;
// }

export interface ICreateUserResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserCreateResponse | null;
}

export interface ICreateRoleResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ISetPasswordResponse extends IApiResponseStatus, IApiResponseData {
    data: ISetPasswordCreateResponse;
}

export interface IChangePasswordResponse extends IApiResponseStatus, IApiResponseData {
    data: IChangePasswordData;
}

export interface ICreateRoleGroupMasterResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ICreateRoleGroupResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IRoleListResponse extends IApiResponseStatus, IApiResponseData {
    data: IRoleData[];
}

export interface IEnterpriseListResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserData[];
}

export interface IOrganizationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserData[];
}

export interface IUserByRoleListResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserData[];
}

export interface IRolePermissionResponse extends IApiResponseStatus, IApiResponseData {
    data: IRolePermissionData[];
}

export interface IOnboardUserCreateResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserCreateResponse;
}

export interface IOnboardUserDetailsResponse extends IApiResponseStatus, IApiResponseData {
    data: IOnboardUserDetailData;
}

export interface IUserRolePermissionResponse extends IApiResponseStatus, IApiResponseData {
    data: IUserRolePermissionData[];
}

export interface ILogoutResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ITriggerForgotPasswordResponse extends IEmailResponse {
    userId: null;
    emailId: string;
    otp: string;
    name: string;
    newPassword: null;
    oldPassword: null;
    otpExpiry: string;
}

export interface ITriggerForgotPasswordOTP extends IApiResponseStatus, IApiResponseData {
    data: ITriggerForgotPasswordResponse;
}

export interface IVerifyForgotPasswordOTP extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IResetPasswordResponse extends IEmailResponse {
    userId: null;
    emailId: string;
    otp: string;
    name: string;
    newPassword: null;
    oldPassword: null;
    otpExpiry: string;
}

export interface IResetPasswordOTP extends IApiResponseStatus, IApiResponseData {
    data: IResetPasswordResponse;
}
