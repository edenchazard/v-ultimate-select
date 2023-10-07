<template>
  <span class="select-box-multiple-value">
    <slot>
      <span class="select-box-multiple-value-label">{{ value }}</span>
      <span class="select-box-multiple-value-remove">x</span>
    </slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<style>
.select-box-multiple-value {
  border-radius: 0.25rem;
  background: rgb(49, 167, 98);
  color: #fff;
  padding: 0.1rem 0 0.1rem 0.5rem;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  height: 1.5rem;
  box-sizing: border-box;
}

.select-box-multiple-value-label {
  padding-right: 0.4rem;
}

.select-box-multiple-value-remove {
  border-left: 1px solid #fff;
  padding: 0 0.4rem;
}

.select-box-multiple-value-remove:hover {
  background: hsl(145, 55%, 30%);
}
</style>
