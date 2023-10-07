import { onMounted, onUnmounted, toRef, type Ref, type MaybeRef } from "vue";

type MaybeHTMLElementRef = MaybeRef<HTMLElement | undefined>;
type ElementOrElementArray = MaybeHTMLElementRef | MaybeHTMLElementRef[];
type UseFocusOutsideCallback = () => void;
type UseFocusOutsideUnlistener = () => void;

interface UseFocusOutsideReturn {
  listen: () => void;

  unlisten: () => void;

  onFocusOutside: (
    boundary: ElementOrElementArray,
    callback: UseFocusOutsideCallback
  ) => UseFocusOutsideUnlistener;
}

interface UseFocusOutsideOptions {
  listenOnMount?: boolean;
}

export default function useFocusOutside(
  _options: UseFocusOutsideOptions = {}
): UseFocusOutsideReturn {
  const listeners: Array<{
    boundary: Array<Ref<HTMLElement>>;
    callback: UseFocusOutsideCallback;
  }> = [];

  const options: UseFocusOutsideOptions = {
    listenOnMount: true,
    ..._options,
  };

  onMounted(() => {
    if (options.listenOnMount) {
      listen();
    }
  });

  onUnmounted(() => unlisten);

  /**
   * Subscribe a listener to listen for focusness.
   * @param boundary An element or array of elements to consider as a boundary.
   *  When focus happens outside at least one of these elements, the listener
   *  will be triggered.
   * @param callback
   * @returns A callback to unsubscribe the listener.
   */
  function onFocusOutside(
    boundary: ElementOrElementArray,
    callback: UseFocusOutsideCallback
  ): UseFocusOutsideUnlistener {
    const sub = listeners.push({
      boundary: Array.isArray(boundary)
        ? boundary.map((el) => toRef(el))
        : [toRef(boundary)],
      callback,
    });

    // return a clean up function so we can remove the subscriber manually if
    // we wish
    return () => {
      listeners.splice(sub, 1);
    };
  }

  /**
   * Listen for focusness.
   */
  function listen() {
    document.body.addEventListener("pointerdown", pointerListener);
    document.body.addEventListener("keydown", keyListener);
  }

  /**
   * Stop listening for focusness.
   */
  function unlisten() {
    document.body.removeEventListener("pointerdown", pointerListener);
    document.body.removeEventListener("keydown", keyListener);
  }

  const pointerListener = (e: PointerEvent) => {
    if (!e.target) return;

    ifOutOfBounds(e);
    // if both of these ae false, then we've performed an "out of bounds"
    // and should close the drop down
  };

  const keyListener = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
        ifOutOfBounds(e);
        break;
      /*  case "ArrowUp":
        e.preventDefault();
        //ifOutOfBounds(e, () => (open.value = false));
        break; */
    }
    if (e.key === "Tab") {
      console.log("test");
    }
  };

  function ifOutOfBounds(e: Event) {
    requestAnimationFrame(() => {
      listeners.forEach((listener) => {
        const testBoundaries = listener.boundary.map(
          (boundary) => boundary.value?.contains(document.activeElement)
        );

        if (testBoundaries.includes(true) === false) {
          listener.callback();
        }
      });
    });
  }

  return {
    onFocusOutside,
    listen,
    unlisten,
  };
}
