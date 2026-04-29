import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useDialogState } from '../useDialogState';
import { useDialogStack } from '../useDialogStack';
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
    document.body.style.overflow = '';
    dialogState = useDialogState(isOpen, dialogRef, emit);
  });

  afterEach(() => {
    document.body.classList.remove('vue-modal-open');
  });

  it('activates focus trap and sets overflow when opened', async () => {
    // 開く
    isOpen.value = true;
    await nextTick();
    await nextTick(); // watch 内の非同期処理完了を待つ

    expect(document.body.classList.contains('vue-modal-open')).toBeTruthy();
    expect(activateSpy).toHaveBeenCalled();
    expect(emit).toBeCalledWith('opened');

    // 閉じる
    isOpen.value = false;
    await nextTick();
    await nextTick();

    expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();
    expect(deactivateSpy).toHaveBeenCalled();
    expect(emit).toBeCalledWith('closed');
  });

  it('close() sets isOpen to false and triggers closing logic', async () => {
    // 一度開く
    isOpen.value = true;
    await nextTick();
    await nextTick();

    // close() 呼ぶ
    dialogState.close();
    expect(isOpen.value).toBe(false);

    await nextTick();
    await nextTick();

    expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();
    expect(deactivateSpy).toHaveBeenCalled();
    expect(emit).toBeCalledWith('closed');
  });

  describe('modal prop', () => {
    it('does not activate focus trap or body class when modal=false in legacy path', async () => {
      const localIsOpen = ref(false);
      const props = { modal: false };
      useDialogState(localIsOpen, dialogRef, emit, props);
      
      localIsOpen.value = true;
      await nextTick();
      await nextTick();

      expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();
      expect(activateSpy).not.toHaveBeenCalled();
      expect(emit).toBeCalledWith('opened');
    });

    it('does not activate focus trap when modal=false in stack-aware path', async () => {
      const localIsOpen = ref(false);
      const props = { modal: false };
      useDialogState(localIsOpen, dialogRef, emit, props, 'dialog-test-1');
      
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
      useDialogState(isOpen, dialogRef, emit, props);

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
      useDialogState(isOpen, dialogRef, emit, props);

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
      useDialogState(isOpen, dialogRef, emit, props);

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
      useDialogState(isOpen, dialogRef, emit, props);

      const trapCalls = vi.mocked(useFocusTrap).mock.calls;
      const lastCall = trapCalls[trapCalls.length - 1];
      const options = lastCall[1] as Record<string, unknown>;

      const initialFocusFn = options.initialFocus as () => string | HTMLElement | false;
      expect(initialFocusFn()).toBe(dummyElement);
    });
  });
});
