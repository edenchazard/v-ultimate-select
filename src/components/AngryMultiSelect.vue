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
      <MultipleContainer
        v-bind="{
          autocomplete,
          placeholder,
          values: modelValue,
          labelKey,
          trackByKey,
          uuid: nodeId,
          ariaAttributes: {
            'aria-activedescendant': activeDescendantId,
            'aria-autocomplete': 'list',
            'aria-expanded': open,
          },
        }"
        v-model:search="search"
        @remove="removeSelectedItem"
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
            <p>No results.</p>
          </slot>
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
  MenuState,
  AngryMultiSelectProps,
  ListboxAriaAttributes,
  OptionValue,
} from "../types";
import MultipleContainer from "./MultipleContainer.vue";
import InputButtons from "./InputButtons.vue";
import useAngryHandlers from "../composables/useAngryHandlers";
import AngrySelectDefaults from "../AngrySelectDefaults";

const emit = defineEmits<AngryMultiSelectEvents>();

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
