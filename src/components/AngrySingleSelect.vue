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
      <SingleContainer
        v-bind="{
          autocomplete,
          placeholder,
          value: modelValue,
          uuid: nodeId,
          ariaAttributes: {
            'aria-activedescendant': activeDescendantId,
            'aria-autocomplete': 'list',
            'aria-expanded': open,
          },
        }"
        v-model:search="search"
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
import { computed, ref, watchEffect } from "vue";
import "../assets/style.css";
import type {
  AngrySingleSelectEvents,
  MenuState,
  ListboxAriaAttributes,
  AngrySingleSelectProps,
} from "../types";
import SingleContainer from "./SingleContainer.vue";
import InputButtons from "./InputButtons.vue";
import useAngryHandlers from "../composables/useAngryHandlers";
import AngrySelectDefaults from "../AngrySelectDefaults";

const props = withDefaults(
  defineProps<AngrySingleSelectProps>(),
  AngrySelectDefaults
);

const emit = defineEmits<AngrySingleSelectEvents>();

const activator = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const optionList = ref<HTMLUListElement>();
const activeDescendant = ref<HTMLLIElement>();

const search = ref<string>("");
const open = ref<boolean>(false);
const state = ref<MenuState>("none");
const nodeId = computed(() => props.htmlId ?? generateId());

watchEffect(() => {
  if (props.modelValue === null) {
    search.value = "";
    return;
  }

  search.value = props.modelValue;
});

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
  props as Required<AngrySingleSelectProps>
);

const listboxAriaAttributes = computed<ListboxAriaAttributes>(() => ({
  "aria-multiselectable": false,
  "aria-label": props.listboxLabel,
}));

setListItemSelectAction((option, e) => {
  handleClearSearch();

  emit("update:modelValue", option);
  emit("selected", option);
});

function handleClear() {
  emit("update:modelValue", null);
  emit("clear");
}
</script>
