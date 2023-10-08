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
      :aria-activedescendant="
        null //todo
      "
      aria-autocomplete="list"
      @keydown="handleInputKeyUp"
      @pointerdown="handleClick"
    >
      <SingleContainer
        :="{ autocomplete, placeholder, id: nodeId }"
        v-model="text"
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
import { computed, ref } from "vue";
import "../assets/style.css";
import type {
  AngrySingleSelectEvents,
  OptionKey,
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
const activeDescendant = ref<HTMLLinkElement>();

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
  setListItemSelectAction,
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
  const get = (key: OptionKey) =>
    internalOptions.value.get(parseInt(key))?.[props.trackByKey];

  return get(props.id as OptionKey);
});

function handleOptionSelected<T extends Event>(e: T) {
  if (!(e.target instanceof HTMLElement)) return;

  const key = e.target.dataset.key;

  if (typeof key === "undefined") return;

  const option = internalOptions.value.get(
    isNaN(parseInt(key)) ? key : parseInt(key)
  );

  if (!option) return;

  if (props.closeOnSelect) {
    open.value = false;
  }

  text.value = option.value;

  emit("update:id", option.value);
  emit("selected", key, option);
}

function handleClear() {
  emit("update:id", null);
  emit("clear");
}
</script>

<style></style>
