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
      :aria-placeholder="placeholder"
      :aria-controls="`${nodeId}-select-list-container`"
      @keydown="handleInputKeyUp"
      @pointerdown="handleClick"
    >
      <SingleContainer
        v-bind="{
          autocomplete,
          placeholder,
          values: selected,
          uuid: nodeId,
          ariaAttributes: {
            'aria-activedescendant': activeDescendantId,
            'aria-autocomplete': 'list',
            'aria-expanded': open,
          },
        }"
        :model-value="value"
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
          :id="`${nodeId}-select-list-container`"
          ref="menu"
          role="listbox"
          class="select-list-container"
          :class="classes"
          :style="floatingStyles"
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
              :aria-selected="id.toString() === id"
              :data-key="id"
              @pointerenter="
                setCurrentlyHighlightedListItem($event.target as HTMLLIElement)
              "
              @click="handleSelectListItem"
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
import { computed, ref } from "vue";
import "../assets/style.css";
import type {
  AngrySingleSelectEvents,
  OptionKey,
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
  "aria-multiselectable": true,
  "aria-label": props.listboxLabel,
}));

const selected = computed(() => {
  return internalOptions.value.get(parseInt(props.id))?.[props.trackByKey];
});

function handleClear() {
  emit("update:id", null);
  emit("clear");
}

setListItemSelectAction((option, e) => {
  //handleClearSearch();

  emit("update:id", option.value);
  emit("selected", option.id, option.value);
});
</script>

<style></style>
