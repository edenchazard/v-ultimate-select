<template>
  <div class="select-box-single">
    <Search
      v-if="autocomplete"
      class="search"
      :value="search"
      :placeholder="placeholder"
      :ariaAttributes="ariaAttributes"
      @input.prevent="emit('update:search', $event.target.value)"
    />
    <slot
      name="placeholder"
      v-else-if="value.length === 0"
    >
      {{ placeholder }}
    </slot>
    <slot
      name="value"
      v-else
    >
      {{ trackByKey === null ? value : value[labelKey as string] }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import type {
  AngrySelectProps,
  AngrySingleSelectProps,
  InputAriaAttributes,
  OptionValue,
} from "@/types";
import Search from "./Search.vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "update:search", value: string): void;
}>();

defineProps<
  Pick<
    AngrySelectProps,
    "placeholder" | "autocomplete" | "trackByKey" | "labelKey"
  > & {
    ariaAttributes: InputAriaAttributes;
    uuid: string;
    value: AngrySingleSelectProps["modelValue"];
    search?: string;
  }
>();
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
