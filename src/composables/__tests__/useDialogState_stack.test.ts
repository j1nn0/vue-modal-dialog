import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

import { useDialogState } from '../useDialogState';
import type { DialogEmit } from '../useDialogState';
import { useDialogStack } from '../useDialogStack';

// mock focus trap
const activateSpy = vi.fn();
const deactivateSpy = vi.fn();
vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: activateSpy,
    deactivate: deactivateSpy,
  })),
}));

describe('useDialogState (stack-aware)', () => {
  let dialogRef: Ref<HTMLElement | null>;
  let isOpen: Ref<boolean>;
  let emit: DialogEmit;

  beforeEach(() => {
    dialogRef = ref(null);
    isOpen = ref(false);
    emit = vi.fn() as unknown as DialogEmit;
    activateSpy.mockClear();
    deactivateSpy.mockClear();
    // clear any existing stack
    const s = useDialogStack._getStack();
    s.forEach((e) => useDialogStack.pop(e.id));
    document.body.classList.remove('vue-modal-open');
  });

  afterEach(() => {
    const s = useDialogStack._getStack();
    s.forEach((e) => useDialogStack.pop(e.id));
  });

  it('activates focus trap only when top of stack', async () => {
    useDialogState(isOpen, dialogRef, emit, {}, 'd1');

    // open and register
    isOpen.value = true;
    await nextTick();

    // push this dialog to stack
    useDialogStack.push({ id: 'd1' });
    await nextTick();

    expect(activateSpy).toHaveBeenCalled();

    // push another on top
    useDialogStack.push({ id: 'd2' });
    await nextTick();
    expect(deactivateSpy).toHaveBeenCalled();

    // pop top
    useDialogStack.pop('d2');
    await nextTick();
    expect(activateSpy).toHaveBeenCalledTimes(2);

    // close dialog
    isOpen.value = false;
    await nextTick();
    expect(deactivateSpy).toHaveBeenCalled();
  });
});
