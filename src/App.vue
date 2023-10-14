<template>
  <div id="content">
    <h1>😡 Vue Angry Select</h1>
    <section>
      <p>
        An accessible and customisable select dropdown for Vue that transcends
        all other selects.
      </p>
      <p>
        <strong class="bold">One select to rule them all.</strong>
      </p>
    </section>

    <h2>Multiselect</h2>
    <AngryMultiSelect
      :="config"
      :options="[...options, ...options2, ...options3]"
      v-model:ids="multiIds"
      :close-on-select="config.closeOnSelect"
      :search-handler="config.customMatcher ? customMatcher : null"
    />
    <div>Selected IDs: {{ multiIds }}</div>
    <div>Selected values: {{ multiValues }}</div>

    <h2>Single select</h2>
    <AngrySingleSelect
      :="config"
      :options="[...options, ...options2, ...options3]"
      :close-on-select="config.closeOnSelect"
      v-model:id="singleId"
      v-model="singleValue"
      :search-handler="config.customMatcher ? customMatcher : null"
      @selected="(key, value) => (selected = { key, value })"
    />
    <div>Selected ID: {{ singleId }}</div>
    <div>Selected value: {{ singleValue }}</div>

    <h2>Configuration</h2>
    <div id="config">
      <input
        type="checkbox"
        v-model="config.closeOnSelect"
        id="close-on-select"
      />
      <div>
        <label for="close-on-select">Close on select</label>
        <p>Keep the select open after choosing an option, or close it.</p>
      </div>
      <input
        type="checkbox"
        v-model="config.autocomplete"
        id="show-autocomplete"
      />
      <div>
        <label for="show-search">Autocomplete</label>
        <p>The user can type in the placeholder to filter the list.</p>
      </div>
      <input
        type="checkbox"
        v-model="config.customMatcher"
        id="custom-matcher"
      />
      <div>
        <label for="custom-matcher">Custom filtering</label>
        <p>
          Apply custom filtering for the search. Enable this and only options
          starting with your search string exactly will be returned!
        </p>
      </div>
      <input
        type="text"
        v-model="config.placeholder"
        id="placeholder"
      />
      <div>
        <label for="placeholder">Placeholder</label>
        <p>
          Add a spicy hint to the select whenever there's no options selected.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { OptionValue } from "./types";
import AngryMultiSelect from "./components/AngryMultiSelect.vue";
import AngrySingleSelect from "./components/AngrySingleSelect.vue";

const options = ["John", "Lauren", "Michelle", "Mike"];

const options2 = ["Pig", "Goat", "Duck", "Cow", "Chicken", "Sheep", "Horse"];

const options3 = [
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Purple",
  "Yellow",
  "Seafoam",
  "Black",
  "White",
  "Aquamarine",
  "Goldenrod",
  "Mud",
];

const config = reactive({
  closeOnSelect: true,
  autocomplete: true,
  listbox: false,
  customMatcher: false,
  placeholder: undefined,
});

const singleValue = ref(null);
const singleId = ref(null);
const selected = ref({ key: null, value: null });

const multiValues = ref([]);
const multiIds = ref([]);

function customMatcher(search: string, option: OptionValue): boolean {
  return option.value.toString().startsWith(search);
}
</script>

<style scoped>
#content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 50rem;
  text-align: left;
  font-size: 100%;
  line-height: 1.5em;
}

#config {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  row-gap: 0.5rem;
  column-gap: 1rem;

  & label {
    font-weight: bold;
  }
}
input {
  padding: 0.25rem;
  height: 2rem;
  justify-self: end;

  &[type="checkbox"] {
    width: 2rem;
  }
}

.bold {
  font-weight: bold;
}
h1 {
  font-size: 4rem;
  line-height: 4rem;
}
h2 {
  font-size: 2.5rem;
  line-height: 2.5rem;
}
</style>
