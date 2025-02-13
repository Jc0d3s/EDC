import ServiceCall from "~/services/apis/service-call";
import { unitDictionaries } from "~/services/apis/admin-routes.json";
import type {
    IUnitDictionaryCreateResponse,
    IUnitDictionaryData,
    IUnitDictionaryEntriesCreateResponse,
    IUnitDictionaryEntriesPaginationListResponse,
    IUnitDictionaryEntryData,
    IUnitDictionaryListResponse,
    IUnitDictionaryPaginationListResponse,
} from "../types/admin/unit-dictionary-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function unitDictionaryPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...unitDictionaries.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryPaginationListResponse;
}

export async function unitDictionaryListByBranchIdAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...unitDictionaries.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryListResponse;
}

export async function unitDictionaryCreateAPI(body: IUnitDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...unitDictionaries.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryCreateResponse;
}

export async function unitDictionaryUpdateAPI(body: IUnitDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...unitDictionaries.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryCreateResponse;
}

export async function unitDictionaryDeleteByIdAPI(unitDictionaryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...unitDictionaries.delete,
        pathParams: unitDictionaryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryCreateResponse;
}

export async function unitDictionaryEntriesPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...unitDictionaries.entriesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryEntriesPaginationListResponse;
}

export async function unitDictionaryEntriesCreateAPI(body: IUnitDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...unitDictionaries.entriesCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryEntriesCreateResponse;
}

export async function unitDictionaryEntriesUpdateAPI(body: IUnitDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...unitDictionaries.entriesUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryEntriesCreateResponse;
}

export async function reorderEntryAPI(body: IUnitDictionaryEntryData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...unitDictionaries.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryEntriesCreateResponse;
}

export async function unitDictionaryEntryDeleteByIdAPI(unitDictionaryEntryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...unitDictionaries.deleteEntry,
        pathParams: unitDictionaryEntryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IUnitDictionaryEntriesCreateResponse;
}
