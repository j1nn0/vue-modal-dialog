import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { useDialog } from '@/composables/useDialog';
import { useDialogStack } from '@/composables/useDialogStack';

const useFocusTrapMock = vi.hoisted(() => ({
  useFocusTrap: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn() })),
}));
vi.mock('@vueuse/integrations/useFocusTrap', () => useFocusTrapMock);

async function finishTransition(): Promise<void> {
  await nextTick();
  await nextTick();
}

describe('useDialog', () => {
  beforeEach(() => {
    while (document.body.firstChild) document.body.firstChild.remove();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('open() mounts a dialog into document.body and sets isOpen', async () => {
    const dialog = useDialog();

    const promise = dialog.open();
    await nextTick();

    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    expect(dialog.isOpen.value).toBe(true);

    dialog.close();
    await finishTransition();
    await promise;
  });

  it('closes and cleans up when close() is called before the first render', async () => {
    const dialog = useDialog();
    const promise = dialog.open();

    dialog.close();
    await finishTransition();

    await expect(promise).resolves.toBeUndefined();
    expect(dialog.isOpen.value).toBe(false);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  });

  it('replaces an instance immediately and leaves the second instance closable', async () => {
    const dialog = useDialog();
    const first = dialog.open({ width: 'sm' });
    const firstContainer = document.body.lastElementChild;
    const second = dialog.open({ width: 'lg' });

    await finishTransition();

    await expect(first).resolves.toBeUndefined();
    expect(firstContainer?.isConnected).toBe(false);
    expect(document.body.querySelector('.dialog-lg')).not.toBeNull();

    dialog.close();
    await finishTransition();
    await expect(second).resolves.toBeUndefined();
  });

  it('renders string and render-function content', async () => {
    const dialog = useDialog();

    const stringContent = dialog.open({ header: 'Dialog title', content: 'Plain content' });
    await nextTick();

    expect(document.querySelector('.dialog-title')?.textContent).toContain('Dialog title');
    expect(document.querySelector('.dialog-body')?.textContent).toContain('Plain content');

    dialog.close();
    await finishTransition();
    await stringContent;

    const renderContent = dialog.open({
      content: () => h('p', { class: 'rendered-content' }, 'Rendered content'),
    });
    await nextTick();

    expect(document.querySelector('.dialog-body')?.textContent).toContain('Rendered content');

    dialog.close();
    await finishTransition();
    await renderContent;
  });

  it('renders a footer only when the footer option is supplied', async () => {
    const dialog = useDialog();
    const withFooter = dialog.open({ footer: () => h('button', 'OK') });
    await nextTick();

    expect(document.querySelector('.dialog-footer')).not.toBeNull();
    dialog.close();
    await finishTransition();
    await withFooter;

    const withoutFooter = dialog.open();
    await nextTick();

    expect(document.querySelector('.dialog-footer')).toBeNull();
    dialog.close();
    await finishTransition();
    await withoutFooter;
  });

  it('resolves open() with the value passed to close()', async () => {
    const dialog = useDialog();
    const promise = dialog.open<number>();
    await nextTick();

    dialog.close(42);
    await finishTransition();

    await expect(promise).resolves.toBe(42);
  });

  it('resolves dismissal through the close button with undefined', async () => {
    const dialog = useDialog();
    const promise = dialog.open();
    await nextTick();

    document.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    await nextTick();
    await finishTransition();

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves the first promise when open() replaces the instance', async () => {
    const dialog = useDialog();
    const first = dialog.open({ width: 'sm' });
    let firstResolved = false;
    void first.then(() => {
      firstResolved = true;
    });
    await nextTick();

    const second = dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.querySelector('.dialog-sm')).not.toBeNull();
    expect(document.body.querySelector('.dialog-lg')).not.toBeNull();

    const firstContainer = document.body.querySelector('.dialog-sm')?.parentElement;
    firstContainer
      ?.querySelector('.dialog-content')
      ?.dispatchEvent(new Event('transitionend', { bubbles: true }));
    await nextTick();
    expect(firstResolved).toBe(false);

    await finishTransition();
    await expect(first).resolves.toBeUndefined();
    expect(document.body.querySelector('.dialog-sm')).toBeNull();

    dialog.close();
    await finishTransition();
    await second;
  });

  it('passes component props through', async () => {
    const dialog = useDialog();
    const promise = dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.querySelector('.dialog-lg')).not.toBeNull();

    dialog.close();
    await finishTransition();
    await promise;
  });

  it('requires describedBy for imperative alertdialogs at runtime', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const dialog = useDialog();
    const promise = dialog.open({ role: 'alertdialog', describedBy: 'alert-description' });
    await nextTick();

    expect(
      document.body.querySelector('[role="alertdialog"]')?.getAttribute('aria-describedby'),
    ).toBe('alert-description');
    expect(warning).not.toHaveBeenCalledWith(
      '[Vue warn]: [VueModalDialog] role="alertdialog" requires a describedBy prop.',
    );

    dialog.close();
    await finishTransition();
    await promise;
    warning.mockRestore();
  });

  it('does not run an async close guard twice', async () => {
    let resolveGuard!: (value: boolean) => void;
    const beforeClose = vi.fn(() => new Promise<boolean>((resolve) => (resolveGuard = resolve)));
    const dialog = useDialog();
    const promise = dialog.open({ beforeClose });
    await nextTick();

    dialog.close('first');
    dialog.close('second');
    expect(beforeClose).toHaveBeenCalledOnce();

    resolveGuard(true);
    await finishTransition();
    await expect(promise).resolves.toBe('first');
  });

  it('does not retain a rejected programmatic close value', async () => {
    const beforeClose = vi.fn<() => boolean>().mockReturnValueOnce(false).mockReturnValueOnce(true);
    const dialog = useDialog();
    const promise = dialog.open({ beforeClose });
    await nextTick();

    dialog.close('stale');
    await Promise.resolve();
    document.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    await finishTransition();

    await expect(promise).resolves.toBeUndefined();
  });

  it('does not report two dialogs as topmost across separate apps', async () => {
    // Each useDialog() dialog mounts its own Vue app; ids must not collide.
    const a = useDialog();
    const b = useDialog();
    a.open({ header: 'A' });
    await nextTick();
    b.open({ header: 'B' });
    await nextTick();

    const stackIds = useDialogStack._getStack().map((entry) => entry.id);
    expect(new Set(stackIds).size).toBe(stackIds.length);
    // With colliding ids both dialogs consider themselves topmost.
    expect(document.body.querySelectorAll('[aria-modal="true"]').length).toBe(1);

    a.close();
    b.close();
    await finishTransition();
  });

  it('does nothing during SSR', async () => {
    vi.stubGlobal('document', undefined);

    const dialog = useDialog();
    await expect(dialog.open()).resolves.toBeUndefined();
    expect(dialog.isOpen.value).toBe(false);
    dialog.close(true);
  });

  it('keeps the container until the leave transition completes', async () => {
    const dialog = useDialog();
    const promise = dialog.open({ teleport: false });
    await nextTick();

    const container = document.body.querySelector('[role="dialog"]')?.parentElement;
    expect(container).not.toBeNull();

    dialog.close();
    expect(container?.isConnected).toBe(true);
    expect(dialog.isOpen.value).toBe(false);

    await finishTransition();
    await promise;

    expect(container?.isConnected).toBe(false);
  });
});
