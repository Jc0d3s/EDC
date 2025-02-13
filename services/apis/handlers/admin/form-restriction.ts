import ServiceCall from "~/services/apis/service-call";
import { formRestrictions } from "~/services/apis/admin-routes.json";
import type {
    ICreateFormRestrictionResponse,
    IFormRestrictionData,
    IFormRestrictionListResponse,
} from "../types/admin/form-restriction-types";

export async function formRestrictionsListByFormIdAPI(formId: number) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...formRestrictions.list,
        pathParams: formId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormRestrictionListResponse;
}

export async function updateFormRestrictionAPI(body: IFormRestrictionData[]) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = null },
    } = await ServiceCall({
        ...formRestrictions.update,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ICreateFormRestrictionResponse;
}
