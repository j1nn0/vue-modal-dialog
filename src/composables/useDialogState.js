import { nextTick, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useDialogStack } from '@/composables/useDialogStack';

export function useDialogState(isOpen, dialogRef, emit, props, dialogId) {
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: false,
    escapeDeactivates: false,
  });

  const close = () => {
    isOpen.value = false;
  };

  // Backward-compatible behavior: if no dialogId provided, keep original body-class + focus logic
  if (!dialogId) {
    watch(isOpen, async (val) => {
      if (val) {
        if (typeof document !== 'undefined') document.body.classList.add('vue-modal-open');
        await nextTick();
        activateFocusTrap();
        emit('opened');
      } else {
        if (typeof document !== 'undefined') document.body.classList.remove('vue-modal-open');
        deactivateFocusTrap();
        emit('closed');
      }
    });

    return { close };
  }

  // Stack-aware behavior when dialogId is provided
  let subscribed = false;

  function updateFocus() {
    try {
      const topId = useDialogStack.topId();
      if (isOpen.value && topId === dialogId) {
        activateFocusTrap();
      } else {
        deactivateFocusTrap();
      }
    } catch (err) {
      // ignore

      console.debug('useDialogState updateFocus error', err);
    }
  }

  watch(isOpen, async (val) => {
    if (val) {
      // opened
      emit('opened');
      await nextTick();
      if (!subscribed) {
        useDialogStack.subscribe(updateFocus);
        subscribed = true;
      }
      updateFocus();
    } else {
      // closed
      deactivateFocusTrap();
      emit('closed');
      if (subscribed) {
        useDialogStack.unsubscribe(updateFocus);
        subscribed = false;
      }
    }
  });

  return { close };
}
