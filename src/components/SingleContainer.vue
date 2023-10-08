<template>
  <div class="select-box-single">
    <Search
      v-if="autocomplete"
      class="search"
      :placeholder="placeholder"
      :modelValue="modelValue"
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
import Search from "./Search.vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

interface Props {
  placeholder?: string;
  modelValue: string;
  autocomplete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
});
</script>

<style scoped>
.select-box-single {
  flex: 1;
  display: flex;
  height: 100%; /* 
  align-items: center; */
}

.search {
  flex: 1;
  display: flex;
}
</style>
