import VueModalDialog from '@/components/VueModalDialog.vue';

export const VueModalDialogPlugin = {
  install(app) {
    app.component('J1nn0VueModalDialog', VueModalDialog);
  },
};

export { VueModalDialog };
