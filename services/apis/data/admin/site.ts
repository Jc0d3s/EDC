import type { TNullableNumber, TNullableString } from "~/types/common";

export default class Site {
    id: TNullableNumber = null;

    siteGroupId: TNullableNumber = null;

    siteName: TNullableString = null;

    siteNumber: TNullableString = null;

    notes: TNullableString = null;

    addressLine1: TNullableString = null;

    addressLine2: TNullableString = null;

    addressLine3: TNullableString = null;

    city: TNullableString = null;

    country: TNullableString = null;

    postalCode: TNullableString = null;

    state: TNullableString = null;

    telephone: TNullableString = null;

    isActive: boolean = true;

    reset(modelRef?: Site) {
        this.id = modelRef ? modelRef.id : null;
        this.siteGroupId = modelRef ? modelRef.siteGroupId : null;
        this.siteName = modelRef ? modelRef.siteName : null;
        this.siteNumber = modelRef ? modelRef.siteNumber : null;
        this.notes = modelRef ? modelRef.notes : null;
        this.addressLine1 = modelRef ? modelRef.addressLine1 : null;
        this.addressLine2 = modelRef ? modelRef.addressLine2 : null;
        this.addressLine3 = modelRef ? modelRef.addressLine3 : null;
        this.city = modelRef ? modelRef.city : null;
        this.country = modelRef ? modelRef.country : null;
        this.postalCode = modelRef ? modelRef.postalCode : null;
        this.state = modelRef ? modelRef.state : null;
        this.telephone = modelRef ? modelRef.telephone : null;
        this.isActive = modelRef ? modelRef.isActive : false;
    }
}
