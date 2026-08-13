import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, onMounted, ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { Ref } from 'vue';
import { clearDialogStack } from '@/test-utils';

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
    clearDialogStack();
    document.body.classList.remove('vue-modal-open');
  });

  afterEach(() => {
    clearDialogStack();
  });

  it('handles an initially open dialog after mount and cleans up on unmount', async () => {
    const initialIsOpen = ref(true);
    const initialEmit = vi.fn() as unknown as DialogEmit;
    const initialRef = ref<HTMLElement | null>(null);

    const wrapper = mount(
      defineComponent({
        setup() {
          useDialogState(initialIsOpen, initialRef, initialEmit, {}, 'initial', vi.fn());
          onMounted(() => {
            useDialogStack.push({ id: 'initial', propsSnapshot: { scrollLock: true } });
          });
          return () => h('div', { ref: initialRef });
        },
      }),
    );
    await nextTick();
    await nextTick();

    expect(useDialogStack.count()).toBe(1);
    expect(activateSpy).toHaveBeenCalled();
    expect(initialEmit).toHaveBeenCalledWith('opened');
    expect(document.body.classList.contains('vue-modal-open')).toBe(true);

    deactivateSpy.mockClear();
    wrapper.unmount();

    expect(deactivateSpy).toHaveBeenCalledOnce();
    expect(useDialogStack.count()).toBe(1);

    useDialogStack.push({ id: 'other' });
    expect(deactivateSpy).toHaveBeenCalledOnce();

    useDialogStack.pop('other');
    useDialogStack.pop('initial');
  });

  it('activates focus trap only when top of stack', async () => {
    useDialogState(isOpen, dialogRef, emit, {}, 'd1', vi.fn());

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
