<template>
  <div class="select-box-inputs">
    <slot name="clear">
      <span
        title="Clear selection"
        aria-hidden="true"
        role="button"
        type="button"
        class="select-box-button clear"
        @click.stop="emit('clear', $event)"
      >
        <img src="../assets/x-solid.svg" class="icon" />
      </span>
    </slot>

    <slot name="caret">
      <span class="select-box-button caret" @click.stop="emit('open', $event)">
        <img src="../assets/caret-down-solid.svg" class="caret-icon icon" />
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: "clear", e: Event): void;
  (event: "open", e: Event): void;
}>();
</script>

<style>
.select-box-inputs {
  display: flex;
}

.select-box-button {
  cursor: pointer;
  display: flex;
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.5rem;
}

.icon {
  transition: transform 0.5s;
  position: relative;
  width: 0.75rem;
}

.open .caret-icon {
  transform: rotate(180deg);
}
</style>
