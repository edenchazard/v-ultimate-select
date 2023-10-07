import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Search from "../Search.vue";

describe("Search", () => {
  it("emits new value on type", async () => {
    const wrapper = mount(Search, {
      props: {
        modelValue: "test",
      },
    });

    await wrapper.setValue("rin hoshizora");

    expect(wrapper.emitted()["update:modelValue"][0]).toEqual([
      "rin hoshizora",
    ]);
  });
});
