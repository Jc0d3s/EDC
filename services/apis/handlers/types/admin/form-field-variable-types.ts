import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";

export interface IFormFieldVariableData {
    id: number;
    varOID: string;
    fieldId: number;
    format: string;
    dictionaryId: number;
    unitDictionaryId: number;
    codingDictionaryId: number;
    updatedBy: number;
}

export interface IFormFieldVariableResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormFieldVariableData;
}
