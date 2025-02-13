<script setup lang="ts">
import { ref, onMounted } from "vue";
import EdcAccordion from "@/components/EdcAccordion.vue";
import EdcActionButton from "@/components/EdcActionButton.vue";
import EdcCheckbox from "@/components/EdcCheckbox.vue";
import EdcBreadcrumb from "@/components/EdcBreadcrumb.vue";
import EdcPopupModal from "@/components/EdcPopupModal.vue";
import EdcRadio from "@/components/EdcRadio.vue";
import EdcSearchBar from "@/components/EdcSearchBar.vue";
import EdcTabView from "@/components/EdcTabView.vue";
import EdcTextArea from "@/components/EdcTextArea.vue";
import EdcCalendar from "@/components/EdcCalendar.vue"; // ✅ Import Calendar Component
import usePopupModalStore from "~/stores/popup-modal";
import EdcDataTable from "./components/EdcDataTable.vue";
import EdcDropdown from "@/components/EdcDropdown.vue"; // ✅ Imported Dropdown Component


// **State**
const dataCount = ref(1);
const loading = ref(false);
const isActive = ref(false);
const breadCrumbDetails = ref<string[]>([]);
const popupModalStore = usePopupModalStore();
const textAreaValue = ref<string | null>(null);
// **State**
const selectedDropdownOption = ref(null);
const dropdownOptions = ref([
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" }
]);


// **Search Input State**
const searchQuery = ref<string | null>(null);

// **Calendar & Date Selection State**
const selectedDate = ref<string | null>(null); // ✅ Holds selected date
const predefinedDates = ref([
    "2025-01-01",
    "2025-02-14",
    "2025-07-04",
    "2025-12-25"
]);

// Initialize breadcrumb details
onMounted(() => {
    breadCrumbDetails.value = ["Home", "Page 1", "Page 2"];
});

// **Tab Navigation State**
const tabs = ["Overview", "Details", "Settings"];
const activeTabIndex = ref(0);

// ✅ Handle Tab Switching
const handleTabChange = (index: number) => {
    activeTabIndex.value = index;
};

// ✅ Handle Date Change (From Calendar)
const handleDateChange = (date: string | null) => {
    selectedDate.value = date;
    console.log("Selected Date:", date);
};

// ✅ Handle Date Selection (From Dropdown)
const handleDropdownDateChange = (event: Event) => {
    const selectedValue = (event.target as HTMLSelectElement).value;
    selectedDate.value = selectedValue;
    console.log("Dropdown Selected Date:", selectedValue);
};

// ✅ Handle Button Click (Opens Modal)
const handleButtonClick = () => {
    console.log("Button clicked");
    popupModalStore.show("example-modal");
};

// ✅ Handle Modal Actions
const handleModalSubmit = (closeModal: () => void) => {
    console.log("Modal Submitted");
    closeModal();
};
const handleModalCancel = (closeModal: () => void) => {
    console.log("Modal Canceled");
    closeModal();
};

// ✅ Checkbox State
const checkboxValue = ref(false);
const handleCheckboxChange = (checked: boolean) => {
    checkboxValue.value = checked;
};

// ✅ Radio Button State
const selectedRadio = ref<string | null>(null);
const handleRadioChange = (value: string) => {
    selectedRadio.value = value;
    console.log("Selected Radio:", value);
};
</script>

