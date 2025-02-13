import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";

export interface ITherapeuticArea {
    id: number;
    therapeuticArea: string;
    isActive: boolean;
}

export interface ITherapeuticAreaListResponse extends IApiResponseStatus, IApiResponseData {
    data: ITherapeuticArea[];
}
