import { createApp, defineComponent, h, ref, type App } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';
import type { VueModalDialogProps } from '@/types';

/**
 * Imperative dialog API for opening modal dialogs programmatically.
 *
 * Creates a standalone Vue app instance for each dialog, mounting it
 * into the document body. Useful when you need to open a dialog
 * without placing a `<VueModalDialog>` component in your template.
 *
 * @returns An object with `open`, `close`, and `isOpen` reactive reference.
 *
 * @example
 * ```ts
 * const { open, close, isOpen } = useDialog();
 * open({ width: 'sm', backdrop: 'static' });
 * // later...
 * close();
 * ```
 */
export function useDialog() {
  let app: App | null = null;
  let container: HTMLElement | null = null;
  const isOpen = ref(false);

  function open(props: Partial<VueModalDialogProps> = {}) {
    if (typeof document === 'undefined') return; // SSR guard

    // Clean up any existing instance
    close();

    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(VueModalDialog, {
            ...props,
            modelValue: isOpen.value,
            'onUpdate:modelValue': (val: boolean) => {
              isOpen.value = val;
              if (!val) close();
            },
          });
      },
    });

    app = createApp(Root);
    app.mount(container);
    isOpen.value = true;
  }

  function close() {
    if (app) {
      app.unmount();
      app = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
    isOpen.value = false;
  }

  return { open, close, isOpen };
}
