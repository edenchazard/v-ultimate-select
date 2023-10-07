import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InputButtons from "../InputButtons.vue";

describe("Input Buttons", () => {
  describe("clear", () => {
    it("emits clear on click", async () => {
      const wrapper = mount(InputButtons);

      await wrapper.find(".clear").trigger("click");
      expect(wrapper.emitted()).toHaveProperty("clear");
    });

    it("is not focusable", async () => {
      const wrapper = mount(InputButtons);

      await wrapper.find(".clear").trigger("focus");
      expect(wrapper.emitted()).not.toHaveProperty("focus");
    });
  });

  describe("caret", () => {
    it("emits clear on click", async () => {
      const wrapper = mount(InputButtons);

      await wrapper.find(".clear").trigger("click");
      expect(wrapper.emitted()).toHaveProperty("clear");
    });

    it("is not focusable", async () => {
      const wrapper = mount(InputButtons);

      await wrapper.findComponent(".caret").trigger("focus");
      expect(wrapper.emitted()).not.toHaveProperty("focus");
    });
  });
});
