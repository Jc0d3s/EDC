import type { TNullableNumber } from "~/types/common";
import type { IFormFieldData } from "../../handlers/types/admin/form-field-types";

interface ILowHigh {
    low: TNullableNumber;
    high: TNullableNumber;
}

export default class FormFieldEditCheck {
    autoQueryForRequiredDataEntry: boolean = false;

    autoQueryForNonConformantData: boolean = false;

    autoQueryForFutureDateOrTime: boolean = false;

    autoQueryForDataOutOfRange: ILowHigh = {
        low: null,
        high: null,
    };

    makeNonConformantDataOutOfRange: ILowHigh = {
        low: null,
        high: null,
    };

    set(data: IFormFieldData) {
        this.autoQueryForRequiredDataEntry = data.autoQueryForRequiredDataEntry
            ? data.autoQueryForRequiredDataEntry
            : false;
        this.autoQueryForNonConformantData = data.autoQueryForNonConformantData
            ? data.autoQueryForNonConformantData
            : false;
        this.autoQueryForFutureDateOrTime = data.autoQueryForFutureDateTime
            ? data.autoQueryForFutureDateTime
            : false;
        this.autoQueryForDataOutOfRange.low = data.autoQueryForDataOutOfRangeLowValue
            ? data.autoQueryForDataOutOfRangeLowValue
            : null;
        this.autoQueryForDataOutOfRange.high = data.autoQueryForDataOutOfRangeHighValue
            ? data.autoQueryForDataOutOfRangeHighValue
            : null;
        this.makeNonConformantDataOutOfRange.low = data.markNonConformantDataOutOfRangeLowValue
            ? data.markNonConformantDataOutOfRangeLowValue
            : null;
        this.makeNonConformantDataOutOfRange.high = data.markNonConformantDataOutOfRangeHighValue
            ? data.markNonConformantDataOutOfRangeHighValue
            : null;
    }

    reset(modelRef?: FormFieldEditCheck) {
        this.autoQueryForRequiredDataEntry = modelRef
            ? modelRef.autoQueryForRequiredDataEntry
            : false;
        this.autoQueryForNonConformantData = modelRef
            ? modelRef.autoQueryForNonConformantData
            : false;
        this.autoQueryForFutureDateOrTime = modelRef
            ? modelRef.autoQueryForFutureDateOrTime
            : false;
        this.autoQueryForDataOutOfRange.low = modelRef
            ? modelRef.autoQueryForDataOutOfRange.low
            : null;
        this.autoQueryForDataOutOfRange.high = modelRef
            ? modelRef.autoQueryForDataOutOfRange.high
            : null;
        this.makeNonConformantDataOutOfRange.low = modelRef
            ? modelRef.makeNonConformantDataOutOfRange.low
            : null;
        this.makeNonConformantDataOutOfRange.high = modelRef
            ? modelRef.makeNonConformantDataOutOfRange.high
            : null;
    }
}
