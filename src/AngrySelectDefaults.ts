import type { AngrySelectProps } from "./types";

const AngrySelectDefaults: Omit<AngrySelectProps, "options"> = {
  listbox: false,
  fullPageIfDropdownTooBig: true,
  dropDownMaxHeight: 300,
  maximumSelections: 0,
  minimumSelections: 0,
  labelField: "value",
  trackByKey: "value",
  listboxLabel: "TODO",
  closeOnSelect: true,
  menuLocation: "auto",
};

export default AngrySelectDefaults;
