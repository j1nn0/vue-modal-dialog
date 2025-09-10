import { nextTick, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

export function useDialogState(isOpen, dialogRef, emit) {
  let overflow = null;
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: false,
    escapeDeactivates: false,
  });

  const close = () => {
    isOpen.value = false;
  };

  watch(isOpen, async (val) => {
    if (val) {
      overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      await nextTick();
      activateFocusTrap();
      emit('opened');
    } else {
      document.body.style.overflow = overflow;
      deactivateFocusTrap();
      emit('closed');
    }
  });

  return { close };
}
