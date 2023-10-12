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
      :aria-placeholder="placeholder"
      :aria-controls="`${nodeId}-select-list-container`"
      :aria-activedescendant="activeDescendantId"
      aria-autocomplete="list"
      @keydown="handleInputKeyUp"
      @pointerdown="handleClick"
    >
      <SingleContainer
        :="{ autocomplete, placeholder, id: nodeId }"
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
