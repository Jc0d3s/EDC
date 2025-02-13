import type { TNullableNumber, TNullableString, TOptionValue } from "~/types/common";
import type {
    IFieldRestrictionData,
    IFieldRestrictionEntryData,
} from "../../handlers/types/admin/field-restriction-types";
import type { IFormFieldData } from "../../handlers/types/admin/form-field-types";

export default class FieldRestriction {
    id: TNullableNumber = null;

    formId: TNullableNumber = null;

    formName: TNullableString = null;

    requiresVerification: boolean = false;

    requiresManualReview: boolean = false;

    manualReviews: TOptionValue[] = [];

    viewRestrictions: TOptionValue[] = [];

    entryRestrictions: TOptionValue[] = [];

    manualReviewsOriginal: IFieldRestrictionEntryData[] = [];

    viewRestrictionsOriginal: IFieldRestrictionEntryData[] = [];

    entryRestrictionsOriginal: IFieldRestrictionEntryData[] = [];

    setFieldRestrictionEntryTableData = (tableData: IFieldRestrictionEntryData[]) =>
        tableData.map((row) => ({
            id: row.id,
            fieldRestrictionId: row.fieldRestrictionId,
            roleId: row.roleId,
            type: row.type,
            isActive: row.isActive,
            updatedBy: 0,
        })) as IFieldRestrictionEntryData[];

    setFieldRestrictionEntries(tableData: IFieldRestrictionEntryData[]) {
        const result: TOptionValue[] = [];
        for (const row of tableData) {
            if (row.isActive) result.push(row.roleId);
        }
        return [...result];
    }

    setFieldRestrictionTableData(tableData: IFieldRestrictionData[]) {
        return tableData.map((row) => ({
            id: row.id,
            formId: row.formId,
            formName: row.formName,
            fieldId: row.fieldId,
            fieldName: row.fieldName,
            defaultValue: row.defaultValue,
            requiresVerification: row.requiresVerification,
            manualReviews: this.setFieldRestrictionEntries(row.manualReviews),
            viewRestrictions: this.setFieldRestrictionEntries(row.viewRestrictions),
            entryRestrictions: this.setFieldRestrictionEntries(row.entryRestrictions),
            viewRestrictionsOriginal: this.setFieldRestrictionEntryTableData(row.viewRestrictions),
            entryRestrictionsOriginal: this.setFieldRestrictionEntryTableData(
                row.entryRestrictions,
            ),
            manualReviewsOriginal: this.setFieldRestrictionEntryTableData(row.manualReviews),
            updatedBy: 0,
        }));
    }

    set(data: IFormFieldData) {
        this.id = data ? data.id : null;
        this.formId = data ? data.formId : null;
        this.formName = null;
        this.requiresVerification = data ? data.requiresVerification : false;
        this.requiresManualReview = !!(data && getArrayLength(data.manualReviews) > 0);
        this.manualReviews = data ? this.setFieldRestrictionEntries(data.manualReviews) : [];
        this.viewRestrictions = data ? this.setFieldRestrictionEntries(data.viewRestrictions) : [];
        this.entryRestrictions = data
            ? this.setFieldRestrictionEntries(data.entryRestrictions)
            : [];
        this.manualReviewsOriginal = data
            ? this.setFieldRestrictionEntryTableData(data.manualReviews)
            : [];
        this.viewRestrictionsOriginal = data
            ? this.setFieldRestrictionEntryTableData(data.viewRestrictions)
            : [];
        this.entryRestrictionsOriginal = data
            ? this.setFieldRestrictionEntryTableData(data.entryRestrictions)
            : [];
    }

    reset(modelRef?: FieldRestriction) {
        this.id = modelRef ? modelRef.id : null;
        this.formId = modelRef ? modelRef.formId : null;
        this.formName = modelRef ? modelRef.formName : null;
        this.requiresVerification = modelRef ? modelRef.requiresVerification : false;
        this.requiresManualReview = modelRef ? modelRef.requiresManualReview : false;
        this.manualReviews = modelRef ? modelRef.manualReviews : [];
        this.viewRestrictions = modelRef ? modelRef.viewRestrictions : [];
        this.entryRestrictions = modelRef ? modelRef.entryRestrictions : [];
        this.manualReviewsOriginal = modelRef ? modelRef.manualReviewsOriginal : [];
        this.viewRestrictionsOriginal = modelRef ? modelRef.viewRestrictionsOriginal : [];
        this.entryRestrictionsOriginal = modelRef ? modelRef.entryRestrictionsOriginal : [];
    }
}
