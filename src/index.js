import J1nn0ModalDialog from '@/components/ModalDialog.vue';

// 個別インポート用
export { J1nn0ModalDialog };

// Vue.use 用の install 関数
export default {
  install(app) {
    app.component('J1nn0ModalDialog', J1nn0ModalDialog);
  },
};
