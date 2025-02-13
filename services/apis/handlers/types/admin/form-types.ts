import type { TNullableNumber, TNullableString } from "~/types/common";
import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TLogDirection } from "~/services/apis/data/admin/form";

export interface IFormData {
    id: number;
    branchId: number;
    branchName: string;
    formName: TNullableString;
    formOId: TNullableString;
    helpText: TNullableString;
    otherVisit: boolean;
    isCommon: boolean;
    isLabForm: boolean;
    isNavigateToSubjectDisposition: boolean;
    logDirection: TLogDirection;
    saveConfirm: boolean;
    redirectLink: TNullableString;
    redirectFolderId: TNullableNumber;
    redirectFormId: TNullableNumber;
    patientCloudForm: boolean;
    formOrderNumber: TNullableNumber;
    oldFormOrderNumber: number;
    newFormOrderNumber: number;
    isTemplate: boolean;
    noOfFields: number;
    isActive: boolean;
    isVisible: boolean;
    signatureRequired: boolean;
    formType: number;
    updatedBy: number;
}

export interface IFormPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IFormData>;
}
export interface IFormListResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormData[];
}

export interface IFormResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
