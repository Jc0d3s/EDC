import type { TNullableNumber, TNullableString } from "~/types/common";
import type { IFormFieldData } from "../../handlers/types/admin/form-field-types";

export default class FormFieldVariable {
    id: TNullableNumber = null;

    OID: TNullableString = null;

    fieldId: TNullableNumber = null;

    branchId: TNullableNumber = null;

    format: TNullableString = null;

    dictionaryId: TNullableNumber = null;

    unitDictionaryId: TNullableNumber = null;

    codeDictionaryId: TNullableNumber = null;

    set(data: IFormFieldData) {
        this.id = data.fieldVariableId;
        this.OID = data.varOID;
        this.fieldId = data.id;
        this.branchId = null; // data.branchId;
        this.format = data.format;
        this.dictionaryId = data.dictionaryId || null;
        this.unitDictionaryId = data.unitDictionaryId || null;
        this.codeDictionaryId = data.codingDictionaryId || null;
    }

    reset(modelRef?: FormFieldVariable) {
        this.id = modelRef ? modelRef.id : null;
        this.OID = modelRef ? modelRef.OID : null;
        this.fieldId = modelRef ? modelRef.fieldId : null;
        this.branchId = modelRef ? modelRef.branchId : null;
        this.format = modelRef ? modelRef.format : null;
        this.dictionaryId = modelRef ? modelRef.dictionaryId : null;
        this.unitDictionaryId = modelRef ? modelRef.unitDictionaryId : null;
        this.codeDictionaryId = modelRef ? modelRef.codeDictionaryId : null;
    }
}
