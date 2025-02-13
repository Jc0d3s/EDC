import type { TNullableNumber, TNullableString } from "~/types/common";

export default class TrialGroup {
    id: TNullableNumber = null;

    trialGroupName: TNullableString = null;

    trialType: TNullableString = null;

    trialSummary: TNullableString = null;

    trialDescription: TNullableString = null;

    reset(modelRef?: TrialGroup) {
        this.id = modelRef ? modelRef.id : null;
        this.trialGroupName = modelRef ? modelRef.trialGroupName : null;
        this.trialType = modelRef ? modelRef.trialType : null;
        this.trialSummary = modelRef ? modelRef.trialSummary : null;
        this.trialDescription = modelRef ? modelRef.trialDescription : null;
    }
}
