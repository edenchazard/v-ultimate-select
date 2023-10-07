type MenuLocation = "auto" | "above" | "below";
type PropOptions = Array<string | OptionValue>;

type OptionValue = Record<string, any>;
type OptionKey = number | string;

// <key, value>
type OptionsMap = Map<OptionKey, OptionValue>;

type SelectValue = OptionKey | OptionKey[];

type MatcherCallback = (
  search: string,
  value: OptionValue,
  key: OptionKey
) => boolean;
