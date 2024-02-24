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
      :aria-controls="`${nodeId}-select-list-container`"
      @keydown="handleInputKeyUp"
      @click="handleClick"
    >
      <div class="select-box-multiple-container">
        <template
          v-for="(value, $index) in modelValue"
          :key="value"
        >
          <slot
            name="value"
            :value="value"
            :remove="() => removeSelectedItem($index)"
          >
            <span class="select-box-multiple-value">
              <span class="select-box-multiple-value-label">
                {{ trackByKey === null ? value : value[labelKey as string] }}
              </span>
            </span>
          </slot>
        </template>
        <slot
          name="placeholder"
          :value="search"
          :placeholder="computePlaceholder"
          :ariaAttributes="ariaAttributes"
        >
          <input
            v-if="autocomplete"
            class="search"
            tabindex="-1"
            type="text"
            v-model="search"
            role="combobox"
            :aria-expanded="ariaAttributes['aria-expanded']"
            aria-autocomplete="list"
            :aria-activedescendant="ariaAttributes['aria-activedescendant']"
            :placeholder="computePlaceholder"
          />
          <span v-else>{{ computePlaceholder }}</span>
        </slot>
      </div>

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
          v-if="open"
          v-bind="{
            ...listboxAriaAttributes,
            id: `${nodeId}-select-list-container`,
            class: classes,
            style: floatingStyles,
          }"
          ref="menu"
          role="listbox"
          class="select-list-container"
        >
          <ul
            class="select-list"
            ref="optionList"
            v-if="filteredOptionsList.size > 0"
          >
            <li
              v-for="[id, value] in filteredOptionsList"
              :key="id"
              :id="`${nodeId}-item-${id}`"
              :data-key="id"
              class="select-list-option"
              :aria-selected="isSelected(value)"
              role="option"
              @pointerenter="
                setCurrentlyHighlightedListItem($event.target as HTMLLIElement)
              "
              @click="handleSelectListItem"
            >
              <slot
                name="option"
                :option="value"
              >
                {{ trackByKey === null ? value : value[labelKey as string] }}
              </slot>
            </li>
          </ul>
          <slot
            name="noResults"
            v-else
          >
            <p class="no-results">No results.</p>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import "../assets/style.css";
import type {
  AngryMultiSelectProps,
  ListboxAriaAttributes,
  MenuState,
  OptionValue,
} from "../types";
import InputButtons from "./InputButtons.vue";
import useAngryHandlers from "../composables/useAngryHandlers";
import AngrySelectDefaults from "../AngrySelectDefaults";

const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "remove", index: number): void;
  /**
   * Emitted whenever the combobox is opened.
   *
   * This event doesn't trigger if `listbox` is true.
   */
  (event: "open"): void;

  /**
   * Emitted whenever the combobox is closed.
   *
   * This event doesn't trigger if `listbox` is true.
   */
  (event: "close"): void;

  /**
   * Emitted whenever the combobox is cleared.
   */
  (event: "clear"): void;

  /**
   * Emitted whenever an option has been selected.
   */
  (event: "selected", value: OptionValue): void;

  /**
   * TODO
   *
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:modelValue", values: OptionValue[]): void;
}>();

const props = withDefaults(
  defineProps<AngryMultiSelectProps>(),
  AngrySelectDefaults
);

const activator = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const optionList = ref<HTMLUListElement>();
const activeDescendant = ref<HTMLLIElement>();

const search = ref<string>("");
const open = ref<boolean>(false);
const state = ref<MenuState>("none");
const nodeId = computed(() => props.htmlId ?? generateId());

const {
  /** refs */
  filteredOptionsList,
  internalOptions,
  floatingStyles,

  placement,
  classes,
  activeDescendantId,

  /** mainly utility functions */
  getItem,
  getSearchElement,
  getCurrentlyHighlightedListItem,
  setCurrentlyHighlightedListItem,
  showScrollbarIfNecessary,
  setListItemSelectAction,
  handleFocusNextListItem,
  generateId,
  isSelected,

  /** handlers */
  handleClearSearch,
  handleClick,
  handleBlur,
  handleInputKeyUp,
  handleOpenIfNotClosing,
  handleFocusInput,
  handleSelectListItem,
} = useAngryHandlers(
  container,
  activator,
  menu,
  optionList,
  activeDescendant,
  search,
  open,
  state,
  props as Required<AngryMultiSelectProps>
);

const listboxAriaAttributes = computed<ListboxAriaAttributes>(() => ({
  "aria-multiselectable": true,
  "aria-label": props.listboxLabel,
}));

const computePlaceholder = computed<string>(() => {
  if (typeof props.placeholder === "undefined") {
    return props.modelValue.length > 0 ? "Add another" : "Select an option";
  }

  return props.placeholder;
});

const ariaAttributes = computed(() => ({
  "aria-activedescendant": activeDescendantId.value,
  "aria-autocomplete": "list",
  "aria-expanded": open.value,
}));

setListItemSelectAction((option, e) => {
  const previous = [...props.modelValue];
  const exists =
    props.trackByKey === null
      ? previous.indexOf(option)
      : previous.findIndex(
          (o) => o[props.trackByKey] === option[props.trackByKey]
        );
  // remove it
  if (exists > -1) {
    previous.splice(exists, 1);
  }
  // add it
  else {
    previous.push(option);
  }

  handleClearSearch();

  emit("update:modelValue", previous);
  emit("selected", option);
});

function handleClear() {
  emit("update:modelValue", []);
  emit("clear");
}

function removeSelectedItem(index: number) {
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  emit("update:modelValue", newValue);
}
</script>
