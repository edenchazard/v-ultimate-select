<template>
  <div id="content">
    <h1>Vue Ultimate Select</h1>
    <section>
      <p>
        An accessible and customisable select dropdown for Vue that transcends
        all other selects.
      </p>
      <p>
        <strong class="bold">One select to rule them all.</strong>
      </p>
    </section>
    <VUltimateSelect
      :options="[...options, ...options2]"
      :="config"
      class="tags"
      v-model:ids="ids"
      v-model:values="values"
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
import VUltimateSelect from "./components/VUltimateSelect.vue";

const options = ["John", "Lauren", "Michelle", "Mike"];

const options2 = ["Pig", "Goat", "Duck", "Cow", "Chicken", "Sheep", "Horse"];

const config = reactive({
  closeOnSelect: true,
  showSearch: true,
  multiple: false,
});

const values = ref([]);
const ids = ref([]);
const selected = ref({ key: null, value: null });
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

  & label {
    font-weight: bold;
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
