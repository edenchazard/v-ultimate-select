<template>
  <input
    tabindex="-1"
    class="search"
    type="text"
    role="combobox"
    :value="modelValue"
    @input="(e) => emit('update:modelValue', e.target.value)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<style>
.search {
  background: transparent;
  color: #000;
  border: 0;
}
</style>
