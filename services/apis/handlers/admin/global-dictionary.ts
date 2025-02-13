import ServiceCall from "~/services/apis/service-call";
import { globalLibraries } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IGlobalDictionaryCreateResponse,
    IGlobalDictionaryData,
    IGlobalDictionaryEntriesCreateResponse,
    IGlobalDictionaryEntriesPaginationListResponse,
    IGlobalDictionaryEntryData,
    IGlobalDictionaryPaginationListResponse,
} from "../types/admin/global-dictionary-types";

export async function globalDictionaryPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryPaginationListResponse;
}

export async function createGlobalDictionaryAPI(body: IGlobalDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryCreateResponse;
}

export async function updateGlobalDictionaryAPI(body: IGlobalDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryCreateResponse;
}

export async function deleteGlobalDictionaryByIdAPI(dictionaryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.delete,
        pathParams: dictionaryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryCreateResponse;
}

export async function globalDictionaryEntriesPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.entriesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryEntriesPaginationListResponse;
}

export async function globalDictionaryEntriesCreateAPI(body: IGlobalDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.entriesCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryEntriesCreateResponse;
}

export async function globalDictionaryEntriesUpdateAPI(body: IGlobalDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.entriesUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryEntriesCreateResponse;
}

export async function reorderGlobalDictionaryEntryAPI(body: IGlobalDictionaryEntryData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryEntriesCreateResponse;
}

export async function deleteGlobalDictionaryEntryByIdAPI(dictionaryEntryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.dataDictionaries.deleteEntry,
        pathParams: dictionaryEntryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalDictionaryEntriesCreateResponse;
}
