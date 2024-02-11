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
    <h3>Simple string array</h3>
    <AngryMultiSelect
      :="config"
      :options="options123"
      v-model="multi"
      :search-handler="config.customMatcher ? customMatcherString : null"
    />
    <div>
      Selected values:<code class="code-inline">{{ multi }}</code>
    </div>

    <h3>With objects as values</h3>
    <AngryMultiSelect
      :="config"
      :options="options4"
      v-model="multiWithObjects"
      track-by-key="id"
      label-key="value"
      :search-handler="config.customMatcher ? customMatcherObject : null"
    />
    <div>
      Selected values: <code class="code-inline">{{ multiWithObjects }}</code>
    </div>

    <h2>Single select</h2>
    <h3>Simple string array</h3>
    <AngrySingleSelect
      :="config"
      :options="options123"
      v-model="single"
      :search-handler="config.customMatcher ? customMatcherString : null"
    />
    <div>
      Selected values:<code class="code-inline">{{ single }}</code>
    </div>

    <h3>With objects as values</h3>
    <AngrySingleSelect
      :="config"
      :options="options4"
      v-model="singleWithObjects"
      track-by-key="id"
      label-key="value"
      :search-handler="config.customMatcher ? customMatcherObject : null"
    />
    <div>
      Selected values:<code class="code-inline">{{ single }}</code>
    </div>

    <h2>Demo configuration</h2>
    <h3>With objects as values options</h3>
    <p>
      <code class="code-inline">track-by-key</code> is
      <code class="code-inline">id</code>, with
      <code class="code-inline">label-key</code> set to
      <code class="code-inline">value</code>
    </p>
    <p>
      Options:
      <code class="code-inline">{{ options4 }}</code>
    </p>
    <h3>Simple string array options</h3>
    <p>
      <code class="code-inline">{{ options123 }}</code>
    </p>
    <h3>Props</h3>
    <div id="config">
      <input
        type="checkbox"
        v-model="config.closeOnSelect"
        id="close-on-select"
      />
      <div>
        <label for="close-on-select">Close on select</label>
        <p>
          If enabled, whenever an option is selected, the options list will
          close.
        </p>
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
        type="checkbox"
        v-model="config.openOnClick"
        id="open-on-click"
      />
      <div>
        <label for="open-on-click">Open on click</label>
        <p>
          By default the options list will only appear after typing, but you can
          have it open on click too.
        </p>
      </div>
      <input
        type="checkbox"
        v-model="config.clearSearchStringOnBlur"
        id="clear-search-string-on-blur"
      />
      <div>
        <label for="clear-search-string-on-blur"
          >Clear Search String On Blur</label
        >
        <p>If true, when unfocused, the search string will be cleared.</p>
      </div>
      <select
        v-model="config.menuLocation"
        id="menu-location"
      >
        <option
          v-for="location in ['auto', 'above', 'below']"
          :value="location"
        >
          {{ location }}
        </option>
      </select>
      <div>
        <label for="menu-location">Menu Location</label>
        <p>
          By default this is set to auto: the select will try to show the
          options list below the activator, and above the activator should it
          exceed
          <code class="code-inline">maxHeight</code>. You can force it to show
          on a particular side by setting this prop.
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
import type {
  AngrySelectProps,
  OptionValue,
  MenuLocation,
  MatcherCallback,
} from "./types";
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

const options123 = [...options, ...options2, ...options3];

const options4 = [
  {
    id: 5,
    value: "Pomeranian",
  },
  {
    id: 7,
    value: "Labrador",
  },
  {
    id: 9,
    value: "Husky",
  },
];

const config = reactive<{
  [x: string]: any;
  menuLocation: MenuLocation;
}>({
  closeOnSelect: true,
  autocomplete: true,
  listbox: false,
  customMatcher: false,
  placeholder: undefined,
  menuLocation: "auto",
  openOnClick: true,
  clearSearchStringOnBlur: false,
});

const single = ref(null);
const singleWithObjects = ref<{ id: number; value: string } | null>(null);

const multi = ref([]);
const multiWithObjects = ref<{ id: number; value: string }>([]);

const customMatcherObject: MatcherCallback = (search, option) => {
  return option["value"].toString().startsWith(search);
};
const customMatcherString: MatcherCallback = (search, option) => {
  return option.toString().startsWith(search);
};
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
h3 {
  font-size: 1.8rem;
  line-height: 1.8rem;
}

.code-inline {
  display: inline;
  background: rgba(0, 0, 0, 0.5);
  padding: 0 0.5rem;
}
</style>
