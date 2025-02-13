import type { IOptions } from "~/types/common";

export default class FormEditCheck {
    appliedChecks: IOptions[] = [];

    reset(modelRef?: FormEditCheck) {
        this.appliedChecks = modelRef ? modelRef.appliedChecks : [];
    }
}
