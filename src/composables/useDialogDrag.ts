import { ref, watch, computed, type Ref } from 'vue';

/**
 * Composable that adds drag-to-move behavior to a dialog.
 *
 * Listens for pointer events on the dialog header and applies a CSS
 * `translate()` transform to reposition the dialog. The offset resets
 * automatically when the dialog closes.
 *
 * @param isOpen  - Reactive ref tracking whether the dialog is open.
 * @param enabled - Reactive ref controlling whether dragging is active.
 * @returns An object with `onPointerDown` event handler, `dragStyle`
 *          computed style, and `isDragging` state.
 *
 * @example
 * ```ts
 * const isDraggable = computed(() => props.draggable === true && props.width !== 'fullscreen');
 * const { onPointerDown, dragStyle } = useDialogDrag(isOpen, isDraggable);
 * ```
 */
export function useDialogDrag(isOpen: Ref<boolean>, enabled: Ref<boolean>) {
  const offsetX = ref(0);
  const offsetY = ref(0);
  const isDragging = ref(false);

  // Reset offset when dialog closes
  watch(isOpen, (open) => {
    if (!open) {
      offsetX.value = 0;
      offsetY.value = 0;
    }
  });

  function onPointerDown(event: PointerEvent) {
    if (!enabled.value) return;
    isDragging.value = true;
    const startX = event.clientX - offsetX.value;
    const startY = event.clientY - offsetY.value;

    function onPointerMove(e: PointerEvent) {
      offsetX.value = e.clientX - startX;
      offsetY.value = e.clientY - startY;
    }

    function onPointerUp() {
      isDragging.value = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
  }

  const dragStyle = computed(() =>
    enabled.value && (offsetX.value !== 0 || offsetY.value !== 0)
      ? { transform: `translate(${offsetX.value}px, ${offsetY.value}px)` }
      : {},
  );

  return { onPointerDown, dragStyle, isDragging, offsetX, offsetY };
}
