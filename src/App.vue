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
    <div class="simple-container">
      <VueAngrySelect
        ref="angrySelect"
        :options="[...options, ...options2]"
        :="config"
        class="tags"
        v-model:ids="ids"
        v-model:values="values"
        :search-handler="config.customMatcher ? customMatcher : null"
        @selected="(key, value) => (selected = { key, value })"
      />

      <button
        type="button"
        class="happy-button"
        :class="{ visible: angryInProgress }"
        @click="imHappyNow"
      >
        I'm much happier now! Thank you 😊
      </button>
    </div>
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
    <h2>Customer satisfaction</h2>
    <p id="customer-satisfaction">
      Not impressed?
      <button
        type="button"
        class="dislike-button"
        @click="makeAngry"
      >
        👎 I'm not happy with this, and I'd like you to know.
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import VueAngrySelect from "./components/VueAngrySelect.vue";

const angrySelect = ref();

const options = ["John", "Lauren", "Michelle", "Mike"];

const options2 = ["Pig", "Goat", "Duck", "Cow", "Chicken", "Sheep", "Horse"];

const config = reactive({
  closeOnSelect: true,
  showSearch: true,
  multiple: false,
  listbox: false,
  customMatcher: false,
  placeholder: "Select an option...",
});

const values = ref([]);
const ids = ref([]);
const selected = ref({ key: null, value: null });

function customMatcher(search: string, option: OptionValue): boolean {
  return option.value.toString().startsWith(search);
}

const angryInProgress = ref(false);
function makeAngry() {
  angryInProgress.value = true;
  angrySelect.value?.makeMeAngy();
}

function imHappyNow() {
  angryInProgress.value = false;
  angrySelect.value?.makeMeLessAngy();
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

.happy-button {
  display: none;
  z-index: 201;
  position: absolute;
  background-color: rgb(86, 141, 30);
  transform: translate(-50%, 10rem);
  opacity: 0;
  left: 50%;

  &.visible {
    display: initial;
    animation: fade-n-drop 1s ease-in 3s 1 forwards;
  }
}

#customer-satisfaction {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
}
.dislike-button {
  background-color: rgb(126, 16, 16);
}

@keyframes fade-n-drop {
  0% {
    opacity: 0;
    transform: translate(-50%, 10rem);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 15rem);
  }
}
</style>
