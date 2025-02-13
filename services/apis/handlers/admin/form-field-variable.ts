import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { fieldVariables } from "~/services/apis/admin-routes.json";
import type { IFormFieldVariableResponse } from "../types/admin/form-field-variable-types";
import type { IAdminListQueryParam } from "~/types/common";

export async function formFieldVariableAPI(queryParams: IAdminListQueryParam) {
    // fieldId: string
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...fieldVariables.list,
        queryParams: queryParams as unknown as IQueryParam,
        // FIXME: need to add this
        // pathParams: fieldId,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IFormFieldVariableResponse;
}
