import ServiceCall from "~/services/apis/service-call";
import { branches } from "~/services/apis/admin-routes.json";
import type {
    IBranchByIDResponse,
    IBranchCreateResponse,
    IBranchData,
    IBranchPaginationListResponse,
    IBranchSummaryCountByBranchIDResponse,
} from "../types/admin/branch-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function branchPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...branches.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchPaginationListResponse;
}

export async function createBranchAPI(body: IBranchData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...branches.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchCreateResponse;
}

export async function editBranchAPI(body: IBranchData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...branches.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchCreateResponse;
}

export async function branchByIdAPI(branchId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...branches.getByID,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchByIDResponse;
}

export async function summaryCountByBranchIDAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...branches.summaryCount,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchSummaryCountByBranchIDResponse;
}

export async function deleteBranchAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...branches.delete,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IBranchCreateResponse;
}
