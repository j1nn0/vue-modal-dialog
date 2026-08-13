import { describe, it, expect, afterEach } from 'vitest';
import { ref, nextTick, effectScope, type EffectScope } from 'vue';
import { useDialogDrag } from '../useDialogDrag';

/** Run a composable inside a scope so `useEventListener` cleans up after each test. */
let scope: EffectScope | null = null;
function withScope<T>(fn: () => T): T {
  scope = effectScope();
  return scope.run(fn) as T;
}

/** Build an element whose bounding rect is fixed, so clamping is deterministic. */
function elementWithRect(rect: Partial<DOMRect>): HTMLElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 0, bottom: 0, ...rect }) as DOMRect;
  return el;
}

function down(clientX: number, clientY: number, button = 0): PointerEvent {
  return new PointerEvent('pointerdown', { clientX, clientY, button });
}

function move(clientX: number, clientY: number): void {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
}

afterEach(() => {
  scope?.stop();
  scope = null;
});

describe('useDialogDrag', () => {
  it('initializes with 0 offset', () => {
    const { offsetX, offsetY, isDragging, dragStyle } = withScope(() =>
      useDialogDrag(ref(true), ref(true)),
    );

    expect(offsetX.value).toBe(0);
    expect(offsetY.value).toBe(0);
    expect(isDragging.value).toBe(false);
    expect(dragStyle.value).toEqual({});
  });

  it('updates offset on pointermove when enabled', () => {
    const { onPointerDown, offsetX, offsetY, isDragging, dragStyle } = withScope(() =>
      useDialogDrag(ref(true), ref(true)),
    );

    onPointerDown(down(100, 100));
    expect(isDragging.value).toBe(true);

    move(150, 120);

    expect(offsetX.value).toBe(50);
    expect(offsetY.value).toBe(20);
    expect(dragStyle.value).toEqual({ translate: '50px 20px' });

    window.dispatchEvent(new PointerEvent('pointerup'));
    expect(isDragging.value).toBe(false);
  });

  it('uses the CSS translate property so the position transform survives', () => {
    const { onPointerDown, dragStyle } = withScope(() => useDialogDrag(ref(true), ref(true)));

    onPointerDown(down(0, 0));
    move(10, 10);

    // `transform` would replace `translate(-50%, -50%)` from the position class.
    expect(dragStyle.value).not.toHaveProperty('transform');
    expect(dragStyle.value).toEqual({ translate: '10px 10px' });
  });

  it('ignores pointermove after the pointer is released', () => {
    const { onPointerDown, offsetX } = withScope(() => useDialogDrag(ref(true), ref(true)));

    onPointerDown(down(0, 0));
    move(10, 10);
    window.dispatchEvent(new PointerEvent('pointerup'));
    move(500, 500);

    expect(offsetX.value).toBe(10);
  });

  it('stops dragging on pointercancel', () => {
    const { onPointerDown, isDragging, offsetX } = withScope(() =>
      useDialogDrag(ref(true), ref(true)),
    );

    onPointerDown(down(0, 0));
    move(10, 10);
    window.dispatchEvent(new PointerEvent('pointercancel'));

    expect(isDragging.value).toBe(false);
    move(500, 500);
    expect(offsetX.value).toBe(10);
  });

  it('does nothing on pointerdown when disabled', () => {
    const { onPointerDown, isDragging, offsetX } = withScope(() =>
      useDialogDrag(ref(true), ref(false)),
    );

    onPointerDown(down(100, 100));
    expect(isDragging.value).toBe(false);

    move(150, 120);
    expect(offsetX.value).toBe(0);
  });

  it('ignores non-primary pointer buttons', () => {
    const { onPointerDown, isDragging } = withScope(() => useDialogDrag(ref(true), ref(true)));

    onPointerDown(down(100, 100, 2));
    expect(isDragging.value).toBe(false);
  });

  it('resets offset when isOpen becomes false', async () => {
    const isOpen = ref(true);
    const { onPointerDown, offsetX, offsetY, dragStyle } = withScope(() =>
      useDialogDrag(isOpen, ref(true)),
    );

    onPointerDown(down(100, 100));
    move(150, 120);
    expect(dragStyle.value).toEqual({ translate: '50px 20px' });

    isOpen.value = false;
    await nextTick();

    expect(offsetX.value).toBe(0);
    expect(offsetY.value).toBe(0);
    expect(dragStyle.value).toEqual({});
  });

  it('returns empty style when disabled but has offset', () => {
    const enabled = ref(true);
    const { onPointerDown, dragStyle } = withScope(() => useDialogDrag(ref(true), enabled));

    onPointerDown(down(100, 100));
    move(150, 120);
    expect(dragStyle.value).toEqual({ translate: '50px 20px' });

    enabled.value = false;
    expect(dragStyle.value).toEqual({});
  });

  it('clamps the offset so the dialog cannot be dragged out of the viewport', () => {
    // 200x200 dialog centered in the 1024x768 jsdom viewport.
    const el = ref<HTMLElement | null>(
      elementWithRect({ left: 400, top: 300, right: 600, bottom: 500 }),
    );
    const { onPointerDown, offsetX, offsetY } = withScope(() =>
      useDialogDrag(ref(true), ref(true), el),
    );

    onPointerDown(down(0, 0));

    move(10000, 10000);
    expect(offsetX.value).toBe(1024 - 48 - 400); // 48px stays visible on the right
    expect(offsetY.value).toBe(768 - 48 - 300); // 48px stays visible at the bottom

    move(-10000, -10000);
    expect(offsetX.value).toBe(48 - 600); // 48px stays visible on the left
    expect(offsetY.value).toBe(-300); // header never rises above the viewport top
  });

  it('does not clamp when no element ref is supplied', () => {
    const { onPointerDown, offsetX } = withScope(() => useDialogDrag(ref(true), ref(true)));

    onPointerDown(down(0, 0));
    move(10000, 0);

    expect(offsetX.value).toBe(10000);
  });

  it('removes window listeners when the scope is disposed', () => {
    const { onPointerDown, offsetX } = withScope(() => useDialogDrag(ref(true), ref(true)));

    onPointerDown(down(0, 0));
    scope?.stop();

    move(500, 500);
    expect(offsetX.value).toBe(0);
  });
});
