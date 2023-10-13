<template>
  <div class="select-box-single">
    <Search
      v-if="autocomplete"
      class="search"
      :placeholder="placeholder"
      :modelValue="modelValue"
      :ariaAttributes="ariaAttributes"
      @update:modelValue="emit('update:modelValue', $event)"
    />
    <slot
      name="value"
      v-else-if="modelValue"
    >
      {{ modelValue }}
    </slot>
    <slot
      name="placeholder"
      v-else-if="modelValue.length === 0"
    >
      {{ placeholder }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { InputAriaAttributes, OptionValue } from "@/types";
import Search from "./Search.vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

interface Props {
  placeholder?: string;
  modelValue: OptionValue;
  autocomplete?: boolean;
  ariaAttributes: InputAriaAttributes;
  uuid: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
});
</script>

<style scoped>
.select-box-single {
  flex: 1;
  display: flex;
  align-self: center;
}

.search {
  flex: 1;
  display: flex;
}
</style>
