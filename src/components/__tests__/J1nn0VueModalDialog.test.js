import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import J1nn0VueModalDialog from '../J1nn0VueModalDialog.vue';

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

describe('J1nn0VueModalDialog', () => {
  it('renders dialog when open', () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: true }
    });
    expect(wrapper.find('.dialog').exists()).toBe(true);
    expect(wrapper.find('.backdrop').exists()).toBe(true);
  });

  it('hides dialog when closed', () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: false }
    });
    expect(wrapper.find('.dialog').exists()).toBe(false);
  });

  it('validates backdrop prop', () => {
    const { validator } = J1nn0VueModalDialog.props.backdrop;
    expect(validator(true)).toBe(true);
    expect(validator('static')).toBe(true);
    expect(validator(false)).toBe(false);
  });

  it('closes on button click', async () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: true }
    });
    await wrapper.find('.dialog-close').trigger('click');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('renders slots', () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: true },
      slots: {
        header: 'Title',
        default: 'Body',
        footer: 'Footer'
      }
    });
    expect(wrapper.text()).toContain('Title');
    expect(wrapper.text()).toContain('Body');
    expect(wrapper.text()).toContain('Footer');
  });

  it('has ARIA attributes', () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: true }
    });
    const dialog = wrapper.find('.dialog');
    expect(dialog.attributes('role')).toBe('dialog');
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(dialog.attributes('aria-labelledby')).toBeTruthy();
  });

  it('emits events', async () => {
    const wrapper = mount(J1nn0VueModalDialog, {
      props: { modelValue: false }
    });
    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(wrapper.emitted('opened')).toBeTruthy();
  });
});