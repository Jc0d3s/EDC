import type { TNullableNumber, TNullableString } from "~/types/common";

export type TLogDirection = "vertical" | "horizontal";

export default class Form {
    id: TNullableNumber = null;

    formName: TNullableString = null;

    formOID: TNullableString = null;

    helpText: TNullableString = null;

    otherVisit: boolean = false;

    logDirection: TLogDirection | null = null;

    saveConfirm: boolean = false;

    redirectLink: TNullableString = null;

    patientCloudForm: boolean = false;

    formOrderNumber: TNullableNumber = null;

    isTemplate: boolean = false;

    reset(modelRef?: Form) {
        this.formName = modelRef ? modelRef.formName : null;
        this.formOID = modelRef ? modelRef.formOID : null;
        this.helpText = modelRef ? modelRef.helpText : null;
        this.otherVisit = modelRef ? modelRef.otherVisit : false;
        this.logDirection = modelRef ? modelRef.logDirection : null;
        this.saveConfirm = modelRef ? modelRef.saveConfirm : false;
        this.redirectLink = modelRef ? modelRef.redirectLink : null;
        this.patientCloudForm = modelRef ? modelRef.patientCloudForm : false;
        this.formOrderNumber = modelRef ? modelRef.formOrderNumber : null;
        this.isTemplate = modelRef ? modelRef.isTemplate : false;
    }
}
