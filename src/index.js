import J1nn0VueModalDialog from '@/components/J1nn0VueModalDialog.vue';

// 個別インポート用
export { J1nn0VueModalDialog };

// Vue.use 用の install 関数
export default {
  install(app) {
    app.component('J1nn0VueModalDialog', J1nn0VueModalDialog);
  },
};
