import { computed, nextTick, watch } from "vue";
import type { StyleValue, Ref } from "vue";
import { useFloating, autoUpdate, flip, size } from "@floating-ui/vue";
import type {
  OptionKey,
  OptionValue,
  MatcherCallback,
  AngrySelectProps,
} from "../types";
import useFocusOutside from "./useFocusOutside";

type ListItemSelectHandlerCallback = <T extends Event>(
  e: T,
  option: { id: OptionKey; value: OptionValue }
) => void;
/**
 * Functionality common to all angry selects
 */
export default function useAngryHandlers(
  container: Ref<HTMLElement | undefined>,
  activator: Ref<HTMLElement | undefined>,
  menu: Ref<HTMLElement | undefined>,
  optionList: Ref<HTMLElement | undefined>,
  activeDescendant: Ref<HTMLLIElement>,

  search: Ref<string>,
  open: Ref<boolean>,
  state: Ref<string>,

  props: Required<AngrySelectProps>
) {
  let listItemSelectHandler: ListItemSelectHandlerCallback | null = null;

  const { onFocusOutside, listen, unlisten } = useFocusOutside({
    listenOnMount: false,
  });

  const { floatingStyles, placement } = useFloating(container, menu, {
    strategy: "fixed",
    transform: true,
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
    middleware: [
      size({
        apply({ availableWidth, availableHeight, elements, rects }) {
          /*  console.log(
            availableHeight,
            availableWidth,
            availableHeight < props.dropDownMaxHeight
          ); */
          // Do things with the data, e.g.
          const declarations: StyleValue = {
            maxHeight: `${props.dropDownMaxHeight}px`,
            width: `${rects.reference.width}px`,
          };

          // only need to match the width of the activator if we're a
          // regular combo box
          /*        if (!props.listbox) {
            declarations.width = `${boxWidth.value}px`;
          } */

          Object.assign(elements.floating.style, declarations);
        },
      }),
      flip({
        fallbackPlacements: ["top-start"],
      }),
    ],
  });

  onFocusOutside([menu, container], handleUnfocus);

  // don't really need to do this but it's nice to remove the listener I guess.
  watch(open, (cur) => {
    (cur ? listen : unlisten)();
  });

  /*   const listboxPositioningStyle = computed(() => {
    if (availableHeight < props.dropDownMaxHeight) {
      Object.assign(declarations, {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        transform: "translate(0px, 0px)",
      });
    }
  }); */

  const classes = computed(() => [
    open.value ? "open" : "closed",
    placement.value === "top-start" ? "above" : "below",
    {
      listbox: props.listbox,
    },
  ]);

  function setListItemSelectAction(callback: ListItemSelectHandlerCallback) {
    listItemSelectHandler = (e) => {
      console.log(e);

      if (!(e.target instanceof HTMLLIElement)) return;

      const key = e.target.dataset.key;

      if (typeof key === "undefined") return;

      const _option = internalOptions.value.get(
        isNaN(parseInt(key)) ? key : parseInt(key)
      );

      if (!_option) return;

      callback(e, _option);
    };
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

  async function handleClick(e: PointerEvent) {
    const searchElement = getSearchElement();
    if (e.target === searchElement) {
    }
    handleOpenIfNotClosing(e);
    // await nextTick();
    // if (document.activeElement !== searchElement) {
    //handleFocusInput();
    return;
    //}
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
    console.log(open.value, state.value);
    if (!open.value && state.value === "none") open.value = true;
  }

  /* call this after the dropdown animation has finished, so we avoid
  showing a scrollbar during the animation */
  function showScrollbarIfNecessary() {
    optionList.value?.classList.toggle("show-scrollbar");
  }

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

  async function handleInputKeyUp(e: KeyboardEvent) {
    const key = e.key;
    const searchElement = getSearchElement();
    console.log(key);

    // it was probably alphanumeric? but we only care about improvising
    // if the search isn't already under focus
    if (key.length === 1 && document.activeElement !== searchElement) {
      handleOpenIfNotClosing(e);
      e.preventDefault();
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
        e.preventDefault();
        listItemSelectHandler(e);
        break;
    }
  }

  function selectListItem(item) {}

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
      next.scrollIntoView({ block: "center" });
    }
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

  return {
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
  };
}
