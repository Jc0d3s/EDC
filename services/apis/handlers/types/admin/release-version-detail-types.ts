import type {
    IApiPagedResponseData,
    IApiResponseData,
    IApiResponseStatus,
} from "~/services/apis/service-call";
import type { TNullableNumber, TNullableString, TRestrictionEntry } from "~/types/common";
import type { IFieldRestrictionEntryData } from "./field-restriction-types";

// #region Forms
export interface IPublishedFormData {
    id: number;
    formOrderNumber: number;
    releaseVersionId: number;
    releaseVersionName: string;
    formName: string;
    formOID: string;
    helpText: TNullableString;
    formCount: number;
    otherVisit: boolean;
    isLabForm: boolean;
    isNavigateToSubjectDisposition: boolean;
    logDirection: string;
    redirectLink: string;
    saveConfirm: boolean;
    noOfFields: number;
    redirectFormId: TNullableNumber;
    redirectFolderId: TNullableNumber;
    isActive: boolean;
    isVisible: boolean;
    isCommon: boolean;
    signatureRequired: boolean;
    patientCloudForm: boolean;
    isTemplate: boolean;
    formType: number;
    updatedBy: number;
}

export interface IPublishedFormPaginationListResponse extends IApiResponseStatus, IApiResponseData {
    data: IApiPagedResponseData<IPublishedFormData>;
}
export interface IPublishedFormListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedFormData[];
}
// #endregion Forms

// #region Form Fields
export interface IPublishedFormFieldData {
    id: number;
    fieldVariableId: TNullableNumber;
    variableId: TNullableNumber;
    formFieldsId: number;
    fieldEditChecksId: TNullableNumber;
    varOID: TNullableString;
    format: TNullableString;
    dictionaryId: TNullableNumber;
    unitDictionaryId: TNullableNumber;
    codingDictionaryId: TNullableNumber;
    isDataDictionaryGlobal: boolean;
    isUnitDictionaryGlobal: boolean;
    orderNumber: number;
    oid: string;
    name: string;
    fieldNum: string;
    controlType: TNullableNumber;
    isLogDataEntry: boolean;
    isVisible: boolean;
    formId: number;
    helpText: TNullableString;
    requiresTranslation: boolean;
    doesNotParticipateSignature: boolean;
    promptClinicalSignificance: boolean;
    labAnalytics: TNullableNumber;
    indentLevel: number;
    defaultValue: TNullableString;
    sasLabel: TNullableString;
    sasFormat: TNullableString;
    label: string;
    header: string;
    fixedUnit: TNullableString;
    validExtensions: TNullableString;
    isActive: boolean;
    location: string;
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
    fieldRestrictionId: number;
    requiresVerification: boolean;
    manualReviews: IFieldRestrictionEntryData[];
    viewRestrictions: IFieldRestrictionEntryData[];
    entryRestrictions: IFieldRestrictionEntryData[];
    updatedBy: number;
}

export interface IPublishedFormFieldPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedFormFieldData>;
}

export interface IPublishedFormFieldGetByIDResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedFormFieldData;
}

export interface IPublishedFormFieldListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedFormFieldData[];
}
// #endregion Form Fields

// #region Trial Visits
export interface IPublishedTrialVisit {
    id: number;
    releaseVersionId: number;
    releaseVersionName: string;
    name: string;
    oid: string;
    // parentFolder: TNullableNumber;
    isUnscheduled: boolean;
    access: number;
    start: number;
    target: number;
    end: number;
    overDue: number;
    close: number;
    reusable: boolean;
    orderNumber: number;
    updatedBy: number;
}

export interface IPublishedTrialVisitPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedTrialVisit>;
}

export interface IPublishedTrialVisitListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedTrialVisit[];
}
// #endregion Trial Visits

// #region Matrices
export interface IPublishedMatrixData {
    id: number;
    releaseVersionId: number;
    releaseVersionName: string;
    name: string;
    oid: string;
    allowAdd: boolean;
    max: number;
    updatedBy: number;
}

