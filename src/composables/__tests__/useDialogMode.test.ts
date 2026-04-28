import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';

import { useDialogMode } from '../useDialogMode';

test('useDialogMode respects props.mode and updates', async () => {
  const props = ref<{ mode: 'light' | 'dark' | null }>({ mode: 'dark' });
  const { effectiveMode, modeClass } = useDialogMode(props.value);

  expect(effectiveMode.value).toBe('dark');
  expect(modeClass.value).toBe('mode-dark');

  props.value.mode = 'light';
  await nextTick();
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');

  props.value.mode = null;
  await nextTick();
  expect(effectiveMode.value).toBe('light');
  expect(modeClass.value).toBe('mode-light');
});

const TestComponent = defineComponent({
  props: {
    mode: {
      type: String as () => 'light' | 'dark' | null,
      default: null,
    },
  },
  setup(props) {
    return useDialogMode(props);
  },
  template: '<div :class="modeClass">{{ effectiveMode }}</div>',
});

describe('useDialogMode lifecycle', () => {
  let matchMediaFn: ReturnType<typeof vi.fn>;
  let mmObj: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mmObj = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    matchMediaFn = vi.fn().mockReturnValue(mmObj);
    window.matchMedia = matchMediaFn as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reacts to system color scheme changes when mode is null', async () => {
    const wrapper = mount(TestComponent, {
      props: { mode: null },
    });

    expect(wrapper.find('div').classes()).toContain('mode-light');
    expect(matchMediaFn).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mmObj.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    const handler = mmObj.addEventListener.mock.calls[0]![1] as (e: { matches: boolean }) => void;

    handler({ matches: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('div').classes()).toContain('mode-dark');

    handler({ matches: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('div').classes()).toContain('mode-light');
  });

  it('does not react to system changes when mode is explicit', async () => {
    const wrapper = mount(TestComponent, {
      props: { mode: 'dark' },
    });

    expect(wrapper.find('div').classes()).toContain('mode-dark');

    const handler = mmObj.addEventListener.mock.calls[0]![1] as (e: { matches: boolean }) => void;

    handler({ matches: false });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('div').classes()).toContain('mode-dark');
  });

  it('removes listener on unmount', async () => {
    const wrapper = mount(TestComponent, {
      props: { mode: null },
    });

    expect(mmObj.addEventListener).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(mmObj.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
