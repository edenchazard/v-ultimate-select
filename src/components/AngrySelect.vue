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
      :aria-multiselectable="multiple"
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
        v-if="multiple"
        :placeholder="placeholder"
        :values="selected"
        v-model:search="search"
        :rows="1"
        :id="nodeId"
      />

      <SingleContainer
        v-else
        :placeholder="placeholder"
        v-model="search"
        :id="nodeId"
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
        @after-enter="showScrollbarIfNecessary"
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
              :aria-selected="ids?.includes(id.toString())"
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
import {
  type HTMLAttributes,
  type StyleValue,
  computed,
  nextTick,
  ref,
  watch,
} from "vue";
import { useElementSize } from "@vueuse/core";
import { useFloating, autoUpdate, flip, size } from "@floating-ui/vue";
import MultipleContainer from "./MultipleContainer.vue";
import SingleContainer from "./SingleContainer.vue";
import InputButtons from "./InputButtons.vue";
import useFocusOutside from "../composables/useFocusOutside";

interface Props {
  /**
   * The id of the selected option's value.
   *
   * If `multiple` is true, this will be an array of the option IDs.
   */
  ids: string | string[];

  /**
   * TODO
   *
   * wanna make this a v-model of all the selected values
   */
  values: OptionValue[] | OptionValue;

  /**
   * The options list.
   *
   * A string array or an array of objects can be passed. If passing
   * an object, make sure to specify the props `labelField` and `trackByKey`
   */
  options: string[] | Record<string, any>[];

  /**
   * Allow the user to select multiple options.
   *
   * Works in tandem with `minimumSelections` and `maximumSelections`
   */
  multiple?: boolean;

  /**
   * Close the dropdown when an option has been selected.
   *
   * This property has no effect if `listbox` is true.
   */
  closeOnSelect?: boolean;

  /**
   * TODO
   * If no option has been picked, the placeholder text will appear.
   */
  placeholder?: string;

  /**
   * A unique key for each option that differentiates it from other options
   * in the list.
   */
  trackByKey?: OptionKey;

  /**
   * A key to use for displaying an option's label. This should be the
   * text you'd like to present the user with.
   */
  labelField?: string;

  /**
   * TODO
   * The minimum number of options a user must select.
   */
  minimumSelections?: number;

  /**
   * TODO
   * The maximum number of options a user must select.
   *
   * To not restrict the maximum number of options selected, leave this
   * value null.
   */
  maximumSelections?: number;

  /**
   * The max height in pixels for the dropdown.
   */
  dropDownMaxHeight?: number;

  /**
   * TODO
   */
  fullPageIfDropdownTooBig?: boolean;

  /**
   * A html id attribute to give the component.
   *
   * If an id isn't specified, one will be generated automatically.
   */
  htmlId?: HTMLAttributes["id"];

  /**
   * Show the search box. You can specify how the search is performed
   * with the `searchHandler` prop.
   */
  showSearch?: boolean;

  /**
   * Display the options list as a listbox instead of a dropdown.
   */
  listbox?: boolean;

  /**
   * Aria label for the listbox.
   */
  listboxLabel?: string;

  /**
   * A callback that defines how the combobox will filter options
   * when searching.
   */
  searchHandler?: MatcherCallback;
}

const props = withDefaults(defineProps<Props>(), {
  listbox: false,
  fullPageIfDropdownTooBig: true,
  dropDownMaxHeight: 300,
  maximumSelections: 0,
  minimumSelections: 0,
  labelField: "value",
  trackByKey: "value",
  multiple: false,
  listboxLabel: "TODO",
  closeOnSelect: true,
});

