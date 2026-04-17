import type { Plugin } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';

export const VueModalDialogPlugin: Plugin = {
  install(app, options?: { name?: string }) {
    const componentName = options?.name ?? 'VueModalDialog';
    app.component(componentName, VueModalDialog);
  },
};

export { VueModalDialog };
