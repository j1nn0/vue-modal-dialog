import { ref, watch, computed, type Ref } from 'vue';

export function useDialogDrag(
  isOpen: Ref<boolean>,
  enabled: Ref<boolean>,
) {
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
      : {}
  );

  return { onPointerDown, dragStyle, isDragging, offsetX, offsetY };
}
