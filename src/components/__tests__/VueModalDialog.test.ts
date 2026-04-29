import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import VueModalDialog from '../VueModalDialog.vue';
import { useDialogStack } from '@/composables/useDialogStack';

vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  })),
}));

async function openDialog(wrapper: VueWrapper): Promise<void> {
  await wrapper.setProps({ modelValue: true });
  await nextTick();
  await nextTick();
  await nextTick();
}

async function closeDialog(wrapper: VueWrapper): Promise<void> {
  await wrapper.setProps({ modelValue: false });
  await nextTick();
  await nextTick();
  await nextTick();
}

function createTeleportTarget(className = 'my-container'): HTMLDivElement {
  const target = document.createElement('div');
  target.className = className;
  document.body.appendChild(target);
  return target;
}

describe('VueModalDialog', () => {
  afterEach(() => {
    const stack = useDialogStack._getStack();
    stack.forEach((e) => useDialogStack.pop(e.id));
    document.body.classList.remove('vue-modal-open');
  });

  describe('rendering', () => {
    it('does not render when modelValue is false', () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('renders dialog structure when open', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
      expect(wrapper.find('.backdrop').exists()).toBe(true);
      expect(wrapper.find('.dialog-header').exists()).toBe(true);
      expect(wrapper.find('.dialog-body').exists()).toBe(true);
      expect(wrapper.find('.dialog-close').exists()).toBe(true);
    });

    it('does not render after closing', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);
      await closeDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('renders in-place when teleport is false', async () => {
      const container = document.createElement('div');

      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, teleport: false },
        attachTo: container,
      });
      await openDialog(wrapper);

      const dialog = container.querySelector('[role="dialog"]');

      expect(dialog).not.toBeNull();
      expect(container.contains(dialog)).toBe(true);
      expect(document.body.contains(dialog)).toBe(false);

      wrapper.unmount();
    });

    it('teleports to body when teleport is true', async () => {
      const container = document.createElement('div');

      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, teleport: true },
        attachTo: container,
      });
      await openDialog(wrapper);

      const dialog = document.body.querySelector('[role="dialog"]');

      expect(dialog).not.toBeNull();
      expect(document.body.contains(dialog)).toBe(true);
      expect(container.contains(dialog)).toBe(false);

      wrapper.unmount();
    });

    it('teleports to a custom selector target', async () => {
      const target = createTeleportTarget();
      const container = document.createElement('div');

      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, teleport: '.my-container' },
        attachTo: container,
      });
      await openDialog(wrapper);

      const dialog = target.querySelector('[role="dialog"]');

      expect(dialog).not.toBeNull();
      expect(target.contains(dialog)).toBe(true);
      expect(container.contains(dialog)).toBe(false);

      wrapper.unmount();
      target.remove();
    });
  });

  describe('slots', () => {
    it('renders header slot content', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
        slots: { header: '<span class="test-header">Title</span>' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.test-header').text()).toBe('Title');
    });

    it('renders default slot content', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
        slots: { default: '<p class="test-body">Body content</p>' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.test-body').text()).toBe('Body content');
    });

    it('renders footer slot when provided', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
        slots: { footer: '<button class="test-footer">OK</button>' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog-footer').exists()).toBe(true);
      expect(wrapper.find('.test-footer').text()).toBe('OK');
    });

    it('does not render footer when slot not provided', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog-footer').exists()).toBe(false);
    });
  });

  describe('ARIA attributes', () => {
    it('sets role, aria-modal, aria-hidden and aria-label', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-modal')).toBe('true');
      expect(dialog.attributes('aria-hidden')).toBe('false');
      expect(dialog.attributes('aria-labelledby')).toBeTruthy();
      expect(dialog.attributes('aria-describedby')).toBeTruthy();

      const closeBtn = wrapper.find('.dialog-close');
      expect(closeBtn.attributes('aria-label')).toBe('Close');
    });

    it('aria-labelledby points to header element', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      const labelledby = wrapper.find('[role="dialog"]').attributes('aria-labelledby');
      const header = wrapper.find('.dialog-header');
      expect(header.attributes('id')).toBe(labelledby);
    });

    it('aria-describedby points to body element', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      const describedby = wrapper.find('[role="dialog"]').attributes('aria-describedby');
      const body = wrapper.find('.dialog-body');
      expect(body.attributes('id')).toBe(describedby);
    });
  });

  describe('backdrop behavior', () => {
    it('renders backdrop when open', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(true);
    });

    it('clicking backdrop closes dialog', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('backdrop="static" does not close on click', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, backdrop: 'static' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(true);

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('backdrop=false still renders backdrop but does not close on click', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, backdrop: false },
      });
      await openDialog(wrapper);

      // backdrop still renders with backdrop=false
      expect(wrapper.find('.backdrop').exists()).toBe(true);

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();

      // clicking backdrop should NOT close when backdrop=false
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('escape key', () => {
    it('Escape key closes dialog', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('escape=false does not close on Escape', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, escape: false },
      });
      await openDialog(wrapper);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('close button', () => {
    it('clicking close button closes dialog', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });

  describe('position prop', () => {
    it('position="center" adds is-center class', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, position: 'center' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('is-center');
      expect(wrapper.find('.dialog').classes()).not.toContain('is-top');
    });

    it('position="top" adds is-top class', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, position: 'top' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('is-top');
      expect(wrapper.find('.dialog').classes()).not.toContain('is-center');
    });
  });

  describe('width prop', () => {
    it('applies preset width class and style', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, width: 'sm' },
      });
      await openDialog(wrapper);

      const dialog = wrapper.find('.dialog');
      expect(dialog.classes()).toContain('dialog-sm');
      expect(dialog.attributes('style')).toContain('max-width');
    });

    it('applies custom width style', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, width: '500px' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').attributes('style')).toContain('500px');
    });
  });

  describe('mode prop', () => {
    it('applies mode-light class', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, mode: 'light' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('mode-light');
    });

    it('applies mode-dark class', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, mode: 'dark' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('mode-dark');
    });
  });

  describe('fullscreen', () => {
    it('does not render backdrop', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, width: 'fullscreen' },
      });
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(false);
    });

    it('has fullscreen class and 100vw style', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, width: 'fullscreen' },
      });
      await openDialog(wrapper);

      const dialog = wrapper.find('.dialog');
      expect(dialog.classes()).toContain('dialog-fullscreen');
      expect(dialog.attributes('style')).toContain('100vw');
    });
  });

  describe('emits', () => {
    it('emits opened when dialog opens', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(wrapper.emitted('opened')).toBeTruthy();
    });

    it('emits closed when dialog closes', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);
      await closeDialog(wrapper);

      expect(wrapper.emitted('closed')).toBeTruthy();
    });
  });

  describe('z-index', () => {
    it('dialog has higher z-index than backdrop', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      const dialogStyle = wrapper.find('.dialog').attributes('style') || '';
      const backdropStyle = wrapper.find('.backdrop').attributes('style') || '';

      const dialogZ = parseInt((dialogStyle.match(/z-index:\s*(\d+)/) || [])[1] || '0', 10);
      const backdropZ = parseInt((backdropStyle.match(/z-index:\s*(\d+)/) || [])[1] || '0', 10);

      expect(dialogZ).toBeGreaterThan(backdropZ);
    });
  });

  describe('pointerdown fallback', () => {
    it('closes dialog on pointerdown outside dialog', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      document.dispatchEvent(new PointerEvent('pointerdown'));
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('does not close on pointerdown when backdrop=static', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, backdrop: 'static' },
      });
      await openDialog(wrapper);

      document.dispatchEvent(new PointerEvent('pointerdown'));
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('does not close on pointerdown when fullscreen', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false, width: 'fullscreen' },
      });
      await openDialog(wrapper);

      document.dispatchEvent(new PointerEvent('pointerdown'));
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('stack integration', () => {
    it('pushes to stack on open and pops on close', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(useDialogStack.count()).toBe(1);

      await closeDialog(wrapper);

      expect(useDialogStack.count()).toBe(0);
    });

    it('cleans up stack on unmount', async () => {
      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      expect(useDialogStack.count()).toBe(1);

      wrapper.unmount();

      expect(useDialogStack.count()).toBe(0);
    });

    it('handles multiple stacked dialogs', async () => {
      const wrapper1 = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      const wrapper2 = mount(VueModalDialog, {
        props: { modelValue: false },
      });

      await openDialog(wrapper1);
      expect(useDialogStack.count()).toBe(1);

      await openDialog(wrapper2);
      expect(useDialogStack.count()).toBe(2);
      expect(useDialogStack.topId()).not.toBeNull();

      await closeDialog(wrapper2);
      expect(useDialogStack.count()).toBe(1);

      wrapper1.unmount();
      wrapper2.unmount();
    });

    it('restores focus to previously active element on close', async () => {
      const button = document.createElement('button');
      button.textContent = 'trigger';
      document.body.appendChild(button);
      button.focus();

      expect(document.activeElement).toBe(button);

      const wrapper = mount(VueModalDialog, {
        props: { modelValue: false },
      });
      await openDialog(wrapper);

      // dialog should be open and activeElement now inside dialog
      expect(useDialogStack.count()).toBe(1);

      await closeDialog(wrapper);

      // focus should be restored to the button
      expect(document.activeElement).toBe(button);

      wrapper.unmount();
      document.body.removeChild(button);
    });
  });
});
