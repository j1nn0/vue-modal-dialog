<script setup>
import { ref } from 'vue';
import ModalDialog from '@/components/ModalDialog.vue';

const isOpened = ref(false);

const openDialog = () => {
  isOpened.value = true;
};
const closeDialog = () => {
  isOpened.value = false;
};

const opened = () => {
  console.log('opened');
};

const closed = () => {
  console.log('closed');
};
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <button type="button" @click="openDialog">開く</button>
  <ModalDialog v-model="isOpened" @opened="opened" @closed="closed">
    <template #header>ダイアログタイトル</template>

    ボディ

    <template #footer>
      <span>フッター</span>
      <button type="button" @click="closeDialog">閉じる</button>
    </template>
  </ModalDialog>
</template>

<style scoped></style>
