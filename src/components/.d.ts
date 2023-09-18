type MenuLocation = "auto" | "above" | "below";
type PropOptions = Array<string | Option>;

type OptionValue = Record<string, any>;
type OptionKey = number | string;

// <key, value>
type OptionsMap = Map<OptionKey, OptionValue>;

type SelectValue = OptionKey | OptionKey[];
