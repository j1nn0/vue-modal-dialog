import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';

import { useDialogMode } from '../useDialogMode';

/**
 * Helper: mount a tiny component that calls the composable inside setup(),
 * so lifecycle hooks (onMounted / onUnmounted) are properly triggered.
 */
function mountWithComposable(props) {
  let result;
  const TestComponent = defineComponent({
    setup() {
      result = useDialogMode(props);
      return {};
    },
    template: '<div></div>',
  });
  const wrapper = mount(TestComponent, { attachTo: document.body });
  return { result, wrapper };
}

test('useDialogMode respects props.mode and updates', async () => {
  // props を ref でラップ
  const props = ref({ mode: 'dark' });
  const { effectiveMode, modeClass } = useDialogMode(props.value);

  // 初期値
  expect(effectiveMode.value).toBe('dark');
  expect(modeClass.value).toBe('mode-dark');

  // props.mode を変更
  props.value.mode = 'light';
  await nextTick(); // watch の反応を待つ
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');

  // props.mode を null に戻すとデフォルト light が反映
  props.value.mode = null;
  await nextTick();
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');
});

describe('useDialogMode – system preference', () => {
  let addListenerSpy;
  let removeListenerSpy;
  let mediaQueryMock;

  beforeEach(() => {
    addListenerSpy = vi.fn();
    removeListenerSpy = vi.fn();

    // Mock window.matchMedia
    mediaQueryMock = {
      matches: false, // default: light
      addEventListener: addListenerSpy,
      removeEventListener: removeListenerSpy,
    };

    vi.stubGlobal('matchMedia', vi.fn(() => mediaQueryMock));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to system preference when mode is null (light)', () => {
    mediaQueryMock.matches = false;
    const { effectiveMode, modeClass } = useDialogMode({ mode: null });
    expect(effectiveMode.value).toBe('light');
    expect(modeClass.value).toBe('mode-light');
  });

  it('falls back to system preference when mode is null (dark)', () => {
    mediaQueryMock.matches = true;
    const { effectiveMode, modeClass } = useDialogMode({ mode: null });
    expect(effectiveMode.value).toBe('dark');
    expect(modeClass.value).toBe('mode-dark');
  });

  it('registers a change listener on mount and removes it on unmount', async () => {
    const { wrapper } = mountWithComposable({ mode: null });
    await nextTick();

    expect(addListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    wrapper.unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates effectiveMode when system preference changes to dark', async () => {
    mediaQueryMock.matches = false;
    const { result, wrapper } = mountWithComposable({ mode: null });
    await nextTick();

    expect(result.effectiveMode.value).toBe('light');

    // Retrieve the registered listener and simulate an OS change
    const listener = addListenerSpy.mock.calls[0][1];
    listener({ matches: true });
    await nextTick();

    expect(result.effectiveMode.value).toBe('dark');
    wrapper.unmount();
  });

  it('does not update effectiveMode via system change when mode prop is set', async () => {
    mediaQueryMock.matches = false;
    const { result, wrapper } = mountWithComposable({ mode: 'light' });
    await nextTick();

    expect(result.effectiveMode.value).toBe('light');

    const listener = addListenerSpy.mock.calls[0][1];
    // OS switches to dark, but props.mode is 'light' so it should stay light
    listener({ matches: true });
    await nextTick();

    expect(result.effectiveMode.value).toBe('light');
    wrapper.unmount();
  });
});