export interface IPublishedAssignMatrixData {
    id: number;
    matricesId: number;
    matricesName: string;
    formId: number;
    formName: string;
    folderId: number;
    folderName: string;
    value: boolean;
    formCount: number;
    orderNumber: number;
    oldOrderNumber: number;
    newOrderNumber: number;
}

export interface IUpdatePublishedFormFolder {
    id: number;
    matricesId: number;
    matricesName: string;
    formId: number;
    formName: string;
    folderId: number;
    folderName: string;
    value: boolean;
}

export interface IPublishedMatricesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedMatrixData>;
}
export interface IPublishedMatrixListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedMatrixData[];
}
export interface IPublishedAssignMatrixListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedAssignMatrixData[];
}
export interface IUpdatePublishedFormFolderResponse extends IApiResponseStatus, IApiResponseData {
    data: null;
}
// #endregion Matrices

// #region Data Dictionaries
export interface IPublishedDictionaryData {
    id: number;
    releaseVersionId: number;
    releaseVersionName: string;
    branchId: number;
    name: string;
    numberOfEntries: number;
    updatedBy: number;
}

interface IPublishedDictionaryListData extends IPublishedDictionaryData {
    isGlobal: boolean;
}

export interface IPublishedDictionaryEntryData {
    id: number;
    dataDictionaryId: number;
    orderNumber: number;
    userDataString: string;
    specify: boolean;
    codedData: string;
    updatedBy: number;
}

export interface IPublishedDictionaryPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedDictionaryData>;
}

export interface IPublishedDataDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedDictionaryListData[];
}

export interface IPublishedDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedDictionaryEntryData>;
}
// #endregion Data Dictionaries

// #region Unit Dictionaries
export interface IPublishedUnitDictionaryData {
    id: number;
    releaseVersionId: number;
    releaseVersionName: string;
    name: string;
    numberOfEntries: number;
    hasStandardEntries: boolean;
    updatedBy: number;
}

export interface IPublishedUnitDictionaryListData extends IPublishedUnitDictionaryData {
    isGlobal: boolean;
}

export interface IPublishedUnitDictionaryEntryData {
    id: number;
    unitDictionaryId: number;
    orderNumber: number;
    userDataString: string;
    standard: boolean;
    formula: string;
    codedUnit: string;
    updatedBy: number;
}

export interface IPublishedUnitDictionaryPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedUnitDictionaryData>;
}

export interface IPublishedUnitDictionaryListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedUnitDictionaryListData[];
}

export interface IPublishedUnitDictionaryEntriesPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedUnitDictionaryEntryData>;
}
// #endregion Unit Dictionaries

// #region Form Restriction
export interface IPublishedFormRestrictionEntryData {
    id: number;
    formRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IPublishedFormRestrictionData {
    id: number;
    formId: number;
    formName: string;
    viewRestrictions: IPublishedFormRestrictionEntryData[];
    entryRestrictions: IPublishedFormRestrictionEntryData[];
    updatedBy: number;
}

export interface IPublishedFormRestrictionListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedFormRestrictionData[];
}
// #endregion Form Restriction

// #region Field Restriction
export interface IPublishedFieldRestrictionEntryData {
    id: number;
    fieldRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IPublishedFieldRestrictionData {
    id: number;
    formId: number;
    formName: string;
    fieldId: number;
    fieldName: string;
    requiresVerification: boolean;
    defaultValue: TNullableString;
    manualReviews: IPublishedFieldRestrictionEntryData[];
    viewRestrictions: IPublishedFieldRestrictionEntryData[];
    entryRestrictions: IPublishedFieldRestrictionEntryData[];
    updatedBy: number;
}

export interface IPublishedFieldRestrictionListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedFieldRestrictionData[];
}
// #endregion Field Restriction

// #region Global Field Restriction
export interface IPublishedGlobalFieldRestrictionEntryData {
    id: number;
    globalFieldRestrictionId: number;
    roleId: number;
    type: TRestrictionEntry;
    isActive: boolean;
    updatedBy: number;
}

