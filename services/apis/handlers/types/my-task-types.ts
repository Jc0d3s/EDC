import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";

export interface IMyTaskData {
    id: number;
    trialId: number;
    environmentId: number;
    subjectId: number;
    subjectName: string;
    siteId: number;
    siteName: string;
    formId: number;
    formName: string;
    folderId: number;
    folderName: string;
    publishedSubjectFormFieldParentId: number;
    typeIds: null;
    typeId: number;
    typeName: string;
    statusId: number;
    statusName: string;
    description: null;
    recordPosition: number;
    updatedBy: number;
}
export interface IMyTaskPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IMyTaskData>;
}

export interface IProcessMyTaskResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
interface ITaskNotificationCountData {
    id: 0;
    trialId: 0;
    environmentId: 0;
    count: number;
    subjectId: 0;
    subjectName: null;
    siteId: 0;
    siteName: null;
    formId: 0;
    formName: null;
    folderId: 0;
    folderName: null;
    publishedSubjectFormFieldParentId: 0;
    recordPosition: 0;
    typeIds: null;
    typeId: 0;
    typeName: null;
    statusId: 0;
    statusName: null;
    description: null;
    updatedBy: 0;
}
export interface ITaskNotificationCountResponse extends IApiResponseStatus, IApiResponseData {
    data: ITaskNotificationCountData;
}
