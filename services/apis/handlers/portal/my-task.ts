import ServiceCall, { type IQueryParam } from "~/services/apis/service-call";
import { myTasks } from "~/services/apis/portal-routes.json";
import type { IPaginationListQueryParam, TNullableNumber } from "~/types/common";
import type {
    IMyTaskPaginationListResponse,
    IProcessMyTaskResponse,
    ITaskNotificationCountResponse,
} from "../types/my-task-types";

export async function myTaskPaginationListAPI(queryParams?: IPaginationListQueryParam) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...myTasks.taskPaginationList,
        queryParams,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IMyTaskPaginationListResponse;
}

interface IProcessMyTaskBody {
    id: number;
    trialId: number;
    environmentId: number;
    subjectId: number;
    subjectName: string;
    siteId: number;
    siteName: string;
    formId: number;
    formName: string;
    folderId: TNullableNumber;
    folderName: string;
    publishedSubjectFormFieldParentId: number;
    typeIds: number[];
    typeId: number;
    typeName: string;
    statusId: number;
    statusName: string;
    description: string;
    recordPosition: number;
    updatedBy: number;
}
export async function processMyTaskAPI(body: IProcessMyTaskBody) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...myTasks.processTask,
        body,
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as IProcessMyTaskResponse;
}

interface IPendingTaskNotification {
    trialId: number;
    environmentId: number;
}

export async function taskNotificationCountAPI(queryParams: IPendingTaskNotification) {
    const {
        status = 500,
        data: { success = false, message = "", validationErrors = null, data = [] },
    } = await ServiceCall({
        ...myTasks.taskNotificationCount,
        queryParams: queryParams as unknown as IQueryParam,
        queryParamsType: "questionMark",
    });

    return {
        status,
        data,
        success,
        message,
        validationErrors,
    } as ITaskNotificationCountResponse;
}
