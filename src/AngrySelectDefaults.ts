import type { AngrySelectProps } from "./types";

const AngrySelectDefaults: Omit<AngrySelectProps, "options" | "modelValue"> = {
  listbox: false,
  fullPageIfDropdownTooBig: true,
  dropDownMaxHeight: 300,
  maximumSelections: 0,
  minimumSelections: 0,
  labelKey: "value",
  trackByKey: null,
  listboxLabel: "TODO",
  closeOnSelect: true,
  menuLocation: "auto",
  openOnClick: false,
  placeholder: "Select a value",
  autocomplete: true,
  clearSearchStringOnBlur: false,
};

export default AngrySelectDefaults;
