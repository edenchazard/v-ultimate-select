import type { StyleValue, Ref } from "vue";
import { computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useFloating, autoUpdate, flip, size, offset } from "@floating-ui/vue";
import type {
  OptionKey,
  OptionValue,
  MatcherCallback,
  AngrySelectProps,
} from "../types";
import useFocusOutside from "./useFocusOutside";

type MaybeElement<T extends HTMLElement = HTMLElement> = T | undefined;
type MaybeElementRef<T extends MaybeElement = MaybeElement> = Ref<
  T | undefined
>;

type ListItemSelectHandlerCallback = <T extends Event>(
  option: OptionValue<any>,
  e: T
) => void;

type ListOptionElement = HTMLLIElement & { dataset: { key: string } };

/**
 * Functionality common to all angry selects
 */
export default function useAngryHandlers(
  container: MaybeElementRef,
  activator: MaybeElementRef,
  menu: MaybeElementRef,
  optionList: MaybeElementRef<HTMLUListElement>,
  activeDescendant: MaybeElementRef<HTMLLIElement>,

  search: Ref<string>,
  open: Ref<boolean>,
  state: Ref<string>,

  props: Required<AngrySelectProps>
) {
  let listItemSelectHandler: ListItemSelectHandlerCallback = () => {};
  let windowScrollHideListener = () => (open.value = false);

  const { onFocusOutside, listen, unlisten } = useFocusOutside({
    listenOnMount: false,
  });

  const { floatingStyles, placement } = useFloating(container, menu, {
    strategy: "fixed",
    transform: true,
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
    middleware: [
      offset(5),
      size({
        apply({ availableWidth, availableHeight, elements, rects, placement }) {
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

  onFocusOutside([menu, container], handleBlur);

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
    // we want Extra Info, so we actually just make a wrapper around the
    // callback.
    listItemSelectHandler = (option, e) => {
      callback(option, e);

      if (props.closeOnSelect) handleBlur();
    };
  }

  async function handleFocusInput(appendCharacter = "") {
    // focus and append the pressed character to maintain cognitive
    // flow
    const searchElement = getSearchElement();

    if (!searchElement) return;
    search.value += appendCharacter;
    searchElement.focus();
  }

  async function handleClick(e: PointerEvent | MouseEvent) {
    await nextTick();

    handleFocusInput();

    if (props.openOnClick) {
      handleOpenIfNotClosing(e);
    }
  }

  /* prevents the menu quickly closing and re-opening if the activator is clicked
  (because we'd be clicking outside the list box AND clicking the box straight after*/
  function handleOpenIfNotClosing(e: Event) {
    if (!open.value && state.value === "none") open.value = true;
  }

  /* call this after the dropdown animation has finished, so we avoid
  showing a scrollbar during the animation */
  function showScrollbarIfNecessary() {
    optionList.value?.classList.toggle("show-scrollbar");
  }

  const filteredOptionsList = computed(() => {
    // no search applied
    if (["", null, undefined].includes(search.value)) {
      return internalOptions.value;
    }

    const defaultSearchMatcher: MatcherCallback = (
      search: string,
      value: OptionValue
    ) => {
      const test = props.trackByKey === null ? value : value[props.labelKey];
      return test.trim().toLowerCase().startsWith(search.toLowerCase());
    };

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
      let key: OptionKey = index;

      if (props.trackByKey !== null) {
        if (typeof opt !== "object") {
          throw new Error(
            `The select's trackByKey was specified as ${props.trackByKey}, 
            indicating this select uses objects as values.
            But ${JSON.stringify(opt)} is not an object`
          );
        } else if (props.trackByKey in opt === false) {
          throw new Error(
            `The select's trackByKey was specified as ${props.trackByKey}, 
            but ${JSON.stringify(opt)} doesn't have a property matching it.`
          );
        }
      } else if (typeof opt !== "string") {
        throw new Error(
          `The select's trackByKey is null, indicating this select uses strings
          as values. But ${opt.toString()} isn't a simple string value.`
        );
      }

      options.set(key.toString(), opt);
    });
    return options;
  });

  const activeDescendantId = computed<string | undefined>(() => {
    if (activeDescendant.value) {
      return activeDescendant.value?.id;
    } else return undefined;
  });

  onMounted(() => window.addEventListener("scroll", windowScrollHideListener));

  onUnmounted(() =>
    window.removeEventListener("scroll", windowScrollHideListener)
  );

  function handleInputKeyUp(e: KeyboardEvent) {
    const key = e.key;

    // it was probably alphanumeric? but we only care about improvising
    // if the search isn't already under focus
    if (key.length === 1) {
      handleOpenIfNotClosing(e);
      e.preventDefault();
      handleFocusInput(key);
      return;
    }

    switch (key) {
      case "ArrowDown":
        e.preventDefault();
        handleOpenIfNotClosing(e);
        handleFocusNextListItem("down");
        handleFocusInput();
        break;

      case "ArrowUp":
        e.preventDefault();
        handleFocusNextListItem("up");
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
        handleSelectListItem(e);
        break;
    }
  }

  function handleSelectListItem<T extends Event>(e: T) {
    const active = getCurrentlyHighlightedListItem();

    if (!active) return;

    listItemSelectHandler(getItem(active.dataset.key), e);
  }

  /**
   * Determine what the next list item we should focus on is
   */
  function handleFocusNextListItem(direction: "up" | "down" = "down") {
    let next: null | Element | undefined = null;

    const firstInList = () => optionList.value?.firstElementChild;
    const lastInList = () => optionList.value?.lastElementChild;

    // depending on the direction, if there's no sibling in that direction, we'll just
    // utilise wrap around behaviour
    if (direction === "down") {
      next =
        getCurrentlyHighlightedListItem()?.nextElementSibling ?? firstInList();
    } else {
      next =
        getCurrentlyHighlightedListItem()?.previousElementSibling ??
        lastInList();
    }

    if (next instanceof HTMLLIElement) {
      setCurrentlyHighlightedListItem(next, true);
    }
  }

  function handleBlur() {
    if (props.clearSearchStringOnBlur) handleClearSearch();

    open.value = false;
    activeDescendant.value = undefined;
  }

  function handleClearSearch() {
    search.value = "";
  }

  function getSearchElement(): HTMLInputElement | null {
    const searchElement = activator.value?.querySelector(".search");

    return searchElement instanceof HTMLInputElement ? searchElement : null;
  }

  function getItem(key: OptionKey) {
    return internalOptions.value.get(key);
  }

  function setCurrentlyHighlightedListItem(
    el: MaybeElement<HTMLLIElement>,
    scrollIntoView = false
  ) {
    if (!el) return;

    const active = getCurrentlyHighlightedListItem();
    active?.classList.remove("active");

    el.classList.add("active");
    activeDescendant.value = el;

    if (scrollIntoView)
      el.scrollIntoView({
        block: "nearest",
      });
  }

  function getCurrentlyHighlightedListItem(): ListOptionElement | null {
    const item = menu.value?.querySelector(".active");
    return item === undefined ? null : (item as ListOptionElement);
  }

  function isSelected(option: OptionValue): boolean {
    if (props.trackByKey === null) {
      // this actually works on both strings AND arrays lulz
      return props.modelValue?.indexOf(option) > -1;
    }

    return !!props.modelValue.find(
      (o) => o[props.trackByKey] === option[props.trackByKey]
    );
  }

  // shouldn't be in here, but for now.
  function generateId() {
    return (Math.random() + 1).toString(36).substring(2);
  }

  return {
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
    generateId, // <-- move this out of the comnposable at some point
    isSelected,

    /** handlers */
    handleClearSearch,
    handleClick,
    handleBlur,
    handleInputKeyUp,
    handleOpenIfNotClosing,
    handleFocusInput,
    handleSelectListItem,
  };
}
