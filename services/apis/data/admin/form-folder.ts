import type { TNullableNumber, TNullableString } from "~/types/common";

export type TLogDirection = "vertical" | "horizontal";

export default class FormFolder {
    id: TNullableNumber = null;

    name: TNullableString = null;

    OID: TNullableString = null;

    access: TNullableNumber = null;

    start: TNullableNumber = null;

    target: TNullableNumber = null;

    end: TNullableNumber = null;

    overdue: TNullableNumber = null;

    close: TNullableNumber = null;

    reusable: boolean = false;

    formOrderNumber: number = 0;

    reset(modelRef?: FormFolder) {
        this.name = modelRef ? modelRef.name : null;
        this.OID = modelRef ? modelRef.OID : null;
        this.access = modelRef ? modelRef.access : null;
        this.start = modelRef ? modelRef.start : null;
        this.target = modelRef ? modelRef.target : null;
        this.end = modelRef ? modelRef.end : null;
        this.overdue = modelRef ? modelRef.overdue : null;
        this.close = modelRef ? modelRef.close : null;
        this.reusable = modelRef ? modelRef.reusable : false;
        this.formOrderNumber = modelRef ? modelRef.formOrderNumber : 0;
    }
}
