import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { useModalStack } from '../useModalStack';

describe('useModalStack', () => {
  afterEach(() => {
    document.body.classList.remove('vue-modal-open');
  });

  it('adds vue-modal-open to body when first modal is pushed', () => {
    const { push, pop } = useModalStack();
    push();
    expect(document.body.classList.contains('vue-modal-open')).toBe(true);
    pop();
  });

  it('removes vue-modal-open from body when last modal is popped', () => {
    const { push, pop } = useModalStack();
    push();
    pop();
    expect(document.body.classList.contains('vue-modal-open')).toBe(false);
  });

  it('keeps vue-modal-open when at least one modal remains open', () => {
    const modal1 = useModalStack();
    const modal2 = useModalStack();

    modal1.push();
    modal2.push();

    modal2.pop();
    expect(document.body.classList.contains('vue-modal-open')).toBe(true);

    modal1.pop();
    expect(document.body.classList.contains('vue-modal-open')).toBe(false);
  });

  it('isTop is true only for the most recently pushed modal', async () => {
    const modal1 = useModalStack();
    const modal2 = useModalStack();

    modal1.push();
    await nextTick();
    expect(modal1.isTop.value).toBe(true);
    expect(modal2.isTop.value).toBe(false);

    modal2.push();
    await nextTick();
    expect(modal1.isTop.value).toBe(false);
    expect(modal2.isTop.value).toBe(true);

    modal2.pop();
    await nextTick();
    expect(modal1.isTop.value).toBe(true);
    expect(modal2.isTop.value).toBe(false);

    modal1.pop();
  });

  it('assigns higher z-indices to later modals', async () => {
    const modal1 = useModalStack();
    const modal2 = useModalStack();

    modal1.push();
    modal2.push();
    await nextTick();

    expect(modal2.backdropZIndex.value).toBeGreaterThan(modal1.dialogZIndex.value);
    expect(modal2.dialogZIndex.value).toBeGreaterThan(modal2.backdropZIndex.value);

    modal2.pop();
    modal1.pop();
  });

  it('backdrop z-index is lower than dialog z-index for the same modal', async () => {
    const { push, pop, backdropZIndex, dialogZIndex } = useModalStack();
    push();
    await nextTick();

    expect(dialogZIndex.value).toBeGreaterThan(backdropZIndex.value);

    pop();
  });

  it('extra pop calls are safe and do not corrupt stack state', () => {
    const { push, pop, backdropZIndex, dialogZIndex } = useModalStack();
    push();
    pop();
    // calling pop again should not throw
    expect(() => pop()).not.toThrow();
    expect(document.body.classList.contains('vue-modal-open')).toBe(false);

    // pushing again after extra pop should work as expected
    push();
    expect(document.body.classList.contains('vue-modal-open')).toBe(true);
    expect(backdropZIndex.value).toBeGreaterThanOrEqual(1000);
    expect(dialogZIndex.value).toBeGreaterThan(backdropZIndex.value);
    pop();
  });
});