<template>
    <div class="p-4"/>
        <!-- ✅ Breadcrumb Component -->
        <p class="text-blue-500">Debug: {{ breadCrumbDetails }}</p>
        <EdcBreadcrumb v-if="breadCrumbDetails.length" :breadCrumbDetails="breadCrumbDetails" type="clinical-trials" />

        <!-- ✅ Tabs Component -->
        <EdcTabView 
            :tabs="tabs" 
            :activeIndex="activeTabIndex" 
            @on-tab-change="handleTabChange" 
        />

        <!-- ✅ Tabbed Content -->
        <section v-if="activeTabIndex === 0">
            <h1 class="text-2xl font-bold mb-4">Overview</h1>
            <p>Welcome to the overview section.</p>
        </section>

        <section v-if="activeTabIndex === 1">
            <h1 class="text-2xl font-bold mb-4">Details</h1>
            <p>Here are the details.</p>
        </section>

        <section v-if="activeTabIndex === 2">
            <h1 class="text-2xl font-bold mb-4">Settings</h1>
            <p>Adjust your settings here.</p>
        </section>

        <!-- ✅ Search Input Component -->
        <EdcSearchBar
            elementId="search-bar"
            v-model="searchQuery"
            placeholder="Search something..."
            @on-input="console.log('Search input changed:', searchQuery)"
            @on-search="console.log('Search submitted:', searchQuery)"
        />

        <!-- ✅ Date Selection -->
        <div class="mt-4">
            <h2 class="text-lg font-semibold">Select a Date:</h2>
            
            <!-- ✅ Dropdown Date Selector -->
            <label for="date-dropdown" class="block text-gray-700">Choose a date:</label>
            <select 
                id="date-dropdown" 
                class="border p-2 rounded w-full mt-2" 
                @change="handleDropdownDateChange"
            >
                <option value="">-- Select a Date --</option>
                <option v-for="date in predefinedDates" :key="date" :value="date">
                    {{ date }}
                </option>
            </select>

            <!-- ✅ Calendar Date Picker -->
            <EdcCalendar
    v-model="selectedDate"
    format="DD-MMM-YYYY"
    placeholder="Pick a date"
    @change="handleDateChange" 
/>


            <p class="text-gray-600 mt-2">Selected Date: {{ selectedDate || "None" }}</p>
        </div>

        <!-- ✅ Accordion Component -->
        <EdcAccordion
            :dataCount="dataCount"
            :loading="loading"
            :isActive="isActive"
            @on-heading-click="isActive = !isActive"
        >
            <template #header>
                <span>Accordion Header</span>
            </template>
            <template #timeline>
                <p>This is the accordion content.</p>
            </template>
        </EdcAccordion>

        <!-- ✅ Action Button to Open Modal -->
        <EdcActionButton
            label="Open Modal"
            type="submit"
            :disabled="loading"
            :showLoader="loading"
            @click="handleButtonClick"
        />
        <div class="p-4">
        <h2 class="text-lg font-semibold">Dropdown Selection</h2>
        


        <EdcDataTable
      :columns="[
        { header: 'ID', field: 'id', show: true, icon: false },
        { header: 'Name', field: 'name', show: true, icon: false }
      ]"
      :tableData="[
        { id: 1, name: 'John', age: 25 },
        { id: 2, name: 'Jane', age: 30 },
        { id: 3, name: 'Jack', age: 35 }
      ]"
      paginationType="classic"
    />


        <!-- ✅ TextArea Component -->
        <EdcTextArea
            v-model="textAreaValue"
            label="Description"
            placeholder="Enter details..."
            :showCharacterCount="true"
        />

        <!-- ✅ Checkbox Component -->
        <EdcCheckbox
            name="checkbox"
            v-model="checkboxValue"
            label="Checkbox"
            @on-change="handleCheckboxChange"
        />

        <!-- ✅ Radio Button Component -->
        <div class="mt-4">
            <h2 class="text-lg font-semibold">Select an Option:</h2>
            <EdcRadio
                name="options"
                label="Option 1"
                value="option1"
                v-model="selectedRadio"
                @on-change="handleRadioChange"
            />
            <EdcRadio
                name="options"
                label="Option 2"
                value="option2"
                v-model="selectedRadio"
                @on-change="handleRadioChange"
            />
            <EdcRadio
                name="options"
                label="Option 3"
                value="option3"
                v-model="selectedRadio"
                @on-change="handleRadioChange"
            />
        </div>

        <!-- ✅ Modal Component -->
        <EdcPopupModal
            modalId="example-modal"
            submitLabel="Confirm"
            cancelLabel="Cancel"
            :onSubmit="handleModalSubmit"
            :onCancel="handleModalCancel"
        >
            <template #default>
                <p>This is a modal example. Would you like to continue?</p>
            </template>
        </EdcPopupModal>
    </div>
</template>

<style scoped>
.p-4 {
    padding: 1rem;
}
.text-lg {
    font-size: 1.25rem;
}
.font-semibold {
    font-weight: 600;
}
</style>
