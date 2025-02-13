import ServiceCall from "~/services/apis/service-call";
import { derivations } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IDerivationActionData,
    IDerivationActionPaginationListResponse,
    IDerivationCreateResponse,
    IDerivationData,
    IDerivationListResponse,
    IDerivationPaginationListResponse,
    IDerivationStepData,
    IDerivationStepPaginationListResponse,
    IMasterDerivationFunctionResponse,
} from "../types/derivation-types";

export async function derivationPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...derivations.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationPaginationListResponse;
}

export async function derivationsListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...derivations.list,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationListResponse;
}

export async function derivationCreateAPI(body: IDerivationData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...derivations.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function derivationUpdateAPI(body: IDerivationData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...derivations.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function derivationDeleteByIdAPI(customFunctionId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.delete,
        pathParams: customFunctionId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function derivationStepPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...derivations.derivationStepsList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationStepPaginationListResponse;
}

export async function createDerivationStepAPI(body: IDerivationStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.createDerivationStep,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function updateDerivationStepAPI(body: IDerivationStepData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.updateDerivationStep,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function deleteDerivationStepAPI(derivationId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.deleteDerivationStep,
        pathParams: derivationId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function derivationActionPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.derivationActionsList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationActionPaginationListResponse;
}

export async function createDerivationActionAPI(body: IDerivationActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.createDerivationAction,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function updateDerivationActionAPI(body: IDerivationActionData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.updateDerivationAction,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function deleteDerivationActionAPI(derivationId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.deleteDerivationAction,
        pathParams: derivationId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationCreateResponse;
}

export async function masterDerivationFunctionsAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.masterDerivationFunctions,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMasterDerivationFunctionResponse;
}

export async function derivationListByBranchIdAPI(branchId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...derivations.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDerivationListResponse;
}
