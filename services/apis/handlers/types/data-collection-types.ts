import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IApiResponseData, IApiResponseStatus } from "~/services/apis/service-call";
import type {
    IPublishedDictionaryEntryData,
    IPublishedUnitDictionaryEntryData,
} from "./admin/release-version-detail-types";
import type { IFieldRestrictionEntryData } from "./admin/field-restriction-types";
import type { IDeactivatedFormData } from "./subject-types";

export interface ISubjectFormData {
    id: number;
    formOrderNumber: number;
    releaseVersionId: number;
    releaseVersionName: TNullableNumber;
    trialId: number;
    environmentId: number;
    formName: string;
    formOID: string;
    formCount: number;
    helpText: TNullableString;
    isActive: boolean;
    signatureRequired: boolean;
    isNavigateToSubjectDisposition: boolean;
    otherVisit: boolean;
    logDirection: string;
    redirectLink: TNullableString;
    saveConfirm: boolean;
    noOfFields: TNullableNumber;
    redirectFormId: TNullableNumber;
    redirectFolderId: TNullableNumber;
    patientCloudForm: boolean;
    isTemplate: boolean;
    progressStatus: TNullableString;
    isLabForm: boolean;
    isVisible: boolean;
    isCommon: boolean;
    subjectIds: TNullableString;
    formType: number;
    updatedBy: number;
}

export interface ISubjectTrialVisitData {
    id: number;
    releaseVersionId: number;
    releaseVersionName: TNullableNumber;
    trialId: number;
    environmentId: number;
    orderNumber: number;
    name: string;
    oid: string;
    parentFolder: null;
    access: number;
    start: number;
    target: number;
    end: number;
    overDue: number;
    close: number;
    reusable: boolean;
    forms: ISubjectFormData[];
    updatedBy: number;
    isUnscheduled: boolean;
}

export interface ITrialVisitAndFormDetails {
    trialVisits: ISubjectTrialVisitData[];
    forms: ISubjectFormData[];
}

export interface ISubjectDetailData {
    id: number;
    trialId: TNullableNumber;
    siteId: TNullableNumber;
    environmentId: TNullableNumber;
    subjectId: number;
    subjectFormConfigId: number;
    fieldValue: TNullableString;
    label: TNullableString;
    orderNumber: number;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: TNullableString;
    subjects: TNullableString;
    trialVisits: TNullableString;
    forms: TNullableString;
    updatedBy: number;
}

// export interface ISubjectNestedListData {
//     id: number;
//     studyId: number;
//     statusId: number;
//     statusName: TNullableString;
//     trialId: TNullableNumber;
//     environmentId: TNullableNumber;
//     trialName: TNullableString;
//     environmentName: TNullableString;
//     siteId: number;
//     siteName: TNullableString;
//     subjectFormConfigId: number;
//     subjectId: TNullableNumber;
//     label: TNullableString;
//     value: TNullableString;
//     fieldValue: TNullableString;
//     orderNumber: TNullableNumber;
//     isActive: boolean;
//     isMandatory: boolean;
//     isSpecify: boolean;
//     format: boolean;
//     subjectDetails: ISubjectDetailData[];
//     trialVisits: ISubjectTrialVisitData[];
//     forms: ISubjectFormData[];
//     updatedBy: number;
// }
export interface ISubjectListData {
    id: number;
    studyId: number;
    statusId: number;
    statusName: TNullableString;
    trialId: TNullableNumber;
    environmentId: TNullableNumber;
    trialName: TNullableString;
    environmentName: TNullableString;
    siteId: number;
    siteName: TNullableString;
    subjectFormConfigId: number;
    subjectId: TNullableNumber;
    label: TNullableString;
    value: TNullableString;
    fieldValue: TNullableString;
    orderNumber: TNullableNumber;
    isActive: boolean;
    isMandatory: boolean;
    isSpecify: boolean;
    format: boolean;
    subjectDetails: ISubjectDetailData[];
    updatedBy: number;
}

export interface IDeactivatedFormListData extends IDeactivatedFormData {
    subjectIds: TNullableString;
}

export interface ISubjectNestedListData {
    environmentId: number;
    formDetails: ITrialVisitAndFormDetails;
    siteId: number;
    subjects: ISubjectListData[];
    trialId: number;
    conditionalForms: ITrialVisitAndFormDetails;
    deactiveForms: IDeactivatedFormListData[];
}

export interface ISubjectNestedListResponse extends IApiResponseStatus, IApiResponseData {
    data: ISubjectNestedListData;
}

