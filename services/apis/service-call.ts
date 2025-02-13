import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from "axios";
import getEnvironmentVariables, { EnvLabel } from "~/config/env-variables";
import useLoaderStore from "~/stores/loader";
import useUserStore, { type IAuth } from "~/stores/user";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";

type TQueryParamType = "questionMark" | "backslash";

export interface IQueryParam {
    [key: string]: TNullableString | TNullableNumber;
}

type TAxiosOptions = {
    endpoint: string;
    method: string;
    body?: any;
    pathParams?: string | number;
    queryParams?: IPaginationListQueryParam | IQueryParam;
    queryParamsType?: TQueryParamType;
    action?: string; // "download" | "upload"
    disableGlobalLoader?: boolean;
    responseType?: ResponseType;
};

export interface IApiResponseStatus {
    status: number;
}

export interface IApiResponseData {
    message: string;
    success: boolean;
    validationErrors: Record<string, string> | null;
}

export interface IApiPagedResponseData<T> {
    page: number;
    countPerPage: number;
    total: number;
    items: T[];
}

export async function triggerLogout(showLogoutMessage: boolean = false) {
    const route = useRoute();
    const userStore = useUserStore();
    const isAdminRoute = getAppType() === "admin";
    if (!userStore.isLogoutTriggered) {
        if (isAdminRoute && route.path !== "/admin/login") {
            log("info", ["admin logout"]);
            await userStore.logout("admin", showLogoutMessage);
        } else if (!isAdminRoute && route.path !== "/login") {
            log("info", ["portal logout"]);
            await userStore.logout("portal", showLogoutMessage);
        }
    }
}

// action: "none" | "download" | "upload"
function getHeaders(action?: string) {
    const headers: { [key: string]: string } = {
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Methods": "POST, GET, PUT, OPTIONS, DELETE",
        // "Access-Control-Allow-Headers": "*",
        // Accept: "application/json",
        // "Content-Type": "application/json",
    };
    if (action === "download") {
        //
    } else {
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
    }
    // headers["Accept"] = "application/*";
    // headers["Content-Type"] = "multipart/form-data";

    const authDetailsLocalStorage = getFromLocalStorage(TLocalStorageKeys.auth);
    if (authDetailsLocalStorage) {
        const authDetails = decodeData(authDetailsLocalStorage) as IAuth;
        headers.authorization = `${authDetails.tokenType} ${authDetails.token}`;
    }
    return headers;
}

export const generateApiEndPoint = ({
    endpoint,
    pathParams,
    queryParams,
    queryParamsType = "backslash",
}: {
    endpoint: string;
    pathParams?: string | number;
    queryParams?: IPaginationListQueryParam | IQueryParam; // IQueryParam;
    queryParamsType?: TQueryParamType;
}) => {
    const baseURL = getEnvironmentVariables(EnvLabel.apiBaseURL);
    let url = `${baseURL}/api/${endpoint}`;

    if (pathParams) url = `${url}/${pathParams}`;

    if (queryParams) {
        const queryParamSeperator = queryParamsType === "questionMark" ? "?" : "/";
        const params: string[] = [];
        if (queryParamsType === "backslash") {
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== undefined && value !== null) {
                    if (["filter", "orderBy"].includes(key)) {
                        params.push(`${key}=${JSON.stringify(value)}`); // FIXME: revert once API is changed
                        // let dataString = "";
                        // let index = 0;
                        // for (const [dataKey, dataValue] of Object.entries(value)) {
                        //     if (index === Object.entries(value).length - 1)
                        //         dataString += `${dataKey}:${dataValue}`;
                        //     else dataString += `${dataKey}:${dataValue},`;
                        //     index++;
                        // }
                        // params.push(`${key}=${dataString}`);
                    } else {
                        params.push(`${key}=${value}`);
                    }
                }
            }
        } else {
            const keyValueQueryParam = queryParams as IQueryParam;
            Object.keys(keyValueQueryParam).forEach((key) => {
                if (keyValueQueryParam[key] !== undefined && keyValueQueryParam[key] !== null)
                    params.push(`${key}=${String(keyValueQueryParam[key])}`);
            });
            // if (getArrayLength(params) > 0) url = `${url}?${params.join("&")}`;
        }
        if (getArrayLength(params) > 0) url = `${url}${queryParamSeperator}${params.join("&")}`;
    }
    return url;
};

export default async function ServiceCall({
    endpoint,
    method,
    body,
    pathParams,
    queryParams,
    queryParamsType = "backslash",
    action = undefined,
    disableGlobalLoader = false,
    responseType = "json",
}: TAxiosOptions) {
    const loaderStore = useLoaderStore();
    const url = generateApiEndPoint({
        endpoint,
        pathParams,
        queryParams,
        queryParamsType,
    });
    const loaderId = btoa(`${url}#$%${new Date().getTime()}`);
    if (!disableGlobalLoader) loaderStore.show(loaderId);

    const headers = getHeaders(action);
    const options: AxiosRequestConfig<any> = {
        method,
        headers,
        responseType,
    };
    if (body) options.data = body;

    try {
        const response: AxiosResponse = await axios({
            url,
            ...options,
        });

        if (!disableGlobalLoader) loaderStore.hide(loaderId);
        return {
            status: response.status,
            data: responseType === "blob" ? response.data : deepClone(response.data),
            headers: response.headers,
        };
    } catch (error: any) {
        if (!disableGlobalLoader) loaderStore.hide(loaderId);
        // const axiosError = error as AxiosError;
        log("error", [`error in ServiceCall for endpoint -> ${endpoint}`, error]);
        if (error.response.status === 401 && !url.toLowerCase().includes("logout")) {
            if (error.response.data.message) {
                triggerUnauthorizedToastMessage(error.response.data.message);
                await triggerLogout();
                // app.config.globalProperties.$toast.add({
                //     severity: "error",
                //     summary: localize("Error"),
                //     // detail: err.response.data.message,
                //     detail: localize("Your sign-in expired, please sign in again"),
                //     life: 3000,
                //     group: "br",
                // });
            }
            // localStorage.setItem(localStorageKeys.loginAgainKey, "1");
            // sessionStorage.setItem(localStorageKeys.loginAgainKey, "1");
            // localStorage.setItem(localStorageKeys.tokenExpired, "true");
            // const globalStore = useGlobalStore();
            // globalStore.urlAccessedWhenUnauthorized = window.location.pathname;
            // globalStore.showUnauthorizedAccessMessage = true;
            // await logoutApi();
            // window.location.reload();
        }
        const responseStatus = error.response.status as number;
        return {
            status: responseStatus,
            data: error.response.data
                ? deepClone({
                      ...error.response.data,
                      message: checkIfKeyExistsInObject("message", error.response.data)
                          ? error.response.data.message
                          : "Oops! Something went wrong",
                  })
                : {
                      message: "Oops! Something went wrong",
                  },
            headers: error.response.headers,
        };
    }
}
