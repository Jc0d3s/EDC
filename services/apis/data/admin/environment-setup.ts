import type { TNullableNumber, TNullableString } from "~/types/common";

export default class EnvironmentSetup {
    id: TNullableNumber = null;

    environment: TNullableString = null;

    isActive: boolean = false;

    enrollmentTarget: TNullableNumber = null;

    startDate: TNullableString = null;

    reset(modelRef?: EnvironmentSetup) {
        this.environment = modelRef ? modelRef.environment : null;
        this.isActive = modelRef ? modelRef.isActive : false;
        this.enrollmentTarget = modelRef ? modelRef.enrollmentTarget : null;
        this.startDate = modelRef ? modelRef.startDate : null;
    }
}
