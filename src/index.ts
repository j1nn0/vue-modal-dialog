import type { Plugin } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';

export interface VueModalDialogPluginOptions {
  name?: string;
}

export const VueModalDialogPlugin: Plugin = {
  install(app, options?: VueModalDialogPluginOptions) {
    const componentName = options?.name ?? 'VueModalDialog';
    app.component(componentName, VueModalDialog);
  },
};

export { VueModalDialog };
export type { VueModalDialogProps } from '@/types';
