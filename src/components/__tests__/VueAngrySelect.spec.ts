import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import VueAngrySelect from "../VueAngrySelect.vue";

describe("VueAngrySelect", () => {
  it("remaps options to [key, { value }] when provided a string array", () => {
    const wrapper = mount(VueAngrySelect, {
      props: {
        options: ["Blue", "Red", "Green"],
      },
    });

    expect(wrapper.vm.internalOptions.entries()).toStrictEqual(
      new Map([
        [0, { value: "Blue" }],
        [1, { value: "Red" }],
        [2, { value: "Green" }],
      ]).entries()
    );
  });

  it("updates the value when new option selected", async () => {
    const wrapper = mount(VueAngrySelect, {
      props: {
        options: ["Blue", "Red", "Green"],
      },
    });

    await wrapper.find(".select-box").trigger("keyup.enter");
    console.log("test", wrapper.html());
    //wrapper.find("[data-id='1']").trigger("click");
  });
});
