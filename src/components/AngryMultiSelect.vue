<template>
  <div
    ref="container"
    class="select-container"
    :class="classes"
  >
    <div
      :id="nodeId"
      ref="activator"
      tabindex="0"
      class="select-box"
      :aria-expanded="open"
      aria-multiselectable="true"
      :aria-placeholder="placeholder"
      :aria-controls="`${nodeId}-select-list-container`"
      :aria-activedescendant="
        null //todo
      "
      aria-autocomplete="list"
      @keydown="handleInputKeyUp"
      @pointerdown="handleClick"
    >
      <MultipleContainer
        :="{ autocomplete, placeholder, values, id: nodeId }"
        :values="selected"
        v-model:search="search"
        :rows="1"
      />

      <InputButtons
        @open="handleOpenIfNotClosing"
        @clear="handleClear"
      />
    </div>

    <Teleport
      to="body"
      :disabled="listbox"
    >
      <Transition
        mode="in-out"
        @before-enter="state = 'opening'"
        @before-leave="state = 'closing'"
        @after-leave="state = 'none'"
      >
        <div
          v-if="open || listbox"
          :aria-expanded="open"
          :aria-label="listboxLabel"
          :id="`${nodeId}-select-list-container`"
          ref="menu"
          role="listbox"
          class="select-list-container"
          :class="classes"
          :style="listbox ? {} : floatingStyles"
        >
          <ul
            class="select-list"
            ref="optionList"
            v-if="filteredOptionsList.size > 0"
          >
            <li
              v-for="[id, data] in filteredOptionsList"
              :key="id"
              :id="`${nodeId}-item-${id}`"
              role="option"
              class="select-list-option"
              :aria-selected="ids.includes(id.toString())"
              :data-key="id"
              @click="handleOptionSelected"
            >
              <slot
                name="option"
                :option="data"
              >
                {{ data[trackByKey] }}
              </slot>
            </li>
          </ul>
          <slot
            name="noResults"
            v-else
          >
            <p>No results.</p></slot
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import "reset-css";
import { computed, ref, watch } from "vue";
import "../assets/style.css";
import type {
  AngryMultiSelectEvents,
  OptionKey,
  AngryMultiSelectProps,
} from "../types";
import MultipleContainer from "./MultipleContainer.vue";
import InputButtons from "./InputButtons.vue";
import useAngryHandlers from "../composables/useAngryHandlers";
import AngrySelectDefaults from "../AngrySelectDefaults";

const props = withDefaults(
  defineProps<AngryMultiSelectProps>(),
  AngrySelectDefaults
);

const emit = defineEmits<AngryMultiSelectEvents>();

const activator = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const optionList = ref<HTMLUListElement>();

const search = ref<string>("");
const open = ref<boolean>(false);
const state = ref<"closing" | "opening" | "none">("none");
const nodeId = computed(() => props.htmlId ?? generateId());

const {
  filteredOptionsList,
  internalOptions,
  floatingStyles,
  placement,
  classes,

  clearSearch,
  generateId,
  handleClick,
  handleUnfocus,
  focusListItem,
  handleInputKeyUp,
  handleOpenIfNotClosing,
  showScrollbarIfNecessary,
  handleFocusInput,
} = useAngryHandlers(
  container,
  activator,
  menu,
  optionList,
  search,
  open,
  state,
  props as Required<AngryMultiSelectProps>
);

const selected = computed(() => {
  const get = (key: OptionKey) =>
    internalOptions.value.get(parseInt(key as string))?.[props.trackByKey];

  return (props.ids as OptionKey[]).map(get);
});

function handleOptionSelected<T extends Event>(e: T) {
  console.log(e);
  if (!(e.target instanceof HTMLElement)) return;

  const key = e.target.dataset.key;

  if (typeof key === "undefined") return;

  const option = internalOptions.value.get(
    isNaN(parseInt(key)) ? key : parseInt(key)
  );

  if (!option) return;

  const previous = [...new Set(props.ids)];
  const exists = previous.indexOf(key);

  // remove it
  if (exists > -1) {
    previous.splice(exists, 1);
  }
  // add it
  else {
    previous.push(key);
  }

  if (props.closeOnSelect) {
    handleUnfocus();
  }

  clearSearch();

  emit("update:ids", previous);
  emit("selected", key, option);
}

function handleClear() {
  emit("update:ids", []);
  emit("clear");
}
</script>

<style></style>
