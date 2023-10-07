<template>
  <div class="slider">
    <div class="step-counter">
      <span
        v-for="number in steps"
        class="number"
      >
        <Transition :name="direction">
          <div
            class="fill"
            v-if="activeStep === number"
          ></div>
        </Transition>
        {{ number }}
      </span>
    </div>

    <div class="screen">
      <div>
        <button
          type="button"
          @click="previous"
        >
          &lt;
        </button>
      </div>

      <div class="slide-container">
        <TransitionGroup :name="direction">
          <div
            v-for="step in steps"
            class="slide"
            v-show="activeStep === step"
            :key="step"
          >
            <slot
              :name="`step_${step}`"
              :previous="previous"
              :next="next"
            >
              Step {{ step }}
            </slot>
          </div>
        </TransitionGroup>
      </div>

      <div>
        <button
          type="button"
          @click="next"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["update:activeStep"]);

const props = defineProps({
  steps: {
    type: Number,
    required: true,
  },

  activeStep: {
    type: Number,
    required: true,
  },
});

const direction = ref("forwards");

function previous() {
  const previous = props.activeStep - 1;

  // don't go past 0
  if (previous <= 0) return;

  direction.value = "backwards";
  emit("update:activeStep", previous);
}

function next() {
  const next = props.activeStep + 1;

  // don't go past max
  if (next > props.steps) return;

  direction.value = "forwards";
  emit("update:activeStep", next);
}
</script>

<style scoped>
.forwards-enter-active,
.forwards-leave-active,
.backwards-enter-active,
.backwards-leave-active {
  transition:
    transform 1s ease,
    opacity 0.5s ease;
}
.forwards-enter-from {
  transform: translateX(-100%);
}

.forwards-leave-to {
  transform: translateX(100%);
}

.backwards-enter-from {
  transform: translateX(100%);
}

.backwards-leave-to {
  transform: translateX(-100%);
}

.forwards-leave-active,
.backwards-leave-active {
  position: absolute;
}

.slider {
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.screen {
  display: grid;
  grid-template-columns: auto 1fr auto;
  overflow: hidden;
  justify-items: stretch;
  align-items: center;
  flex: 1;
  position: relative;
  gap: 1rem;
}

.slide-container {
  overflow: hidden;
  position: relative;
  align-self: start;
  /* you need a height for the scrollbar to show (if we need it) */
  height: 100%;
  width: 100%;
}
.slide {
  padding: 1rem;
  overflow: hidden auto;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.step-counter {
  display: flex;
  color: red;
  align-self: center;
  z-index: 1;
  gap: 0.5rem;
}

.step-counter .number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.5rem;
  border: 2px solid white;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  color: blue;
  position: relative;
  overflow: hidden;
}

.step-counter .number .fill {
  height: 100%;
  width: 100%;
  position: absolute;
  background: red;
  z-index: -1;
}
</style>
