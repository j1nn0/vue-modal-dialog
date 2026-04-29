import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useDialog } from '@/composables/useDialog';
import { nextTick } from 'vue';

vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  })),
}));

describe('useDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('open() mounts a dialog into the DOM', async () => {
    const dialog = useDialog();
    expect(document.body.children.length).toBe(0);

    dialog.open();
    await nextTick();

    expect(document.body.children.length).toBeGreaterThan(0);
    expect(document.body.innerHTML).toContain('class="backdrop');
    expect(dialog.isOpen.value).toBe(true);

    dialog.close();
  });

  it('close() removes the dialog from the DOM', async () => {
    const dialog = useDialog();
    dialog.open();
    await nextTick();

    expect(document.body.children.length).toBeGreaterThan(0);
    expect(dialog.isOpen.value).toBe(true);

    dialog.close();
    await nextTick();

    expect(document.body.children.length).toBe(0);
    expect(dialog.isOpen.value).toBe(false);
  });

  it('open() with props passes them to the component', async () => {
    const dialog = useDialog();
    dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.innerHTML).toContain('dialog-lg');

    dialog.close();
  });

  it('Calling open() twice cleans up the first instance', async () => {
    const dialog = useDialog();
    dialog.open({ width: 'sm' });
    await nextTick();

    expect(document.body.innerHTML).toContain('dialog-sm');

    dialog.open({ width: 'lg' });
    await nextTick();

    expect(document.body.innerHTML).not.toContain('dialog-sm');
    expect(document.body.innerHTML).toContain('dialog-lg');
    expect(document.body.children.length).toBe(1);

    dialog.close();
  });

  it('SSR guard: open() does nothing when document is undefined', () => {
    const originalDocument = global.document;
    delete (global as Record<string, unknown>).document;

    const dialog = useDialog();

    dialog.open();
    expect(dialog.isOpen.value).toBe(false);

    dialog.close();

    global.document = originalDocument;
  });
});
