import VueModalDialog from '@/components/VueModalDialog.vue';

export const VueModalDialogPlugin = {
  install(app, options) {
    const componentName = (options && options.name) || 'VueModalDialog';
    app.component(componentName, VueModalDialog);
  },
};

export { VueModalDialog };
