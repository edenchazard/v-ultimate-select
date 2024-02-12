<template>
  <div class="select-box-multiple-container">
    <template
      v-for="(value, $index) in values"
      :key="value"
    >
      <slot
        name="value"
        :value="value"
      >
        <span class="select-box-multiple-value">
          <span class="select-box-multiple-value-label">
            {{ trackByKey === null ? value : value[labelKey as string] }}
          </span>
          <span class="select-box-multiple-value-remove">
            <span
              class="select-box-multiple-value-remove-inside"
              @click.stop="emit('remove', $index)"
            >
              <FontAwesomeIcon
                class="test"
                icon="x"
                aria-hidden="true"
              />
            </span>
          </span>
        </span>
      </slot>
    </template>

    <slot name="placeholder">
      <Search
        v-if="autocomplete"
        class="search"
        :value="search"
        :placeholder="computePlaceholder"
        :ariaAttributes="ariaAttributes"
        @input="emit('update:search', $event.target.value)"
      />
      <span v-else>{{ computePlaceholder }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type {
  AngryMultiSelectProps,
  AngrySelectProps,
  InputAriaAttributes,
} from "@/types";
import Search from "./Search.vue";

const props = defineProps<
  Pick<
    AngrySelectProps,
    "placeholder" | "autocomplete" | "trackByKey" | "labelKey"
  > & {
    ariaAttributes: InputAriaAttributes;
    uuid: string;
    values: AngryMultiSelectProps["modelValue"];
    search: string;
  }
>();

const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "remove", index: number): void;
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
.test {
  align-self: center;
  height: 0.6rem;
  margin-left: 0.3rem;
}

.select-box-multiple-value-remove:hover {
  background: hsl(145, 55%, 30%);
}
</style>
