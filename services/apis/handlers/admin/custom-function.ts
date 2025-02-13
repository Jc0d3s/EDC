import ServiceCall from "~/services/apis/service-call";
import { customFunctions } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    ICustomFunctionData,
    ICustomFunctionCreateResponse,
    ICustomFunctionPaginationListResponse,
} from "../types/custom-function-types";

export async function customFunctionPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...customFunctions.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICustomFunctionPaginationListResponse;
}

export async function customFunctionCreateAPI(body: ICustomFunctionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...customFunctions.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICustomFunctionCreateResponse;
}

export async function customFunctionUpdateAPI(body: ICustomFunctionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...customFunctions.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICustomFunctionCreateResponse;
}

export async function customFunctionDeleteByIdAPI(customFunctionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...customFunctions.delete,
        pathParams: customFunctionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICustomFunctionCreateResponse;
}