const emit = defineEmits<{
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
  (event: "selected", key: OptionKey, value: OptionValue): void;

  /**
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:ids", value: SelectValue): void;

  /**
   * TODO
   *
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:values", values: OptionValue | OptionValue[]): void;
}>();

const activator = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const optionList = ref<HTMLUListElement>();

const search = ref<string>("");
const open = ref<boolean>(false);
const state = ref<"closing" | "opening" | "none">("none");
const nodeId = computed(() => props.htmlId ?? generateId());

const { width: boxWidth } = useElementSize(container);
const { onFocusOutside, listen, unlisten } = useFocusOutside({
  listenOnMount: false,
});

const { floatingStyles } = useFloating(container, menu, {
  strategy: "fixed",
  transform: true,
  whileElementsMounted: autoUpdate,
  placement: "bottom-start",
  middleware: [
    size({
      apply({ availableWidth, availableHeight, elements }) {
        // Do things with the data, e.g.
        const declarations: StyleValue = {
          maxHeight: `${props.dropDownMaxHeight}px`,
        };

        // only need to match the width of the activator if we're a
        // regular combo box
        if (!props.listbox) {
          declarations.width = `${boxWidth.value}px`;
        }

        Object.assign(elements.floating.style, declarations);
      },
    }),
    flip({
      fallbackPlacements: ["top-start"],
    }),
  ],
});

// don't really need to do this but it's nice to remove the listener I guess.
watch(open, (cur) => {
  (cur ? listen : unlisten)();
});

const selected = computed(() => {
  const get = (key: OptionKey) =>
    internalOptions.value.get(parseInt(key))?.[props.trackByKey];

  if (props.multiple && Array.isArray(props.ids)) {
    return (props.ids as OptionKey[]).map(get);
  }

  return get(props.ids as OptionKey);
});

const classes = computed(() => [
  open.value ? "open" : "closed",
  {
    listbox: props.listbox,
  },
]);

const internalOptions = computed(() => {
  // if we're given a key to track by, use that,
  // otherwise add our own
  const options = new Map<OptionKey, OptionValue>();

  props.options.forEach((opt, index) => {
    let key: OptionKey;
    let data: Record<string, unknown> = {};

    switch (typeof opt) {
      case "object":
        if (!(props.trackByKey in opt)) {
          throw new Error(
            `Object ${opt} is missing the key field: ${props.trackByKey}`
          );
        }

        key = opt[props.trackByKey];
        data = opt;
        break;

      case "string":
        key = index;
        data = { value: opt };
        break;

      default:
        throw new Error("Can't understand options.");
    }

    options.set(key, data);
  });

  return options;
});

const filteredOptionsList = computed(() => {
  // no search applied
  if (search.value === "") {
    return internalOptions.value;
  }

  const defaultSearchMatcher: MatcherCallback = (
    search: string,
    value: OptionValue
  ) =>
    (value[props.labelField].toString() as string)
      .toLowerCase()
      .trim()
      .indexOf(search.toLowerCase()) !== -1;

  // we should use the user-provided callback if given.
  const matchesCriteria = props.searchHandler
    ? props.searchHandler
    : defaultSearchMatcher;

  const filtered = new Map<OptionKey, OptionValue>();

  [...internalOptions.value].forEach(([key, value]) => {
    // matches the filter
    if (matchesCriteria(search.value, value, key)) {
      filtered.set(key, value);
    }
  });

  return filtered;
});

onFocusOutside([menu, container], handleUnfocus);

/* call this after the dropdown animation has finished, so we avoid
  showing a scrollbar during the animation */
function showScrollbarIfNecessary() {
  optionList.value?.classList.toggle("show-scrollbar");
}

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

  let value: SelectValue = key;

  if (props.multiple) {
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
    value = previous;
    clearSearch();
  } else {
    console.log(option.value);
    search.value = option.value;
  }

  emit("update:ids", value);
  emit("selected", key, option);
}
/* prevents the menu quickly closing and re-opening if the activator is clicked
  (because we'd be clicking outside the list box AND clicking the box straight after*/
function handleOpenIfNotClosing(e: Event) {
  /*   if (e instanceof KeyboardEvent) {
   if (["enter", "space"].includes(e.key) === false) {
      console.log(e, open.value);
      return;
    }
  } else if (e instanceof PointerEvent) {
  } */

  e.preventDefault();
  if (!open.value && state.value === "none") open.value = true;
}

async function handleInputKeyUp(e: KeyboardEvent) {
  const key = e.key;
  const searchElement = getSearchElement();
  console.log(key);

  // it was probably alphanumeric? but we only care about improvising
  // if the search isn't already under focus
  if (key.length === 1 && document.activeElement !== searchElement) {
    handleOpenIfNotClosing(e);
    handleFocusInput(key);
    return;
  }

  switch (key) {
    case "ArrowDown":
      handleOpenIfNotClosing(e);
      focusListItem("down");
      handleFocusInput();
      break;
    case "ArrowUp":
      focusListItem("up");
      handleFocusInput();
      break;
    case "ArrowLeft":
      handleFocusInput();
      break;
    case "ArrowRight":
      handleFocusInput();
      break;
    case "Enter":
    // todo handle enter to select
  }
}

