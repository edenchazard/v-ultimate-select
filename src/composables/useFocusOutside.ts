import { onMounted, onUnmounted, toRef, nextTick, ref } from "vue";
import type { MaybeRef, Ref } from "vue";

type HTMLElementRefArray = Ref<HTMLElement>[];
type UseFocusOutsideCallback = () => void;
type UseFocusOutsideUnlistener = () => void;

interface UseFocusOutsideReturn {
  listen: () => void;

  unlisten: () => void;

  onFocusOutside: (
    boundary: MaybeRef<HTMLElement | HTMLElement[]>,
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
    boundary: HTMLElementRefArray;
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
    boundary: MaybeRef<HTMLElement | HTMLElement[]>,
    callback: UseFocusOutsideCallback
  ): UseFocusOutsideUnlistener {
    const sub = listeners.push({
      boundary:
        boundary instanceof HTMLElement
          ? [toRef(boundary)]
          : (boundary as HTMLElement[]).map((el) => toRef(el)),
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
    document.body.addEventListener("focusin", checkOutOfBounds);
    document.body.addEventListener("click", checkOutOfBounds);
  }

  /**
   * Stop listening for focusness.
   */
  function unlisten() {
    document.body.removeEventListener("focusout", checkOutOfBounds);
    document.body.removeEventListener("click", checkOutOfBounds);
  }

  function checkOutOfBounds(e: Event) {
    const triggerListener = (listener: (typeof listeners)[0]) =>
      listener.callback();

    (async function () {
      await nextTick();

      requestAnimationFrame(() => {
        listeners.forEach((listener) => {
          if (e.target instanceof HTMLElement === false) {
            triggerListener(listener);
            return;
          }

          const testBoundariesEscaped = listener.boundary.filter(
            (boundary) => boundary.value?.contains(e.target as Node) === true
          );

          if (testBoundariesEscaped.length === 0) {
            triggerListener(listener);
          }
        });
      });
    })();
  }

  return {
    onFocusOutside,
    listen,
    unlisten,
  };
}
