import type { TNullableString } from "~/types/common";

export default class TrialSite {
    siteName: TNullableString = null;

    siteNumber: TNullableString = null;

    notes: TNullableString = null;

    address: TNullableString = null;

    reset(modelRef?: TrialSite) {
        this.siteName = modelRef ? modelRef.siteName : null;
        this.siteNumber = modelRef ? modelRef.siteNumber : null;
        this.notes = modelRef ? modelRef.notes : null;
        this.address = modelRef ? modelRef.address : null;
    }
}
