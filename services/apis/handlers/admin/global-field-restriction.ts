import ServiceCall from "~/services/apis/service-call";
import { globalFieldRestrictions } from "~/services/apis/admin-routes.json";
import type {
    ICreateGlobalFieldRestrictionResponse,
    IGlobalFieldRestrictionData,
    IGlobalFieldRestrictionListResponse,
} from "../types/admin/global-field-restriction-types";

export async function globalFieldRestrictionsListByFormIdAPI(formId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...globalFieldRestrictions.list,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IGlobalFieldRestrictionListResponse;
}

export async function updateGlobalFieldRestrictionAPI(body: IGlobalFieldRestrictionData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalFieldRestrictions.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateGlobalFieldRestrictionResponse;
}

export async function assignToAllFieldsGlobalFieldRestrictionAPI(
    body: IGlobalFieldRestrictionData,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalFieldRestrictions.assignToAllFields,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateGlobalFieldRestrictionResponse;
}

export async function removeFromAllFieldsGlobalFieldRestrictionAPI(
    body: IGlobalFieldRestrictionData,
) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...globalFieldRestrictions.removeFromAllFields,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateGlobalFieldRestrictionResponse;
}