export interface IFieldValueDetail {
    id: TNullableNumber;
    publishedSubjectFormFieldChildValueDetailId: TNullableNumber;
    fieldValue: TNullableString;
    specifiedValue: TNullableString;
}

export interface IGenerateFormFieldsData {
    id: number;
    orderNumber: number;
    formId: number;
    trialId: TNullableNumber;
    environmentId: TNullableNumber;
    releaseVersionId: TNullableNumber;
    controlTypeId: number;
    publishedSubjectFormFieldParentId: TNullableNumber;
    siteId: TNullableNumber;
    subjectId: TNullableNumber;
    folderId: TNullableNumber;
    formName: string;
    fieldVariableId: TNullableNumber;
    varOID: TNullableString;
    dictionaryId: TNullableNumber;
    unitDictionaryId: TNullableNumber;
    format: TNullableString;
    codingDictionaryId: TNullableNumber;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    fieldRestrictionId: TNullableNumber;
    formFieldsId: TNullableNumber;
    fieldEditChecksId: TNullableNumber;
    variableId: TNullableNumber;
    controlType: number;
    fieldNum: TNullableString;
    oid: string;
    name: string;
    isLogDataEntry: boolean;
    isVisible: boolean;
    helpText: TNullableString;
    requiresTranslation: boolean;
    doesNotParticipateSignature: boolean;
    promptClinicalSignificance: boolean;
    labAnalytics: TNullableNumber;
    defaultValue: TNullableString;
    sasLabel: TNullableString;
    sasFormat: TNullableString;
    indentLevel: TNullableNumber;
    label: TNullableString;
    header: TNullableString;
    fixedUnit: TNullableString;
    validExtensions: TNullableString;
    isActive: boolean;
    location: TNullableString;
    fieldHelpText: TNullableString;
    canSetRecordDate: boolean;
    canSetDatapage: boolean;
    canSetInstanceDate: boolean;
    canSetSubjectDate: boolean;
    showPreviousVisitValues: boolean;
    autoQueryForRequiredDataEntry: boolean;
    autoQueryForNonConformantData: boolean;
    autoQueryForFutureDateTime: boolean;
    autoQueryForDataOutOfRangeLowValue: TNullableNumber;
    autoQueryForDataOutOfRangeHighValue: TNullableNumber;
    markNonConformantDataOutOfRangeLowValue: TNullableNumber;
    markNonConformantDataOutOfRangeHighValue: TNullableNumber;
    requiresVerification: boolean;
    publishedSubjectFormFieldChildDetailId: TNullableNumber;
    fieldId: TNullableNumber;
    fieldValue: TNullableString;
    progressStatus: TNullableString;
    isVerified: boolean;
    isFrozen: boolean;
    isLocked: boolean;
    oldValue: TNullableString;
    newValue: TNullableString;
    fieldValueDetails: IFieldValueDetail[];
    manualReviews: IFieldRestrictionEntryData[];
    viewRestrictions: IFieldRestrictionEntryData[];
    entryRestrictions: IFieldRestrictionEntryData[];
    groupId: number;
    updatedBy: number;
}

export interface IFormFieldStatus {
    id: number;
    name: string;
}

export interface IGenerateFormFieldListResponse extends IApiResponseStatus, IApiResponseData {
    data: IGenerateFormFieldsData[];
}

export interface ISaveFormFieldListResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IPublishedDataDictionaryEntryListData extends IPublishedDictionaryEntryData {
    isGlobal: boolean;
    releaseVersionId: number;
    publishedDataDictionaryIds: any[];
    globalDataDictionaryIds: any[];
}

export interface IPublishedUnitDictionaryEntryListData extends IPublishedUnitDictionaryEntryData {
    isGlobal: boolean;
    releaseVersionId: number;
    publishedUnitDictionaryIds: [];
    globalUnitDictionaryIds: [];
}

export interface IPublishedDataDictionaryEntriesListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedDataDictionaryEntryListData[];
}

export interface IPublishedUnitDictionaryEntriesListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedUnitDictionaryEntryListData[];
}

export interface IFormFieldStatusResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormFieldStatus[];
}

export interface IChangeFormFieldStatusResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface ICaptureSignature {
    id: number;
    userId: number;
    username: string;
    password: string;
    enterpriseName: string;
    studyId: number;
    siteId: number;
    roleId: number;
    roleName: string;
    roleDescription: string;
    trialId: number;
    trialName: string;
    environmentId: number;
    environmentName: string;
    updatedBy: number;
}

