import ServiceCall from "~/services/apis/service-call";
import { dataDictionaries } from "~/services/apis/admin-routes.json";
import type {
    IDictionaryCreateResponse,
    IDictionaryData,
    IDictionaryEntriesCreateResponse,
    IDictionaryEntriesPaginationListResponse,
    IDictionaryEntryData,
    IDictionaryListResponse,
    IDictionaryPaginationListResponse,
} from "../types/admin/dictionary-types";
import type { IPaginationListQueryParam } from "~/types/common";

export async function dictionaryPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...dataDictionaries.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryPaginationListResponse;
}

export async function dictionaryListByBranchIdAPI(branchId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.listByBranchId,
        pathParams: branchId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryListResponse;
}

export async function createDictionaryAPI(body: IDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryCreateResponse;
}

export async function updateDictionaryAPI(body: IDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryCreateResponse;
}

export async function deleteDictionaryByIdAPI(dictionaryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.delete,
        pathParams: dictionaryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryCreateResponse;
}

export async function dictionaryEntriesPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...dataDictionaries.entriesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryEntriesPaginationListResponse;
}

export async function dictionaryEntriesCreateAPI(body: IDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.entriesCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryEntriesCreateResponse;
}

export async function dictionaryEntriesUpdateAPI(body: IDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.entriesUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryEntriesCreateResponse;
}

export async function reorderEntryAPI(body: IDictionaryEntryData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...dataDictionaries.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryEntriesCreateResponse;
}

export async function deleteDictionaryEntryByIdAPI(dictionaryEntryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...dataDictionaries.deleteEntry,
        pathParams: dictionaryEntryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IDictionaryEntriesCreateResponse;
}
