<script setup>
import { ref } from 'vue';
import J1nn0VueModalDialog from '@/components/J1nn0VueModalDialog.vue';

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
  <button type="button" @click="openDialog">Dialog</button>
  <J1nn0VueModalDialog
    :backdrop="'static'"
    :escape="false"
    v-model="isOpened"
    @opened="opened"
    @closed="closed"
  >
    <template #header><strong>j1nn0-vue-modal-dialog</strong></template>

    <p>
      This is the body content of the dialog. It supports long text and will wrap automatically.
    </p>
    <ul>
      <li>Vue 3 support</li>
      <li>Focus trap inside the modal</li>
      <li>Keyboard accessibility (Escape to close)</li>
      <li>Backdrop with blur and fade animation</li>
      <li>Header, body, and footer slots</li>
      <li>Optional footer slot</li>
      <li>Close button in the header</li>
    </ul>

    <template #footer>
      <span>Footer</span>
      <button type="button" @click="closeDialog">Close</button>
    </template>
  </J1nn0VueModalDialog>
</template>

<style scoped></style>
