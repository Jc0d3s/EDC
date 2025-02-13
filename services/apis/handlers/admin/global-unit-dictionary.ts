import ServiceCall from "~/services/apis/service-call";
import { globalLibraries } from "~/services/apis/admin-routes.json";
import type { IPaginationListQueryParam } from "~/types/common";
import type {
    IGlobalUnitDictionaryCreateResponse,
    IGlobalUnitDictionaryData,
    IGlobalUnitDictionaryEntriesCreateResponse,
    IGlobalUnitDictionaryEntriesPaginationListResponse,
    IGlobalUnitDictionaryEntryData,
    IGlobalUnitDictionaryPaginationListResponse,
} from "../types/admin/global-unit-dictionary-types";

export async function globalUnitDictionaryPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.paginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryPaginationListResponse;
}

export async function globalUnitDictionaryCreateAPI(body: IGlobalUnitDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.create,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryCreateResponse;
}

export async function globalUnitDictionaryUpdateAPI(body: IGlobalUnitDictionaryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.update,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryCreateResponse;
}

export async function globalUnitDictionaryDeleteByIdAPI(unitDictionaryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.delete,
        pathParams: unitDictionaryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryCreateResponse;
}

export async function globalUnitDictionaryEntriesPaginationListAPI(
    queryParams?: IPaginationListQueryParam,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = {} },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.entriesPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryEntriesPaginationListResponse;
}

export async function globalUnitDictionaryEntriesCreateAPI(body: IGlobalUnitDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.entriesCreate,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryEntriesCreateResponse;
}

export async function globalUnitDictionaryEntriesUpdateAPI(body: IGlobalUnitDictionaryEntryData) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.entriesUpdate,
        body,
        pathParams: body.id,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryEntriesCreateResponse;
}

export async function reorderGlobalUnitDictionaryEntryAPI(body: IGlobalUnitDictionaryEntryData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.reorder,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryEntriesCreateResponse;
}

export async function globalUnitDictionaryEntryDeleteByIdAPI(unitDictionaryEntryId: string) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalLibraries.unitDictionaries.deleteEntry,
        pathParams: unitDictionaryEntryId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalUnitDictionaryEntriesCreateResponse;
}
