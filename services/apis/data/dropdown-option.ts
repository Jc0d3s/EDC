import type { IOptions } from "~/types/common";

export default class DropdownOption {
    options: IOptions[] = [];

    loading: boolean = false;

    reset() {
        this.options = [];
        this.loading = false;
    }
}
