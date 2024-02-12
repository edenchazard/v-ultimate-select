<template>
  <span class="select-box-multiple-value">
    <slot>
      <span class="select-box-multiple-value-label">{{ text }}</span>
      <span class="select-box-multiple-value-remove">
        <span class="select-box-multiple-value-remove-inside">
          <img src="../assets/caret-down-solid.svg" class="icon" />
        </span>
      </span>
    </slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  (event: "remove", value: string): void;
}>();
</script>

<style>
.select-box-multiple-value {
  border-radius: 0.25rem;
  background: rgb(49, 167, 98);
  color: #fff;
  font-size: 0.8rem;
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
}

.select-box-multiple-value-label {
  padding: 0 0.4rem;
  align-self: center;
}

.select-box-multiple-value-remove {
  padding: 0.2rem 0.2rem 0.2rem 0rem;
  display: flex;
}
.select-box-multiple-value-remove-inside {
  display: flex;
  padding: 0 0.2rem;
  border-left: 1px solid #fff;
}

.select-box-multiple-value-remove:hover {
  background: hsl(145, 55%, 30%);
}
</style>
