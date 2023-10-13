<template>
  <div class="select-box-multiple-container">
    <template
      v-for="value in values"
      :key="value"
    >
      <slot
        name="value"
        :value="value"
      >
        <MultipleValue :value="value" />
      </slot>
    </template>
    <slot name="placeholder">
      <Search
        v-if="autocomplete"
        class="search"
        :modelValue="search"
        :placeholder="computePlaceholder"
        :ariaAttributes="ariaAttributes"
        @update:modelValue="emit('update:search', $event)"
      />
      <span v-else>{{ computePlaceholder }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { InputAriaAttributes } from "@/types";
import MultipleValue from "./MultipleValue.vue";
import Search from "./Search.vue";

interface Props {
  search: string;
  placeholder?: string;
  values: string[];
  rows?: number;
  rowHeight?: number;
  autocomplete?: boolean;
  ariaAttributes: InputAriaAttributes;
  uuid: string;
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
  row-gap: 0.2rem;
  flex-wrap: wrap;
  align-self: center;
}

.search {
  flex: 1;
}
.search:focus {
  outline: none;
}
/*.select-box-multiple-value {
    border-radius: 0.25rem;
    background: rgb(49, 167, 98);
    color: #fff;
    padding: 0.1rem 0.5rem;
    font-size: 0.8rem;
  }*/
</style>
