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
      <MultipleContainer
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
          v-if="open || listbox"
          v-bind="listboxAriaAttributes"
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
              :data-key="id"
              class="select-list-option"
              :aria-selected="ids.includes(id.toString())"
              role="option"
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
            <p>No results.</p>
          </slot>
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
  AngryMultiSelectEvents,
  OptionKey,
  MenuState,
  AngryMultiSelectProps,
  ListboxAriaAttributes,
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

const selected = computed(() => {
  const get = (key: OptionKey) =>
    internalOptions.value.get(parseInt(key as string))?.[props.trackByKey];

  return (props.ids as OptionKey[]).map(get);
});

setListItemSelectAction((option, e) => {
  const previous = [...props.ids];
  const exists = previous.indexOf(option.id);

  // remove it
  if (exists > -1) {
    previous.splice(exists, 1);
  }
  // add it
  else {
    previous.push(option.id);
  }

  handleClearSearch();

  emit("update:ids", previous);
  emit("selected", option.id, option.value);
});

function handleClear() {
  emit("update:ids", []);
  emit("clear");
}
</script>
