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
        <FontAwesomeIcon
          class="icon"
          icon="x"
        />
      </span>
    </slot>

    <slot name="caret">
      <span class="select-box-button caret">
        <FontAwesomeIcon
          class="icon"
          icon="caret-down"
        />
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
//defineProps<{}>();
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
.caret {
  transition: transform 0.5s;
}
.open .caret {
  transform: rotate(0deg);
}
.clear {
}
.icon {
}
</style>
