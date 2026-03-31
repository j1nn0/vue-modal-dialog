import { nextTick, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

export function useDialogState(isOpen, dialogRef, emit) {
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: false,
    escapeDeactivates: false,
  });

  const close = () => {
    isOpen.value = false;
  };

  let previousActiveElement = null;

  watch(isOpen, async (val) => {
    if (val) {
      previousActiveElement =
        typeof document !== 'undefined' ? document.activeElement : null;
      document.body.classList.add('vue-modal-open');
      await nextTick();
      activateFocusTrap();
      emit('opened');
    } else {
      document.body.classList.remove('vue-modal-open');
      deactivateFocusTrap();
      emit('closed');
      await nextTick();
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
      previousActiveElement = null;
    }
  });

  return { close };
}
