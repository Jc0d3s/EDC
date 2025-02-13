import ServiceCall from "~/services/apis/service-call";
import { users } from "~/services/apis/portal-routes.json";
import type {
    IChangePasswordData,
    IChangePasswordResponse,
    ILoginResponse,
    ILogoutResponse,
    IOnboardUserCreateResponse,
    IOnboardUserData,
    IOnboardUserDetailsResponse,
    IOnboardUserPaginationListResponse,
    IResetPasswordOTP,
    IRolePermissionResponse,
    ISetPasswordData,
    ISetPasswordResponse,
    ITriggerForgotPasswordOTP,
    IUserDetailResponse,
    IUserRolePermissionResponse,
    IVerifyForgotPasswordOTP,
} from "../types/user-types";
import type { IPaginationListQueryParam } from "~/types/common";

interface ILoginBody {
    username: string;
    password: string;
    enterpriseName: string;
}

export async function loginAPI(body: ILoginBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.login,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ILoginResponse;
}

export async function userDetailsAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.userDetails,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUserDetailResponse;
}

export async function setNewPasswordUserAPI(body: ISetPasswordData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.setNewPassword,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ISetPasswordResponse;
}

export async function changeNewPasswordUserAPI(body: IChangePasswordData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.changePassword,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IChangePasswordResponse;
}

export async function rolePermissionsListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.rolePermissionsList,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IRolePermissionResponse;
}

export async function onboardUsersPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.onboardUsersPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOnboardUserPaginationListResponse;
}

export async function onboardUserCreateAPI(body: IOnboardUserData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.onboardUserCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOnboardUserCreateResponse;
}

export async function onboardUserUpdateAPI(body: IOnboardUserData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.onboardUserUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOnboardUserCreateResponse;
}

export async function detailsByUserIdTrialIdAndEnvironmentIdAPI(
    id: number,
    trialId: number,
    environmentId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.onboardUserDetailsById,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
            id,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IOnboardUserDetailsResponse;
}

export async function rolePermissionsListByTrialIdAndEnvironmentAPI(
    trialId: number,
    environmentId: number,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.rolePermissionsListByTrialIdAndEnvironment,
        queryParamsType: "questionMark",
        queryParams: {
            trialId,
            environmentId,
        },
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUserRolePermissionResponse;
}

interface IRefreshTokenBody {
    token: string;
}
export async function refreshTokenAPI(body: IRefreshTokenBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...users.refreshToken,
        body,
        disableGlobalLoader: true,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ILoginResponse;
}

export async function logoutAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.logout,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ILogoutResponse;
}

interface ITriggerForgotPasswordOTPBody {
    emailId: string;
}
interface ITriggerForgotPasswordResendOTPBody {
    isResend: boolean;
}
export async function triggerForgotPasswordOTPAPI(
    body: ITriggerForgotPasswordOTPBody & ITriggerForgotPasswordResendOTPBody,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.triggerForgotPasswordOTP,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITriggerForgotPasswordOTP;
}

interface IVerifyForgotPasswordOTPBody extends ITriggerForgotPasswordOTPBody {
    otp: string;
}

export async function verifyForgotPasswordOTPAPI(body: IVerifyForgotPasswordOTPBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.verifyForgotPasswordOTP,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IVerifyForgotPasswordOTP;
}

interface IResetPasswordBody extends ITriggerForgotPasswordOTPBody {
    newPassword: string;
    confirmPassword: string;
}

export async function resetPasswordAPI(body: IResetPasswordBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...users.resetPassword,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IResetPasswordOTP;
}
