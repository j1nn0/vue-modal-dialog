<script setup>
import { ref } from 'vue';
import VueModalDialog from '@/components/VueModalDialog.vue';

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
  <button type="button" @click="openDialog">Dialog</button>

  <VueModalDialog
    :backdrop="true"
    :escape="true"
    position="center"
    width="lg"
    v-model="isOpened"
    @opened="opened"
    @closed="closed"
  >
    <template #header><strong>&copy;j1nn0/vue-modal-dialog</strong></template>

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
  </VueModalDialog>
</template>

<style scoped></style>
