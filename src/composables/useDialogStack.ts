import type { Ref } from 'vue';
import type { VueModalDialogProps } from '@/types';

/** Entry stored in the dialog stack for each open dialog. */
export interface StackEntry {
  /** Unique dialog identifier. */
  id: string;
  /** Template ref to the dialog root element (for focus trap). */
  el?: Ref<HTMLElement | null>;
  /** Close callback registered by the dialog. */
  onClose?: () => void;
  /** Snapshot of dialog props at the time of opening. */
  propsSnapshot?: Partial<VueModalDialogProps>;
}

// Singleton stack manager for modal dialogs
const stack: StackEntry[] = [];
const subscribers = new Set<(stack: StackEntry[]) => void>();

// Focus restoration: save the element that was focused before the first dialog opened.
let previouslyFocusedElement: Element | null = null;

function notify(): void {
  const snapshot = stack.slice();
  subscribers.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (err) {
      console.warn('useDialogStack subscriber error', err);
    }
  });
}

function applyBodyClass(): void {
  if (typeof document === 'undefined') return;
  if (stack.length > 0) document.body.classList.add('vue-modal-open');
  else document.body.classList.remove('vue-modal-open');
}

function saveFocus(): void {
  if (typeof document === 'undefined') return;
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    previouslyFocusedElement = active;
  }
}

function restoreFocus(): void {
  if (typeof document === 'undefined' || !previouslyFocusedElement) return;
  if (previouslyFocusedElement instanceof HTMLElement) {
    try {
      previouslyFocusedElement.focus();
    } catch (err) {
      console.warn('useDialogStack focus restore error', err);
    } finally {
      previouslyFocusedElement = null;
    }
  }
}

/**
 * Singleton stack manager for modal dialogs.
 *
 * Ensures only one shared backdrop is visible and that stacked dialogs
 * receive correct z-index values. Also saves and restores focus when
 * the first dialog opens and the last one closes.
 *
 * @example
 * ```ts
 * import { useDialogStack } from '@/composables/useDialogStack';
 *
 * useDialogStack.push({ id: 'dialog-1', el: dialogRef });
 * useDialogStack.top();      // { id: 'dialog-1', ... }
 * useDialogStack.pop('dialog-1');
 * ```
 */
export const useDialogStack = {
  /** Push a dialog onto the stack. Saves focus if this is the first entry. */
  push(entry: StackEntry): number {
    if (stack.length === 0) saveFocus();
    stack.push(entry);
    applyBodyClass();
    notify();
    return stack.length - 1;
  },
  /** Remove a dialog by id. Restores focus when the stack becomes empty. */
  pop(id: string): StackEntry | null {
    const idx = stack.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const [removed] = stack.splice(idx, 1);
      applyBodyClass();
      notify();
      if (stack.length === 0) restoreFocus();
      return removed ?? null;
    }
    return null;
  },
  /** Return the topmost stack entry, or `null` if empty. */
  top(): StackEntry | null {
    return stack.length ? (stack[stack.length - 1] ?? null) : null;
  },
  /** Return the id of the topmost dialog, or `null` if empty. */
  topId(): string | null {
    const t = stack.length ? (stack[stack.length - 1] ?? null) : null;
    return t ? t.id : null;
  },
  /** Current number of stacked dialogs. */
  count(): number {
    return stack.length;
  },
  /** Zero-based position of a dialog in the stack, or `-1` if not found. */
  indexOf(id: string): number {
    return stack.findIndex((e) => e.id === id);
  },
  /** Register a callback invoked on every stack change. */
  subscribe(fn: (stack: StackEntry[]) => void): void {
    subscribers.add(fn);
  },
  /** Remove a previously registered callback. */
  unsubscribe(fn: (stack: StackEntry[]) => void): void {
    subscribers.delete(fn);
  },
  /** @internal Return a copy of the current stack (for tests). */
  _getStack(): StackEntry[] {
    return stack.slice();
  },
};
