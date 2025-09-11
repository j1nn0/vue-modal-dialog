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
    expect(emit).toHaveBeenCalledWith('opened');

    // 閉じる
    isOpen.value = false;
    await nextTick();
    await nextTick();

    expect(document.body.classList.contains('vue-modal-open')).toBeFalsy();
    expect(deactivateSpy).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith('closed');
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
    expect(emit).toHaveBeenCalledWith('closed');
  });
});
