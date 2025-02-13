import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IFormFieldData } from "../../handlers/types/admin/form-field-types";

export interface IMenuList {
    id: number;
    label: string;
    expand: boolean;
}

export default class FormField {
    id: TNullableNumber = null;

    name: TNullableString = null;

    fieldNum: TNullableString = null;

    OID: TNullableString = null;

    indentLevel: TNullableNumber = 0;

    isLogDataEntry: boolean = false;

    isVisible: boolean = true;

    formId: TNullableNumber = null;

    label: TNullableString = null;

    header: TNullableString = null;

    fixedUnit: TNullableString = null;

    validExtensions: TNullableString = null;

    isActive: boolean = true;

    location: TNullableString = null;

    orderNumber: number = 0;

    oldOrderNumber: number = 0;

    newOrderNumber: number = 0;

    fieldHelpText: TNullableString = null;

    canSetRecordDate: boolean = false;

    canSetDataPageDate: boolean = false;

    canSetInstanceDate: boolean = false;

    canSetSubjectDate: boolean = false;

    showPreviousVisitValues: boolean = false;

    requiresTranslation: boolean = false;

    doesNotParticipateInSignature: boolean = true;

    labAnalyte: TNullableNumber = null;

    defaultValue: TNullableString = null;

    sasLabel: TNullableString = null;

    sasFormat: TNullableString = null;

    controlType: TNullableNumber = null;

    controlTypeName: TNullableString = null;

    helpText: TNullableString = null;

    set(data: IFormFieldData) {
        this.id = data.id;
        this.name = data.name;
        this.fieldNum = data.fieldNum;
        this.OID = data.oid;
        this.indentLevel = data.indentLevel;
        this.isLogDataEntry = data.isLogDataEntry;
        this.isVisible = data.isVisible;
        this.formId = data.formId;
        this.label = data.label;
        this.header = data.header;
        this.fixedUnit = data.fixedUnit;
        this.validExtensions = data.validExtensions;
        this.isActive = data.isActive;
        this.location = data.location;
        this.orderNumber = data.orderNumber;
        this.oldOrderNumber = data.oldOrderNumber;
        this.newOrderNumber = data.newOrderNumber;
        this.fieldHelpText = data.fieldHelpText;
        this.canSetRecordDate = data.canSetRecordDate;
        this.canSetDataPageDate = data.canSetDatapage;
        this.canSetInstanceDate = data.canSetInstanceDate;
        this.canSetSubjectDate = data.canSetSubjectDate;
        this.showPreviousVisitValues = data.showPreviousVisitValues;
        this.requiresTranslation = data.requiresTranslation;
        this.doesNotParticipateInSignature = data.doesNotParticipateSignature;
        this.labAnalyte = data.labAnalytics;
        this.defaultValue = data.defaultValue;
        this.sasLabel = data.sasLabel;
        this.sasFormat = data.sasFormat;
        this.controlType = data.controlType || null;
        this.controlTypeName = ""; // data.controlTypeName;
        this.helpText = data.helpText;
    }

    reset(modelRef?: FormField) {
        this.name = modelRef ? modelRef.name : null;
        this.fieldNum = modelRef ? modelRef.fieldNum : null;
        this.OID = modelRef ? modelRef.OID : null;
        this.indentLevel = modelRef ? modelRef.indentLevel : 0;
        this.isLogDataEntry = modelRef ? modelRef.isLogDataEntry : false;
        this.isVisible = modelRef ? modelRef.isVisible : true;
        this.formId = modelRef ? modelRef.formId : null;
        this.label = modelRef ? modelRef.label : null;
        this.header = modelRef ? modelRef.header : null;
        this.fixedUnit = modelRef ? modelRef.fixedUnit : null;
        this.validExtensions = modelRef ? modelRef.validExtensions : null;
        this.isActive = modelRef ? modelRef.isActive : true;
        this.location = modelRef ? modelRef.location : null;
        this.orderNumber = modelRef ? modelRef.orderNumber : 0;
        this.oldOrderNumber = modelRef ? modelRef.oldOrderNumber : 0;
        this.newOrderNumber = modelRef ? modelRef.newOrderNumber : 0;
        this.fieldHelpText = modelRef ? modelRef.fieldHelpText : null;
        this.canSetRecordDate = modelRef ? modelRef.canSetRecordDate : false;
        this.canSetDataPageDate = modelRef ? modelRef.canSetDataPageDate : false;
        this.canSetInstanceDate = modelRef ? modelRef.canSetInstanceDate : false;
        this.canSetSubjectDate = modelRef ? modelRef.canSetSubjectDate : false;
        this.showPreviousVisitValues = modelRef ? modelRef.showPreviousVisitValues : false;
        this.requiresTranslation = modelRef ? modelRef.requiresTranslation : false;
        this.doesNotParticipateInSignature = modelRef
            ? modelRef.doesNotParticipateInSignature
            : true;
        this.labAnalyte = modelRef ? modelRef.labAnalyte : null;
        this.defaultValue = modelRef ? modelRef.defaultValue : null;
        this.sasLabel = modelRef ? modelRef.sasLabel : null;
        this.sasFormat = modelRef ? modelRef.sasFormat : null;
        this.controlType = modelRef ? modelRef.controlType : null;
        this.controlTypeName = modelRef ? modelRef.controlTypeName : null;
        this.helpText = modelRef ? modelRef.helpText : null;
    }
}
