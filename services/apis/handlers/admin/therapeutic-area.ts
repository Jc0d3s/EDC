import ServiceCall from "~/services/apis/service-call";
import { therapeuticAreas } from "~/services/apis/admin-routes.json";
import type { ITherapeuticAreaListResponse } from "~/services/apis/handlers/types/admin/therapeutic-types";

export async function therapeuticAreaListAPI() {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...therapeuticAreas.list,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITherapeuticAreaListResponse;
}
