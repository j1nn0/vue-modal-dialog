/**
 * Shared test utilities for VueModalDialog component and composable tests.
 *
 * @module test-utils
 */
import { nextTick } from 'vue';
import { vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import VueModalDialog from '@/components/VueModalDialog.vue';
import type { VueModalDialogProps } from '@/types';
import { useDialogStack } from '@/composables/useDialogStack';

interface FocusTrapMock {
  activate: ReturnType<typeof vi.fn>;
  deactivate: ReturnType<typeof vi.fn>;
}

interface UseFocusTrapMock {
  useFocusTrap: ReturnType<typeof vi.fn>;
}

/**
 * Standard focus-trap mock factory.
 *
 * Returns `activate` and `deactivate` as vitest spies so tests can
 * assert call counts and order.
 */
export function createFocusTrapMock(): FocusTrapMock {
  return {
    activate: vi.fn(),
    deactivate: vi.fn(),
  };
}

/**
 * Factory for the standard `@vueuse/integrations/useFocusTrap` mock object.
 *
 * Use with `vi.mock` in test files:
 * ```ts
 * vi.mock('@vueuse/integrations/useFocusTrap', () => createUseFocusTrapMock());
 * ```
 */
export function createUseFocusTrapMock(): UseFocusTrapMock {
  return {
    useFocusTrap: vi.fn(() => createFocusTrapMock()),
  };
}

/**
 * Default props for mounting VueModalDialog in tests.
 *
 * Merge with overrides: `{ ...defaultMountProps, width: 'lg' }`
 */
export const defaultMountProps: VueModalDialogProps = {
  backdrop: true,
  escape: true,
  position: 'center',
  width: 'md',
  mode: null,
  teleport: false,
  scrollLock: true,
  modal: true,
  transition: 'fade',
  backdropTransition: 'fade-backdrop',
};

/**
 * Mount VueModalDialog with sensible defaults.
 *
 * The dialog starts **closed** (`modelValue: false`). Use `setProps`
 * or `wrapper.vm` to open it in your test.
 *
 * @param overrides - Props to merge over the defaults.
 * @param mountOptions - Additional Vue Test Utils mount options.
 */
export function mountDialog(
  overrides: Partial<VueModalDialogProps> = {},
  mountOptions: Record<string, unknown> = {},
): VueWrapper {
  return mount(VueModalDialog, {
    props: {
      modelValue: false,
      ...defaultMountProps,
      ...overrides,
    },
    ...mountOptions,
  } as Record<string, unknown>);
}

/**
 * Open a mounted dialog wrapper and wait for the next tick.
 *
 * @param wrapper - The VueWrapper returned by `mountDialog`.
 */
export async function openDialog(wrapper: VueWrapper): Promise<void> {
  await wrapper.setProps({ modelValue: true });
  await nextTick();
}

/**
 * Close a mounted dialog wrapper and wait for the next tick.
 *
 * @param wrapper - The VueWrapper returned by `mountDialog`.
 */
export async function closeDialog(wrapper: VueWrapper): Promise<void> {
  await wrapper.setProps({ modelValue: false });
  await nextTick();
}

/**
 * Clear the global dialog stack between tests.
 *
 * Call in `afterEach` or `beforeEach` when testing stack behavior.
 */
export function clearDialogStack(): void {
  // Drain the stack by popping all entries
  while (useDialogStack.count() > 0) {
    const top = useDialogStack.top();
    if (top) useDialogStack.pop(top.id);
  }
}
