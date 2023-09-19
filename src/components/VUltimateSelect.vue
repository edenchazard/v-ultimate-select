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
      @click="openIfNotClosing"
      @keyup.enter.space.prevent="openIfNotClosing"
    >
      <div class="select-box-selections">
        <div
          v-if="multiple"
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
      <FontAwesomeIcon
        class="caret"
        icon="caret-down"
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
  StyleHTMLAttributes,
  StyleValue,
  computed,
  nextTick,
  ref,
  watch,
} from "vue";
import { useFloating, autoUpdate, flip, size } from "@floating-ui/vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { useElementSize, useResizeObserver } from "@vueuse/core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
  ids: {
    type: [String, Array<string>],
    default: null,
  },

  values: {
    type: Object as PropType<OptionValue[] | OptionValue>,
    default: () => {},
  },

  options: {
    type: Object as PropType<String[] | Record<string, any>[]>,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: "Select...",
  },

  trackByKey: {
    type: [String, Number] as PropType<OptionKey>,
    default: "value",
  },
  labelField: {
    type: String,
    default: "value",
  },

  minimumOptions: {
    type: Number,
    default: 1,
  },
  dropDownMaxHeight: {
    type: Number,
    default: 300,
  },
  fullPageIfDropdownTooBig: {
    type: Boolean,
    default: true,
  },
  /**
   * If an id isn't specified, one will be generated automatically.
   */
  htmlId: {
    type: String as PropType<HTMLAttributes["id"]>,
    required: false,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  listbox: {
    type: Boolean,
    default: false,
  },
  /*   searchHandler: {
    type: Object as PropType<(option: Option) => boolean>,
    default: () => true,
  }, */
});

const emit = defineEmits<{
  (event: "open"): void;
  (event: "close"): void;
  (event: "selected", key: OptionKey, value: OptionValue): void;
  (event: "update:ids", value: SelectValue): void;
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
  open ? "open" : "closed",
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
    return [...internalOptions.value];
  }

  const filtered = new Map<OptionKey, OptionValue>();
  [...internalOptions.value].forEach(([key, value]) => {
    // matches the filter
    if (value[props.trackByKey].toString().indexOf(search.value) !== -1) {
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

function selectOption(e: PointerEvent) {
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
  box-sizing: border-box;
  border: 1px solid lightgray;
  border-radius: 0.5rem;
  outline-offset: -2px;
  padding: 0.5rem;

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
}

.select-box-selections {
  gap: 0.5rem;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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
