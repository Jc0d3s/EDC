import ServiceCall from "~/services/apis/service-call";
import { matrices } from "~/services/apis/admin-routes.json";
import type {
    IAssignMatricesListResponse,
    IAssignMatricesResponse,
    IAssignMatrixData,
    IChangeMatricesOrderResponse,
    IMatricesCreateResponse,
    IMatricesListResponse,
    IMatricesPaginationListResponse,
    IMatrixReorderData,
    IMatrixData,
} from "../types/admin/matrix-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function matricesPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...matrices.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMatricesPaginationListResponse;
}

export async function matricesListByBranchIdAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMatricesListResponse;
}

export async function matricesCreateAPI(body: IMatrixData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMatricesCreateResponse;
}

export async function matricesUpdateAPI(body: IMatrixData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMatricesCreateResponse;
}

export async function assignedMatricesListAPI(matrixId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.assignedList,
        pathParams: matrixId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAssignMatricesListResponse;
}

// interface IAssignMatrixBody {
//     // matrixId: number;
//     assignedMatrices: IAssignMatrixData[];
// }

export async function assignMatricesCreateAPI(body: IAssignMatrixData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.createAssignMatrices,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAssignMatricesResponse;
}

export async function assignMatricesUpdateAPI(body: IAssignMatrixData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...matrices.updateAssignMatrices,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IAssignMatricesResponse;
}

export async function matrixDeleteByIdAPI(matrixId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...matrices.delete,
        pathParams: matrixId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMatricesCreateResponse;
}

export async function reorderFormFolderAPI(body: IMatrixReorderData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...matrices.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IChangeMatricesOrderResponse;
}
