import { ref, watch, computed, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';

/** Pixels of the dialog that must stay inside the viewport while dragging. */
const MIN_VISIBLE = 48;

/** Bounds the drag offset may move within, in pixels. */
interface DragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Composable that adds drag-to-move behavior to a dialog.
 *
 * Listens for pointer events on the dialog header and applies the CSS
 * `translate` property to reposition the dialog. `translate` is used
 * instead of `transform` so the offset composes with the centering
 * transform applied by the position classes rather than replacing it.
 *
 * The offset is clamped so the dialog can never be dragged out of reach:
 * its header stays below the viewport top and at least {@link MIN_VISIBLE}
 * pixels remain visible on every edge. The offset resets when the dialog
 * closes.
 *
 * @param isOpen  - Reactive ref tracking whether the dialog is open.
 * @param enabled - Reactive ref controlling whether dragging is active.
 * @param el      - Optional ref to the dialog root, used to clamp the offset
 *                  to the viewport. Without it the offset is unclamped.
 * @returns An object with `onPointerDown` event handler, `dragStyle`
 *          computed style, and `isDragging` state.
 *
 * @example
 * ```ts
 * const isDraggable = computed(() => props.draggable === true && props.width !== 'fullscreen');
 * const { onPointerDown, dragStyle } = useDialogDrag(isOpen, isDraggable, dialogRef);
 * ```
 */
export function useDialogDrag(
  isOpen: Ref<boolean>,
  enabled: Ref<boolean>,
  el?: Ref<HTMLElement | null>,
) {
  const offsetX = ref(0);
  const offsetY = ref(0);
  const isDragging = ref(false);

  let startX = 0;
  let startY = 0;
  let bounds: DragBounds | null = null;

  // Reset offset when dialog closes
  watch(isOpen, (open) => {
    if (!open) {
      offsetX.value = 0;
      offsetY.value = 0;
      isDragging.value = false;
    }
  });

  /**
   * Measure how far the current offset may still move before the dialog
   * would leave the viewport. Returns `null` when the element or viewport
   * is unavailable (SSR), which disables clamping.
   */
  function measureBounds(): DragBounds | null {
    const root = el?.value;
    if (!root || typeof window === 'undefined') return null;

    const rect = root.getBoundingClientRect();
    // Position the element would have at offset 0.
    const baseLeft = rect.left - offsetX.value;
    const baseTop = rect.top - offsetY.value;
    const baseRight = rect.right - offsetX.value;

    return {
      minX: MIN_VISIBLE - baseRight,
      maxX: window.innerWidth - MIN_VISIBLE - baseLeft,
      // Never let the header travel above the viewport top; it must stay grabbable.
      minY: -baseTop,
      maxY: window.innerHeight - MIN_VISIBLE - baseTop,
    };
  }

  function clamp(value: number, min: number, max: number): number {
    // A viewport smaller than the dialog can invert the bounds; prefer the minimum.
    return max < min ? min : Math.min(Math.max(value, min), max);
  }

  function onPointerDown(event: PointerEvent) {
    if (!enabled.value) return;
    if (event.button !== 0) return; // primary button / touch only

    isDragging.value = true;
    startX = event.clientX - offsetX.value;
    startY = event.clientY - offsetY.value;
    bounds = measureBounds();
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDragging.value) return;

    const nextX = event.clientX - startX;
    const nextY = event.clientY - startY;

    offsetX.value = bounds ? clamp(nextX, bounds.minX, bounds.maxX) : nextX;
    offsetY.value = bounds ? clamp(nextY, bounds.minY, bounds.maxY) : nextY;
  }

  function onPointerUp() {
    isDragging.value = false;
    bounds = null;
  }

  // Registered once so the listeners are torn down with the component's scope,
  // even if the pointer is released outside the window.
  const windowTarget = () => (typeof window !== 'undefined' ? window : null);
  useEventListener(windowTarget, 'pointermove', onPointerMove);
  useEventListener(windowTarget, 'pointerup', onPointerUp);
  useEventListener(windowTarget, 'pointercancel', onPointerUp);

  const dragStyle = computed(() =>
    enabled.value && (offsetX.value !== 0 || offsetY.value !== 0)
      ? { translate: `${offsetX.value}px ${offsetY.value}px` }
      : {},
  );

  return { onPointerDown, dragStyle, isDragging, offsetX, offsetY };
}
