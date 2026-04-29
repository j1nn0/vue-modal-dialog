import type { Ref } from 'vue';
import { nextTick, watch } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useDialogStack } from '@/composables/useDialogStack';

type DialogEmit = ((event: 'opened') => void) & ((event: 'closed') => void);

export type { DialogEmit };

/**
 * Composable that manages dialog open/close state and focus trapping.
 *
 * When called **without** a `dialogId` (backward-compatible path) the
 * composable manages the `vue-modal-open` body class and focus trap
 * directly.
 *
 * When called **with** a `dialogId` (stack-aware path) the composable
 * delegates body-class and focus management to {@link useDialogStack}.
 *
 * @param isOpen    - Model ref for v-model binding.
 * @param dialogRef - Template ref pointing to the dialog root element.
 * @param emit      - Emits `'opened'` and `'closed'` events.
 * @param _props    - Reserved for internal component usage.
 * @param dialogId  - Unique dialog identifier for stack-aware operation.
 * @returns `close` — a function that sets `isOpen` to `false`.
 */
export function useDialogState(
  isOpen: Ref<boolean>,
  dialogRef: Ref<HTMLElement | null>,
  emit: DialogEmit,
  _props: Record<string, unknown> = {},
  dialogId?: string,
): { close: () => void } {
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(dialogRef, {
    initialFocus: () => {
      const target = _props.initialFocus as string | HTMLElement | undefined;
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
    isOpen.value = false;
  };

  // Backward-compatible behavior: if no dialogId provided, keep original body-class + focus logic
  if (!dialogId) {
    watch(isOpen, async (val) => {
      if (val) {
        if (typeof document !== 'undefined' && _props.modal !== false) document.body.classList.add('vue-modal-open');
        await nextTick();
        if (_props.modal !== false) {
          activateFocusTrap();
        }
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

  function updateFocus(): void {
    try {
      const topId = useDialogStack.topId();
      if (isOpen.value && topId === dialogId && _props.modal !== false) {
        activateFocusTrap();
      } else {
        deactivateFocusTrap();
      }
    } catch (err) {
      console.warn('useDialogState updateFocus error', err);
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
      // closed — deactivate focus trap but defer 'closed' emit to the
      // component so it fires after the leave transition completes.
      deactivateFocusTrap();
      if (subscribed) {
        useDialogStack.unsubscribe(updateFocus);
        subscribed = false;
      }
    }
  });

  return { close };
}
