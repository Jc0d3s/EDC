import type { TIDType, TNullableNumber, TNullableString } from "~/types/common";

export default class Trial {
    id: TNullableNumber = null;

    trialName: TNullableString = null;

    trialGroupId: TIDType = null;

    ownerId: TIDType = null;

    ownerName: TNullableString = null;

    protocolNumber: TNullableString = null;

    drugOrDevice: TNullableString = null;

    compoundOrCode: TNullableString = null;

    program: TNullableString = null;

    protocol: TNullableString = null;

    phaseId: TNullableNumber = null;

    phaseName: TNullableString = null;

    indication: TNullableString = null;

    responsibleParty: TNullableString = null;

    enrollmentTarget: TNullableNumber = null;

    therapeuticAreaId: TIDType = null;

    therapeuticAreaName: TNullableString = null;

    liveDate: TNullableString = null;

    closeDate: TNullableString = null;

    title: TNullableString = null;

    summary: TNullableString = null;

    description: TNullableString = null;

    isProduction: boolean = false;

    reset(modelRef?: Trial) {
        this.id = modelRef ? modelRef.id : null;
        this.trialName = modelRef ? modelRef.trialName : null;
        this.trialGroupId = modelRef ? modelRef.trialGroupId : null;
        this.ownerId = modelRef ? modelRef.ownerId : null;
        this.protocolNumber = modelRef ? modelRef.protocolNumber : null;
        this.drugOrDevice = modelRef ? modelRef.drugOrDevice : null;
        this.compoundOrCode = modelRef ? modelRef.compoundOrCode : null;
        this.program = modelRef ? modelRef.program : null;
        this.protocol = modelRef ? modelRef.protocol : null;
        this.phaseId = modelRef ? modelRef.phaseId : null;
        this.phaseName = modelRef ? modelRef.phaseName : null;
        this.indication = modelRef ? modelRef.indication : null;
        this.responsibleParty = modelRef ? modelRef.responsibleParty : null;
        this.enrollmentTarget = modelRef ? modelRef.enrollmentTarget : null;
        this.therapeuticAreaId = modelRef ? modelRef.therapeuticAreaId : null;
        this.therapeuticAreaName = modelRef ? modelRef.therapeuticAreaName : null;
        this.liveDate = modelRef ? modelRef.liveDate : null;
        this.closeDate = modelRef ? modelRef.closeDate : null;
        this.title = modelRef ? modelRef.title : null;
        this.summary = modelRef ? modelRef.summary : null;
        this.description = modelRef ? modelRef.description : null;
        this.isProduction = modelRef ? modelRef.isProduction : false;
        this.ownerName = null;
    }
}