export interface IPublishedGlobalFieldRestrictionData {
    id: number;
    formId: number;
    formName: string;
    requiresVerification: boolean;
    manualReviews: IPublishedGlobalFieldRestrictionEntryData[];
    viewRestrictions: IPublishedGlobalFieldRestrictionEntryData[];
    entryRestrictions: IPublishedGlobalFieldRestrictionEntryData[];
    updatedBy: number;
}

export interface IPublishedGlobalFieldRestrictionListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedGlobalFieldRestrictionData[];
}
// #endregion Global Field Restriction

// #region Edit Checks
export interface IPublishedEditCheckListData {
    id: number;
    releaseVersionId: number;
    isGlobal: boolean;
    name: string;
    byPassDuringMigration: boolean;
    isActive: boolean;
    updatedBy: number;
}

export interface IPublishedEditCheckByReleaseVersionIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedEditCheckListData[];
}

export interface IPublishedEditCheckPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedEditCheckListData>;
}

export interface IPublishedEditCheckStepData {
    id: number;
    editCheckId: number;
    stepOrder: number;
    type: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    formRepeatNumber: number;
    folderRepeatNumber: number;
    logicalRecordPosition: TNullableNumber;
    dataValue: TNullableNumber;
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    checkFunctionId: TNullableNumber;
    checkFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    updatedBy: number;
}

export interface IPublishedEditCheckStepsListResponse extends IApiResponseStatus, IApiResponseData {
    data: IPublishedEditCheckStepData[];
}

export interface IPublishedEditCheckActionData {
    id: number;
    editCheckId: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    formRepeatNumber: number;
    folderRepeatNumber: number;
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    actionMessage: TNullableString;
    actionType: TNullableNumber;
    updatedBy: number;
}

export interface IPublishedEditCheckActionsListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedEditCheckActionData[];
}
// #region Edit Checks

// #region Derivations
export interface IPublishedDerivationAppliedVariable {
    folderName: TNullableString;
    formName: TNullableString;
    fieldName: TNullableString;
    variableName: TNullableString;
}
export interface IPublishedDerivationListData {
    id: number;
    releaseVersionId: number;
    isGlobal: boolean;
    name: string;
    byPassDuringMigration: boolean;
    isActive: boolean;
    appliedVariable: IPublishedDerivationAppliedVariable[];
    updatedBy: number;
}

export interface IPublishedDerivationByReleaseVersionIdResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedDerivationListData[];
}

export interface IPublishedDerivationPaginationListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IApiPagedResponseData<IPublishedDerivationListData>;
}

export interface IPublishedDerivationStepData {
    id: number;
    derivationId: number;
    stepOrder: number;
    type: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    formRepeatNumber: number;
    folderRepeatNumber: number;
    logicalRecordPosition: TNullableNumber;
    dataValue: TNullableNumber;
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    derivationFunctionId: TNullableNumber;
    derivationFunctionName: TNullableString;
    value: TNullableString;
    format: TNullableString;
    updatedBy: number;
}

export interface IPublishedDerivationStepsListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedDerivationStepData[];
}

export interface IPublishedDerivationActionData {
    id: number;
    derivationId: number;
    folderId: TNullableNumber;
    folderName: TNullableString;
    formId: TNullableNumber;
    formName: TNullableString;
    fieldId: TNullableNumber;
    fieldName: TNullableString;
    variableId: TNullableNumber;
    variableName: TNullableString;
    recordPosition: number;
    formRepeatNumber: number;
    folderRepeatNumber: number;
    isApplyToAllFields: boolean;
    isApplyToAllFolders: boolean;
    isAction: TNullableString;
    isEnableField: boolean;
    updatedBy: number;
}

export interface IPublishedDerivationActionsListResponse
    extends IApiResponseStatus,
        IApiResponseData {
    data: IPublishedDerivationActionData[];
}
// #region Derivations