function handleClick(e: PointerEvent) {
  const searchElement = getSearchElement();

  handleOpenIfNotClosing(e);

  if (document.activeElement !== searchElement) {
    handleFocusInput();
    return;
  }
}

async function handleFocusInput(appendCharacter = "") {
  // focus and append the pressed character to maintain cognitive
  // flow
  const searchElement = getSearchElement();

  if (!searchElement) return;

  search.value += appendCharacter;
  await nextTick();
  searchElement.focus();
}

/**
 * Determine what the next list item we should focus on is
 */
function focusListItem(direction: "up" | "down" = "down") {
  let next: null | Element | undefined = null;

  const active = menu.value?.querySelector(".active");
  const firstInList = () => optionList.value?.firstElementChild;
  const lastInList = () => optionList.value?.lastElementChild;

  // depending on the direction, if there's no sibling in that direction, we'll just
  // utilise wrap around behaviour
  if (direction === "down") {
    next = active?.nextElementSibling ?? firstInList();
  } else {
    next = active?.previousElementSibling ?? lastInList();
  }

  if (next instanceof HTMLElement) {
    active?.classList.remove("active");
    next.classList.add("active");
  }
}

function handleClear() {
  emit("update:ids", []);
  emit("clear");
}

function handleUnfocus() {
  open.value = false;
  clearSearch();
}

/* HELPERS */
function generateId() {
  return (Math.random() + 1).toString(36).substring(2);
}

function clearSearch() {
  search.value = "";
}

/* GETS */
function getSearchElement(): HTMLInputElement | null {
  const searchElement = activator.value?.querySelector(".search");

  return searchElement instanceof HTMLInputElement ? searchElement : null;
}
</script>

<style>
.select-list-container {
  background: #fff;
  z-index: 1000;
  box-shadow: 0 2px 4px 0 #000000;
  border-radius: 0 0 0.5rem 0.5rem;
  border: 1px solid lightgray;
  color: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  > .select-list {
    overflow: hidden;
  }

  & .select-list-option {
    padding: 0.25rem 0.5rem;

    &:focus-within {
      outline: 2px solid salmon;
    }

    &.active {
      background: #6495ed;
    }

    &[aria-selected="true"] {
      background: plum;
    }
  }
}

.select-container.open {
  & .caret {
    transform: rotate(180deg);
  }

  & .select-box-multiple-values {
    transform: translateY(-150%);
    top: 0px;
  }
}

.open .select-box,
.select-box:focus {
  outline: 2px solid rgba(0, 62, 179, 0.342);
}

.select-box {
  display: flex;
  border: 1px solid lightgray;
  border-radius: 0.25rem;
  outline-offset: -2px;
  box-shadow: inset 0 0px 2px 0 rgb(0 0 0);
  background: white;
  color: black;
  padding-right: 5rem;
  padding: 0.3rem 0.5rem;
  overflow: hidden;

  &:hover {
    border-color: lightblue;
  }

  & .select-box-button {
    cursor: pointer;
    display: flex;
    width: 2rem; /* 
    position: absolute; */
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
  }
}

.listbox {
  & .select-box {
    /* border-radius: 0.5rem 0.5rem 0 0; */
    display: none;
  }

  &.select-list-container {
    border-radius: 0.5rem;
  }
}
.tag {
  white-space: nowrap;
  font-size: 0.6em;
  color: var(--secondary);
  border: 1px solid var(--primary);
  background: var(--primary);
  border-radius: 0.4rem;
  overflow: hidden;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  max-height: 100%;
  cursor: inherit;

  /* &.group-egg {
      --primary: #991b1e;
      --secondary: #fff;
    }

    &.group-tag { */
  --primary: #451952;
  --secondary: #fff;
  /*   } */

  > .value {
    padding: 0 0.2rem;
  }
}
.hover {
  background-color: cadetblue;
}
.show-scrollbar {
  overflow: auto !important;
}

.v-enter-active,
.v-leave-active {
  transition: max-height 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  max-height: 0 !important;
}

.icon {
  margin: 0;
  padding: 0;
  display: block;
  color: #000;
}
</style>
