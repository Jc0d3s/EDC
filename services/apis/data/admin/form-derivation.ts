import type { IOptions } from "~/types/common";

export default class FormDerivation {
    appliedDerivations: IOptions[] = [];

    reset(modelRef?: FormDerivation) {
        this.appliedDerivations = modelRef ? modelRef.appliedDerivations : [];
    }
}
