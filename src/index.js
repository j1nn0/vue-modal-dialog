import VueModalDialog from '@/components/VueModalDialog.vue';

export const J1nn0VueModalDialogPlugin = {
  install(app) {
    app.component('J1nn0VueModalDialog', VueModalDialog);
  },
};

export { VueModalDialog };
