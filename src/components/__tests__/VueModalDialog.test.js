import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import VueModalDialog from '../VueModalDialog.vue';

// useFocusTrap をモック
const activateSpy = vi.fn();
const deactivateSpy = vi.fn();

vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: activateSpy,
    deactivate: deactivateSpy,
  })),
}));

const mountDialog = (props = {}, slots = {}) => {
  let w = mount(VueModalDialog, {
    props: {
      modelValue: false,
      'onUpdate:modelValue': (v) => w.setProps({ modelValue: v }),
      ...props,
    },
    slots,
    attachTo: document.body,
  });
  return w;
};

describe('VueModalDialog', () => {
  let wrapper;

  beforeEach(() => {
    activateSpy.mockClear();
    deactivateSpy.mockClear();
    document.body.classList.remove('vue-modal-open');
  });

  afterEach(() => {
    wrapper?.unmount();
    document.body.classList.remove('vue-modal-open');
  });

  describe('rendering', () => {
    it('does not render dialog when closed', () => {
      wrapper = mountDialog({ modelValue: false });
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('renders dialog when open', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('renders header slot content', async () => {
      wrapper = mountDialog({ modelValue: true }, { header: '<span>My Header</span>' });
      await nextTick();
      expect(wrapper.find('.dialog-header').text()).toContain('My Header');
    });

    it('renders default slot content', async () => {
      wrapper = mountDialog({ modelValue: true }, { default: '<p>Body content</p>' });
      await nextTick();
      expect(wrapper.find('.dialog-body').text()).toContain('Body content');
    });

    it('renders footer slot when provided', async () => {
      wrapper = mountDialog({ modelValue: true }, { footer: '<button>OK</button>' });
      await nextTick();
      expect(wrapper.find('.dialog-footer').exists()).toBe(true);
      expect(wrapper.find('.dialog-footer').text()).toContain('OK');
    });

    it('does not render footer when slot is empty', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      expect(wrapper.find('.dialog-footer').exists()).toBe(false);
    });

    it('does not render backdrop for fullscreen width', async () => {
      wrapper = mountDialog({ modelValue: true, width: 'fullscreen' });
      await nextTick();
      expect(wrapper.find('.backdrop').exists()).toBe(false);
    });

    it('renders backdrop with aria-hidden for non-fullscreen', async () => {
      wrapper = mountDialog({ modelValue: true, width: 'md' });
      await nextTick();
      const backdrop = wrapper.find('.backdrop');
      expect(backdrop.exists()).toBe(true);
      expect(backdrop.attributes('aria-hidden')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('has role="dialog" and aria-modal="true"', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('role')).toBe('dialog');
      expect(dialog.attributes('aria-modal')).toBe('true');
    });

    it('dialog is labelled and described by valid IDs', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      const dialog = wrapper.find('[role="dialog"]');
      const labelledby = dialog.attributes('aria-labelledby');
      const describedby = dialog.attributes('aria-describedby');
      expect(labelledby).toBeTruthy();
      expect(describedby).toBeTruthy();
      expect(wrapper.find(`#${labelledby}`).exists()).toBe(true);
      expect(wrapper.find(`#${describedby}`).exists()).toBe(true);
    });

    it('close button has aria-label="Close"', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      const closeBtn = wrapper.find('.dialog-close');
      expect(closeBtn.attributes('aria-label')).toBe('Close');
    });
  });

  describe('position prop', () => {
    it('applies is-center class by default', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      expect(wrapper.find('.dialog').classes()).toContain('is-center');
    });

    it('applies is-top class when position="top"', async () => {
      wrapper = mountDialog({ modelValue: true, position: 'top' });
      await nextTick();
      expect(wrapper.find('.dialog').classes()).toContain('is-top');
    });
  });

  describe('width prop', () => {
    it('applies dialog-sm class for width="sm"', async () => {
      wrapper = mountDialog({ modelValue: true, width: 'sm' });
      await nextTick();
      expect(wrapper.find('.dialog').classes()).toContain('dialog-sm');
    });

    it('applies dialog-lg class for width="lg"', async () => {
      wrapper = mountDialog({ modelValue: true, width: 'lg' });
      await nextTick();
      expect(wrapper.find('.dialog').classes()).toContain('dialog-lg');
    });

    it('applies custom maxWidth style for custom width', async () => {
      wrapper = mountDialog({ modelValue: true, width: '400px' });
      await nextTick();
      expect(wrapper.find('.dialog').attributes('style')).toContain('400px');
    });
  });

  describe('close button', () => {
    it('emits update:modelValue false when close button is clicked', async () => {
      wrapper = mountDialog({ modelValue: true });
      await nextTick();
      await wrapper.find('.dialog-close').trigger('click');
      await nextTick();
      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted[0]).toEqual([false]);
    });
  });

  describe('Escape key', () => {
    it('closes dialog on Escape when escape=true', async () => {
      wrapper = mountDialog({ modelValue: true, escape: true });
      await nextTick();
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);
      await nextTick();
      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted?.[0]).toEqual([false]);
    });

    it('does not close dialog on Escape when escape=false', async () => {
      wrapper = mountDialog({ modelValue: true, escape: false });
      await nextTick();
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('emits', () => {
    it('emits "opened" when dialog becomes visible', async () => {
      wrapper = mountDialog({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      await flushPromises();
      expect(wrapper.emitted('opened')).toHaveLength(1);
    });

    it('emits "closed" after closing', async () => {
      wrapper = mountDialog({ modelValue: true });
      await flushPromises();
      await wrapper.find('.dialog-close').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('closed')).toHaveLength(1);
    });
  });

  describe('body class', () => {
    it('adds vue-modal-open to body when open', async () => {
      wrapper = mountDialog({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      await flushPromises();
      expect(document.body.classList.contains('vue-modal-open')).toBe(true);
    });

    it('removes vue-modal-open from body when closed', async () => {
      wrapper = mountDialog({ modelValue: true });
      await flushPromises();
      await wrapper.find('.dialog-close').trigger('click');
      await flushPromises();
      expect(document.body.classList.contains('vue-modal-open')).toBe(false);
    });
  });
});
