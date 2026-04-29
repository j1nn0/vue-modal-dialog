import type { Plugin } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';

/** Options for the VueModalDialogPlugin. */
export interface VueModalDialogPluginOptions {
  /** Custom component name to register. @default 'VueModalDialog' */
  name?: string;
}

/**
 * Vue plugin that globally registers the `<VueModalDialog>` component.
 *
 * ```ts
 * import { createApp } from 'vue';
 * import { VueModalDialogPlugin } from '@j1nn0/vue-modal-dialog';
 * createApp(App).use(VueModalDialogPlugin, { name: 'MyDialog' });
 * ```
 *
 * After registration the component is available as `<VueModalDialog />`
 * (or the custom name) inside every template.
 */
export const VueModalDialogPlugin: Plugin = {
  install(app, options?: VueModalDialogPluginOptions) {
    const componentName = options?.name ?? 'VueModalDialog';
    app.component(componentName, VueModalDialog);
  },
};

export { VueModalDialog };
export { useDialog } from '@/composables/useDialog';
export type { VueModalDialogProps } from '@/types';
