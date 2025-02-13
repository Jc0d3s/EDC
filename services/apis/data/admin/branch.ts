import type { TNullableNumber, TNullableString } from "~/types/common";

export default class Branch {
    id: TNullableNumber = null;

    trialId: TNullableNumber = null;

    branchType: TNullableString = "blankProjectBranch";

    branchName: TNullableString = null;

    confirmationMessage: TNullableString = null;

    isGlobal: boolean = false;

    signaturePrompt: TNullableString = null;

    primaryForm: TNullableNumber = null;

    primaryFormName: TNullableString = null;

    defaultMatrix: TNullableNumber = null;

    defaultMatrixName: TNullableString = null;

    lockCRFVersion: boolean = false;

    reset(modelRef?: Branch) {
        this.id = modelRef ? modelRef.id : null;
        this.trialId = modelRef ? modelRef.trialId : null;
        this.branchType = modelRef ? modelRef.branchType : "blankProjectBranch";
        this.branchName = modelRef ? modelRef.branchName : null;
        this.confirmationMessage = modelRef ? modelRef.confirmationMessage : null;
        this.isGlobal = modelRef ? modelRef.isGlobal : false;
        this.signaturePrompt = modelRef ? modelRef.signaturePrompt : null;
        this.primaryForm = modelRef ? modelRef.primaryForm : null;
        this.primaryFormName = modelRef ? modelRef.primaryFormName : null;
        this.defaultMatrix = modelRef ? modelRef.defaultMatrix : null;
        this.defaultMatrixName = modelRef ? modelRef.defaultMatrixName : null;
        this.lockCRFVersion = modelRef ? modelRef.lockCRFVersion : false;
    }
}
