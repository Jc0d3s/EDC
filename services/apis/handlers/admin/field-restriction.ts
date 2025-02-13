import ServiceCall from "~/services/apis/service-call";
import { fieldRestrictions } from "~/services/apis/admin-routes.json";
import type {
    ICreateFieldRestrictionResponse,
    IFieldRestrictionData,
    IFieldRestrictionListResponse,
} from "../types/admin/field-restriction-types";

export async function fieldRestrictionsListByFormIdAPI(formId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...fieldRestrictions.list,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFieldRestrictionListResponse;
}

export async function updateFieldRestrictionAPI(body: IFieldRestrictionData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...fieldRestrictions.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateFieldRestrictionResponse;
}