export interface ICaptureSignatureResponse extends IApiResponseStatus, IApiResponseData {
    data: boolean;
}

export interface ISubjectCompletionFormSigning {
    id: number;
    trialId: number;
    environmentId: number;
    formId: number;
    folderId: TNullableNumber;
    siteId: number;
    subjectId: number;
    publishedSubjectFormFieldParentDetailId: number;
    masterSubjectFormActionId: number;
    comments: TNullableString;
    updatedBy: number;
}

export interface ISubjectCompletionFormSigningResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}

export interface IPublishedSubjectFormFieldDetail {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: TNullableNumber;
    fieldId: TNullableNumber;
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldParentId: number;
    publishedSubjectDetailId: number;
    progressStatus: string;
    label: string;
    fieldValue: string;
    fieldValueDetails: any[];
    updatedBy: number;
}

export interface IIPublishedSubjectFormFieldChildDetailData {
    id: number;
    publishedSubjectFormFieldChildValueDetailId: TNullableNumber;
    publishedSubjectFormFieldChildDetailId: number;
    fieldValue: TNullableString;
    specifiedValue: TNullableString;
    trial: TNullableNumber;
    environment: TNullableNumber;
    subject: TNullableNumber;
}

export interface IPublishedSubjectFormFieldDetailData {
    id: number;
    subjectId: number;
    trialId: number;
    environmentId: number;
    siteId: number;
    formId: number;
    folderId: number;
    fieldId: number;
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldParentId: number;
    publishedSubjectDetailId: number;
    progressStatus: TNullableString;
    label: TNullableString;
    fieldValue: TNullableString;
    controlType: TNullableNumber;
    fieldValueDetails: IIPublishedSubjectFormFieldChildDetailData[];
    updatedBy: number;
}

export interface IPublishedSubjectFormFieldDetailResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedSubjectFormFieldDetailData[];
}

// export interface IFormFieldCheckActionAuditData {
//     publishedSubjectFormFieldChildDetailIds: number[];
//     type: string;
//     value: boolean;
// }
export interface IFormFieldCheckActionAuditData {
    publishedSubjectFormFieldChildDetailId: number;
    type: string;
    value: boolean;
}

export interface IFormFieldCheckProgressStatusWorkflowData {
    id: number;
    subjectId: TNullableNumber;
    trialId: TNullableNumber;
    environmentId: TNullableNumber;
    siteId: TNullableNumber;
    formId: TNullableNumber;
    folderId: number;
    fieldId: number;
    fieldIds: number[];
    publishedSubjectFormFieldChildDetailIds: number[];
    publishedSubjectFormFieldChildDetailId: number;
    publishedSubjectFormFieldParentId: TNullableNumber;
    publishedSubjectDetailId: TNullableNumber;
    formProgressStatus: TNullableString;
    fieldProgressStatus: TNullableString;
    isFrozen: boolean;
    label: TNullableString;
    fieldValue: TNullableString;
    controlType: number;
    orderNumber: TNullableNumber;
    fieldValueDetails: any[];
    updatedBy: TNullableNumber;
}

export interface IFormFieldCheckActionAuditResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IPublishedSubjectFormFieldStatusAuditData {
    publishedSubjectFormFieldChildDetailId: number;
    type: string;
    value: boolean;
}

export interface IPublishedSubjectFormFieldStatusAuditResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedSubjectFormFieldStatusAuditData[];
}

export interface IDeleteFormFieldsByParentDetailIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: null;
}

export interface IFormFieldCheckProgressStatusWorkflowResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IFormFieldCheckProgressStatusWorkflowData[];
}

export interface IFormFieldDetailsData {
    // "id": 0,
    // "siteId": null,
    // "publishedSubjectFormFieldChildDetailId": 0,
    publishedSubjectFormFieldParentId: TNullableNumber;
    formName: string;
    folderName: TNullableString;
    fieldName: string;
    fieldLabel: string;
    publishedSubjectFormFieldParentIds: number[];
    // "parentIds": "12,68,70",
    // "formFieldDiscrepancyId": null,
    // "comments": null,
    // "status": null,
    // "subjectId": null,
    // "folderId": null,
    // "formId": null,
    // "createdByRole": null,
    // "assignedToRoles": null,
    // "statusName": null,
    // "subjectName": null,
    // "dateUpdated": null,
    // "type": null,
    // "count": null,
    // "updatedBy": 0,
    // "modifiedBy": null,
    // "modifiedDate": null
}
export interface IFormFieldDetailsResponse extends IApiResponseStatus, IApiResponseData {
    data: IFormFieldDetailsData;
}

export interface IProcessFormFieldEditCheckResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}

export interface IFormFieldDerivationStepData {
    id: number;
    derivationId: number;
    type: number;
    trialId: null;
    environmentId: null;
    subjectId: null;
    publishedSubjectFormFieldParentDetailId: null;
    publishedSubjectFormFieldParentId: null;
    siteId: null;
    siteName: null;
    folderId: TNullableNumber;
    folderName: null;
    formId: number;
    formName: null;
    fieldId: number;
    fieldName: null;
    variableId: number;
    variableName: null;
    recordPosition: number;
    isApplyToAllFolders: boolean;
    isApplyToAllFields: boolean;
    derivationFunctionId: TNullableNumber;
    derivationFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    stepOrder: number;
    isAction: boolean;
    updatedBy: number;
}
export interface IFormFieldDerivationActionData {
    id: number;
    derivationId: number;
    folderId: TNullableNumber;
    folderName: null;
    formId: number;
    formName: null;
    fieldId: number;
    fieldName: null;
    variableId: number;
    variableName: null;
    recordPosition: number;
    isApplyToAllFolders: boolean;
    isApplyToAllFields: boolean;
    isAction: boolean;
    isEnableField: boolean;
    updatedBy: number;
}
export interface IFormFieldDerivationData {
    steps: IFormFieldDerivationStepData[];
    actions: IFormFieldDerivationActionData[];
}
// export type TFormFieldDerivationData<T = IFormFieldDerivationData> = Record<string, T>;
export type TFormFieldDerivationData<T = IFormFieldDerivationData> = Record<
    string,
    Record<string, T>
>;
export interface IProcessFormFieldDerivationResponse extends IApiResponseStatus, IApiResponseData {
    data: TFormFieldDerivationData;
}

export interface IFormFieldEditCheckStepData {
    id: number;
    editCheckId: number;
    type: number;
    trialId: null;
    environmentId: null;
    subjectId: null;
    publishedSubjectFormFieldParentDetailId: null;
    publishedSubjectFormFieldParentId: null;
    siteId: null;
    siteName: null;
    folderId: TNullableNumber;
    folderName: null;
    formId: number;
    formName: null;
    fieldId: number;
    fieldName: null;
    variableId: number;
    variableName: null;
    recordPosition: number;
    isApplyToAllFolders: boolean;
    isApplyToAllFields: boolean;
    checkFunctionId: TNullableNumber;
    checkFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    stepOrder: number;
    updatedBy: number;
}
export interface IFormFieldEditCheckActionData {
    id: number;
    editCheckId: number;
    folderId: TNullableNumber;
    folderName: null;
    formId: number;
    formName: null;
    fieldId: number;
    fieldName: null;
    variableId: number;
    variableName: null;
    recordPosition: number;
    isApplyToAllFolders: boolean;
    isApplyToAllFields: boolean;
    actionMessage: TNullableString;
    actionType: number;
    updatedBy: number;
}

export interface IFormFieldEditCheckData {
    steps: IFormFieldEditCheckStepData[];
    actions: IFormFieldEditCheckActionData[];
}
export type TFormFieldVisibiltyEditCheckData<T = IFormFieldEditCheckData> = Record<
    string,
    Record<string, T>
>;
export interface IProcessFormFieldVisibiltyEditCheckResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: TFormFieldVisibiltyEditCheckData;
}

export interface IProcessFormFieldAddFormEditCheckData extends ITrialVisitAndFormDetails {
    checkResult: boolean;
}
export interface IProcessFormFieldAddFormEditCheckResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IProcessFormFieldAddFormEditCheckData;
}

export type TVisibilityEditCheckResult = Record<string, Record<string, boolean>>; // Record<string, boolean>;
export type TDisableEditCheckResult = Record<string, Record<string, boolean>>; // Record<string, boolean>;
export type TDerivationResult = Record<string, Record<string, string>>; // Record<string, boolean>;

export type TFormFieldDisableEditCheckData<T = IFormFieldEditCheckData> = Record<
    string,
    Record<string, T>
>;
export interface IProcessFormFieldDisableEditCheckResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: TFormFieldDisableEditCheckData;
}

export type TFormFieldNonLogDataEditCheckData<T = IFormFieldEditCheckData> = Record<string, T>;
export interface IProcessFormFieldNonLogDataEditCheckResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: TFormFieldNonLogDataEditCheckData;
}
