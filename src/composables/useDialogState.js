import { getCurrentInstance, nextTick, onUnmounted, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

import { useModalStack } from './useModalStack';

export function useDialogState(isOpen, dialogRef, emit) {
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: false,
    escapeDeactivates: false,
  });

  const { push, pop, isTop, backdropZIndex, dialogZIndex } = useModalStack();

  const close = () => {
    isOpen.value = false;
  };

  // `immediate: true` ensures the modal is registered in the stack even when it
  // starts already open (isOpen = true at mount time). The `oldVal` guard prevents
  // emitting 'closed' spuriously on the first synchronous call with oldVal === undefined.
  watch(
    isOpen,
    async (val, oldVal) => {
      if (val) {
        push();
        await nextTick();
        activateFocusTrap();
        if (oldVal !== undefined) emit('opened');
      } else if (oldVal) {
        pop();
        deactivateFocusTrap();
        emit('closed');
      }
    },
    { immediate: true },
  );

  // `onUnmounted` requires an active component instance; `watch` does not,
  // so we guard this separately to allow the composable to be called in tests.
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (isOpen.value) {
        pop();
        deactivateFocusTrap();
      }
    });
  }

  return { close, isTop, backdropZIndex, dialogZIndex };
}
