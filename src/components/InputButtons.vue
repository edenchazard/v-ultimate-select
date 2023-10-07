<template>
  <div class="select-box-inputs">
    <slot name="clear">
      <span
        title="Clear selection"
        role="button"
        type="button"
        class="select-box-button clear"
        @click.stop="$emit('clear', $event)"
      >
        <FontAwesomeIcon
          class="icon"
          icon="x"
        />
      </span>
    </slot>

    <slot name="caret">
      <FontAwesomeIcon
        class="icon select-box-button caret"
        icon="caret-down"
        @click="$emit('open', $event)"
        @keyup="$emit('open', $event)"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
//defineProps<{}>();
defineEmits<{
  (event: "clear", e: Event): void;
  (event: "open", e: Event): void;
}>();
</script>

<style>
.select-box-inputs {
  display: flex;
  align-items: center;
}
.select-box-button {
  box-sizing: border-box;
}
.caret {
  transition: transform 0.5s;
}
.open .caret {
  transform: rotate(0deg);
}
.clear {
  right: 2rem;
  height: 1rem;
}
</style>
