import {
  createApp,
  defineComponent,
  h,
  ref,
  type App,
  type Component,
  type Ref,
  type VNodeChild,
} from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';
import type { DialogRoleProps, VueModalDialogCommonProps, VueModalDialogExpose } from '@/types';

/** Content rendered into an imperative dialog slot. */
export type DialogContent = string | (() => VNodeChild);

/** Options for an imperative dialog, including its slot content. */
export type DialogOptions = Partial<VueModalDialogCommonProps> &
  DialogRoleProps & {
    /** Content rendered in the dialog header. */
    header?: DialogContent;
    /** Content rendered in the dialog body. */
    content?: DialogContent;
    /** Content rendered in the dialog footer. */
    footer?: DialogContent;
  };

type DialogInstance = {
  app: App | null;
  container: HTMLElement;
  model: Ref<boolean>;
  dialog: VueModalDialogExpose | null;
  resolve: (value: unknown) => void;
  closeValue: unknown;
  closeStarted: boolean;
  closeRequestPending: boolean;
  cleaned: boolean;
};

function toSlot(content: DialogContent): () => VNodeChild {
  return typeof content === 'function' ? content : () => content;
}

const DialogComponent = VueModalDialog as unknown as Component;

/**
 * Imperative dialog API for opening modal dialogs programmatically.
 *
 * Each dialog is mounted in its own Vue app and supports header, body, and
 * footer content through `DialogOptions`. The returned promise resolves with
 * the value passed to `close`, or `undefined` when the dialog is dismissed.
 *
 * @returns An object with `open`, `close`, and the reactive `isOpen` ref.
 */
export function useDialog(): {
  open: <T = unknown>(options?: DialogOptions) => Promise<T | undefined>;
  close: (value?: unknown) => void;
  isOpen: Ref<boolean>;
} {
  let current: DialogInstance | null = null;
  const isOpen = ref(false);

  function finishClose(instance: DialogInstance): void {
    if (instance.cleaned) return;
    instance.cleaned = true;

    instance.app?.unmount();
    instance.app = null;
    if (instance.container.parentNode) {
      instance.container.parentNode.removeChild(instance.container);
    }
    if (current === instance) {
      current = null;
      isOpen.value = false;
    }
    // Resolving an already-resolved promise is a no-op, so no guard is needed.
    instance.resolve(instance.closeValue);
  }

  function startClose(instance: DialogInstance, value: unknown): void {
    if (instance.closeStarted) return;

    instance.closeStarted = true;
    instance.closeValue = value;
    if (current === instance) isOpen.value = false;

    instance.model.value = false;
  }

  function close(value?: unknown): void {
    const instance = current;
    if (!instance || instance.closeStarted || instance.closeRequestPending) return;

    instance.closeValue = value;
    if (!instance.dialog) {
      startClose(instance, value);
      return;
    }

    instance.closeRequestPending = true;
    try {
      void Promise.resolve(instance.dialog.requestClose())
        .then((closed: boolean) => {
          instance.closeRequestPending = false;
          if (!closed && !instance.closeStarted) instance.closeValue = undefined;
        })
        .catch(() => {
          instance.closeRequestPending = false;
          if (!instance.closeStarted) instance.closeValue = undefined;
        });
    } catch {
      instance.closeRequestPending = false;
      startClose(instance, value);
    }
  }

  function open<T = unknown>(options: DialogOptions = {}): Promise<T | undefined> {
    if (typeof document === 'undefined') return Promise.resolve(undefined);

    if (current) {
      const previous = current;
      // Resolve replacement through the panel's leave transition as well.
      previous.closeValue = undefined;
      startClose(previous, undefined);
    }

    let resolvePromise!: (value: T | undefined) => void;
    const promise = new Promise<T | undefined>((resolve) => {
      resolvePromise = resolve;
    });
    const { header, content, footer, ...props } = options;
    const slots: Record<string, () => VNodeChild> = {};
    if (header !== undefined) slots.header = toSlot(header);
    if (content !== undefined) slots.default = toSlot(content);
    if (footer !== undefined) slots.footer = toSlot(footer);

    const instance: DialogInstance = {
      app: null,
      container: document.createElement('div'),
      model: ref(true),
      dialog: null,
      resolve: (value) => resolvePromise(value as T | undefined),
      closeValue: undefined,
      closeStarted: false,
      closeRequestPending: false,
      cleaned: false,
    };

    const Root = defineComponent({
      setup() {
        return () =>
          h(
            DialogComponent,
            {
              ...props,
              ref: (value: unknown) => {
                instance.dialog = value as VueModalDialogExpose | null;
              },
              onAfterLeave: () => finishClose(instance),
              modelValue: instance.model.value,
              'onUpdate:modelValue': (value: boolean) => {
                if (value) {
                  instance.model.value = true;
                  if (current === instance) isOpen.value = true;
                } else {
                  startClose(instance, instance.closeValue);
                }
              },
            },
            slots,
          );
      },
    });

    document.body.append(instance.container);
    instance.app = createApp(Root);
    current = instance;
    instance.app.mount(instance.container);
    instance.model.value = true;
    isOpen.value = true;

    return promise;
  }

  return { open, close, isOpen };
}
