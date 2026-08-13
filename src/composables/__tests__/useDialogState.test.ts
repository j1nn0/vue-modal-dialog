import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useDialogState } from '../useDialogState';
import { useDialogStack } from '../useDialogStack';
import { clearDialogStack } from '@/test-utils';
import type { DialogEmit } from '../useDialogState';

// useFocusTrap をモック
const activateSpy = vi.fn();
const deactivateSpy = vi.fn();

vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: activateSpy,
    deactivate: deactivateSpy,
  })),
}));

describe('useDialogState', () => {
  let dialogRef: Ref<HTMLElement | null>;
  let isOpen: Ref<boolean>;
  let emit: DialogEmit;
  let dialogState: { close: () => void };

  beforeEach(() => {
    dialogRef = ref(null);
    isOpen = ref(false);
    emit = vi.fn() as unknown as DialogEmit;
    activateSpy.mockClear();
    deactivateSpy.mockClear();
    vi.mocked(useFocusTrap).mockClear();
    clearDialogStack();
    dialogState = useDialogState(isOpen, dialogRef, emit, {}, 'dialog-test', () => {
      isOpen.value = false;
    });
  });

  afterEach(() => {
    clearDialogStack();
    document.body.classList.remove('vue-modal-open');
  });

  it('activates focus trap while the stack owns body class state', async () => {
    useDialogStack.push({ id: 'dialog-test', propsSnapshot: { scrollLock: true } });
    isOpen.value = true;
    await nextTick();
    await nextTick();

    expect(document.body.classList.contains('vue-modal-open')).toBeTruthy();
    expect(activateSpy).toHaveBeenCalled();
    expect(emit).toBeCalledWith('opened');

    isOpen.value = false;
    await nextTick();

    expect(deactivateSpy).toHaveBeenCalled();

    useDialogStack.pop('dialog-test');
    expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();
  });

  it('close() invokes the callback and triggers focus cleanup', async () => {
    useDialogStack.push({ id: 'dialog-test', propsSnapshot: { scrollLock: true } });
    isOpen.value = true;
    await nextTick();
    await nextTick();

    dialogState.close();
    expect(isOpen.value).toBe(false);

    await nextTick();

    expect(deactivateSpy).toHaveBeenCalled();
    useDialogStack.pop('dialog-test');
  });

  describe('modal prop', () => {
    it('does not activate focus trap when modal=false', async () => {
      const localIsOpen = ref(false);
      const props = { modal: false };
      useDialogState(localIsOpen, dialogRef, emit, props, 'dialog-test-1', vi.fn());

      useDialogStack.push({ id: 'dialog-test-1' });

      localIsOpen.value = true;
      await nextTick();
      await nextTick();

      expect(activateSpy).not.toHaveBeenCalled();
      expect(emit).toBeCalledWith('opened');

      useDialogStack.pop('dialog-test-1');
    });
  });

  describe('initialFocus', () => {
    it('returns false when props.initialFocus is undefined', () => {
      const props = { initialFocus: undefined };
      useDialogState(isOpen, dialogRef, emit, props, 'dialog-test', vi.fn());

      const trapCalls = vi.mocked(useFocusTrap).mock.calls;
      const lastCall = trapCalls[trapCalls.length - 1];
      const options = lastCall[1] as Record<string, unknown>;

      const initialFocusFn = options.initialFocus as () => string | HTMLElement | false;
      expect(initialFocusFn()).toBe(false);
    });

    it('returns matching HTMLElement for valid string selector', () => {
      const dummyElement = document.createElement('input');
      const rootElement = document.createElement('div');
      rootElement.querySelector = vi.fn().mockReturnValue(dummyElement);
      dialogRef.value = rootElement;

      const props = { initialFocus: '.my-input' };
      useDialogState(isOpen, dialogRef, emit, props, 'dialog-test', vi.fn());

      const trapCalls = vi.mocked(useFocusTrap).mock.calls;
      const lastCall = trapCalls[trapCalls.length - 1];
      const options = lastCall[1] as Record<string, unknown>;

      const initialFocusFn = options.initialFocus as () => string | HTMLElement | false;
      expect(initialFocusFn()).toBe(dummyElement);
      expect(rootElement.querySelector).toHaveBeenCalledWith('.my-input');
    });

    it('returns false for invalid string selector', () => {
      const rootElement = document.createElement('div');
      rootElement.querySelector = vi.fn().mockReturnValue(null);
      dialogRef.value = rootElement;

      const props = { initialFocus: '.non-existent' };
      useDialogState(isOpen, dialogRef, emit, props, 'dialog-test', vi.fn());

      const trapCalls = vi.mocked(useFocusTrap).mock.calls;
      const lastCall = trapCalls[trapCalls.length - 1];
      const options = lastCall[1] as Record<string, unknown>;

      const initialFocusFn = options.initialFocus as () => string | HTMLElement | false;
      expect(initialFocusFn()).toBe(false);
      expect(rootElement.querySelector).toHaveBeenCalledWith('.non-existent');
    });

    it('returns HTMLElement directly', () => {
      const dummyElement = document.createElement('button');
      const props = { initialFocus: dummyElement };
      useDialogState(isOpen, dialogRef, emit, props, 'dialog-test', vi.fn());

      const trapCalls = vi.mocked(useFocusTrap).mock.calls;
      const lastCall = trapCalls[trapCalls.length - 1];
      const options = lastCall[1] as Record<string, unknown>;

      const initialFocusFn = options.initialFocus as () => string | HTMLElement | false;
      expect(initialFocusFn()).toBe(dummyElement);
    });
  });
});
