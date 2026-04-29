import { createApp, defineComponent, h, ref, type App } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';
import type { VueModalDialogProps } from '@/types';

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
