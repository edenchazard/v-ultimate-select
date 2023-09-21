<template>
  <div
    ref="container"
    class="select-container"
    :class="classes"
    @click.stop.prevent
  >
    <div
      :id="nodeId"
      ref="activator"
      tabindex="0"
      class="select-box"
      role="listbox"
      :aria-expanded="open"
      :aria-owns="`${nodeId}-select-list-container`"
      :aria-multiselectable="multiple"
      :aria-placeholder="placeholder"
    >
      <div
        class="select-box-selections"
        @click="openIfNotClosing"
        @keyup.enter.space.prevent="openIfNotClosing"
      >
        <span v-if="ids.length === 0">
          {{ placeholder }}
        </span>

        <div
          v-else-if="multiple"
          v-for="value in selected"
          :key="value"
          class="tag"
        >
          <span class="value"> {{ value }} </span
          ><!--
            <span
              class="remove"
              :title="`Renove ${value}`"
              @click="remove(value)"
            >
              ✖
            </span> -->
        </div>

        <div v-else>
          {{ selected }}
        </div>
      </div>

      <button
        title="Clear selection"
        type="button"
        class="select-clear"
      >
        <FontAwesomeIcon
          class="select-box-button clear"
          icon="x"
          @click="clear"
        />
      </button>

      <FontAwesomeIcon
        class="select-box-button caret"
        icon="caret-down"
        @click="openIfNotClosing"
        @keyup.enter.space.prevent="openIfNotClosing"
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
          :id="`${nodeId}-select-list-container`"
          ref="menu"
          :style="listbox ? {} : floatingStyles"
          class="select-list-container"
          :class="classes"
          @keydown.tab.enter.prevent="open = false"
          @keydown.arrow-down.arrow-up.prevent
        >
          <div
            class="select-search-container"
            v-if="showSearch"
          >
            <FontAwesomeIcon
              class="magnify"
              icon="magnifying-glass"
            />
            <label :for="`${nodeId}-search`">Search</label>
            <input
              v-model="search"
              class="search"
              type="search"
              :id="`${nodeId}-search`"
            />
          </div>
          <ul
            class="select-list"
            ref="optionList"
          >
            <li
              v-for="[id, data] in filteredOptionsList"
              :key="id"
              role="option"
              class="select-list-option"
              :class="{
                selected: ids.includes(id.toString()),
              }"
              tabindex="0"
              :data-key="id"
              @click.prevent="selectOption"
              @keydown.space.prevent="selectOption"
            >
              <slot
                name="option"
                :option="data"
              >
                {{ data[trackByKey] }}
              </slot>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import "reset-css";
import {
  HTMLAttributes,
  PropType,
  StyleValue,
  computed,
  nextTick,
  ref,
  watch,
} from "vue";
import { useFloating, autoUpdate, flip, size } from "@floating-ui/vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { useElementSize } from "@vueuse/core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
  /**
   * The id of the selected option's value.
   *
   * If `multiple` is true, this will be an array of the option IDs.
   */
  ids: {
    type: [String, Array<string>],
    default: null,
  },

  /**
   * TODO
   *
   * wanna make this a v-model of all the selected values
   */
  values: {
    type: Object as PropType<OptionValue[] | OptionValue>,
    default: () => {},
  },

  /**
   * The options list.
   *
   * A string array or an array of objects can be passed. If passing
   * an object, make sure to specify the props `labelField` and `trackByKey`
   */
  options: {
    type: Object as PropType<string[] | Record<string, any>[]>,
    required: true,
  },

  /**
   * Allow the user to select multiple options.
   *
   * Works in tandem with `minimumSelections` and `maximumSelections`
   */
  multiple: {
    type: Boolean,
    default: false,
  },

  /**
   * Close the dropdown when an option has been selected.
   *
   * This property has no effect if `listbox` is true.
   */
  closeOnSelect: {
    type: Boolean,
    default: true,
  },

  /**
   * TODO
   * If no option has been picked, the placeholder text will appear.
   */
  placeholder: {
    type: null as unknown as PropType<string | null>,
    default: "Select...",
  },

  /**
   * A unique key for each option that differentiates it from other options
   * in the list.
   */
  trackByKey: {
    type: [String, Number] as PropType<OptionKey>,
    default: "value",
  },

  /**
   * A key to use for displaying an option's label. This should be the
   * text you'd like to present the user with.
   */
  labelField: {
    type: String,
    default: "value",
  },

  /**
   * TODO
   * The minimum number of options a user must select.
   */
  minimumSelections: {
    type: Number,
    default: 0,
  },

  /**
   * TODO
   * The maximum number of options a user must select.
   *
   * To not restrict the maximum number of options selected, leave this
   * value null.
   */
  maximumSelections: {
    type: Number,
    default: null,
  },

  /**
   * The max height in pixels for the dropdown.
   */
  dropDownMaxHeight: {
    type: Number,
    default: 300,
  },

  /**
   * TODO
   */
  fullPageIfDropdownTooBig: {
    type: Boolean,
    default: true,
  },

  /**
   * A html id attribute to give the component.
   *
   * If an id isn't specified, one will be generated automatically.
   */
  htmlId: {
    type: String as PropType<HTMLAttributes["id"]>,
    required: false,
  },

  /**
   * Show the search box. You can specify how the search is performed
   * with the `searchHandler` prop.
   */
  showSearch: {
    type: Boolean,
    default: true,
  },

  /**
   * Display the options list as a listbox instead of a dropdown.
   */
  listbox: {
    type: Boolean,
    default: false,
  },

  /**
   * A callback that defines how the combobox will filter options
   * when searching.
   */
  searchHandler: {
    type: null as unknown as PropType<MatcherCallback | null>,
    default: null,
  },
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
const optionList = ref<HTMLUListElement>();

