import type { HTMLAttributes } from "vue";

type MenuLocation = "auto" | "modal" | "above" | "below";
type PropOptions = OptionValue[];

type OptionValue = Record<string, any>;
type OptionKey = number | string;

type OptionsMap = Map<OptionKey, OptionValue>;

type SelectValue = OptionKey | OptionKey[];

type MatcherCallback = (
  search: string,
  value: OptionValue,
  key: OptionKey
) => boolean;

type MenuState = "closing" | "opening" | "none";

type InputAriaAttributes = Pick<
  HTMLAttributes,
  "aria-expanded" | "aria-autocomplete" | "aria-activedescendant"
>;

type ListboxAriaAttributes = Pick<
  HTMLAttributes,
  "aria-multiselectable" | "aria-label"
>;

interface AngrySelectProps {
  /**
   * The options list.
   *
   * A string array or an array of objects can be passed. If passing
   * an object, make sure to specify the props `labelField` and `trackByKey`
   */
  options: string[] | Record<string, any>[];

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
  autocomplete?: boolean;

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

  menuLocation?: MenuLocation;
}

interface AngrySingleSelectProps extends AngrySelectProps {
  /**
   * TODO
   *
   * wanna make this a v-model of all the selected values
   */
  value: OptionValue | null;

  /**
   * The id of the selected option's value.
   *
   * If `multiple` is true, this will be an array of the option IDs.
   */
  id: OptionKey | null;
}

interface AngryMultiSelectProps extends AngrySelectProps {
  /**
   * TODO
   *
   * wanna make this a v-model of all the selected values
   */
  values: OptionValue[];
  /**
   * The id of the selected option's value.
   *
   * If `multiple` is true, this will be an array of the option IDs.
   */
  ids: OptionKey[];
}

interface AngrySelectEvents {
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
   * TODO
   *
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:values", values: OptionValue | OptionValue[]): void;
}

interface AngrySingleSelectEvents extends AngrySelectEvents {
  /**
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:id", value: SelectValue): void;
}

interface AngryMultiSelectEvents extends AngrySelectEvents {
  /**
   * Emitted whenever the combobox's value has been changed.
   */
  (event: "update:ids", value: SelectValue): void;
}

export type {
  OptionKey,
  OptionValue,
  MatcherCallback,
  MenuState,
  InputAriaAttributes,
  ListboxAriaAttributes,
  PropOptions,
  SelectValue,
  OptionsMap,
  MenuLocation,
  AngrySelectProps,
  AngryMultiSelectProps,
  AngrySingleSelectProps,
  AngrySelectEvents,
  AngrySingleSelectEvents,
  AngryMultiSelectEvents,
};
