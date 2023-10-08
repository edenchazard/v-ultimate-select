<template>
  <div
    class="select-box-multiple-container"
    :style="{
      minHeight: rowHeight + 'rem',
    }"
  >
    <template
      v-for="value in values"
      :key="value"
    >
      <slot
        name="value"
        :value="value"
      >
        <MultipleValue
          :style="{ height: rowHeight + 'rem' }"
          :value="value"
        />
      </slot>
    </template>
    <slot name="placeholder">
      <Search
        v-if="autocomplete"
        class="search"
        :modelValue="search"
        :style="{ height: rowHeight + 'rem' }"
        :placeholder="computePlaceholder"
        @update:modelValue="$emit('update:search', $event)"
      />
      <span v-else>{{ computePlaceholder }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MultipleValue from "./MultipleValue.vue";
import Search from "./Search.vue";

interface Props {
  search: string;
  placeholder?: string;
  values: string[];
  rows?: number;
  rowHeight?: number;
  autocomplete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 2,
  rowHeight: 1.5,
});

const emit = defineEmits<{
  (event: "update:search", value: string): void;
}>();

const computePlaceholder = computed<string>(() => {
  if (typeof props.placeholder === "undefined") {
    return props.values.length > 0 ? "Add another" : "Select an option";
  }

  return props.placeholder;
});
</script>

<style scoped>
.select-box-multiple-container {
  flex: 1;
  display: flex;
  column-gap: 0.5rem;
  row-gap: 0.2rem; /* 
  transform: translateY(0);
  transition: transform 0.5s ease-in-out; */
  flex-wrap: wrap;
}

.search {
  box-shadow: inset 0 0 2px 0 #000000;
  border-radius: 0.2rem;
  border: 1px solid lightgray;
  padding: 0.5rem;
  display: flex;
  box-sizing: border-box;
}
.search:focus {
  outline: none;
  box-shadow: inset 0 0 1px 1px blue;
}
/*.select-box-multiple-value {
    border-radius: 0.25rem;
    background: rgb(49, 167, 98);
    color: #fff;
    padding: 0.1rem 0.5rem;
    font-size: 0.8rem;
  }*/
</style>
