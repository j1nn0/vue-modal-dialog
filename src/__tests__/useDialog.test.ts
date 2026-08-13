import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { useDialog } from '@/composables/useDialog';

const useFocusTrapMock = vi.hoisted(() => ({
  useFocusTrap: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn() })),
}));
vi.mock('@vueuse/integrations/useFocusTrap', () => useFocusTrapMock);

function finishTransition(): void {
  document
    .querySelector('[role="dialog"]')
    ?.parentElement?.dispatchEvent(new Event('transitionend'));
}

describe('useDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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
    finishTransition();
    await promise;
  });

  it('renders string and render-function content', async () => {
    const dialog = useDialog();

    const stringContent = dialog.open({ header: 'Dialog title', content: 'Plain content' });
    await nextTick();

    expect(document.querySelector('.dialog-title')?.textContent).toContain('Dialog title');
    expect(document.querySelector('.dialog-body')?.textContent).toContain('Plain content');

    dialog.close();
    finishTransition();
    await stringContent;

    const renderContent = dialog.open({
      content: () => h('p', { class: 'rendered-content' }, 'Rendered content'),
    });
    await nextTick();

    expect(document.querySelector('.dialog-body')?.textContent).toContain('Rendered content');

    dialog.close();
    finishTransition();
    await renderContent;
  });

  it('renders a footer only when the footer option is supplied', async () => {
    const dialog = useDialog();
    const withFooter = dialog.open({ footer: () => h('button', 'OK') });
    await nextTick();

    expect(document.querySelector('.dialog-footer')).not.toBeNull();
    dialog.close();
    finishTransition();
    await withFooter;

    const withoutFooter = dialog.open();
    await nextTick();

    expect(document.querySelector('.dialog-footer')).toBeNull();
    dialog.close();
    finishTransition();
    await withoutFooter;
  });

  it('resolves open() with the value passed to close()', async () => {
    const dialog = useDialog();
    const promise = dialog.open<number>();
    await nextTick();

    dialog.close(42);
    finishTransition();

    await expect(promise).resolves.toBe(42);
  });

  it('resolves dismissal through the close button with undefined', async () => {
    const dialog = useDialog();
    const promise = dialog.open();
    await nextTick();

    document.querySelector<HTMLButtonElement>('.dialog-close')?.click();
    await nextTick();
    finishTransition();

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves the first promise when open() replaces the instance', async () => {
    const dialog = useDialog();
    const first = dialog.open({ width: 'sm' });
    await nextTick();

    const second = dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.querySelector('.dialog-sm')).toBeNull();
    expect(document.body.querySelector('.dialog-lg')).not.toBeNull();
    await expect(first).resolves.toBeUndefined();

    dialog.close();
    finishTransition();
    await second;
  });

  it('passes component props through', async () => {
    const dialog = useDialog();
    const promise = dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.innerHTML).toContain('dialog-lg');

    dialog.close();
    finishTransition();
    await promise;
  });

  it('does nothing during SSR', async () => {
    vi.stubGlobal('document', undefined);

    const dialog = useDialog();
    await expect(dialog.open()).resolves.toBeUndefined();
    expect(dialog.isOpen.value).toBe(false);
    dialog.close(true);
  });

  it('removes the container after close cleanup', async () => {
    vi.useFakeTimers();
    const dialog = useDialog();
    const promise = dialog.open();
    await nextTick();

    const container = document.body.querySelector('[role="dialog"]')?.parentElement;
    expect(container).not.toBeNull();

    dialog.close();
    expect(container?.isConnected).toBe(true);

    vi.advanceTimersByTime(500);
    await promise;

    expect(container?.isConnected).toBe(false);
    expect(dialog.isOpen.value).toBe(false);
  });
});
