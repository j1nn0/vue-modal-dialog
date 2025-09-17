import VueModalDialog from '@/components/VueModalDialog.vue';

export const VueModalDialogPlugin = {
  install(app, options) {
    const componentName = (options && options.name) || 'J1nn0VueModalDialog';
    app.component(componentName, VueModalDialog);
  },
};

export { VueModalDialog };
