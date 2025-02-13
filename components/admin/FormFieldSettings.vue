<script setup lang="ts">
    import type { IMenuList } from "~/services/apis/data/admin/form-field";

    defineProps<{
        menusList: IMenuList[];
    }>();

    // const labelClasses = (level: number, childrenLength: number, menuExpanded: boolean) => {
    //     let result = "";
    //     if (level === 0) result = "font-bold";
    //     else if (childrenLength !== 0 && menuExpanded) result = "font-bold";
    //     else if (childrenLength !== 0 && !menuExpanded) result = "font-medium";
    //     else if (childrenLength === 0 && menuExpanded) result = "font-bold secondary-text";
    //     else result = "font-medium gray-text";
    //     return result;
    // };

    function changeExpandStatus(rowId: number, menuRows: IMenuList[]) {
        for (const row of menuRows) {
            if (rowId === row.id) row.expand = !row.expand;
            // else row.expand = false; // TODO: uncomment this if only one tab should be active at a time
        }
    }
</script>

<template>
    <ul class="transition-all flex flex-col gap-[1rem]">
        <template v-for="menuRow of menusList" :key="menuRow.id">
            <li class="flex flex-row items-center gap-[1rem]">
                <edc-pressable
                    :class="'bg-white parent-menu'"
                    slot-wrapper-class="!flex !flex-row !items-center gap-[1rem]"
                    :on-click="
                        () => {
                            // menuRow.expand = !menuRow.expand;
                            changeExpandStatus(menuRow.id, menusList);
                        }
                    "
                >
                    <edc-icon
                        icon="chevron-right-sharp"
                        :class="`transition-all !w-[1.1rem] !h-[1.1rem] ${menuRow.expand ? 'rotate-90' : ''}`"
                        :fill="'var(--color-black)'"
                    />
                    <span :class="['form-menu-link font-bold']">{{ menuRow.label }}</span>
                </edc-pressable>
                <!-- <span :class="['form-menu-link font-bold']">{{ menuRow.label }}</span> -->
            </li>
            <edc-transition-height>
                <div
                    v-if="menuRow.expand"
                    class="bg-[var(--color-gray-background)] flex flex-col gap-[1rem] px-[3rem] py-[2rem]"
                >
                    <slot :name="convertWordsIntoCasedWords(menuRow.label, 'pascal case')" />
                </div>
            </edc-transition-height>
            <!-- <edc-transition-height>
                <ul v-if="menuRow.expand && menuRow.children" class="transition-all pl-[3rem]">
                    <edc-form-menu-node :menus-list="menuRow.children" /></ul
            ></edc-transition-height> -->
        </template>
    </ul>
</template>

<style scoped>
    .parent-menu {
        border-radius: var(--border-radius-5);
        border: 0.1rem solid var(--color-border);
        padding: 0.3rem;
    }
</style>
