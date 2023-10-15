import type { AngrySelectProps } from "./types";

const AngrySelectDefaults: Omit<AngrySelectProps, "options"> = {
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
};

export default AngrySelectDefaults;
