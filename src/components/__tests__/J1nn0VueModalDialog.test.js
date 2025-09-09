import * as vueUseCore from '@vueuse/core';

import { describe, expect, it, vi } from 'vitest';

import VueModalDialog from '../VueModalDialog.vue';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

vi.mock('@vueuse/core', () => ({
  onClickOutside: vi.fn(),
  onKeyStroke: vi.fn(),
}));

vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  })),
}));

describe('VueModalDialog', () => {
  it('renders dialog when open', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    expect(wrapper.find('.dialog').exists()).toBe(true);
    expect(wrapper.find('.backdrop').exists()).toBe(true);
  });

  it('hides dialog when closed', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: false },
    });
    expect(wrapper.find('.dialog').exists()).toBe(false);
  });

  it('validates backdrop prop', () => {
    const { validator } = VueModalDialog.props.backdrop;
    expect(validator(true)).toBe(true);
    expect(validator('static')).toBe(true);
    expect(validator(false)).toBe(false);
  });

  it('closes on button click', async () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    await wrapper.find('.dialog-close').trigger('click');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('renders slots', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
      slots: {
        header: 'Title',
        default: 'Body',
        footer: 'Footer',
      },
    });
    expect(wrapper.text()).toContain('Title');
    expect(wrapper.text()).toContain('Body');
    expect(wrapper.text()).toContain('Footer');
  });

  it('has ARIA attributes', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    const dialog = wrapper.find('.dialog');
    expect(dialog.attributes('role')).toBe('dialog');
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(dialog.attributes('aria-labelledby')).toBeTruthy();
  });

  it('emits events', async () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: false },
    });
    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(wrapper.emitted('opened')).toBeTruthy();
  });

  it('does not close when backdrop is static', () => {
    const mockCallback = vi.fn();
    vueUseCore.onClickOutside.mockImplementation((ref, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, backdrop: 'static' },
    });

    mockCallback();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('closes when backdrop is true', () => {
    const mockCallback = vi.fn();
    vueUseCore.onClickOutside.mockImplementation((ref, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, backdrop: true },
    });

    mockCallback();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('does not close when escape is disabled', () => {
    const mockCallback = vi.fn();
    vueUseCore.onKeyStroke.mockImplementation((key, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, escape: false },
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockCallback(mockEvent);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('closes when escape is enabled', () => {
    const mockCallback = vi.fn();
    vueUseCore.onKeyStroke.mockImplementation((key, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, escape: true },
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockCallback(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('emits closed event', async () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(wrapper.emitted('closed')).toBeTruthy();
  });

  it('does not trigger callback when dialog is closed - onClickOutside', () => {
    const mockCallback = vi.fn();
    vueUseCore.onClickOutside.mockImplementation((ref, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: false },
    });

    mockCallback();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not trigger callback when dialog is closed - onKeyStroke', () => {
    const mockCallback = vi.fn();
    vueUseCore.onKeyStroke.mockImplementation((key, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const wrapper = mount(VueModalDialog, {
      props: { modelValue: false },
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockCallback(mockEvent);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('applies correct width class based on prop', () => {
    const sizes = ['sm', 'md', 'lg', 'fullscreen'];

    sizes.forEach((size) => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: true, width: size },
      });
      const dialog = wrapper.find('.dialog');

      expect(dialog.classes()).toContain(`dialog-${size}`);
    });
  });

  it('defaults to md width when no prop is given', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    const dialog = wrapper.find('.dialog');
    expect(dialog.classes()).toContain('dialog-md');
  });

  it('does not render backdrop when fullscreen', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, width: 'fullscreen' },
    });
    expect(wrapper.find('.backdrop').exists()).toBe(false);
  });

  it('applies center position by default', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true },
    });
    const dialog = wrapper.find('.dialog');
    expect(dialog.classes()).toContain('is-center');
  });

  it('applies top position when set', () => {
    const wrapper = mount(VueModalDialog, {
      props: { modelValue: true, position: 'top' },
    });
    const dialog = wrapper.find('.dialog');
    expect(dialog.classes()).toContain('is-top');
  });
});
