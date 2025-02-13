import type { TNullableString } from "~/types/common";

export default class FormFieldPatientCloudOption {
    controlType: TNullableString = null;

    reset(modelRef?: FormFieldPatientCloudOption) {
        this.controlType = modelRef ? modelRef.controlType : null;
    }
}
