import type { Ref } from 'vue';
import { nextTick, warn as vueWarn, watch } from 'vue';

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
 * @param _props         - Snapshot of dialog props for focus-trap and modal behavior.
 * @param dialogId       - Unique dialog identifier.
 * @param closeCallback  - Callback invoked when `close` is called.
 * @returns `close` — a function that invokes the close callback.
 */
export function useDialogState(
  isOpen: Ref<boolean>,
  dialogRef: Ref<HTMLElement | null>,
  emit: DialogEmit,
  _props: Partial<VueModalDialogProps>,
  dialogId: string,
  closeCallback: () => void,
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
    closeCallback();
  };

  let subscribed = false;

  function updateFocus(): void {
    try {
      const topId = useDialogStack.topId();
      if (isOpen.value && topId === dialogId && _props.modal !== false) {
        activateFocusTrap();
      } else {
        deactivateFocusTrap();
      }
    } catch (err) {
      vueWarn('useDialogState updateFocus error', err);
    }
  }

  watch(isOpen, async (val) => {
    if (val) {
      await nextTick();
      if (!subscribed) {
        useDialogStack.subscribe(updateFocus);
        subscribed = true;
      }
      updateFocus();
      emit('opened');
    } else {
      // Deactivate focus trap; the component emits 'closed' after Vue applies the DOM change.
      deactivateFocusTrap();
      if (subscribed) {
        useDialogStack.unsubscribe(updateFocus);
        subscribed = false;
      }
    }
  });

  return { close };
}
