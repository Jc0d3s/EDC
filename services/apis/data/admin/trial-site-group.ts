import type { TNullableNumber, TNullableString } from "~/types/common";

export default class TrialSiteGroup {
    "id": TNullableNumber;
    "trialId": TNullableNumber;
    "siteGroupName": TNullableString;
    "siteDescription": TNullableString;
    "updatedBy": TNullableNumber;

    reset(modelRef?: TrialSiteGroup) {
        this.id = modelRef ? modelRef.id : null;
        this.trialId = modelRef ? modelRef.trialId : null;
        this.siteGroupName = modelRef ? modelRef.siteGroupName : null;
        this.siteDescription = modelRef ? modelRef.siteDescription : null;
        this.updatedBy = modelRef ? modelRef.updatedBy : null;
    }
}
