import type { TTableLoaderDetail } from "~/types/common";

export default class Loading {
    table: boolean = false;

    secondaryTable: boolean = false;

    form: boolean = false;

    dynamicLoading: Record<string, boolean> = {};

    reset() {
        this.table = false;
        this.secondaryTable = false;
        this.form = false;
        this.dynamicLoading = {};
    }

    setDynamicLoading(keys: string[]) {
        for (const key of keys) {
            this.dynamicLoading[key] = false;
        }
    }

    isDisabled(...disabledValues: boolean[]) {
        return isElementDisabled(
            this.table,
            this.form,
            this.secondaryTable,
            ...disabledValues,
            ...Object.values(this.dynamicLoading),
        );
    }
}

export function setLoaderForArrayDatas(data: any[]) {
    const result: TTableLoaderDetail = {};
    for (let i = 0; i <= getArrayLength(data) - 1; i++) {
        result[i] = false;
    }
    return deepClone(result);
}
