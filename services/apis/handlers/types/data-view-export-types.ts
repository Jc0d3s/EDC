import type { AxiosResponseHeaders } from "axios";
import type { IApiResponseData, IApiResponseStatus } from "../../service-call";
import type { TNullableString } from "~/types/common";

// interface IPublishedExportData {
//     fileContents: Blob;
//     contentType: string;
//     fileDownloadName: string;
//     lastModified: null;
//     entityTag: null;
//     enableRangeProcessing: boolean;
// }

export interface IPublishedFormFieldExportDataResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: Blob | JSON; // IPublishedExportData;
    headers: AxiosResponseHeaders;
}

interface IPublishedFormFieldValueDetail {
    id: number;
    publishedSubjectFormFieldChildValueDetailId: number;
    publishedSubjectFormFieldChildDetailId: null;
    fieldValue: string;
    specifiedValue: null;
    trial: null;
    environment: null;
    subject: null;
}

interface IPublishedFormFieldDetail {
    id: 666;
    orderNumber: number;
    formId: number;
    controlTypeId: number;
    trialId: null;
    environmentId: null;
    siteId: null;
    releaseVersionId: null;
    subjectId: null;
    folderId: number;
    formName: null;
    fieldVariableId: number;
    fieldRestrictionId: null;
    formFieldsId: null;
    fieldEditChecksId: null;
    variableId: number;
    controlType: number;
    fieldNum: null;
    oid: string;
    name: string;
    isLogDataEntry: boolean;
    isVisible: boolean;
    helpText: string;
    requiresTranslation: boolean;
    doesNotParticipateSignature: boolean;
    promptClinicalSignificance: null;
    labAnalytics: null;
    defaultValue: null;
    sasLabel: null;
    sasFormat: null;
    indentLevel: number;
    label: string;
    header: null;
    fixedUnit: null;
    validExtensions: null;
    isActive: boolean;
    location: null;
    fieldHelpText: null;
    canSetRecordDate: boolean;
    canSetDatapage: boolean;
    canSetInstanceDate: boolean;
    canSetSubjectDate: boolean;
    showPreviousVisitValues: boolean;
    varOID: string;
    dictionaryId: null;
    unitDictionaryId: null;
    format: string;
    codingDictionaryId: number;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    autoQueryForRequiredDataEntry: null;
    autoQueryForNonConformantData: null;
    autoQueryForFutureDateTime: null;
    autoQueryForDataOutOfRangeLowValue: number;
    autoQueryForDataOutOfRangeHighValue: number;
    markNonConformantDataOutOfRangeLowValue: number;
    markNonConformantDataOutOfRangeHighValue: number;
    requiresVerification: boolean;
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldChildValueDetailId: null;
    publishedSubjectFormFieldParentId: null;
    fieldId: number;
    fieldValue: null;
    specifiedValue: null;
    progressStatus: string;
    isVerified: boolean;
    isFrozen: boolean;
    isLocked: boolean;
    oldValue: null;
    newValue: null;
    fieldValueDetails: IPublishedFormFieldValueDetail[];
    manualReviews: null;
    viewRestrictions: null;
    entryRestrictions: null;
    groupId: number;
    updatedBy: number;
}

export interface IPublishedFormFieldsViewData {
    id: number;
    formName: string;
    publishedSubjectFormFieldParentId: number;
    subjectId: number;
    subjectName: string;
    trialId: number;
    environmentId: number;
    siteId: number;
    siteNumber: string;
    siteName: string;
    formId: number;
    folderId: number;
    formIds: number[];
    folderIds: number[];
    siteIds: number[];
    successMessageEmailIds: string[];
    failureNotificationEmailIds: string[];
    extensionType: TNullableString;
    isZippingRequired: boolean;
    columnNameAsFirstName: boolean;
    fieldDetails: IPublishedFormFieldDetail[];
    dataExport: null;
    formDetails: null;
}
export interface IPublishedFormFieldsViewDataResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedFormFieldsViewData[];
}
