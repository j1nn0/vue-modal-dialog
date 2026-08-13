import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import VueModalDialog from '@/components/VueModalDialog.vue';
import { mountDialog, clearDialogStack } from '@/test-utils';
import { useDialogStack } from '@/composables/useDialogStack';

const useFocusTrapMock = vi.hoisted(() => ({
  useFocusTrap: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn() })),
}));
vi.mock('@vueuse/integrations/useFocusTrap', () => useFocusTrapMock);

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
    clearDialogStack();
    document.body.classList.remove('vue-modal-open');
  });

  describe('rendering', () => {
    it('does not render when modelValue is false', () => {
      const wrapper = mountDialog();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('renders dialog structure when open', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
      expect(wrapper.find('.backdrop').exists()).toBe(true);
      expect(wrapper.find('.dialog-header').exists()).toBe(true);
      expect(wrapper.find('.dialog-body').exists()).toBe(true);
      expect(wrapper.find('.dialog-close').exists()).toBe(true);
    });

    it('does not render after closing', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);
      await closeDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('supports an initially open dialog through stack and lifecycle setup', async () => {
      let dialogInDomWhenBeforeOpen = false;
      const wrapper = mountDialog(
        {
          modelValue: true,
          onBeforeOpen: () => {
            dialogInDomWhenBeforeOpen = document.querySelector('[role="dialog"]') !== null;
          },
        },
        { attachTo: document.body },
      );
      await nextTick();
      await nextTick();

      const dialog = wrapper.find('[role="dialog"]');
      expect(useDialogStack.count()).toBe(1);
      expect(document.body.classList.contains('vue-modal-open')).toBe(true);
      expect(wrapper.find('.backdrop').exists()).toBe(true);
      expect(dialog.attributes('aria-modal')).toBe('true');
      expect(dialog.attributes('aria-hidden')).toBe('false');
      expect(dialogInDomWhenBeforeOpen).toBe(true);
      expect(wrapper.emitted('before-open')).toHaveLength(1);
      expect(wrapper.emitted('opening')).toHaveLength(1);
      expect(wrapper.emitted('opened')).toHaveLength(1);

      wrapper.unmount();
      expect(useDialogStack.count()).toBe(0);
      expect(document.body.classList.contains('vue-modal-open')).toBe(false);
    });

    it('cleans up focus trap when an initially open dialog is unmounted', async () => {
      const wrapper = mountDialog({ modelValue: true });
      await nextTick();
      await nextTick();

      const focusTrap = useFocusTrapMock.useFocusTrap.mock.results.at(-1)?.value as {
        deactivate: ReturnType<typeof vi.fn>;
      };
      expect(focusTrap.deactivate).not.toHaveBeenCalled();

      wrapper.unmount();

      expect(focusTrap.deactivate).toHaveBeenCalled();
      expect(useDialogStack.count()).toBe(0);
    });

    it('stacks multiple initially open dialogs with one active modal', async () => {
      const first = mountDialog({ modelValue: true });
      const second = mountDialog({ modelValue: true });
      await nextTick();
      await nextTick();

      expect(useDialogStack.count()).toBe(2);
      expect(first.find('[role="dialog"]').attributes('aria-hidden')).toBe('true');
      expect(second.find('[role="dialog"]').attributes('aria-modal')).toBe('true');
      expect(second.find('[role="dialog"]').attributes('aria-hidden')).toBe('false');
      expect(first.find('.backdrop').exists()).toBe(false);
      expect(second.find('.backdrop').exists()).toBe(true);

      const [firstTrap, secondTrap] = useFocusTrapMock.useFocusTrap.mock.results.slice(-2).map(
        (result) =>
          result.value as {
            activate: ReturnType<typeof vi.fn>;
            deactivate: ReturnType<typeof vi.fn>;
          },
      );
      expect(firstTrap.deactivate).toHaveBeenCalled();
      expect(secondTrap.activate).toHaveBeenCalled();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      await nextTick();

      expect(first.emitted('update:modelValue')).toBeFalsy();
      expect(second.emitted('update:modelValue')?.[0]).toEqual([false]);

      first.unmount();
      second.unmount();
    });

    it('renders in-place when teleport is false', async () => {
      const container = document.createElement('div');

      const wrapper = mountDialog({ teleport: false }, { attachTo: container });
      await openDialog(wrapper);

      const dialog = container.querySelector('[role="dialog"]');

      expect(dialog).not.toBeNull();
      expect(container.contains(dialog)).toBe(true);
      expect(document.body.contains(dialog)).toBe(false);

      wrapper.unmount();
    });

    it('teleports to body when teleport is true', async () => {
      const container = document.createElement('div');

      const wrapper = mountDialog({ teleport: true }, { attachTo: container });
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

      const wrapper = mountDialog({ teleport: '.my-container' }, { attachTo: container });
      await openDialog(wrapper);

      const dialog = target.querySelector('[role="dialog"]');

      expect(dialog).not.toBeNull();
      expect(target.contains(dialog)).toBe(true);
      expect(container.contains(dialog)).toBe(false);

      wrapper.unmount();
      target.remove();
    });
  });

  describe('scrollLock prop', () => {
    it('updates the stack entry and body class while open', async () => {
      const wrapper = mountDialog({ scrollLock: true });
      await openDialog(wrapper);

      expect(useDialogStack._getStack()[0]?.scrollLock).toBe(true);
      expect(document.body.classList.contains('vue-modal-open')).toBe(true);

      await wrapper.setProps({ scrollLock: false });
      await nextTick();

      expect(useDialogStack._getStack()[0]?.scrollLock).toBe(false);
      expect(document.body.classList.contains('vue-modal-open')).toBe(false);

      await wrapper.setProps({ scrollLock: true });
      await nextTick();

      expect(useDialogStack._getStack()[0]?.scrollLock).toBe(true);
      expect(document.body.classList.contains('vue-modal-open')).toBe(true);
    });
  });

  describe('transition props', () => {
    it('uses the default transition names', () => {
      const wrapper = mountDialog();

      const props = wrapper.props() as Record<string, unknown>;
      expect(props.transition).toBe('fade');
      expect(props.backdropTransition).toBe('fade-backdrop');
    });

    it('passes a custom transition name to the dialog transition', async () => {
      const wrapper = mountDialog({ transition: 'slide' });
      await openDialog(wrapper);

      const names = wrapper.findAll('transition-stub').map((node) => node.attributes('name'));

      expect(names).toContain('slide');
    });

    it('passes a custom backdrop transition name to the backdrop transition', async () => {
      const wrapper = mountDialog({ backdropTransition: 'my-backdrop' });
      await openDialog(wrapper);

      const names = wrapper.findAll('transition-stub').map((node) => node.attributes('name'));

      expect(names).toContain('my-backdrop');
    });
  });

  describe('slots', () => {
    it('renders header slot content', async () => {
      const wrapper = mountDialog(
        {},
        {
          slots: { header: '<span class="test-header">Title</span>' },
        },
      );
      await openDialog(wrapper);

      expect(wrapper.find('.test-header').text()).toBe('Title');
    });

    it('renders default slot content', async () => {
      const wrapper = mountDialog(
        {},
        {
          slots: { default: '<p class="test-body">Body content</p>' },
        },
      );
      await openDialog(wrapper);

      expect(wrapper.find('.test-body').text()).toBe('Body content');
    });

    it('renders footer slot when provided', async () => {
      const wrapper = mountDialog(
        {},
        {
          slots: { footer: '<button class="test-footer">OK</button>' },
        },
      );
      await openDialog(wrapper);

      expect(wrapper.find('.dialog-footer').exists()).toBe(true);
      expect(wrapper.find('.test-footer').text()).toBe('OK');
    });

    it('does not render footer when slot not provided', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(wrapper.find('.dialog-footer').exists()).toBe(false);
    });
  });

  describe('ARIA attributes', () => {
    it('labels the dialog with the title element, excluding the close button', async () => {
      const wrapper = mountDialog(
        {},
        {
          slots: { header: '<span class="test-header">Title</span>' },
        },
      );
      await openDialog(wrapper);

      const dialog = wrapper.find('[role="dialog"]');
      const title = wrapper.find('.dialog-title');
      const labelledby = dialog.attributes('aria-labelledby');

      expect(labelledby).toBeTruthy();
      expect(title.attributes('id')).toBe(labelledby);
      expect(title.text()).toBe('Title');
      expect(title.find('.dialog-close').exists()).toBe(false);
    });

    it('does not emit aria-labelledby without a header slot', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const wrapper = mountDialog({}, { attrs: { 'aria-label': 'Unnamed dialog' } });
      await openDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').attributes('aria-labelledby')).toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalledWith(
        '[Vue warn]: [VueModalDialog] dialog has no accessible name: provide a header slot or aria-label.',
      );
      warnSpy.mockRestore();
    });

    it('warns when the dialog has no accessible name', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(warnSpy.mock.calls[0]?.[0]).toBe(
        '[Vue warn]: [VueModalDialog] dialog has no accessible name: provide a header slot or aria-label.',
      );
      warnSpy.mockRestore();
    });

    it('does not emit aria-describedby by default', async () => {
      const wrapper = mountDialog({}, { attrs: { 'aria-label': 'Dialog' } });
      await openDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').attributes('aria-describedby')).toBeUndefined();
    });

    it('passes consumer ARIA attributes through to the dialog', async () => {
      const wrapper = mountDialog(
        {},
        {
          attrs: {
            'aria-label': 'Settings',
            'aria-describedby': 'settings-description',
          },
        },
      );
      await openDialog(wrapper);

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-label')).toBe('Settings');
      expect(dialog.attributes('aria-describedby')).toBe('settings-description');
    });

    it('uses the configured close button label', async () => {
      const defaultWrapper = mountDialog({}, { attrs: { 'aria-label': 'Dialog' } });
      await openDialog(defaultWrapper);
      expect(defaultWrapper.find('.dialog-close').attributes('aria-label')).toBe('Close');
      expect(defaultWrapper.find('.dialog-close').attributes('type')).toBe('button');

      const wrapper = mountDialog({ closeLabel: 'Dismiss' }, { attrs: { 'aria-label': 'Dialog' } });
      await openDialog(wrapper);
      expect(wrapper.find('.dialog-close').attributes('aria-label')).toBe('Dismiss');
    });

    it('does not render the non-semantic open attribute', async () => {
      const wrapper = mountDialog({}, { attrs: { 'aria-label': 'Dialog' } });
      await openDialog(wrapper);

      expect(wrapper.find('[role="dialog"]').attributes('open')).toBeUndefined();
    });

    it('generates unique non-empty title ids for mounted dialogs', async () => {
      const firstOpen = ref(false);
      const secondOpen = ref(false);
      const wrapper = mount(
        defineComponent({
          setup() {
            return () =>
              h('div', [
                h(
                  VueModalDialog,
                  {
                    modelValue: firstOpen.value,
                    'onUpdate:modelValue': (value: boolean) => (firstOpen.value = value),
                  },
                  { header: () => h('span', 'First') },
                ),
                h(
                  VueModalDialog,
                  {
                    modelValue: secondOpen.value,
                    'onUpdate:modelValue': (value: boolean) => (secondOpen.value = value),
                  },
                  { header: () => h('span', 'Second') },
                ),
              ]);
          },
        }),
      );
      firstOpen.value = true;
      secondOpen.value = true;
      await nextTick();
      await nextTick();
      await nextTick();

      const titleIds = wrapper.findAll('.dialog-title').map((title) => title.attributes('id'));

      expect(titleIds).toHaveLength(2);
      const stackIds = useDialogStack._getStack().map((entry) => entry.id);

      expect(titleIds[0]).toBeTruthy();
      expect(titleIds[1]).toBeTruthy();
      expect(titleIds[0]).not.toBe(titleIds[1]);
      expect(stackIds).toHaveLength(2);
      expect(stackIds[0]).toBeTruthy();
      expect(stackIds[1]).toBeTruthy();
      expect(stackIds[0]).not.toBe(stackIds[1]);
    });
  });

  describe('backdrop behavior', () => {
    it('renders backdrop when open', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(true);
    });

    it('clicking backdrop closes dialog', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('backdrop="static" does not close on click', async () => {
      const wrapper = mountDialog({ backdrop: 'static' });
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(true);

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('closes an initially open dialog from its backdrop', async () => {
      const wrapper = mountDialog({ modelValue: true });
      await nextTick();
      await nextTick();

      await wrapper.find('.backdrop').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });

  describe('escape key', () => {
    it('Escape key closes dialog', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('escape=false does not close on Escape', async () => {
      const wrapper = mountDialog({ escape: false });
      await openDialog(wrapper);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('closes an initially open dialog from Escape', async () => {
      const wrapper = mountDialog({ modelValue: true });
      await nextTick();
      await nextTick();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });

  describe('close button', () => {
    it('clicking close button closes dialog', async () => {
      const wrapper = mountDialog();
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
      const wrapper = mountDialog({ position: 'center' });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('is-center');
      expect(wrapper.find('.dialog').classes()).not.toContain('is-top');
    });

    it('position="top" adds is-top class', async () => {
      const wrapper = mountDialog({ position: 'top' });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('is-top');
      expect(wrapper.find('.dialog').classes()).not.toContain('is-center');
    });
  });

  describe('width prop', () => {
    it('applies preset width class and style', async () => {
      const wrapper = mountDialog({ width: 'sm' });
      await openDialog(wrapper);

      const dialog = wrapper.find('.dialog');
      expect(dialog.classes()).toContain('dialog-sm');
      expect(dialog.attributes('style')).toContain('max-width');
    });

    it('applies custom width style', async () => {
      const wrapper = mountDialog({ width: '500px' });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').attributes('style')).toContain('500px');
    });
  });

  describe('mode prop', () => {
    it('applies mode-light class', async () => {
      const wrapper = mountDialog({ mode: 'light' });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('mode-light');
    });

    it('applies mode-dark class', async () => {
      const wrapper = mountDialog({ mode: 'dark' });
      await openDialog(wrapper);

      expect(wrapper.find('.dialog').classes()).toContain('mode-dark');
    });
  });

  describe('fullscreen', () => {
    it('does not render backdrop', async () => {
      const wrapper = mountDialog({ width: 'fullscreen' });
      await openDialog(wrapper);

      expect(wrapper.find('.backdrop').exists()).toBe(false);
    });

    it('has fullscreen class and 100vw style', async () => {
      const wrapper = mountDialog({ width: 'fullscreen' });
      await openDialog(wrapper);

      const dialog = wrapper.find('.dialog');
      expect(dialog.classes()).toContain('dialog-fullscreen');
      expect(dialog.attributes('style')).toContain('100vw');
    });
  });

  describe('emits', () => {
    it('emits opened when dialog opens', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(wrapper.emitted('opened')).toBeTruthy();
    });

    it('emits closed when dialog closes', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);
      await closeDialog(wrapper);

      expect(wrapper.emitted('closed')).toBeTruthy();
    });
  });

  describe('z-index', () => {
    it('dialog has higher z-index than backdrop', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      const dialogStyle = wrapper.find('.dialog').attributes('style') || '';
      const backdropStyle = wrapper.find('.backdrop').attributes('style') || '';

      const dialogZ = parseInt((dialogStyle.match(/z-index:\s*(\d+)/) || [])[1] || '0', 10);
      const backdropZ = parseInt((backdropStyle.match(/z-index:\s*(\d+)/) || [])[1] || '0', 10);

      expect(dialogZ).toBeGreaterThan(backdropZ);
    });
  });

  describe('outside click behavior', () => {
    it('does not close when pointerdown starts on backdrop and release occurs inside dialog', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      wrapper
        .find('.backdrop')
        .element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      wrapper
        .find('.dialog')
        .element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('does not close when clicking an outside element that is not the backdrop', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      const outside = document.createElement('div');
      document.body.appendChild(outside);

      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();

      outside.remove();
    });
  });

  describe('stack integration', () => {
    it('pushes to stack on open and pops on close', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(useDialogStack.count()).toBe(1);

      await closeDialog(wrapper);

      expect(useDialogStack.count()).toBe(0);
    });

    it('cleans up stack on unmount', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      expect(useDialogStack.count()).toBe(1);

      wrapper.unmount();

      expect(useDialogStack.count()).toBe(0);
    });

    it('handles multiple stacked dialogs', async () => {
      const wrapper1 = mountDialog();
      const wrapper2 = mountDialog();

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

      const wrapper = mountDialog();
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

  describe('lifecycle emits', () => {
    it('emits open events in order', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      const events = Object.keys(wrapper.emitted()).filter((event) =>
        ['before-open', 'opening', 'opened'].includes(event),
      );

      expect(events).toEqual(['before-open', 'opening', 'opened']);
    });

    it('emits opened after the dialog is present in the DOM', async () => {
      // Recorded rather than asserted inline: an assertion thrown inside an emit
      // handler is swallowed by Vue's error handling and would not fail the test.
      let dialogInDomWhenOpened: boolean | null = null;
      const onOpened = vi.fn(() => {
        dialogInDomWhenOpened = document.body.querySelector('[role="dialog"]') !== null;
      });
      const wrapper = mountDialog({ onOpened }, { attachTo: document.body });

      await openDialog(wrapper);

      expect(onOpened).toHaveBeenCalledOnce();
      expect(dialogInDomWhenOpened).toBe(true);
      wrapper.unmount();
    });

    it('emits close events in order', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await closeDialog(wrapper);

      const events = Object.keys(wrapper.emitted()).filter((event) =>
        ['before-close', 'closing', 'closed'].includes(event),
      );

      expect(events).toEqual(['before-close', 'closing', 'closed']);
    });

    it('emits before-close BEFORE evaluating beforeClose prop, and skips closing if prevented', async () => {
      const beforeCloseMock = vi.fn(() => false);
      const wrapper = mountDialog({ beforeClose: beforeCloseMock });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('before-close')).toBeTruthy();
      expect(beforeCloseMock).toHaveBeenCalled();
      expect(wrapper.emitted('closing')).toBeFalsy();
    });
  });
  describe('role prop', () => {
    it('sets role to dialog by default', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
    });

    it('sets role to alertdialog when specified', async () => {
      const wrapper = mountDialog({ role: 'alertdialog' });
      await openDialog(wrapper);

      const dialog = wrapper.find('[role="alertdialog"]');
      expect(dialog.exists()).toBe(true);
    });

    it('defaults backdrop to static when role is alertdialog', async () => {
      const wrapper = mountDialog({ role: 'alertdialog' });
      await openDialog(wrapper);

      const backdrop = wrapper.find('.backdrop');
      await backdrop.trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('beforeClose prop', () => {
    it('prevents closing when returning false', async () => {
      const beforeClose = vi.fn(() => false);
      const wrapper = mountDialog({ beforeClose });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await nextTick();

      expect(beforeClose).toHaveBeenCalled();
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('allows closing when returning true', async () => {
      const beforeClose = vi.fn(() => true);
      const wrapper = mountDialog({ beforeClose });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await nextTick();
      await nextTick();
      await nextTick();

      expect(beforeClose).toHaveBeenCalled();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('prevents closing when returning Promise<false>', async () => {
      const beforeClose = vi.fn(() => Promise.resolve(false));
      const wrapper = mountDialog({ beforeClose });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await nextTick();

      expect(beforeClose).toHaveBeenCalled();
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('allows closing when returning Promise<true>', async () => {
      const beforeClose = vi.fn(() => Promise.resolve(true));
      const wrapper = mountDialog({ beforeClose });
      await openDialog(wrapper);

      await wrapper.find('.dialog-close').trigger('click');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await nextTick();

      expect(beforeClose).toHaveBeenCalled();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('requestClose() exposed method triggers close when no beforeClose', async () => {
      const wrapper = mountDialog();
      await openDialog(wrapper);

      await (wrapper.vm as unknown as { requestClose: () => Promise<void> }).requestClose();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
  });
});
