import type { Ref } from 'vue';
import { nextTick, onBeforeUnmount, onMounted, warn as vueWarn, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useDialogStack } from '@/composables/useDialogStack';
import type { VueModalDialogProps } from '@/types';

type DialogEmit = (event: 'opened') => void;

export type { DialogEmit };

/**
 * Composable that manages focus trapping for a stack-aware dialog.
 *
 * Body-class and focus management are delegated to {@link useDialogStack}.
 *
 * @param isOpen         - Model ref for v-model binding.
 * @param dialogRef      - Template ref pointing to the dialog root element.
 * @param emit           - Emits the `'opened'` event.
 * @param _props         - Dialog props used for initial focus configuration.
 * @param dialogId       - Unique dialog identifier.
 * @param closeCallback  - Callback invoked when `close` is called.
 * @returns `close` — a function that invokes the close callback.
 */
export function useDialogState(
  isOpen: Ref<boolean>,
  dialogRef: Ref<HTMLElement | null>,
  emit: DialogEmit,
  _props: Pick<VueModalDialogProps, 'initialFocus'>,
  dialogId: string,
  closeCallback: () => Promise<boolean> | void,
): { close: () => void } {
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: () => {
      const target = _props.initialFocus;
      if (target === undefined) return false;
      if (typeof target === 'string') {
        if (typeof document === 'undefined') return false;
        return dialogRef.value?.querySelector<HTMLElement>(target) || false;
      }
      return target;
    },
    escapeDeactivates: false,
  });

  const close = (): void => {
    void closeCallback();
  };

  let subscribed = false;
  let unmounted = false;

  function updateFocus(): void {
    try {
      const topId = useDialogStack.topId();
      if (isOpen.value && topId === dialogId) {
        activateFocusTrap();
      } else {
        deactivateFocusTrap();
      }
    } catch (err) {
      vueWarn('useDialogState updateFocus error', err);
    }
  }

  async function handleOpen(): Promise<void> {
    if (subscribed) return;

    await nextTick();
    if (unmounted || !isOpen.value || subscribed) return;

    if (!subscribed) {
      useDialogStack.subscribe(updateFocus);
      subscribed = true;
    }
    updateFocus();
    emit('opened');
  }

  function handleClose(): void {
    // Deactivate focus trap; the component emits 'closed' after Vue applies the DOM change.
    deactivateFocusTrap();
    if (subscribed) {
      useDialogStack.unsubscribe(updateFocus);
      subscribed = false;
    }
  }

  watch(isOpen, (val) => {
    if (val) {
      void handleOpen();
    } else {
      handleClose();
    }
  });

  onMounted(() => {
    if (isOpen.value) {
      void handleOpen();
    }
  });

  onBeforeUnmount(() => {
    unmounted = true;
    handleClose();
  });

  return { close };
}