const search = ref("");
const open = ref<boolean>(false);
const state = ref<"closing" | "opening" | "none">("none");
const nodeId = computed(() => props.htmlId ?? generateId());
const { width: boxWidth } = useElementSize(activator);

const { floatingStyles } = useFloating(activator, menu, {
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

const { activate, deactivate } = useFocusTrap(menu, {
  clickOutsideDeactivates: true,

  onActivate() {
    open.value = true;
  },
  onDeactivate() {
    open.value = false;
  },
  isKeyBackward(e: KeyboardEvent) {
    return e.key === "ArrowUp";
  },
  isKeyForward(e: KeyboardEvent) {
    return e.key === "ArrowDown";
  },
});

const classes = computed(() => [
  open.value ? "open" : "closed",
  {
    listbox: props.listbox,
  },
]);

watch(open, async (val) => {
  await nextTick();

  if (val) {
    activate();
    //focusFirstMenuItem();
  } else {
    deactivate();
  }
});

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

const selected = computed(() => {
  const get = (key: OptionKey) =>
    internalOptions.value.get(parseInt(key))?.[props.trackByKey];

  if (props.multiple && Array.isArray(props.ids)) {
    return (props.ids as OptionKey[]).map(get);
  }

  return get(props.ids as OptionKey);
});

function selectOption<T extends Event>(e: T) {
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
    console.log(exists, previous);

    // remove it
    if (exists > -1) {
      previous.splice(exists, 1);
    }
    // add it
    else {
      previous.push(key);
    }
    value = previous;
  }

  emit("update:ids", value);
  emit("selected", key, option);
}

/* call this after the dropdown animation has finished, so we avoid
  showing a scrollbar during the animation */
function showScrollbarIfNecessary() {
  optionList.value?.classList.toggle("show-scrollbar");
}

/* prevents the menu quickly closing and re-opening if the activator is clicked
  (because we'd be clicking outside the list box AND clicking the box straight after*/
function openIfNotClosing() {
  if (!open.value && state.value === "none") open.value = true;
}

function clear() {
  emit("update:ids", []);
  emit("clear");
}
/**
 * HELPERS
 */

/**
 * Generate a UUID
 */
function generateId() {
  return (Math.random() + 1).toString(36).substring(2);
}

/*
  // move focus to first menu item
  function focusFirstMenuItem() {
    if (menu.value)
      menu.value.querySelector<HTMLButtonElement>(':not([disabled])')?.focus();
  } */
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

  &.open {
  }

  &.closed {
    /* display: none; */
  }

  > .select-list {
    overflow: hidden;
  }
  & .select-list-option {
    padding: 0.5rem;

    &:focus-within {
      outline: 2px solid salmon;
    }

    &:hover {
      background: #6495ed;
    }

    &.selected {
      background: plum;
    }
  }
}

.select-container {
  &.open .caret {
    transform: rotate(180deg);
  }
}

.open .select-box,
.select-box:focus {
  outline: 2px solid rgba(0, 62, 179, 0.342);
}

.select-box {
  display: flex;
  align-items: center;
  border: 1px solid lightgray;
  border-radius: 0.5rem;
  outline-offset: -2px;

  &:hover {
    border-color: lightblue;
  }

  > .select-box-selections {
    flex: 1;
  }

  > .caret {
    transform: rotate(0deg);
    transition: transform 0.5s;
  }

  & .select-clear {
    padding: 0;
    margin: 0;
    background: inherit;
  }
  & .select-box-button {
    padding: 0 1rem;
    cursor: pointer;
  }
}

.select-box-selections {
  gap: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.select-box-selections,
.caret,
.select-clear {
  padding: 0.5rem;
}

.select-search-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid lightgray;
  border-width: 0 0 1px 0;
  box-shadow: 0 0 3px 0px #000000;

  & .search {
    padding: 0.5rem;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    background: #fff;
    box-shadow: inset 0 0 1px 0 #000000;
    border-radius: 0.2rem;
    border: 1px solid lightgray;
    color: #000;
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
</style>
