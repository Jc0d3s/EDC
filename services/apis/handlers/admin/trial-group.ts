import ServiceCall from "~/services/apis/service-call";
import { trialGroups } from "~/services/apis/admin-routes.json";
import type {
    ICreateTrialGroupResponse,
    ITrialGroupByIDResponse,
    ITrialGroupPaginationListResponse,
} from "~/services/apis/handlers/types/admin/trial-group-types";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";

export async function trialGroupPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...trialGroups.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialGroupPaginationListResponse;
}

interface ITrialGroupBody {
    id: TNullableNumber;
    trialGroupName: string;
    trialType: string;
    trialSummary: TNullableString;
    trialDescription: TNullableString;
}
export async function createTrialGroupAPI(body: ITrialGroupBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trialGroups.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialGroupResponse;
}

export async function trialGroupByIdAPI(trialGroupId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trialGroups.getByID,
        pathParams: trialGroupId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialGroupByIDResponse;
}

export async function updateTrialGroupAPI(body: ITrialGroupBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trialGroups.update,
        body,
        pathParams: Number(body.id),
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialGroupResponse;
}

export async function deleteTrialGroupByIdAPI(trialGroupId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trialGroups.delete,
        pathParams: trialGroupId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialGroupResponse;
}
