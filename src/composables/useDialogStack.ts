import type { Ref } from 'vue';
import type { VueModalDialogProps } from '@/types';

export interface StackEntry {
  id: string;
  el?: Ref<HTMLElement | null>;
  onClose?: () => void;
  propsSnapshot?: Partial<VueModalDialogProps>;
}

// Singleton stack manager for modal dialogs
// API: push(entry) -> index, pop(id) -> removed entry, top(), topId(), count(), indexOf(id), subscribe(fn), unsubscribe(fn)
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
      // swallow errors from subscribers
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

export const useDialogStack = {
  push(entry: StackEntry): number {
    if (stack.length === 0) saveFocus();
    stack.push(entry);
    applyBodyClass();
    notify();
    return stack.length - 1;
  },
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
  top(): StackEntry | null {
    return stack.length ? (stack[stack.length - 1] ?? null) : null;
  },
  topId(): string | null {
    const t = stack.length ? (stack[stack.length - 1] ?? null) : null;
    return t ? t.id : null;
  },
  count(): number {
    return stack.length;
  },
  indexOf(id: string): number {
    return stack.findIndex((e) => e.id === id);
  },
  subscribe(fn: (stack: StackEntry[]) => void): void {
    subscribers.add(fn);
  },
  unsubscribe(fn: (stack: StackEntry[]) => void): void {
    subscribers.delete(fn);
  },
  // for debugging / tests
  _getStack(): StackEntry[] {
    return stack.slice();
  },
};
