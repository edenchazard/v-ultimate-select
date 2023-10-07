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
    <VueAngrySelect
      :="config"
      :options="[...options, ...options2]"
      class="tags"
      v-model:ids="ids"
      v-model:values="values"
      :search-handler="config.customMatcher ? customMatcher : null"
      @selected="(key, value) => (selected = { key, value })"
    />
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
        v-model="config.showSearch"
        id="show-search"
      />
      <div>
        <label for="show-search">Show search</label>
        <p>Hide or show the search input.</p>
      </div>
      <input
        type="checkbox"
        v-model="config.multiple"
        id="multiple"
      />
      <div>
        <label for="multiple">Select multiple</label>
        <p>Multiple items will be returned as IDs inside an array.</p>
      </div>
      <input
        type="checkbox"
        v-model="config.listbox"
        id="multiple"
      />
      <div>
        <label for="multiple">Listbox style</label>
        <p>
          It's a thing. The options will be displayed as a list instead of a
          dropdown.
        </p>
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

    <div>Selected IDs: {{ ids }}</div>
    <div>Selected values: {{ values }}</div>
    <div>
      Most recently selected option:
      <dl>
        <dt>ID</dt>
        <dd>{{ selected.key }}</dd>
        <dt>Value</dt>
        <dd>{{ selected.value }}</dd>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import VueAngrySelect from "./components/AngrySelect.vue";

const options = ["John", "Lauren", "Michelle", "Mike"];

const options2 = ["Pig", "Goat", "Duck", "Cow", "Chicken", "Sheep", "Horse"];

const config = reactive({
  closeOnSelect: true,
  showSearch: true,
  multiple: true,
  listbox: false,
  customMatcher: false,
  placeholder: undefined,
});

const values = ref([]);
const ids = ref([]);
const selected = ref({ key: null, value: null });

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
