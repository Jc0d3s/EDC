import ServiceCall from "~/services/apis/service-call";
import { trials } from "~/services/apis/admin-routes.json";
import type {
    ICreateTrialResponse,
    ITrialByIDResponse,
    ITrialListResponse,
    ITrialPaginationListResponse,
    ITrialPhaseResponse,
} from "~/services/apis/handlers/types/admin/trial-types";
import type { IPaginationListQueryParam, TNullableNumber, TNullableString } from "~/types/common";

export async function trialPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...trials.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialPaginationListResponse;
}

export async function listAllAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trials.listAll,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialListResponse;
}

interface ITrialBody {
    id: number;
    trialGroupId: number;
    trialName: string;
    ownerId: number;
    protocolNumber: TNullableString;
    drugOrDevice: TNullableString;
    compoundOrcode: TNullableString;
    program: TNullableString;
    protocol: TNullableString;
    phaseId: TNullableNumber;
    indication: TNullableString;
    enrollmentTarget: TNullableNumber;
    therapeuticAreaId: TNullableNumber;
    liveDate: TNullableString;
    closeDate: TNullableString;
    title: TNullableString;
    summary: TNullableString;
    description: TNullableString;
    isProduction: boolean;
    updatedBy: number;
}
export async function createTrialAPI(body: ITrialBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trials.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialResponse;
}

export async function trialByIdAPI(trialId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...trials.getByID,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialByIDResponse;
}

export async function updateTrialAPI(body: ITrialBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trials.update,
        body,
        pathParams: Number(body.id),
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialResponse;
}

export async function trialPhasesListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trials.trialPhasesList,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITrialPhaseResponse;
}

export async function deleteTrialAPI(trialId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...trials.delete,
        pathParams: trialId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateTrialResponse;
}
