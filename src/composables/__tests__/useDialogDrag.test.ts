import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useDialogDrag } from '../useDialogDrag';

describe('useDialogDrag', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  it('initializes with 0 offset', () => {
    const isOpen = ref(true);
    const enabled = ref(true);
    const { offsetX, offsetY, isDragging, dragStyle } = useDialogDrag(isOpen, enabled);

    expect(offsetX.value).toBe(0);
    expect(offsetY.value).toBe(0);
    expect(isDragging.value).toBe(false);
    expect(dragStyle.value).toEqual({});
  });

  it('updates offset on pointermove when enabled', () => {
    const isOpen = ref(true);
    const enabled = ref(true);
    const { onPointerDown, offsetX, offsetY, isDragging, dragStyle } = useDialogDrag(isOpen, enabled);

    onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }));
    expect(isDragging.value).toBe(true);

    const moveHandler = addEventListenerSpy.mock.calls.find((call: unknown[]) => call[0] === 'pointermove')[1];
    moveHandler(new PointerEvent('pointermove', { clientX: 150, clientY: 120 }));

    expect(offsetX.value).toBe(50);
    expect(offsetY.value).toBe(20);
    expect(dragStyle.value).toEqual({ transform: 'translate(50px, 20px)' });

    const upHandler = addEventListenerSpy.mock.calls.find((call: unknown[]) => call[0] === 'pointerup')[1];
    upHandler(new PointerEvent('pointerup'));

    expect(isDragging.value).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', moveHandler);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerup', upHandler);
  });

  it('does nothing on pointerdown when disabled', () => {
    const isOpen = ref(true);
    const enabled = ref(false);
    const { onPointerDown, isDragging } = useDialogDrag(isOpen, enabled);

    onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }));
    expect(isDragging.value).toBe(false);
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('resets offset when isOpen becomes false', async () => {
    const isOpen = ref(true);
    const enabled = ref(true);
    const { onPointerDown, offsetX, offsetY, dragStyle } = useDialogDrag(isOpen, enabled);

    onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }));
    const moveHandler = addEventListenerSpy.mock.calls.find((call: unknown[]) => call[0] === 'pointermove')[1];
    moveHandler(new PointerEvent('pointermove', { clientX: 150, clientY: 120 }));

    expect(offsetX.value).toBe(50);
    expect(offsetY.value).toBe(20);
    expect(dragStyle.value).toEqual({ transform: 'translate(50px, 20px)' });

    isOpen.value = false;
    await nextTick();

    expect(offsetX.value).toBe(0);
    expect(offsetY.value).toBe(0);
    expect(dragStyle.value).toEqual({});
  });

  it('returns empty style when disabled but has offset', () => {
    const isOpen = ref(true);
    const enabled = ref(true);
    const { onPointerDown, dragStyle } = useDialogDrag(isOpen, enabled);

    onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }));
    const moveHandler = addEventListenerSpy.mock.calls.find((call: unknown[]) => call[0] === 'pointermove')[1];
    moveHandler(new PointerEvent('pointermove', { clientX: 150, clientY: 120 }));

    expect(dragStyle.value).toEqual({ transform: 'translate(50px, 20px)' });

    enabled.value = false;
    expect(dragStyle.value).toEqual({});
  });
});
