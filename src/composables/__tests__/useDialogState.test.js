import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useDialogState } from '../useDialogState';

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
  let dialogRef;
  let isOpen;
  let emit;
  let dialogState;

  beforeEach(() => {
    dialogRef = ref(null);
    isOpen = ref(false);
    emit = vi.fn();
    activateSpy.mockClear();
    deactivateSpy.mockClear();
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

  it('restores focus to the previously focused element on close', async () => {
    // Set up a focusable trigger element
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Open the dialog (captures previousActiveElement)
    isOpen.value = true;
    await nextTick();
    await nextTick();

    // Simulate focus moving inside the dialog by blurring the trigger
    trigger.blur();

    // Close the dialog
    isOpen.value = false;
    await nextTick();
    await nextTick();

    // Focus should be restored to the trigger
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });

  it('does not throw when there is no previously focused element on close', async () => {
    // Ensure no element is focused
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    isOpen.value = true;
    await nextTick();
    await nextTick();

    // Should not throw
    await expect(async () => {
      isOpen.value = false;
      await nextTick();
      await nextTick();
    }).not.toThrow();
  });
});
